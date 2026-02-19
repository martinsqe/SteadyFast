import { useState } from "react";
import MechanicLayout from "../components/MechanicLayout";
import MechanicOverview from "../components/Mechanic/MechanicOverview";
import MyClients from "../components/Mechanic/MyClients";
import MechanicReviews from "../components/Mechanic/MechanicReviews";
import JobHistory from "../components/Mechanic/JobHistory";
import Revenue from "../components/Mechanic/Revenue";
import MechanicProfile from "../components/Mechanic/MechanicProfile";
import AvailableJobs from "../components/Mechanic/AvailableJobs";
import MechanicActiveJobs from "../components/Mechanic/MechanicActiveJobs";

export default function MechanicDashboard() {
  const [activeView, setActiveView] = useState('dashboard');

  const renderContent = () => {
    switch (activeView) {
      case 'dashboard': return <MechanicOverview />;
      case 'available-jobs': return <AvailableJobs />;
      case 'active-jobs': return <MechanicActiveJobs />;
      case 'clients': return <MyClients />;
      case 'reviews': return <MechanicReviews />;
      case 'history': return <JobHistory />;
      case 'revenue': return <Revenue />;
      case 'profile': return <MechanicProfile />;
      default: return <MechanicOverview />;
    }
  };

  return (
    <MechanicLayout activePage={activeView} onNavigate={setActiveView}>
      {renderContent()}
    </MechanicLayout>
  );
}

