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

  // 🔹 Load post + comments
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
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  // 🔹 Ensure post author username
  useEffect(() => {
    if (post) {
      ensureUser(post.author);
    }
  }, [post]);

  // 🔹 Ensure comment authors usernames
  useEffect(() => {
    comments.forEach((c) => {
      ensureUser(c.author);
    });
  }, [comments]);

  const handleAddComment = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await addComment(id, { body: commentText });
      setComments((prev) => [...prev, res.data]);
      setCommentText("");
    } catch (err) {
      setError("Failed to add comment");
    }
  };

  if (loading) return <p style={{ padding: "20px" }}>Loading...</p>;
  if (!post) return <p>Post not found</p>;

  return (
    <div style={styles.container}>
      <h2>{post.title}</h2>

      <p style={styles.meta}>
        {userMap[post.author] || "Loading..."} •{" "}
        {new Date(post.created_at).toLocaleString()}
      </p>

      <p style={styles.body}>{post.body}</p>

      <hr />

      <h3>Comments</h3>

      {comments.length === 0 && <p>No comments yet.</p>}

      {comments.map((c) => (
        <div key={c.id} style={styles.comment}>
          <p>{c.body}</p>
          <span style={styles.commentMeta}>
            {userMap[c.author] || "Loading..."} •{" "}
            {new Date(c.created_at).toLocaleString()}
          </span>
        </div>
      ))}

      {token ? (
        <form onSubmit={handleAddComment} style={{ marginTop: "20px" }}>
          {error && <p style={{ color: "red" }}>{error}</p>}

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
        <p style={{ marginTop: "20px", color: "#666" }}>
          Login to add a comment.
        </p>
      )}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "800px",
    margin: "20px auto",
    background: "#fff",
    padding: "20px",
    borderRadius: "6px",
  },
  meta: {
    fontSize: "12px",
    color: "#666",
  },
  body: {
    marginTop: "15px",
    whiteSpace: "pre-wrap",
  },
  comment: {
    padding: "10px",
    background: "#f5f5f5",
    borderRadius: "4px",
    marginBottom: "10px",
  },
  commentMeta: {
    fontSize: "11px",
    color: "#777",
  },
};

export default PostDetail;
