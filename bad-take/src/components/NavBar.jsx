import { Link, useNavigate } from "react-router-dom";
import { useUser } from "../UserContext";
import { supabase } from "../client.js";
import { useState, useEffect } from "react";
import logo from "../assets/smellies logo.png";

const NavBar = () => {
  const user = useUser();
  const navigate = useNavigate();

  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  function toggleTheme() {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate("/login");
  }

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/" className="navbar-brand-link">
          <img src={logo} alt="Smellies Logo" className="navbar-logo" />
          <span className="navbar-brand-text">
            SMELLIES
          </span>
        </Link>
      </div>

      <div className="nav-links">
        <Link to="/" className="nav-link home-link">
          Home
        </Link>

        {user && (
          <Link to="/create" className="nav-link create-link">
            Create Post
          </Link>
        )}

        {!user && (
          <Link to="/login" className="nav-link login-link">
            Login/Signup
          </Link>
        )}
      </div>

      <div className="navbar-controls">
        <button
          onClick={toggleTheme}
          aria-label="Toggle light/dark theme"
          className="nav-button theme-toggle-button"
        >
          {theme === "light" ? "🌙 Dark" : "☀️ Light"}
        </button>

        {user && (
          <div className="user-section">
            <span className="user-greeting">
              Hi, {user.email}
            </span>
            <button
              onClick={handleLogout}
              className="nav-button logout-button"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default NavBar;
