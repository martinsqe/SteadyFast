import "./AdminReports.css";

const AdminReports = () => {
    return (
        <div className="reports-container">
            <h1>📊 System Reports</h1>

            <div className="metrics-grid">
                <div className="metric-card">
                    <h3>Total Revenue</h3>
                    <div className="metric-value">$1,240</div>
                    <div className="metric-change">This Week</div>
                </div>
                <div className="metric-card">
                    <h3>User Satisfaction</h3>
                    <div className="metric-value">4.8/5</div>
                    <div className="metric-change">Based on 150 reviews</div>
                </div>
                <div className="metric-card">
                    <h3>Avg Response Time</h3>
                    <div className="metric-value">12m</div>
                    <div className="metric-change">-2m improvement</div>
                </div>
            </div>

            <div className="charts-section">
                <h2>Performance Analytics</h2>
                <div className="placeholder-card">
                    <div className="placeholder-icon">📈</div>
                    <p>Advanced reporting tools coming soon</p>
                    <ul className="feature-list">
                        <li>Revenue charts</li>
                        <li>User growth analytics</li>
                        <li>Service type distribution</li>
                        <li>Mechanic performance ratings</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default AdminReports;
