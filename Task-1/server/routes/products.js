const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { protect, authorize } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

// Configure multer for local file upload
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'uploads/products');
  },
  filename: function(req, file, cb) {
    cb(null, `product-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5000000 }, // 5MB limit
  fileFilter: function(req, file, cb) {
    const filetypes = /jpeg|jpg|png|gif|webp/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb('Error: Images Only! (jpeg, jpg, png, gif, webp)');
    }
  }
}).array('images', 5);

// @desc    Create product
// @route   POST /api/products
router.post('/', protect, authorize('seller'), (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err
      });
    }

    try {
      // Parse specifications if it's a string
      let specifications = {};
      if (req.body.specifications) {
        try {
          specifications = typeof req.body.specifications === 'string' 
            ? JSON.parse(req.body.specifications) 
            : req.body.specifications;
        } catch (e) {
          specifications = {};
        }
      }

      const images = req.files ? req.files.map(file => `/uploads/products/${file.filename}`) : [];
      
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

      res.status(201).json({
        success: true,
        data: product
      });
    } catch (error) {
      console.error('Product creation error:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  });
});

// @desc    Get all products with filtering, searching, and pagination
// @route   GET /api/products
// @desc    Get all products with filtering, searching, and pagination
// @route   GET /api/products
router.get('/', async (req, res) => {
  try {
    const { 
      search, 
      category, 
      city, 
      condition, 
      minPrice, 
      maxPrice,
      sort,
      includeLegacy,
      page = 1,
      limit = 12
    } = req.query;

    const query = { isActive: true, isDeleted: false };

    // Search functionality
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Category filter with legacy support
    if (category) {
      if (category === 'Shoes' && includeLegacy === 'true') {
        query.category = { $in: ['Shoes', 'Men Shoes', 'Women Shoes'] };
      } else if (category === 'Accessories' && includeLegacy === 'true') {
        query.category = { $in: ['Accessories', 'Men Accessories', 'Women Accessories'] };
      } else {
        query.category = category;
      }
    }

    // Other filters
    if (city) query.city = city;
    if (condition) query.condition = condition;
    
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Sorting
    let sortOption = { createdAt: -1 };
    if (sort === 'price_asc') sortOption = { price: 1 };
    if (sort === 'price_desc') sortOption = { price: -1 };
    if (sort === 'name_asc') sortOption = { name: 1 };

    const skip = (Number(page) - 1) * Number(limit);

    const products = await Product.find(query)
      .populate('seller', 'name city phone')
      .sort(sortOption)
      .skip(skip)
      .limit(Number(limit));

    const total = await Product.countDocuments(query);

    res.status(200).json({
      success: true,
      count: products.length,
      total,
      totalPages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      data: products
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// @desc    Get seller's products
// @route   GET /api/products/seller
router.get('/seller', protect, authorize('seller'), async (req, res) => {
  try {
    const products = await Product.find({ 
      seller: req.user.id,
      isDeleted: false 
    }).populate('seller', 'name city phone');

    res.status(200).json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// @desc    Get single product
// @route   GET /api/products/:id
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('seller', 'name city phone email');

    if (!product || product.isDeleted) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// @desc    Update product
// @route   PUT /api/products/:id
router.put('/:id', protect, authorize('seller'), async (req, res) => {
  try {
    let product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Make sure user owns product
    if (product.seller.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to update this product'
      });
    }

    // Parse specifications if it's a string
    if (req.body.specifications && typeof req.body.specifications === 'string') {
      try {
        req.body.specifications = JSON.parse(req.body.specifications);
      } catch (e) {
        req.body.specifications = {};
      }
    }

    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// @desc    Delete product (soft delete)
// @route   DELETE /api/products/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check if user is seller of product or admin
    if (product.seller.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to delete this product'
      });
    }

    // Soft delete
    product.isDeleted = true;
    product.isActive = false;
    await product.save();

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;