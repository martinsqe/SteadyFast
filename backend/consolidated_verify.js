import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import User from './models/User.js';

dotenv.config();

async function verifyAll() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const email = 'verify@example.com';

        // 1. Ensure user exists
        let user = await User.findOne({ email });
        if (!user) {
            const password = await bcrypt.hash('password123', 10);
            user = await User.create({
                name: 'Verify User',
                email,
                password,
                role: 'client'
            });
            console.log('Test user created');
        } else {
            console.log('User exists');
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;
            await user.save();
        }

        // 2. Simulate forgotPassword logic (Controller logic test)
        console.log('--- Simulating Forgot Password Logic ---');
        const resetToken = crypto.randomBytes(20).toString("hex");
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = Date.now() + 3600000;
        await user.save();
        console.log('Token saved:', resetToken);

        // 3. Verify in DB
        const updatedUser = await User.findOne({ email });
        if (updatedUser.resetPasswordToken === resetToken) {
            console.log('✅ Token verification in DB: SUCCESS');
        } else {
            console.log('❌ Token verification in DB: FAILED');
        }

        // 4. Simulate resetPassword logic
        console.log('--- Simulating Reset Password Logic ---');
        const foundUser = await User.findOne({
            resetPasswordToken: resetToken,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (foundUser) {
            console.log('User found with token');
            const newPass = await bcrypt.hash('newpassword456', 10);
            foundUser.password = newPass;
            foundUser.resetPasswordToken = undefined;
            foundUser.resetPasswordExpires = undefined;
            await foundUser.save();
            console.log('✅ Password Reset: SUCCESS');
        } else {
            console.log('❌ Password Reset: FAILED (User not found with token)');
        }

        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
}

verifyAll();
