import { Link, useNavigate } from "react-router-dom";
import { useContext, useState, useRef, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { BACKEND_URL } from "../api/axios";

function Navbar() {
  const { token, logout, me, profile } = useContext(AuthContext);
  const [open, setOpen] = useState(false);
  const [searchVal, setSearchVal] = useState("");
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const q = searchVal.trim();
    navigate(q ? `/search?q=${encodeURIComponent(q)}` : "/search");
  };

  return (
    <nav style={styles.nav}>
      {/* LEFT */}
      <div style={styles.left}>
        <Link to="/" style={styles.brand}>EduHaven</Link>
        <Link to="/communities" style={styles.navLink}>Communities</Link>
        <Link to="/search" style={styles.navLink}>Search</Link>
      </div>

      {/* CENTER: Search bar */}
      <form onSubmit={handleSearch} style={styles.searchForm}>
        <div style={styles.searchWrapper}>
          <svg style={styles.searchIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          <input
            style={styles.searchInput}
            placeholder="Search posts..."
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
          />
        </div>
      </form>

      {/* RIGHT */}
      <div style={styles.right}>
        {!token && (
          <>
            <Link to="/login" style={styles.pillLink}>Login</Link>
            <Link to="/register" style={styles.pillLinkPrimary}>Sign Up</Link>
          </>
        )}

        {token && me && (
          <div style={styles.userBox} ref={dropdownRef}>
            <div style={styles.userTrigger} onClick={() => setOpen((v) => !v)}>
              {profile?.avatar && (
                <img src={`${BACKEND_URL}${profile.avatar}`} alt="avatar" style={styles.avatar} />
              )}
              <span>{me.username}</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>

            {open && (
              <div style={styles.dropdown}>
                <div style={styles.dropdownItem} onClick={() => { navigate("/create"); setOpen(false); }}>
                  Create Post
                </div>
                <div style={styles.dropdownItem} onClick={() => { navigate("/communities"); setOpen(false); }}>
                  Communities
                </div>
                <div style={styles.dropdownItem} onClick={() => { navigate("/search"); setOpen(false); }}>
                  Search
                </div>
                <div style={styles.dropdownItem} onClick={() => { navigate("/profile"); setOpen(false); }}>
                  Profile
                </div>
                <div
                  style={{ ...styles.dropdownItem, color: "#dc2626", borderTop: "2px solid #000", borderBottom: "none" }}
                  onClick={() => { setOpen(false); logout(); }}
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
    position: "sticky", top: 0, zIndex: 100, height: "64px", padding: "0 24px",
    background: "#fff", borderBottom: "var(--brutal-border)",
    display: "flex", alignItems: "center", gap: "16px",
  },
  left: { display: "flex", alignItems: "center", gap: "20px", flexShrink: 0 },
  brand: { fontSize: "22px", fontWeight: "900", color: "#000", textDecoration: "none", letterSpacing: "-0.5px" },
  navLink: {
    color: "#374151", fontWeight: "700", fontSize: "14px", textDecoration: "none",
    padding: "5px 12px", border: "var(--brutal-border)", borderRadius: "9999px",
    background: "white", boxShadow: "2px 2px 0 #000", transition: "transform 0.1s ease",
  },

  searchForm: { flex: 1, maxWidth: "480px" },
  searchWrapper: { position: "relative" },
  searchIcon: { position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", width: "16px", height: "16px", color: "#9ca3af" },
  searchInput: {
    width: "100%", paddingLeft: "40px", paddingRight: "16px",
    paddingTop: "8px", paddingBottom: "8px",
    fontSize: "14px", border: "var(--brutal-border)", borderRadius: "9999px",
    boxShadow: "2px 2px 0 rgba(0,0,0,0.15)", background: "white",
    boxSizing: "border-box", marginBottom: 0, fontFamily: "inherit",
  },

  right: { display: "flex", alignItems: "center", gap: "10px", marginLeft: "auto", flexShrink: 0 },
  pillLink: {
    color: "#000", fontWeight: "700", textDecoration: "none",
    border: "var(--brutal-border)", padding: "6px 16px", borderRadius: "9999px",
    background: "white", boxShadow: "2px 2px 0 #000", fontSize: "14px",
  },
  pillLinkPrimary: {
    color: "#fff", fontWeight: "700", textDecoration: "none",
    border: "var(--brutal-border)", padding: "6px 16px", borderRadius: "9999px",
    background: "var(--accent-primary)", boxShadow: "2px 2px 0 #000", fontSize: "14px",
  },

  userBox: { position: "relative" },
  userTrigger: {
    display: "flex", alignItems: "center", gap: "8px", cursor: "pointer",
    fontWeight: "700", padding: "6px 12px", border: "var(--brutal-border)",
    borderRadius: "20px", background: "var(--cat-resource)", boxShadow: "2px 2px 0 #000", fontSize: "14px",
  },
  avatar: { width: "28px", height: "28px", borderRadius: "50%", objectFit: "cover", border: "var(--brutal-border)" },

  dropdown: {
    position: "absolute", right: 0, top: "calc(100% + 8px)",
    background: "#fff", border: "var(--brutal-border)", minWidth: "180px",
    boxShadow: "var(--brutal-shadow)", overflow: "hidden", zIndex: 200,
  },
  dropdownItem: {
    padding: "11px 16px", cursor: "pointer", fontSize: "14px", fontWeight: "600",
    borderBottom: "1px solid #000", transition: "background 0.1s",
  },
};

export default Navbar;
