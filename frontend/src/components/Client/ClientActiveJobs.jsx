import { useState, useEffect, useRef } from "react";
import { useSocket } from "../../context/SocketContext";
import axios from "axios";
import "./ClientActiveJobs.css";
import PaymentModal from "./PaymentModal";
import ReviewModal from "./ReviewModal";

const ClientActiveJobs = () => {
    const [activeJob, setActiveJob]   = useState(null);
    const [loading, setLoading]       = useState(true);
    const [showPricing, setShowPricing] = useState(false);
    const [showReview, setShowReview] = useState(false);
    const [paidJob, setPaidJob]       = useState(null);
    const [showThanks, setShowThanks] = useState(false);
    const thanksTimer = useRef(null);

    const socketContext = useSocket();
    const socket = socketContext ? socketContext.socket : null;

    const fetchActiveJob = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get(
                `${import.meta.env.VITE_API_URL}/services/my-active-job`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setActiveJob(response.data.data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching active job:", error);
            setActiveJob(null);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchActiveJob();
        return () => clearTimeout(thanksTimer.current);
    }, []);

    useEffect(() => {
        if (socket) {
            const handleJobAccepted  = (data) => setActiveJob(data.job);
            const handleStatusUpdate = (data) => setActiveJob(data.job);
            const handleLocationUpdate = (data) => {
                setActiveJob(prev => {
                    if (!prev || prev._id !== data.jobId) return prev;
                    return {
                        ...prev,
                        mechanic: {
                            ...prev.mechanic,
                            location: {
                                ...prev.mechanic?.location,
                                coordinates: [data.location.longitude, data.location.latitude]
                            }
                        }
                    };
                });
            };

            socket.on("job:accepted",           handleJobAccepted);
            socket.on("job:status:update",      handleStatusUpdate);
            socket.on("mechanic:location:update", handleLocationUpdate);

            return () => {
                socket.off("job:accepted",           handleJobAccepted);
                socket.off("job:status:update",      handleStatusUpdate);
                socket.off("mechanic:location:update", handleLocationUpdate);
            };
        }
    }, [socket]);

    // ── Trigger thank-you screen then clear everything ──────────────────────────
    const triggerThanks = () => {
        setShowReview(false);
        setPaidJob(null);
        setShowThanks(true);
        clearTimeout(thanksTimer.current);
        thanksTimer.current = setTimeout(() => setShowThanks(false), 2500);
    };

    const handleContinueToPricing = () => setShowPricing(true);

    const handlePaymentSuccess = (method) => {
        setShowPricing(false);
        setPaidJob({ ...activeJob });
        setActiveJob(null);
        setShowReview(true);
    };

    // ── After review "Done" / skip → show 2-second thank you ──────────────────
    const handleReviewClose = () => triggerThanks();

    // ── Distance helper ─────────────────────────────────────────────────────────
    const calculateDistance = () => {
        if (!activeJob?.location?.coordinates || !activeJob?.mechanic?.location?.coordinates) return null;
        const [lon1, lat1] = activeJob.location.coordinates;
        const [lon2, lat2] = activeJob.mechanic.location.coordinates;
        const R = 6371;
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) ** 2;
        return (R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(2);
    };

    const distance = calculateDistance();

    if (loading) return <div className="loading">Loading active jobs...</div>;

    // ── Thank-you screen ────────────────────────────────────────────────────────
    if (showThanks) {
        return (
            <div className="active-jobs-container">
                <div className="thanks-overlay">
                    <div className="thanks-icon">✓</div>
                    <h2 className="thanks-title">Thank you for using SteadyFast!</h2>
                    <p className="thanks-sub">Your service has been completed. We hope to see you again.</p>
                </div>
            </div>
        );
    }

    // ── No active job ───────────────────────────────────────────────────────────
    if (!activeJob) {
        return (
            <>
                <div className="active-jobs-container">
                    <h2>Active Jobs</h2>
                    <div className="no-job">
                        <div className="no-job-icon">🚗</div>
                        <h3>No Active Service Requests</h3>
                        <p>You don't have any ongoing service requests at the moment.</p>
                    </div>
                </div>
                {showReview && paidJob && (
                    <ReviewModal job={paidJob} onClose={handleReviewClose} />
                )}
            </>
        );
    }

    const getStatusInfo = (status) => {
        const map = {
            pending:    { text: "Finding Mechanic",  icon: "🔍", class: "pending" },
            accepted:   { text: "Mechanic Assigned", icon: "✅", class: "accepted" },
            on_the_way: { text: "On The Way",        icon: "🚗", class: "on-the-way" },
            arrived:    { text: "Mechanic Arrived",  icon: "📍", class: "arrived" },
            completed:  { text: "Completed",         icon: "🎉", class: "completed" },
        };
        return map[status] || { text: status, icon: "⏳", class: "unknown" };
    };

    const statusInfo = getStatusInfo(activeJob.status);

    return (
        <div className="active-jobs-container">
            <header className="active-jobs-header">
                <h2>🚗 Active Service Request</h2>
                <p>Tracking your request in real-time.</p>
            </header>

            <div className="job-card premium-card">
                {/* Status + timeline */}
                <div className="status-section">
                    <div className="status-header">
                        <h3>Status</h3>
                        <div className={`status-badge ${statusInfo.class}`}>
                            <span className="status-icon">{statusInfo.icon}</span>
                            <span className="status-text">{statusInfo.text}</span>
                        </div>
                    </div>

                    <div className="bridge-timeline">
                        {['pending', 'accepted', 'on_the_way', 'arrived', 'completed'].map((s, idx) => {
                            const labels = ['Requested', 'Accepted', 'On Way', 'Arrived', 'Done'];
                            const activeIdx = ['pending', 'accepted', 'on_the_way', 'arrived', 'completed'].indexOf(activeJob.status);
                            const isActive = activeIdx >= idx;
                            return (
                                <div key={s} className={`timeline-step ${isActive ? 'active' : ''}`}>
                                    <div className="step-marker">{idx + 1}</div>
                                    <div className="step-label">{labels[idx]}</div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Live distance tracker */}
                {activeJob.status === 'on_the_way' && distance && (
                    <div className="live-tracker-section">
                        <div className="tracker-label">
                            <span>📍 Real-time Distance</span>
                            <span className="distance-value">{distance} km away</span>
                        </div>
                        <div className="distance-meter">
                            <div className="meter-track">
                                <div className="meter-line" style={{ width: `${Math.max(5, 100 - (distance * 10))}%` }} />
                                <div className="mechanic-indicator" style={{ left: `${Math.max(5, 100 - (distance * 10))}%` }}>
                                    <img src="/icons/mechanic_loc.png" alt="M"
                                        style={{ width: '24px' }}
                                        onError={e => e.target.src = '/icons/car.png'} />
                                </div>
                            </div>
                        </div>
                        <p className="tracker-hint">Mechanic is approaching your location.</p>
                    </div>
                )}

                {/* Info grid */}
                <div className="info-grid">
                    <div className="info-section">
                        <h3>Service Details</h3>
                        <div className="details-list">
                            <div className="detail-row"><span className="label">Vehicle:</span><span className="value">{activeJob.vehicleType}</span></div>
                            <div className="detail-row"><span className="label">Problem:</span><span className="value">{activeJob.problem}</span></div>
                            <div className="detail-row"><span className="label">Estimated:</span><span className="value price-highlight">${activeJob.price}</span></div>
                        </div>
                    </div>

                    {activeJob.mechanic && activeJob.status !== 'pending' && (
                        <div className="info-section">
                            <h3>Assigned Mechanic</h3>
                            <div className="mechanic-mini-card">
                                <div className="m-avatar">
                                    {activeJob.mechanic.profileImage ? (
                                        <img
                                            src={activeJob.mechanic.profileImage.startsWith('http')
                                                ? activeJob.mechanic.profileImage
                                                : `${import.meta.env.VITE_API_URL.replace('/api', '')}${activeJob.mechanic.profileImage}`}
                                            alt="M"
                                        />
                                    ) : (
                                        <div className="avatar-placeholder">{activeJob.mechanic.name?.charAt(0)}</div>
                                    )}
                                </div>
                                <div className="m-info">
                                    <strong>{activeJob.mechanic.name}</strong>
                                    <span>{activeJob.mechanic.expertiseLevel}</span>
                                </div>
                            </div>
                            <div className="m-actions">
                                <a href={`tel:${activeJob.mechanic.phone}`} className="call-btn">📞 Call Now</a>
                            </div>
                        </div>
                    )}
                </div>

                {/* Completion actions */}
                {activeJob.status === 'completed' && (
                    <div className="completion-action" style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                        <button className="pricing-btn" onClick={handleContinueToPricing}>
                            💰 Continue to Pricing & Payment →
                        </button>
                        <button
                            className="pricing-btn"
                            style={{ background: "linear-gradient(135deg,#f59e0b,#d97706)" }}
                            onClick={() => { setPaidJob({ ...activeJob }); setShowReview(true); }}
                        >
                            ⭐ Leave a Review
                        </button>
                    </div>
                )}

                <div className="job-footer-stats">
                    <span>Started: {new Date(activeJob.createdAt).toLocaleTimeString()}</span>
                    {activeJob.completedAt && <span>Finished: {new Date(activeJob.completedAt).toLocaleTimeString()}</span>}
                </div>
            </div>

            {showPricing && (
                <PaymentModal
                    job={activeJob}
                    onSuccess={handlePaymentSuccess}
                    onClose={() => setShowPricing(false)}
                />
            )}

            {showReview && paidJob && (
                <ReviewModal job={paidJob} onClose={handleReviewClose} />
            )}
        </div>
    );
};

export default ClientActiveJobs;
