import VehicleType from "../models/VehicleType.js";
import fs from "fs";
import path from "path";

// Public — active vehicle types only
export const getPublicVehicleTypes = async (req, res) => {
  try {
    const types = await VehicleType.find({ isActive: true }).sort({ order: 1, createdAt: 1 });
    res.json({ success: true, vehicleTypes: types });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Admin — all vehicle types
export const getAllVehicleTypes = async (req, res) => {
  try {
    const types = await VehicleType.find().sort({ order: 1, createdAt: 1 });
    res.json({ success: true, vehicleTypes: types });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Admin — create
export const createVehicleType = async (req, res) => {
  try {
    const { name, problems, details, isActive, order } = req.body;

    const iconPath = req.file ? `/uploads/vehicle-icons/${req.file.filename}` : "";

    const vt = await VehicleType.create({
      name,
      iconPath,
      problems: problems ? JSON.parse(problems) : [],
      details: details ? { energyTypes: JSON.parse(details) } : { energyTypes: [] },
      isActive: isActive !== undefined ? isActive === "true" || isActive === true : true,
      order: order ? Number(order) : 0
    });

    res.status(201).json({ success: true, vehicleType: vt });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Admin — update
export const updateVehicleType = async (req, res) => {
  try {
    const vt = await VehicleType.findById(req.params.id);
    if (!vt) return res.status(404).json({ success: false, message: "Not found" });

    const { name, problems, details, isActive, order } = req.body;

    if (name) vt.name = name;
    if (problems !== undefined) vt.problems = JSON.parse(problems);
    if (details !== undefined) vt.details = { energyTypes: JSON.parse(details) };
    if (isActive !== undefined) vt.isActive = isActive === "true" || isActive === true;
    if (order !== undefined) vt.order = Number(order);

    if (req.file) {
      if (vt.iconPath && vt.iconPath.startsWith("/uploads/")) {
        const old = path.join(process.cwd(), vt.iconPath);
        if (fs.existsSync(old)) fs.unlinkSync(old);
      }
      vt.iconPath = `/uploads/vehicle-icons/${req.file.filename}`;
    }

    await vt.save();
    res.json({ success: true, vehicleType: vt });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Admin — delete
export const deleteVehicleType = async (req, res) => {
  try {
    const vt = await VehicleType.findById(req.params.id);
    if (!vt) return res.status(404).json({ success: false, message: "Not found" });

    if (vt.iconPath && vt.iconPath.startsWith("/uploads/")) {
      const old = path.join(process.cwd(), vt.iconPath);
      if (fs.existsSync(old)) fs.unlinkSync(old);
    }

    await vt.deleteOne();
    res.json({ success: true, message: "Deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
