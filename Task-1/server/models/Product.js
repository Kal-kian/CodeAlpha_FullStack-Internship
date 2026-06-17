const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a product name'],
    trim: true,
    maxlength: [200, 'Product name cannot be more than 200 characters']
  },
  condition: {
    type: String,
    enum: ['New', 'Used'],
    required: [true, 'Please specify product condition']
  },
  category: {
    type: String,
    enum: [
      'Electronics',
      'Men Clothing',
      'Women Clothing',
      'Shoes',
      'Bags',
      'Accessories',
      'Others'
    ],
    required: [true, 'Please select a category']
  },
  city: {
    type: String,
    enum: [
      'Addis Ababa',
      'Jimma',
      'Hawassa',
      'Adama',
      'Bahir Dar',
      'Dire Dawa',
      'Others'
    ],
    required: [true, 'Please select a city']
  },
  price: {
    type: Number,
    required: [true, 'Please add a price'],
    min: [0, 'Price cannot be negative']
  },
  quantity: {
    type: Number,
    required: [true, 'Please add quantity'],
    min: [1, 'Quantity must be at least 1'],
    default: 1
  },
  specifications: {
    type: Map,
    of: String,
    default: {}
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  images: [{
    type: String,
    required: true
  }],
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for search
productSchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('Product', productSchema);