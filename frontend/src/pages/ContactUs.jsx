import { useState } from "react";
import axios from "axios";
import "./ContactUs.css";

const API = import.meta.env.VITE_API_URL;

const CATEGORIES = [
  "General Inquiry",
  "Technical Support",
  "Billing & Payments",
  "Mechanic Partnership",
  "Emergency Assistance",
  "Feedback & Suggestions",
  "Report a Problem",
];

const CONTACT_CARDS = [
  {
    gradient: "linear-gradient(135deg, #3b82f6, #2563eb)",
    glow: "rgba(59,130,246,0.35)",
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.4 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.96a16 16 0 0 0 6.13 6.13l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
      </svg>
    ),
    label: "Call Us",
    value: "+254 700 000 000",
    sub: "Mon–Fri · 8 AM – 8 PM EAT",
    href: "tel:+254700000000",
    action: "Call now →",
  },
  {
    gradient: "linear-gradient(135deg, #8b5cf6, #7c3aed)",
    glow: "rgba(139,92,246,0.35)",
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
        <polyline points="22,6 12,13 2,6"/>
      </svg>
    ),
    label: "Email Us",
    value: "support@steadyfast.com",
    sub: "We reply within 24 hours",
    href: "mailto:support@steadyfast.com",
    action: "Send email →",
  },
  {
    gradient: "linear-gradient(135deg, #10b981, #059669)",
    glow: "rgba(16,185,129,0.35)",
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
        <circle cx="12" cy="10" r="3"/>
      </svg>
    ),
    label: "Visit Us",
    value: "Nairobi, Kenya",
    sub: "Westlands Business Park · 3rd Floor",
    href: null,
    action: "Get directions →",
  },
  {
    gradient: "linear-gradient(135deg, #f59e0b, #d97706)",
    glow: "rgba(245,158,11,0.35)",
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
      </svg>
    ),
    label: "24/7 Emergency",
    value: "+254 700 911 911",
    sub: "Always available · Never miss a call",
    href: "tel:+254700911911",
    action: "Emergency call →",
  },
];


export default function ContactUs() {
  const [form, setForm] = useState({ name: "", email: "", category: "", subject: "", message: "" });
  const [status, setStatus] = useState("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) return;
    setStatus("sending");
    setErrorMsg("");
    try {
      const res = await axios.post(`${API}/contact`, form);
      if (res.data.success) {
        setStatus("success");
        setForm({ name: "", email: "", category: "", subject: "", message: "" });
      } else throw new Error(res.data.message);
    } catch (err) {
      setStatus("error");
      setErrorMsg(err.response?.data?.message || "Failed to send. Please try again.");
    }
  };

  return (
    <div className="cu-page">

      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <section className="cu-hero">
        <div className="cu-hero-orb cu-orb-1" />
        <div className="cu-hero-orb cu-orb-2" />
        <div className="cu-hero-orb cu-orb-3" />
        <div className="cu-hero-inner">
          <div className="cu-hero-pill">
            <span className="cu-pill-dot" />
            Support &amp; Contact
          </div>
          <h1 className="cu-hero-title">
            We're here <span className="cu-title-accent">whenever</span> you need us
          </h1>
          <p className="cu-hero-sub">
            Stuck on the road or have a question? Reach out through any channel below —
            our team and 24/7 emergency line have you covered.
          </p>
          <div className="cu-hero-stats">
            <div className="cu-stat">
              <span className="cu-stat-num">24/7</span>
              <span className="cu-stat-label">Emergency Line</span>
            </div>
            <div className="cu-stat-divider" />
            <div className="cu-stat">
              <span className="cu-stat-num">&lt; 25 min</span>
              <span className="cu-stat-label">Avg. Response</span>
            </div>
            <div className="cu-stat-divider" />
            <div className="cu-stat">
              <span className="cu-stat-num">4.9 ★</span>
              <span className="cu-stat-label">Customer Rating</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Contact cards ────────────────────────────────────────────────────── */}
      <section className="cu-cards-section">
        <div className="cu-cards-grid">
          {CONTACT_CARDS.map((c, i) => (
            <div className="cu-card" key={i} style={{ "--card-glow": c.glow }}>
              <div className="cu-card-icon-wrap" style={{ background: c.gradient }}>
                {c.icon}
              </div>
              <div className="cu-card-label">{c.label}</div>
              <div className="cu-card-value">{c.value}</div>
              <div className="cu-card-sub">{c.sub}</div>
              {c.href ? (
                <a href={c.href} className="cu-card-action">{c.action}</a>
              ) : (
                <span className="cu-card-action cu-card-action-muted">{c.action}</span>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── Form + side info ─────────────────────────────────────────────────── */}
      <section className="cu-main-section">
        <div className="cu-main-grid">

          {/* Form */}
          <div className="cu-form-panel">
            <div className="cu-panel-header">
              <div className="cu-panel-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
              </div>
              <div>
                <h2 className="cu-panel-title">Send a message</h2>
                <p className="cu-panel-sub">We'll get back to you within 24 hours.</p>
              </div>
            </div>

            {status === "success" ? (
              <div className="cu-success-box">
                <div className="cu-success-ring">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </div>
                <h3 className="cu-success-title">Message sent!</h3>
                <p className="cu-success-sub">
                  Thanks for reaching out. Check your inbox for a confirmation email —
                  we'll be in touch within 24 hours.
                </p>
                <button className="cu-btn-secondary" onClick={() => setStatus("idle")}>
                  Send another message
                </button>
              </div>
            ) : (
              <form className="cu-form" onSubmit={handleSubmit}>
                <div className="cu-form-row">
                  <div className="cu-field">
                    <label>Full Name <span className="cu-req">*</span></label>
                    <input name="name" type="text" placeholder="Jane Doe"
                      value={form.name} onChange={handleChange} required />
                  </div>
                  <div className="cu-field">
                    <label>Email Address <span className="cu-req">*</span></label>
                    <input name="email" type="email" placeholder="jane@example.com"
                      value={form.email} onChange={handleChange} required />
                  </div>
                </div>

                <div className="cu-form-row">
                  <div className="cu-field">
                    <label>Category</label>
                    <select name="category" value={form.category} onChange={handleChange}>
                      <option value="">Select a topic</option>
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="cu-field">
                    <label>Subject</label>
                    <input name="subject" type="text" placeholder="What's this about?"
                      value={form.subject} onChange={handleChange} />
                  </div>
                </div>

                <div className="cu-field">
                  <label>Message <span className="cu-req">*</span></label>
                  <textarea name="message" rows={5}
                    placeholder="Describe your question or issue in detail…"
                    value={form.message} onChange={handleChange} required />
                </div>

                {status === "error" && (
                  <div className="cu-error-msg">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                    </svg>
                    {errorMsg}
                  </div>
                )}

                <button type="submit" className="cu-submit-btn" disabled={status === "sending"}>
                  {status === "sending" ? (
                    <><span className="cu-spinner" /> Sending…</>
                  ) : (
                    <>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                      </svg>
                      Send Message
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Side panel */}
          <aside className="cu-side">

            {/* Response times */}
            <div className="cu-info-card">
              <h3 className="cu-info-title">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                </svg>
                Response Times
              </h3>
              <div className="cu-response-list">
                {[
                  { color: "#10b981", shadow: "rgba(16,185,129,0.5)", label: "Emergency Line", sub: "Immediate · 24/7" },
                  { color: "#3b82f6", shadow: "rgba(59,130,246,0.5)", label: "Phone Support",  sub: "Within minutes" },
                  { color: "#f59e0b", shadow: "rgba(245,158,11,0.5)", label: "Email / Form",   sub: "Within 24 hours" },
                ].map((r, i) => (
                  <div className="cu-response-row" key={i}>
                    <span className="cu-dot" style={{ background: r.color, boxShadow: `0 0 8px ${r.shadow}` }} />
                    <div>
                      <div className="cu-res-label">{r.label}</div>
                      <div className="cu-res-sub">{r.sub}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Hours */}
            <div className="cu-info-card">
              <h3 className="cu-info-title">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
                Business Hours
              </h3>
              <div className="cu-hours-list">
                {[
                  { day: "Monday – Friday", hrs: "8:00 AM – 8:00 PM" },
                  { day: "Saturday",        hrs: "9:00 AM – 5:00 PM" },
                  { day: "Sunday",          hrs: "Emergency only" },
                ].map((h, i) => (
                  <div className="cu-hours-row" key={i}>
                    <span className="cu-hours-day">{h.day}</span>
                    <span className="cu-hours-val">{h.hrs}</span>
                  </div>
                ))}
              </div>
              <div className="cu-hours-note">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="#f59e0b"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                Emergency roadside assistance is available 24/7, every day of the year.
              </div>
            </div>

            {/* Social */}
            <div className="cu-info-card cu-social-card">
              <h3 className="cu-info-title">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                </svg>
                Follow SteadyFast
              </h3>
              <div className="cu-social-row">
                {[
                  { label: "X", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg> },
                  { label: "Instagram", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg> },
                  { label: "LinkedIn", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg> },
                  { label: "Facebook", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg> },
                ].map((s, i) => (
                  <a href="#" className="cu-social-btn" aria-label={s.label} key={i}>{s.icon}</a>
                ))}
              </div>
            </div>

          </aside>
        </div>
      </section>

      {/* ── Bottom CTA ───────────────────────────────────────────────────────── */}
      <section className="cu-cta-section">
        <div className="cu-cta-orb" />
        <div className="cu-cta-inner">
          <h2 className="cu-cta-title">Stranded? We'll come to you.</h2>
          <p className="cu-cta-sub">
            Request a mechanic in under 2 minutes. No appointment needed.
          </p>
          <div className="cu-cta-btns">
            <a href="#signup" className="cu-cta-primary">Get Started — It's Free</a>
            <a href="tel:+254700911911" className="cu-cta-secondary">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.4 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.96a16 16 0 0 0 6.13 6.13l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
              Emergency Line
            </a>
          </div>
        </div>
      </section>

    </div>
  );
}

