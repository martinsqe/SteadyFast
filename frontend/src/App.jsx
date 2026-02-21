import { useState, useContext, useEffect } from "react";

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
import ResetPassword from "./pages/ResetPassword";

// Dashboards
import AdminDashboard from "./pages/AdminDashboard";
import ClientDashboard from "./pages/ClientDashboard";
import MechanicDashboard from "./pages/MechanicDashboard";

import { AuthContext } from "./context/AuthContext";

function App() {
  const [page, setPage] = useState(() => {
    // Initial page from URL if possible
    const path = window.location.pathname.replace("/", "");
    return path || "home";
  });
  const { user } = useContext(AuthContext);

  // 1. Scroll to Top and History Sync
  useEffect(() => {
    window.scrollTo(0, 0);

    // Sync URL without full reload
    const currentPath = page === "home" ? "/" : `/${page}`;
    if (window.location.pathname !== currentPath) {
      window.history.pushState({ page }, "", currentPath);
    }
  }, [page, user?.role]);

  // 2. Handle Browser Back/Forward
  useEffect(() => {
    const handlePopState = (event) => {
      if (event.state && event.state.page) {
        setPage(event.state.page);
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // Simple token extraction for reset-password logic
  const getResetToken = () => {
    const path = window.location.pathname;
    if (path.startsWith("/reset-password/")) {
      return path.split("/reset-password/")[1];
    }
    return null;
  };

  const renderPage = () => {
    if (user?.role === "admin") return <AdminDashboard key="admin" />;
    if (user?.role === "client") return <ClientDashboard key="client" />;
    if (user?.role === "mechanic") return <MechanicDashboard key="mechanic" />;

    const resetToken = getResetToken();
    if (resetToken) return <ResetPassword token={resetToken} setPage={setPage} key="reset" />;

    switch (page) {
      case "about":
        return <About key="about" />;
      case "emergency":
        return <Emergency key="emergency" />;
      case "tips":
        return <Tips key="tips" />;
      case "chat":
        return <Chat key="chat" />;
      case "login":
        return <Login setPage={setPage} key="login" />;
      case "signup":
        return <Signup setPage={setPage} key="signup" />;
      default:
        return <Home key="home" />;
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
