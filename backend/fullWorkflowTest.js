import mongoose from 'mongoose';
import User from './models/User.js';
import ServiceRequest from './models/ServiceRequest.js';
import dotenv from 'dotenv';
dotenv.config();

const fullWorkflowTest = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB");

        let client = await User.findOne({ email: 'client@test.com' });
        let mechanic = await User.findOne({ email: 'mechanic@test.com' });

        if (!client) client = await User.findOne({ role: 'client' });
        if (!mechanic) mechanic = await User.findOne({ role: 'mechanic' });

        if (!client || !mechanic) {
            throw new Error("No client or mechanic found in database. Please register users first.");
        }

        console.log("👤 Client:", client.name, "| Location:", JSON.stringify(client.location));
        console.log("🔧 Mechanic:", mechanic.name, "| Location:", JSON.stringify(mechanic.location));

        // 1. Create Job
        console.log("\n1. Creating Job...");
        const job = await ServiceRequest.create({
            client: client._id,
            vehicleType: 'Test Vehicle',
            problem: 'Broken Chain',
            location: client.location,
            price: 50,
            status: 'pending'
        });
        console.log("✅ Job Created:", job._id);

        // 2. Find Available Jobs (Simulate Mechanic View)
        console.log("\n2. Searching for available jobs near mechanic...");
        const availableJobs = await ServiceRequest.find({
            status: 'pending',
            location: {
                $near: {
                    $geometry: mechanic.location,
                    $maxDistance: 20000 // 20km
                }
            }
        });

        const found = availableJobs.some(j => j._id.toString() === job._id.toString());
        if (found) {
            console.log("✅ Mechanic can see the job!");
        } else {
            console.log("❌ Mechanic CANNOT see the job. Distance might be too far or location format mismatch.");
            console.log("Mechanic Location:", JSON.stringify(mechanic.location));
            console.log("Job Location:", JSON.stringify(job.location));
        }

        // 3. Accept Job
        console.log("\n3. Accepting Job...");
        job.mechanic = mechanic._id;
        job.status = 'accepted';
        await job.save();
        console.log("✅ Job Accepted by mechanic:", mechanic.name);

        // 4. Update Status to 'on_the_way'
        console.log("\n4. Updating status to 'on_the_way'...");
        job.status = 'on_the_way';
        await job.save();
        console.log("✅ Status updated to 'on_the_way'");

        // 5. Update Status to 'arrived'
        console.log("\n5. Updating status to 'arrived'...");
        job.status = 'arrived';
        await job.save();
        console.log("✅ Status updated to 'arrived'");

        // 6. Complete Job
        console.log("\n6. Completing Job...");
        job.status = 'completed';
        job.completedAt = new Date();
        await job.save();
        console.log("✅ Job Completed!");

        await mongoose.disconnect();
    } catch (error) {
        console.error("Test failed:", error);
        process.exit(1);
    }
};

fullWorkflowTest();
