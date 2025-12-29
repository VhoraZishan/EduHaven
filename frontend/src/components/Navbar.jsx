import { Link } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

function Navbar() {
  const { token, logout } = useContext(AuthContext);

  return (
    <nav style={styles.nav}>
      <Link to="/" style={styles.logo}>EduHaven</Link>

      <div>
        {!token ? (
          <>
            <Link to="/login" style={styles.link}>Login</Link>
            <Link to="/register" style={styles.link}>Register</Link>
          </>
        ) : (
          <>
  <Link to="/create" style={styles.link}>Create</Link>
  <Link to="/profile" style={styles.link}>Profile</Link>
  <button onClick={logout} style={styles.button}>Logout</button>
</>

        )}
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    padding: "12px 20px",
    background: "#222",
    color: "#fff",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  },
  logo: {
    color: "#fff",
    textDecoration: "none",
    fontWeight: "bold"
  },
  link: {
    color: "#fff",
    marginRight: "15px",
    textDecoration: "none"
  },
  button: {
    background: "#ff4d4d",
    border: "none",
    color: "#fff",
    padding: "6px 12px",
    cursor: "pointer"
  }
};

export default Navbar;
