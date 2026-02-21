import { useState, useEffect } from "react";
import api from "../api/axios";

function ResetPassword({ token, setPage }) {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            alert("Passwords do not match");
            return;
        }

        if (password.length < 6) {
            alert("Password must be at least 6 characters");
            return;
        }

        try {
            setLoading(true);
            const { data } = await api.post("/auth/reset-password", {
                token,
                password
            });

            if (data.success) {
                setSuccess(true);
                alert(data.message);
                // Clear the /reset-password/TOKEN from the URL
                window.history.pushState({}, "", "/");
                setPage("login");
            }
        } catch (err) {
            alert(err.response?.data?.message || "Reset failed. Token may be invalid or expired.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.page}>
            <div style={styles.card}>
                <h2 style={styles.title}>Set New Password</h2>

                {success ? (
                    <div style={{ textAlign: "center" }}>
                        <p style={{ color: "#10b981", fontWeight: "600" }}>Password successfully updated!</p>
                        <p style={styles.text}>Redirecting to login...</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <p style={{ ...styles.text, marginBottom: "20px", color: "#6b7280" }}>
                            Enter your new secure password below.
                        </p>

                        <input
                            style={styles.input}
                            type="password"
                            placeholder="New Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />

                        <input
                            style={styles.input}
                            type="password"
                            placeholder="Confirm New Password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />

                        <button style={styles.btn} type="submit" disabled={loading}>
                            {loading ? "Updating..." : "Reset Password"}
                        </button>

                        <p style={styles.text}>
                            Changed your mind?{" "}
                            <span
                                style={styles.link}
                                onClick={() => {
                                    window.history.pushState({}, "", "/");
                                    setPage("login");
                                }}
                            >
                                Back to Login
                            </span>
                        </p>
                    </form>
                )}
            </div>
        </div>
    );
}

const styles = {
    page: { minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center" },
    card: { width: "350px", padding: "32px", borderRadius: "14px", background: "rgba(255,255,255,0.95)", boxShadow: "0 12px 28px rgba(0,0,0,0.18)" },
    title: { textAlign: "center", marginBottom: "10px", fontSize: "1.6rem", fontWeight: "700" },
    input: { width: "100%", padding: "11px", marginBottom: "14px", borderRadius: "8px", border: "1px solid #d1d5db", outline: "none" },
    btn: { width: "100%", padding: "12px", background: "#2563eb", color: "white", border: "none", borderRadius: "8px", fontWeight: "600", cursor: "pointer" },
    text: { textAlign: "center", marginTop: "14px", fontSize: "0.95rem" },
    link: { color: "#2563eb", cursor: "pointer", fontWeight: "600" }
};

export default ResetPassword;
