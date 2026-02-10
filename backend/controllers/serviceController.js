import ServiceRequest from "../models/ServiceRequest.js";

export const createRequest = async (req, res) => {
    try {
        const { vehicleType, problem, details, price } = req.body;
        const newRequest = new ServiceRequest({
            client: req.user._id,
            vehicleType,
            problem,
            details,
            price,
        });
        await newRequest.save();
        res.status(201).json({ message: "Request created successfully", request: newRequest });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const getClientRequests = async (req, res) => {
    try {
        const requests = await ServiceRequest.find({ client: req.user._id }).sort({ createdAt: -1 });
        res.json(requests);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const getAvailableRequests = async (req, res) => {
    try {
        const requests = await ServiceRequest.find({ status: "pending" }).populate("client", "name phone").sort({ createdAt: -1 });
        res.json(requests);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const acceptRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const request = await ServiceRequest.findById(id);

        if (!request) {
            return res.status(404).json({ message: "Request not found" });
        }

        if (request.status !== "pending") {
            return res.status(400).json({ message: "Job is already taken or cancelled" });
        }

        request.mechanic = req.user._id;
        request.status = "accepted";
        await request.save();

        res.json({ message: "Job accepted successfully!", request });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
