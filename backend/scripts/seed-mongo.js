require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../src/config/mongo');
const { User, Stock, Supplier, Customer, Bill } = require('../src/models/mongo');

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...\n');
    
    // Connect to MongoDB
    await connectDB();
    
    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await User.deleteMany({});
    await Stock.deleteMany({});
    await Supplier.deleteMany({});
    await Customer.deleteMany({});
    await Bill.deleteMany({});
    console.log('✅ Existing data cleared\n');
    
    // Create admin user
    console.log('👤 Creating admin user...');
    const adminUser = new User({
      username: 'admin',
      email: 'admin@stockms.com',
      firstName: 'Admin',
      lastName: 'User',
      password: 'admin123',
      role: 'admin',
      phone: '1234567890',
      isActive: true
    });
    await adminUser.save();
    console.log('✅ Admin user created (username: admin, password: admin123)\n');
    
    // Create suppliers
    console.log('🏢 Creating suppliers...');
    const supplier1 = new Supplier({
      name: 'Tech Wholesale Ltd',
      contactPerson: 'John Smith',
      email: 'john@techwholesale.com',
      phone: '9876543210',
      address: '123 Business Park, Tech City'
    });
    
    const supplier2 = new Supplier({
      name: 'Electronics Depot',
      contactPerson: 'Sarah Johnson',
      email: 'sarah@electronicsdepot.com',
      phone: '9876543211',
      address: '456 Industrial Area, Metro City'
    });
    
    const supplier3 = new Supplier({
      name: 'Office Supplies Co',
      contactPerson: 'Mike Brown',
      email: 'mike@officesupplies.com',
      phone: '9876543212',
      address: '789 Commerce Street, Downtown'
    });
    
    await supplier1.save();
    await supplier2.save();
    await supplier3.save();
    console.log('✅ 3 suppliers created\n');
    
    // Create stock items
    console.log('📦 Creating stock items...');
    const stock1 = new Stock({
      productCode: 'LAPTOP001',
      productName: 'Dell Laptop i5 8GB',
      category: 'Electronics',
      description: 'Dell Inspiron 15 3000 Series',
      quantity: 15,
      unit: 'pcs',
      unitPrice: 45000,
      minStock: 5,
      supplierId: supplier1._id
    });
    
    const stock2 = new Stock({
      productCode: 'MOUSE001',
      productName: 'Wireless Mouse',
      category: 'Electronics',
      description: 'Logitech M185 Wireless Mouse',
      quantity: 50,
      unit: 'pcs',
      unitPrice: 350,
      minStock: 10,
      supplierId: supplier1._id
    });
    
    const stock3 = new Stock({
      productCode: 'KEYBOARD001',
      productName: 'USB Keyboard',
      category: 'Electronics',
      description: 'Dell Wired Keyboard',
      quantity: 30,
      unit: 'pcs',
      unitPrice: 500,
      minStock: 10,
      supplierId: supplier2._id
    });
    
    const stock4 = new Stock({
      productCode: 'MONITOR001',
      productName: 'LED Monitor 24"',
      category: 'Electronics',
      description: 'Samsung 24" Full HD Monitor',
      quantity: 8,
      unit: 'pcs',
      unitPrice: 12000,
      minStock: 5,
      supplierId: supplier2._id
    });
    
    const stock5 = new Stock({
      productCode: 'CHAIR001',
      productName: 'Office Chair',
      category: 'Furniture',
      description: 'Ergonomic Office Chair with Lumbar Support',
      quantity: 3,
      unit: 'pcs',
      unitPrice: 7500,
      minStock: 5,
      supplierId: supplier3._id
    });
    
    await stock1.save();
    await stock2.save();
    await stock3.save();
    await stock4.save();
    await stock5.save();
    console.log('✅ 5 stock items created\n');
    
    // Create customers
    console.log('👥 Creating customers...');
    const customer1 = new Customer({
      name: 'Rajesh Kumar',
      email: 'rajesh@example.com',
      phone: '9123456789',
      address: '12 MG Road, Bangalore',
      customerType: 'Regular'
    });
    
    const customer2 = new Customer({
      name: 'Priya Sharma',
      email: 'priya@example.com',
      phone: '9123456790',
      address: '34 Park Street, Delhi',
      customerType: 'Premium'
    });
    
    const customer3 = new Customer({
      name: 'Amit Patel',
      email: 'amit@example.com',
      phone: '9123456791',
      address: '56 Commercial Road, Mumbai',
      customerType: 'Regular'
    });
    
    await customer1.save();
    await customer2.save();
    await customer3.save();
    console.log('✅ 3 customers created\n');
    
    // Create sample bills
    console.log('📋 Creating sample bills...');
    const bill1 = new Bill({
      billNumber: 'BILL-001',
      customerId: customer1._id,
      customerName: customer1.name,
      items: [
        {
          stockId: stock2._id,
          productName: stock2.productName,
          quantity: 2,
          unitPrice: stock2.unitPrice,
          total: stock2.unitPrice * 2
        },
        {
          stockId: stock3._id,
          productName: stock3.productName,
          quantity: 1,
          unitPrice: stock3.unitPrice,
          total: stock3.unitPrice * 1
        }
      ],
      subtotal: (stock2.unitPrice * 2) + (stock3.unitPrice * 1),
      discount: 0,
      tax: 0,
      totalAmount: (stock2.unitPrice * 2) + (stock3.unitPrice * 1),
      status: 'paid',
      notes: 'Sample bill 1',
      createdBy: adminUser._id,
      billDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
    });
    
    const bill2 = new Bill({
      billNumber: 'BILL-002',
      customerId: customer2._id,
      customerName: customer2.name,
      items: [
        {
          stockId: stock1._id,
          productName: stock1.productName,
          quantity: 1,
          unitPrice: stock1.unitPrice,
          total: stock1.unitPrice * 1
        }
      ],
      subtotal: stock1.unitPrice,
      discount: 500,
      tax: 0,
      totalAmount: stock1.unitPrice - 500,
      status: 'paid',
      notes: 'Sample bill 2',
      createdBy: adminUser._id,
      billDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 day ago
    });
    
    await bill1.save();
    await bill2.save();
    
    // Update stock quantities
    stock2.quantity -= 2;
    stock3.quantity -= 1;
    stock1.quantity -= 1;
    await stock2.save();
    await stock3.save();
    await stock1.save();
    
    console.log('✅ 2 sample bills created\n');
    
    // Summary
    console.log('📊 Database Seeding Complete!\n');
    console.log('═══════════════════════════════════════');
    console.log('✅ Admin User: admin / admin123');
    console.log('✅ Suppliers: 3');
    console.log('✅ Products: 5');
    console.log('✅ Customers: 3');
    console.log('✅ Bills: 2');
    console.log('═══════════════════════════════════════\n');
    console.log('🎉 You can now login with:');
    console.log('   Username: admin');
    console.log('   Password: admin123\n');
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
