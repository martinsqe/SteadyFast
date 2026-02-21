import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from './models/User.js';

dotenv.config();

async function createTestUser() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const email = 'test@example.com';
        const existing = await User.findOne({ email });
        if (existing) {
            console.log('User already exists');
        } else {
            const password = await bcrypt.hash('password123', 10);
            await User.create({
                name: 'Test User',
                email,
                password,
                role: 'client'
            });
            console.log('Test user created');
        }

        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
}

createTestUser();
