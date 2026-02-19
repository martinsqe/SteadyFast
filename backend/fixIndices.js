import mongoose from 'mongoose';
import User from './models/User.js';
import ServiceRequest from './models/ServiceRequest.js';
import dotenv from 'dotenv';
dotenv.config();

const fixIndices = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB for index fix");

        // Force index creation for ServiceRequest
        try {
            await ServiceRequest.collection.dropIndex("location_2dsphere");
            console.log("Dropped old ServiceRequest index");
        } catch (e) { }
        await ServiceRequest.collection.createIndex({ location: "2dsphere" });
        console.log("Created 2dsphere index on ServiceRequest.location");

        // Force index creation for User (Mechanics)
        try {
            await User.collection.dropIndex("location_2dsphere");
            console.log("Dropped old User index");
        } catch (e) { }
        await User.collection.createIndex({ location: "2dsphere" });
        console.log("Created 2dsphere index on User.location");

        // Check a sample query
        const manjay = await User.findOne({ email: /manjay/i });
        if (manjay && manjay.location) {
            console.log(`Man Jay Location: ${JSON.stringify(manjay.location)}`);
            const jobs = await ServiceRequest.find({
                status: 'pending',
                location: {
                    $near: {
                        $geometry: manjay.location,
                        $maxDistance: 50000 // 50km for testing
                    }
                }
            });
            console.log(`Manual Query Result: Found ${jobs.length} pending jobs within 50km of Man Jay`);
        } else {
            console.log("Man Jay or his location not found!");
        }

        await mongoose.disconnect();
        console.log("Finished index fix");
    } catch (error) {
        console.error("Index fix failed:", error);
        process.exit(1);
    }
};

fixIndices();
