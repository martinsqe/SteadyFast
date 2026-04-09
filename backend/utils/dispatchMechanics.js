import User from "../models/User.js";
import ServiceRequest from "../models/ServiceRequest.js";

/**
 * Upgrades a service request from payment_pending → pending
 * and emits job:new to all nearby mechanics.
 * Returns the populated request.
 */
export async function dispatchToMechanics(requestId, io) {
  const request = await ServiceRequest.findByIdAndUpdate(
    requestId,
    { status: "pending" },
    { new: true }
  ).populate("client", "name email phone profileImage location");

  if (!request) throw new Error("Request not found: " + requestId);

  const coords = request.location?.coordinates;
  const hasLocation = Array.isArray(coords) && coords.length === 2 &&
    !(coords[0] === 0 && coords[1] === 0);

  let mechanics = [];

  try {
    if (hasLocation) {
      const [lng, lat] = coords;
      const nearby = await User.find({
        role: "mechanic",
        location: {
          $near: {
            $geometry: { type: "Point", coordinates: [lng, lat] },
            $maxDistance: 100000
          }
        }
      });
      const noGps = await User.find({ role: "mechanic", "location.coordinates": [0, 0] });
      const seen = new Set();
      for (const m of [...nearby, ...noGps]) {
        if (!seen.has(m._id.toString())) { seen.add(m._id.toString()); mechanics.push(m); }
      }
    } else {
      mechanics = await User.find({ role: "mechanic" });
    }
  } catch {
    mechanics = await User.find({ role: "mechanic" });
  }

  if (io) {
    mechanics.forEach(m => {
      io.to(`mechanic:${m._id}`).emit("job:new", {
        job: request,
        distance: hasLocation ? "Nearby" : "Any"
      });
    });
    // Notify the client that payment was confirmed and mechanics are being contacted
    io.to(`client:${request.client._id}`).emit("payment:confirmed", {
      requestId: request._id,
      notifiedMechanics: mechanics.length
    });
  }

  return { request, notifiedMechanics: mechanics.length };
}
