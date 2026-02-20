import { useEffect, useState } from "react";
import api from "../../api/axios";
import "./Revenue.css"; // We'll create/update this

const Revenue = () => {
    const [earnings, setEarnings] = useState({
        totalEarnings: 0,
        completedJobs: 0,
        averagePerJob: 0,
        jobs: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEarnings = async () => {
            try {
                const response = await api.get("/mechanic/earnings");
                if (response.data.success) {
                    setEarnings(response.data.data);
                }
            } catch (error) {
                console.error("Error fetching earnings:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchEarnings();
    }, []);

    if (loading) return <div className="loading">Calculating your earnings...</div>;

    return (
        <div className="revenue-container">
            <header className="revenue-header">
                <h1>💰 Revenue Analytics</h1>
                <p>Track your earnings and professional growth in real-time.</p>
            </header>

            <div className="revenue-stats-grid">
                <div className="rev-stat-card total">
                    <div className="stat-icon">💵</div>
                    <div className="stat-info">
                        <h3>Total Earnings</h3>
                        <div className="stat-value">${earnings.totalEarnings?.toFixed(2)}</div>
                    </div>
                </div>
                <div className="rev-stat-card count">
                    <div className="stat-icon">🔧</div>
                    <div className="stat-info">
                        <h3>Jobs Completed</h3>
                        <div className="stat-value">{earnings.completedJobs}</div>
                    </div>
                </div>
                <div className="rev-stat-card average">
                    <div className="stat-icon">📈</div>
                    <div className="stat-info">
                        <h3>Average/Job</h3>
                        <div className="stat-value">${earnings.averagePerJob?.toFixed(2)}</div>
                    </div>
                </div>
            </div>

            <div className="earnings-history shadow-premium">
                <h2>Earnings History</h2>
                <div className="table-wrapper">
                    <table className="revenue-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Client</th>
                                <th>Service Type</th>
                                <th>Payment Method</th>
                                <th>Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {earnings.jobs.length === 0 ? (
                                <tr>
                                    <td colSpan="5">
                                        <div className="zero-state-revenue">
                                            <div className="zero-icon">💸</div>
                                            <h3>No Earnings Yet</h3>
                                            <p>Complete your first job to start building your revenue stream!</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                earnings.jobs.map((job) => (
                                    <tr key={job._id}>
                                        <td>{new Date(job.completedAt || job.updatedAt).toLocaleDateString()}</td>
                                        <td>{job.client?.name || "Customer"}</td>
                                        <td><span className="service-tag">{job.vehicleType}</span></td>
                                        <td><span className="method-tag">Card</span></td>
                                        <td className="amount-cell">${job.price?.toFixed(2)}</td>
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

export default Revenue;
