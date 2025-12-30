import { useNavigate } from "react-router-dom";

function ProfilePostCard({ post }) {
  const navigate = useNavigate();

  return (
    <div
      style={styles.card}
      onClick={() => navigate(`/posts/${post.id}`)}
    >
      <h3 style={styles.title}>{post.title}</h3>
      <p style={styles.meta}>
        {new Date(post.created_at).toLocaleString()}
      </p>
    </div>
  );
}

const styles = {
  card: {
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "10px",
    padding: "16px",
    cursor: "pointer",
    transition: "background 0.15s ease",
  },
  title: {
    margin: "0 0 6px 0",
    fontSize: "16px",
    fontWeight: "500",
  },
  meta: {
    fontSize: "12px",
    color: "#6b7280",
  },
};

export default ProfilePostCard;
