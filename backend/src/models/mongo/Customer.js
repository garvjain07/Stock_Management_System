const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    default: '',
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  address: {
    type: String,
    default: '',
    trim: true
  },
  customerType: {
    type: String,
    enum: ['Regular', 'Premium', 'VIP'],
    default: 'Regular'
  },
  totalPurchases: {
    type: Number,
    default: 0
  },
  lastPurchase: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Customer', customerSchema);
