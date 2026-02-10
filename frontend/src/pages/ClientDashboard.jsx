import { useState } from "react";
import ClientLayout from "../components/ClientLayout";
import Home from "./Home";
import About from "./About";
import Emergency from "./Emergency";
import Tips from "./Tips";
import Chat from "./Chat";
import ClientProfile from "../components/Client/ClientProfile";
import ClientMechanics from "./ClientMechanics";

export default function ClientDashboard() {
  const [activeView, setActiveView] = useState('overview');

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
      {renderContent()}
    </ClientLayout>
  );
}
