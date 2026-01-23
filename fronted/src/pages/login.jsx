function Login({ setPage }) {
  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2 style={styles.title}>Login</h2>

        <input style={styles.input} type="email" placeholder="Email" />
        <input style={styles.input} type="password" placeholder="Password" />

        <button style={styles.btn}>Login</button>

        <p style={styles.text}>
          No account?{" "}
          <span style={styles.link} onClick={() => setPage("signup")}>
            Sign up
          </span>
        </p>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center" },
  card: { width: "320px", padding: "30px", background: "white", borderRadius: "14px", boxShadow: "0 10px 25px rgba(0,0,0,0.15)" },
  title: { textAlign: "center", marginBottom: "20px" },
  input: { width: "100%", padding: "10px", marginBottom: "12px", borderRadius: "6px", border: "1px solid #ccc" },
  btn: { width: "100%", padding: "12px", background: "#2563eb", color: "white", border: "none", borderRadius: "8px" },
  text: { textAlign: "center", marginTop: "10px" },
  link: { color: "#2563eb", cursor: "pointer", fontWeight: "600" },
};

export default Login;
