import { useState, useEffect, useContext } from "react";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";

const ClientMechanics = () => {
    const [mechanics, setMechanics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user, setUser } = useContext(AuthContext);

    useEffect(() => {
        fetchMechanics();
    }, []);

    const fetchMechanics = async () => {
        try {
            setLoading(true);
            const response = await api.get("/auth/mechanics");
            setMechanics(response.data.mechanics);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to fetch mechanics");
        } finally {
            setLoading(false);
        }
    };

    const handleAssign = async (mechanicId) => {
        try {
            const response = await api.post("/auth/assign-mechanic", { mechanicId });
            alert(response.data.message);
            // Sync with global auth state using the populated mechanic object from response
            updateUser({ personalMechanic: response.data.personalMechanic });
        } catch (err) {
            alert(err.response?.data?.message || "Assignment failed");
        }
    };

    if (loading) return <div className="loading">Finding reliable mechanics...</div>;
    if (error) return <div className="error">❌ {error}</div>;

    const currentMechanicId = user?.personalMechanic?._id || user?.personalMechanic;

    return (
        <div className="admin-container">
            <h1>🔧 Registered Mechanics</h1>
            <p className="subtitle">Select a professional to be your personal standby mechanic</p>

            <div className="stats-grid" style={{ marginBottom: '2rem', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
                {mechanics.length === 0 ? (
                    <p style={{ color: 'white' }}>No mechanics available at the moment.</p>
                ) : (
                    mechanics.map((mech) => (
                        <div
                            key={mech._id}
                            className="stat-card"
                            style={{
                                textAlign: 'left',
                                border: currentMechanicId === mech._id ? '1px solid #10b981' : '1px solid rgba(255,255,255,0.2)',
                                position: 'relative'
                            }}
                        >
                            {currentMechanicId === mech._id && (
                                <span style={{
                                    position: 'absolute',
                                    top: '10px',
                                    right: '10px',
                                    background: '#10b981',
                                    color: 'white',
                                    padding: '2px 8px',
                                    borderRadius: '10px',
                                    fontSize: '0.7rem'
                                }}>
                                    MY MECHANIC
                                </span>
                            )}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                                <div className="user-avatar" style={{ margin: 0 }}>
                                    {mech.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h3 style={{ margin: 0, color: 'white' }}>{mech.name}</h3>
                                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>{mech.email}</p>
                                </div>
                            </div>

                            <div style={{ marginBottom: '1.5rem' }}>
                                <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                                    <strong>Expertise:</strong> {mech.expertiseLevel || 'General Professional'}
                                </p>
                                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem' }}>
                                    📍 Serving all metropolitan areas
                                </p>
                            </div>

                            <button
                                className="btn-view"
                                style={{
                                    width: '100%',
                                    padding: '0.8rem',
                                    background: currentMechanicId === mech._id ? 'rgba(16, 185, 129, 0.2)' : undefined,
                                    border: currentMechanicId === mech._id ? '1px solid #10b981' : undefined,
                                    color: currentMechanicId === mech._id ? '#10b981' : undefined
                                }}
                                onClick={() => handleAssign(mech._id)}
                                disabled={currentMechanicId === mech._id}
                            >
                                {currentMechanicId === mech._id ? "Assigned as Your Mechanic" : "Assign as My Mechanic"}
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ClientMechanics;
