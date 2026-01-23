function Tracking() {
  return (
    <div style={styles.page}>
      <h1>Live Tracking</h1>

      <div style={styles.mapBox}>
        📍 Map Placeholder
      </div>

      <p>Mechanic is 8 minutes away...</p>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    textAlign: "center",
    padding: "40px"
  },
  mapBox: {
    height: "300px",
    maxWidth: "500px",
    margin: "20px auto",
    background: "#e5e7eb",
    borderRadius: "12px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontSize: "20px"
  }
};

export default Tracking;
