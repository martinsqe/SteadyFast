function Signup({ setPage }) {
  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2 style={styles.title}>Create Account</h2>

        <input style={styles.input} placeholder="Full Name" />
        <input style={styles.input} type="email" placeholder="Email" />
        <input style={styles.input} type="password" placeholder="Password" />

        <select style={styles.input}>
          <option value="">Register as</option>
          <option value="client">Client</option>
          <option value="mechanic">Mechanic</option>
        </select>

        <button style={styles.btn}>Create Account</button>

        <p style={styles.text}>
          Already have an account?{" "}
          <span style={styles.link} onClick={() => setPage("login")}>
            Login
          </span>
        </p>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "transparent",   // 🔥 removes white block
  },
  card: {
    width: "320px",
    padding: "32px",
    background: "rgba(255,255,255,0.96)",
    borderRadius: "16px",
    boxShadow: "0 20px 40px rgba(0,0,0,0.25)",
    backdropFilter: "blur(8px)", // glass effect
  },
  title: { textAlign: "center", marginBottom: "20px" },
  input: {
    width: "100%",
    padding: "12px",
    marginBottom: "12px",
    borderRadius: "8px",
    border: "1px solid #ccc",
  },
  btn: {
    width: "100%",
    padding: "12px",
    background: "#16a34a",
    color: "white",
    border: "none",
    borderRadius: "10px",
    fontWeight: "600",
    cursor: "pointer",
  },
  text: { textAlign: "center", marginTop: "10px" },
  link: { color: "#2563eb", cursor: "pointer", fontWeight: "600" },
};

export default Signup;
