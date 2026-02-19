import { useState, useEffect } from "react";
import { useSocket } from "../../context/SocketContext";
import axios from "axios";
import "./AvailableJobs.css";

function AvailableJobs() {
  const [jobs, setJobs] = useState([]);  // Initialize as empty array
  const [loading, setLoading] = useState(true);
  const socketContext = useSocket();
  const socket = socketContext ? socketContext.socket : null;

  const fetchJobs = async () => {
    try {
      const token = localStorage.getItem("token");
      console.log("📡 Fetching available jobs from:", `${import.meta.env.VITE_API_URL}/services/available`);
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/services/available`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      console.log("📥 Available jobs response:", response.data);
      // Make sure we always set an array
      const jobsData = response.data.data;
      setJobs(Array.isArray(jobsData) ? jobsData : []);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching jobs:", error);
      setJobs([]);  // Set empty array on error
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    if (socket) {
      const handleNewJob = (data) => {
        console.log("New job notification:", data);
        setJobs((prevJobs) => {
          const newJobs = [data.job];
          return newJobs.concat(prevJobs);
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
    const confirmed = window.confirm("Accept this job?");
    if (!confirmed) return;

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${import.meta.env.VITE_API_URL}/services/${jobId}/accept`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      alert("Job accepted! Navigate to Active Jobs to see details.");
      setJobs((prevJobs) => prevJobs.filter((job) => job._id !== jobId));
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
      <h2>Available Jobs Nearby</h2>

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