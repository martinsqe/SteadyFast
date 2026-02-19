
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const setupDemo = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        // Prince (Client)
        const princeId = new mongoose.Types.ObjectId("698d5c77f552958522f24b87");
        // Man Jay (Mechanic)
        const manJayId = new mongoose.Types.ObjectId("69899fe8ddb54630a66085aed");

        const nycLocation = {
            type: 'Point',
            coordinates: [-74.006, 40.7128] // [longitude, latitude]
        };

        await User.findByIdAndUpdate(princeId, {
            location: nycLocation,
            role: 'client'
        });
        console.log('Updated Prince location');

        await User.findByIdAndUpdate(manJayId, {
            location: nycLocation,
            role: 'mechanic'
        });
        console.log('Updated Man Jay location');

        mongoose.disconnect();
    } catch (e) {
        console.error(e);
    }
};

setupDemo();
