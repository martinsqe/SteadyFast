
import { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import "./about.css";

const API = import.meta.env.VITE_API_URL;
const BASE = API ? API.replace("/api", "") : "http://localhost:5000";

const StarRow = ({ rating }) => (
  <span className="star-row">
    {[1,2,3,4,5].map(s => (
      <span key={s} className={s <= rating ? "star filled" : "star"}>★</span>
    ))}
  </span>
);

function About() {
  const [reviews, setReviews] = useState([]);
  const [reviewStats, setReviewStats] = useState({ averageRating: 0, totalReviews: 0 });
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const autoTimer = useRef(null);

  const PER_PAGE = 4;

  const totalPages = useCallback(
    (list) => Math.ceil(list.length / PER_PAGE),
    []
  );

  const startAutoPlay = useCallback((list) => {
    clearInterval(autoTimer.current);
    autoTimer.current = setInterval(() => {
      setCarouselIndex(prev => {
        const pages = Math.ceil(list.length / PER_PAGE);
        return (prev + 1) % pages;
      });
    }, 5000);
  }, []);

  useEffect(() => {
    return () => clearInterval(autoTimer.current);
  }, []);

  useEffect(() => {
    axios.get(`${API}/services/reviews/public`)
      .then(res => {
        const list = res.data.reviews || [];
        setReviews(list);
        setReviewStats({ averageRating: res.data.averageRating || 0, totalReviews: res.data.totalReviews || 0 });
        if (list.length > PER_PAGE) startAutoPlay(list);
      })
      .catch(err => console.error("Failed to load reviews:", err))
      .finally(() => setReviewsLoading(false));
  }, []);

  const displayRating = reviewStats.averageRating > 0
    ? `${reviewStats.averageRating.toFixed(1)}★`
    : "4.8★";

  return (
    <div className="about-container">
      {/* HERO */}
      <section className="about-hero">
        <h1>About SteadyFast</h1>
        <p>
          SteadyFast is a nationwide 24/7 roadside assistance platform
          connecting stranded drivers to verified mechanics in minutes.
        </p>
      </section>

      {/* MISSION */}
      <section className="about-section">
        <h2>Our Mission</h2>
        <p>
          To make every road safer by providing fast, reliable, and affordable
          roadside assistance anywhere in the country — anytime.
        </p>
      </section>

      {/* WHY US */}
      <section className="about-section about-features">
        <h2>Why Choose SteadyFast?</h2>
        <div className="feature-grid">
          <div className="feature-card">⚡ 24/7 Instant Support</div>
          <div className="feature-card">🧰 Verified Mechanics</div>
          <div className="feature-card">📍 Nationwide Coverage</div>
          <div className="feature-card">💳 Transparent Pricing</div>
          <div className="feature-card">⭐ Trusted by Thousands</div>
        </div>
      </section>

      {/* STATS */}
      <section className="about-section stats">
        <div>
          <h3>50,000+</h3>
          <p>Drivers Helped</p>
        </div>
        <div>
          <h3>1,200+</h3>
          <p>Partner Mechanics</p>
        </div>
        <div>
          <h3>120+</h3>
          <p>Cities Covered</p>
        </div>
        <div>
          <h3>{displayRating}</h3>
          <p>Average Rating</p>
        </div>
      </section>

      {/* CUSTOMERS */}
      <section className="about-section">
        <h2>Trusted By</h2>
        <p className="muted">
          We proudly support individuals, fleets, delivery services, and
          transport companies nationwide.
        </p>

        <div className="customer-logos">
          <div className="logo-card">Uber Fleet</div>
          <div className="logo-card">FedEx Partner</div>
          <div className="logo-card">City Transport</div>
          <div className="logo-card">AutoMart</div>
          <div className="logo-card">QuickDeliver</div>
        </div>
      </section>

      {/* BRANCHES */}
      <section className="about-section">
        <h2>Our Branches Across the Country</h2>

        <div className="branch-grid">
          <img src="/branches/b1.jpg" alt="Branch 1" />
          <img src="/branches/b2.jpg" alt="Branch 2" />
          <img src="/branches/b3.jpg" alt="Branch 3" />
          <img src="/branches/b4.jpg" alt="Branch 4" />
        </div>
      </section>

      {/* REVIEWS */}
      <section className="about-section">
        <h2>What Our Clients Say</h2>
        {reviewStats.totalReviews > 0 && (
          <p className="muted">
            {reviewStats.totalReviews} verified review{reviewStats.totalReviews !== 1 ? "s" : ""} &nbsp;·&nbsp; {reviewStats.averageRating.toFixed(1)}★ average
          </p>
        )}

        {reviewsLoading ? (
          <p className="muted" style={{ marginTop: "2rem" }}>Loading reviews...</p>
        ) : reviews.length === 0 ? (
          <p className="muted" style={{ marginTop: "2rem" }}>No reviews yet — be the first!</p>
        ) : (() => {
          const pages = Math.ceil(reviews.length / PER_PAGE);
          const visible = reviews.slice(carouselIndex * PER_PAGE, carouselIndex * PER_PAGE + PER_PAGE);

          const go = (dir) => {
            setCarouselIndex(prev => (prev + dir + pages) % pages);
            startAutoPlay(reviews);
          };

          return (
            <div className="carousel-wrapper">
              {pages > 1 && (
                <button className="carousel-btn carousel-prev" onClick={() => go(-1)} aria-label="Previous">
                  <svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
                </button>
              )}

              <div className="reviews-grid">
                {visible.map(review => {
                  const avatar = review.client?.profileImage
                    ? (review.client.profileImage.startsWith("http")
                        ? review.client.profileImage
                        : `${BASE}${review.client.profileImage}`)
                    : null;

                  return (
                    <div key={review._id} className="review-card">
                      <div className="review-top">
                        <div className="review-avatar">
                          {avatar
                            ? <img src={avatar} alt="" />
                            : (review.client?.name || "?").charAt(0).toUpperCase()
                          }
                        </div>
                        <div className="review-meta">
                          <strong>{review.client?.name || "Client"}</strong>
                          <span className="review-date">
                            {new Date(review.createdAt).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}
                          </span>
                        </div>
                        <StarRow rating={review.rating} />
                      </div>

                      {(review.job || review.mechanic) && (
                        <div className="review-tags">
                          {review.mechanic && (
                            <span className="review-tag">🔧 {review.mechanic.name}</span>
                          )}
                          {review.job && (
                            <span className="review-tag">🚗 {review.job.vehicleType} — {review.job.problem}</span>
                          )}
                        </div>
                      )}

                      <p className="review-comment">"{review.comment}"</p>
                    </div>
                  );
                })}
              </div>

              {pages > 1 && (
                <button className="carousel-btn carousel-next" onClick={() => go(1)} aria-label="Next">
                  <svg viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>
                </button>
              )}

              {pages > 1 && (
                <div className="carousel-dots">
                  {Array.from({ length: pages }).map((_, i) => (
                    <span
                      key={i}
                      className={`carousel-dot${i === carouselIndex ? " active" : ""}`}
                      onClick={() => { setCarouselIndex(i); startAutoPlay(reviews); }}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })()}
      </section>

      {/* FAQ */}
      <section className="about-faq-section">
        <div className="about-faq-badge">FAQ</div>
        <h2 className="about-faq-heading">Frequently Asked Questions</h2>
        <p className="about-faq-sub">
          Everything you need to know about SteadyFast, answered clearly.
        </p>
        <div className="about-faq-grid">
          {[
            {
              icon: "⚡",
              q: "How quickly can a mechanic reach me?",
              a: "In most urban areas, a mechanic arrives within 10–25 minutes of your request being accepted. Our network of verified mechanics is spread across 120+ cities to ensure rapid response times."
            },
            {
              icon: "💳",
              q: "What payment methods do you accept?",
              a: "We accept Credit/Debit Cards (Stripe), UPI via Razorpay, M-Pesa STK Push for mobile money payments, and Cash on arrival — giving you full flexibility no matter where you are."
            },
            {
              icon: "🔒",
              q: "Is the $1 platform fee refundable?",
              a: "The platform fee covers our dispatch service and is non-refundable once a mechanic has been assigned to your request. The actual service fee is agreed upon and paid after completion."
            },
            {
              icon: "✅",
              q: "How are mechanics verified?",
              a: "Every mechanic on SteadyFast goes through an identity check, skills assessment, and background verification before being approved. We also monitor ratings and client feedback continuously."
            },
            {
              icon: "📍",
              q: "Can I track the mechanic in real-time?",
              a: "Yes! Once a mechanic marks themselves 'On the Way', you can track their live location with a distance indicator that updates every 10 seconds until they arrive."
            },
            {
              icon: "🔔",
              q: "What if no mechanic is available?",
              a: "Your request stays active and visible to all nearby mechanics. You'll receive an instant notification the moment one accepts. For emergencies, call our 24/7 hotline directly."
            },
            {
              icon: "🔧",
              q: "What types of vehicle problems do you cover?",
              a: "We handle flat tyres, battery jump-starts, engine breakdowns, fuel delivery, lockouts, overheating, and general roadside faults. If you're unsure, describe the problem and our mechanics will assess it."
            },
            {
              icon: "🤝",
              q: "How do I become a SteadyFast mechanic?",
              a: "Sign up as a mechanic from the home page, complete your profile and skills verification, and our team will review your application within 48 hours. Approved mechanics start receiving job requests immediately."
            },
          ].map((item, i) => (
            <AboutFAQItem key={i} index={i + 1} icon={item.icon} q={item.q} a={item.a} />
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="about-cta">
        <h2>Need Roadside Help Right Now?</h2>
        <p>We’re ready — anytime, anywhere.</p>
        <button>Get Help Now</button>
      </section>
    </div>
  );
}

function AboutFAQItem({ index, icon, q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`about-faq-item${open ? " open" : ""}`} onClick={() => setOpen(o => !o)}>
      <div className="about-faq-item-header">
        <div className="about-faq-icon-wrap">
          <span className="about-faq-icon">{icon}</span>
          <span className="about-faq-num">0{index}</span>
        </div>
        <div className="about-faq-q">
          <span>{q}</span>
          <span className={`about-faq-chevron${open ? " open" : ""}`}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </span>
        </div>
      </div>
      {open && <div className="about-faq-a">{a}</div>}
    </div>
  );
}

export default About;
