import { useEffect, useState } from "react";
import api from "../../api/axios";

const JobHistory = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchJobs = async () => {
            try {
                const response = await api.get("/mechanic/jobs");
                setJobs(response.data);
            } catch (error) {
                console.error("Error fetching jobs:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchJobs();
    }, []);

    if (loading) return <div>Loading job history...</div>;

    const getStatusColor = (status) => {
        switch (status) {
            case "Completed": return "#10b981"; // green
            case "In Progress": return "#3b82f6"; // blue
            case "Pending": return "#f59e0b"; // yellow
            case "Cancelled": return "#ef4444"; // red
            default: return "#9ca3af";
        }
    };

    return (
        <div className="job-history">
            <h2>Job History</h2>
            <div className="table-container">
                <table className="users-table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Client</th>
                            <th>Vehicle</th>
                            <th>Service</th>
                            <th>Status</th>
                            <th>Cost</th>
                        </tr>
                    </thead>
                    <tbody>
                        {jobs.length === 0 ? (
                            <tr>
                                <td colSpan="6">No jobs found.</td>
                            </tr>
                        ) : (
                            jobs.map(job => (
                                <tr key={job._id}>
                                    <td>{new Date(job.createdAt).toLocaleDateString()}</td>
                                    <td>{job.client?.name}</td>
                                    <td>
                                        {job.vehicle.year} {job.vehicle.make} {job.vehicle.model}
                                    </td>
                                    <td>{job.serviceType}</td>
                                    <td>
                                        <span style={{
                                            padding: "4px 8px",
                                            borderRadius: "4px",
                                            fontSize: "0.85rem",
                                            backgroundColor: getStatusColor(job.status) + "20",
                                            color: getStatusColor(job.status),
                                            border: `1px solid ${getStatusColor(job.status)}`
                                        }}>
                                            {job.status}
                                        </span>
                                    </td>
                                    <td>${job.cost}</td>
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
