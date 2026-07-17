import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { getPosts } from "../api/posts";
import PostCard from "../components/PostCard";
import { AuthContext } from "../context/AuthContext";

const ORDERINGS = [
  { value: "new", label: "New" },
  { value: "hot", label: "Hot" },
  { value: "top", label: "Top" },
];

function Feed() {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ordering, setOrdering] = useState("new");

  useEffect(() => {
    setLoading(true);
    getPosts({ ordering })
      .then((res) => { setPosts(res.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [ordering]);

  return (
    <div style={styles.page}>
      {/* Header row */}
      <div style={styles.header}>
        <h1 style={styles.title}>Feed</h1>
        <div style={styles.headerRight}>
          {/* Sort tabs */}
          <div style={styles.tabs}>
            {ORDERINGS.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setOrdering(value)}
                style={ordering === value ? styles.tabActive : styles.tab}
              >
                {label}
              </button>
            ))}
          </div>
          {token && (
            <button onClick={() => navigate("/create")} style={styles.createBtn}>
              Create Post
            </button>
          )}
        </div>
      </div>

      {loading && <p style={styles.loading}>Loading...</p>}

      {!loading && posts.length === 0 && (
        <p style={styles.empty}>No posts yet. Be the first to post!</p>
      )}

      <div style={styles.feed}>
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
}

const styles = {
  page: { maxWidth: "900px", margin: "40px auto", padding: "0 20px" },

  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px", flexWrap: "wrap", gap: "12px" },
  title: { margin: 0, fontSize: "28px", fontWeight: "900", letterSpacing: "-0.5px", textTransform: "uppercase" },
  headerRight: { display: "flex", alignItems: "center", gap: "12px" },

  tabs: { display: "flex", gap: "8px" },
  tab: {
    padding: "7px 16px", background: "white", color: "#374151",
    border: "var(--brutal-border)", borderRadius: "9999px", cursor: "pointer",
    fontWeight: "700", fontSize: "13px", boxShadow: "2px 2px 0 #000",
  },
  tabActive: {
    padding: "7px 16px", background: "var(--accent-primary)", color: "white",
    border: "var(--brutal-border)", borderRadius: "9999px", cursor: "pointer",
    fontWeight: "700", fontSize: "13px", boxShadow: "2px 2px 0 #000",
  },
  createBtn: {
    padding: "8px 18px", background: "var(--accent-primary)", color: "white",
    border: "var(--brutal-border)", borderRadius: "9999px", cursor: "pointer",
    fontWeight: "700", fontSize: "13px", boxShadow: "2px 2px 0 #000",
  },

  feed: { display: "flex", flexDirection: "column", gap: "20px" },
  loading: { textAlign: "center", padding: "60px", fontWeight: "700", fontSize: "16px" },
  empty: { textAlign: "center", padding: "60px", color: "#6b7280", fontWeight: "600" },
};

export default Feed;
