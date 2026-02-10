import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
    {
        client: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        mechanic: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        vehicle: {
            make: { type: String, required: true },
            model: { type: String, required: true },
            year: { type: String, required: true },
            licensePlate: { type: String },
        },
        serviceType: {
            type: String,
            required: true,
            enum: ["Repair", "Maintenance", "Inspection", "Emergency"],
        },
        status: {
            type: String,
            enum: ["Pending", "In Progress", "Completed", "Cancelled"],
            default: "Pending",
        },
        cost: {
            type: Number,
            default: 0,
        },
        description: {
            type: String,
        },
        dateDisplay: { // For manual date entry if needed, otherwise uses createdAt
            type: Date
        }
    },
    { timestamps: true }
);

export default mongoose.model("Job", jobSchema);
