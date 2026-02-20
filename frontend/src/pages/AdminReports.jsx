import { useState, useEffect } from "react";
import api from "../api/axios";
import "./AdminReports.css";

const AdminReports = () => {
    const [mechanics, setMechanics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedMechanic, setSelectedMechanic] = useState(null);
    const [viewMode, setViewMode] = useState("summary"); // "summary" or "detail"

    useEffect(() => {
        fetchMechanicsIncome();
    }, []);

    const fetchMechanicsIncome = async () => {
        try {
            setLoading(true);
            const response = await api.get("/admin/reports/mechanics");
            if (response.data.success) {
                setMechanics(response.data.data);
            }
        } catch (error) {
            console.error("Error fetching mechanics income:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchMechanicDetails = async (mechanicId) => {
        try {
            const response = await api.get(`/admin/reports/mechanics/${mechanicId}`);
            if (response.data.success) {
                setSelectedMechanic(response.data.data);
                setViewMode("detail");
            }
        } catch (error) {
            console.error("Error fetching mechanic details:", error);
        }
    };

    const filteredMechanics = mechanics.filter(m =>
        m.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalSystemRevenue = mechanics.reduce((sum, m) => sum + m.totalIncome, 0);

    if (viewMode === "detail" && selectedMechanic) {
        return (
            <div className="reports-container">
                <div className="report-header">
                    <button className="btn-back" onClick={() => setViewMode("summary")}>
                        ← Back to Summary
                    </button>
                    <h1>👨‍🔧 {selectedMechanic.mechanic.name}'s Job History</h1>
                </div>

                <div className="metrics-grid">
                    <div className="metric-card">
                        <h3>Total Earnings</h3>
                        <div className="metric-value">${selectedMechanic.totalIncome.toLocaleString()}</div>
                    </div>
                    <div className="metric-card">
                        <h3>Jobs Completed</h3>
                        <div className="metric-value">{selectedMechanic.jobs.filter(j => j.status === "completed").length}</div>
                    </div>
                    <div className="metric-card">
                        <h3>Expertise</h3>
                        <div className="metric-value" style={{ fontSize: "1.2rem" }}>
                            {selectedMechanic.mechanic.expertiseLevel}
                        </div>
                    </div>
                </div>

                <div className="history-section">
                    <div className="history-table-container">
                        <table className="history-table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Client</th>
                                    <th>Service</th>
                                    <th>Price</th>
                                    <th>Status</th>
                                    <th>Payment</th>
                                </tr>
                            </thead>
                            <tbody>
                                {selectedMechanic.jobs.map((job) => (
                                    <tr key={job._id}>
                                        <td>{new Date(job.createdAt).toLocaleDateString()}</td>
                                        <td>{job.client?.name || "Unknown"}</td>
                                        <td>{job.problem}</td>
                                        <td>${job.price}</td>
                                        <td>
                                            <span className={`status-badge status-${job.status}`}>
                                                {job.status}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`status-badge status-${job.paymentStatus}`}>
                                                {job.paymentStatus}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="reports-container">
            <div className="report-header">
                <h1>📊 Financial Reports</h1>
                <div className="search-bar">
                    <input
                        type="text"
                        placeholder="Search mechanic by name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="metrics-grid">
                <div className="metric-card">
                    <h3>Total System Revenue</h3>
                    <div className="metric-value">${totalSystemRevenue.toLocaleString()}</div>
                    <div className="metric-change">All Completed Jobs</div>
                </div>
                <div className="metric-card">
                    <h3>Active Professionals</h3>
                    <div className="metric-value">{mechanics.length}</div>
                    <div className="metric-change">Registered Mechanics</div>
                </div>
                <div className="metric-card">
                    <h3>Avg Earnings / Mechanic</h3>
                    <div className="metric-value">
                        ${mechanics.length > 0 ? (totalSystemRevenue / mechanics.length).toFixed(0) : 0}
                    </div>
                    <div className="metric-change">Based on active workforce</div>
                </div>
            </div>

            <div className="mechanics-income-section">
                <h2>Mechanic Performance & Earnings</h2>
                {loading ? (
                    <div className="loading-placeholder">Loading report data...</div>
                ) : (
                    <div className="income-grid">
                        {filteredMechanics.length === 0 ? (
                            <p className="no-results">No mechanics found matching "{searchTerm}"</p>
                        ) : (
                            filteredMechanics.map((mechanic) => (
                                <div key={mechanic._id} className="income-card">
                                    <div className="mechanic-info">
                                        <div className="mechanic-avatar">
                                            {mechanic.profileImage ? (
                                                <img src={mechanic.profileImage} alt={mechanic.name} />
                                            ) : (
                                                mechanic.name.charAt(0).toUpperCase()
                                            )}
                                        </div>
                                        <div className="mechanic-details">
                                            <h3>{mechanic.name}</h3>
                                            <p>{mechanic.expertiseLevel}</p>
                                        </div>
                                    </div>
                                    <div className="income-stats">
                                        <div className="income-stat">
                                            <span className="label">Total Generated</span>
                                            <span className="value">${mechanic.totalIncome.toLocaleString()}</span>
                                        </div>
                                        <div className="income-stat">
                                            <span className="label">Completed Jobs</span>
                                            <span className="value">{mechanic.completedJobs}</span>
                                        </div>
                                    </div>
                                    <button
                                        className="btn-view-history"
                                        onClick={() => fetchMechanicDetails(mechanic._id)}
                                    >
                                        View Full History
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminReports;
