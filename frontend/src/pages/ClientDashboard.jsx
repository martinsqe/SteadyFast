import { useState, useEffect } from "react";
import ClientLayout from "../components/ClientLayout";
import Home from "./Home";
import About from "./About";
import Emergency from "./Emergency";
import Tips from "./Tips";
import Chat from "./Chat";
import ClientProfile from "../components/Client/ClientProfile";
import ClientMechanics from "./ClientMechanics";
import ClientActiveJobs from "../components/Client/ClientActiveJobs";
import { useSocket } from "../context/SocketContext";

export default function ClientDashboard() {
  const [activeView, setActiveView] = useState('overview');
  const [notification, setNotification] = useState(null);
  const { socket } = useSocket();

  useEffect(() => {
    if (socket) {
      const handleJobAccepted = (data) => {
        console.log("Global: Job accepted", data);
        setNotification({
          type: 'success',
          title: 'Mechanic Found!',
          message: `${data.job.mechanic?.name} has accepted your request.`,
          action: () => setActiveView('active-jobs')
        });
      };

      const handleStatusUpdate = (data) => {
        console.log("Global: Status update", data);
        const messages = {
          on_the_way: "Mechanic is on the way!",
          arrived: "Mechanic has arrived at your location.",
          completed: "Service complete! Review your invoice."
        };

        setNotification({
          type: 'info',
          title: 'Job Update',
          message: messages[data.status] || `Status updated to ${data.status}`,
          action: () => setActiveView('active-jobs')
        });
      };

      socket.on("job:accepted", handleJobAccepted);
      socket.on("job:status:update", handleStatusUpdate);

      return () => {
        socket.off("job:accepted", handleJobAccepted);
        socket.off("job:status:update", handleStatusUpdate);
      };
    }
  }, [socket]);

  // Auto-hide notification after 10 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 10000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const renderContent = () => {
    switch (activeView) {
      case 'overview':
        return (
          <div className="client-overview">
            <h1>Welcome to Your Dashboard</h1>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-value">Active</div>
                <div className="stat-label">System Status</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">Ready</div>
                <div className="stat-label">Emergency Service</div>
              </div>
            </div>

            <div className="table-container" style={{ marginTop: '2rem' }}>
              <h3>Quick Actions</h3>
              <p>Select an option from the sidebar to manage your account or request services.</p>
            </div>
          </div>
        );
      case 'home': return <Home />;
      case 'active-jobs': return <ClientActiveJobs />;
      case 'about': return <About />;
      case 'emergency': return <Emergency />;
      case 'tips': return <Tips />;
      case 'chat': return <Chat />;
      case 'mechanics': return <ClientMechanics />;
      case 'profile': return <ClientProfile />;
      default: return <div style={{ color: 'white' }}>Page not found</div>;
    }
  };

  return (
    <ClientLayout activePage={activeView} onNavigate={setActiveView}>
      {notification && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
          color: 'white',
          padding: '20px',
          borderRadius: '15px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
          border: '1px solid #334155',
          zIndex: 10000,
          minWidth: '300px',
          cursor: 'pointer',
          animation: 'slideIn 0.3s ease-out',
          display: 'flex',
          flexDirection: 'column',
          gap: '5px'
        }}
          onClick={() => {
            notification.action();
            setNotification(null);
          }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <strong style={{ color: '#3b82f6', fontSize: '1.1rem' }}>{notification.title}</strong>
            <button onClick={(e) => { e.stopPropagation(); setNotification(null); }} style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer' }}>✕</button>
          </div>
          <p style={{ margin: 0, fontSize: '0.9rem' }}>{notification.message}</p>
          <div style={{ fontSize: '0.8rem', color: '#3b82f6', marginTop: '5px' }}>Click to view details →</div>
        </div>
      )}
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
      {renderContent()}
    </ClientLayout>
  );
}
