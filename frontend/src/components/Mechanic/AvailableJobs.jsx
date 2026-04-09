import { useState, useEffect } from "react";
import { useSocket } from "../../context/SocketContext";
import axios from "axios";
import "./AvailableJobs.css";

function AvailableJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [acceptedMsg, setAcceptedMsg] = useState("");
  const socketContext = useSocket();
  const socket = socketContext ? socketContext.socket : null;

  const syncLocation = (token) => new Promise((resolve) => {
    if (!("geolocation" in navigator)) { resolve(); return; }
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          await axios.post(
            `${import.meta.env.VITE_API_URL}/services/update-location`,
            { latitude: position.coords.latitude, longitude: position.coords.longitude },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          console.log("📍 Location synced");
        } catch (e) {
          console.warn("⚠️ Location sync failed:", e.message);
        }
        resolve();
      },
      () => resolve(), // denied or error — still resolve so fetch proceeds
      { enableHighAccuracy: false, timeout: 4000, maximumAge: 60000 }
    );
  });

  const fetchJobs = async () => {
    try {
      const token = localStorage.getItem("token");

      // Sync location FIRST (await it), then fetch jobs
      await syncLocation(token);

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/services/available`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const jobsData = response.data.data;
      setJobs(Array.isArray(jobsData) ? jobsData : []);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching jobs:", error);
      setJobs([]);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
    // Fallback polling every 30 seconds in case socket misses a "job:new"
    const pollInterval = setInterval(fetchJobs, 30000);
    return () => clearInterval(pollInterval);
  }, []);

  useEffect(() => {
    if (socket) {
      console.log("🔌 Socket active in AvailableJobs. Listening for 'job:new'...");

      const handleNewJob = (data) => {
        console.log("New job notification:", data);
        setJobs((prevJobs) => {
          if (prevJobs.some((j) => j._id === data.job._id)) {
            return prevJobs;
          }
          return [data.job, ...prevJobs];
        });

        if (Notification.permission === "granted") {
          const notification = new Notification("New Job Available!", {
            body: `${data.job.vehicleType} - ${data.job.problem}`,
            icon: "/icons/car.png"
          });
          setTimeout(() => notification.close(), 5000);
        }
      };

      socket.on("job:new", handleNewJob);

      return () => {
        socket.off("job:new", handleNewJob);
      };
    }
  }, [socket]);

  useEffect(() => {
    if (Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  const handleAcceptJob = async (jobId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${import.meta.env.VITE_API_URL}/services/${jobId}/accept`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Remove from available list and show toast-style message
      setJobs((prevJobs) => prevJobs.filter((job) => job._id !== jobId));
      setAcceptedMsg("Job accepted! Go to Active Jobs to manage it.");
      setTimeout(() => setAcceptedMsg(""), 4000);
    } catch (error) {
      console.error("Error accepting job:", error);
      const message = error.response?.data?.message || "Failed to accept job";
      alert(message);
    }
  };

  if (loading) {
    return <div className="loading">Loading available jobs...</div>;
  }

  return (
    <div className="available-jobs">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <h2 style={{ margin: 0 }}>Available Jobs Nearby</h2>
        <button
          onClick={fetchJobs}
          style={{
            background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.3)',
            color: '#60a5fa', borderRadius: '8px', padding: '6px 14px',
            fontSize: '0.82rem', cursor: 'pointer', fontWeight: 600
          }}
        >
          ↻ Refresh
        </button>
      </div>

      {acceptedMsg && (
        <div style={{
          background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)',
          color: '#10b981', borderRadius: '10px', padding: '0.75rem 1.25rem',
          marginBottom: '1rem', fontWeight: 600, fontSize: '0.9rem'
        }}>
          ✓ {acceptedMsg}
        </div>
      )}

      {!Array.isArray(jobs) || jobs.length === 0 ? (
        <div className="no-jobs">
          <p>No jobs available right now.</p>
          <p>You will be notified when new jobs appear nearby.</p>
        </div>
      ) : (
        <div className="jobs-grid">
          {jobs.map((job) => (
            <div key={job._id} className="job-card">
              <div className="job-header">
                <span className="vehicle-type">{job.vehicleType}</span>
                <span className="price">${job.price}</span>
              </div>

              <div className="job-problem">
                <strong>{job.problem}</strong>
              </div>

              <div className="job-details">
                {job.details?.brand && <p>Brand: {job.details.brand}</p>}
                {job.details?.model && <p>Model: {job.details.model}</p>}
                {job.details?.energyType && <p>Type: {job.details.energyType}</p>}
              </div>

              {job.client && (
                <div className="job-client">
                  <img
                    src={job.client.profileImage || "/icons/car.png"}
                    alt={job.client.name}
                    className="client-avatar"
                  />
                  <div>
                    <p className="client-name">{job.client.name}</p>
                    <p className="client-phone">{job.client.phone}</p>
                  </div>
                </div>
              )}

              <div className="job-time">
                Posted: {new Date(job.createdAt).toLocaleTimeString()}
              </div>

              <button
                className="accept-btn"
                onClick={() => handleAcceptJob(job._id)}
              >
                Accept Job
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AvailableJobs;