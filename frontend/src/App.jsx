import { useState, useContext } from "react";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

// Pages
import Home from "./pages/Home";
import About from "./pages/About";
import Emergency from "./pages/Emergency";
import Tips from "./pages/Tips";
import Chat from "./pages/Chat";
import Login from "./pages/Login";
import Signup from "./pages/Signup";

// Dashboards
import AdminDashboard from "./pages/AdminDashboard";
import ClientDashboard from "./pages/ClientDashboard";
import MechanicDashboard from "./pages/MechanicDashboard";

import { AuthContext } from "./context/AuthContext";

function App() {
  const [page, setPage] = useState("home");
  const { user } = useContext(AuthContext);

  const renderPage = () => {
    if (user?.role === "admin") return <AdminDashboard />;
    if (user?.role === "client") return <ClientDashboard />;
    if (user?.role === "mechanic") return <MechanicDashboard />;

    switch (page) {
      case "about":
        return <About />;
      case "emergency":
        return <Emergency />;
      case "tips":
        return <Tips />;
      case "chat":
        return <Chat />;
      case "login":
        return <Login setPage={setPage} />;
      case "signup":
        return <Signup setPage={setPage} />;
      default:
        return <Home />;
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        background: "url('/bg.jpg') center / cover no-repeat fixed",
        position: "relative",
      }}
    >
      {/* SOFT OVERLAY */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "linear-gradient(to bottom, rgba(0,0,0,0.35), rgba(0,0,0,0.55))",
          zIndex: 0,
        }}
      />

      <div style={{ position: "relative", zIndex: 2 }}>
        {/* Hide Navbar for Admin, Mechanic, and Client */}
        {!['admin', 'mechanic', 'client'].includes(user?.role) && <Navbar setPage={setPage} />}

        <div
          className="page-fade"
          style={{
            minHeight: "100vh",
            paddingTop: ['admin', 'mechanic', 'client'].includes(user?.role) ? "0" : "70px",
          }}
        >
          {renderPage()}
        </div>

        {/* Hide Footer for Admin and Mechanic, but KEEP for Client */}
        {!['admin', 'mechanic'].includes(user?.role) && <Footer />}
      </div>
    </div>
  );
}

export default App;
