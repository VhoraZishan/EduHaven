import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { createPost } from "../api/posts";

function CreatePost() {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // 🔐 Redirect guests properly
  useEffect(() => {
    if (!token) {
      navigate("/login");
    }
  }, [token, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      setLoading(true);
      const res = await createPost({ title, body });
      navigate(`/posts/${res.data.id}`);
    } catch (err) {
      console.error("CREATE POST ERROR:", err.response || err);
      setError(
        err.response?.data?.detail ||
          JSON.stringify(err.response?.data) ||
          "Failed to create post"
      );
    } finally {
      setLoading(false);
    }
  };

  if (!token) return null;

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>Create a new post</h1>
        <p style={styles.subtitle}>
          Share something with the EduHaven community
        </p>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            style={styles.input}
            placeholder="Post title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <textarea
            style={styles.textarea}
            placeholder="Write your post..."
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={6}
            required
          />

          <button style={styles.button} type="submit" disabled={loading}>
            {loading ? "Posting…" : "Publish post"}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "calc(100vh - 64px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
  },
  card: {
    width: "100%",
    maxWidth: "600px",
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
    padding: "32px",
  },
  title: {
    margin: 0,
    fontSize: "24px",
    fontWeight: "600",
  },
  subtitle: {
    marginTop: "6px",
    marginBottom: "24px",
    fontSize: "14px",
    color: "#6b7280",
  },
  error: {
    background: "#fee2e2",
    color: "#b91c1c",
    padding: "10px",
    borderRadius: "6px",
    fontSize: "14px",
    marginBottom: "16px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },
  input: {
    padding: "10px 12px",
    fontSize: "14px",
    borderRadius: "8px",
    border: "1px solid #d1d5db",
  },
  textarea: {
    padding: "10px 12px",
    fontSize: "14px",
    borderRadius: "8px",
    border: "1px solid #d1d5db",
    resize: "vertical",
  },
  button: {
    marginTop: "6px",
    padding: "10px",
    fontSize: "14px",
    fontWeight: "500",
    background: "#4f46e5",
    color: "#ffffff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  },
};

export default CreatePost;
