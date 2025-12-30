import { useNavigate } from "react-router-dom";
import { useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";

function PostCard({ post }) {
  const navigate = useNavigate();
  const { userMap, ensureUser } = useContext(AuthContext);

  useEffect(() => {
    ensureUser(post.author);
  }, [post.author]);

  return (
    <div
      style={styles.card}
      onClick={() => navigate(`/posts/${post.id}`)}
    >
      <h3 style={styles.title}>{post.title}</h3>

      <div style={styles.meta}>
        <span>{userMap[post.author] || "Loading..."}</span>
        <span>•</span>
        <span>{new Date(post.created_at).toLocaleString()}</span>
      </div>

      <p style={styles.body}>
        {post.body.length > 160
          ? post.body.slice(0, 160) + "..."
          : post.body}
      </p>
    </div>
  );
}

const styles = {
  card: {
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "10px",
    padding: "18px",
    cursor: "pointer",
    transition: "all 0.15s ease",
  },
  title: {
    fontSize: "18px",
    fontWeight: "600",
    marginBottom: "6px",
  },
  meta: {
    fontSize: "12px",
    color: "#6b7280",
    display: "flex",
    gap: "6px",
    marginBottom: "12px",
  },
  body: {
    fontSize: "14px",
    lineHeight: "1.6",
    color: "#111827",
  },
};

export default PostCard;
