import { useEffect, useState } from "react";
import api from "../../api/axios";

const MechanicOverview = () => {
    const [stats, setStats] = useState({
        totalJobs: 0,
        completedJobs: 0,
        pendingJobs: 0,
        totalRevenue: 0,
        averageRating: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await api.get("/mechanic/stats");
                setStats(response.data);
            } catch (error) {
                console.error("Error fetching stats:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) return <div>Loading stats...</div>;

    return (
        <div className="mechanic-overview">
            <h2>Dashboard Overview</h2>
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-value">{stats.totalJobs}</div>
                    <div className="stat-label">Total Jobs</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">{stats.pendingJobs}</div>
                    <div className="stat-label">Active Jobs</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">${stats.totalRevenue}</div>
                    <div className="stat-label">Total Revenue</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">⭐ {stats.averageRating}</div>
                    <div className="stat-label">Average Rating</div>
                </div>
            </div>
            {/* Can add recent activity or charts here later */}
        </div>
    );
};

export default MechanicOverview;
