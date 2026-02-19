
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import User from './models/User.js';
import axios from 'axios';

dotenv.config();

const testRequest = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const prince = await User.findOne({ email: /prince@gmail.com/i });
        if (!prince) {
            console.log("Prince not found");
            process.exit(1);
        }

        const token = jwt.sign({ id: prince._id }, process.env.JWT_SECRET, { expiresIn: "30d" });
        console.log("Generated Token for Prince");

        const payload = {
            vehicleType: "Car",
            problem: "Flat Tyre",
            details: { brand: "Toyota", model: "Camry" },
            location: { longitude: -74.006, latitude: 40.7128 },
            price: 25
        };

        const response = await axios.post("http://localhost:5000/api/services", payload, {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log("Response:", response.data);
        mongoose.disconnect();
    } catch (e) {
        console.error("Error Status:", e.response?.status);
        console.error("Error Data:", e.response?.data);
        console.error("Error Message:", e.message);
        mongoose.disconnect();
    }
};

testRequest();
