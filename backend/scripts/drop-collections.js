require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../src/config/mongo');

async function dropCollections() {
  try {
    await connectDB();
    
    console.log('🗑️  Dropping all collections...');
    
    const collections = await mongoose.connection.db.listCollections().toArray();
    
    for (const collection of collections) {
      await mongoose.connection.db.dropCollection(collection.name);
      console.log(`✅ Dropped ${collection.name}`);
    }
    
    console.log('✅ All collections dropped successfully\n');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error dropping collections:', error);
    process.exit(1);
  }
}

dropCollections();
