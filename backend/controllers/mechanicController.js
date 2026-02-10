import Job from "../models/Job.js";
import Review from "../models/Review.js";
import User from "../models/User.js";

// @desc    Get mechanic dashboard stats
// @route   GET /api/mechanic/stats
// @access  Private (Mechanic)
export const getMechanicStats = async (req, res) => {
    try {
        const mechanicId = req.user._id;

        const totalJobs = await Job.countDocuments({ mechanic: mechanicId });
        const completedJobs = await Job.countDocuments({ mechanic: mechanicId, status: "Completed" });
        const pendingJobs = await Job.countDocuments({ mechanic: mechanicId, status: "Pending" });

        // Calculate total revenue
        const revenueResult = await Job.aggregate([
            { $match: { mechanic: mechanicId, status: "Completed" } },
            { $group: { _id: null, total: { $sum: "$cost" } } },
        ]);
        const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

        // Calculate average rating
        const ratingResult = await Review.aggregate([
            { $match: { mechanic: mechanicId } },
            { $group: { _id: null, avg: { $avg: "$rating" } } },
        ]);
        const averageRating = ratingResult.length > 0 ? ratingResult[0].avg : 0;

        res.json({
            totalJobs,
            completedJobs,
            pendingJobs,
            totalRevenue,
            averageRating: parseFloat(averageRating.toFixed(1)),
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get mechanic's clients
// @route   GET /api/mechanic/clients
// @access  Private (Mechanic)
export const getMechanicClients = async (req, res) => {
    try {
        const mechanicId = req.user._id;

        // Find all unique client IDs from jobs
        const clients = await Job.find({ mechanic: mechanicId }).distinct("client");

        // Fetch user details for those clients
        const clientDetails = await User.find({ _id: { $in: clients } }).select("name email phone address profileImage");

        res.json(clientDetails);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get mechanic's reviews
// @route   GET /api/mechanic/reviews
// @access  Private (Mechanic)
export const getMechanicReviews = async (req, res) => {
    try {
        const mechanicId = req.user._id;

        const reviews = await Review.find({ mechanic: mechanicId })
            .populate("client", "name profileImage")
            .populate("job", "serviceType vehicle")
            .sort("-createdAt");

        res.json(reviews);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get mechanic's job history
// @route   GET /api/mechanic/jobs
// @access  Private (Mechanic)
export const getMechanicJobs = async (req, res) => {
    try {
        const mechanicId = req.user._id;
        const { status } = req.query;

        const query = { mechanic: mechanicId };
        if (status && status !== "All") {
            query.status = status;
        }

        const jobs = await Job.find(query)
            .populate("client", "name email phone address")
            .sort("-createdAt");

        res.json(jobs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get revenue details
// @route   GET /api/mechanic/revenue
// @access  Private (Mechanic)
export const getMechanicRevenue = async (req, res) => {
    try {
        const mechanicId = req.user._id;

        // Group by month
        const revenueByMonth = await Job.aggregate([
            { $match: { mechanic: mechanicId, status: "Completed" } },
            {
                $group: {
                    _id: { $month: "$createdAt" },
                    total: { $sum: "$cost" },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        res.json(revenueByMonth);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
