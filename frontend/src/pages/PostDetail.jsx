import { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios";
import { getComments, addComment } from "../api/comments";
import { AuthContext } from "../context/AuthContext";

function PostDetail() {
  const { id } = useParams();
  const { token, userMap, ensureUser } = useContext(AuthContext);

  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Load post + comments
  useEffect(() => {
    Promise.all([
      api.get(`posts/${id}/`),
      getComments(id),
    ])
      .then(([postRes, commentsRes]) => {
        setPost(postRes.data);
        setComments(commentsRes.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  // Ensure usernames
  useEffect(() => {
    if (post) ensureUser(post.author);
    comments.forEach((c) => ensureUser(c.author));
  }, [post, comments]);

  const handleAddComment = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await addComment(id, { body: commentText });
      setComments((prev) => [...prev, res.data]);
      setCommentText("");
    } catch {
      setError("Failed to add comment");
    }
  };

  if (loading) return <p style={styles.loading}>Loading post...</p>;
  if (!post) return <p>Post not found</p>;

  return (
    <div style={styles.page}>
      {/* POST CARD */}
      <div style={styles.postCard}>
        <h1 style={styles.title}>{post.title}</h1>

        <div style={styles.meta}>
          <span>{userMap[post.author] || "Loading..."}</span>
          <span>•</span>
          <span>{new Date(post.created_at).toLocaleString()}</span>
        </div>

        <div style={styles.body}>{post.body}</div>
      </div>

      {/* COMMENTS */}
      <div style={styles.commentsSection}>
        <h3 style={styles.sectionTitle}>Comments</h3>

        {comments.length === 0 && (
          <p style={styles.empty}>No comments yet.</p>
        )}

        {comments.map((c) => (
          <div key={c.id} style={styles.commentCard}>
            <p style={styles.commentBody}>{c.body}</p>
            <div style={styles.commentMeta}>
              {userMap[c.author] || "Loading..."} •{" "}
              {new Date(c.created_at).toLocaleString()}
            </div>
          </div>
        ))}

        {/* ADD COMMENT */}
        {token ? (
          <form onSubmit={handleAddComment} style={styles.commentForm}>
            {error && <p style={styles.error}>{error}</p>}

            <textarea
              placeholder="Write a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              rows={3}
              required
            />

            <button type="submit">Add Comment</button>
          </form>
        ) : (
          <p style={styles.loginHint}>
            Login to add a comment.
          </p>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: {
    maxWidth: "900px",
    margin: "30px auto",
    padding: "0 20px",
  },
  loading: {
    padding: "40px",
    textAlign: "center",
  },

  /* Post */
  postCard: {
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "10px",
    padding: "24px",
    marginBottom: "30px",
  },
  title: {
    fontSize: "24px",
    fontWeight: "600",
    marginBottom: "6px",
  },
  meta: {
    fontSize: "12px",
    color: "#6b7280",
    display: "flex",
    gap: "6px",
    marginBottom: "20px",
  },
  body: {
    fontSize: "15px",
    lineHeight: "1.6",
    whiteSpace: "pre-wrap",
  },

  /* Comments */
  commentsSection: {
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "10px",
    padding: "20px",
  },
  sectionTitle: {
    fontSize: "18px",
    fontWeight: "600",
    marginBottom: "16px",
  },
  empty: {
    fontSize: "14px",
    color: "#6b7280",
  },
  commentCard: {
    background: "#f9fafb",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    padding: "12px",
    marginBottom: "12px",
  },
  commentBody: {
    fontSize: "14px",
    marginBottom: "6px",
  },
  commentMeta: {
    fontSize: "11px",
    color: "#6b7280",
  },

  /* Comment form */
  commentForm: {
    marginTop: "20px",
  },
  error: {
    color: "#dc2626",
    marginBottom: "8px",
  },
  loginHint: {
    marginTop: "20px",
    fontSize: "14px",
    color: "#6b7280",
  },
};

export default PostDetail;
