import { useState, useEffect } from "react";
import api from "../api/axios";
import "./AdminReports.css";

const PAYMENT_METHOD_LABELS = { card: "💳 Card", mpesa: "📱 M-Pesa", cash: "💵 Cash" };

const AdminReports = () => {
    const [mechanics, setMechanics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedMechanic, setSelectedMechanic] = useState(null);
    const [viewMode, setViewMode] = useState("summary"); // "summary" | "detail" | "fees"
    const [feePayments, setFeePayments] = useState([]);
    const [feesLoading, setFeesLoading] = useState(false);
    const [feeTotalRevenue, setFeeTotalRevenue] = useState(0);

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

    const fetchFeePayments = async () => {
        setFeesLoading(true);
        try {
            const res = await api.get("/admin/reports/platform-fees");
            if (res.data.success) {
                setFeePayments(res.data.data);
                setFeeTotalRevenue(res.data.totalRevenue || 0);
            }
        } catch (err) {
            console.error("Error fetching fee payments:", err);
        } finally {
            setFeesLoading(false);
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

    const totalSystemRevenue = mechanics.reduce((sum, m) => sum + (m.totalIncome || 0), 0);

    if (viewMode === "fees") {
        return (
            <div className="reports-container">
                <div className="report-header">
                    <button className="btn-back" onClick={() => setViewMode("summary")}>← Back to Summary</button>
                    <h1>🔐 Platform Fee Payments</h1>
                </div>

                <div className="metrics-grid">
                    <div className="metric-card">
                        <h3>Total Platform Revenue</h3>
                        <div className="metric-value">${feeTotalRevenue.toLocaleString()}</div>
                        <div className="metric-change">From access fees collected</div>
                    </div>
                    <div className="metric-card">
                        <h3>Total Transactions</h3>
                        <div className="metric-value">{feePayments.length}</div>
                        <div className="metric-change">Paid platform fees</div>
                    </div>
                    <div className="metric-card">
                        <h3>Fee Per Request</h3>
                        <div className="metric-value">$1</div>
                        <div className="metric-change">Fixed platform access fee</div>
                    </div>
                </div>

                <div className="history-section">
                    {feesLoading ? (
                        <p style={{ color: "rgba(255,255,255,0.5)", textAlign: "center", padding: "2rem" }}>Loading payments...</p>
                    ) : feePayments.length === 0 ? (
                        <p style={{ color: "rgba(255,255,255,0.5)", textAlign: "center", padding: "2rem" }}>No platform fee payments recorded yet.</p>
                    ) : (
                        <div className="history-table-container">
                            <table className="history-table">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Client</th>
                                        <th>Service</th>
                                        <th>Vehicle</th>
                                        <th>Amount</th>
                                        <th>Method</th>
                                        <th>Date</th>
                                        <th>Time</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {feePayments.map((p, i) => {
                                        const d = new Date(p.platformFeePaidAt || p.createdAt);
                                        return (
                                            <tr key={p._id}>
                                                <td style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.8rem" }}>{i + 1}</td>
                                                <td>
                                                    <div style={{ fontWeight: 600 }}>{p.client?.name || "—"}</div>
                                                    <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.45)" }}>{p.client?.email}</div>
                                                </td>
                                                <td>{p.problem}</td>
                                                <td>{p.vehicleType}</td>
                                                <td>
                                                    <span className="fee-amount">${p.platformFee || 1}</span>
                                                </td>
                                                <td>
                                                    <span className="fee-method-badge">
                                                        {PAYMENT_METHOD_LABELS[p.platformFeeMethod] || p.platformFeeMethod}
                                                    </span>
                                                </td>
                                                <td>{d.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}</td>
                                                <td style={{ color: "rgba(255,255,255,0.55)", fontSize: "0.85rem" }}>
                                                    {d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        );
    }

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
                        <div className="metric-value">${selectedMechanic.jobs.filter(j => j.status === "completed").reduce((s, j) => s + (j.price || 0), 0).toLocaleString()}</div>
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
                                        <td>
                                            {job.status === "cancelled"
                                                ? <span style={{ color: "rgba(255,255,255,0.3)", fontWeight: 600 }}>—</span>
                                                : `$${job.price}`
                                            }
                                        </td>
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
                <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
                    <button
                        className="btn-fee-payments"
                        onClick={() => { setViewMode("fees"); fetchFeePayments(); }}
                    >
                        🔐 Platform Fee Payments
                    </button>
                    <div className="search-bar">
                        <input
                            type="text"
                            placeholder="Search mechanic by name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
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
