import { useState, useEffect, useContext } from "react";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";

const StarRating = ({ rating, size = "1rem" }) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalf = rating - fullStars >= 0.5;

    for (let i = 1; i <= 5; i++) {
        if (i <= fullStars) {
            stars.push(<span key={i} style={{ color: '#f59e0b', fontSize: size }}>&#9733;</span>);
        } else if (i === fullStars + 1 && hasHalf) {
            stars.push(<span key={i} style={{ color: '#f59e0b', fontSize: size }}>&#9733;</span>);
        } else {
            stars.push(<span key={i} style={{ color: 'rgba(255,255,255,0.2)', fontSize: size }}>&#9733;</span>);
        }
    }
    return <span style={{ display: 'inline-flex', gap: '2px' }}>{stars}</span>;
};

const ReviewsPanel = ({ mechanicId, mechanicName, onClose }) => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ averageRating: 0, totalReviews: 0 });

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const res = await api.get(`/services/mechanic/${mechanicId}/reviews`);
                setReviews(res.data.reviews);
                setStats({ averageRating: res.data.averageRating, totalReviews: res.data.totalReviews });
            } catch (err) {
                console.error("Failed to fetch reviews:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchReviews();
    }, [mechanicId]);

    return (
        <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', zIndex: 1000, padding: '1rem'
        }} onClick={onClose}>
            <div style={{
                background: '#1a1a2e', borderRadius: '16px', width: '100%',
                maxWidth: '520px', maxHeight: '80vh', overflow: 'hidden',
                border: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column'
            }} onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h2 style={{ color: '#fff', margin: 0, fontSize: '1.15rem' }}>Reviews for {mechanicName}</h2>
                        <button onClick={onClose} style={{
                            background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)',
                            fontSize: '1.5rem', cursor: 'pointer', padding: 0, lineHeight: 1
                        }}>&times;</button>
                    </div>
                    {stats.totalReviews > 0 && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.75rem' }}>
                            <span style={{ fontSize: '2rem', fontWeight: 700, color: '#f59e0b' }}>{stats.averageRating}</span>
                            <div>
                                <StarRating rating={stats.averageRating} size="1.1rem" />
                                <p style={{ color: 'rgba(255,255,255,0.5)', margin: '0.2rem 0 0', fontSize: '0.8rem' }}>
                                    {stats.totalReviews} review{stats.totalReviews !== 1 ? 's' : ''}
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Reviews list */}
                <div style={{ overflowY: 'auto', padding: '1rem 1.5rem', flex: 1 }}>
                    {loading ? (
                        <p style={{ color: 'rgba(255,255,255,0.5)', textAlign: 'center', padding: '2rem 0' }}>Loading reviews...</p>
                    ) : reviews.length === 0 ? (
                        <p style={{ color: 'rgba(255,255,255,0.5)', textAlign: 'center', padding: '2rem 0' }}>No reviews yet</p>
                    ) : (
                        reviews.map((review) => (
                            <div key={review._id} style={{
                                padding: '1rem 0',
                                borderBottom: '1px solid rgba(255,255,255,0.06)'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <div style={{
                                            width: '30px', height: '30px', borderRadius: '50%',
                                            background: 'linear-gradient(135deg, #667eea, #764ba2)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            color: '#fff', fontSize: '0.75rem', fontWeight: 700
                                        }}>
                                            {review.client?.name?.charAt(0).toUpperCase() || '?'}
                                        </div>
                                        <span style={{ color: '#fff', fontSize: '0.9rem', fontWeight: 500 }}>
                                            {review.client?.name || 'Client'}
                                        </span>
                                    </div>
                                    <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem' }}>
                                        {new Date(review.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                                <StarRating rating={review.rating} size="0.85rem" />
                                {review.job && (
                                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', margin: '0.3rem 0' }}>
                                        {review.job.vehicleType} - {review.job.problem}
                                    </p>
                                )}
                                <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.85rem', margin: '0.4rem 0 0', lineHeight: 1.5 }}>
                                    {review.comment}
                                </p>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

const ClientMechanics = () => {
    const [mechanics, setMechanics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user, setUser } = useContext(AuthContext);
    const [reviewsPanel, setReviewsPanel] = useState(null); // { id, name }
    const [sortBy, setSortBy] = useState("rating"); // "rating" | "name" | "reviews"

    useEffect(() => {
        fetchMechanics();
    }, []);

    const fetchMechanics = async () => {
        try {
            setLoading(true);
            const response = await api.get("/auth/mechanics");
            setMechanics(response.data.mechanics);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to fetch mechanics");
        } finally {
            setLoading(false);
        }
    };

    const handleAssign = async (mechanicId) => {
        try {
            const response = await api.post("/auth/assign-mechanic", { mechanicId });
            alert(response.data.message);
            // Sync with global auth state using the populated mechanic object from response
            setUser(prev => ({ ...prev, personalMechanic: response.data.personalMechanic }));
        } catch (err) {
            alert(err.response?.data?.message || "Assignment failed");
        }
    };

    const sortedMechanics = [...mechanics].sort((a, b) => {
        if (sortBy === "rating") return (b.averageRating || 0) - (a.averageRating || 0);
        if (sortBy === "reviews") return (b.totalReviews || 0) - (a.totalReviews || 0);
        return a.name.localeCompare(b.name);
    });

    if (loading) return <div className="loading">Finding reliable mechanics...</div>;
    if (error) return <div className="error">{error}</div>;

    const currentMechanicId = user?.personalMechanic?._id || user?.personalMechanic;

    return (
        <div className="admin-container">
            <h1>Registered Mechanics</h1>
            <p className="subtitle">Select a professional to be your personal standby mechanic</p>

            {/* Sort controls */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                {[
                    { key: 'rating', label: 'Top Rated' },
                    { key: 'reviews', label: 'Most Reviewed' },
                    { key: 'name', label: 'A-Z' }
                ].map(opt => (
                    <button
                        key={opt.key}
                        onClick={() => setSortBy(opt.key)}
                        style={{
                            padding: '0.5rem 1rem',
                            borderRadius: '20px',
                            border: sortBy === opt.key ? '1px solid #667eea' : '1px solid rgba(255,255,255,0.2)',
                            background: sortBy === opt.key ? 'rgba(102,126,234,0.2)' : 'rgba(255,255,255,0.05)',
                            color: sortBy === opt.key ? '#667eea' : 'rgba(255,255,255,0.7)',
                            cursor: 'pointer',
                            fontSize: '0.85rem',
                            fontWeight: sortBy === opt.key ? 600 : 400,
                            transition: 'all 0.2s'
                        }}
                    >
                        {opt.label}
                    </button>
                ))}
            </div>

            <div className="stats-grid" style={{ marginBottom: '2rem', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
                {sortedMechanics.length === 0 ? (
                    <p style={{ color: 'white' }}>No mechanics available at the moment.</p>
                ) : (
                    sortedMechanics.map((mech) => (
                        <div
                            key={mech._id}
                            className="stat-card"
                            style={{
                                textAlign: 'left',
                                border: currentMechanicId === mech._id ? '1px solid #10b981' : '1px solid rgba(255,255,255,0.2)',
                                position: 'relative'
                            }}
                        >
                            {currentMechanicId === mech._id && (
                                <span style={{
                                    position: 'absolute',
                                    top: '10px',
                                    right: '10px',
                                    background: '#10b981',
                                    color: 'white',
                                    padding: '2px 8px',
                                    borderRadius: '10px',
                                    fontSize: '0.7rem'
                                }}>
                                    MY MECHANIC
                                </span>
                            )}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                                <div className="user-avatar" style={{ margin: 0 }}>
                                    {mech.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h3 style={{ margin: 0, color: 'white' }}>{mech.name}</h3>
                                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>{mech.email}</p>
                                </div>
                            </div>

                            <div style={{ marginBottom: '0.75rem' }}>
                                <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                                    <strong>Expertise:</strong> {mech.expertiseLevel || 'General Professional'}
                                </p>
                            </div>

                            {/* Rating section */}
                            <div style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                padding: '0.75rem', borderRadius: '10px',
                                background: 'rgba(255,255,255,0.05)', marginBottom: '1rem'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <StarRating rating={mech.averageRating || 0} size="1rem" />
                                    <span style={{ color: '#f59e0b', fontWeight: 700, fontSize: '0.95rem' }}>
                                        {mech.averageRating ? mech.averageRating.toFixed(1) : '0.0'}
                                    </span>
                                </div>
                                <button
                                    onClick={() => setReviewsPanel({ id: mech._id, name: mech.name })}
                                    style={{
                                        background: 'none', border: 'none',
                                        color: '#667eea', fontSize: '0.8rem',
                                        cursor: 'pointer', textDecoration: 'underline',
                                        padding: 0
                                    }}
                                >
                                    {mech.totalReviews || 0} review{(mech.totalReviews || 0) !== 1 ? 's' : ''}
                                </button>
                            </div>

                            <button
                                className="btn-view"
                                style={{
                                    width: '100%',
                                    padding: '0.8rem',
                                    background: currentMechanicId === mech._id ? 'rgba(16, 185, 129, 0.2)' : undefined,
                                    border: currentMechanicId === mech._id ? '1px solid #10b981' : undefined,
                                    color: currentMechanicId === mech._id ? '#10b981' : undefined
                                }}
                                onClick={() => handleAssign(mech._id)}
                                disabled={currentMechanicId === mech._id}
                            >
                                {currentMechanicId === mech._id ? "Assigned as Your Mechanic" : "Hire as My Mechanic"}
                            </button>
                        </div>
                    ))
                )}
            </div>

            {reviewsPanel && (
                <ReviewsPanel
                    mechanicId={reviewsPanel.id}
                    mechanicName={reviewsPanel.name}
                    onClose={() => setReviewsPanel(null)}
                />
            )}
        </div>
    );
};

export default ClientMechanics;
