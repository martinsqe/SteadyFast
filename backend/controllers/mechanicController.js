import User from "../models/User.js";
import ServiceRequest from "../models/ServiceRequest.js";

// Get mechanic profile
export const getMechanicProfile = async (req, res) => {
  try {
    const mechanic = await User.findById(req.user.id).select("-password");
    res.json({ success: true, data: mechanic });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update mechanic profile
export const updateMechanicProfile = async (req, res) => {
  try {
    const updates = req.body;
    const mechanic = await User.findByIdAndUpdate(
      req.user.id,
      updates,
      { new: true, runValidators: true }
    ).select("-password");

    res.json({ success: true, data: mechanic });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get mechanic's jobs (History)
export const getMechanicJobs = async (req, res) => {
  try {
    console.log(`📜 Fetching job history for mechanic: ${req.user.id}`);
    const jobs = await ServiceRequest.find({ mechanic: req.user.id })
      .populate("client", "name email phone profileImage")
      .sort({ createdAt: -1 });

    console.log(`✅ Returned ${jobs.length} history items`);
    res.json({ success: true, data: jobs });
  } catch (error) {
    console.error("🔥 Error in getMechanicJobs:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get mechanic's earnings
export const getMechanicEarnings = async (req, res) => {
  try {
    const completedJobs = await ServiceRequest.find({
      mechanic: req.user.id,
      status: "completed"
    });

    const totalEarnings = completedJobs.reduce((sum, job) => sum + job.price, 0);
    const jobCount = completedJobs.length;

    res.json({
      success: true,
      data: {
        totalEarnings,
        completedJobs: jobCount,
        averagePerJob: jobCount > 0 ? totalEarnings / jobCount : 0,
        jobs: completedJobs
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
