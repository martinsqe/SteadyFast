function Dashboard() {
  return (
    <div style={styles.page}>
      <h1>Request Dashboard</h1>

      <div style={styles.card}>
        <p><strong>Status:</strong> Mechanic Assigned</p>
        <p><strong>ETA:</strong> 12 minutes</p>
        <p><strong>Vehicle:</strong> Car</p>
        <p><strong>Issue:</strong> Flat Tyre</p>
      </div>

      <div style={styles.actions}>
        <button style={styles.btn}>📍 Track Mechanic</button>
        <button style={styles.btn}>💬 Chat Support</button>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    padding: "40px",
    textAlign: "center"
  },
  card: {
    maxWidth: "400px",
    margin: "20px auto",
    padding: "20px",
    background: "white",
    borderRadius: "12px",
    boxShadow: "0 6px 20px rgba(0,0,0,0.1)"
  },
  actions: {
    display: "flex",
    justifyContent: "center",
    gap: "20px",
    marginTop: "20px"
  },
  btn: {
    padding: "12px 20px",
    borderRadius: "10px",
    background: "#2563eb",
    color: "white",
    border: "none",
    cursor: "pointer"
  }
};

export default Dashboard;
