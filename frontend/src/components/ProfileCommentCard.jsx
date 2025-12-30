import { useNavigate } from "react-router-dom";

function ProfileCommentCard({ comment }) {
  const navigate = useNavigate();

  return (
    <div
      style={styles.card}
      onClick={() => navigate(`/posts/${comment.post}`)}
    >
      <p>{comment.body}</p>
      <span style={styles.meta}>
        On post #{comment.post} •{" "}
        {new Date(comment.created_at).toLocaleString()}
      </span>
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
    background: "#fafafa",
  },
  meta: {
    fontSize: "11px",
    color: "#777",
  },
};

export default ProfileCommentCard;
