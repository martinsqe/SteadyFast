import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";

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
  console.log(`🔐 Login attempt for: ${email}`);

  const user = await User.findOne({ email }).populate("personalMechanic", "name email profileImage");
  if (!user) {
    console.log(`❌ Login failed: User not found (${email})`);
    return res.status(400).json({ message: "Invalid credentials" });
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    console.log(`❌ Login failed: Password mismatch for ${email}`);
    return res.status(400).json({ message: "Invalid credentials" });
  }

  console.log(`✅ Login successful: ${email} (${user.role})`);
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

import { sendEmail } from "../utils/emailUtils.js";

export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(200).json({ success: true, message: "If an account exists with that email, a reset link has been sent." });
    }

    const resetToken = crypto.randomBytes(20).toString("hex");
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000;

    await user.save();

    const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;

    const message = `You are receiving this email because you (or someone else) have requested the reset of the password for your account.\n\nPlease click on the following link, or paste this into your browser to complete the process within one hour of receiving it:\n\n${resetUrl}\n\nIf you did not request this, please ignore this email and your password will remain unchanged.\n`;

    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; borderRadius: 10px;">
        <h2 style="color: #2563eb; text-align: center;">SteadyFast Password Reset</h2>
        <p>You requested a password reset for your SteadyFast account. Click the button below to set a new password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Reset My Password</a>
        </div>
        <p style="font-size: 0.9rem; color: #64748b;">This link will expire in 1 hour. If you didn't request this, you can safely ignore this email.</p>
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        <p style="font-size: 0.8rem; color: #94a3b8; text-align: center;">© 2026 SteadyFast Roadside Assistance</p>
      </div>
    `;

    try {
      await sendEmail({
        email: user.email,
        subject: "SteadyFast Password Reset Request",
        message,
        html
      });

      res.json({
        success: true,
        message: "A reset link has been sent to your email address."
      });
    } catch (err) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();
      return res.status(500).json({ message: "Error sending the email. Try again later!" });
    }

  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to process request" });
  }
};

// Reset Password
export const resetPassword = async (req, res) => {
  const { token, password } = req.body;
  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid or expired reset token" });
    }

    // Hash new password
    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.json({ success: true, message: "Password updated successfully! You can now login with your new password." });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to reset password" });
  }
};

