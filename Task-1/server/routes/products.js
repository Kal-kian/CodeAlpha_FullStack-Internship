const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { protect, authorize } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const { storage } = require('../config/cloudinary');

// Use Cloudinary storage
const upload = multer({
  storage: storage,
  limits: { fileSize: 5000000 },
  fileFilter: function(req, file, cb) {
    const filetypes = /jpeg|jpg|png|gif|webp/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Images only! (jpeg, jpg, png, gif, webp)'));
    }
  }
}).array('images', 5);

// Create product
router.post('/', protect, authorize('seller'), (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }

    try {
      const images = req.files ? req.files.map(file => file.path) : [];
      
      if (images.length === 0) {
        return res.status(400).json({ success: false, message: 'Please upload at least one image' });
      }

      let specifications = {};
      if (req.body.specifications) {
        try {
          specifications = typeof req.body.specifications === 'string' 
            ? JSON.parse(req.body.specifications) 
            : req.body.specifications;
        } catch (e) {}
      }

      const product = await Product.create({
        name: req.body.name,
        condition: req.body.condition,
        category: req.body.category,
        city: req.body.city,
        price: Number(req.body.price),
        quantity: Number(req.body.quantity),
        description: req.body.description,
        specifications: specifications,
        images: images,
        seller: req.user.id
      });

      console.log('Product created with images:', images);
      res.status(201).json({ success: true, data: product });
    } catch (error) {
      console.error('Product creation error:', error);
      res.status(400).json({ success: false, message: error.message });
    }
  });
});

// Get all products
router.get('/', async (req, res) => {
  try {
    const { search, category, city, condition, minPrice, maxPrice, page = 1, limit = 12 } = req.query;
    const query = { isActive: true, isDeleted: false };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    if (category) query.category = category;
    if (city) query.city = city;
    if (condition) query.condition = condition;
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    const skip = (Number(page) - 1) * Number(limit);
    const products = await Product.find(query)
      .populate('seller', 'name city phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));
    const total = await Product.countDocuments(query);

    res.status(200).json({
      success: true, count: products.length, total,
      totalPages: Math.ceil(total / Number(limit)),
      currentPage: Number(page), data: products
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Get seller products
router.get('/seller', protect, authorize('seller'), async (req, res) => {
  try {
    const products = await Product.find({ seller: req.user.id, isDeleted: false });
    res.status(200).json({ success: true, count: products.length, data: products });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Get single product
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('seller', 'name city phone email');
    if (!product || product.isDeleted) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.status(200).json({ success: true, data: product });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Update product
router.put('/:id', protect, authorize('seller'), async (req, res) => {
  try {
    let product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    if (product.seller.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }
    product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.status(200).json({ success: true, data: product });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Delete product
router.delete('/:id', protect, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    if (product.seller.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }
    product.isDeleted = true;
    product.isActive = false;
    await product.save();
    res.status(200).json({ success: true, message: 'Product deleted' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

module.exports = router;
