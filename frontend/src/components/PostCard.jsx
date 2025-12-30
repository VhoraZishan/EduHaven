import { useNavigate } from "react-router-dom";
import { useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";

function PostCard({ post }) {
  const navigate = useNavigate();
  const { userMap, ensureUser } = useContext(AuthContext);

  // 🔹 ASK FOR USERNAME WHEN COMPONENT LOADS
  useEffect(() => {
    ensureUser(post.author);
  }, [post.author]);

  return (
    <div onClick={() => navigate(`/posts/${post.id}`)}>
      <h3>{post.title}</h3>
      <p>
        Author: {userMap[post.author] || "Loading..."}
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
