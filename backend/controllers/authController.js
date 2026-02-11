import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

// Register
export const registerUser = async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password || !role)
    return res.status(400).json({ message: "All fields required" });

  const userExists = await User.findOne({ email });
  if (userExists) return res.status(400).json({ message: "User already exists" });

  const hashed = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email,
    password: hashed,
    role,
  });

  res.status(201).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    address: user.address,
    dateOfBirth: user.dateOfBirth,
    expertiseLevel: user.expertiseLevel,
    profileImage: user.profileImage,
    role: user.role,
    token: generateToken(user._id),
  });
};

// Login
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).populate("personalMechanic", "name email profileImage");
  if (!user) return res.status(400).json({ message: "Invalid credentials" });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(400).json({ message: "Invalid credentials" });

  res.json({
    _id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    address: user.address,
    dateOfBirth: user.dateOfBirth,
    expertiseLevel: user.expertiseLevel,
    profileImage: user.profileImage,
    role: user.role,
    personalMechanic: user.personalMechanic,
    token: generateToken(user._id),
  });
};

// Get All Users (Admin only)
export const getAllUsers = async (req, res) => {
  try {
    const { role } = req.query; // Optional role filter

    const filter = role ? { role } : {};
    const users = await User.find(filter)
      .select("-password")
      .populate("personalMechanic", "name email profileImage")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch users",
      error: error.message
    });
  }
};

// Update Profile
export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      user.phone = req.body.phone || user.phone;
      user.address = req.body.address || user.address;
      user.dateOfBirth = req.body.dateOfBirth || user.dateOfBirth;
      user.expertiseLevel = req.body.expertiseLevel || user.expertiseLevel;

      if (req.body.password) {
        user.password = await bcrypt.hash(req.body.password, 10);
      }

      if (req.file) {
        // Construct standard URL path for the uploaded file
        // Windows paths use backslashes, but URLs need forward slashes
        const filename = req.file.filename;
        user.profileImage = `/uploads/${filename}`;
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        address: updatedUser.address,
        dateOfBirth: updatedUser.dateOfBirth,
        expertiseLevel: updatedUser.expertiseLevel,
        profileImage: updatedUser.profileImage, // return the URL path
        role: updatedUser.role,
        token: generateToken(updatedUser._id),
      });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Update failed", error: error.message });
  }
};
// Get all mechanics (Client/Admin access)
export const getMechanics = async (req, res) => {
  try {
    const mechanics = await User.find({ role: "mechanic" })
      .select("-password")
      .sort({ name: 1 });

    res.json({
      success: true,
      count: mechanics.length,
      mechanics,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Assign Personal Mechanic
export const assignMechanic = async (req, res) => {
  try {
    const { mechanicId } = req.body;
    const client = await User.findById(req.user._id);

    if (!client || client.role !== "client") {
      return res.status(403).json({ message: "Only clients can assign mechanics" });
    }

    const mechanic = await User.findById(mechanicId);
    if (!mechanic || mechanic.role !== "mechanic") {
      return res.status(404).json({ message: "Mechanic not found" });
    }

    client.personalMechanic = mechanicId;
    await client.save();

    res.json({
      success: true,
      message: `Mechanic ${mechanic.name} assigned successfully`,
      personalMechanic: {
        _id: mechanic._id,
        name: mechanic.name,
        email: mechanic.email,
        profileImage: mechanic.profileImage
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
// Admin: Update any user
export const adminUpdateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update fields if provided
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.role = req.body.role || user.role;
    user.phone = req.body.phone || user.phone;
    user.address = req.body.address || user.address;
    user.expertiseLevel = req.body.expertiseLevel || user.expertiseLevel;

    if (req.body.password) {
      user.password = await bcrypt.hash(req.body.password, 10);
    }

    const updatedUser = await user.save();

    res.json({
      success: true,
      message: "User updated successfully",
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        phone: updatedUser.phone,
        address: updatedUser.address,
        expertiseLevel: updatedUser.expertiseLevel,
        profileImage: updatedUser.profileImage
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin: Delete user
export const adminDeleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      success: true,
      message: "User deleted successfully"
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin: Get User Statistics
export const getUserStats = async (req, res) => {
  try {
    const total = await User.countDocuments();
    const clients = await User.countDocuments({ role: "client" });
    const mechanics = await User.countDocuments({ role: "mechanic" });
    const admins = await User.countDocuments({ role: "admin" });
    res.json({
      success: true,
      stats: {
        total,
        clients,
        mechanics,
        admins
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

