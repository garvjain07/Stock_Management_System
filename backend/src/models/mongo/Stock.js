const mongoose = require('mongoose');

const stockSchema = new mongoose.Schema({
  productCode: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  productName: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  quantity: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  unit: {
    type: String,
    default: 'pcs'
  },
  unitPrice: {
    type: Number,
    required: true,
    min: 0
  },
  minStock: {
    type: Number,
    required: true,
    default: 1,
    min: 1
  },
  supplierId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier',
    default: null
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Stock', stockSchema);
