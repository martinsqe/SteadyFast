import { useState } from "react";
import "./navbar.css";

function Navbar({ setPage }) {
  const [open, setOpen] = useState(false);

  const go = (page) => {
    setPage(page);
    setOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="nav-left">
        <h2 className="logo" onClick={() => go("home")}>SteadyFast</h2>
      </div>

      {/* DESKTOP LINKS */}
      <div className="nav-links">
        <button onClick={() => go("home")}>Home</button>
        <button onClick={() => go("about")}>About</button>
        <button onClick={() => go("emergency")}>Emergency</button>
        <button onClick={() => go("chat")}>Chat</button>
        <button className="login-btn" onClick={() => go("login")}>Login</button>
        <button className="signup-btn" onClick={() => go("signup")}>Sign Up</button>
      </div>

      {/* MOBILE ICON */}
      <div className="hamburger" onClick={() => setOpen(!open)}>
        ☰
      </div>

      {/* MOBILE MENU */}
      {open && (
        <div className="mobile-menu">
          <button onClick={() => go("home")}>Home</button>
          <button onClick={() => go("about")}>About</button>
          <button onClick={() => go("emergency")}>Emergency</button>
          <button onClick={() => go("chat")}>Chat</button>
          <button onClick={() => go("login")}>Login</button>
          <button onClick={() => go("signup")}>Sign Up</button>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
