const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { protect } = require('../middleware/auth');

// @desc    Get cart
// @route   GET /api/cart
router.get('/', protect, async (req, res) => {
  try {
    let cart = await Cart.findOne({ buyer: req.user.id })
      .populate({
        path: 'items.product',
        select: 'name price images quantity condition city'
      });

    if (!cart) {
      return res.status(200).json({
        success: true,
        data: { items: [], totalPrice: 0 }
      });
    }

    res.status(200).json({
      success: true,
      data: cart
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// @desc    Add item to cart
// @route   POST /api/cart/add
router.post('/add', protect, async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;

    // Validate product exists
    const product = await Product.findById(productId);
    if (!product || product.isDeleted || !product.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check if quantity is available
    if (quantity > product.quantity) {
      return res.status(400).json({
        success: false,
        message: `Only ${product.quantity} items available`
      });
    }

    let cart = await Cart.findOne({ buyer: req.user.id });

    if (!cart) {
      // Create new cart
      cart = await Cart.create({
        buyer: req.user.id,
        items: [{
          product: productId,
          quantity,
          price: product.price
        }]
      });
    } else {
      // Check if product already in cart
      const existingItemIndex = cart.items.findIndex(
        item => item.product.toString() === productId
      );

      if (existingItemIndex > -1) {
        // Update quantity
        cart.items[existingItemIndex].quantity += quantity;
        if (cart.items[existingItemIndex].quantity > product.quantity) {
          return res.status(400).json({
            success: false,
            message: `Only ${product.quantity} items available`
          });
        }
      } else {
        // Add new item
        cart.items.push({
          product: productId,
          quantity,
          price: product.price
        });
      }

      await cart.save();
    }

    // Populate cart
    cart = await Cart.findById(cart._id).populate({
      path: 'items.product',
      select: 'name price images quantity condition city'
    });

    res.status(200).json({
      success: true,
      data: cart
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// @desc    Update cart item quantity
// @route   PUT /api/cart/update/:productId
router.put('/update/:productId', protect, async (req, res) => {
  try {
    const { quantity } = req.body;
    const productId = req.params.productId;

    const cart = await Cart.findOne({ buyer: req.user.id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    const itemIndex = cart.items.findIndex(
      item => item.product.toString() === productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in cart'
      });
    }

    if (quantity < 1) {
      // Remove item if quantity < 1
      cart.items.splice(itemIndex, 1);
    } else {
      // Update quantity
      cart.items[itemIndex].quantity = quantity;
    }

    await cart.save();

    // Populate and return updated cart
    const updatedCart = await Cart.findById(cart._id).populate({
      path: 'items.product',
      select: 'name price images quantity condition city'
    });

    res.status(200).json({
      success: true,
      data: updatedCart
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// @desc    Remove item from cart
// @route   DELETE /api/cart/remove/:productId
router.delete('/remove/:productId', protect, async (req, res) => {
  try {
    const cart = await Cart.findOne({ buyer: req.user.id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    cart.items = cart.items.filter(
      item => item.product.toString() !== req.params.productId
    );

    await cart.save();

    const updatedCart = await Cart.findById(cart._id).populate({
      path: 'items.product',
      select: 'name price images quantity condition city'
    });

    res.status(200).json({
      success: true,
      data: updatedCart
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// @desc    Clear cart
// @route   DELETE /api/cart/clear
router.delete('/clear', protect, async (req, res) => {
  try {
    const cart = await Cart.findOne({ buyer: req.user.id });
    if (cart) {
      cart.items = [];
      await cart.save();
    }

    res.status(200).json({
      success: true,
      message: 'Cart cleared successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;