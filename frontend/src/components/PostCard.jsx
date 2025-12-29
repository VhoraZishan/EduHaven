import { useNavigate } from "react-router-dom";

function PostCard({ post }) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/posts/${post.id}`);
  };

  return (
    <div style={styles.card} onClick={handleClick}>
      <h3>{post.title}</h3>

      <p style={styles.meta}>
        Author ID: {post.author} •{" "}
        {new Date(post.created_at).toLocaleString()}
      </p>

      <p>{post.body.slice(0, 120)}...</p>
    </div>
  );
}

const styles = {
  card: {
    background: "#fff",
    padding: "16px",
    marginBottom: "16px",
    borderRadius: "6px",
    cursor: "pointer",
    transition: "background 0.15s ease",
  },
  meta: {
    fontSize: "12px",
    color: "#666",
  },
};

export default PostCard;
