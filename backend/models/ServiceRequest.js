import mongoose from "mongoose";

const serviceRequestSchema = new mongoose.Schema(
  {
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    mechanic: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },

    vehicleType: { type: String, required: true },
    problem: { type: String, required: true },

    details: {
      brand: String,
      model: String,
      energyType: String,
      tyreOption: String,
      tyreSize: String,
      tyreType: String
    },

    location: {
      type: {
        type: String,
        enum: ['Point']
      },
      coordinates: {
        type: [Number]
      }
    },

    price: { type: Number, required: true },

    platformFee: { type: Number, default: 1 },
    platformFeeStatus: { type: String, enum: ["paid", "pending"], default: "pending" },
    platformFeeMethod: { type: String, enum: ["card", "cash", "mpesa", "upi"], default: "card" },
    platformFeePaidAt: { type: Date, default: null },

    paymentIntentId: { type: String, default: null },
    paymentProvider: { type: String, enum: ["stripe", "mpesa", "razorpay", "cash", null], default: null },

    status: {
      type: String,
      enum: ["payment_pending", "pending", "accepted", "on_the_way", "arrived", "completed", "cancelled"],
      default: "payment_pending"
    },

    acceptedAt: Date,
    arrivedAt: Date,
    completedAt: Date,
    paymentStatus: {
      type: String,
      enum: ["pending", "paid"],
      default: "pending"
    },
    paymentMethod: {
      type: String,
      enum: ["card", "cash", "mpesa"],
      default: "card"
    }
  },
  { timestamps: true }
);

// Geospatial index for location-based queries
serviceRequestSchema.index({ location: '2dsphere' });

export default mongoose.model("ServiceRequest", serviceRequestSchema);