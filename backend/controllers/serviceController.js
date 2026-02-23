import ServiceRequest from "../models/ServiceRequest.js";
import User from "../models/User.js";
import mongoose from "mongoose";

// Create a new service request
export const createServiceRequest = async (req, res) => {
  try {
    const { vehicleType, problem, details, location, price } = req.body;
    console.log("📝 Creating service request for user:", req.user?.id);

    // Support both formats: 
    // 1. { longitude, latitude }
    // 2. { type: 'Point', coordinates: [lng, lat] } (Standard GeoJSON from frontend)
    // 3. No location at all (instant request mode)
    let lng, lat;
    if (location && Array.isArray(location.coordinates)) {
      lng = location.coordinates[0];
      lat = location.coordinates[1];
    } else if (location && typeof location.longitude !== 'undefined') {
      lng = location.longitude;
      lat = location.latitude;
    }

    const hasValidLocation = typeof lng !== 'undefined' && typeof lat !== 'undefined' && !isNaN(lng) && !isNaN(lat);
    if (!hasValidLocation) {
      console.log("ℹ️ No location provided — request will be broadcast to all available mechanics.");
    } else {
      console.log(`📍 Location: [${lng}, ${lat}]`);
    }

    const requestData = {
      client: req.user.id,
      vehicleType,
      problem,
      details,
      price
    };

    if (hasValidLocation) {
      requestData.location = {
        type: 'Point',
        coordinates: [Number(lng), Number(lat)]
      };
    }

    const newRequest = new ServiceRequest(requestData);

    await newRequest.save();
    console.log("✅ Request saved:", newRequest._id);

    // Populate client details before emitting
    const populatedRequest = await ServiceRequest.findById(newRequest._id).populate("client", "name email phone profileImage location");
    if (!populatedRequest) {
      console.error("❌ Failed to retrieve saved request for population");
      return res.status(500).json({ success: false, message: "Server error: request saved but could not be populated" });
    }
    console.log("👥 Populated request for emission");

    // Find nearby mechanics (within 100km) or all mechanics if no location
    let nearbyMechanics = [];
    try {
      if (hasValidLocation) {
        nearbyMechanics = await User.find({
          role: 'mechanic',
          location: {
            $near: {
              $geometry: {
                type: 'Point',
                coordinates: [lng, lat]
              },
              $maxDistance: 100000 // 100km
            }
          }
        });
        console.log(`🔍 Found ${nearbyMechanics.length} mechanics within 100km`);
      } else {
        // No location — notify ALL available mechanics
        nearbyMechanics = await User.find({ role: 'mechanic' });
        console.log(`📢 Broadcasting to all ${nearbyMechanics.length} mechanics (no location provided)`);
      }
    } catch (dbError) {
      // Fallback: notify all mechanics on geospatial error
      console.error("❌ Geospatial query failed, falling back to all mechanics:", dbError.message);
      nearbyMechanics = await User.find({ role: 'mechanic' });
    }

    // Emit event to mechanics via socket
    const io = req.app.get('io');
    if (io) {
      nearbyMechanics.forEach(mechanic => {
        console.log(`✉️ Emitting to mechanic:${mechanic._id}`);
        io.to(`mechanic:${mechanic._id}`).emit("job:new", {
          job: populatedRequest,
          distance: hasValidLocation ? "Nearby" : "Any"
        });
      });
    } else {
      console.warn("⚠️ Socket.io instance (io) not found on app. Emitting skipped.");
    }

    res.status(201).json({ success: true, notifiedMechanics: nearbyMechanics.length, data: populatedRequest });
  } catch (error) {
    console.error("🔥 Error in createServiceRequest:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get available jobs for mechanics
export const getAvailableJobs = async (req, res) => {
  try {
    const mechanic = await User.findById(req.user.id);
    if (!mechanic.location) {
      return res.status(400).json({ success: false, message: "Please set your location first" });
    }

    console.log(`🔍 Finding available jobs for mechanic: ${req.user.id}`);
    const coords = mechanic.location?.coordinates || "No coordinates";
    console.log(`📍 Mechanic location:`, JSON.stringify(coords));

    const availableJobs = await ServiceRequest.find({
      status: 'pending',
      location: {
        $near: {
          $geometry: mechanic.location,
          $maxDistance: 100000 // Increased to 100km for better testing visibility
        }
      }
    })
      .populate("client", "name email phone profileImage location")
      .sort({ createdAt: -1 });

    console.log(`✅ Found ${availableJobs.length} available jobs within 100km`);
    res.json({ success: true, data: availableJobs });
  } catch (error) {
    console.error("🔥 Error in getAvailableJobs:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Accept a job (Mechanic)
export const acceptJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const job = await ServiceRequest.findById(jobId);

    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    if (job.status !== 'pending') {
      return res.status(400).json({ success: false, message: "Job is no longer available" });
    }

    job.mechanic = req.user.id;
    job.status = 'accepted';
    job.acceptedAt = new Date();
    await job.save();

    const populatedJob = await ServiceRequest.findById(jobId)
      .populate("client", "name email phone profileImage location")
      .populate("mechanic", "name email phone profileImage expertiseLevel location");

    // Notify client
    const io = req.app.get('io');
    const room = `client:${job.client}`;
    console.log(`✉️ Emitting job:accepted to room: ${room}`);
    io.to(room).emit("job:accepted", {
      job: populatedJob
    });

    res.json({ success: true, data: populatedJob });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update job status (Mechanic)
export const updateJobStatus = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { status } = req.body;

    const job = await ServiceRequest.findById(jobId);

    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    // Only allow assigned mechanic to update
    if (job.mechanic.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Not authorized to update this job" });
    }

    job.status = status;
    if (status === "arrived") {
      job.arrivedAt = new Date();
    } else if (status === "completed") {
      job.completedAt = new Date();
    }

    await job.save();

    const populatedJob = await ServiceRequest.findById(jobId)
      .populate("client", "name email phone profileImage location")
      .populate("mechanic", "name email phone profileImage expertiseLevel location");

    // Notify client
    const io = req.app.get('io');
    const room = `client:${job.client}`;
    console.log(`✉️ Emitting job:status:update (${status}) to room: ${room}`);
    io.to(room).emit("job:status:update", {
      job: populatedJob,
      status: status
    });

    res.json({ success: true, data: populatedJob });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all service requests (Admin)
export const getServiceRequests = async (req, res) => {
  try {
    const requests = await ServiceRequest.find()
      .populate("client", "name email phone")
      .populate("mechanic", "name email phone")
      .sort({ createdAt: -1 });

    res.json({ success: true, data: requests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get service requests for a specific client
export const getClientServiceRequests = async (req, res) => {
  try {
    const requests = await ServiceRequest.find({ client: req.user.id })
      .populate("mechanic", "name email phone profileImage expertiseLevel location")
      .sort({ createdAt: -1 });

    res.json({ success: true, data: requests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get mechanic's ongoing jobs
export const getMechanicActiveJobs = async (req, res) => {
  try {
    const activeJobs = await ServiceRequest.find({
      mechanic: req.user.id,
      status: { $in: ["accepted", "on_the_way", "arrived"] }
    })
      .populate("client", "name email phone profileImage location")
      .sort({ createdAt: -1 });

    res.json({ success: true, data: activeJobs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get client's active job
export const getClientActiveJob = async (req, res) => {
  try {
    const activeJob = await ServiceRequest.findOne({
      client: req.user.id,
      $or: [
        { status: { $nin: ["completed", "cancelled"] } },
        { status: "completed", paymentStatus: "pending" }
      ]
    })
      .populate("client", "name email phone profileImage location")
      .populate("mechanic", "name email phone profileImage expertiseLevel location")
      .sort({ createdAt: -1 });

    if (!activeJob) {
      return res.json({ success: true, data: null });
    }

    res.json({ success: true, data: activeJob });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update mechanic location during active job
export const updateMechanicLocation = async (req, res) => {
  try {
    const { latitude, longitude, jobId } = req.body;

    // Update mechanic user location
    const mechanic = await User.findById(req.user.id);
    mechanic.location = {
      type: 'Point',
      coordinates: [longitude, latitude]
    };
    await mechanic.save();

    // If jobId is provided, emit update to the client of that job
    if (jobId) {
      const job = await ServiceRequest.findById(jobId);
      if (job) {
        const io = req.app.get('io');
        io.to(`client:${job.client}`).emit("mechanic:location:update", {
          location: { latitude, longitude },
          jobId: jobId
        });
        console.log(`📍 Location update sent to client ${job.client}`);
      }
    }

    res.json({
      success: true,
      message: "Location updated successfully",
      location: mechanic.location
    });
  } catch (error) {
    console.error("❌ Location update error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Process payment for completed job
export const processPayment = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { paymentMethod } = req.body;

    const job = await ServiceRequest.findById(jobId);
    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    if (job.status !== "completed") {
      return res.status(400).json({
        success: false,
        message: "Job must be completed before payment"
      });
    }

    job.paymentStatus = "paid";
    job.paymentMethod = paymentMethod || "card";
    await job.save();

    res.json({
      success: true,
      message: `Payment via ${(paymentMethod || 'card').toUpperCase()} processed successfully`,
      data: job
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};