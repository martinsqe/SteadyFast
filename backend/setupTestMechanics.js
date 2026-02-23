
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from './models/User.js';

dotenv.config();

const mechanics = [
    {
        name: 'Acram',
        email: 'acram@steadyfast.com',
        password: 'mechanic123',
        phone: '0700000001',
        address: 'Nairobi, Kenya',
        expertiseLevel: 'Engine Expert',
        // Nairobi CBD coordinates
        location: { type: 'Point', coordinates: [36.8219, -1.2921] }
    },
    {
        name: 'Manjay',
        email: 'manjay@steadyfast.com',
        password: 'mechanic123',
        phone: '0700000002',
        address: 'Westlands, Nairobi',
        expertiseLevel: 'Suspension & Wheel Dynamics',
        // Westlands, Nairobi
        location: { type: 'Point', coordinates: [36.8091, -1.2673] }
    }
];

const setupTestMechanics = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ MongoDB Connected');

        for (const m of mechanics) {
            const hashedPassword = await bcrypt.hash(m.password, 10);
            let existing = await User.findOne({ email: m.email });

            if (existing) {
                // Update existing record to ensure correct role and location
                existing.role = 'mechanic';
                existing.location = m.location;
                existing.expertiseLevel = m.expertiseLevel;
                existing.password = hashedPassword;
                existing.phone = m.phone;
                existing.address = m.address;
                await existing.save();
                console.log(`🔄 Updated mechanic: ${m.name} (${m.email})`);
            } else {
                await User.create({
                    name: m.name,
                    email: m.email,
                    password: hashedPassword,
                    role: 'mechanic',
                    phone: m.phone,
                    address: m.address,
                    expertiseLevel: m.expertiseLevel,
                    location: m.location,
                    isAvailable: true
                });
                console.log(`🔧 Created mechanic: ${m.name} (${m.email})`);
            }

            console.log(`   📍 Location: [${m.location.coordinates}]`);
            console.log(`   🔑 Login: ${m.email} / ${m.password}`);
        }

        console.log('\n✅ Test mechanics ready!');
        console.log('-----------------------------------');
        console.log('Acram   → acram@steadyfast.com   / mechanic123');
        console.log('Manjay  → manjay@steadyfast.com  / mechanic123');
        console.log('-----------------------------------');

        await mongoose.disconnect();
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
};

setupTestMechanics();
