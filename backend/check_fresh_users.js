import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

async function checkFreshUsers() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const emails = ['fresh_client@test.com', 'fresh_mechanic@test.com'];

        for (const email of emails) {
            const user = await User.findOne({ email });
            if (user) {
                console.log(`\nUser: ${user.email} [${user.role}]`);
                console.log(`Token: ${user.resetPasswordToken ? 'PRESENT' : 'MISSING'}`);
                console.log(`Expires: ${user.resetPasswordExpires}`);
            } else {
                console.log(`\nUser not found: ${email}`);
            }
        }

        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
}

checkFreshUsers();
