import { useState, useContext } from "react";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";

function Login({ setPage }) {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [view, setView] = useState("login"); // "login" or "forgot"
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (view === "forgot") {
      handleForgotPassword();
      return;
    }

    try {
      setLoading(true);
      const url = "/auth/login";
      const { data } = await api.post(url, { email, password });
      login(data);
    } catch (err) {
      alert(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      alert("Please enter your email address");
      return;
    }

    try {
      setLoading(true);
      const { data } = await api.post("/auth/forgot-password", { email });
      alert(data.message);
      setView("login");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to send reset link");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2 style={styles.title}>{view === "login" ? "Login" : "Recover Password"}</h2>

        <input
          style={styles.input}
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {view === "login" && (
          <>
            <input
              style={styles.input}
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <div style={{ textAlign: "right", marginBottom: "14px" }}>
              <span style={{ ...styles.link, fontSize: "0.85rem" }} onClick={() => setView("forgot")}>
                Forgot Password?
              </span>
            </div>
          </>
        )}

        <button style={styles.btn} onClick={submit} disabled={loading}>
          {loading ? "Processing..." : view === "login" ? "Login" : "Send Reset Link"}
        </button>

        {view === "forgot" && (
          <p style={styles.text}>
            Remembered?{" "}
            <span style={styles.link} onClick={() => setView("login")}>
              Back to Login
            </span>
          </p>
        )}

        {view === "login" && (
          <p style={styles.text}>
            No account?{" "}
            <span style={styles.link} onClick={() => setPage("signup")}>
              Sign up
            </span>
          </p>
        )}
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
