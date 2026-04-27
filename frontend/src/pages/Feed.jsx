import { useEffect, useState } from "react";
import { getPosts } from "../api/posts";
import PostCard from "../components/PostCard";

function Feed() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPosts()
      .then((res) => {
        setPosts(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return <p style={styles.loading}>Loading feed...</p>;
  }

  return (
    <div style={styles.page}>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: "24px"}}>
        <h1 style={{...styles.title, marginBottom: 0}}>Global Feed</h1>
        <button 
          onClick={() => window.location.href = '/create'}
          style={{padding: '8px 16px', background: '#4f46e5', color: 'white', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold'}}
        >
          + Create Post
        </button>
      </div>

      {posts.length === 0 && <p>No posts yet.</p>}

      <div style={styles.feed}>
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
}

const styles = {
  page: {
    maxWidth: "900px",
    margin: "40px auto",
    padding: "0 20px",
  },
  title: {
    fontSize: "32px",
    fontWeight: "800",
    marginBottom: "24px",
    letterSpacing: "-0.5px",
    textTransform: "uppercase",
  },
  feed: {
    display: "flex",
    flexDirection: "column",
    gap: "24px",
  },
  loading: {
    padding: "60px",
    textAlign: "center",
    fontWeight: "700",
    fontSize: "18px",
  },
  createButton: {
    padding: "10px 20px",
    background: "var(--cat-question)",
    color: "#000",
    borderRadius: "9999px",
    border: "var(--brutal-border)",
    boxShadow: "var(--brutal-shadow)",
    cursor: "pointer",
    fontWeight: "800",
    fontSize: "15px",
    textTransform: "uppercase",
  }
};

export default Feed;
