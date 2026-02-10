import { useState, useEffect } from "react";
import api from "../../api/axios";
import "./AvailableJobs.css";

const AvailableJobs = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState({ type: "", text: "" });

    const fetchJobs = async () => {
        try {
            setLoading(true);
            const response = await api.get("/services/available");
            setJobs(response.data);
        } catch (error) {
            console.error("Error fetching jobs:", error);
            setMessage({ type: "error", text: "Failed to load jobs" });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchJobs();
    }, []);

    const handleAccept = async (jobId) => {
        try {
            const response = await api.put(`/services/${jobId}/accept`);
            setMessage({ type: "success", text: response.data.message });
            // Remove accepted job from the list
            setJobs(jobs.filter(job => job._id !== jobId));
        } catch (error) {
            setMessage({ type: "error", text: error.response?.data?.message || "Failed to accept job" });
        }
    };

    if (loading) return <div className="loading">Loading available jobs...</div>;

    return (
        <div className="available-jobs">
            <div className="section-header">
                <h2>🛠️ Available Jobs</h2>
                <p>New service requests from clients in your area</p>
            </div>

            {message.text && (
                <div className={`message-alert ${message.type}`}>
                    {message.text}
                </div>
            )}

            {jobs.length === 0 ? (
                <div className="empty-state">
                    <p>No new requests at the moment. Check back soon!</p>
                </div>
            ) : (
                <div className="job-grid">
                    {jobs.map((job) => (
                        <div key={job._id} className="job-card">
                            <div className="job-header">
                                <span className="vehicle-badge">{job.vehicleType}</span>
                                <span className="price-tag">${job.price}</span>
                            </div>

                            <div className="job-body">
                                <h3>{job.problem}</h3>
                                <div className="client-info">
                                    <strong>Client:</strong> {job.client?.name}
                                </div>
                                <div className="vehicle-details">
                                    <p><strong>Brand:</strong> {job.details?.brand}</p>
                                    <p><strong>Model:</strong> {job.details?.model}</p>
                                    {job.details?.energyType && <p><strong>Type:</strong> {job.details.energyType}</p>}
                                </div>
                            </div>

                            <button
                                className="accept-job-btn"
                                onClick={() => handleAccept(job._id)}
                            >
                                Accept this Job
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AvailableJobs;
