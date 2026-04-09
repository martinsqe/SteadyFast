import { useState, useContext, useEffect, useRef } from "react";
import { AuthContext } from "../../context/AuthContext";
import axios from "axios";

const API  = import.meta.env.VITE_API_URL;
const BASE = API ? API.replace("/api", "") : "http://localhost:5000";

const S = {
  page: { display: "flex", gap: "1.5rem", color: "#fff", alignItems: "flex-start", width: "100%" },
  sidebar: {
    width: "220px", flexShrink: 0,
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "16px", padding: "1.5rem 1.25rem",
    display: "flex", flexDirection: "column", alignItems: "center",
    gap: "0.6rem", textAlign: "center",
    position: "sticky", top: "1rem",
  },
  avatarRing: {
    position: "relative", width: "110px", height: "110px",
    borderRadius: "50%", border: "3px solid #3b82f6",
    boxShadow: "0 0 18px rgba(59,130,246,0.3)",
    overflow: "hidden", cursor: "pointer",
    background: "#0f172a",
    display: "flex", alignItems: "center", justifyContent: "center",
    marginBottom: "0.5rem",
  },
  avatarImg: { width: "100%", height: "100%", objectFit: "cover", display: "block" },
  avatarLetter: { fontSize: "2.8rem", fontWeight: 700, color: "rgba(255,255,255,0.5)" },
  name: { fontSize: "1.05rem", fontWeight: 700 },
  email: { fontSize: "0.75rem", color: "rgba(255,255,255,0.45)", wordBreak: "break-all" },
  rolePill: {
    display: "inline-block",
    background: "rgba(59,130,246,0.15)", color: "#3b82f6",
    border: "1px solid rgba(59,130,246,0.35)",
    padding: "3px 14px", borderRadius: "20px",
    fontSize: "0.78rem", fontWeight: 600,
  },
  infoRow: {
    display: "flex", alignItems: "center", gap: "0.5rem",
    fontSize: "0.78rem", color: "rgba(255,255,255,0.55)",
    textAlign: "left", padding: "0.4rem 0.6rem",
    background: "rgba(255,255,255,0.03)", borderRadius: "8px", width: "100%",
  },
  mainCard: {
    flex: 1, minWidth: 0,
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.09)",
    borderRadius: "16px", overflow: "hidden",
  },
  tabRow: {
    display: "flex",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(0,0,0,0.12)",
  },
  tabBtn: (active) => ({
    flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
    gap: "0.4rem", padding: "0.9rem 0.5rem",
    background: active ? "rgba(59,130,246,0.06)" : "none",
    border: "none",
    borderBottom: active ? "2px solid #3b82f6" : "2px solid transparent",
    color: active ? "#3b82f6" : "rgba(255,255,255,0.45)",
    fontSize: "0.86rem", fontWeight: active ? 600 : 500,
    cursor: "pointer", transition: "all 0.18s",
  }),
  body: { padding: "1.75rem" },
  alertSuccess: {
    padding: "0.85rem 1rem", borderRadius: "10px", marginBottom: "1.25rem",
    fontSize: "0.88rem", fontWeight: 500,
    background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.3)", color: "#34d399",
  },
  alertError: {
    padding: "0.85rem 1rem", borderRadius: "10px", marginBottom: "1.25rem",
    fontSize: "0.88rem", fontWeight: 500,
    background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.3)", color: "#f87171",
  },
  sectionTitle: { fontSize: "1rem", fontWeight: 700, marginBottom: "0.3rem", color: "#fff" },
  sectionDesc:  { fontSize: "0.82rem", color: "rgba(255,255,255,0.4)", margin: "0 0 1.25rem" },
  grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" },
  label: {
    display: "block", fontSize: "0.75rem", fontWeight: 600,
    color: "rgba(255,255,255,0.5)", textTransform: "uppercase",
    letterSpacing: "0.05em", marginBottom: "0.4rem",
  },
  input: {
    width: "100%", boxSizing: "border-box",
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: "10px", padding: "10px 14px",
    color: "#fff", fontSize: "0.9rem", outline: "none",
  },
  pwTips: {
    marginTop: "1.25rem", padding: "1rem 1.2rem",
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.07)", borderRadius: "12px",
  },
  footer: {
    display: "flex", justifyContent: "flex-end",
    marginTop: "2rem", paddingTop: "1.25rem",
    borderTop: "1px solid rgba(255,255,255,0.07)",
  },
  saveBtn: (loading) => ({
    display: "inline-flex", alignItems: "center", gap: "0.5rem",
    background: "linear-gradient(135deg,#3b82f6,#2563eb)",
    color: "#fff", border: "none",
    padding: "11px 32px", borderRadius: "10px",
    fontSize: "0.95rem", fontWeight: 600,
    cursor: loading ? "not-allowed" : "pointer",
    opacity: loading ? 0.65 : 1,
  }),
};

export default function ClientProfile() {
  const { user, updateUser } = useContext(AuthContext);
  const [tab, setTab] = useState("personal");
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);
  const fileRef = useRef(null);

  const [form, setForm] = useState({
    name: "", email: "", phone: "", address: "",
    password: "", confirmPassword: "",
  });

  useEffect(() => {
    if (!user) return;
    setForm({
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      address: user.address || "",
      password: "",
      confirmPassword: "",
    });
    if (user.profileImage) {
      setPreview(
        user.profileImage.startsWith("http")
          ? user.profileImage
          : `${BASE}${user.profileImage}`
      );
    }
  }, [user]);

  if (!user) return <div style={{ color: "#fff", padding: "2rem" }}>Loading profile...</div>;

  const set = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const pickFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const save = async (e) => {
    e.preventDefault();
    setMsg({ type: "", text: "" });

    if (tab === "security") {
      if (!form.password) { setMsg({ type: "error", text: "Enter a new password." }); return; }
      if (form.password !== form.confirmPassword) { setMsg({ type: "error", text: "Passwords do not match." }); return; }
    }

    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const data = new FormData();

      if (tab === "personal") {
        data.append("name", form.name);
        data.append("email", form.email);
        data.append("phone", form.phone);
        data.append("address", form.address);
        if (file) data.append("image", file);
      } else {
        data.append("password", form.password);
      }

      const res = await axios.put(`${API}/auth/profile`, data, {
        headers: { Authorization: `Bearer ${token}` },
      });

      updateUser(res.data);
      setMsg({ type: "success", text: "Profile updated successfully!" });
      setFile(null);
      if (tab === "security") setForm((p) => ({ ...p, password: "", confirmPassword: "" }));
    } catch (err) {
      setMsg({ type: "error", text: err.response?.data?.message || "Update failed." });
    } finally {
      setSaving(false);
    }
  };

  const TABS = [
    { id: "personal", label: "Personal Info", icon: "👤" },
    { id: "security", label: "Security",      icon: "🔒" },
  ];

  return (
    <div style={S.page}>
      {/* ── Sidebar ── */}
      <div style={S.sidebar}>
        <div style={S.avatarRing} onClick={() => fileRef.current?.click()}>
          {preview
            ? <img src={preview} alt="Profile" style={S.avatarImg} />
            : <span style={S.avatarLetter}>{(user.name || "?").charAt(0).toUpperCase()}</span>
          }
          <input ref={fileRef} type="file" hidden accept="image/*" onChange={pickFile} />
        </div>
        <div style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.4)", marginTop: "-0.3rem" }}>
          Click avatar to change photo
        </div>

        <div style={S.name}>{user.name}</div>
        <div style={S.email}>{user.email}</div>
        <span style={S.rolePill}>Client</span>

        <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "0.4rem", marginTop: "0.5rem" }}>
          {user.phone && (
            <div style={S.infoRow}><span>📞</span><span>{user.phone}</span></div>
          )}
          {user.address && (
            <div style={S.infoRow}><span>📍</span><span>{user.address}</span></div>
          )}
          {user.personalMechanic && (
            <div style={S.infoRow}>
              <span>🔧</span>
              <span>My mechanic: {user.personalMechanic?.name || "Assigned"}</span>
            </div>
          )}
        </div>
      </div>

      {/* ── Main Card ── */}
      <div style={S.mainCard}>
        {/* Tabs */}
        <div style={S.tabRow}>
          {TABS.map((t) => (
            <button
              key={t.id}
              style={S.tabBtn(tab === t.id)}
              onClick={() => { setTab(t.id); setMsg({ type: "", text: "" }); }}
            >
              <span>{t.icon}</span><span>{t.label}</span>
            </button>
          ))}
        </div>

        <form style={S.body} onSubmit={save}>
          {msg.text && (
            <div style={msg.type === "success" ? S.alertSuccess : S.alertError}>
              {msg.type === "success" ? "✅" : "⚠️"} {msg.text}
            </div>
          )}

          {/* ── Personal ── */}
          {tab === "personal" && (
            <div>
              <div style={S.sectionTitle}>Personal Information</div>
              <p style={S.sectionDesc}>Update your name, contact info and profile photo.</p>
              <div style={S.grid2}>
                <div>
                  <label style={S.label}>Full Name</label>
                  <input style={S.input} name="name" value={form.name} onChange={set} required placeholder="Jane Doe" />
                </div>
                <div>
                  <label style={S.label}>Email Address</label>
                  <input style={S.input} type="email" name="email" value={form.email} onChange={set} required placeholder="jane@example.com" />
                </div>
                <div>
                  <label style={S.label}>Phone Number</label>
                  <input style={S.input} type="tel" name="phone" value={form.phone} onChange={set} placeholder="+1 234 567 8900" />
                </div>
                <div>
                  <label style={S.label}>Address</label>
                  <input style={S.input} name="address" value={form.address} onChange={set} placeholder="123 Main Street, City" />
                </div>
              </div>
            </div>
          )}

          {/* ── Security ── */}
          {tab === "security" && (
            <div>
              <div style={S.sectionTitle}>Change Password</div>
              <p style={S.sectionDesc}>Use a strong, unique password to keep your account secure.</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div>
                  <label style={S.label}>New Password</label>
                  <input style={S.input} type="password" name="password" value={form.password} onChange={set} placeholder="Enter new password" autoComplete="new-password" />
                </div>
                <div>
                  <label style={S.label}>Confirm New Password</label>
                  <input style={S.input} type="password" name="confirmPassword" value={form.confirmPassword} onChange={set} placeholder="Repeat new password" autoComplete="new-password" />
                </div>
              </div>
              <div style={S.pwTips}>
                <p style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.38)", margin: "0 0 0.5rem" }}>Password must have:</p>
                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                  {[
                    ["At least 8 characters", form.password.length >= 8],
                    ["One uppercase letter",   /[A-Z]/.test(form.password)],
                    ["One number",             /[0-9]/.test(form.password)],
                  ].map(([txt, met]) => (
                    <li key={txt} style={{ fontSize: "0.82rem", color: met ? "#3b82f6" : "rgba(255,255,255,0.28)", display: "flex", gap: "0.45rem" }}>
                      <span>{met ? "●" : "○"}</span>{txt}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          <div style={S.footer}>
            <button type="submit" style={S.saveBtn(saving)} disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
