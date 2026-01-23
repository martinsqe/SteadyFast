import { useState } from "react";

function Emergency() {
  const [location, setLocation] = useState("");
  const [locationSet, setLocationSet] = useState(false);

  const detectLocation = () => {
    // UI-only simulation
    setLocation("Current location detected (GPS)");
    setLocationSet(true);
  };

  const submitLocation = () => {
    if (!location) return;
    setLocationSet(true);
  };

  return (
    <div style={styles.page}>

      <h1 style={styles.title}>🚨 Emergency Assistance</h1>
      <p style={styles.subtitle}>Share your location so help can reach you faster</p>

      {!locationSet && (
        <div style={styles.locationBox}>

          <button style={styles.gpsBtn} onClick={detectLocation}>
            📍 Use Current Location
          </button>

          <p style={{ margin: "10px 0" }}>OR</p>

          <input
            type="text"
            placeholder="Enter your location manually"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            style={styles.input}
          />

          <br />

          <button style={styles.submitBtn} onClick={submitLocation}>
            Confirm Location
          </button>

        </div>
      )}

      {locationSet && (
        <div style={styles.statusBox}>
          <p><strong>Location:</strong> {location}</p>
          <p><strong>Status:</strong> Request Sent</p>
          <p><strong>Mechanic:</strong> Finding nearest available</p>
          <p><strong>ETA:</strong> 10 – 15 minutes</p>
        </div>
      )}

      {locationSet && (
        <div style={styles.actions}>
          <button style={styles.callBtn}>📞 Call Support</button>
          <button style={styles.cancelBtn}>Cancel Request</button>
        </div>
      )}

    </div>
  );
}

const styles = {
  page: {
    padding: "40px",
    textAlign: "center",
    background: "#fff5f5",
    minHeight: "70vh"
  },
  title: {
    color: "#dc2626"
  },
  subtitle: {
    fontSize: "18px",
    marginBottom: "30px"
  },
  locationBox: {
    background: "white",
    padding: "30px",
    borderRadius: "10px",
    display: "inline-block"
  },
  gpsBtn: {
    background: "#2563eb",
    color: "white",
    padding: "12px 20px",
    border: "none",
    cursor: "pointer"
  },
  input: {
    width: "260px",
    padding: "10px",
    marginBottom: "10px"
  },
  submitBtn: {
    background: "#16a34a",
    color: "white",
    padding: "10px 20px",
    border: "none",
    cursor: "pointer"
  },
  statusBox: {
    background: "white",
    padding: "20px",
    marginTop: "30px",
    display: "inline-block",
    textAlign: "left"
  },
  actions: {
    marginTop: "20px",
    display: "flex",
    justifyContent: "center",
    gap: "20px"
  },
  callBtn: {
    background: "#16a34a",
    color: "white",
    padding: "12px 20px",
    border: "none"
  },
  cancelBtn: {
    background: "#6b7280",
    color: "white",
    padding: "12px 20px",
    border: "none"
  }
};

export default Emergency;
