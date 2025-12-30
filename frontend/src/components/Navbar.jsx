import { Link, useNavigate } from "react-router-dom";
import { useContext, useState, useRef, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { BACKEND_URL } from "../api/axios";

function Navbar() {
  const { token, logout, me, profile } = useContext(AuthContext);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav style={styles.nav}>
      {/* LEFT: BRAND */}
      <Link to="/" style={styles.brand}>
        EduHaven
      </Link>

      {/* RIGHT */}
      <div style={styles.right}>
        {!token && (
          <>
            <Link to="/login" style={styles.link}>
              Login
            </Link>
            <Link to="/register" style={styles.link}>
              Sign Up
            </Link>
          </>
        )}

        {token && me && (
          <div style={styles.userBox} ref={dropdownRef}>
            <div
              style={styles.userTrigger}
              onClick={() => setOpen((v) => !v)}
            >
              {profile?.avatar && (
                <img
                  src={`${BACKEND_URL}${profile.avatar}`}
                  alt="avatar"
                  style={styles.avatar}
                />
              )}
              <span>{me.username}</span>
            </div>

            {open && (
  <div style={styles.dropdown}>
    <div
      style={styles.dropdownItem}
      onClick={() => {
        navigate("/create");
        setOpen(false);
      }}
    >
      Create post
    </div>

    <div
      style={styles.dropdownItem}
      onClick={() => {
        navigate("/profile");
        setOpen(false);
      }}
    >
      Profile
    </div>

    <div
      style={{
        ...styles.dropdownItem,
        color: "#dc2626",
        borderTop: "1px solid #e5e7eb",
      }}
      onClick={() => {
        setOpen(false);
        logout();
      }}
    >
      Logout
    </div>
  </div>
)}

          </div>
        )}
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    position: "sticky",
    top: 0,
    zIndex: 100,
    height: "64px",
    padding: "0 32px",
    background: "#ffffff",
    borderBottom: "1px solid #e5e7eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  brand: {
    fontSize: "20px",
    fontWeight: "700",
    color: "#4f46e5",
    textDecoration: "none",
  },
  right: {
    display: "flex",
    alignItems: "center",
    gap: "24px",
  },
  link: {
    color: "#111827",
    fontWeight: "500",
    textDecoration: "none",
  },
  userBox: {
    position: "relative",
  },
  userTrigger: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    cursor: "pointer",
    fontWeight: "500",
  },
  avatar: {
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    objectFit: "cover",
    border: "1px solid #e5e7eb",
  },
  dropdown: {
    position: "absolute",
    right: 0,
    top: "110%",
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    minWidth: "140px",
    boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
    overflow: "hidden",
  },
  dropdownItem: {
    padding: "10px 14px",
    cursor: "pointer",
    fontSize: "14px",
  },
};

export default Navbar;
