
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const find = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const p = await User.findOne({ name: /prince/i });
        const m = await User.findOne({ name: /man jay/i });

        const result = {
            prince: p ? { id: p._id, role: p.role, email: p.email } : 'Not found',
            manJay: m ? { id: m._id, role: m.role, email: m.email } : 'Not found'
        };

        console.log(JSON.stringify(result, null, 2));
        mongoose.disconnect();
    } catch (e) {
        console.error(e);
    }
};

find();
