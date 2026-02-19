import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

async function checkIndexes() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const indexes = await User.collection.getIndexes();
    console.log('\n=== USER COLLECTION INDEXES ===');
    console.log(JSON.stringify(indexes, null, 2));

    const hasLocationIndex = Object.keys(indexes).some(key => key.includes('location'));
    
    if (!hasLocationIndex) {
      console.log('\n⚠️  Location index missing! Creating it now...');
      await User.collection.createIndex({ location: '2dsphere' });
      console.log('✅ Location index created!');
    } else {
      console.log('\n✅ Location index exists!');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkIndexes();