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
    <nav
      style={{
        display: "flex",
        alignItems: "center",
        backgroundColor: "var(--background)",
        padding: "0.75em 1.5em",
        borderBottom: "1px solid var(--border)",
        position: "sticky",
        top: 0,
        zIndex: 1000,
      }}
    >
      <Link to="/" style={{ display: "flex", alignItems: "center", marginRight: 20, textDecoration: "none" }}>
        <img src={logo} alt="Smellies Logo" className="navbar-logo" style={{ height: 40, userSelect: "none" }} />
        <span style={{ color: "var(--primary)", fontWeight: 700, fontSize: "1.2em", marginLeft: 8, userSelect: "none" }}>
          SMELLIES
        </span>
      </Link>

      <Link to="/" style={{ marginRight: 15, color: "var(--primary)", textDecoration: "none", fontWeight: 600 }}>
        Home
      </Link>

      {user && (
        <Link to="/create" style={{ marginRight: 15, color: "var(--primary)", textDecoration: "none", fontWeight: 600 }}>
          Create Post
        </Link>
      )}

      {!user && (
        <Link to="/login" style={{ marginRight: 15, color: "var(--primary)", textDecoration: "none", fontWeight: 600 }}>
          Login/Signup
        </Link>
      )}

      <button
        onClick={toggleTheme}
        aria-label="Toggle light/dark theme"
        style={{
          marginLeft: "auto",
          padding: "0.4em 0.8em",
          backgroundColor: "var(--secondary)",
          border: "none",
          borderRadius: 6,
          cursor: "pointer",
          fontWeight: 600,
          color: "var(--text)",
          userSelect: "none",
        }}
      >
        {theme === "light" ? "🌙 Dark" : "☀️ Light"}
      </button>

      {user && (
        <>
          <span style={{ marginLeft: 15, color: "var(--text)", fontWeight: 500, userSelect: "none" }}>
            Hi, {user.email}
          </span>
          <button
            onClick={handleLogout}
            style={{
              marginLeft: 10,
              padding: "0.4em 0.8em",
              backgroundColor: "var(--primary)",
              color: "var(--text)",
              border: "none",
              borderRadius: 6,
              cursor: "pointer",
              fontWeight: 600,
              userSelect: "none",
            }}
          >
            Logout
          </button>
        </>
      )}
    </nav>
  );
};

export default NavBar;
