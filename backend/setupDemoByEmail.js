
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const setupDemo = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        const nycLocation = {
            type: 'Point',
            coordinates: [-74.006, 40.7128]
        };

        const prince = await User.findOneAndUpdate(
            { email: /prince@gmail.com/i },
            { location: nycLocation, role: 'client' },
            { new: true }
        );
        console.log('Updated Prince:', prince ? prince.name : 'Not found');

        const manjay = await User.findOneAndUpdate(
            { email: /manjay@gmail.com/i },
            { location: nycLocation, role: 'mechanic' },
            { new: true }
        );
        console.log('Updated Man Jay:', manjay ? manjay.name : 'Not found');

        mongoose.disconnect();
    } catch (e) {
        console.error(e);
    }
};

setupDemo();
