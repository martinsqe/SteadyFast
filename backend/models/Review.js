import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
    {
        mechanic: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        client: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        job: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Job",
            required: true,
        },
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5,
        },
        comment: {
            type: String,
            required: true,
        },
    },
    { timestamps: true }
);

export default mongoose.model("Review", reviewSchema);
