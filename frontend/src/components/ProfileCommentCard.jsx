import { useNavigate } from "react-router-dom";

function ProfileCommentCard({ comment }) {
  const navigate = useNavigate();

  return (
    <div
      style={styles.card}
      onClick={() => navigate(`/posts/${comment.post}`)}
    >
      <p style={styles.body}>{comment.body}</p>
      <span style={styles.meta}>
        On post #{comment.post} •{" "}
        {new Date(comment.created_at).toLocaleString()}
      </span>
    </div>
  );
}

const styles = {
  card: {
    background: "#f9fafb",
    border: "1px solid #e5e7eb",
    borderRadius: "10px",
    padding: "14px",
    cursor: "pointer",
  },
  body: {
    marginBottom: "6px",
    fontSize: "14px",
  },
  meta: {
    fontSize: "11px",
    color: "#6b7280",
  },
};

export default ProfileCommentCard;
