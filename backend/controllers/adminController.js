import User from "../models/User.js";
import ServiceRequest from "../models/ServiceRequest.js";

// Get all platform fee payments
export const getPlatformFeePayments = async (req, res) => {
    try {
        const payments = await ServiceRequest.find({ platformFeeStatus: "paid" })
            .populate("client", "name email phone")
            .select("client vehicleType problem platformFee platformFeeMethod platformFeePaidAt createdAt")
            .sort({ platformFeePaidAt: -1 });

        const totalRevenue = payments.reduce((sum, p) => sum + (p.platformFee || 15), 0);

        res.json({ success: true, data: payments, totalRevenue });
    } catch (error) {
        console.error("Error in getPlatformFeePayments:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get income summary for all mechanics
export const getMechanicsIncome = async (req, res) => {
    try {
        const mechanics = await User.find({ role: "mechanic" }).select("name email profileImage expertiseLevel");

        const reports = await Promise.all(
            mechanics.map(async (mechanic) => {
                const completedJobs = await ServiceRequest.find({
                    mechanic: mechanic._id,
                    status: "completed"
                });

                const totalIncome = completedJobs.reduce((sum, job) => sum + (job.price || 0), 0);

                return {
                    _id: mechanic._id,
                    name: mechanic.name,
                    email: mechanic.email,
                    profileImage: mechanic.profileImage,
                    expertiseLevel: mechanic.expertiseLevel,
                    totalIncome,
                    completedJobs: completedJobs.length
                };
            })
        );

        res.json({ success: true, data: reports });
    } catch (error) {
        console.error("Error in getMechanicsIncome:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get detailed job history for a specific mechanic
export const getMechanicDetails = async (req, res) => {
    try {
        const { id } = req.params;

        const mechanic = await User.findById(id).select("-password");
        if (!mechanic || mechanic.role !== "mechanic") {
            return res.status(404).json({ success: false, message: "Mechanic not found or invalid role" });
        }

        const jobs = await ServiceRequest.find({ mechanic: id })
            .populate("client", "name email phone")
            .sort({ createdAt: -1 });

        const totalIncome = jobs
            .filter(job => job.status === "completed")
            .reduce((sum, job) => sum + (job.price || 0), 0);

        res.json({
            success: true,
            data: {
                mechanic,
                totalIncome,
                jobs
            }
        });
    } catch (error) {
        console.error("Error in getMechanicDetails:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};
