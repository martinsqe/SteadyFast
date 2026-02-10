import { useState, useContext } from "react";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";

function Login({ setPage }) {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const submit = async () => {
    try {
      const { data } = await api.post("/auth/login", {

        email,
        password,
      });

      login(data);   // stores user + token in context

    } catch (err) {
      alert(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2 style={styles.title}>Login</h2>

        <input style={styles.input} type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
        <input style={styles.input} type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />

        <button style={styles.btn} onClick={submit}>
          Login
        </button>

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
  card: { width: "320px", padding: "32px", borderRadius: "14px", background: "rgba(255,255,255,0.95)", boxShadow: "0 12px 28px rgba(0,0,0,0.18)" },
  title: { textAlign: "center", marginBottom: "22px", fontSize: "1.6rem", fontWeight: "700" },
  input: { width: "100%", padding: "11px", marginBottom: "14px", borderRadius: "8px", border: "1px solid #d1d5db", outline: "none" },
  btn: { width: "100%", padding: "12px", background: "#2563eb", color: "white", border: "none", borderRadius: "8px", fontWeight: "600", cursor: "pointer" },
  text: { textAlign: "center", marginTop: "14px", fontSize: "0.95rem" },
  link: { color: "#2563eb", cursor: "pointer", fontWeight: "600" }
};

export default Login;
