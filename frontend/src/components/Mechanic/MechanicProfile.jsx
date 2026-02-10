import { useState, useContext, useEffect } from "react";
import { AuthContext } from "../../context/AuthContext";
import api from "../../api/axios";
import "./MechanicProfile.css";

const MechanicProfile = () => {
    const { user, updateUser } = useContext(AuthContext);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        address: "",
        dateOfBirth: "",
        expertiseLevel: "",
        password: "",
        confirmPassword: ""
    });
    const [imagePreview, setImagePreview] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });

    useEffect(() => {
        if (!user) return;

        try {
            let formattedDob = "";
            if (user.dateOfBirth) {
                try {
                    formattedDob = new Date(user.dateOfBirth).toISOString().split('T')[0];
                } catch (e) {
                    console.error("Invalid DOB date:", user.dateOfBirth);
                }
            }

            setFormData({
                name: user.name || "",
                email: user.email || "",
                phone: user.phone || "",
                address: user.address || "",
                dateOfBirth: formattedDob,
                expertiseLevel: user.expertiseLevel || "Beginner",
                password: "",
                confirmPassword: ""
            });

            if (user.profileImage) {
                const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
                const baseUrl = apiUrl.replace('/api', '');
                const imageUrl = user.profileImage.startsWith('http')
                    ? user.profileImage
                    : `${baseUrl}${user.profileImage}`;
                setImagePreview(imageUrl);
            }
        } catch (err) {
            console.error("Error inside MechanicProfile useEffect:", err);
        }
    }, [user]);

    if (!user) return <div style={{ color: 'white', padding: 20 }}>Loading user profile...</div>;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ type: "", text: "" });

        if (formData.password && formData.password !== formData.confirmPassword) {
            setMessage({ type: "error", text: "Passwords do not match" });
            return;
        }

        try {
            setLoading(true);

            const data = new FormData();
            data.append("name", formData.name);
            data.append("email", formData.email);
            data.append("phone", formData.phone);
            data.append("address", formData.address);
            if (formData.dateOfBirth) data.append("dateOfBirth", formData.dateOfBirth);
            data.append("expertiseLevel", formData.expertiseLevel);

            if (formData.password) data.append("password", formData.password);
            if (selectedFile) data.append("image", selectedFile);

            const response = await api.put("/auth/profile", data, {
                headers: {
                    "Content-Type": "multipart/form-data",
                }
            });

            if (response.data) {
                const storedUser = JSON.parse(localStorage.getItem("user"));
                const updatedUser = { ...storedUser, ...response.data };
                localStorage.setItem("user", JSON.stringify(updatedUser));
                if (updateUser) updateUser(response.data);
                setMessage({ type: "success", text: "Profile updated successfully!" });
            }
        } catch (error) {
            setMessage({ type: "error", text: error.response?.data?.message || "Update failed" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="profile-container">
            <div className="profile-header">
                <h1>👤 Mechanic Profile</h1>
                <p>Manage your professional details and account settings</p>
            </div>

            <div className="profile-content">
                <div className="profile-card">
                    <div className="profile-image-section">
                        <div className="profile-avatar-large">
                            {imagePreview ? (
                                <img src={imagePreview} alt="Profile" />
                            ) : (
                                <div className="avatar-placeholder">
                                    {user?.name?.charAt(0).toUpperCase()}
                                </div>
                            )}
                            <label htmlFor="imageUpload" className="camera-icon">📷</label>
                            <input
                                type="file"
                                id="imageUpload"
                                hidden
                                accept="image/*"
                                onChange={handleImageChange}
                            />
                        </div>
                        <h2>{user?.name}</h2>
                        <span className="role-badge badge-mechanic">Mechanic</span>
                    </div>
                </div>

                <form className="profile-form" onSubmit={handleSubmit}>
                    {message.text && (
                        <div className={`message-alert ${message.type}`}>
                            {message.text}
                        </div>
                    )}

                    <div className="form-grid">
                        <div className="form-group">
                            <label>Full Name</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Email Address</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Phone Number</label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="+1 234 567 8900"
                            />
                        </div>

                        <div className="form-group">
                            <label>Address</label>
                            <input
                                type="text"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                placeholder="123 Main St, City"
                            />
                        </div>

                        <div className="form-group">
                            <label>Date of Birth</label>
                            <input
                                type="date"
                                name="dateOfBirth"
                                value={formData.dateOfBirth}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="form-group full-width">
                            <label>Professional Expertise Specialties</label>
                            <p className="field-desc">Select your primary area of specialization to help clients find you</p>
                            <div className="expertise-grid">
                                {[
                                    { id: "Engine Expert", label: "Engine", icon: "⚙️", desc: "Internal combustion & performance" },
                                    { id: "Lights and Electrician Expert", label: "Electrical", icon: "⚡", desc: "Wiring, ECUs & lighting" },
                                    { id: "Drivetrain & Power Delivery", label: "Drivetrain", icon: "⛓️", desc: "Axles, shafts & differentials" },
                                    { id: "Transmission & Gearbox Expertise", label: "Transmission", icon: "🕹️", desc: "Gear systems" },
                                    { id: "Hybrid & Electric Propulsion Systems", label: "Hybrid/EV", icon: "🔋", desc: "Motors & batteries" },
                                    { id: "Suspension & Wheel Dynamics", label: "Chassis", icon: "🏁", desc: "Suspension & braking" },
                                    { id: "Beginner", label: "Beginner", icon: "🛠️", desc: "Entry level" },
                                    { id: "Intermediate", label: "Intermediate", icon: "🔧", desc: "Solid foundation" },
                                    { id: "Expert", label: "Expert", icon: "🌟", desc: "Veteran level" },
                                    { id: "Master", label: "Master", icon: "👑", desc: "Top-tier diagnostic" }
                                ].map((option) => (
                                    <div
                                        key={option.id}
                                        className={`expertise-card ${formData.expertiseLevel === option.id ? 'active' : ''}`}
                                        onClick={() => setFormData({ ...formData, expertiseLevel: option.id })}
                                    >
                                        <div className="exp-icon">{option.icon}</div>
                                        <div className="exp-info">
                                            <div className="exp-label">{option.label}</div>
                                            <div className="exp-desc">{option.desc}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="form-group">
                            <label>New Password (optional)</label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="form-group">
                            <label>Confirm New Password</label>
                            <input
                                type="password"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="form-actions">
                        <button type="submit" className="save-btn" disabled={loading}>
                            {loading ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default MechanicProfile;
