import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["admin", "client", "mechanic"],
      default: "client",
    },
    profileImage: { type: String, default: "" },
    phone: { type: String, default: "" },
    address: { type: String, default: "" },
    dateOfBirth: { type: Date },
    
    // Location for mechanics and clients
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [0, 0]
      }
    },
    
    expertiseLevel: {
      type: String,
      enum: [
        "Engine Expert",
        "Lights and Electrician Expert",
        "Drivetrain & Power Delivery",
        "Transmission & Gearbox Expertise",
        "Hybrid & Electric Propulsion Systems",
        "Suspension & Wheel Dynamics",
        "Beginner",
        "Intermediate",
        "Expert",
        "Master"
      ],
      default: "Beginner"
    },
    
    personalMechanic: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    
    // Mechanic availability status
    isAvailable: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

// Geospatial index for location-based queries
userSchema.index({ location: '2dsphere' });

export default mongoose.model("User", userSchema);