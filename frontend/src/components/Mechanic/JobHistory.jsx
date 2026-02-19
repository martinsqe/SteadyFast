import { useEffect, useState } from "react";
import axios from "axios";
import "./JobHistory.css";

const JobHistory = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchJobs = async () => {
            try {
                const token = localStorage.getItem("token");
                const response = await axios.get(
                    `${import.meta.env.VITE_API_URL}/mechanic/jobs`,
                    {
                        headers: { Authorization: `Bearer ${token}` }
                    }
                );
                // Backend returns { success: true, data: [...] }
                setJobs(response.data.data || []);
            } catch (error) {
                console.error("Error fetching jobs:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchJobs();
    }, []);

    if (loading) return <div className="loading">Loading job history...</div>;

    const getStatusColor = (status) => {
        switch (status) {
            case "completed": return "#10b981"; // green
            case "on_the_way":
            case "arrived":
            case "accepted": return "#3b82f6"; // blue
            case "pending": return "#f59e0b"; // yellow
            case "cancelled": return "#ef4444"; // red
            default: return "#9ca3af";
        }
    };

    return (
        <div className="job-history">
            <header className="history-header">
                <h2>🛠️ Job History</h2>
                <p>Overview of your completed and past service requests.</p>
            </header>

            <div className="table-container shadow-premium">
                <table className="users-table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Client</th>
                            <th>Vehicle</th>
                            <th>Service</th>
                            <th>Status</th>
                            <th>Earnings</th>
                        </tr>
                    </thead>
                    <tbody>
                        {jobs.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="no-data">No jobs found in your history.</td>
                            </tr>
                        ) : (
                            jobs.map(job => (
                                <tr key={job._id}>
                                    <td>
                                        <div className="date-cell">
                                            {new Date(job.createdAt).toLocaleDateString()}
                                            <span className="time-subtext">{new Date(job.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="client-cell">
                                            <strong>{job.client?.name || 'N/A'}</strong>
                                            <span className="phone-subtext">{job.client?.phone}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="vehicle-cell">
                                            <span className="vehicle-type-tag">{job.vehicleType}</span>
                                            <span className="model-text">{job.details?.brand} {job.details?.model}</span>
                                        </div>
                                    </td>
                                    <td className="problem-cell">{job.problem}</td>
                                    <td>
                                        <span className="status-pill" style={{
                                            backgroundColor: getStatusColor(job.status) + "20",
                                            color: getStatusColor(job.status),
                                            borderColor: getStatusColor(job.status)
                                        }}>
                                            {job.status?.replace('_', ' ').toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="cost-cell">
                                        <strong className="price-text">${job.price?.toFixed(2)}</strong>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default JobHistory;
