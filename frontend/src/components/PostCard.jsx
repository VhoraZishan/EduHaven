import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { upvotePost, downvotePost } from "../api/posts";
import { ThumbsUpIcon, ThumbsDownIcon } from "./Icons";

function PostCard({ post }) {
  const navigate = useNavigate();
  const { userMap, ensureUser, token } = useContext(AuthContext);

  const [hasUpvoted, setHasUpvoted] = useState(post.has_upvoted);
  const [hasDownvoted, setHasDownvoted] = useState(post.has_downvoted);
  const [upvotes, setUpvotes] = useState(post.upvotes_count || 0);
  const [downvotes, setDownvotes] = useState(post.downvotes_count || 0);

  useEffect(() => {
    ensureUser(post.author);
  }, [post.author]);

  const handleUpvote = async (e) => {
    e.stopPropagation();
    if (!token) return alert("Please log in to vote");
    
    try {
      await upvotePost(post.id);
      if (hasUpvoted) {
        setHasUpvoted(false);
        setUpvotes((prev) => prev - 1);
      } else {
        setHasUpvoted(true);
        setUpvotes((prev) => prev + 1);
        if (hasDownvoted) {
          setHasDownvoted(false);
          setDownvotes((prev) => prev - 1);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDownvote = async (e) => {
    e.stopPropagation();
    if (!token) return alert("Please log in to vote");

    try {
      await downvotePost(post.id);
      if (hasDownvoted) {
        setHasDownvoted(false);
        setDownvotes((prev) => prev - 1);
      } else {
        setHasDownvoted(true);
        setDownvotes((prev) => prev + 1);
        if (hasUpvoted) {
          setHasUpvoted(false);
          setUpvotes((prev) => prev - 1);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div
      style={styles.card}
      onClick={() => navigate(`/posts/${post.id}`)}
    >
      <div style={{display: 'flex', gap: '8px', marginBottom: '8px'}}>
         <span style={styles.postTypeBadge}>{post.post_type.toUpperCase()}</span>
      </div>

      <h3 style={styles.title}>{post.title}</h3>

      <div style={styles.meta}>
        <span>{userMap[post.author] || "Loading..."}</span>
        <span>•</span>
        <span>{new Date(post.created_at).toLocaleString()}</span>
      </div>

      <p style={styles.body}>
        {post.body.replace(/<[^>]+>/g, '').length > 160
          ? post.body.replace(/<[^>]+>/g, '').slice(0, 160) + "..."
          : post.body.replace(/<[^>]+>/g, '')}
      </p>

      <div style={styles.voteBar}>
        <button 
          onClick={handleUpvote} 
          style={{...styles.voteBtn, background: hasUpvoted ? '#dcfce7' : 'none', color: hasUpvoted ? '#166534' : '#4b5563'}}
        >
          <ThumbsUpIcon filled={hasUpvoted} /> {upvotes}
        </button>
        <button 
          onClick={handleDownvote} 
          style={{...styles.voteBtn, background: hasDownvoted ? '#fee2e2' : 'none', color: hasDownvoted ? '#991b1b' : '#4b5563'}}
        >
          <ThumbsDownIcon filled={hasDownvoted} /> {downvotes}
        </button>
      </div>
    </div>
  );
}

const styles = {
  card: {
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "10px",
    padding: "18px",
    cursor: "pointer",
    transition: "all 0.15s ease",
  },
  postTypeBadge: {
    background: '#f3f4f6',
    padding: '2px 8px',
    borderRadius: '12px',
    fontSize: '11px',
    fontWeight: 'bold',
    color: '#4b5563'
  },
  title: {
    fontSize: "18px",
    fontWeight: "600",
    marginBottom: "6px",
  },
  meta: {
    fontSize: "12px",
    color: "#6b7280",
    display: "flex",
    gap: "6px",
    marginBottom: "12px",
  },
  body: {
    fontSize: "14px",
    lineHeight: "1.6",
    color: "#111827",
  },
  voteBar: {
    display: 'flex', 
    gap: '12px', 
    marginTop: '16px', 
  },
  voteBtn: {
    border: '1px solid #d1d5db', 
    borderRadius: '8px', 
    padding: '6px 12px', 
    cursor: 'pointer', 
    display: 'flex', 
    alignItems: 'center', 
    gap: '6px', 
    fontSize: '14px',
    transition: 'background 0.2s ease',
  }
};

export default PostCard;
