import { useState } from "react";
import axios from "axios";
import "./ReviewModal.css";

export default function ReviewModal({ job, onClose }) {
    const [rating, setRating]       = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment]     = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError]         = useState("");

    const handleSubmit = async () => {
        if (rating === 0) { setError("Please select a star rating."); return; }
        if (!comment.trim()) { setError("Please write a short comment."); return; }

        setSubmitting(true);
        setError("");
        try {
            const token = localStorage.getItem("token");
            await axios.post(
                `${import.meta.env.VITE_API_URL}/services/${job._id}/review`,
                { rating, comment },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setSubmitted(true);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to submit review. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    if (submitted) {
        return (
            <div className="rv-overlay" onClick={onClose}>
                <div className="rv-container" onClick={(e) => e.stopPropagation()}>
                    <div className="rv-success">
                        <div className="rv-success-icon">&#10003;</div>
                        <h2>Thank You!</h2>
                        <p>Your review has been submitted successfully.</p>
                        <button className="rv-done-btn" onClick={onClose}>Done</button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="rv-overlay" onClick={onClose}>
            <div className="rv-container" onClick={(e) => e.stopPropagation()}>
                <div className="rv-header">
                    <h2>Rate Your Mechanic</h2>
                    <button className="rv-close" onClick={onClose}>&times;</button>
                </div>

                {job.mechanic && (
                    <div className="rv-mechanic-info">
                        <div className="rv-avatar">
                            {job.mechanic.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h3>{job.mechanic.name}</h3>
                            <span>{job.mechanic.expertiseLevel || "Professional Mechanic"}</span>
                        </div>
                    </div>
                )}

                <div className="rv-service-info">
                    <span>{job.vehicleType}</span>
                    <span className="rv-dot"></span>
                    <span>{job.problem}</span>
                </div>

                <div className="rv-stars-section">
                    <p>How was your experience?</p>
                    <div className="rv-stars">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                className={`rv-star ${star <= (hoverRating || rating) ? "active" : ""}`}
                                onClick={() => { setRating(star); setError(""); }}
                                onMouseEnter={() => setHoverRating(star)}
                                onMouseLeave={() => setHoverRating(0)}
                            >
                                &#9733;
                            </button>
                        ))}
                    </div>
                    <span className="rv-rating-label">
                        {rating === 1 && "Poor"}
                        {rating === 2 && "Fair"}
                        {rating === 3 && "Good"}
                        {rating === 4 && "Very Good"}
                        {rating === 5 && "Excellent"}
                    </span>
                </div>

                <div className="rv-comment-section">
                    <label>Share your experience</label>
                    <textarea
                        placeholder="Tell us about the service quality, professionalism, timeliness..."
                        value={comment}
                        onChange={(e) => { setComment(e.target.value); setError(""); }}
                        rows={4}
                    />
                </div>

                {error && (
                    <div className="rv-error">{error}</div>
                )}

                <div className="rv-actions">
                    <button className="rv-skip-btn" onClick={onClose}>Skip</button>
                    <button
                        className="rv-submit-btn"
                        onClick={handleSubmit}
                        disabled={submitting || rating === 0}
                    >
                        {submitting ? "Submitting…" : "Submit Review"}
                    </button>
                </div>
            </div>
        </div>
    );
}
