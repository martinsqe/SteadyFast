
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const find = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const p = await User.findOne({ name: /prince/i });
        const m = await User.findOne({ name: /man jay/i });

        console.log(`PRINCE_ID=${p ? p._id.toString() : 'NULL'}`);
        console.log(`MANJAY_ID=${m ? m._id.toString() : 'NULL'}`);

        mongoose.disconnect();
    } catch (e) {
        process.exit(1);
    }
};

find();
