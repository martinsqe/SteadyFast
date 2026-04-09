import { useState, useEffect, useRef } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import axios from "axios";
import "./PaymentModal.css";

const API = import.meta.env.VITE_API_URL;
const STRIPE_PK = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
const RAZORPAY_SCRIPT = "https://checkout.razorpay.com/v1/checkout.js";
const PLATFORM_FEE = 1;

const stripePromise = STRIPE_PK ? loadStripe(STRIPE_PK) : null;

const PAYMENT_METHODS = [
  { id: "card",  icon: "💳", label: "Credit / Debit / ATM Card", sub: "Secure card payment",         badge: "Visa • Mastercard • RuPay" },
  { id: "upi",   icon: "📱", label: "UPI",                        sub: "Pay by any UPI app",           badge: "Instant • No extra charges" },
  { id: "mpesa", icon: "📲", label: "M-Pesa",                     sub: "Pay via M-Pesa mobile money",  badge: "STK Push to your phone" },
  { id: "cash",  icon: "💵", label: "Pay Cash",                    sub: "Pay on mechanic arrival",      badge: null },
];

// ── Stripe card form (must be inside <Elements>) ──────────────────────────────
function StripeCardForm({ clientSecret, requestId, onSuccess, onError }) {
  const stripe = useStripe();
  const elements = useElements();
  const [paying, setPaying] = useState(false);
  const [cardName, setCardName] = useState("");

  const handlePay = async () => {
    if (!stripe || !elements) return;
    if (!cardName.trim()) return onError("Enter the name on card.");
    setPaying(true);
    try {
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: { name: cardName }
        }
      });
      if (error) { setPaying(false); return onError(error.message); }
      if (paymentIntent.status === "succeeded") {
        // Stripe webhook will dispatch, but also poll as fallback
        onSuccess("card", requestId);
      }
    } catch (err) {
      setPaying(false);
      onError(err.message);
    }
  };

  return (
    <div className="pm-right-content">
      <div className="pm-right-title"><div className="pm-radio-dot active" /><span>Enter Card Details</span></div>

      <label className="pm-field-label">Name on Card</label>
      <input className="pm-input" type="text" placeholder="John Doe"
        value={cardName} onChange={e => setCardName(e.target.value)} />

      <label className="pm-field-label" style={{ marginTop: "14px" }}>Card Details</label>
      <div className="pm-stripe-card-wrap">
        <CardElement options={{
          style: {
            base: { fontSize: "15px", color: "#f1f5f9", "::placeholder": { color: "#64748b" }, iconColor: "#3b82f6" },
            invalid: { color: "#ef4444" }
          }
        }} />
      </div>

      <div className="pm-secure-note">🔒 Secured by Stripe — your card details are never stored on our servers</div>

      <button className="pm-pay-btn" onClick={handlePay} disabled={paying || !stripe}>
        {paying ? <><span className="pm-btn-spinner" /> Processing…</> : `Pay $${PLATFORM_FEE} securely`}
      </button>
    </div>
  );
}

// ── Main modal ────────────────────────────────────────────────────────────────
export default function PlatformFeeModal({ onSuccess, onClose, vehicle, problem, servicePayload }) {
  const [selected, setSelected] = useState("card");
  const [step, setStep] = useState("idle"); // idle | initiating | waiting | polling | done | error
  const [errorMsg, setErrorMsg] = useState("");

  // Stripe
  const [stripeClientSecret, setStripeClientSecret] = useState(null);
  const [pendingRequestId, setPendingRequestId] = useState(null);

  // M-Pesa
  const [mpesaPhone, setMpesaPhone] = useState("");
  const [checkoutRequestId, setCheckoutRequestId] = useState(null);

  // Razorpay
  const razorpayOrderRef = useRef(null);

  // Polling
  const pollRef = useRef(null);

  useEffect(() => () => clearInterval(pollRef.current), []);

  const token = () => localStorage.getItem("token");

  // Generate a fresh idempotency key per payment attempt
  const idempotencyKeyRef = useRef(null);
  const getIdempotencyKey = () => {
    if (!idempotencyKeyRef.current) {
      idempotencyKeyRef.current = crypto.randomUUID();
    }
    return idempotencyKeyRef.current;
  };
  // Reset key on retry so a fresh attempt gets a new key
  const resetIdempotencyKey = () => { idempotencyKeyRef.current = null; };

  const startPolling = (requestId) => {
    clearInterval(pollRef.current);
    setStep("polling");
    pollRef.current = setInterval(async () => {
      try {
        const res = await axios.get(`${API}/payments/status/${requestId}`,
          { headers: { Authorization: `Bearer ${token()}` } });
        if (res.data.paid && res.data.status === "pending") {
          clearInterval(pollRef.current);
          setStep("done");
          setTimeout(() => onSuccess("confirmed", requestId, res.data.notifiedMechanics || 0), 600);
        }
      } catch { /* keep polling */ }
    }, 2500);

    // Timeout after 3 minutes
    setTimeout(() => {
      clearInterval(pollRef.current);
      if (step !== "done") setStep("error"), setErrorMsg("Payment timed out. Please try again.");
    }, 180000);
  };

  // Initiate payment — creates the pending request + payment intent on backend
  const initiate = async (extraFields = {}) => {
    setStep("initiating");
    setErrorMsg("");
    try {
      const res = await axios.post(`${API}/payments/initiate`,
        { ...servicePayload, platformFeeMethod: selected, ...extraFields },
        {
          headers: {
            Authorization: `Bearer ${token()}`,
            "X-Idempotency-Key": getIdempotencyKey(),
          }
        }
      );
      return res.data;
    } catch (err) {
      setStep("error");
      const status = err.response?.status;
      const serverMsg = err.response?.data?.message || "";
      const isAuthError = status === 401 || status === 403
        || serverMsg.toLowerCase().includes("not authorized")
        || serverMsg.toLowerCase().includes("unauthorized")
        || serverMsg.toLowerCase().includes("no token")
        || serverMsg.toLowerCase().includes("invalid token");
      setErrorMsg(
        isAuthError
          ? "Please login to request a mechanic."
          : serverMsg || "Failed to initiate payment. Please try again."
      );
      return null;
    }
  };

  // ── CARD: initiate → get clientSecret → Stripe handles the rest ──────────
  const handleCardInitiate = async () => {
    const data = await initiate();
    if (!data) return;
    setStripeClientSecret(data.clientSecret);
    setPendingRequestId(data.requestId);
    setStep("stripe_form");
  };

  const handleStripeSuccess = (method, requestId) => {
    setPendingRequestId(requestId);
    setStep("polling");
    startPolling(requestId);
  };

  // ── M-PESA: initiate STK push → poll ─────────────────────────────────────
  const handleMpesaInitiate = async () => {
    if (!mpesaPhone.trim()) return setErrorMsg("Enter your M-Pesa phone number.");
    const data = await initiate({ mpesaPhone });
    if (!data) return;
    setCheckoutRequestId(data.checkoutRequestId);
    setPendingRequestId(data.requestId);
    setStep("waiting"); // waiting for user to approve STK push on phone
    startPolling(data.requestId);
  };

  // ── UPI (Razorpay): initiate → load Razorpay checkout ────────────────────
  const handleUpiInitiate = async () => {
    const data = await initiate();
    if (!data) return;
    razorpayOrderRef.current = data;
    setPendingRequestId(data.requestId);
    setStep("waiting");

    // Load Razorpay script dynamically
    if (!window.Razorpay) {
      const script = document.createElement("script");
      script.src = RAZORPAY_SCRIPT;
      script.onload = () => openRazorpay(data);
      document.body.appendChild(script);
    } else {
      openRazorpay(data);
    }
  };

  const openRazorpay = (data) => {
    const rzp = new window.Razorpay({
      key: data.keyId,
      order_id: data.orderId,
      amount: data.amount,
      currency: data.currency,
      name: "SteadyFast",
      description: `Platform fee — ${problem}`,
      handler: async (response) => {
        try {
          const res = await axios.post(`${API}/payments/razorpay/verify`, {
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
            requestId: data.requestId
          }, { headers: { Authorization: `Bearer ${token()}` } });

          if (res.data.success) {
            setStep("done");
            setTimeout(() => onSuccess("confirmed", data.requestId, res.data.notifiedMechanics || 0), 600);
          }
        } catch {
          setStep("error");
          setErrorMsg("Payment verification failed. Contact support.");
        }
      },
      modal: {
        ondismiss: () => { setStep("idle"); setErrorMsg("UPI payment cancelled."); }
      },
      prefill: {},
      theme: { color: "#2563eb" }
    });
    rzp.open();
  };

  // ── CASH: dispatch immediately ────────────────────────────────────────────
  const handleCashConfirm = async () => {
    const data = await initiate();
    if (!data) return;
    setStep("done");
    setTimeout(() => onSuccess("confirmed", data.requestId, data.notifiedMechanics || 0), 600);
  };

  // ── Right panel renderer ──────────────────────────────────────────────────
  const renderRight = () => {

    if (step === "initiating") return (
      <div className="pm-right-content pm-centered">
        <div className="pm-spinner" />
        <h3 className="pm-redirect-title">Setting up payment…</h3>
        <p className="pm-redirect-sub">Connecting to payment provider.</p>
      </div>
    );

    if (step === "done") return (
      <div className="pm-right-content pm-centered">
        <div className="pm-confirm-icon">✅</div>
        <h3 className="pm-confirm-title">Payment Confirmed!</h3>
        <p className="pm-redirect-sub">Mechanic is being dispatched to you now.</p>
      </div>
    );

    if (step === "error") return (
      <div className="pm-right-content pm-centered">
        <div className="pm-confirm-icon">❌</div>
        <h3 className="pm-confirm-title">Payment Failed</h3>
        <p className="pm-redirect-sub" style={{ color: "#f87171" }}>{errorMsg}</p>
        <button className="pm-retry-btn" onClick={() => { resetIdempotencyKey(); setStep("idle"); setErrorMsg(""); }}>
          🔄 Try Again
        </button>
      </div>
    );

    switch (selected) {

      case "card":
        if (step === "stripe_form" && stripeClientSecret && stripePromise) return (
          <Elements stripe={stripePromise} options={{ clientSecret: stripeClientSecret, appearance: { theme: "night" } }}>
            <StripeCardForm
              clientSecret={stripeClientSecret}
              requestId={pendingRequestId}
              onSuccess={handleStripeSuccess}
              onError={(msg) => { setStep("error"); setErrorMsg(msg); }}
            />
          </Elements>
        );

        if (step === "polling") return (
          <div className="pm-right-content pm-centered">
            <div className="pm-spinner" />
            <h3 className="pm-redirect-title">Verifying payment…</h3>
            <p className="pm-redirect-sub">Confirming your card payment with our banking partner.</p>
          </div>
        );

        return (
          <div className="pm-right-content">
            <div className="pm-right-title"><div className="pm-radio-dot active" /><span>Pay by Card</span></div>
            <div className="pm-merchant-box">
              <div className="pm-merchant-logo">🔒</div>
              <div>
                <div className="pm-merchant-name">Secured by Stripe</div>
                <div className="pm-merchant-upi">PCI-DSS compliant card processing</div>
              </div>
            </div>
            <p className="pm-redirect-sub" style={{ margin: "12px 0" }}>
              Click below to securely enter your card details. Your card is charged <strong>${PLATFORM_FEE}</strong> to dispatch a mechanic.
            </p>
            <button className="pm-pay-btn" onClick={handleCardInitiate}>
              💳 Enter Card Details
            </button>
          </div>
        );

      case "upi":
        if (step === "waiting" || step === "polling") return (
          <div className="pm-right-content pm-centered">
            <div className="pm-spinner" />
            <h3 className="pm-redirect-title">Complete payment in UPI app</h3>
            <p className="pm-redirect-sub">Razorpay checkout has opened. Complete your UPI payment and return here.</p>
          </div>
        );
        return (
          <div className="pm-right-content">
            <div className="pm-right-title"><div className="pm-radio-dot active" /><span>Pay via UPI</span></div>
            <div className="pm-merchant-box">
              <div className="pm-merchant-logo">📱</div>
              <div>
                <div className="pm-merchant-name">Powered by Razorpay</div>
                <div className="pm-merchant-upi">Supports GPay, PhonePe, Paytm & all UPI apps</div>
              </div>
            </div>
            <div className="pm-cash-steps" style={{ marginTop: "16px" }}>
              <div className="pm-cash-step"><div className="pm-step-num">1</div><span>Click the button below</span></div>
              <div className="pm-cash-step"><div className="pm-step-num">2</div><span>Razorpay opens — select your UPI app</span></div>
              <div className="pm-cash-step"><div className="pm-step-num">3</div><span>Approve ₹{PLATFORM_FEE * 83} in your UPI app</span></div>
              <div className="pm-cash-step"><div className="pm-step-num">4</div><span>Mechanic dispatched automatically</span></div>
            </div>
            <button className="pm-pay-btn" onClick={handleUpiInitiate}>
              📱 Open UPI Payment
            </button>
          </div>
        );

      case "mpesa":
        if (step === "waiting" || step === "polling") return (
          <div className="pm-right-content pm-centered">
            <div className="pm-spinner" />
            <h3 className="pm-redirect-title">Check your phone</h3>
            <p className="pm-redirect-sub">
              An M-Pesa STK push has been sent to <strong>{mpesaPhone}</strong>. Enter your PIN to confirm <strong>Ksh {PLATFORM_FEE * 130}</strong>.
            </p>
            <p className="pm-confirm-note">Mechanic will be dispatched automatically once payment is confirmed.</p>
          </div>
        );
        return (
          <div className="pm-right-content">
            <div className="pm-right-title"><div className="pm-radio-dot active" /><span>Pay via M-Pesa</span></div>
            <div className="pm-merchant-box">
              <div className="pm-merchant-logo">📲</div>
              <div>
                <div className="pm-merchant-name">Safaricom M-Pesa</div>
                <div className="pm-merchant-upi">STK Push to your phone</div>
              </div>
            </div>
            <label className="pm-field-label" style={{ marginTop: "16px" }}>Your M-Pesa Phone Number</label>
            <input className="pm-input" type="tel" placeholder="07XX XXX XXX or +254 7XX XXX XXX"
              value={mpesaPhone} onChange={e => setMpesaPhone(e.target.value)} />
            {errorMsg && <p style={{ color: "#f87171", fontSize: "0.82rem", marginTop: "6px" }}>{errorMsg}</p>}
            <div className="pm-cash-steps" style={{ marginTop: "12px" }}>
              <div className="pm-cash-step"><div className="pm-step-num">1</div><span>Enter your M-Pesa number above</span></div>
              <div className="pm-cash-step"><div className="pm-step-num">2</div><span>An STK push will be sent to your phone</span></div>
              <div className="pm-cash-step"><div className="pm-step-num">3</div><span>Enter your M-Pesa PIN to approve</span></div>
              <div className="pm-cash-step"><div className="pm-step-num">4</div><span>Mechanic dispatched automatically</span></div>
            </div>
            <button className="pm-pay-btn" onClick={handleMpesaInitiate}>
              📲 Send M-Pesa STK Push — Ksh {PLATFORM_FEE * 130}
            </button>
          </div>
        );

      case "cash":
        return (
          <div className="pm-right-content">
            <div className="pm-cash-confirm-wrap">
              <div className="pm-cash-icon">💵</div>
              <h3>Pay Cash on Arrival</h3>
              <p>Pay <strong>${PLATFORM_FEE}</strong> platform fee directly to the mechanic when they arrive.</p>
              <div className="pm-cash-steps">
                <div className="pm-cash-step"><div className="pm-step-num">1</div><span>Confirm your request below</span></div>
                <div className="pm-cash-step"><div className="pm-step-num">2</div><span>Mechanic is dispatched immediately</span></div>
                <div className="pm-cash-step"><div className="pm-step-num">3</div><span>Pay <strong>${PLATFORM_FEE}</strong> cash when mechanic arrives</span></div>
              </div>
              <button className="pm-cash-btn" onClick={handleCashConfirm}>
                ✅ Confirm & Dispatch Mechanic
              </button>
            </div>
          </div>
        );

      default: return null;
    }
  };

  return (
    <div className="pm-overlay" onClick={onClose}>
      <div className="pm-container" onClick={e => e.stopPropagation()}>

        <div className="pm-header">
          <button className="pm-back-btn" onClick={onClose}>
            <span className="pm-back-arrow">←</span>
            <span className="pm-back-label">Service Quote</span>
          </button>
          <h2>Platform Fee Payment</h2>
        </div>

        <div className="pm-invoice-strip">
          <div className="pm-invoice-item">
            <span>{vehicle} — {problem}</span>
            <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.85rem" }}>Service billed after completion</span>
          </div>
          <div className="pm-invoice-item">
            <span>Platform Dispatch Fee</span>
            <span>${PLATFORM_FEE}.00</span>
          </div>
          <div className="pm-invoice-total">
            <span>Due Now</span>
            <span>${PLATFORM_FEE}.00</span>
          </div>
        </div>

        <div className="pm-body">
          <div className="pm-left">
            {PAYMENT_METHODS.map(m => (
              <div
                key={m.id}
                className={`pm-method-row ${selected === m.id ? "active" : ""}`}
                onClick={() => { if (step === "idle" || step === "error") { setSelected(m.id); setErrorMsg(""); } }}
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
          <div className="pm-right">
            {renderRight()}
          </div>
        </div>
      </div>
    </div>
  );
}
