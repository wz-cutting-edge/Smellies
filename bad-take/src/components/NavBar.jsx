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
      className="navbar"
      style={{
        padding: '1rem 0',
        background: 'var(--card)',
        borderBottom: '1px solid var(--border)',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        backdropFilter: 'blur(10px)'
      }}
    >
      <div 
        className="container"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '2rem'
        }}
      >
        {/* Brand */}
        <Link 
          to="/" 
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            textDecoration: 'none',
            color: 'var(--text)',
            fontWeight: 700,
            fontSize: '1.25rem'
          }}
        >
          <img 
            src={logo} 
            alt="Smellies Logo" 
            style={{
              height: '32px',
              width: '32px',
              objectFit: 'contain',
              borderRadius: '6px'
            }}
          />
          <span style={{ color: 'var(--primary)' }}>SMELLIES</span>
        </Link>

        {/* Navigation Links */}
        <div 
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '2rem',
            flex: 1,
            justifyContent: 'center'
          }}
        >
          <Link 
            to="/" 
            style={{
              color: 'var(--primary)',
              fontWeight: 500,
              textDecoration: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              transition: 'background-color 0.2s ease'
            }}
            onMouseEnter={e => e.target.style.backgroundColor = 'var(--background)'}
            onMouseLeave={e => e.target.style.backgroundColor = 'transparent'}
          >
            Home
          </Link>
          {user && (
            <Link 
              to="/create" 
              style={{
                color: 'var(--primary)',
                fontWeight: 500,
                textDecoration: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                transition: 'background-color 0.2s ease'
              }}
              onMouseEnter={e => e.target.style.backgroundColor = 'var(--background)'}
              onMouseLeave={e => e.target.style.backgroundColor = 'transparent'}
            >
              Create Post
            </Link>
          )}
          {!user && (
            <Link 
              to="/login" 
              style={{
                color: 'var(--primary)',
                fontWeight: 500,
                textDecoration: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                transition: 'background-color 0.2s ease'
              }}
              onMouseEnter={e => e.target.style.backgroundColor = 'var(--background)'}
              onMouseLeave={e => e.target.style.backgroundColor = 'transparent'}
            >
              Login
            </Link>
          )}
        </div>

        {/* Controls */}
        <div 
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}
        >
          <button
            onClick={toggleTheme}
            style={{
              padding: '0.5rem 1rem',
              background: 'var(--background)',
              color: 'var(--text)',
              border: '1px solid var(--border)',
              borderRadius: '6px',
              fontSize: '0.875rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={e => {
              e.target.style.background = 'var(--primary)';
              e.target.style.color = 'white';
            }}
            onMouseLeave={e => {
              e.target.style.background = 'var(--background)';
              e.target.style.color = 'var(--text)';
            }}
          >
            {theme === "light" ? "🌙" : "☀️"}
          </button>

          {user && (
            <>
              <span 
                style={{
                  color: 'var(--mutedText)',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  maxWidth: '120px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
              >
                {user.email}
              </span>
              <button
                onClick={handleLogout}
                style={{
                  padding: '0.5rem 1rem',
                  background: 'var(--primary)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={e => {
                  e.target.style.background = 'var(--secondary)';
                  e.target.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={e => {
                  e.target.style.background = 'var(--primary)';
                  e.target.style.transform = 'translateY(0)';
                }}
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
