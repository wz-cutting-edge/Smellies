import { Link, useNavigate } from "react-router-dom";
import { useUser } from "../UserContext";
import { supabase } from "../client.js";

const NavBar = () => {
  const user = useUser();
  const navigate = useNavigate();

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate("/login");
  }

  return (
    <nav style={{ position: "sticky", top: 0, background: "#333", padding: "1em", color: "#fff", zIndex: 1000 }}>
      <Link to="/" style={{ marginRight: 20 }}>SMELLIES</Link>
      <Link to="/" style={{ marginRight: 10 }}>Home</Link>
      {user && <Link to="/create" style={{ marginRight: 10 }}>Create Post</Link>}
      {!user && <Link to="/login" style={{ marginRight: 10 }}>Login/Signup</Link>}
      {user && (
        <>
          <span style={{ marginRight: 10 }}>Hi, {user.email}</span>
          <button onClick={handleLogout} style={{ marginLeft: 10 }}>Logout</button>
        </>
      )}
    </nav>
  );
};
export default NavBar;
