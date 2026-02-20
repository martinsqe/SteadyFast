import mongoose from 'mongoose';
import User from './models/User.js';
import ServiceRequest from './models/ServiceRequest.js';
import dotenv from 'dotenv';
dotenv.config();

const testJobFinding = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB");

        const mechanic = await User.findOne({ email: 'mechanic@test.com' });
        console.log("🔧 Mechanic:", mechanic.name, "| Location:", JSON.stringify(mechanic.location));

        // Create a dummy job if none exist
        let job = await ServiceRequest.findOne({ status: 'pending' });
        if (!job) {
            console.log("📝 No pending jobs found, creating one at mechanic's location...");
            job = await ServiceRequest.create({
                client: (await User.findOne({ role: 'client' }))._id,
                vehicleType: 'Car',
                problem: 'Test Problem',
                location: mechanic.location,
                price: 100,
                status: 'pending'
            });
        }
        console.log("📋 Job found/created:", job._id, "| Location:", JSON.stringify(job.location));

        const availableJobs = await ServiceRequest.find({
            status: 'pending',
            location: {
                $near: {
                    $geometry: mechanic.location,
                    $maxDistance: 20000 // 20km
                }
            }
        });

        console.log(`✅ Success! Found ${availableJobs.length} jobs within 20km of the mechanic.`);

        await mongoose.disconnect();
    } catch (error) {
        console.error("Test failed:", error);
        process.exit(1);
    }
};

testJobFinding();
