import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import "./dashboard.css";

const DashboardLayout = ({ children, activePage, onNavigate }) => {
    const [isOpen, setIsOpen] = useState(false);
    const { user, logout } = useContext(AuthContext);

    const handleNav = (page) => {
        if (onNavigate) {
            onNavigate(page);
            setIsOpen(false); // Close mobile menu on select
        } else {
            // Fallback if no navigation handler provided (e.g. initial load or error)
            window.location.reload();
        }
    };

    return (
        <div className="dashboard-layout">
            {/* Mobile Menu Toggle */}
            <button className="menu-toggle" onClick={() => setIsOpen(!isOpen)}>
                ☰
            </button>

            {/* Sidebar */}
            <div className={`sidebar ${isOpen ? "open" : ""}`}>
                <div className="sidebar-top">
                    {user && (
                        <div className="user-details">
                            {user.profileImage ? (
                                <img
                                    src={user.profileImage.startsWith('http') ? user.profileImage : `http://localhost:5000${user.profileImage}`}
                                    alt="Profile"
                                    style={{
                                        width: '80px',
                                        height: '80px',
                                        borderRadius: '50%',
                                        objectFit: 'cover'
                                    }}
                                />
                            ) : (
                                <div style={{
                                    width: '80px',
                                    height: '80px',
                                    borderRadius: '50%',
                                    background: '#3b82f6',
                                    color: 'white',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: 'bold',
                                    fontSize: '2rem'
                                }}>
                                    {user.name?.charAt(0).toUpperCase()}
                                </div>
                            )}
                            <div>
                                <div className="user-name">{user.name}</div>
                                <div className="user-role">{user.role.charAt(0).toUpperCase() + user.role.slice(1)}</div>
                            </div>
                        </div>
                    )}
                </div>

                <nav className="menu">
                    <button
                        className={activePage === 'dashboard' ? 'active' : ''}
                        onClick={() => handleNav('dashboard')}
                    >
                        Dashboard
                    </button>

                    <button
                        className={activePage === 'clients' ? 'active' : ''}
                        onClick={() => handleNav('clients')}
                    >
                        Clients
                    </button>

                    <button
                        className={activePage === 'mechanics' ? 'active' : ''}
                        onClick={() => handleNav('mechanics')}
                    >
                        Mechanics
                    </button>

                    <button
                        className={activePage === 'jobs' ? 'active' : ''}
                        onClick={() => handleNav('jobs')}
                    >
                        Jobs
                    </button>

                    <button
                        className={activePage === 'reports' ? 'active' : ''}
                        onClick={() => handleNav('reports')}
                    >
                        Reports
                    </button>


                    <button
                        className={activePage === 'profile' ? 'active' : ''}
                        onClick={() => handleNav('profile')}
                    >
                        Profile
                    </button>
                </nav>

                <button className="logout-btn" onClick={logout}>
                    Logout
                </button>
            </div>

            {/* Main Content */}
            <div className="dashboard-content">
                {children}
            </div>

            {/* Overlay for mobile when sidebar is open */}
            {isOpen && (
                <div
                    style={{
                        position: 'fixed',
                        inset: 0,
                        background: 'rgba(0,0,0,0.5)',
                        zIndex: 999
                    }}
                    onClick={() => setIsOpen(false)}
                />
            )}
        </div>
    );
};

export default DashboardLayout;
