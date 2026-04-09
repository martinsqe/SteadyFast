import { useEffect, useState } from "react";
import axios from "axios";

const API = import.meta.env.VITE_API_URL;
const BASE = API ? API.replace("/api", "") : "http://localhost:5000";

const Stars = ({ rating }) => (
  <span>
    {[1, 2, 3, 4, 5].map((s) => (
      <span key={s} style={{ color: s <= rating ? "#f59e0b" : "rgba(255,255,255,0.15)", fontSize: "1rem" }}>★</span>
    ))}
  </span>
);

const MechanicReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({ averageRating: 0, totalReviews: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    axios
      .get(`${API}/mechanic/reviews`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        setReviews(res.data.reviews || []);
        setStats({ averageRating: res.data.averageRating || 0, totalReviews: res.data.totalReviews || 0 });
      })
      .catch(() => setError("Failed to load reviews."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ color: "#fff", padding: "2rem" }}>Loading reviews...</div>;
  if (error)   return <div style={{ color: "#f87171", padding: "2rem" }}>{error}</div>;

  return (
    <div style={{ color: "#fff", maxWidth: "800px" }}>
      {/* Header stats */}
      <div style={{ marginBottom: "1.75rem" }}>
        <h2 style={{ fontSize: "1.4rem", fontWeight: 700, margin: "0 0 0.25rem" }}>Client Reviews</h2>
        <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.85rem", margin: 0 }}>
          Feedback from clients you have served
        </p>
      </div>

      {stats.totalReviews > 0 && (
        <div style={{
          display: "flex", alignItems: "center", gap: "1.5rem",
          background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: "14px", padding: "1.25rem 1.5rem", marginBottom: "1.5rem"
        }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "2.5rem", fontWeight: 800, color: "#f59e0b", lineHeight: 1 }}>
              {stats.averageRating.toFixed(1)}
            </div>
            <Stars rating={Math.round(stats.averageRating)} />
          </div>
          <div style={{ width: "1px", height: "50px", background: "rgba(255,255,255,0.1)" }} />
          <div>
            <div style={{ fontSize: "1.5rem", fontWeight: 700 }}>{stats.totalReviews}</div>
            <div style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.45)" }}>
              Total Review{stats.totalReviews !== 1 ? "s" : ""}
            </div>
          </div>
        </div>
      )}

      {reviews.length === 0 ? (
        <div style={{
          textAlign: "center", padding: "3rem 2rem",
          background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "14px"
        }}>
          <div style={{ fontSize: "3rem", marginBottom: "0.75rem", opacity: 0.4 }}>⭐</div>
          <p style={{ fontWeight: 600, color: "rgba(255,255,255,0.5)", margin: "0 0 0.3rem" }}>
            No reviews yet
          </p>
          <p style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.3)", margin: 0 }}>
            Reviews will appear here after clients rate your service
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {reviews.map((review) => {
            const avatar = review.client?.profileImage
              ? (review.client.profileImage.startsWith("http")
                  ? review.client.profileImage
                  : `${BASE}${review.client.profileImage}`)
              : null;

            return (
              <div key={review._id} style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.09)",
                borderRadius: "14px", padding: "1.25rem 1.5rem"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
                  {/* Client info */}
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <div style={{
                      width: "40px", height: "40px", borderRadius: "50%",
                      background: "linear-gradient(135deg,#667eea,#764ba2)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontWeight: 700, fontSize: "1rem", color: "#fff",
                      overflow: "hidden", flexShrink: 0
                    }}>
                      {avatar
                        ? <img src={avatar} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        : (review.client?.name || "?").charAt(0).toUpperCase()
                      }
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: "0.95rem" }}>
                        {review.client?.name || "Client"}
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.4)" }}>
                        {new Date(review.createdAt).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}
                      </div>
                    </div>
                  </div>
                  {/* Stars */}
                  <Stars rating={review.rating} />
                </div>

                {/* Job info tag */}
                {review.job && (
                  <div style={{
                    display: "inline-flex", alignItems: "center", gap: "0.4rem",
                    background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "20px", padding: "3px 10px",
                    fontSize: "0.75rem", color: "rgba(255,255,255,0.5)",
                    marginBottom: "0.75rem"
                  }}>
                    🔧 {review.job.vehicleType} — {review.job.problem}
                  </div>
                )}

                {/* Comment */}
                <p style={{
                  fontSize: "0.88rem", color: "rgba(255,255,255,0.75)",
                  lineHeight: 1.6, margin: 0
                }}>
                  "{review.comment}"
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MechanicReviews;
