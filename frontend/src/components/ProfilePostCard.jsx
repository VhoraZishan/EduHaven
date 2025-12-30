import { useNavigate } from "react-router-dom";

function ProfilePostCard({ post }) {
  const navigate = useNavigate();

  return (
    <div
      style={styles.card}
      onClick={() => navigate(`/posts/${post.id}`)}
    >
      <h4>{post.title}</h4>
      <p style={styles.meta}>
        {new Date(post.created_at).toLocaleString()}
      </p>
    </div>
  );
}

const styles = {
  card: {
    padding: "12px",
    border: "1px solid #ddd",
    borderRadius: "6px",
    marginBottom: "10px",
    cursor: "pointer",
    background: "#fff",
  },
  meta: {
    fontSize: "12px",
    color: "#666",
  },
};

export default ProfilePostCard;
