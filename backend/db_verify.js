import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

async function checkToken() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const user = await User.findOne({ email: 'test@example.com' });
        if (user) {
            console.log('User found:', user.email);
            console.log('Reset Token:', user.resetPasswordToken);
            console.log('Expires:', user.resetPasswordExpires);
        } else {
            console.log('User not found');
        }

        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
}

checkToken();
