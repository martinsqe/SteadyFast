import { useEffect, useState } from "react";
import api from "../../api/axios";

export default function ClientActiveJob() {
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchActiveJob = async () => {
    try {
      const res = await api.get("/services/active");
      setJob(res.data.job || null);
    } catch (err) {
      console.error("Active job error", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveJob();
    const interval = setInterval(fetchActiveJob, 5000); // auto refresh every 5s
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div style={{ color: "white" }}>Checking job status...</div>;

  if (!job) {
    return <div style={{ color: "white" }}>No active service request</div>;
  }

  return (
    <div className="active-job">
      <h1>🚗 Mechanic On The Way</h1>

      <div className="card">
        <p><strong>Mechanic:</strong> {job.mechanic.name}</p>
        <p><strong>Phone:</strong> {job.mechanic.phone || "Not provided"}</p>
        <p><strong>Status:</strong> {job.status.toUpperCase()}</p>

        <p><strong>Problem:</strong> {job.problem}</p>
        <p><strong>Vehicle:</strong> {job.vehicleType}</p>

        <div style={{ marginTop: "1rem" }}>
          <a
            href={`tel:${job.mechanic.phone}`}
            className="btn-primary"
          >
            📞 Call Mechanic
          </a>

          <button className="btn-secondary" style={{ marginLeft: "1rem" }}>
            💬 Chat
          </button>
        </div>
      </div>
    </div>
  );
}
