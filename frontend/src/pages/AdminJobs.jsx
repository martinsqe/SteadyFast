import { useState, useEffect } from "react";
import api from "../api/axios";
import "./AdminJobs.css";

const AdminJobs = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        active: 0,
        pending: 0,
        completed: 0,
        cancelled: 0
    });

    const fetchJobs = async () => {
        try {
            setLoading(true);
            const response = await api.get("/services/all");
            const data = response.data.data || [];
            setJobs(data);

            // Calculate stats
            const newStats = data.reduce((acc, job) => {
                const status = job.status;
                if (status === 'pending') acc.pending++;
                else if (['accepted', 'on_the_way', 'arrived'].includes(status)) acc.active++;
                else if (status === 'completed') acc.completed++;
                else if (status === 'cancelled') acc.cancelled++;
                return acc;
            }, { active: 0, pending: 0, completed: 0, cancelled: 0 });

            setStats(newStats);
        } catch (error) {
            console.error("Error fetching jobs:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchJobs();
    }, []);

    const getStatusBadge = (status) => {
        const statusMap = {
            pending: { class: 'pending', text: 'PENDING' },
            accepted: { class: 'active', text: 'ACCEPTED' },
            on_the_way: { class: 'active', text: 'DRIVING' },
            arrived: { class: 'active', text: 'ARRIVED' },
            completed: { class: 'completed', text: 'COMPLETED' },
            cancelled: { class: 'cancelled', text: 'CANCELLED' }
        };
        const info = statusMap[status] || { class: 'default', text: status };
        return <span className={`status-pill ${info.class}`}>{info.text}</span>;
    };

    if (loading) return <div className="loading">Initializing job management...</div>;

    return (
        <div className="jobs-container">
            <header className="jobs-header-main">
                <h1>🔧 Job Management</h1>
                <p>Tracking and managing all roadside assistance requests in real-time.</p>
            </header>

            <div className="jobs-stats">
                <div className="stat-card-small active">
                    <h3>Active Jobs</h3>
                    <div className="stat-number">{stats.active}</div>
                    <div className="metric-change">Currently being serviced</div>
                </div>
                <div className="stat-card-small pending">
                    <h3>Pending Requests</h3>
                    <div className="stat-number">{stats.pending}</div>
                    <div className="metric-change">Awaiting mechanic</div>
                </div>
                <div className="stat-card-small completed">
                    <h3>Completed</h3>
                    <div className="stat-number">{stats.completed}</div>
                    <div className="metric-change">Successfully finished</div>
                </div>
                <div className="stat-card-small cancelled">
                    <h3>Cancelled</h3>
                    <div className="stat-number">{stats.cancelled}</div>
                    <div className="metric-change">Total cancellations</div>
                </div>
            </div>

            <div className="jobs-list shadow-premium">
                <h2>Full Job Database</h2>
                <div className="table-responsive">
                    <table className="admin-jobs-table">
                        <thead>
                            <tr>
                                <th>Date & ID</th>
                                <th>Client</th>
                                <th>Vehicle & Issue</th>
                                <th>Mechanic</th>
                                <th>Status</th>
                                <th>Price</th>
                            </tr>
                        </thead>
                        <tbody>
                            {jobs.length === 0 ? (
                                <tr>
                                    <td colSpan="6">
                                        <div className="zero-state-admin">
                                            <div className="zero-icon-admin">📑</div>
                                            <h3>No Service Requests Yet</h3>
                                            <p>All roadside assistance requests will appear here in real-time once created by clients.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                jobs.map((job) => (
                                    <tr key={job._id}>
                                        <td>
                                            <div className="id-cell">
                                                <span className="job-date">{new Date(job.createdAt).toLocaleDateString()}</span>
                                                <span className="job-id">#{job._id.slice(-6).toUpperCase()}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="person-cell">
                                                <strong>{job.client?.name || 'Unknown'}</strong>
                                                <span>{job.client?.phone || 'No phone'}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="service-cell">
                                                <span className="vehicle-tag">{job.vehicleType}</span>
                                                <span className="problem-text">{job.problem}</span>
                                            </div>
                                        </td>
                                        <td>
                                            {job.mechanic ? (
                                                <div className="person-cell">
                                                    <strong>{job.mechanic.name}</strong>
                                                    <span>{job.mechanic.phone}</span>
                                                </div>
                                            ) : (
                                                <span className="unassigned">Unassigned</span>
                                            )}
                                        </td>
                                        <td>{getStatusBadge(job.status)}</td>
                                        <td>
                                            {job.status === "cancelled"
                                                ? <span className="price-dash">—</span>
                                                : <span className="price-tag">${job.price?.toFixed(2)}</span>
                                            }
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminJobs;
