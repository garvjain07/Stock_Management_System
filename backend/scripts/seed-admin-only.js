require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('../src/config/mongo');
const { User } = require('../src/models/mongo');

async function seedAdminOnly() {
  try {
    console.log('🌱 Seeding admin user...\n');
    
    // Connect to MongoDB
    await connectDB();
    
    // Check if admin already exists
    const existingAdmin = await User.findOne({ username: 'admin' });
    if (existingAdmin) {
      console.log('⚠️  Admin user already exists!');
      console.log('📧 Username: admin');
      console.log('🔑 Password: admin123\n');
      process.exit(0);
    }
    
    // Create admin user (password will be hashed by pre-save hook)
    const admin = await User.create({
      username: 'admin',
      email: 'admin@stockms.com',
      password: 'admin123', // Plain password - will be hashed by model
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      isActive: true
    });
    
    console.log('✅ Admin user created successfully!\n');
    console.log('📋 Login Credentials:');
    console.log('   Username: admin');
    console.log('   Password: admin123\n');
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error seeding admin user:', error);
    process.exit(1);
  }
}

seedAdminOnly();
