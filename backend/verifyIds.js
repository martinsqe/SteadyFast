
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const find = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const p = await User.findOne({ name: /prince/i });
        const m = await User.findOne({ name: /man jay/i });

        if (p) console.log(`Prince ID: ${p._id}, Length: ${p._id.toString().length}`);
        if (m) console.log(`Man Jay ID: ${m._id}, Length: ${m._id.toString().length}`);

        mongoose.disconnect();
    } catch (e) {
        console.error(e);
    }
};

find();
