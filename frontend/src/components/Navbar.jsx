import { useState, useEffect, useContext } from "react";
import "./navbar.css";
import { AuthContext } from "../context/AuthContext";

function Navbar({ setPage }) {
  const [open, setOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const { user, logout } = useContext(AuthContext);

  // Watch screen size
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) setOpen(false); // auto close menu on desktop
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const go = (page) => {
    setPage(page);
    setOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="nav-left">
        <h2 className="logo" onClick={() => go("home")}>SteadyFast</h2>
      </div>

      {/* Desktop Menu */}
      {!isMobile && (
        <div className="nav-links">
          <button onClick={() => go("home")}>Home</button>
          <button onClick={() => go("about")}>About</button>
          <button onClick={() => go("emergency")}>Emergency</button>
          <button onClick={() => go("tips")}>Tips</button>
          <button onClick={() => go("chat")}>Chat</button>

          {user ? (
            <button className="login-btn" onClick={logout}>Logout</button>
          ) : (
            <button className="login-btn" onClick={() => go("login")}>Login</button>
          )}
        </div>
      )}

      {/* Mobile Hamburger */}
      {isMobile && (
        <div className="hamburger" onClick={() => setOpen(!open)}>☰</div>
      )}

      {/* Mobile Menu */}
      {isMobile && open && (
        <div className="mobile-menu">
          <button onClick={() => go("home")}>Home</button>
          <button onClick={() => go("about")}>About</button>
          <button onClick={() => go("emergency")}>Emergency</button>
          <button onClick={() => go("tips")}>Tips</button>
          <button onClick={() => go("chat")}>Chat</button>

          {user ? (
            <button onClick={logout}>Logout</button>
          ) : (
            <button onClick={() => go("login")}>Login</button>
          )}
        </div>
      )}
    </nav>
  );
}

export default Navbar;