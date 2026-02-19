import mongoose from 'mongoose';
import User from './models/User.js';
import ServiceRequest from './models/ServiceRequest.js';
import dotenv from 'dotenv';
dotenv.config();

const resetData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB for fresh start");

        // 1. Clear all service requests
        const deleteResult = await ServiceRequest.deleteMany({});
        console.log(`🗑️ Deleted ${deleteResult.deletedCount} service requests.`);

        // 2. Setup Prince (Client)
        const prince = await User.findOneAndUpdate(
            { email: /prince@gmail.com/i },
            {
                role: 'client',
                location: {
                    type: 'Point',
                    coordinates: [-74.006, 40.7128] // NYC coordinates
                }
            },
            { upsert: true, new: true }
        );
        console.log("👤 Prince (Client) reset and located in NYC.");

        // 3. Setup Man Jay (Mechanic)
        const manjay = await User.findOneAndUpdate(
            { email: /manjay@gmail.com/i },
            {
                role: 'mechanic',
                isAvailable: true,
                expertiseLevel: 'Senior Mechanic & Wheel Dynamics',
                location: {
                    type: 'Point',
                    coordinates: [-74.006, 40.7128] // Same NYC coordinates
                }
            },
            { upsert: true, new: true }
        );
        console.log("🔧 Man Jay (Mechanic) reset and located in NYC.");

        // 4. Force recreate indices (just in case)
        try {
            await ServiceRequest.collection.createIndex({ location: "2dsphere" });
            await User.collection.createIndex({ location: "2dsphere" });
            console.log("📍 Geospatial indices verified.");
        } catch (e) {
            console.log("Note: Indices already exist or creation skipped.");
        }

        await mongoose.disconnect();
        console.log("\n✨ Everything is cleared! You can now start the test with a clean slate.");
    } catch (error) {
        console.error("Reset failed:", error);
        process.exit(1);
    }
};

resetData();
