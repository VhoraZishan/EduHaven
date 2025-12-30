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
      <h1 style={styles.title}>Global Feed</h1>

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
    margin: "30px auto",
    padding: "0 20px",
  },
  title: {
    fontSize: "24px",
    fontWeight: "600",
    marginBottom: "24px",
  },
  feed: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  loading: {
    padding: "40px",
    textAlign: "center",
  },
};

export default Feed;
