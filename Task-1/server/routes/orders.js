const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { protect, authorize } = require('../middleware/auth');


router.post('/', protect, async (req, res) => {
  try {
    const { deliveryAddress, city, phone } = req.body;

    // Get user's cart
    const cart = await Cart.findOne({ buyer: req.user.id })
      .populate('items.product');

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cart is empty'
      });
    }

    // Create order items from cart
    const orderItems = cart.items.map(item => ({
      product: item.product._id,
      quantity: item.quantity,
      price: item.price
    }));

    // Get the seller from the first product
    const sellerId = cart.items[0].product.seller;

    // Create order
    const order = await Order.create({
      buyer: req.user.id,
      items: orderItems,
      totalPrice: cart.totalPrice,
      paymentMethod: 'Cash on Delivery',
      deliveryAddress,
      city,
      phone,
      seller: sellerId
    });

    // Update product quantities
    for (const item of cart.items) {
      await Product.findByIdAndUpdate(item.product._id, {
        $inc: { quantity: -item.quantity }
      });
    }

    // Clear cart
    cart.items = [];
    await cart.save();

    res.status(201).json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to create order'
    });
  }
});
// @desc    Get buyer's orders
// @route   GET /api/orders/myorders
router.get('/myorders', protect, async (req, res) => {
  try {
    const orders = await Order.find({ buyer: req.user.id })
      .populate('items.product', 'name price images')
      .populate('seller', 'name phone')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// @desc    Get seller's received orders
// @route   GET /api/orders/seller
router.get('/seller', protect, authorize('seller'), async (req, res) => {
  try {
    const orders = await Order.find({ seller: req.user.id })
      .populate('buyer', 'name phone city')
      .populate('items.product', 'name price images')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// @desc    Get single order
// @route   GET /api/orders/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('buyer', 'name phone city address')
      .populate('seller', 'name phone')
      .populate('items.product', 'name price images description');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if user is buyer, seller of order, or admin
    if (
      order.buyer._id.toString() !== req.user.id &&
      order.seller._id.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to view this order'
      });
    }

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// @desc    Update order status (seller or admin)
// @route   PUT /api/orders/:id/status
router.put('/:id/status', protect, async (req, res) => {
  try {
    const { status } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check authorization
    if (
      order.seller.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to update this order'
      });
    }

    // Validate status transition
    const validTransitions = {
      'Pending': ['Confirmed', 'Cancelled'],
      'Confirmed': ['Processing', 'Cancelled'],
      'Processing': ['Out for Delivery', 'Cancelled'],
      'Out for Delivery': ['Delivered'],
      'Delivered': [],
      'Cancelled': []
    };

    if (!validTransitions[order.status].includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot change status from ${order.status} to ${status}`
      });
    }

    order.status = status;
    await order.save();

    await order.populate([
      { path: 'buyer', select: 'name phone city' },
      { path: 'items.product', select: 'name price images' }
    ]);

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;