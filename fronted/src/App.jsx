import { useState } from "react";

import Navbar from "./components/navbar";
import Footer from "./components/footer";

// Pages
import Home from "./pages/home";
import About from "./pages/about";
import Emergency from "./pages/emergency";
import Chat from "./pages/chat";
import Login from "./pages/login";
import Signup from "./pages/signup";

function App() {
  const [page, setPage] = useState("home");

  const renderPage = () => {
    switch (page) {
      case "about":
        return <About />;
      case "emergency":
        return <Emergency />;
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
      {/* SOFT OVERLAY (not blocking Home background) */}
<div
  style={{
    position: "fixed",
    inset: 0,
    background: "linear-gradient(to bottom, rgba(0,0,0,0.35), rgba(0,0,0,0.55))",
    zIndex: 0,
  }}
/>

      {/* CONTENT */}
      <div style={{ position: "relative", zIndex: 2 }}>
        <Navbar setPage={setPage} />

        <div
          className="page-fade"
          style={{
            minHeight: "100vh",
            paddingTop: "70px",
          }}
        >
          {renderPage()}
        </div>

        <Footer />
      </div>
    </div>
  );
}

export default App;
