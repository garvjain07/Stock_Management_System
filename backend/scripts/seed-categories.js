require('dotenv').config();
const mongoose = require('mongoose');
const Category = require('../src/models/mongo/Category');
const config = require('../src/config/mongo');

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

async function seedDefaultCategories() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(config.mongoURI);
    console.log('✅ Connected to MongoDB');

    console.log('📂 Seeding default categories...');
    
    for (const categoryName of defaultCategories) {
      const existingCategory = await Category.findOne({ name: categoryName });
      
      if (!existingCategory) {
        await Category.create({
          name: categoryName,
          type: 'default',
          createdBy: null
        });
        console.log(`✅ Created category: ${categoryName}`);
      } else {
        console.log(`⏭️  Category already exists: ${categoryName}`);
      }
    }

    console.log('✅ Default categories seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding categories:', error);
    process.exit(1);
  }
}

seedDefaultCategories();
