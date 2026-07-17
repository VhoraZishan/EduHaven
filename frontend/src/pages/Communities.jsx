import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { getCommunities, createCommunity, joinCommunity } from "../api/communities";
import { AuthContext } from "../context/AuthContext";
import { BACKEND_URL } from "../api/axios";

function Communities() {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [communities, setCommunities] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: "", description: "" });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchCommunities();
  }, []);

  const fetchCommunities = async (q = "") => {
    setLoading(true);
    try {
      const res = await getCommunities(q);
      setCommunities(res.data);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    const q = e.target.value;
    setSearch(q);
    fetchCommunities(q);
  };

  const handleJoin = async (e, slug) => {
    e.stopPropagation();
    if (!token) return navigate("/login");
    try {
      const res = await joinCommunity(slug);
      if (res.data.status === "deleted") {
        // creator left → deleted → remove from list
        setCommunities((prev) => prev.filter((c) => c.slug !== slug));
        return;
      }
      setCommunities((prev) =>
        prev.map((c) =>
          c.slug === slug
            ? {
                ...c,
                is_member: res.data.status === "joined",
                member_count: c.member_count + (res.data.status === "joined" ? 1 : -1),
              }
            : c
        )
      );
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to join/leave community");
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return setError("Name is required");
    setCreating(true);
    setError("");
    try {
      const res = await createCommunity(form);
      setCommunities((prev) => [res.data, ...prev]);
      setShowCreate(false);
      setForm({ name: "", description: "" });
      navigate(`/communities/${res.data.slug}`);
    } catch (err) {
      setError(err.response?.data?.name?.[0] || "Failed to create community");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Communities</h1>
          <p style={styles.subtitle}>Find your academic circle</p>
        </div>
        {token && (
          <button
            onClick={() => setShowCreate(true)}
            className="btn-primary"
            style={{ padding: "10px 22px" }}
          >
            New Community
          </button>
        )}
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div style={styles.modalOverlay} onClick={() => setShowCreate(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ margin: "0 0 16px", fontSize: "20px" }}>Create a Community</h2>
            {error && <div style={styles.errorBox}>{error}</div>}
            <form onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", gap: "0" }}>
              <input
                placeholder="Community name (e.g. Organic Chemistry)"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
              <textarea
                placeholder="What is this community about?"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
              />
              <div style={{ display: "flex", gap: "10px", marginTop: "4px" }}>
                <button type="submit" disabled={creating} className="btn-primary" style={{ flex: 1 }}>
                  {creating ? "Creating..." : "Create"}
                </button>
                <button type="button" onClick={() => setShowCreate(false)} className="btn-secondary" style={{ flex: 1 }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Search */}
      <div style={styles.searchWrapper}>
        <svg style={styles.searchIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
        </svg>
        <input
          style={styles.searchInput}
          placeholder="Search communities..."
          value={search}
          onChange={handleSearch}
        />
      </div>

      {/* Grid */}
      {loading ? (
        <p style={{ textAlign: "center", padding: "40px", color: "#6b7280" }}>Loading...</p>
      ) : communities.length === 0 ? (
        <p style={{ textAlign: "center", padding: "40px", color: "#6b7280" }}>
          {search ? `No communities matching "${search}"` : "No communities yet. Create the first one!"}
        </p>
      ) : (
        <div style={styles.grid}>
          {communities.map((c) => (
            <div
              key={c.id}
              style={styles.card}
              onClick={() => navigate(`/communities/${c.slug}`)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && navigate(`/communities/${c.slug}`)}
            >
              {/* Banner */}
              <div style={styles.cardBanner}>
                {c.banner
                  ? <img src={`${BACKEND_URL}${c.banner}`} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  : <div style={styles.cardBannerPlaceholder} />
                }
              </div>

              {/* Icon */}
              <div style={styles.iconCircle}>
                {c.icon
                  ? <img src={`${BACKEND_URL}${c.icon}`} alt={c.name} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }} />
                  : <span style={styles.iconLetter}>{c.name[0].toUpperCase()}</span>
                }
              </div>

              <div style={styles.cardBody}>
                <h3 style={styles.cardTitle}>{c.name}</h3>
                <p style={styles.cardDesc}>{c.description || "No description yet."}</p>
                <div style={styles.cardMeta}>
                  <span>{c.member_count} member{c.member_count !== 1 ? "s" : ""}</span>
                  <span>·</span>
                  <span>{c.post_count} post{c.post_count !== 1 ? "s" : ""}</span>
                </div>

                {/* Separate clickable zone to prevent card nav being swallowed */}
                <div onClick={(e) => e.stopPropagation()}>
                  {c.is_creator ? (
                    <button
                      disabled
                      style={{ width: "100%", borderRadius: "8px", padding: "8px", fontSize: "13px", background: "#e5e7eb", color: "#9ca3af", border: "2px solid #9ca3af", boxShadow: "none", cursor: "not-allowed" }}
                    >
                      Creator
                    </button>
                  ) : (
                    <button
                      onClick={(e) => handleJoin(e, c.slug)}
                      className={c.is_member ? "btn-secondary" : "btn-primary"}
                      style={{ width: "100%", borderRadius: "8px", padding: "8px", fontSize: "13px" }}
                    >
                      {c.is_member ? "Leave" : "Join"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  page: { maxWidth: "1100px", margin: "30px auto", padding: "0 24px" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" },
  title: { margin: 0, fontSize: "28px", fontWeight: "900", textTransform: "uppercase", letterSpacing: "-0.5px" },
  subtitle: { margin: "4px 0 0", color: "#6b7280", fontSize: "14px" },

  modalOverlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 },
  modal: { background: "white", border: "var(--brutal-border)", boxShadow: "var(--brutal-shadow)", borderRadius: "12px", padding: "28px", width: "100%", maxWidth: "480px" },
  errorBox: { background: "var(--cat-news)", color: "#9f1239", padding: "10px 12px", borderRadius: "6px", marginBottom: "12px", fontSize: "14px", fontWeight: "600", border: "var(--brutal-border)" },

  searchWrapper: { position: "relative", marginBottom: "28px" },
  searchIcon: { position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", width: "18px", height: "18px", color: "#9ca3af", pointerEvents: "none" },
  searchInput: { paddingLeft: "44px", paddingRight: "16px", paddingTop: "12px", paddingBottom: "12px", fontSize: "15px", borderRadius: "9999px", marginBottom: 0 },

  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "20px" },
  card: { background: "white", border: "var(--brutal-border)", borderRadius: "12px", boxShadow: "var(--brutal-shadow)", cursor: "pointer", overflow: "hidden", transition: "transform 0.15s, box-shadow 0.15s" },
  cardBanner: { height: "80px", overflow: "hidden" },
  cardBannerPlaceholder: { width: "100%", height: "100%", background: "linear-gradient(135deg, var(--cat-discussion), var(--cat-question))" },
  iconCircle: { width: "52px", height: "52px", borderRadius: "50%", border: "3px solid white", background: "var(--accent-primary)", display: "flex", alignItems: "center", justifyContent: "center", margin: "-26px 16px 0", position: "relative", zIndex: 1, overflow: "hidden" },
  iconLetter: { color: "white", fontWeight: "900", fontSize: "22px" },
  cardBody: { padding: "8px 16px 16px" },
  cardTitle: { margin: "4px 0 6px", fontWeight: "800", fontSize: "16px" },
  cardDesc: { fontSize: "13px", color: "#6b7280", margin: "0 0 8px", lineHeight: "1.5", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" },
  cardMeta: { fontSize: "12px", color: "#9ca3af", display: "flex", gap: "6px", marginBottom: "12px" },
};

export default Communities;
