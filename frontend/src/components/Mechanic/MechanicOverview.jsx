import { useState, useEffect } from "react";
import axios from "axios";

function MechanicOverview() {
  const [stats, setStats] = useState({
    totalJobs: 0,
    completedJobs: 0,
    totalEarnings: 0,
    rating: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/mechanic/earnings`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      const data = response.data.data;
      setStats({
        totalJobs: data.completedJobs || 0,
        completedJobs: data.completedJobs || 0,
        totalEarnings: data.totalEarnings || 0,
        rating: 4.5
      });
      setLoading(false);
    } catch (error) {
      console.error("Error fetching stats:", error);
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{ color: '#fff', padding: '20px' }}>Loading stats...</div>;
  }

  return (
    <div style={{ padding: '20px' }}>
      <h2 style={{ color: '#fff', marginBottom: '20px' }}>Overview</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
        <div style={{ background: 'rgba(255,255,255,0.1)', padding: '20px', borderRadius: '10px' }}>
          <h3 style={{ color: '#3498DB', fontSize: '32px', margin: '0' }}>{stats.completedJobs}</h3>
          <p style={{ color: '#fff', margin: '10px 0 0 0' }}>Completed Jobs</p>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.1)', padding: '20px', borderRadius: '10px' }}>
          <h3 style={{ color: '#27AE60', fontSize: '32px', margin: '0' }}>${stats.totalEarnings}</h3>
          <p style={{ color: '#fff', margin: '10px 0 0 0' }}>Total Earnings</p>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.1)', padding: '20px', borderRadius: '10px' }}>
          <h3 style={{ color: '#F39C12', fontSize: '32px', margin: '0' }}>⭐ {stats.rating}</h3>
          <p style={{ color: '#fff', margin: '10px 0 0 0' }}>Average Rating</p>
        </div>
      </div>
    </div>
  );
}

export default MechanicOverview;