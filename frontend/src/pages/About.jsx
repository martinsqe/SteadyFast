
import "./about.css";

function About() {
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
          <h3>4.8★</h3>
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
          <img src="/branches/b5.jpg" alt="Branch 5" />
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

export default About;
