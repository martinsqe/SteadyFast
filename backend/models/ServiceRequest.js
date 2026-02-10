import mongoose from "mongoose";

const serviceRequestSchema = new mongoose.Schema(
    {
        client: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        mechanic: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },
        vehicleType: { type: String, required: true },
        problem: { type: String, required: true },
        details: {
            brand: String,
            model: String,
            energyType: String,
            tyreOption: String,
            tyreSize: String,
            tyreType: String,
        },
        price: { type: Number, required: true },
        status: {
            type: String,
            enum: ["pending", "accepted", "completed", "cancelled"],
            default: "pending",
        },
    },
    { timestamps: true }
);

export default mongoose.model("ServiceRequest", serviceRequestSchema);
