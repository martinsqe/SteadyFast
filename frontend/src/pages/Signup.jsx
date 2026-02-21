import { useState, useContext } from "react";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";

function Signup({ setPage }) {
    const { login } = useContext(AuthContext);

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [role, setRole] = useState("");

    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [isSubmitted, setIsSubmitted] = useState(false);

    const validatePassword = (pass) => {
        const hasLetter = /[a-zA-Z]/.test(pass);
        const hasNumber = /[0-9]/.test(pass);
        const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(pass);
        const isLongEnough = pass ? pass.length >= 5 : false;

        return hasLetter && hasNumber && hasSpecial && isLongEnough;
    };

    const getValidationState = (field) => {
        if (!touched[field] && !isSubmitted) return { color: "#d1d5db", error: "" };

        let error = "";
        let isValid = true;

        switch (field) {
            case "name":
                if (!name) { error = "Name is required"; isValid = false; }
                break;
            case "email":
                if (!email) { error = "Email is required"; isValid = false; }
                else if (!/\S+@\S+\.\S+/.test(email)) { error = "Invalid email format"; isValid = false; }
                break;
            case "password":
                if (!validatePassword(password)) {
                    error = "At least 5 chars, letter, number & symbol";
                    isValid = false;
                }
                break;
            case "confirmPassword":
                if (password !== confirmPassword) { error = "Passwords do not match"; isValid = false; }
                else if (!confirmPassword) { error = "Please confirm password"; isValid = false; }
                break;
            case "role":
                if (!role) { error = "Please select a role"; isValid = false; }
                break;
            default:
                break;
        }

        return {
            color: isValid ? "#16a34a" : "#ef4444",
            error: error,
            isValid
        };
    };

    const submit = async () => {
        setIsSubmitted(true);

        const fields = ["name", "email", "password", "confirmPassword", "role"];
        let formIsValid = true;
        const newErrors = {};

        fields.forEach(field => {
            const state = getValidationState(field);
            if (!state.isValid) {
                formIsValid = false;
                newErrors[field] = state.error;
            }
        });

        if (!formIsValid) {
            setErrors(newErrors);
            return;
        }

        try {
            const { data } = await api.post("/auth/register", {
                name,
                email,
                password,
                role,
            });
            login(data);
        } catch (err) {
            alert(err.response?.data?.message || "Signup failed");
        }
    };

    const ErrorMsg = ({ msg, field }) => {
        const state = getValidationState(field);
        if (state.error) {
            return <p style={styles.errorText}>{state.error}</p>;
        }
        if (state.color === "#16a34a") {
            return <p style={{ ...styles.errorText, color: "#16a34a" }}>Looks good!</p>;
        }
        return null;
    };

    const getInputStyle = (field) => {
        const state = getValidationState(field);
        return {
            ...styles.input,
            borderColor: state.color,
            borderWidth: state.color !== "#d1d5db" ? "2px" : "1px"
        };
    };

    return (
        <div style={styles.page}>
            <div style={styles.card}>
                <h2 style={styles.title}>Create Account</h2>

                <div style={styles.inputGroup}>
                    <label style={styles.label}>Full Name</label>
                    <input
                        style={getInputStyle("name")}
                        placeholder="John Doe"
                        onBlur={() => setTouched({ ...touched, name: true })}
                        onChange={(e) => setName(e.target.value)}
                    />
                    <ErrorMsg field="name" />
                </div>

                <div style={styles.inputGroup}>
                    <label style={styles.label}>Email Address</label>
                    <input
                        style={getInputStyle("email")}
                        type="email"
                        placeholder="john@example.com"
                        onBlur={() => setTouched({ ...touched, email: true })}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <ErrorMsg field="email" />
                </div>

                <div style={styles.inputGroup}>
                    <label style={styles.label}>Password</label>
                    <input
                        style={getInputStyle("password")}
                        type="password"
                        placeholder="••••••••"
                        onBlur={() => setTouched({ ...touched, password: true })}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <ErrorMsg field="password" />
                </div>

                <div style={styles.inputGroup}>
                    <label style={styles.label}>Confirm Password</label>
                    <input
                        style={getInputStyle("confirmPassword")}
                        type="password"
                        placeholder="••••••••"
                        onBlur={() => setTouched({ ...touched, confirmPassword: true })}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    <ErrorMsg field="confirmPassword" />
                </div>

                <div style={styles.inputGroup}>
                    <label style={styles.label}>Register as</label>
                    <select
                        style={getInputStyle("role")}
                        onBlur={() => setTouched({ ...touched, role: true })}
                        onChange={(e) => setRole(e.target.value)}
                    >
                        <option value="">Select a role</option>
                        <option value="client">Client</option>
                        <option value="mechanic">Mechanic</option>
                    </select>
                    <ErrorMsg field="role" />
                </div>

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
    page: { minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center", padding: "20px" },
    card: { width: "360px", padding: "32px", borderRadius: "14px", background: "rgba(255,255,255,0.95)", boxShadow: "0 12px 28px rgba(0,0,0,0.18)" },
    title: { textAlign: "center", marginBottom: "22px", fontSize: "1.6rem", fontWeight: "700" },
    inputGroup: { marginBottom: "16px" },
    label: { display: "block", marginBottom: "6px", fontSize: "0.9rem", fontWeight: "600", color: "#374151" },
    input: { width: "100%", padding: "11px", borderRadius: "8px", border: "1px solid #d1d5db", outline: "none", background: "white", boxSizing: "border-box" },
    errorText: { color: "#ef4444", fontSize: "0.8rem", marginTop: "4px", fontWeight: "500" },
    btn: { width: "100%", padding: "12px", background: "#16a34a", color: "white", border: "none", borderRadius: "8px", fontWeight: "600", cursor: "pointer", marginTop: "10px" },
    text: { textAlign: "center", marginTop: "14px", fontSize: "0.95rem" },
    link: { color: "#2563eb", cursor: "pointer", fontWeight: "600" }
};

export default Signup;
