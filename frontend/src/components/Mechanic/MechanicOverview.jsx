import { useState, useEffect } from "react";
import axios from "axios";

const API = import.meta.env.VITE_API_URL;
const BASE = API ? API.replace("/api", "") : "http://localhost:5000";

const Stars = ({ rating, size = "1rem" }) => (
  <span style={{ display: "inline-flex", gap: "2px" }}>
    {[1, 2, 3, 4, 5].map((s) => (
      <span key={s} style={{ color: s <= Math.round(rating) ? "#f59e0b" : "rgba(255,255,255,0.15)", fontSize: size }}>★</span>
    ))}
  </span>
);

function MechanicOverview() {
  const [earnings, setEarnings] = useState({ completedJobs: 0, totalEarnings: 0 });
  const [reviews, setReviews] = useState([]);
  const [reviewStats, setReviewStats] = useState({ averageRating: 0, totalReviews: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };

    Promise.all([
      axios.get(`${API}/mechanic/earnings`, { headers }),
      axios.get(`${API}/mechanic/reviews`, { headers }),
    ])
      .then(([earningsRes, reviewsRes]) => {
        const d = earningsRes.data.data;
        setEarnings({ completedJobs: d.completedJobs || 0, totalEarnings: d.totalEarnings || 0 });
        setReviews(reviewsRes.data.reviews || []);
        setReviewStats({
          averageRating: reviewsRes.data.averageRating || 0,
          totalReviews: reviewsRes.data.totalReviews || 0,
        });
      })
      .catch((err) => console.error("Error fetching overview:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div style={{ color: "#fff", padding: "2rem" }}>Loading dashboard...</div>;
  }

  const statCards = [
    { label: "Completed Jobs", value: earnings.completedJobs, color: "#3b82f6", prefix: "" },
    { label: "Total Earnings",  value: `$${earnings.totalEarnings.toLocaleString()}`, color: "#10b981", prefix: "" },
    { label: "Average Rating",  value: reviewStats.averageRating > 0 ? reviewStats.averageRating.toFixed(1) : "—", color: "#f59e0b", prefix: reviewStats.averageRating > 0 ? "⭐ " : "" },
    { label: "Total Reviews",   value: reviewStats.totalReviews, color: "#a78bfa", prefix: "" },
  ];

  return (
    <div style={{ color: "#fff", maxWidth: "900px" }}>
      <div style={{ marginBottom: "1.75rem" }}>
        <h2 style={{ fontSize: "1.4rem", fontWeight: 700, margin: "0 0 0.25rem" }}>Dashboard</h2>
        <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.85rem", margin: 0 }}>
          Your performance at a glance
        </p>
      </div>

      {/* Stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
        {statCards.map(({ label, value, color, prefix }) => (
          <div key={label} style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.09)",
            borderRadius: "14px", padding: "1.25rem 1.5rem",
          }}>
            <div style={{ fontSize: "1.8rem", fontWeight: 800, color, lineHeight: 1.1, marginBottom: "0.4rem" }}>
              {prefix}{value}
            </div>
            <div style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.45)" }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Recent Reviews */}
      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
          <h3 style={{ fontSize: "1rem", fontWeight: 700, margin: 0 }}>Recent Client Reviews</h3>
          {reviewStats.totalReviews > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Stars rating={reviewStats.averageRating} />
              <span style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.45)" }}>
                {reviewStats.averageRating.toFixed(1)} · {reviewStats.totalReviews} review{reviewStats.totalReviews !== 1 ? "s" : ""}
              </span>
            </div>
          )}
        </div>

        {reviews.length === 0 ? (
          <div style={{
            textAlign: "center", padding: "3rem 2rem",
            background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "14px",
          }}>
            <div style={{ fontSize: "3rem", marginBottom: "0.75rem", opacity: 0.4 }}>⭐</div>
            <p style={{ fontWeight: 600, color: "rgba(255,255,255,0.5)", margin: "0 0 0.3rem" }}>No reviews yet</p>
            <p style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.3)", margin: 0 }}>
              Reviews will appear here after clients rate your service
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
            {reviews.slice(0, 5).map((review) => {
              const avatar = review.client?.profileImage
                ? (review.client.profileImage.startsWith("http")
                    ? review.client.profileImage
                    : `${BASE}${review.client.profileImage}`)
                : null;

              return (
                <div key={review._id} style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.09)",
                  borderRadius: "14px", padding: "1.1rem 1.25rem",
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.6rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}>
                      <div style={{
                        width: "38px", height: "38px", borderRadius: "50%",
                        background: "linear-gradient(135deg,#667eea,#764ba2)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontWeight: 700, fontSize: "0.95rem", color: "#fff",
                        overflow: "hidden", flexShrink: 0,
                      }}>
                        {avatar
                          ? <img src={avatar} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          : (review.client?.name || "?").charAt(0).toUpperCase()
                        }
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: "0.88rem" }}>
                          {review.client?.name || "Client"}
                        </div>
                        <div style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.35)" }}>
                          {new Date(review.createdAt).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}
                        </div>
                      </div>
                    </div>
                    <Stars rating={review.rating} />
                  </div>

                  {review.job && (
                    <div style={{
                      display: "inline-flex", alignItems: "center", gap: "0.4rem",
                      background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "20px", padding: "2px 9px",
                      fontSize: "0.72rem", color: "rgba(255,255,255,0.45)",
                      marginBottom: "0.6rem",
                    }}>
                      🔧 {review.job.vehicleType} — {review.job.problem}
                    </div>
                  )}

                  <p style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.7)", lineHeight: 1.55, margin: 0 }}>
                    "{review.comment}"
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default MechanicOverview;
