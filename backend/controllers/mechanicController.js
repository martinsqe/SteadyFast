import User from "../models/User.js";
import ServiceRequest from "../models/ServiceRequest.js";
import Review from "../models/Review.js";

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

// Get reviews for the logged-in mechanic
export const getMyReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ mechanic: req.user.id })
      .populate("client", "name email profileImage")
      .populate("job", "vehicleType problem createdAt")
      .sort({ createdAt: -1 });

    const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
    const averageRating = reviews.length > 0 ? (totalRating / reviews.length).toFixed(1) : 0;

    res.json({
      success: true,
      averageRating: Number(averageRating),
      totalReviews: reviews.length,
      reviews
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get clients who hired this mechanic (personalMechanic) or completed a job with them
export const getMyClients = async (req, res) => {
  try {
    // Clients who explicitly hired this mechanic as personalMechanic
    const directClients = await User.find({
      role: "client",
      personalMechanic: req.user.id
    }).select("name email phone address profileImage createdAt");

    // Clients who had a completed or accepted job with this mechanic
    const jobClients = await ServiceRequest.find({ mechanic: req.user.id })
      .populate("client", "name email phone address profileImage createdAt")
      .select("client status createdAt vehicleType problem");

    // Merge and deduplicate by client _id
    const seen = new Set();
    const merged = [];

    for (const c of directClients) {
      if (!seen.has(c._id.toString())) {
        seen.add(c._id.toString());
        merged.push({ client: c, source: "hired", jobs: [] });
      }
    }

    for (const job of jobClients) {
      if (!job.client) continue;
      const id = job.client._id.toString();
      const existing = merged.find(m => m.client._id.toString() === id);
      if (existing) {
        existing.jobs.push({ _id: job._id, status: job.status, vehicleType: job.vehicleType, problem: job.problem, createdAt: job.createdAt });
      } else {
        seen.add(id);
        merged.push({
          client: job.client,
          source: "job",
          jobs: [{ _id: job._id, status: job.status, vehicleType: job.vehicleType, problem: job.problem, createdAt: job.createdAt }]
        });
      }
    }

    res.json({ success: true, total: merged.length, clients: merged });
  } catch (error) {
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
