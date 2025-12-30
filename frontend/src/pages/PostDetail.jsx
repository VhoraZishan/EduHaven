import { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { getComments, addComment } from "../api/comments";
import { AuthContext } from "../context/AuthContext";

function PostDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token, me, userMap, ensureUser } = useContext(AuthContext);

  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // edit states
  const [editingPost, setEditingPost] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editBody, setEditBody] = useState("");

  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editCommentText, setEditCommentText] = useState("");

  // Load post + comments
  useEffect(() => {
    Promise.all([
      api.get(`posts/${id}/`),
      getComments(id),
    ])
      .then(([postRes, commentsRes]) => {
        setPost(postRes.data);
        setEditTitle(postRes.data.title);
        setEditBody(postRes.data.body);
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

  // ===== POST EDIT / DELETE =====

  const handlePostUpdate = async () => {
    try {
      const res = await api.put(`posts/${id}/`, {
        title: editTitle,
        body: editBody,
      });
      setPost(res.data);
      setEditingPost(false);
    } catch {
      alert("Failed to update post");
    }
  };

  const handlePostDelete = async () => {
    if (!window.confirm("Delete this post?")) return;

    try {
      await api.delete(`posts/${id}/`);
      navigate("/");
    } catch {
      alert("Failed to delete post");
    }
  };

  // ===== COMMENT ADD / EDIT / DELETE =====

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

  const handleCommentUpdate = async (commentId) => {
    try {
      const res = await api.put(`comments/${commentId}/`, {
        body: editCommentText,
      });

      setComments((prev) =>
        prev.map((c) => (c.id === commentId ? res.data : c))
      );
      setEditingCommentId(null);
    } catch {
      alert("Failed to update comment");
    }
  };

  const handleCommentDelete = async (commentId) => {
    if (!window.confirm("Delete this comment?")) return;

    try {
      await api.delete(`comments/${commentId}/`);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } catch {
      alert("Failed to delete comment");
    }
  };

  if (loading) return <p style={styles.loading}>Loading post...</p>;
  if (!post) return <p>Post not found</p>;

  const isPostOwner = token && me && me.id === post.author;

  return (
    <div style={styles.page}>
      {/* POST CARD */}
      <div style={styles.postCard}>
        {editingPost ? (
          <>
            <input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              style={{ width: "100%", marginBottom: "10px" }}
            />
            <textarea
              value={editBody}
              onChange={(e) => setEditBody(e.target.value)}
              rows={6}
              style={{ width: "100%" }}
            />
            <div style={{ marginTop: "10px" }}>
              <button onClick={handlePostUpdate}>Save</button>{" "}
              <button onClick={() => setEditingPost(false)}>Cancel</button>
            </div>
          </>
        ) : (
          <>
            <h1 style={styles.title}>{post.title}</h1>

            <div style={styles.meta}>
              <span>{userMap[post.author] || "Loading..."}</span>
              <span>•</span>
              <span>{new Date(post.created_at).toLocaleString()}</span>
            </div>

            <div style={styles.body}>{post.body}</div>

            {isPostOwner && (
              <div style={{ marginTop: "12px" }}>
                <button onClick={() => setEditingPost(true)}>Edit</button>{" "}
                <button onClick={handlePostDelete} style={{ color: "#dc2626" }}>
                  Delete
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* COMMENTS */}
      <div style={styles.commentsSection}>
        <h3 style={styles.sectionTitle}>Comments</h3>

        {comments.length === 0 && (
          <p style={styles.empty}>No comments yet.</p>
        )}

        {comments.map((c) => {
          const isCommentOwner = token && me && me.id === c.author;

          return (
            <div key={c.id} style={styles.commentCard}>
              {editingCommentId === c.id ? (
                <>
                  <textarea
                    value={editCommentText}
                    onChange={(e) => setEditCommentText(e.target.value)}
                    rows={3}
                    style={{ width: "100%" }}
                  />
                  <div style={{ marginTop: "6px" }}>
                    <button onClick={() => handleCommentUpdate(c.id)}>
                      Save
                    </button>{" "}
                    <button onClick={() => setEditingCommentId(null)}>
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <p style={styles.commentBody}>{c.body}</p>
                  <div style={styles.commentMeta}>
                    {userMap[c.author] || "Loading..."} •{" "}
                    {new Date(c.created_at).toLocaleString()}
                  </div>

                  {isCommentOwner && (
                    <div style={{ marginTop: "6px" }}>
                      <button
                        onClick={() => {
                          setEditingCommentId(c.id);
                          setEditCommentText(c.body);
                        }}
                      >
                        Edit
                      </button>{" "}
                      <button
                        onClick={() => handleCommentDelete(c.id)}
                        style={{ color: "#dc2626" }}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}

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
          <p style={styles.loginHint}>Login to add a comment.</p>
        )}
      </div>
    </div>
  );
}

/* === STYLES (UNCHANGED) === */
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
