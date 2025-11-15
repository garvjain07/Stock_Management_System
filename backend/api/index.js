const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const connectDB = require('../src/config/mongo');
const { User, Stock, Supplier, Customer, Bill, Category, Unit } = require('../src/models/mongo');

const app = express();
const PORT = process.env.PORT || 5000;

// CORS Configuration - Allow all origins for Vercel
app.use(cors({
  origin: true, // This allows all origins
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  exposedHeaders: ['Content-Range', 'X-Content-Range']
}));

// Parse JSON bodies
app.use(express.json());

// Explicitly handle OPTIONS requests
app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.status(200).send();
});

// Connect to MongoDB
connectDB();

// Root route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Stock Management System API - Server is running',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      api: '/api',
      login: '/api/auth/login'
    }
  });
});

// ============================================================================
// AUTHENTICATION ROUTES
// ============================================================================

// Handle GET request to login endpoint (for testing)
app.get('/api/auth/login', (req, res) => {
  res.json({
    success: false,
    message: 'Please use POST method to login',
    method: 'POST',
    endpoint: '/api/auth/login',
    body: {
      username: 'string',
      password: 'string'
    }
  });
});

app.post('/api/auth/login', async (req, res) => {
  try {
    console.log('🔐 Login request received');
    const { username, password } = req.body;
    
    const user = await User.findOne({ username, isActive: true });
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }
    
    const isValidPassword = await user.comparePassword(password);
    
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    // Update last login
    user.lastLogin = new Date();
    await user.save();
    
    console.log('✅ Login successful:', username);
    res.json({
      success: true,
      message: 'Login successful',
      token: 'mock-jwt-token-' + Date.now(),
      user: {
        id: user._id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role === 'admin' ? 'Admin' : 'Cashier'
      }
    });
    
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Error during login'
    });
  }
});

// ============================================================================
// DASHBOARD ROUTES
// ============================================================================

app.get('/api/dashboard/stats', async (req, res) => {
  try {
    console.log('📊 Dashboard stats requested');
    
    const days = parseInt(req.query.days) || 7;
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - days);
    
    const totalProducts = await Stock.countDocuments();
    const lowStockItems = await Stock.countDocuments({ $expr: { $lte: ['$quantity', '$minStock'] } });
    
    const filteredBills = await Bill.find({
      billDate: { $gte: daysAgo }
    });
    
    const totalSales = filteredBills.reduce((sum, bill) => sum + bill.totalAmount, 0);
    const totalBills = filteredBills.length;
    
    const salesData = await generateSalesData(days);
    const stockData = await generateStockData();
    const recentActivities = await generateRecentActivities(days);
    
    const dashboardData = {
      success: true,
      stats: {
        totalProducts,
        totalSales,
        totalBills,
        lowStockItems,
        productsChange: 5.2,
        salesChange: 12.8,
        billsChange: 8.4,
        lowStockChange: -2.1
      },
      recentActivities,
      chartData: {
        salesData,
        stockData
      }
    };
    
    console.log('📊 Dashboard data prepared');
    res.json(dashboardData);
    
  } catch (error) {
    console.error('❌ Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard stats'
    });
  }
});

app.get('/api/dashboard/recent-activities', async (req, res) => {
  try {
    console.log('📋 Dashboard recent activities requested');
    
    const limit = parseInt(req.query.limit) || 10;
    const days = parseInt(req.query.days) || 7;
    
    const activities = await generateRecentActivities(days);
    
    res.json({
      success: true,
      data: activities.slice(0, limit)
    });
  } catch (error) {
    console.error('❌ Dashboard recent activities error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching recent activities'
    });
  }
});

app.get('/api/dashboard', async (req, res) => {
  try {
    console.log('📊 Dashboard requested');
    
    const days = parseInt(req.query.days) || 7;
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - days);
    
    const totalProducts = await Stock.countDocuments();
    const lowStockItems = await Stock.countDocuments({ $expr: { $lte: ['$quantity', '$minStock'] } });
    
    const filteredBills = await Bill.find({
      billDate: { $gte: daysAgo }
    });
    
    const totalSales = filteredBills.reduce((sum, bill) => sum + bill.totalAmount, 0);
    const totalBills = filteredBills.length;
    
    const salesData = await generateSalesData(days);
    const stockData = await generateStockData();
    const recentActivities = await generateRecentActivities(days);
    
    const dashboardData = {
      success: true,
      stats: {
        totalProducts,
        totalSales,
        totalBills,
        lowStockItems,
        productsChange: 5.2,
        salesChange: 12.8,
        billsChange: 8.4,
        lowStockChange: -2.1
      },
      recentActivities,
      chartData: {
        salesData,
        stockData
      }
    };
    
    console.log('📊 Dashboard data prepared');
    res.json(dashboardData);
    
  } catch (error) {
    console.error('❌ Dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard'
    });
  }
});

// ============================================================================
// STOCK ROUTES
// ============================================================================

app.get('/api/stock', async (req, res) => {
  try {
    console.log('📦 Stock list requested');
    const stocks = await Stock.find().populate('supplierId', 'name').sort({ createdAt: -1 });
    
    const formattedStocks = stocks.map(stock => ({
      id: stock._id,
      productCode: stock.productCode,
      productName: stock.productName,
      category: stock.category,
      description: stock.description,
      quantity: stock.quantity,
      unit: stock.unit,
      unitPrice: stock.unitPrice,
      minStock: stock.minStock,
      supplierId: stock.supplierId?._id,
      supplier: stock.supplierId ? { id: stock.supplierId._id, name: stock.supplierId.name } : null,
      createdAt: stock.createdAt,
      updatedAt: stock.updatedAt
    }));
    
    res.json({
      success: true,
      data: formattedStocks
    });
    
  } catch (error) {
    console.error('❌ Stock list error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching stock items'
    });
  }
});

app.post('/api/stock', async (req, res) => {
  try {
    console.log('📦 Add stock item request:', req.body);
    const { productCode, productName, category, description, quantity, unit, unitPrice, minStock, supplierId } = req.body;
    
    // Validate required fields
    if (!productCode || !productName || !category) {
      return res.status(400).json({
        success: false,
        message: 'Product code, name, and category are required'
      });
    }
    
    const existing = await Stock.findOne({ productCode: productCode.toUpperCase() });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Product code already exists'
      });
    }
    
    // Handle supplierId - convert empty string to null
    let validSupplierId = null;
    if (supplierId && supplierId !== '' && supplierId !== 'null') {
      validSupplierId = supplierId;
    }
    
    const newStock = new Stock({
      productCode: productCode.toUpperCase(),
      productName,
      category,
      description: description || '',
      quantity: parseInt(quantity) || 0,
      unit: unit || 'pcs',
      unitPrice: parseFloat(unitPrice) || 0,
      minStock: Math.max(1, parseInt(minStock) || 1),
      supplierId: validSupplierId
    });
    
    await newStock.save();
    
    // Only populate if supplierId exists
    if (validSupplierId) {
      await newStock.populate('supplierId', 'name');
    }
    
    const formattedStock = {
      id: newStock._id,
      productCode: newStock.productCode,
      productName: newStock.productName,
      category: newStock.category,
      description: newStock.description,
      quantity: newStock.quantity,
      unit: newStock.unit,
      unitPrice: newStock.unitPrice,
      minStock: newStock.minStock,
      supplierId: newStock.supplierId?._id,
      supplier: newStock.supplierId ? { id: newStock.supplierId._id, name: newStock.supplierId.name } : null,
      createdAt: newStock.createdAt,
      updatedAt: newStock.updatedAt
    };
    
    console.log('✅ Stock item added');
    res.status(201).json({
      success: true,
      message: 'Stock item added successfully',
      data: formattedStock
    });
    
  } catch (error) {
    console.error('❌ Add stock error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding stock item'
    });
  }
});

app.put('/api/stock/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`📝 Updating stock item ID: ${id}`);
    
    const { productCode, productName, category, description, quantity, unit, unitPrice, minStock, supplierId } = req.body;
    
    const stock = await Stock.findById(id);
    if (!stock) {
      return res.status(404).json({
        success: false,
        message: 'Stock item not found'
      });
    }
    
    stock.productCode = productCode?.toUpperCase() || stock.productCode;
    stock.productName = productName || stock.productName;
    stock.category = category || stock.category;
    stock.description = description !== undefined ? description : stock.description;
    stock.quantity = quantity !== undefined ? parseInt(quantity) : stock.quantity;
    stock.unit = unit || stock.unit;
    stock.unitPrice = unitPrice !== undefined ? parseFloat(unitPrice) : stock.unitPrice;
    stock.minStock = minStock !== undefined ? Math.max(1, parseInt(minStock)) : stock.minStock;
    stock.supplierId = supplierId !== undefined ? (supplierId || null) : stock.supplierId;
    
    await stock.save();
    await stock.populate('supplierId', 'name');
    
    const formattedStock = {
      id: stock._id,
      productCode: stock.productCode,
      productName: stock.productName,
      category: stock.category,
      description: stock.description,
      quantity: stock.quantity,
      unit: stock.unit,
      unitPrice: stock.unitPrice,
      minStock: stock.minStock,
      supplierId: stock.supplierId?._id,
      supplier: stock.supplierId ? { id: stock.supplierId._id, name: stock.supplierId.name } : null,
      createdAt: stock.createdAt,
      updatedAt: stock.updatedAt
    };
    
    console.log('✅ Stock item updated');
    res.json({
      success: true,
      message: 'Stock item updated successfully',
      data: formattedStock
    });
    
  } catch (error) {
    console.error('❌ Update stock error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating stock item'
    });
  }
});

app.delete('/api/stock/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🗑️  Deleting stock item ID: ${id}`);
    
    const stock = await Stock.findByIdAndDelete(id);
    if (!stock) {
      return res.status(404).json({
        success: false,
        message: 'Stock item not found'
      });
    }
    
    console.log('✅ Stock item deleted');
    res.json({
      success: true,
      message: 'Stock item deleted successfully'
    });
    
  } catch (error) {
    console.error('❌ Delete stock error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting stock item'
    });
  }
});

// ============================================================================
// CATEGORY ROUTES
// ============================================================================

// Get all categories
app.get('/api/categories', async (req, res) => {
  try {
    console.log('📂 Categories list requested');
    const categories = await Category.find().sort({ type: 1, name: 1 });
    
    const formattedCategories = categories.map(c => ({
      id: c._id,
      name: c.name,
      type: c.type,
      createdBy: c.createdBy,
      createdAt: c.createdAt
    }));
    
    res.json({
      success: true,
      data: formattedCategories
    });
  } catch (error) {
    console.error('❌ Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching categories'
    });
  }
});

// Create new category
app.post('/api/categories', async (req, res) => {
  try {
    const { name, createdBy } = req.body;
    console.log('📂 Creating new category:', name);
    
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Category name is required'
      });
    }
    
    // Check if category already exists (case-insensitive)
    const existingCategory = await Category.findOne({ 
      name: { $regex: new RegExp(`^${name}$`, 'i') }
    });
    
    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: 'Category already exists'
      });
    }
    
    const newCategory = new Category({
      name: name.trim(),
      type: 'custom',
      createdBy: createdBy || null
    });
    
    await newCategory.save();
    
    console.log('✅ Category created');
    res.json({
      success: true,
      message: 'Category created successfully',
      data: {
        id: newCategory._id,
        name: newCategory.name,
        type: newCategory.type,
        createdAt: newCategory.createdAt
      }
    });
  } catch (error) {
    console.error('❌ Create category error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating category'
    });
  }
});

// Update category
app.put('/api/categories/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    console.log(`📝 Updating category ID: ${id} to name: ${name}`);
    
    const category = await Category.findById(id);
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }
    
    // Check if new name already exists (case-insensitive)
    const existingCategory = await Category.findOne({ 
      name: { $regex: new RegExp(`^${name}$`, 'i') },
      _id: { $ne: id }
    });
    
    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: 'Category name already exists'
      });
    }
    
    const oldName = category.name;
    category.name = name.trim();
    await category.save();
    
    // Update all stock items that use this category
    await Stock.updateMany(
      { category: oldName },
      { $set: { category: name.trim() } }
    );
    
    console.log('✅ Category updated and stock items reassigned');
    res.json({
      success: true,
      message: 'Category updated successfully',
      data: {
        id: category._id,
        name: category.name,
        type: category.type
      }
    });
  } catch (error) {
    console.error('❌ Update category error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating category'
    });
  }
});

// Delete category
app.delete('/api/categories/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('🗑️  Deleting category ID:', id);
    
    const category = await Category.findById(id);
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }
    
    // Prevent deletion of "Other" category
    if (category.name.toLowerCase() === 'other') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete the "Other" category as it is used as a fallback'
      });
    }
    
    // Count stock items using this category
    const stockCount = await Stock.countDocuments({ category: category.name });
    
    // Reassign all products to "Other" category before deletion
    if (stockCount > 0) {
      await Stock.updateMany(
        { category: category.name },
        { $set: { category: 'Other' } }
      );
      console.log(`📦 Reassigned ${stockCount} product(s) to "Other" category`);
    }
    
    await Category.findByIdAndDelete(id);
    
    console.log('✅ Category deleted');
    res.json({
      success: true,
      message: `Category deleted successfully. ${stockCount} product(s) moved to "Other"`,
      reassignedCount: stockCount
    });
  } catch (error) {
    console.error('❌ Delete category error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting category'
    });
  }
});

// ============================================================================
// UNIT ROUTES
// ============================================================================

// Get all units
app.get('/api/units', async (req, res) => {
  try {
    console.log('📏 Units list requested');
    const units = await Unit.find().sort({ type: 1, name: 1 });
    
    const formattedUnits = units.map(u => ({
      id: u._id,
      name: u.name,
      type: u.type,
      createdBy: u.createdBy,
      createdAt: u.createdAt
    }));
    
    res.json({
      success: true,
      data: formattedUnits
    });
  } catch (error) {
    console.error('❌ Get units error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching units'
    });
  }
});

// Create new unit
app.post('/api/units', async (req, res) => {
  try {
    const { name, createdBy } = req.body;
    console.log('📏 Creating new unit:', name);
    
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Unit name is required'
      });
    }
    
    // Check if unit already exists (case-insensitive)
    const existingUnit = await Unit.findOne({ 
      name: { $regex: new RegExp(`^${name}$`, 'i') }
    });
    
    if (existingUnit) {
      return res.status(400).json({
        success: false,
        message: 'Unit already exists'
      });
    }
    
    const newUnit = new Unit({
      name: name.trim(),
      type: 'custom',
      createdBy: createdBy || null
    });
    
    await newUnit.save();
    
    console.log('✅ Unit created');
    res.json({
      success: true,
      message: 'Unit created successfully',
      data: {
        id: newUnit._id,
        name: newUnit.name,
        type: newUnit.type,
        createdAt: newUnit.createdAt
      }
    });
  } catch (error) {
    console.error('❌ Create unit error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating unit'
    });
  }
});

// Update unit
app.put('/api/units/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    console.log(`📝 Updating unit ID: ${id} to name: ${name}`);
    
    const unit = await Unit.findById(id);
    
    if (!unit) {
      return res.status(404).json({
        success: false,
        message: 'Unit not found'
      });
    }
    
    // Check if new name already exists (case-insensitive)
    const existingUnit = await Unit.findOne({ 
      name: { $regex: new RegExp(`^${name}$`, 'i') },
      _id: { $ne: id }
    });
    
    if (existingUnit) {
      return res.status(400).json({
        success: false,
        message: 'Unit name already exists'
      });
    }
    
    const oldName = unit.name;
    unit.name = name.trim();
    await unit.save();
    
    // Update all stock items that use this unit
    await Stock.updateMany(
      { unit: oldName },
      { $set: { unit: name.trim() } }
    );
    
    console.log('✅ Unit updated and stock items reassigned');
    res.json({
      success: true,
      message: 'Unit updated successfully',
      data: {
        id: unit._id,
        name: unit.name,
        type: unit.type
      }
    });
  } catch (error) {
    console.error('❌ Update unit error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating unit'
    });
  }
});

// Delete unit
app.delete('/api/units/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('🗑️  Deleting unit ID:', id);
    
    const unit = await Unit.findById(id);
    
    if (!unit) {
      return res.status(404).json({
        success: false,
        message: 'Unit not found'
      });
    }
    
    // Prevent deletion of "pcs" unit as it's the fallback
    if (unit.name.toLowerCase() === 'pcs') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete the "pcs" unit as it is used as a fallback'
      });
    }
    
    // Count stock items using this unit
    const stockCount = await Stock.countDocuments({ unit: unit.name });
    
    // Reassign all products to "pcs" unit before deletion
    if (stockCount > 0) {
      await Stock.updateMany(
        { unit: unit.name },
        { $set: { unit: 'pcs' } }
      );
      console.log(`📦 Reassigned ${stockCount} product(s) to "pcs" unit`);
    }
    
    await Unit.findByIdAndDelete(id);
    
    console.log('✅ Unit deleted');
    res.json({
      success: true,
      message: `Unit deleted successfully. ${stockCount} product(s) moved to "pcs"`,
      reassignedCount: stockCount
    });
  } catch (error) {
    console.error('❌ Delete unit error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting unit'
    });
  }
});

// ============================================================================
// SUPPLIER ROUTES
// ============================================================================

app.get('/api/suppliers', async (req, res) => {
  try {
    console.log('🏢 Suppliers list requested');
    const suppliers = await Supplier.find().sort({ createdAt: -1 });
    
    const formattedSuppliers = suppliers.map(s => ({
      id: s._id,
      name: s.name,
      contactPerson: s.contactPerson,
      email: s.email,
      phone: s.phone,
      address: s.address,
      createdAt: s.createdAt
    }));
    
    res.json({
      success: true,
      data: formattedSuppliers
    });
    
  } catch (error) {
    console.error('❌ Suppliers list error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching suppliers'
    });
  }
});

app.post('/api/suppliers', async (req, res) => {
  try {
    console.log('🏢 Add supplier request:', req.body);
    const { name, contactPerson, email, phone, address } = req.body;
    
    // Validate required fields
    if (!name || name.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Supplier name is required'
      });
    }
    
    const newSupplier = new Supplier({
      name: name.trim(),
      contactPerson: contactPerson || '',
      email: email || '',
      phone: phone || '',
      address: address || ''
    });
    
    await newSupplier.save();
    
    console.log('✅ Supplier added:', newSupplier.name);
    res.status(201).json({
      success: true,
      message: 'Supplier added successfully',
      data: {
        id: newSupplier._id,
        name: newSupplier.name,
        contactPerson: newSupplier.contactPerson,
        email: newSupplier.email,
        phone: newSupplier.phone,
        address: newSupplier.address,
        createdAt: newSupplier.createdAt
      }
    });
    
  } catch (error) {
    console.error('❌ Add supplier error:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error adding supplier: ' + error.message
    });
  }
});

app.put('/api/suppliers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`📝 Updating supplier ID: ${id}`);
    
    const supplier = await Supplier.findByIdAndUpdate(id, req.body, { new: true });
    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: 'Supplier not found'
      });
    }
    
    console.log('✅ Supplier updated');
    res.json({
      success: true,
      message: 'Supplier updated successfully',
      data: {
        id: supplier._id,
        name: supplier.name,
        contactPerson: supplier.contactPerson,
        email: supplier.email,
        phone: supplier.phone,
        address: supplier.address,
        createdAt: supplier.createdAt
      }
    });
    
  } catch (error) {
    console.error('❌ Update supplier error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating supplier'
    });
  }
});

app.delete('/api/suppliers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🗑️  Deleting supplier ID: ${id}`);
    
    const supplier = await Supplier.findByIdAndDelete(id);
    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: 'Supplier not found'
      });
    }
    
    console.log('✅ Supplier deleted');
    res.json({
      success: true,
      message: 'Supplier deleted successfully'
    });
    
  } catch (error) {
    console.error('❌ Delete supplier error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting supplier'
    });
  }
});

// ============================================================================
// CUSTOMER ROUTES
// ============================================================================

app.get('/api/customers', async (req, res) => {
  try {
    console.log('👥 Customers list requested');
    const customers = await Customer.find().sort({ createdAt: -1 });
    
    const enhancedCustomers = await Promise.all(customers.map(async (customer) => {
      const customerBills = await Bill.find({ customerName: customer.name });
      const totalSpent = customerBills.reduce((sum, bill) => sum + bill.totalAmount, 0);
      
      return {
        id: customer._id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
        customerType: customer.customerType,
        totalPurchases: totalSpent,
        lastPurchase: customer.lastPurchase,
        createdAt: customer.createdAt,
        Bills: customerBills,
        billCount: customerBills.length,
        totalSpent
      };
    }));
    
    res.json({
      success: true,
      data: enhancedCustomers
    });
    
  } catch (error) {
    console.error('❌ Customers list error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching customers'
    });
  }
});

app.post('/api/customers', async (req, res) => {
  try {
    console.log('👤 Add customer request:', req.body);
    const { name, email, phone, address, customerType } = req.body;
    
    if (!name || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Name and phone are required fields'
      });
    }
    
    if (email) {
      const existing = await Customer.findOne({ email: email.toLowerCase() });
      if (existing) {
        return res.status(400).json({
          success: false,
          message: 'Customer with this email already exists'
        });
      }
    }
    
    const newCustomer = new Customer({
      name: name.trim(),
      email: email ? email.trim().toLowerCase() : '',
      phone: phone.trim(),
      address: address ? address.trim() : '',
      customerType: customerType || 'Regular'
    });
    
    await newCustomer.save();
    
    console.log('✅ Customer added');
    res.status(201).json({
      success: true,
      message: 'Customer added successfully',
      data: {
        id: newCustomer._id,
        name: newCustomer.name,
        email: newCustomer.email,
        phone: newCustomer.phone,
        address: newCustomer.address,
        customerType: newCustomer.customerType,
        totalPurchases: 0,
        lastPurchase: null,
        createdAt: newCustomer.createdAt,
        Bills: [],
        billCount: 0,
        totalSpent: 0
      }
    });
    
  } catch (error) {
    console.error('❌ Add customer error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding customer'
    });
  }
});

app.put('/api/customers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`📝 Updating customer ID: ${id}`);
    const { name, email, phone, address, customerType } = req.body;
    
    const customer = await Customer.findById(id);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }
    
    if (email) {
      const existing = await Customer.findOne({ 
        email: email.toLowerCase(), 
        _id: { $ne: id } 
      });
      if (existing) {
        return res.status(400).json({
          success: false,
          message: 'Another customer with this email already exists'
        });
      }
    }
    
    const oldName = customer.name;
    const newName = name.trim();
    
    customer.name = newName;
    customer.email = email ? email.trim().toLowerCase() : '';
    customer.phone = phone.trim();
    customer.address = address ? address.trim() : '';
    customer.customerType = customerType || customer.customerType;
    
    await customer.save();
    
    if (oldName !== newName) {
      await Bill.updateMany(
        { customerName: oldName },
        { customerName: newName }
      );
    }
    
    console.log('✅ Customer updated');
    res.json({
      success: true,
      message: 'Customer updated successfully',
      data: {
        id: customer._id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
        customerType: customer.customerType,
        createdAt: customer.createdAt
      }
    });
    
  } catch (error) {
    console.error('❌ Update customer error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating customer'
    });
  }
});

app.delete('/api/customers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🗑️  Deleting customer ID: ${id}`);
    
    const customer = await Customer.findById(id);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }
    
    const result = await Bill.updateMany(
      { customerName: customer.name },
      { 
        customerName: 'Walk-in Customer',
        customerId: null
      }
    );
    
    await Customer.findByIdAndDelete(id);
    
    console.log('✅ Customer deleted');
    res.json({
      success: true,
      message: `Customer deleted successfully. ${result.modifiedCount} associated bills converted to Walk-in Customer.`,
      data: customer,
      updatedBills: result.modifiedCount
    });
    
  } catch (error) {
    console.error('❌ Delete customer error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting customer'
    });
  }
});

// ============================================================================
// BILL ROUTES  
// ============================================================================

app.get('/api/bills', async (req, res) => {
  try {
    console.log('📋 Bills list requested');
    const bills = await Bill.find()
      .populate('createdBy', 'username firstName lastName')
      .sort({ billDate: -1 });
    
    const formattedBills = bills.map(bill => ({
      id: bill._id,
      billNumber: bill.billNumber,
      customerId: bill.customerId,
      customerName: bill.customerName,
      billDate: bill.billDate,
      items: bill.items,
      subtotal: bill.subtotal,
      discount: bill.discount,
      tax: bill.tax,
      totalAmount: bill.totalAmount,
      status: bill.status,
      notes: bill.notes,
      createdBy: bill.createdBy?._id,
      createdAt: bill.createdAt,
      updatedAt: bill.updatedAt
    }));
    
    res.json({
      success: true,
      data: formattedBills
    });
    
  } catch (error) {
    console.error('❌ Bills list error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching bills'
    });
  }
});

app.get('/api/bills/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`📋 Fetching bill with ID: ${id}`);
    
    const bill = await Bill.findById(id)
      .populate('createdBy', 'username firstName lastName');
    
    if (!bill) {
      return res.status(404).json({
        success: false,
        message: 'Bill not found'
      });
    }
    
    const formattedBill = {
      id: bill._id,
      billNumber: bill.billNumber,
      customerId: bill.customerId,
      customerName: bill.customerName,
      billDate: bill.billDate,
      items: bill.items,
      subtotal: bill.subtotal,
      discount: bill.discount,
      tax: bill.tax,
      totalAmount: bill.totalAmount,
      status: bill.status,
      notes: bill.notes,
      createdBy: bill.createdBy?._id,
      createdAt: bill.createdAt,
      updatedAt: bill.updatedAt
    };
    
    console.log('✅ Bill fetched successfully');
    res.json({
      success: true,
      data: formattedBill
    });
    
  } catch (error) {
    console.error('❌ Fetch bill error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching bill'
    });
  }
});

app.post('/api/bills', async (req, res) => {
  try {
    console.log('📋 Create bill request');
    console.log('📝 Request body:', JSON.stringify(req.body, null, 2));
    
    const { customerName, customerId, items, subtotal, discount, tax, totalAmount, notes, billDate } = req.body;
    
    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one item is required'
      });
    }
    
    const lastBill = await Bill.findOne().sort({ billNumber: -1 });
    let billNumber;
    if (lastBill) {
      const lastNumber = parseInt(lastBill.billNumber.split('-')[1]);
      billNumber = `BILL-${String(lastNumber + 1).padStart(3, '0')}`;
    } else {
      billNumber = 'BILL-001';
    }
    
    let userId = null;
    try {
      const adminUser = await User.findOne({ username: 'admin' });
      if (adminUser) {
        userId = adminUser._id;
      }
    } catch (err) {
      console.log('⚠️  Could not find user, creating bill without user reference');
    }
    
    const newBill = new Bill({
      billNumber,
      customerId: customerId || null,
      customerName: customerName || 'Walk-in Customer',
      billDate: billDate ? new Date(billDate) : new Date(),
      items,
      subtotal,
      discount: discount || 0,
      tax: tax || 0,
      totalAmount,
      status: 'paid',
      notes: notes || '',
      createdBy: userId
    });
    
    await newBill.save();
    console.log('✅ Bill saved to database:', billNumber);
    
    for (const item of items) {
      try {
        const stock = await Stock.findById(item.stockId);
        if (stock) {
          stock.quantity = Math.max(0, stock.quantity - item.quantity);
          await stock.save();
          console.log(`✅ Stock updated for ${stock.productName}: ${stock.quantity}`);
        }
      } catch (err) {
        console.error(`❌ Error updating stock for item ${item.stockId}:`, err.message);
      }
    }
    
    if (customerId) {
      try {
        await Customer.findByIdAndUpdate(customerId, {
          lastPurchase: new Date(),
          $inc: { totalPurchases: totalAmount }
        });
        console.log('✅ Customer purchase history updated');
      } catch (err) {
        console.error('❌ Error updating customer:', err.message);
      }
    }
    
    console.log('✅ Bill created successfully:', billNumber);
    res.status(201).json({
      success: true,
      message: 'Bill created successfully',
      data: {
        id: newBill._id,
        billNumber: newBill.billNumber,
        customerId: newBill.customerId,
        customerName: newBill.customerName,
        billDate: newBill.billDate,
        items: newBill.items,
        subtotal: newBill.subtotal,
        discount: newBill.discount,
        tax: newBill.tax,
        totalAmount: newBill.totalAmount,
        status: newBill.status,
        notes: newBill.notes,
        createdAt: newBill.createdAt
      }
    });
    
  } catch (error) {
    console.error('❌ Create bill error:', error);
    console.error('❌ Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Error creating bill: ' + error.message
    });
  }
});

app.put('/api/bills/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`📝 Updating bill ID: ${id}`);
    console.log('Update data:', JSON.stringify(req.body, null, 2));
    
    const { customerName, customerId, items, subtotal, discount, tax, totalAmount, notes, billDate } = req.body;
    
    const oldBill = await Bill.findById(id);
    if (!oldBill) {
      return res.status(404).json({
        success: false,
        message: 'Bill not found'
      });
    }
    
    // Restore stock quantities from old bill
    for (const oldItem of oldBill.items) {
      const stock = await Stock.findById(oldItem.stockId);
      if (stock) {
        stock.quantity += oldItem.quantity;
        await stock.save();
        console.log(`✅ Restored ${oldItem.quantity} units to ${stock.productName}`);
      }
    }
    
    // Update bill
    oldBill.customerName = customerName || oldBill.customerName;
    oldBill.customerId = customerId !== undefined ? customerId : oldBill.customerId;
    oldBill.items = items || oldBill.items;
    oldBill.subtotal = subtotal !== undefined ? subtotal : oldBill.subtotal;
    oldBill.discount = discount !== undefined ? discount : oldBill.discount;
    oldBill.tax = tax !== undefined ? tax : oldBill.tax;
    oldBill.totalAmount = totalAmount !== undefined ? totalAmount : oldBill.totalAmount;
    oldBill.notes = notes !== undefined ? notes : oldBill.notes;
    if (billDate) oldBill.billDate = new Date(billDate);
    
    await oldBill.save();
    console.log('✅ Bill updated in database');
    
    // Deduct stock quantities from new bill items
    for (const item of oldBill.items) {
      const stock = await Stock.findById(item.stockId);
      if (stock) {
        stock.quantity = Math.max(0, stock.quantity - item.quantity);
        await stock.save();
        console.log(`✅ Deducted ${item.quantity} units from ${stock.productName}`);
      }
    }
    
    // Update customer last purchase if customerId exists
    if (customerId) {
      try {
        await Customer.findByIdAndUpdate(customerId, {
          lastPurchase: new Date()
        });
        console.log('✅ Customer purchase history updated');
      } catch (err) {
        console.error('❌ Error updating customer:', err.message);
      }
    }
    
    console.log('✅ Bill updated successfully');
    res.json({
      success: true,
      message: 'Bill updated successfully',
      data: {
        id: oldBill._id,
        billNumber: oldBill.billNumber,
        customerId: oldBill.customerId,
        customerName: oldBill.customerName,
        billDate: oldBill.billDate,
        items: oldBill.items,
        subtotal: oldBill.subtotal,
        discount: oldBill.discount,
        tax: oldBill.tax,
        totalAmount: oldBill.totalAmount,
        status: oldBill.status,
        notes: oldBill.notes,
        createdAt: oldBill.createdAt,
        updatedAt: oldBill.updatedAt
      }
    });
    
  } catch (error) {
    console.error('❌ Update bill error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Error updating bill: ' + error.message
    });
  }
});

app.get('/api/bills/:id/pdf', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`📄 Generating PDF for bill ID: ${id}`);
    
    const bill = await Bill.findById(id);
    if (!bill) {
      return res.status(404).json({
        success: false,
        message: 'Bill not found'
      });
    }
    
    // Generate simple HTML for PDF
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Bill ${bill.billNumber}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; }
          .header { text-align: center; margin-bottom: 30px; }
          .header h1 { margin: 0; color: #333; }
          .info { margin: 20px 0; }
          .info-row { display: flex; justify-content: space-between; margin: 5px 0; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
          th { background-color: #4CAF50; color: white; }
          .totals { margin-top: 20px; text-align: right; }
          .total-row { display: flex; justify-content: flex-end; margin: 5px 0; }
          .total-label { width: 150px; font-weight: bold; }
          .total-value { width: 150px; text-align: right; }
          .grand-total { font-size: 18px; font-weight: bold; color: #4CAF50; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Stock Management System</h1>
          <p>Invoice / Bill</p>
        </div>
        
        <div class="info">
          <div class="info-row">
            <strong>Bill Number:</strong> ${bill.billNumber}
          </div>
          <div class="info-row">
            <strong>Date:</strong> ${new Date(bill.billDate).toLocaleDateString()}
          </div>
          <div class="info-row">
            <strong>Customer:</strong> ${bill.customerName}
          </div>
        </div>
        
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Quantity</th>
              <th>Unit Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${bill.items.map(item => `
              <tr>
                <td>${item.productName}</td>
                <td>${item.quantity}</td>
                <td>₹${item.unitPrice.toFixed(2)}</td>
                <td>₹${item.total.toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div class="totals">
          <div class="total-row">
            <div class="total-label">Subtotal:</div>
            <div class="total-value">₹${bill.subtotal.toFixed(2)}</div>
          </div>
          ${bill.discount > 0 ? `
            <div class="total-row">
              <div class="total-label">Discount:</div>
              <div class="total-value">-₹${bill.discount.toFixed(2)}</div>
            </div>
          ` : ''}
          ${bill.tax > 0 ? `
            <div class="total-row">
              <div class="total-label">Tax:</div>
              <div class="total-value">₹${bill.tax.toFixed(2)}</div>
            </div>
          ` : ''}
          <div class="total-row grand-total">
            <div class="total-label">Grand Total:</div>
            <div class="total-value">₹${bill.totalAmount.toFixed(2)}</div>
          </div>
        </div>
        
        ${bill.notes ? `
          <div style="margin-top: 30px;">
            <strong>Notes:</strong>
            <p>${bill.notes}</p>
          </div>
        ` : ''}
        
        <div style="margin-top: 50px; text-align: center; color: #666; font-size: 12px;">
          <p>Thank you for your business!</p>
          <p>Generated on ${new Date().toLocaleString()}</p>
        </div>
      </body>
      </html>
    `;
    
    // Set headers for PDF download
    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Content-Disposition', `inline; filename="bill-${bill.billNumber}.html"`);
    res.send(html);
    
    console.log('✅ Bill HTML generated successfully');
    
  } catch (error) {
    console.error('❌ PDF generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating PDF'
    });
  }
});

app.delete('/api/bills/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🗑️  Deleting bill ID: ${id}`);
    
    const bill = await Bill.findById(id);
    if (!bill) {
      return res.status(404).json({
        success: false,
        message: 'Bill not found'
      });
    }
    
    for (const item of bill.items) {
      await Stock.findByIdAndUpdate(item.stockId, {
        $inc: { quantity: item.quantity }
      });
    }
    
    await Bill.findByIdAndDelete(id);
    
    console.log('✅ Bill deleted');
    res.json({
      success: true,
      message: 'Bill deleted successfully'
    });
    
  } catch (error) {
    console.error('❌ Delete bill error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting bill'
    });
  }
});

// ============================================================================
// USER ROUTES
// ============================================================================

app.get('/api/users', async (req, res) => {
  try {
    console.log('👥 Users list requested');
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    
    const formattedUsers = users.map(user => ({
      id: user._id,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      phone: user.phone,
      isActive: user.isActive,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    }));
    
    res.json({
      success: true,
      data: formattedUsers
    });
    
  } catch (error) {
    console.error('❌ Users list error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users'
    });
  }
});

app.post('/api/users', async (req, res) => {
  try {
    console.log('👤 Add user request:', req.body);
    const { username, email, firstName, lastName, password, role, phone } = req.body;
    
    const existingUser = await User.findOne({
      $or: [{ username }, { email }]
    });
    
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: existingUser.username === username ? 'Username already exists' : 'Email already exists'
      });
    }
    
    const newUser = new User({
      username,
      email,
      firstName,
      lastName,
      password,
      role: role || 'cashier',
      phone: phone || '',
      isActive: true
    });
    
    await newUser.save();
    
    console.log('✅ User added');
    res.status(201).json({
      success: true,
      message: 'User added successfully',
      data: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        role: newUser.role,
        phone: newUser.phone,
        isActive: newUser.isActive,
        createdAt: newUser.createdAt
      }
    });
    
  } catch (error) {
    console.error('❌ Add user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding user'
    });
  }
});

app.put('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`📝 Updating user ID: ${id}`);
    const { username, email, firstName, lastName, role, phone, isActive, password } = req.body;
    
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    if (username) user.username = username;
    if (email) user.email = email;
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (role) user.role = role;
    if (phone !== undefined) user.phone = phone;
    if (isActive !== undefined) user.isActive = isActive;
    
    // Update password if provided
    if (password && password.trim() !== '') {
      user.password = password;
      console.log('🔐 Password updated for user:', username);
    }
    
    await user.save();
    
    console.log('✅ User updated');
    res.json({
      success: true,
      message: 'User updated successfully',
      data: {
        id: user._id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        phone: user.phone,
        isActive: user.isActive
      }
    });
    
  } catch (error) {
    console.error('❌ Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating user'
    });
  }
});

// Update user status
app.patch('/api/users/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;
    
    console.log(`🔄 Updating user status - ID: ${id}, isActive: ${isActive}`);
    
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    user.isActive = isActive;
    await user.save();
    
    console.log('✅ User status updated');
    res.json({
      success: true,
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: {
        id: user._id,
        username: user.username,
        isActive: user.isActive
      }
    });
    
  } catch (error) {
    console.error('❌ Update user status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating user status'
    });
  }
});

app.delete('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🗑️  Deleting user ID: ${id}`);
    
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    console.log('✅ User deleted');
    res.json({
      success: true,
      message: 'User deleted successfully'
    });
    
  } catch (error) {
    console.error('❌ Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting user'
    });
  }
});

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

async function generateSalesData(days = 7) {
  console.log('📊 Generating sales data for', days, 'days');
  const today = new Date();
  const timeData = [];
  
  if (days === 1) {
    for (let i = 23; i >= 0; i--) {
      const hour = new Date(today);
      hour.setHours(today.getHours() - i, 0, 0, 0);
      timeData.push({
        date: hour.toISOString(),
        label: hour.getHours().toString().padStart(2, '0') + ':00'
      });
    }
  } else {
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      
      let label;
      if (days <= 7) {
        label = dayNames[date.getDay()];
      } else if (days <= 30) {
        label = `${date.getDate()}/${date.getMonth() + 1}`;
      } else {
        label = `${date.getDate()} ${monthNames[date.getMonth()]}`;
      }
      
      timeData.push({
        date: date.toISOString().split('T')[0],
        label: label
      });
    }
  }
  
  const salesData = await Promise.all(timeData.map(async (period) => {
    let periodBills;
    
    if (days === 1) {
      const hourStart = new Date(period.date);
      const hourEnd = new Date(hourStart);
      hourEnd.setHours(hourEnd.getHours() + 1);
      
      periodBills = await Bill.find({
        billDate: { $gte: hourStart, $lt: hourEnd }
      });
    } else {
      const dayStart = new Date(period.date);
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayEnd.getDate() + 1);
      
      periodBills = await Bill.find({
        billDate: { $gte: dayStart, $lt: dayEnd }
      });
    }
    
    const totalSales = periodBills.reduce((sum, bill) => sum + bill.totalAmount, 0);
    
    return {
      date: period.label,
      sales: totalSales
    };
  }));
  
  console.log('📊 Generated', salesData.length, 'data points');
  return salesData;
}

async function generateStockData() {
  const stocks = await Stock.find();
  const categoryData = {};
  
  stocks.forEach(item => {
    if (!categoryData[item.category]) {
      categoryData[item.category] = {
        currentStock: 0,
        minStock: 0,
        count: 0
      };
    }
    
    categoryData[item.category].currentStock += item.quantity;
    categoryData[item.category].minStock += item.minStock;
    categoryData[item.category].count++;
  });
  
  return Object.keys(categoryData).map(category => ({
    productName: category,
    currentStock: categoryData[category].currentStock,
    minStock: categoryData[category].minStock
  }));
}

async function generateRecentActivities(days) {
  const daysAgo = new Date();
  daysAgo.setDate(daysAgo.getDate() - days);
  
  const recentBills = await Bill.find({
    billDate: { $gte: daysAgo }
  }).sort({ billDate: -1 }).limit(5);
  
  const activities = recentBills.map(bill => {
    const billDate = new Date(bill.billDate);
    const now = new Date();
    const isToday = billDate.toDateString() === now.toDateString();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const isYesterday = billDate.toDateString() === yesterday.toDateString();
    
    let timeLabel;
    if (isToday) {
      timeLabel = 'Today';
    } else if (isYesterday) {
      timeLabel = 'Yesterday';
    } else {
      const daysDiff = Math.floor((now - billDate) / (1000 * 60 * 60 * 24));
      timeLabel = `${daysDiff}d ago`;
    }
    
    return {
      type: 'bill',
      title: 'New bill created',
      description: `Bill ${bill.billNumber} for ${bill.customerName} - ₹${bill.totalAmount}`,
      timestamp: bill.billDate.toISOString(),
      time: timeLabel
    };
  });
  
  if (activities.length === 0) {
    activities.push({
      type: 'stock',
      title: 'No recent activities',
      description: `No activities found in the last ${days} day${days > 1 ? 's' : ''}`,
      timestamp: new Date().toISOString(),
      time: 'N/A'
    });
  }
  
  return activities.slice(0, 8);
}

// ============================================================================
// ANALYTICS ROUTES
// ============================================================================

app.get('/api/analytics/overview', async (req, res) => {
  try {
    console.log('📊 Analytics overview requested');
    
    const days = parseInt(req.query.days) || 7;
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - days);
    
    const totalProducts = await Stock.countDocuments();
    const totalSuppliers = await Supplier.countDocuments();
    const totalCustomers = await Customer.countDocuments();
    const lowStockItems = await Stock.countDocuments({ $expr: { $lte: ['$quantity', '$minStock'] } });
    
    // Calculate total inventory value
    const stocks = await Stock.find();
    const totalValue = stocks.reduce((sum, stock) => sum + (stock.quantity * stock.unitPrice), 0);
    
    const bills = await Bill.find({ billDate: { $gte: daysAgo } });
    const totalSales = bills.reduce((sum, bill) => sum + bill.totalAmount, 0);
    const totalBills = bills.length;
    
    res.json({
      success: true,
      data: {
        totalProducts,
        totalSuppliers,
        totalCustomers,
        totalValue,
        totalSales,
        totalBills,
        lowStockItems,
        averageOrderValue: totalBills > 0 ? totalSales / totalBills : 0
      }
    });
  } catch (error) {
    console.error('❌ Analytics overview error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching analytics overview'
    });
  }
});

app.get('/api/analytics/inventory', async (req, res) => {
  try {
    console.log('📊 Analytics inventory requested');
    
    const stocks = await Stock.find().populate('supplierId', 'name');
    
    const totalProducts = stocks.length;
    const totalValue = stocks.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const lowStockItems = stocks.filter(item => item.quantity <= item.minStock && item.quantity > 0);
    const outOfStockItems = stocks.filter(item => item.quantity === 0);
    const inStockItems = stocks.filter(item => item.quantity > item.minStock);
    
    // Get unique categories
    const categories = [...new Set(stocks.map(item => item.category))];
    const totalCategories = categories.length;
    
    const categoryData = {};
    stocks.forEach(item => {
      if (!categoryData[item.category]) {
        categoryData[item.category] = {
          count: 0,
          value: 0,
          quantity: 0
        };
      }
      categoryData[item.category].count += 1;
      categoryData[item.category].value += item.quantity * item.unitPrice;
      categoryData[item.category].quantity += item.quantity;
    });
    
    const chartData = Object.entries(categoryData).map(([category, data]) => ({
      category,
      count: data.count,
      value: data.value,
      quantity: data.quantity
    }));
    
    res.json({
      success: true,
      data: {
        totalProducts,
        totalValue,
        totalCategories,
        stockLevels: {
          inStock: inStockItems.length,
          lowStock: lowStockItems.length,
          outOfStock: outOfStockItems.length
        },
        lowStockCount: lowStockItems.length,
        outOfStockCount: outOfStockItems.length,
        lowStockItems: lowStockItems.map(item => ({
          id: item._id,
          productCode: item.productCode,
          productName: item.productName,
          quantity: item.quantity,
          minStock: item.minStock
        })),
        chartData,
        categories
      }
    });
  } catch (error) {
    console.error('❌ Analytics inventory error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching analytics inventory'
    });
  }
});

app.get('/api/analytics/customers', async (req, res) => {
  try {
    console.log('📊 Analytics customers requested');
    
    const customers = await Customer.find();
    const bills = await Bill.find();
    
    const customerStats = customers.map(customer => {
      const customerBills = bills.filter(bill => bill.customerName === customer.name);
      const totalSpent = customerBills.reduce((sum, bill) => sum + bill.totalAmount, 0);
      
      return {
        id: customer._id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        customerType: customer.customerType,
        totalOrders: customerBills.length,
        totalSpent,
        lastPurchase: customer.lastPurchase
      };
    });
    
    customerStats.sort((a, b) => b.totalSpent - a.totalSpent);
    
    const totalCustomers = customers.length;
    const activeCustomers = customerStats.filter(c => c.totalOrders > 0).length;
    const totalRevenue = customerStats.reduce((sum, c) => sum + c.totalSpent, 0);
    
    res.json({
      success: true,
      data: {
        totalCustomers,
        activeCustomers,
        totalRevenue,
        averageOrderValue: bills.length > 0 ? totalRevenue / bills.length : 0,
        topCustomers: customerStats.slice(0, 10),
        chartData: customerStats.slice(0, 10).map(c => ({
          name: c.name,
          orders: c.totalOrders,
          spent: c.totalSpent
        }))
      }
    });
  } catch (error) {
    console.error('❌ Analytics customers error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching analytics customers'
    });
  }
});

app.get('/api/analytics/sales', async (req, res) => {
  try {
    console.log('📊 Sales analytics requested');
    const period = parseInt(req.query.period) || 7;
    
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - period);
    const bills = await Bill.find({ billDate: { $gte: daysAgo } }).sort({ billDate: 1 });
    
    // Group sales by date
    const salesByDate = {};
    bills.forEach(bill => {
      const dateKey = new Date(bill.billDate).toISOString().split('T')[0];
      if (!salesByDate[dateKey]) {
        salesByDate[dateKey] = 0;
      }
      salesByDate[dateKey] += bill.totalAmount;
    });
    
    // Create array with all dates in range (fill missing dates with 0)
    const salesData = [];
    for (let i = period - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateKey = date.toISOString().split('T')[0];
      salesData.push({
        date: dateKey,
        sales: salesByDate[dateKey] || 0,
        amount: salesByDate[dateKey] || 0
      });
    }
    
    const totalSales = bills.reduce((sum, bill) => sum + bill.totalAmount, 0);
    
    res.json({
      success: true,
      data: {
        salesData,
        totalSales,
        totalOrders: bills.length,
        averageOrderValue: bills.length > 0 ? totalSales / bills.length : 0,
        dataSource: 'real',
        lastUpdated: new Date()
      }
    });
  } catch (error) {
    console.error('❌ Sales analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching sales analytics'
    });
  }
});

app.get('/api/analytics/orders', async (req, res) => {
  try {
    console.log('📊 Order analytics requested');
    const period = parseInt(req.query.period) || 7;
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - period);
    
    const bills = await Bill.find({ billDate: { $gte: daysAgo } }).sort({ billDate: 1 });
    
    const ordersByDate = {};
    bills.forEach(bill => {
      const dateKey = new Date(bill.billDate).toISOString().split('T')[0];
      if (!ordersByDate[dateKey]) {
        ordersByDate[dateKey] = 0;
      }
      ordersByDate[dateKey] += 1;
    });
    
    // Create array with all dates in range (fill missing dates with 0)
    const orderData = [];
    for (let i = period - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateKey = date.toISOString().split('T')[0];
      orderData.push({
        date: dateKey,
        orders: ordersByDate[dateKey] || 0
      });
    }
    
    res.json({
      success: true,
      data: {
        orderData,
        totalOrders: bills.length,
        dataSource: 'real',
        lastUpdated: new Date()
      }
    });
  } catch (error) {
    console.error('❌ Order analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching order analytics'
    });
  }
});

// ============================================================================
// REPORTS ROUTES
// ============================================================================

app.get('/api/reports', async (req, res) => {
  try {
    console.log('📊 Reports requested');
    res.json({
      success: true,
      message: 'Reports endpoint',
      data: {
        available: true,
        types: ['sales', 'inventory', 'customers', 'suppliers']
      }
    });
  } catch (error) {
    console.error('❌ Reports error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching reports'
    });
  }
});

app.get('/api/reports/dashboard', async (req, res) => {
  try {
    console.log('📊 Dashboard reports requested');
    
    const totalBills = await Bill.countDocuments();
    const bills = await Bill.find();
    const totalSales = bills.reduce((sum, bill) => sum + bill.totalAmount, 0);
    
    const lowStockItems = await Stock.countDocuments({ $expr: { $lte: ['$quantity', '$minStock'] } });
    
    res.json({
      success: true,
      data: {
        totalProducts: await Stock.countDocuments(),
        totalSales,
        totalBills,
        lowStockItems
      }
    });
  } catch (error) {
    console.error('❌ Dashboard reports error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard reports'
    });
  }
});

app.get('/api/reports/alerts', async (req, res) => {
  try {
    console.log('🚨 Alerts requested');
    
    const lowStockItems = await Stock.find({ $expr: { $lte: ['$quantity', '$minStock'] } })
      .populate('supplierId', 'name')
      .limit(10);
    
    const alerts = lowStockItems.map(item => ({
      id: item._id,
      type: 'low_stock',
      severity: item.quantity === 0 ? 'critical' : 'warning',
      message: `${item.productName} is ${item.quantity === 0 ? 'out of stock' : 'low on stock'}`,
      productCode: item.productCode,
      productName: item.productName,
      currentQuantity: item.quantity,
      minStock: item.minStock,
      timestamp: item.updatedAt
    }));
    
    res.json({
      success: true,
      data: {
        alerts: alerts
      }
    });
  } catch (error) {
    console.error('❌ Alerts error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching alerts'
    });
  }
});

app.get('/api/reports/recent-activities', async (req, res) => {
  try {
    console.log('📋 Recent activities requested');
    
    const limit = parseInt(req.query.limit) || 15;
    
    const recentBills = await Bill.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('createdBy', 'username');
    
    const activities = recentBills.map(bill => {
      const billDate = new Date(bill.billDate || bill.createdAt);
      const now = new Date();
      const diffMs = now - billDate;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);
      
      let timeLabel;
      if (diffMins < 1) {
        timeLabel = 'Just now';
      } else if (diffMins < 60) {
        timeLabel = `${diffMins}m ago`;
      } else if (diffHours < 24) {
        timeLabel = `${diffHours}h ago`;
      } else if (diffDays === 1) {
        timeLabel = 'Yesterday';
      } else if (diffDays < 7) {
        timeLabel = `${diffDays}d ago`;
      } else {
        timeLabel = billDate.toLocaleDateString();
      }
      
      return {
        type: 'bill',
        title: 'New bill created',
        description: `Bill ${bill.billNumber} for ${bill.customerName} - ₹${bill.totalAmount.toFixed(2)}`,
        timestamp: billDate.toISOString(),
        time: timeLabel,
        user: bill.createdBy?.username || 'System'
      };
    });
    
    res.json({
      success: true,
      data: {
        activities: activities
      }
    });
  } catch (error) {
    console.error('❌ Recent activities error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching recent activities'
    });
  }
});

app.get('/api/income', async (req, res) => {
  try {
    console.log('💰 Income data requested');
    
    const period = req.query.period || 'monthly';
    const now = new Date();
    let startDate;
    
    switch (period) {
      case 'daily':
        startDate = new Date(now.setHours(0, 0, 0, 0));
        break;
      case 'weekly':
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'yearly':
        startDate = new Date(now.setFullYear(now.getFullYear() - 1));
        break;
      case 'monthly':
      default:
        startDate = new Date(now.setMonth(now.getMonth() - 1));
        break;
    }
    
    const bills = await Bill.find({
      billDate: { $gte: startDate },
      status: 'paid'
    });
    
    const totalIncome = bills.reduce((sum, bill) => sum + bill.totalAmount, 0);
    const totalTransactions = bills.length;
    
    const incomeByDate = {};
    bills.forEach(bill => {
      const dateKey = new Date(bill.billDate).toISOString().split('T')[0];
      if (!incomeByDate[dateKey]) {
        incomeByDate[dateKey] = 0;
      }
      incomeByDate[dateKey] += bill.totalAmount;
    });
    
    const chartData = Object.entries(incomeByDate).map(([date, amount]) => ({
      date,
      amount,
      label: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }));
    
    res.json({
      success: true,
      data: {
        totalIncome,
        totalTransactions,
        period,
        chartData,
        averageTransaction: totalTransactions > 0 ? totalIncome / totalTransactions : 0
      }
    });
  } catch (error) {
    console.error('❌ Income data error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching income data'
    });
  }
});

// ============================================================================
// HEALTH CHECK
// ============================================================================

app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Backend server is running!',
    timestamp: new Date().toISOString()
  });
});

app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'Stock Management System API',
    version: '1.0.0'
  });
});

// ============================================================================
// START SERVER
// ============================================================================

// Initialize default categories
async function initializeDefaultCategories() {
  const defaultCategories = [
    'Electronics',
    'Clothing',
    'Food & Beverages',
    'Books',
    'Home & Garden',
    'Sports',
    'Toys',
    'Health & Beauty',
    'Automotive',
    'Office Supplies',
    'Other'
  ];
  
  try {
    const existingCount = await Category.countDocuments({ type: 'default' });
    if (existingCount === 0) {
      console.log('📂 Initializing default categories...');
      for (const categoryName of defaultCategories) {
        await Category.create({
          name: categoryName,
          type: 'default',
          createdBy: null
        });
      }
      console.log('✅ Default categories initialized');
    }
  } catch (error) {
    console.error('⚠️  Error initializing categories:', error.message);
  }
}

// Initialize default units
async function initializeDefaultUnits() {
  const defaultUnits = [
    'pcs',
    'kg',
    'gm',
    'ltr',
    'ml',
    'box',
    'pack',
    'meter',
    'inch',
    'pair'
  ];
  
  try {
    const existingCount = await Unit.countDocuments({ type: 'default' });
    if (existingCount === 0) {
      console.log('📏 Initializing default units...');
      for (const unitName of defaultUnits) {
        await Unit.create({
          name: unitName,
          type: 'default',
          createdBy: null
        });
      }
      console.log('✅ Default units initialized');
    }
  } catch (error) {
    console.error('⚠️  Error initializing units:', error.message);
  }
}

// Initialize default data on first run
(async () => {
  try {
    await initializeDefaultCategories();
    await initializeDefaultUnits();
  } catch (error) {
    console.error('⚠️  Initialization error:', error.message);
  }
})();

// Export the Express app for Vercel serverless
module.exports = app;
