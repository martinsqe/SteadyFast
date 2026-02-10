import { useState } from "react";
import "./Emergency.css";

function Emergency() {
  const [location, setLocation] = useState("");
  const [locationSet, setLocationSet] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);

  const detectLocation = () => {
    setIsDetecting(true);
    // UI-only simulation with timeout
    setTimeout(() => {
      setLocation("Current location detected (GPS: 40.7128° N, 74.0060° W)");
      setLocationSet(true);
      setIsDetecting(false);
    }, 1500);
  };

  const submitLocation = () => {
    if (!location) return;
    setLocationSet(true);
  };

  const handleCancel = () => {
    setLocationSet(false);
    setLocation("");
  };

  return (
    <div className="emergency-page">
      <header className="emergency-header">
        <h1>🚨 EMERGENCY</h1>
        <p className="subtitle">SteadyFast Rescue is standing by. Tell us where you are.</p>
      </header>

      {!locationSet ? (
        <div className="location-container">
          <button
            className="gps-button"
            onClick={detectLocation}
            disabled={isDetecting}
          >
            {isDetecting ? "🛰️ Detecting..." : "📍 Use Current Location"}
          </button>

          <div className="divider">OR</div>

          <div className="manual-input-box">
            <input
              type="text"
              placeholder="Enter landmark or address manually"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
            <button
              className="confirm-btn"
              onClick={submitLocation}
              disabled={!location || isDetecting}
            >
              Confirm Manually
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="status-card">
            <h2>✅ Request Broadcasted</h2>
            <div className="status-detail-grid">
              <div className="status-item">
                <span className="label">Location</span>
                <span className="value">{location}</span>
              </div>
              <div className="status-item">
                <span className="label">Incident Status</span>
                <span className="value" style={{ color: "#10b981" }}>Searching for Responders</span>
              </div>
              <div className="status-item">
                <span className="label">Estimated Arrival</span>
                <span className="value">8 – 12 minutes</span>
              </div>
              <div className="status-item">
                <span className="label">Reference ID</span>
                <span className="value">#{Math.random().toString(36).substr(2, 6).toUpperCase()}</span>
              </div>
            </div>
          </div>

          <div className="emergency-actions">
            <button className="call-support-btn">
              📞 Direct Call Support
            </button>
            <button className="cancel-request-btn" onClick={handleCancel}>
              Cancel
            </button>
          </div>
        </>
      )}

      <footer style={{ marginTop: "4rem", color: "rgba(255,255,255,0.3)", fontSize: "0.85rem" }}>
        SteadyFast emergency network covers 40+ major cities.
      </footer>
    </div>
  );
}

export default Emergency;
