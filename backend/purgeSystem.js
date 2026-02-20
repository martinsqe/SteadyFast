import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const purgeSystem = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB");

        // Use native collections to avoid model dependency issues during purge
        const collections = ['servicerequests', 'reports', 'reviews'];

        for (const colName of collections) {
            const result = await mongoose.connection.db.collection(colName).deleteMany({});
            console.log(`🗑️ Purged ${result.deletedCount} items from ${colName}`);
        }

        console.log("✅ System purged! Starting from zero.");
        await mongoose.disconnect();
    } catch (error) {
        console.error("Purge failed:", error);
        process.exit(1);
    }
};

purgeSystem();
