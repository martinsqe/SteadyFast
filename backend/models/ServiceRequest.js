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
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true
      }
    },

    price: { type: Number, required: true },

    status: {
      type: String,
      enum: ["pending", "accepted", "on_the_way", "arrived", "completed", "cancelled"],
      default: "pending"
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