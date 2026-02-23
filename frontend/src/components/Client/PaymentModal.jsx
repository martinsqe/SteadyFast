import { useState } from "react";
import axios from "axios";
import "./PaymentModal.css";

// ── Merchant UPI (SteadyFast) ──────────────────────────────────
const MERCHANT_UPI = "8735833199@ptyes";
const MERCHANT_NAME = "SteadyFast";

const PAYMENT_METHODS = [
    {
        id: "upi",
        icon: "📱",
        label: "UPI",
        sub: "Pay by any UPI app",
        badge: "Instant • No extra charges",
    },
    {
        id: "card",
        icon: "💳",
        label: "Credit / Debit / ATM Card",
        sub: "Secure card payment",
        badge: "Visa • Mastercard • RuPay",
    },
    {
        id: "emi",
        icon: "📊",
        label: "EMI",
        sub: "Easy monthly instalments",
        badge: "Credit Card EMI",
    },
    {
        id: "cash",
        icon: "💵",
        label: "Pay Cash",
        sub: "Pay mechanic directly in cash",
        badge: null,
    },
];

const EMI_PLANS = [
    { months: 3, label: "3 Months — No Cost EMI" },
    { months: 6, label: "6 Months — 1.5% interest/month" },
    { months: 12, label: "12 Months — 2% interest/month" },
];

// UPI states for the UPI panel
// "input"       → user entering/verifying UPI ID
// "redirecting" → redirect triggered, waiting for user to pay in app
// "confirm"     → user returned, asking if payment was done

export default function PaymentModal({ job, onSuccess, onClose }) {
    const [selected, setSelected] = useState("upi");

    // UPI states
    const [upiId, setUpiId] = useState("");
    const [upiVerified, setUpiVerified] = useState(false);
    const [upiVerifying, setUpiVerifying] = useState(false);
    const [upiStep, setUpiStep] = useState("input"); // input | redirecting | confirm
    const [isMobile] = useState(() => /Android|iPhone|iPad|iPod/i.test(navigator.userAgent));

    // Card states
    const [cardNumber, setCardNumber] = useState("");
    const [cardExpiry, setCardExpiry] = useState("");
    const [cardCvv, setCardCvv] = useState("");
    const [cardName, setCardName] = useState("");

    // EMI states
    const [emiPlan, setEmiPlan] = useState(3);

    // Shared
    const [paying, setPaying] = useState(false);

    const totalAmount = (job.price + 15).toFixed(2);

    // ── UPI helpers ────────────────────────────────────────────────
    const buildUpiLink = () => {
        const note = encodeURIComponent(`SteadyFast: ${job.problem} service`);
        const name = encodeURIComponent(MERCHANT_NAME);
        return `upi://pay?pa=${MERCHANT_UPI}&pn=${name}&am=${totalAmount}&cu=INR&tn=${note}`;
    };

    const buildQrUrl = () => {
        const upiLink = buildUpiLink();
        return `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(upiLink)}&margin=10`;
    };

    const handleVerifyUpi = () => {
        if (!upiId.includes("@")) {
            alert("Please enter a valid UPI ID (e.g. name@upi)");
            return;
        }
        setUpiVerifying(true);
        setTimeout(() => {
            setUpiVerifying(false);
            setUpiVerified(true);
        }, 1200);
    };

    const handleUpiPay = () => {
        setUpiStep("redirecting");
        const link = buildUpiLink();

        // Open UPI deep link in same tab (for app redirect)
        window.location.href = link;

        // After 2.5 s (user will be in UPI app or link failed on desktop)
        // show the "Did you pay?" confirmation screen
        setTimeout(() => {
            setUpiStep("confirm");
        }, 2500);
    };

    /** Called when user says "Yes, I Paid" */
    const handleUpiConfirm = async () => {
        setPaying(true);
        try {
            const token = localStorage.getItem("token");
            await axios.post(
                `${import.meta.env.VITE_API_URL}/services/${job._id}/pay`,
                { paymentMethod: "upi" },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setPaying(false);
            onSuccess("upi");
        } catch (err) {
            setPaying(false);
            console.error("Payment confirmation error:", err);
            alert("Failed to record payment. Please contact support.");
        }
    };

    // ── Card / EMI helpers ─────────────────────────────────────────
    const formatCard = (val) =>
        val.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();

    const formatExpiry = (val) => {
        const c = val.replace(/\D/g, "").slice(0, 4);
        return c.length >= 3 ? c.slice(0, 2) + "/" + c.slice(2) : c;
    };

    const handlePay = async () => {
        if (selected === "card") {
            if (cardNumber.replace(/\s/g, "").length < 16) return alert("Enter a valid 16-digit card number.");
            if (!cardExpiry || cardExpiry.length < 5) return alert("Enter a valid expiry date.");
            if (cardCvv.length < 3) return alert("Enter a valid CVV.");
            if (!cardName.trim()) return alert("Enter the name on card.");
        }
        setPaying(true);
        try {
            const token = localStorage.getItem("token");
            await axios.post(
                `${import.meta.env.VITE_API_URL}/services/${job._id}/pay`,
                { paymentMethod: selected },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setPaying(false);
            onSuccess(selected);
        } catch (err) {
            setPaying(false);
            console.error("Payment error:", err);
            alert("Payment failed. Please try again.");
        }
    };

    const handleCashConfirm = async () => {
        setPaying(true);
        try {
            const token = localStorage.getItem("token");
            await axios.post(
                `${import.meta.env.VITE_API_URL}/services/${job._id}/pay`,
                { paymentMethod: "cash" },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setPaying(false);
            onSuccess("cash");
        } catch (err) {
            setPaying(false);
            alert("Failed to confirm. Please try again.");
        }
    };

    // ── Right-panel renderer ───────────────────────────────────────
    const renderRightPanel = () => {
        switch (selected) {

            // ── UPI ──────────────────────────────────────────────────────
            case "upi":
                // Step 1: User enters their UPI ID (payer ID for reference)
                if (upiStep === "input") {
                    return (
                        <div className="pm-right-content">
                            <div className="pm-right-title">
                                <div className="pm-radio-dot active" />
                                <span>Pay via UPI App</span>
                                <a
                                    href="https://www.npci.org.in/what-we-do/upi/product-overview"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="pm-how-link"
                                >
                                    How to find?
                                </a>
                            </div>

                            {/* Merchant info callout */}
                            <div className="pm-merchant-box">
                                <div className="pm-merchant-logo">🔧</div>
                                <div>
                                    <div className="pm-merchant-name">SteadyFast Services</div>
                                    <div className="pm-merchant-upi">{MERCHANT_UPI}</div>
                                </div>
                            </div>

                            <label className="pm-field-label">Your UPI ID <span className="pm-optional">(for your reference)</span></label>
                            <div className="pm-upi-row">
                                <input
                                    className={`pm-input ${upiVerified ? "verified" : ""}`}
                                    type="text"
                                    placeholder="yourname@upi"
                                    value={upiId}
                                    onChange={(e) => { setUpiId(e.target.value); setUpiVerified(false); }}
                                    disabled={upiVerified}
                                />
                                {upiVerified ? (
                                    <span className="pm-verified-badge">✓ Verified</span>
                                ) : (
                                    <button
                                        className="pm-verify-btn"
                                        onClick={handleVerifyUpi}
                                        disabled={upiVerifying || !upiId}
                                    >
                                        {upiVerifying ? "..." : "Verify"}
                                    </button>
                                )}
                            </div>

                            {upiVerified && (
                                <div className="pm-upi-success">
                                    ✅ UPI ID verified — you'll be redirected to your UPI app
                                </div>
                            )}

                            {/* Desktop: show QR code too */}
                            {!isMobile && (
                                <div className="pm-qr-section">
                                    <p className="pm-qr-label">📲 Or scan QR with your UPI app:</p>
                                    <img
                                        src={buildQrUrl()}
                                        alt="UPI QR Code"
                                        className="pm-qr-img"
                                    />
                                    <p className="pm-qr-hint">Scan with Google Pay, PhonePe, Paytm, or any UPI app</p>
                                </div>
                            )}

                            <button
                                className={`pm-pay-btn ${!upiVerified ? "disabled" : ""}`}
                                onClick={handleUpiPay}
                                disabled={!upiVerified}
                            >
                                {isMobile ? `📱 Open UPI App — Pay $${totalAmount}` : `💳 Pay $${totalAmount}`}
                            </button>

                            {!isMobile && (
                                <p className="pm-desktop-hint">
                                    ⚠️ UPI app redirect works on mobile. On desktop, scan the QR code, then click below once done.
                                </p>
                            )}
                        </div>
                    );
                }

                // Step 2: Redirected — waiting / spinner
                if (upiStep === "redirecting") {
                    return (
                        <div className="pm-right-content pm-centered">
                            <div className="pm-spinner" />
                            <h3 className="pm-redirect-title">Opening your UPI App…</h3>
                            <p className="pm-redirect-sub">
                                Complete the payment of <strong>${totalAmount}</strong> in your UPI app, then return here.
                            </p>
                            <button className="pm-text-btn" onClick={() => setUpiStep("confirm")}>
                                I've returned from the app →
                            </button>
                        </div>
                    );
                }

                // Step 3: Confirmation screen
                if (upiStep === "confirm") {
                    return (
                        <div className="pm-right-content pm-centered">
                            <div className="pm-confirm-icon">🤔</div>
                            <h3 className="pm-confirm-title">Did you complete the payment?</h3>
                            <p className="pm-confirm-sub">
                                Please confirm only if you successfully paid <strong>${totalAmount}</strong> via your UPI app.
                            </p>
                            <div className="pm-confirm-actions">
                                <button
                                    className="pm-pay-btn"
                                    onClick={handleUpiConfirm}
                                    disabled={paying}
                                >
                                    {paying ? "Recording…" : "✅ Yes, I Paid"}
                                </button>
                                <button
                                    className="pm-retry-btn"
                                    onClick={() => { setUpiStep("input"); setUpiVerified(false); setUpiId(""); }}
                                >
                                    🔄 Retry Payment
                                </button>
                            </div>
                            <p className="pm-confirm-note">
                                ℹ️ Your payment is NOT recorded until you confirm. If your app deducted the amount but you see an error, contact support.
                            </p>
                        </div>
                    );
                }
                return null;

            // ── CARD ─────────────────────────────────────────────────────
            case "card":
                return (
                    <div className="pm-right-content">
                        <div className="pm-right-title">
                            <div className="pm-radio-dot active" />
                            <span>Enter Card Details</span>
                        </div>

                        <div className="pm-card-preview">
                            <div className="pm-card-chip">▬▬▬</div>
                            <div className="pm-card-num-preview">{cardNumber || "•••• •••• •••• ••••"}</div>
                            <div className="pm-card-row">
                                <span>{cardName || "CARD HOLDER"}</span>
                                <span>{cardExpiry || "MM/YY"}</span>
                            </div>
                        </div>

                        <label className="pm-field-label">Card Number</label>
                        <input className="pm-input" type="text" placeholder="1234 5678 9012 3456"
                            value={cardNumber} onChange={(e) => setCardNumber(formatCard(e.target.value))} maxLength={19} />

                        <div className="pm-card-two-col">
                            <div>
                                <label className="pm-field-label">Expiry Date</label>
                                <input className="pm-input" type="text" placeholder="MM/YY"
                                    value={cardExpiry} onChange={(e) => setCardExpiry(formatExpiry(e.target.value))} maxLength={5} />
                            </div>
                            <div>
                                <label className="pm-field-label">CVV</label>
                                <input className="pm-input" type="password" placeholder="•••"
                                    value={cardCvv} onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, "").slice(0, 4))} maxLength={4} />
                            </div>
                        </div>

                        <label className="pm-field-label">Name on Card</label>
                        <input className="pm-input" type="text" placeholder="John Doe"
                            value={cardName} onChange={(e) => setCardName(e.target.value)} />

                        <button className="pm-pay-btn" onClick={handlePay} disabled={paying}>
                            {paying ? "Processing..." : `Pay $${totalAmount}`}
                        </button>
                    </div>
                );

            // ── EMI ──────────────────────────────────────────────────────
            case "emi":
                return (
                    <div className="pm-right-content">
                        <div className="pm-right-title">
                            <div className="pm-radio-dot active" />
                            <span>Select EMI Plan</span>
                        </div>
                        <label className="pm-field-label">Choose your EMI tenure</label>
                        <div className="pm-emi-plans">
                            {EMI_PLANS.map((plan) => {
                                const monthly =
                                    plan.months === 3 ? (totalAmount / 3).toFixed(2)
                                        : plan.months === 6 ? ((+totalAmount * 1.015)).toFixed(2)
                                            : ((+totalAmount * 1.02)).toFixed(2);
                                return (
                                    <label key={plan.months} className={`pm-emi-card ${emiPlan === plan.months ? "selected" : ""}`}>
                                        <input type="radio" name="emi" value={plan.months}
                                            checked={emiPlan === plan.months} onChange={() => setEmiPlan(plan.months)} />
                                        <div className="pm-emi-info">
                                            <strong>{plan.label}</strong>
                                            <span>${monthly}/month</span>
                                        </div>
                                    </label>
                                );
                            })}
                        </div>
                        <div className="pm-emi-note">💡 EMI will be charged to your registered credit card</div>
                        <button className="pm-pay-btn" onClick={handlePay} disabled={paying}>
                            {paying ? "Processing..." : `Start EMI — $${totalAmount}`}
                        </button>
                    </div>
                );

            // ── CASH ─────────────────────────────────────────────────────
            case "cash":
                return (
                    <div className="pm-right-content">
                        <div className="pm-cash-confirm-wrap">
                            <div className="pm-cash-icon">💵</div>
                            <h3>Pay Cash</h3>
                            <p>You'll pay <strong>${totalAmount}</strong> directly to the mechanic once the service is completed.</p>
                            <div className="pm-cash-steps">
                                <div className="pm-cash-step"><div className="pm-step-num">1</div><span>Mechanic completes the job</span></div>
                                <div className="pm-cash-step"><div className="pm-step-num">2</div><span>Mechanic shares invoice</span></div>
                                <div className="pm-cash-step"><div className="pm-step-num">3</div><span>You pay cash of <strong>${totalAmount}</strong></span></div>
                            </div>
                            <button className="pm-cash-btn" onClick={handleCashConfirm} disabled={paying}>
                                {paying ? "Confirming..." : "✅ Confirm Cash Payment"}
                            </button>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    // ── Render ─────────────────────────────────────────────────────
    return (
        <div className="pm-overlay" onClick={onClose}>
            <div className="pm-container" onClick={(e) => e.stopPropagation()}>

                {/* ── Header ── */}
                <div className="pm-header">
                    <button className="pm-back-btn" onClick={onClose}>
                        <span className="pm-back-arrow">←</span>
                        <span className="pm-back-label">Active Job</span>
                    </button>
                    <h2>Complete Payment</h2>
                </div>

                {/* ── Invoice Strip ── */}
                <div className="pm-invoice-strip">
                    <div className="pm-invoice-item">
                        <span>{job.problem} Service</span>
                        <span>${job.price.toFixed(2)}</span>
                    </div>
                    <div className="pm-invoice-item">
                        <span>Mobilization Fee</span>
                        <span>$15.00</span>
                    </div>
                    <div className="pm-invoice-total">
                        <span>Total Due</span>
                        <span>${totalAmount}</span>
                    </div>
                </div>

                {/* ── Body: Left + Right ── */}
                <div className="pm-body">
                    {/* Left — Method Selector */}
                    <div className="pm-left">
                        {PAYMENT_METHODS.map((m) => (
                            <div
                                key={m.id}
                                className={`pm-method-row ${selected === m.id ? "active" : ""}`}
                                onClick={() => { setSelected(m.id); setUpiStep("input"); }}
                            >
                                <div className="pm-method-icon">{m.icon}</div>
                                <div className="pm-method-text">
                                    <strong>{m.label}</strong>
                                    <span className="pm-method-sub">{m.sub}</span>
                                    {m.badge && <span className="pm-method-badge">{m.badge}</span>}
                                </div>
                                <div className={`pm-method-arrow ${selected === m.id ? "active" : ""}`}>›</div>
                            </div>
                        ))}
                    </div>

                    {/* Right — Dynamic Form */}
                    <div className="pm-right">
                        {renderRightPanel()}
                    </div>
                </div>
            </div>
        </div>
    );
}
