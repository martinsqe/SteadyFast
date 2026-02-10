import { useState, useContext } from "react";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";

function Signup({ setPage }) {
    const { login } = useContext(AuthContext);

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("");

    const submit = async () => {
        try {
            const { data } = await api.post("/auth/register", {
                name,
                email,
                password,
                role,
            });

            // auto login after signup
            login(data);

        } catch (err) {
            alert(err.response?.data?.message || "Signup failed");
        }
    };

    return (
        <div style={styles.page}>
            <div style={styles.card}>
                <h2 style={styles.title}>Create Account</h2>

                <input style={styles.input} placeholder="Full Name" onChange={(e) => setName(e.target.value)} />
                <input style={styles.input} type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
                <input style={styles.input} type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />

                <select style={styles.input} onChange={(e) => setRole(e.target.value)}>
                    <option value="">Register as</option>
                    <option value="client">Client</option>
                    <option value="mechanic">Mechanic</option>
                </select>

                <button style={styles.btn} onClick={submit}>
                    Create Account
                </button>

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
    page: { minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center" },
    card: { width: "320px", padding: "32px", borderRadius: "14px", background: "rgba(255,255,255,0.95)", boxShadow: "0 12px 28px rgba(0,0,0,0.18)" },
    title: { textAlign: "center", marginBottom: "22px", fontSize: "1.6rem", fontWeight: "700" },
    input: { width: "100%", padding: "11px", marginBottom: "14px", borderRadius: "8px", border: "1px solid #d1d5db", outline: "none", background: "white" },
    btn: { width: "100%", padding: "12px", background: "#16a34a", color: "white", border: "none", borderRadius: "8px", fontWeight: "600", cursor: "pointer" },
    text: { textAlign: "center", marginTop: "14px", fontSize: "0.95rem" },
    link: { color: "#2563eb", cursor: "pointer", fontWeight: "600" }
};

export default Signup;
