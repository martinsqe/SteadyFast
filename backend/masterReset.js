import mongoose from 'mongoose';
import User from './models/User.js';
import ServiceRequest from './models/ServiceRequest.js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config();

const masterReset = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB for Master Reset");

        // 1. Clear Data
        await ServiceRequest.deleteMany({});
        await User.deleteMany({});
        console.log("🗑️ Database cleared.");

        const hashedPassword = await bcrypt.hash('password123', 10);
        const adminPassword = await bcrypt.hash('admin123', 10);

        // 2. Create Admin
        await User.create({
            name: 'System Admin',
            email: 'admin@steadyfast.com',
            password: adminPassword,
            role: 'admin',
            phone: '1234567890',
            address: 'Silicon Valley, CA'
        });
        console.log("👨‍💼 Admin created: admin@steadyfast.com / admin123");

        // 3. Create Client
        await User.create({
            name: 'John Client',
            email: 'client@test.com',
            password: hashedPassword,
            role: 'client',
            phone: '9876543210',
            address: 'New York, NY',
            location: { type: 'Point', coordinates: [-74.006, 40.7128] }
        });
        console.log("👤 Client created: client@test.com / password123");

        // 4. Create Mechanic
        await User.create({
            name: 'Mike Mechanic',
            email: 'mechanic@test.com',
            password: hashedPassword,
            role: 'mechanic',
            phone: '5551234567',
            address: 'Brooklyn, NY',
            expertiseLevel: 'Expert',
            location: { type: 'Point', coordinates: [-73.9442, 40.6782] }
        });
        console.log("🔧 Mechanic created: mechanic@test.com / password123");

        await mongoose.disconnect();
        console.log("\n✨ Master reset complete. Database is now in a clean, working state.");
    } catch (error) {
        console.error("Master reset failed:", error);
        process.exit(1);
    }
};

masterReset();
