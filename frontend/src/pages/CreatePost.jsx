import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { createPost } from "../api/posts";

function CreatePost() {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [error, setError] = useState("");

  // 🚫 Block guests
  if (!token) {
    navigate("/login");
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await createPost({ title, body });
      navigate("/");
    } catch (err) {
  console.error("CREATE POST ERROR:", err.response || err);
  setError(
    err.response?.data?.detail ||
    JSON.stringify(err.response?.data) ||
    "Failed to create post"
  );
}

  };

  return (
    <div style={styles.container}>
      <h2>Create New Post</h2>

      {error && <p style={styles.error}>{error}</p>}

      <form onSubmit={handleSubmit}>
        <input
          placeholder="Post title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <textarea
          placeholder="Write your post..."
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={6}
          required
        />

        <button type="submit">Post</button>
      </form>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "600px",
    margin: "30px auto",
    background: "#fff",
    padding: "20px",
    borderRadius: "6px",
  },
  error: {
    color: "red",
  },
};

export default CreatePost;
