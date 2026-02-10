import { useEffect, useState } from "react";
import api from "../../api/axios";

const MechanicReviews = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const response = await api.get("/mechanic/reviews");
                setReviews(response.data);
            } catch (error) {
                console.error("Error fetching reviews:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchReviews();
    }, []);

    if (loading) return <div>Loading reviews...</div>;

    return (
        <div className="mechanic-reviews">
            <h2>Client Reviews</h2>
            <div className="reviews-list">
                {reviews.length === 0 ? (
                    <p>No reviews yet.</p>
                ) : (
                    reviews.map(review => (
                        <div key={review._id} className="review-card">
                            <div className="review-header">
                                <div className="reviewer-info">
                                    <strong>{review.client.name}</strong>
                                    <span className="review-date">
                                        {new Date(review.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                                <div className="review-rating">
                                    {"⭐".repeat(review.rating)}
                                </div>
                            </div>
                            <p className="review-text">{review.comment}</p>
                            <div className="review-job-info">
                                <small>Service: {review.job?.serviceType} - {review.job?.vehicle?.make} {review.job?.vehicle?.model}</small>
                            </div>
                        </div>
                    ))
                )}
            </div>
            <style jsx>{`
                .reviews-list {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }
                .review-card {
                    background: #374151;
                    padding: 1.5rem;
                    border-radius: 8px;
                    border: 1px solid #4b5563;
                }
                .review-header {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 0.5rem;
                }
                .review-date {
                    margin-left: 1rem;
                    color: #9ca3af;
                    font-size: 0.85rem;
                }
                .review-text {
                    color: #e5e7eb;
                    margin-bottom: 0.5rem;
                }
                .review-job-info {
                    color: #9ca3af;
                    font-size: 0.8rem;
                }
            `}</style>
        </div>
    );
};

export default MechanicReviews;
