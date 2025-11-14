require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('../src/config/mongo');
const { User } = require('../src/models/mongo');

async function checkAdmin() {
  try {
    await connectDB();
    
    const admin = await User.findOne({ username: 'admin' });
    
    if (!admin) {
      console.log('❌ No admin user found!');
      console.log('Run: npm run seed:admin');
      process.exit(1);
    }
    
    console.log('✅ Admin user found:');
    console.log('   Username:', admin.username);
    console.log('   Email:', admin.email);
    console.log('   Role:', admin.role);
    console.log('   IsActive:', admin.isActive);
    console.log('   Password hash exists:', !!admin.password);
    
    // Test password
    const isValid = await bcrypt.compare('admin123', admin.password);
    console.log('\n🔑 Password Test:');
    console.log('   Testing "admin123":', isValid ? '✅ CORRECT' : '❌ WRONG');
    
    if (!isValid) {
      console.log('\n⚠️  Password mismatch! Recreating admin user...');
      await User.deleteOne({ username: 'admin' });
      
      // Password will be hashed by pre-save hook
      await User.create({
        username: 'admin',
        email: 'admin@stockms.com',
        password: 'admin123', // Plain password - will be hashed by model
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin',
        isActive: true
      });
      
      console.log('✅ Admin user recreated successfully!');
    }
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkAdmin();
