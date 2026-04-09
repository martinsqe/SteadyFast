import { useState, useEffect } from "react";
import { useSocket } from "../context/SocketContext";
import MechanicLayout from "../components/MechanicLayout";
import MechanicOverview from "../components/Mechanic/MechanicOverview";
import MyClients from "../components/Mechanic/MyClients";
import MechanicReviews from "../components/Mechanic/MechanicReviews";
import JobHistory from "../components/Mechanic/JobHistory";
import Revenue from "../components/Mechanic/Revenue";
import MechanicProfile from "../components/Mechanic/MechanicProfile";
import AvailableJobs from "../components/Mechanic/AvailableJobs";
import MechanicActiveJobs from "../components/Mechanic/MechanicActiveJobs";
import Chat from "./Chat";

export default function MechanicDashboard() {
  const [activeView, setActiveView] = useState('dashboard');
  const [newJobBadge, setNewJobBadge] = useState(false);
  const { socket } = useSocket();

  // Show a badge on "Available Jobs" when a new job arrives while on another tab
  useEffect(() => {
    if (!socket) return;
    const handleNewJob = () => {
      setNewJobBadge(prev => !prev || true);
    };
    socket.on("job:new", handleNewJob);
    return () => socket.off("job:new", handleNewJob);
  }, [socket]);

  const handleNav = (view) => {
    if (view === 'available-jobs') setNewJobBadge(false);
    setActiveView(view);
  };

  const renderContent = () => {
    switch (activeView) {
      case 'dashboard': return <MechanicOverview />;
      case 'available-jobs': return <AvailableJobs />;
      case 'active-jobs': return <MechanicActiveJobs />;
      case 'clients': return <MyClients />;
      case 'reviews': return <MechanicReviews />;
      case 'history': return <JobHistory />;
      case 'revenue': return <Revenue />;
      case 'chat': return <Chat />;
      case 'profile': return <MechanicProfile />;
      default: return <MechanicOverview />;
    }
  };

  return (
    <MechanicLayout activePage={activeView} onNavigate={handleNav} newJobBadge={newJobBadge}>
      {renderContent()}
    </MechanicLayout>
  );
}

