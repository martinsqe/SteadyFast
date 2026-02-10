import { useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import AdminDashboardOverview from "./AdminDashboardOverview";
import AdminUsers from "./AdminUsers";
import AdminMechanics from "./AdminMechanics";
import AdminJobs from "./AdminJobs";
import AdminReports from "./AdminReports";

function AdminDashboard() {
    const [activePage, setActivePage] = useState("dashboard");

    const renderPage = () => {
        switch (activePage) {
            case "dashboard":
                return <AdminDashboardOverview />;
            case "users":
                return <AdminUsers />;
            case "mechanics":
                return <AdminMechanics />;
            case "jobs":
                return <AdminJobs />;
            case "reports":
                return <AdminReports />;
            default:
                return <AdminDashboardOverview />;
        }
    };

    return (
        <DashboardLayout activePage={activePage} onPageChange={setActivePage}>
            {renderPage()}
        </DashboardLayout>
    );
}

export default AdminDashboard;
