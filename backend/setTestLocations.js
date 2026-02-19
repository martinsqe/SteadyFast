import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

async function setTestLocations() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Test location: New York City coordinates
    const testLocation = {
      type: 'Point',
      coordinates: [-73.935242, 40.730610]  // [longitude, latitude]
    };

    // Update ALL mechanics to test location
    const mechanicsUpdate = await User.updateMany(
      { role: 'mechanic' },
      { $set: { location: testLocation } }
    );

    console.log(`\n✅ Updated ${mechanicsUpdate.modifiedCount} mechanics to test location`);

    // Update ALL clients to test location
    const clientsUpdate = await User.updateMany(
      { role: 'client' },
      { $set: { location: testLocation } }
    );

    console.log(`✅ Updated ${clientsUpdate.modifiedCount} clients to test location`);

    // Show all mechanics
    const mechanics = await User.find({ role: 'mechanic' });
    console.log('\n=== MECHANICS ===');
    mechanics.forEach(m => {
      console.log(`${m.name} (${m.email})`);
      console.log(`  Location: [${m.location.coordinates[0]}, ${m.location.coordinates[1]}]`);
    });

    // Show all clients
    const clients = await User.find({ role: 'client' });
    console.log('\n=== CLIENTS ===');
    clients.forEach(c => {
      console.log(`${c.name} (${c.email})`);
      console.log(`  Location: [${c.location.coordinates[0]}, ${c.location.coordinates[1]}]`);
    });

    console.log('\n✅ All users now have the same test location!');
    console.log('📍 Location: New York City (40.730610, -73.935242)');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

setTestLocations();