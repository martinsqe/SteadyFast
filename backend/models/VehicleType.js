import mongoose from "mongoose";

const subOptionSchema = new mongoose.Schema({
  label: { type: String, required: true },
  price: { type: Number, required: true, default: 0 }
}, { _id: false });

const problemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true, default: 0 },
  hasSubOptions: { type: Boolean, default: false },
  subOptions: [subOptionSchema]
}, { _id: false });

const brandSchema = new mongoose.Schema({
  name: { type: String, required: true },
  models: [String]
}, { _id: false });

const energyTypeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  brands: [brandSchema]
}, { _id: false });

const vehicleTypeSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  iconPath: { type: String, default: "" },
  problems: [problemSchema],
  details: {
    energyTypes: [energyTypeSchema]
  },
  isActive: { type: Boolean, default: true },
  order: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.model("VehicleType", vehicleTypeSchema);
