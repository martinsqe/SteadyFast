import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import "./dashboard.css";

const ClientLayout = ({ children, activePage, onNavigate }) => {
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
                                <div className="user-role">Client</div>
                            </div>
                        </div>
                    )}
                </div>

                <nav className="menu">
                    <button
                        className={activePage === 'overview' ? 'active' : ''}
                        onClick={() => handleNav('overview')}
                    >
                        Dashboard
                    </button>

                    <button
                        className={activePage === 'home' ? 'active' : ''}
                        onClick={() => handleNav('home')}
                    >
                        Home
                    </button>

                    <button
                        className={activePage === 'active-jobs' ? 'active' : ''}
                        onClick={() => handleNav('active-jobs')}
                    >
                        🚗 Active Jobs
                    </button>

                    <button
                        className={activePage === 'about' ? 'active' : ''}
                        onClick={() => handleNav('about')}
                    >
                        About Us
                    </button>

                    <button
                        className={activePage === 'emergency' ? 'active' : ''}
                        onClick={() => handleNav('emergency')}
                    >
                        Emergency
                    </button>

                    <button
                        className={activePage === 'tips' ? 'active' : ''}
                        onClick={() => handleNav('tips')}
                    >
                        Tips
                    </button>

                    <button
                        className={activePage === 'chat' ? 'active' : ''}
                        onClick={() => handleNav('chat')}
                    >
                        Chat
                    </button>

                    <button
                        className={activePage === 'mechanics' ? 'active' : ''}
                        onClick={() => handleNav('mechanics')}
                    >
                        Reliable Mechanics
                    </button>

                    <button
                        className={activePage === 'profile' ? 'active' : ''}
                        onClick={() => handleNav('profile')}
                    >
                        My Profile
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

export default ClientLayout;
