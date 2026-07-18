import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { upvotePost, downvotePost } from "../api/posts";
import { ThumbsUpIcon, ThumbsDownIcon } from "./Icons";

const formatRole = (role) => {
  if (!role) return "";
  const mapping = {
    student: "Student",
    educator: "Educator",
    researcher: "Researcher",
    professional: "Professional",
    self_learner: "Self-Learner",
    moderator: "Moderator",
    admin: "Admin",
  };
  return mapping[role] || role;
};

function PostCard({ post }) {
  const navigate = useNavigate();
  const { userMap, roleMap, ensureUser, token } = useContext(AuthContext);

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
      <div style={{display: 'flex', gap: '8px', marginBottom: '8px', flexWrap: 'wrap', alignItems: 'center'}}>
        <span style={styles.postTypeBadge}>{post.post_type.toUpperCase()}</span>
        {post.community_name && (
          <span
            onClick={(e) => { e.stopPropagation(); navigate(`/communities/${post.community_slug}`); }}
            style={styles.communityBadge}
          >
            {post.community_name}
          </span>
        )}
      </div>

      <h3 style={styles.title}>{post.title}</h3>

      <div style={styles.meta}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <span>{userMap[post.author] || "Loading..."}</span>
          {roleMap[post.author] && (
            <span style={styles.roleTag}>
              {formatRole(roleMap[post.author])}
            </span>
          )}
        </span>
        <span>•</span>
        <span>{new Date(post.created_at).toLocaleString()}</span>
      </div>

      <p style={styles.body}>
        {post.body.replace(/<[^>]+>/g, '').length > 160
          ? post.body.replace(/<[^>]+>/g, '').slice(0, 160) + "..."
          : post.body.replace(/<[^>]+>/g, '')}
      </p>

      {post.post_type === 'article' && post.link && (
        <a 
          href={post.link} 
          target="_blank" 
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          style={{
            display: 'flex',
            flexDirection: 'row',
            gap: '12px',
            background: '#fafafa',
            border: '2px solid #000',
            boxShadow: '3px 3px 0px #000',
            padding: '12px',
            marginTop: '12px',
            marginBottom: '12px',
            textDecoration: 'none',
            color: 'inherit',
            alignItems: 'center',
            cursor: 'pointer'
          }}
        >
          {post.link_image && (
            <img 
              src={post.link_image} 
              alt={post.link_title} 
              style={{
                width: '80px',
                height: '80px',
                objectFit: 'cover',
                border: '2px solid #000',
                borderRadius: '4px',
                flexShrink: 0
              }}
            />
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {post.link_title || post.link}
            </h4>
            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#4b5563', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              {post.link_description || "External URL resource preview."}
            </p>
            <span style={{ fontSize: '11px', color: '#6b7280', display: 'block', marginTop: '6px', fontWeight: 'bold' }}>
              {post.link.startsWith('http') ? new URL(post.link).hostname : post.link}
            </span>
          </div>
        </a>
      )}

      {post.post_type === 'poll' && post.poll_options && (
        <div 
          onClick={(e) => e.stopPropagation()}
          style={{
            marginTop: '12px',
            marginBottom: '12px',
            background: '#f9fafb',
            border: '2px solid #000',
            boxShadow: '3px 3px 0px #000',
            padding: '16px',
            borderRadius: '8px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}
        >
          {(() => {
            const totalVotes = post.poll_options.reduce((sum, opt) => sum + opt.votes_count, 0);
            return (
              <>
                <span style={{ fontWeight: '800', fontSize: '13px', color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  POLL ({totalVotes} {totalVotes === 1 ? 'vote' : 'votes'} cast)
                </span>
                {post.poll_options.map((opt) => {
                  const pct = totalVotes > 0 ? Math.round((opt.votes_count / totalVotes) * 100) : 0;
                  const isVoted = opt.id === post.user_voted_option_id;
                  return (
                    <div key={opt.id} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: '700' }}>
                        <span style={{ color: isVoted ? '#10b981' : '#111827' }}>
                          {isVoted && '✓ '}{opt.text}
                        </span>
                        <span>{pct}% ({opt.votes_count})</span>
                      </div>
                      <div style={{ width: '100%', height: '12px', background: '#e5e7eb', border: '1px solid #000', position: 'relative' }}>
                        <div style={{ width: `${pct}%`, height: '100%', background: isVoted ? '#10b981' : '#4f46e5' }} />
                      </div>
                    </div>
                  );
                })}
              </>
            );
          })()}
        </div>
      )}

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
    border: "var(--brutal-border)",
    boxShadow: "var(--brutal-shadow)",
    padding: "20px",
    cursor: "pointer",
    transition: "transform 0.1s ease",
  },
  postTypeBadge: {
    background: "var(--cat-news)",
    padding: "4px 10px",
    border: "var(--brutal-border)",
    fontSize: "12px",
    fontWeight: "800",
    color: "#000",
    boxShadow: "2px 2px 0px #000",
    textTransform: "uppercase"
  },
  communityBadge: {
    background: "var(--cat-discussion)",
    padding: "4px 10px",
    border: "var(--brutal-border)",
    fontSize: "12px",
    fontWeight: "700",
    color: "#000",
    boxShadow: "2px 2px 0px #000",
    cursor: "pointer",
    borderRadius: "9999px",
  },
  title: {
    fontSize: "20px",
    fontWeight: "800",
    marginBottom: "8px",
    letterSpacing: "-0.2px"
  },
  meta: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#4b5563",
    display: "flex",
    gap: "6px",
    marginBottom: "12px",
  },
  body: {
    fontSize: "15px",
    lineHeight: "1.6",
    color: "#111827",
    fontWeight: "400",
  },
  voteBar: {
    display: "flex", 
    gap: "12px", 
    marginTop: "20px", 
  },
  voteBtn: {
    border: "var(--brutal-border)", 
    boxShadow: "2px 2px 0px #000",
    padding: "6px 12px", 
    cursor: "pointer", 
    display: "flex", 
    alignItems: "center", 
    gap: "6px", 
    fontSize: "15px",
    fontWeight: "700",
    transition: "transform 0.1s ease",
  },
  roleTag: {
    background: '#e0e7ff',
    border: '1px solid #000',
    color: '#4338ca',
    padding: '1px 8px',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: '800',
  },
};

export default PostCard;
