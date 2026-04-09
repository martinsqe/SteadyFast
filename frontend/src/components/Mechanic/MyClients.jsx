import { useEffect, useState } from "react";
import axios from "axios";

const API  = import.meta.env.VITE_API_URL;
const BASE = API ? API.replace("/api", "") : "http://localhost:5000";

const STATUS_COLORS = {
  completed:  { bg: "rgba(16,185,129,0.12)", color: "#34d399", border: "rgba(16,185,129,0.25)" },
  accepted:   { bg: "rgba(59,130,246,0.12)", color: "#60a5fa", border: "rgba(59,130,246,0.25)" },
  on_the_way: { bg: "rgba(251,191,36,0.12)", color: "#fbbf24", border: "rgba(251,191,36,0.25)" },
  arrived:    { bg: "rgba(139,92,246,0.12)", color: "#a78bfa", border: "rgba(139,92,246,0.25)" },
  pending:    { bg: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.5)", border: "rgba(255,255,255,0.1)" },
  cancelled:  { bg: "rgba(239,68,68,0.12)", color: "#f87171", border: "rgba(239,68,68,0.25)" },
};

const StatusBadge = ({ status }) => {
  const s = STATUS_COLORS[status] || STATUS_COLORS.pending;
  return (
    <span style={{
      background: s.bg, color: s.color, border: `1px solid ${s.border}`,
      borderRadius: "20px", padding: "2px 10px", fontSize: "0.72rem", fontWeight: 600
    }}>
      {status?.replace("_", " ")}
    </span>
  );
};

const MyClients = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    axios
      .get(`${API}/mechanic/clients`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => setClients(res.data.clients || []))
      .catch(() => setError("Failed to load clients."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ color: "#fff", padding: "2rem" }}>Loading clients...</div>;
  if (error)   return <div style={{ color: "#f87171", padding: "2rem" }}>{error}</div>;

  return (
    <div style={{ color: "#fff", maxWidth: "900px" }}>
      <div style={{ marginBottom: "1.75rem" }}>
        <h2 style={{ fontSize: "1.4rem", fontWeight: 700, margin: "0 0 0.25rem" }}>My Clients</h2>
        <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.85rem", margin: 0 }}>
          Clients who hired you directly or had a service job with you
        </p>
      </div>

      {/* Summary bar */}
      <div style={{
        display: "flex", gap: "1rem", marginBottom: "1.5rem", flexWrap: "wrap"
      }}>
        <div style={{
          background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: "12px", padding: "0.85rem 1.25rem", display: "flex", alignItems: "center", gap: "0.6rem"
        }}>
          <span style={{ fontSize: "1.3rem" }}>👥</span>
          <div>
            <div style={{ fontSize: "1.2rem", fontWeight: 700 }}>{clients.length}</div>
            <div style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.4)" }}>Total Clients</div>
          </div>
        </div>
        <div style={{
          background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: "12px", padding: "0.85rem 1.25rem", display: "flex", alignItems: "center", gap: "0.6rem"
        }}>
          <span style={{ fontSize: "1.3rem" }}>⭐</span>
          <div>
            <div style={{ fontSize: "1.2rem", fontWeight: 700 }}>
              {clients.filter(c => c.source === "hired").length}
            </div>
            <div style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.4)" }}>Hired Me</div>
          </div>
        </div>
        <div style={{
          background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: "12px", padding: "0.85rem 1.25rem", display: "flex", alignItems: "center", gap: "0.6rem"
        }}>
          <span style={{ fontSize: "1.3rem" }}>🔧</span>
          <div>
            <div style={{ fontSize: "1.2rem", fontWeight: 700 }}>
              {clients.reduce((sum, c) => sum + (c.jobs?.length || 0), 0)}
            </div>
            <div style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.4)" }}>Total Jobs</div>
          </div>
        </div>
      </div>

      {clients.length === 0 ? (
        <div style={{
          textAlign: "center", padding: "3rem 2rem",
          background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "14px"
        }}>
          <div style={{ fontSize: "3rem", marginBottom: "0.75rem", opacity: 0.4 }}>👥</div>
          <p style={{ fontWeight: 600, color: "rgba(255,255,255,0.5)", margin: "0 0 0.3rem" }}>No clients yet</p>
          <p style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.3)", margin: 0 }}>
            Clients will appear here after they hire you or after a job is completed
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
          {clients.map(({ client, source, jobs }, i) => {
            const avatar = client?.profileImage
              ? (client.profileImage.startsWith("http")
                  ? client.profileImage
                  : `${BASE}${client.profileImage}`)
              : null;
            const isOpen = expanded === i;

            return (
              <div key={client._id} style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.09)",
                borderRadius: "14px", overflow: "hidden"
              }}>
                {/* Client row */}
                <div style={{
                  display: "flex", alignItems: "center", gap: "1rem",
                  padding: "1rem 1.25rem",
                  cursor: jobs?.length > 0 ? "pointer" : "default"
                }}
                  onClick={() => jobs?.length > 0 && setExpanded(isOpen ? null : i)}
                >
                  {/* Avatar */}
                  <div style={{
                    width: "46px", height: "46px", borderRadius: "50%",
                    background: "linear-gradient(135deg,#667eea,#764ba2)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "1.1rem", fontWeight: 700, color: "#fff",
                    overflow: "hidden", flexShrink: 0
                  }}>
                    {avatar
                      ? <img src={avatar} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      : (client?.name || "?").charAt(0).toUpperCase()
                    }
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: "0.95rem", marginBottom: "0.2rem" }}>
                      {client?.name || "Unknown"}
                    </div>
                    <div style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.45)", display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                      {client?.email && <span>✉️ {client.email}</span>}
                      {client?.phone && <span>📞 {client.phone}</span>}
                    </div>
                  </div>

                  {/* Right side */}
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexShrink: 0 }}>
                    {source === "hired" && (
                      <span style={{
                        background: "rgba(16,185,129,0.12)", color: "#34d399",
                        border: "1px solid rgba(16,185,129,0.25)",
                        borderRadius: "20px", padding: "2px 10px", fontSize: "0.72rem", fontWeight: 600
                      }}>
                        ⭐ Hired
                      </span>
                    )}
                    {jobs?.length > 0 && (
                      <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.8rem" }}>
                        {jobs.length} job{jobs.length !== 1 ? "s" : ""}
                      </span>
                    )}
                    {jobs?.length > 0 && (
                      <span style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.8rem" }}>
                        {isOpen ? "▲" : "▼"}
                      </span>
                    )}
                  </div>
                </div>

                {/* Job history — expanded */}
                {isOpen && jobs?.length > 0 && (
                  <div style={{
                    borderTop: "1px solid rgba(255,255,255,0.07)",
                    padding: "0.75rem 1.25rem 1rem"
                  }}>
                    <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "0.6rem" }}>
                      Job History
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                      {jobs.map((job) => (
                        <div key={job._id} style={{
                          display: "flex", alignItems: "center", justifyContent: "space-between",
                          padding: "0.6rem 0.85rem",
                          background: "rgba(255,255,255,0.03)", borderRadius: "8px"
                        }}>
                          <div>
                            <span style={{ fontSize: "0.85rem", fontWeight: 500 }}>
                              {job.vehicleType} — {job.problem}
                            </span>
                            <div style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.35)", marginTop: "2px" }}>
                              {new Date(job.createdAt).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}
                            </div>
                          </div>
                          <StatusBadge status={job.status} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyClients;
