import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import "./dashboard.css"; // Reuse existing styles

const MechanicLayout = ({ children, activePage, onNavigate }) => {
    const [isOpen, setIsOpen] = useState(false);
    const { user, logout } = useContext(AuthContext);

    const handleNav = (page) => {
        if (onNavigate) {
            onNavigate(page);
            setIsOpen(false);
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
                                    src={user.profileImage.startsWith('http') ? user.profileImage : `${import.meta.env.VITE_API_URL.replace('/api', '')}${user.profileImage}`}
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
                                    background: '#10b981', // Different color for mechanic
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
                                <div className="user-role">Mechanic</div>
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
                        className={activePage === 'available-jobs' ? 'active' : ''}
                        onClick={() => handleNav('available-jobs')}
                    >
                        Available Jobs
                    </button>

                    <button
                        className={activePage === 'clients' ? 'active' : ''}
                        onClick={() => handleNav('clients')}
                    >
                        My Clients
                    </button>

                    <button
                        className={activePage === 'reviews' ? 'active' : ''}
                        onClick={() => handleNav('reviews')}
                    >
                        Reviews
                    </button>

                    <button
                        className={activePage === 'history' ? 'active' : ''}
                        onClick={() => handleNav('history')}
                    >
                        Job History
                    </button>

                    <button
                        className={activePage === 'revenue' ? 'active' : ''}
                        onClick={() => handleNav('revenue')}
                    >
                        Revenue
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

            {/* Overlay */}
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

export default MechanicLayout;
