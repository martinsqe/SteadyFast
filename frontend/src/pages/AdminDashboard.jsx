import { useEffect, useState } from "react";
import api from "../api/axios";
import DashboardLayout from "../components/DashboardLayout";
import AdminJobs from "./AdminJobs";
import AdminReports from "./AdminReports";
import AdminProfile from "./AdminProfile";
import "./AdminDashboard.css";

function AdminDashboard() {
    // specific view state: 'dashboard', 'clients', 'mechanics', 'jobs', 'reports', 'profile'
    const [activeView, setActiveView] = useState('dashboard');

    // Data states
    const [users, setUsers] = useState([]);
    const [userStats, setUserStats] = useState({ clients: 0, mechanics: 0, total: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState("all");

    // Modal states
    const [selectedUser, setSelectedUser] = useState(null);
    const [modalType, setModalType] = useState(null); // 'view', 'edit', 'delete'

    // Sync activeView with filter
    useEffect(() => {
        if (activeView === 'clients') setFilter('client');
        else if (activeView === 'mechanics') setFilter('mechanic');
        else if (activeView === 'dashboard') setFilter('all');

        if (activeView === 'dashboard') {
            fetchStats();
        }
    }, [activeView]);

    const fetchStats = async () => {
        try {
            const authStats = await api.get("/auth/stats");
            if (authStats.data.success) {
                setUserStats(authStats.data.stats);
            }
        } catch (err) {
            console.error("Error fetching stats:", err);
        }
    };

    // Fetch users when filter changes (only if we are in a user-related view)
    useEffect(() => {
        if (['dashboard', 'clients', 'mechanics'].includes(activeView)) {
            fetchUsers();
        }
    }, [filter, activeView]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            setError(null);

            const url = filter === "all"
                ? "/auth/users"
                : `/auth/users?role=${filter}`;

            const response = await api.get(url);

            setUsers(response.data.users || []);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to fetch users");
            console.error("Error fetching users:", err);
        } finally {
            setLoading(false);
        }
    };

    const getRoleBadgeClass = (role) => {
        switch (role) {
            case "admin": return "badge-admin";
            case "mechanic": return "badge-mechanic";
            case "client": return "badge-client";
            default: return "badge-default";
        }
    };

    const closeModal = () => {
        setSelectedUser(null);
        setModalType(null);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            const formData = {
                name: e.target.name.value,
                email: e.target.email.value,
                role: e.target.role.value,
                expertiseLevel: e.target.expertiseLevel?.value || undefined
            };

            const response = await api.put(`/auth/users/${selectedUser._id}`, formData);

            if (response.data.success) {
                // Sync local state
                setUsers(users.map(u => u._id === selectedUser._id ? { ...u, ...response.data.user } : u));
                alert("User updated successfully!");
                closeModal();
            }
        } catch (err) {
            alert(err.response?.data?.message || "Update failed");
        }
    };

    const handleDeleteConfirm = async () => {
        try {
            const response = await api.delete(`/auth/users/${selectedUser._id}`);
            if (response.data.success) {
                // Sync local state
                setUsers(users.filter(u => u._id !== selectedUser._id));
                alert("User removed from system");
                closeModal();
            }
        } catch (err) {
            alert(err.response?.data?.message || "Deletion failed");
        }
    };

    const stats = {
        total: userStats.total || 0,
        clients: userStats.clients || 0,
        mechanics: userStats.mechanics || 0,
        admins: userStats.admins || 0,
    };

    // Render content based on active view
    const renderContent = () => {
        if (activeView === 'jobs') return <AdminJobs />;
        if (activeView === 'reports') return <AdminReports />;
        if (activeView === 'profile') return <AdminProfile />;

        // Default: User Dashboard / Clients / Mechanics views
        return (
            <div className="admin-container">
                <h1>
                    {activeView === 'dashboard' ? '👨‍💼 Admin Dashboard' :
                        activeView === 'clients' ? '👥 Client Management' :
                            '🔧 Mechanic Management'}
                </h1>
                <p className="subtitle">
                    {activeView === 'dashboard' ? 'Manage all users and system settings' :
                        `Manage registered ${activeView}`}
                </p>

                {/* Statistics Cards - Show only relevant stats or all for dashboard */}
                <div className="stats-grid">
                    {activeView === 'dashboard' && (
                        <div className="stat-card">
                            <div className="stat-value">{stats.total}</div>
                            <div className="stat-label">Total Users</div>
                        </div>
                    )}
                    {(activeView === 'dashboard' || activeView === 'clients') && (
                        <div className="stat-card">
                            <div className="stat-value">{stats.clients}</div>
                            <div className="stat-label">Clients</div>
                        </div>
                    )}
                    {(activeView === 'dashboard' || activeView === 'mechanics') && (
                        <div className="stat-card">
                            <div className="stat-value">{stats.mechanics}</div>
                            <div className="stat-label">Mechanics</div>
                        </div>
                    )}
                </div>

                {/* Filter Tabs - Removed since sidebar handles navigation now */}

                {/* Loading State */}
                {loading && (
                    <div className="loading-container">
                        <div className="spinner"></div>
                        <p>Loading users...</p>
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div className="error-container">
                        <p>❌ {error}</p>
                        <button onClick={fetchUsers}>Retry</button>
                    </div>
                )}

                {/* Users Table */}
                {!loading && !error && (
                    <div className="table-container">
                        <table className="users-table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Role</th>
                                    <th>Joined</th>
                                    <th>Service Professional</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="no-users">
                                            No {activeView === 'dashboard' ? 'users' : activeView} found
                                        </td>
                                    </tr>
                                ) : (
                                    users.map((user, index) => (
                                        <tr key={user._id}>
                                            <td>{index + 1}</td>
                                            <td className="user-name">
                                                <div className="user-avatar">
                                                    {user.name.charAt(0).toUpperCase()}
                                                </div>
                                                {user.name}
                                            </td>
                                            <td>{user.email}</td>
                                            <td>
                                                <span className={`role-badge ${getRoleBadgeClass(user.role)}`}>
                                                    {user.role === 'client' ? 'Client' :
                                                        user.role === 'mechanic' ? 'Mechanic' :
                                                            user.role === 'admin' ? 'Admin' : user.role}
                                                </span>
                                            </td>
                                            <td>
                                                {new Date(user.createdAt).toLocaleDateString()}
                                            </td>
                                            <td>
                                                {user.role === 'client' ? (
                                                    user.personalMechanic ? (
                                                        <span className="status-badge status-approved" style={{ fontSize: '0.75rem' }}>
                                                            {user.personalMechanic?.name || 'Assigned'}
                                                        </span>
                                                    ) : (
                                                        <span className="status-badge status-pending" style={{ fontSize: '0.75rem' }}>
                                                            Not Assigned
                                                        </span>
                                                    )
                                                ) : (
                                                    <span style={{ color: 'rgba(255,255,255,0.3)' }}>N/A</span>
                                                )}
                                            </td>
                                            <td className="actions">
                                                <button
                                                    className="btn-view"
                                                    onClick={() => {
                                                        setSelectedUser(user);
                                                        setModalType('view');
                                                    }}
                                                >
                                                    View
                                                </button>
                                                <button
                                                    className="btn-edit"
                                                    onClick={() => {
                                                        setSelectedUser(user);
                                                        setModalType('edit');
                                                    }}
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    className="btn-delete"
                                                    onClick={() => {
                                                        setSelectedUser(user);
                                                        setModalType('delete');
                                                    }}
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* MODALS */}
                {modalType && selectedUser && (
                    <div className="modal-overlay" onClick={closeModal}>
                        <div className="modal-content" onClick={e => e.stopPropagation()}>

                            {/* VIEW MODE */}
                            {modalType === 'view' && (
                                <>
                                    <h2>Detailed User Profile</h2>
                                    <div className="modal-user-info">
                                        <div className="modal-avatar">
                                            {selectedUser.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="modal-details">
                                            <div className="detail-row"><strong>Name:</strong> <span>{selectedUser.name}</span></div>
                                            <div className="detail-row"><strong>Email:</strong> <span>{selectedUser.email}</span></div>
                                            <div className="detail-row">
                                                <strong>Role:</strong>
                                                <span className={`role-badge ${getRoleBadgeClass(selectedUser.role)}`} style={{ textTransform: 'capitalize' }}>
                                                    {selectedUser.role}
                                                </span>
                                            </div>
                                            <div className="detail-row"><strong>Phone:</strong> <span>{selectedUser.phone || 'Not provided'}</span></div>
                                            <div className="detail-row"><strong>Address:</strong> <span>{selectedUser.address || 'Not provided'}</span></div>
                                            {selectedUser.role === 'mechanic' && (
                                                <div className="detail-row expertise-highlight">
                                                    <strong>Expertise:</strong>
                                                    <span>{selectedUser.expertiseLevel || 'General Professional'}</span>
                                                </div>
                                            )}
                                            <div className="detail-row">
                                                <strong>Member Since:</strong>
                                                <span>{new Date(selectedUser.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })}</span>
                                            </div>
                                            <div className="detail-row" style={{ opacity: 0.5, fontSize: '0.7rem' }}>
                                                <strong>System ID:</strong> {selectedUser._id}
                                            </div>
                                        </div>
                                    </div>
                                    <button className="modal-close" onClick={closeModal} style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }}>Close</button>
                                </>
                            )}

                            {/* EDIT MODE */}
                            {modalType === 'edit' && (
                                <>
                                    <h2>Modify User Record</h2>
                                    <form className="edit-form" onSubmit={handleSave}>
                                        <label>
                                            Legal Name
                                            <input type="text" name="name" defaultValue={selectedUser.name} required />
                                        </label>
                                        <label>
                                            System Email
                                            <input type="email" name="email" defaultValue={selectedUser.email} required />
                                        </label>
                                        <label>
                                            System Role
                                            <select name="role" defaultValue={selectedUser.role}>
                                                <option value="client">Client</option>
                                                <option value="mechanic">Mechanic</option>
                                                <option value="admin">Admin</option>
                                            </select>
                                        </label>
                                        {selectedUser.role === 'mechanic' && (
                                            <label>
                                                Professional Expertise
                                                <select name="expertiseLevel" defaultValue={selectedUser.expertiseLevel}>
                                                    <option value="Engine Expert">Engine Expert</option>
                                                    <option value="Lights and Electrician Expert">Lights and Electrician Expert</option>
                                                    <option value="Drivetrain & Power Delivery">Drivetrain & Power Delivery</option>
                                                    <option value="Transmission & Gearbox Expertise">Transmission & Gearbox Expertise</option>
                                                    <option value="Hybrid & Electric Propulsion Systems">Hybrid & Electric Propulsion Systems</option>
                                                    <option value="Suspension & Wheel Dynamics">Suspension & Wheel Dynamics</option>
                                                    <option value="Beginner">Beginner</option>
                                                    <option value="Intermediate">Intermediate</option>
                                                    <option value="Expert">Expert</option>
                                                    <option value="Master">Master</option>
                                                </select>
                                            </label>
                                        )}
                                        <div className="modal-buttons">
                                            <button type="submit" className="modal-save" style={{ background: '#10b981' }}>Update Database</button>
                                            <button type="button" className="modal-cancel" onClick={closeModal}>Discard</button>
                                        </div>
                                    </form>
                                </>
                            )}

                            {/* DELETE MODE */}
                            {modalType === 'delete' && (
                                <>
                                    <h2 style={{ color: '#ef4444' }}>⚠️ Irreversible User Deletion</h2>
                                    <div className="delete-confirm">
                                        <p>You are about permanently remove this user from the SteadyFast ecosystem. This will delete all associated profile data.</p>
                                        <div className="delete-user-info" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                                            <p><strong>Name:</strong> {selectedUser.name}</p>
                                            <p><strong>Email:</strong> {selectedUser.email}</p>
                                            <p><strong>Role:</strong> <span style={{ textTransform: 'capitalize' }}>{selectedUser.role}</span></p>
                                        </div>
                                        <div className="modal-buttons">
                                            <button className="modal-delete" onClick={handleDeleteConfirm} style={{ background: '#ef4444' }}>Confirm Deletion</button>
                                            <button className="modal-cancel" onClick={closeModal}>Go Back</button>
                                        </div>
                                    </div>
                                </>
                            )}

                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <DashboardLayout activePage={activeView} onNavigate={setActiveView}>
            {renderContent()}
        </DashboardLayout>
    );
}

export default AdminDashboard;
