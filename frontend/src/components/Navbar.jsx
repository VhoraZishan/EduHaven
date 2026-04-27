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
    height: "70px",
    padding: "0 32px",
    background: "#fff",
    borderBottom: "var(--brutal-border)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  brand: {
    fontSize: "24px",
    fontWeight: "800",
    color: "#000",
    textDecoration: "none",
    letterSpacing: "-0.5px",
  },
  right: {
    display: "flex",
    alignItems: "center",
    gap: "24px",
  },
  link: {
    color: "#000",
    fontWeight: "700",
    textDecoration: "none",
    border: "var(--brutal-border)",
    padding: "6px 16px",
    borderRadius: "9999px",
    background: "var(--cat-discussion)",
    boxShadow: "2px 2px 0px #000",
    transition: "transform 0.1s ease",
  },
  userBox: {
    position: "relative",
  },
  userTrigger: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    cursor: "pointer",
    fontWeight: "700",
    padding: "4px 12px",
    border: "var(--brutal-border)",
    borderRadius: "20px",
    background: "var(--cat-resource)",
    boxShadow: "2px 2px 0px #000",
  },
  avatar: {
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    objectFit: "cover",
    border: "var(--brutal-border)",
  },
  dropdown: {
    position: "absolute",
    right: 0,
    top: "calc(100% + 10px)",
    background: "#fff",
    border: "var(--brutal-border)",
    borderRadius: "0",
    minWidth: "160px",
    boxShadow: "var(--brutal-shadow)",
    overflow: "hidden",
  },
  dropdownItem: {
    padding: "12px 16px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
    borderBottom: "1px solid #000",
  },
};

export default Navbar;
