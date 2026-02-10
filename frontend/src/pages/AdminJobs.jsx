import "./AdminJobs.css";

const AdminJobs = () => {
    return (
        <div className="jobs-container">
            <h1>🔧 Job Management</h1>

            <div className="jobs-stats">
                <div className="stat-card-small active">
                    <h3>Active Jobs</h3>
                    <div className="stat-number">12</div>
                    <div className="metric-change">+2 from yesterday</div>
                </div>
                <div className="stat-card-small pending">
                    <h3>Pending Requests</h3>
                    <div className="stat-number">5</div>
                    <div className="metric-change">Requires attention</div>
                </div>
                <div className="stat-card-small completed">
                    <h3>Completed Today</h3>
                    <div className="stat-number">28</div>
                    <div className="metric-change">95% success rate</div>
                </div>
                <div className="stat-card-small cancelled">
                    <h3>Cancelled</h3>
                    <div className="stat-number">2</div>
                    <div className="metric-change">Customer cancelled</div>
                </div>
            </div>

            <div className="jobs-list">
                <h2>Recent Job Requests</h2>
                <div className="placeholder-card">
                    <div className="placeholder-icon">🛠️</div>
                    <p>Job listing functionality coming soon</p>
                    <ul className="feature-list">
                        <li>Real-time job tracking</li>
                        <li>Mechanic assignment</li>
                        <li>Status updates</li>
                        <li>Service history</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default AdminJobs;
