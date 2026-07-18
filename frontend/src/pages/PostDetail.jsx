import { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { getComments, addComment, upvoteComment, downvoteComment, toggleAnswer } from "../api/comments";
import { upvotePost, downvotePost, votePoll } from "../api/posts";
import { AuthContext } from "../context/AuthContext";
import { ThumbsUpIcon, ThumbsDownIcon } from "../components/Icons";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

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

function CommentNode({ comment, allComments, onReply, onEdit, onDelete, onUpvote, onDownvote, onToggleAnswer, me, token, userMap, roleMap, editingCommentId, editCommentText, setEditCommentText, handleCommentUpdate, setEditingCommentId, isAnyEditActive, isPostOwner, postType }) {
  const isOwner = token && me && me.id === comment.author;
  const replies = allComments.filter(c => c.parent === comment.id);
  const [commentMenuOpen, setCommentMenuOpen] = useState(false);

  // Close this comment's menu on outside click
  useEffect(() => {
    if (!commentMenuOpen) return;
    const handler = (e) => {
      if (!e.target.closest(`.comment-menu-${comment.id}`)) {
        setCommentMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [commentMenuOpen]);

  // A reply inside this comment's subtree may be the one being edited.
  // We check if any descendant (at any depth) is the active edit target.
  const subtreeHasActiveEdit = (node) => {
    if (editingCommentId === node.id) return true;
    return allComments
      .filter(c => c.parent === node.id)
      .some(subtreeHasActiveEdit);
  };
  const descendantIsEditing = subtreeHasActiveEdit(comment);

  // Lock THIS comment's own content only if an edit is active elsewhere
  // AND none of its descendants are being edited either.
  const isThisNodeLocked = isAnyEditActive && editingCommentId !== comment.id && !descendantIsEditing;

  if (editingCommentId === comment.id) {
    return (
      <div style={{...styles.commentCard, marginLeft: comment.parent ? '20px' : '0'}}>
        <p style={{...styles.commentMeta, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px'}}>
          <span
            onClick={() => navigate(`/profile/${comment.author}`)}
            style={{ cursor: 'pointer', textDecoration: 'underline', fontWeight: '700', color: 'var(--accent-primary)' }}
            title="View Profile"
          >
            {userMap[comment.author] || "Loading..."}
          </span>
          {roleMap[comment.author] && (
            <span style={styles.roleTag}>
              {formatRole(roleMap[comment.author])}
            </span>
          )}
          <span>• Editing comment</span>
        </p>
        <textarea
          value={editCommentText}
          onChange={(e) => setEditCommentText(e.target.value)}
          rows={4}
          autoFocus
          style={{ width: "100%", padding: '8px', borderRadius: '6px', border: '1px solid #a5b4fc', fontSize: '14px', resize: 'vertical', boxSizing: 'border-box' }}
        />
        <div style={{ marginTop: "8px", display: 'flex', gap: '8px' }}>
          <button
            onClick={() => handleCommentUpdate(comment.id)}
            style={{ padding: '6px 18px', background: '#4f46e5', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}
          >
            Save
          </button>
          <button
            onClick={() => setEditingCommentId(null)}
            style={{ padding: '6px 18px', background: '#6b7280', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  const highlightStyles = comment.is_answer ? {
    border: '2px solid #16a34a',
    boxShadow: '4px 4px 0px #16a34a',
  } : {};

  return (
    <div style={{...styles.commentCard, ...highlightStyles, marginLeft: comment.parent ? '20px' : '0', opacity: isThisNodeLocked ? 0.45 : 1, pointerEvents: isThisNodeLocked ? 'none' : 'auto'}}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <p style={styles.commentBody}>{comment.body}</p>
          <div style={styles.commentMeta}>
            {comment.is_answer && (
              <span style={{ background: '#16a34a', color: 'white', padding: '2px 8px', borderRadius: '9999px', fontWeight: '800', marginRight: '6px', fontSize: '11px', display: 'inline-flex', alignItems: 'center' }}>
                ✓ ANSWER
              </span>
            )}
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <span
                onClick={() => navigate(`/profile/${comment.author}`)}
                style={{ cursor: 'pointer', textDecoration: 'underline', fontWeight: '700', color: 'var(--accent-primary)' }}
                title="View Profile"
              >
                {userMap[comment.author] || "Loading..."}
              </span>
              {roleMap[comment.author] && (
                <span style={styles.roleTag}>
                  {formatRole(roleMap[comment.author])}
                </span>
              )}
            </span>
            {" • "}{new Date(comment.created_at).toLocaleString()}
            {comment.edited_at && (
              <>
                {" "}•{" "}
                <span style={{ fontStyle: 'italic' }}>Edited {new Date(comment.edited_at).toLocaleString()}</span>
              </>
            )}
          </div>
        </div>

        {isOwner && (
          <div className={`comment-menu-${comment.id}`} style={{ position: 'relative', marginLeft: '8px', flexShrink: 0 }}>
            <button
              onClick={(e) => { e.stopPropagation(); setCommentMenuOpen(o => !o); }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', padding: '2px 6px', color: '#9ca3af', lineHeight: 1 }}
              title="More options"
            >
              ⋯
            </button>
            {commentMenuOpen && (
              <div style={{ position: 'absolute', right: 0, top: '100%', background: 'white', border: '1px solid #e5e7eb', borderRadius: '6px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', zIndex: 20, minWidth: '110px' }}>
                <button
                  onClick={(e) => { e.stopPropagation(); setCommentMenuOpen(false); onEdit(comment); }}
                  style={{ display: 'block', width: '100%', padding: '8px 14px', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', color: '#111827', fontSize: '13px' }}
                >
                  Edit
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); setCommentMenuOpen(false); onDelete(comment.id); }}
                  style={{ display: 'block', width: '100%', padding: '8px 14px', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', color: '#dc2626', fontSize: '13px' }}
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      
      <div style={{display: 'flex', gap: '10px', marginTop: '8px', fontSize: '13px', alignItems: 'center', flexWrap: 'wrap'}}>
        <button onClick={() => onUpvote(comment.id)} style={{background: comment.has_upvoted ? '#dcfce7' : 'none', color: comment.has_upvoted ? '#166534' : 'inherit', border: '1px solid #ccc', padding: '4px 8px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '4px'}}>
          <ThumbsUpIcon filled={comment.has_upvoted} /> {comment.upvotes_count || 0}
        </button>
        <button onClick={() => onDownvote(comment.id)} style={{background: comment.has_downvoted ? '#fee2e2' : 'none', color: comment.has_downvoted ? '#991b1b' : 'inherit', border: '1px solid #ccc', padding: '4px 8px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '4px'}}>
          <ThumbsDownIcon filled={comment.has_downvoted} /> {comment.downvotes_count || 0}
        </button>
        {token && <button onClick={() => onReply(comment.id)} style={{background: 'none', border: 'none', color: '#4f46e5', cursor: 'pointer', padding: 0}}>Reply</button>}
        
        {isPostOwner && postType === 'question' && !comment.parent && (
          <button 
            onClick={() => onToggleAnswer(comment.id)} 
            style={{
              background: comment.is_answer ? '#fee2e2' : '#dcfce7', 
              color: comment.is_answer ? '#991b1b' : '#166534', 
              border: '2px solid #000', 
              boxShadow: '1px 1px 0px #000',
              padding: '4px 8px', 
              borderRadius: '4px',
              fontWeight: '700',
              cursor: 'pointer'
            }}
          >
            {comment.is_answer ? "Unmark Answer" : "Mark as Answer"}
          </button>
        )}
      </div>

      {/* Render Replies */}
      {replies.length > 0 && (
        <div style={{marginTop: '10px', borderLeft: '2px solid #e5e7eb', paddingLeft: '10px'}}>
          {replies.map(reply => (
            <CommentNode 
              key={reply.id} 
              comment={reply} 
              allComments={allComments}
              onReply={onReply}
              onEdit={onEdit}
              onDelete={onDelete}
              onUpvote={onUpvote}
              onDownvote={onDownvote}
              onToggleAnswer={onToggleAnswer}
              me={me}
              token={token}
              userMap={userMap}
              roleMap={roleMap}
              editingCommentId={editingCommentId}
              editCommentText={editCommentText}
              setEditCommentText={setEditCommentText}
              handleCommentUpdate={handleCommentUpdate}
              setEditingCommentId={setEditingCommentId}
              isAnyEditActive={isAnyEditActive}
              isPostOwner={isPostOwner}
              postType={postType}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function PostDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token, me, userMap, roleMap, ensureUser } = useContext(AuthContext);

  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [replyToCommentId, setReplyToCommentId] = useState(null);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // edit states
  const [editingPost, setEditingPost] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editBody, setEditBody] = useState("");

  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editCommentText, setEditCommentText] = useState("");

  const [menuOpen, setMenuOpen] = useState(false);

  // Load post + comments
  useEffect(() => {
    fetchPostAndComments();
  }, [id]);

  const fetchPostAndComments = () => {
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
      .catch(() => {
        setPost(null);
        setLoading(false);
      });
  };

  // Close menu on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuOpen && !event.target.closest('.menu-container')) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  // Image navigation
  const allImages = post ? [] : [];
  if (post && post.image) allImages.push(post.image);
  if (post && post.images && post.images.length > 0) {
    post.images.forEach(img => allImages.push(img.image));
  }
  const hasImages = allImages.length > 0;

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  // ===== POST ACTIONS =====

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

  const handlePostUpvote = async () => {
    if(!token) return alert("Log in to vote");
    await upvotePost(id);
    fetchPostAndComments();
  };

  const handlePostDownvote = async () => {
    if(!token) return alert("Log in to vote");
    await downvotePost(id);
    fetchPostAndComments();
  };

  // ===== COMMENT ADD / EDIT / DELETE / VOTE =====

  const handleAddComment = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await addComment(id, { body: commentText, parent: replyToCommentId });
      setComments((prev) => [...prev, res.data]);
      setCommentText("");
      setReplyToCommentId(null);
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

  const handleCommentUpvote = async (commentId) => {
    if(!token) return alert("Log in to vote");
    await upvoteComment(commentId);
    fetchPostAndComments();
  };

  const handleCommentDownvote = async (commentId) => {
    if(!token) return alert("Log in to vote");
    await downvoteComment(commentId);
    fetchPostAndComments();
  };

  const initiateReply = (commentId) => {
    setReplyToCommentId(commentId);
  };
  
  const initiateEdit = (comment) => {
    setEditingCommentId(comment.id);
    setEditCommentText(comment.body);
  };

  const handleToggleAnswer = async (commentId) => {
    try {
      await toggleAnswer(commentId);
      fetchPostAndComments();
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to toggle answer status.");
    }
  };

  const handlePollVote = async (optionId) => {
    if (!token) return alert("Please log in to vote.");
    try {
      await votePoll(post.id, optionId);
      fetchPostAndComments();
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to submit vote.");
    }
  };

  if (loading) return <p style={styles.loading}>Loading post...</p>;
  if (!post) return <p>Post not found</p>;

  const isPostOwner = token && me && me.id === post.author;
  // Sort comments so that answers are always on top
  const rootComments = comments
    .filter(c => !c.parent)
    .sort((a, b) => (b.is_answer ? 1 : 0) - (a.is_answer ? 1 : 0));
  // True whenever ANY edit mode is active — locks out all other interactions
  const isAnyEditActive = editingPost || !!editingCommentId;

  return (
    <div style={styles.page}>
      <button onClick={() => navigate(-1)} style={styles.backBtn}>
        ← Back
      </button>
      {/* POST CARD */}
      <div style={{...styles.postCard, opacity: editingCommentId ? 0.45 : 1, pointerEvents: editingCommentId ? 'none' : 'auto'}}>
        {editingPost ? (
          <>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Post Title</label>
              <input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                style={{ width: "100%", padding: '10px', fontSize: '18px', border: '1px solid #a5b4fc', borderRadius: '4px', fontWeight: 'bold', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Post Content</label>
              <div style={{ background: 'white' }}>
                <ReactQuill 
                  theme="snow" 
                  value={editBody} 
                  onChange={setEditBody} 
                  style={{ height: '300px', marginBottom: '45px' }}
                />
              </div>
            </div>

            <div style={{ marginTop: "20px", display: 'flex', gap: '10px' }}>
              <button onClick={handlePostUpdate} className="btn-primary" style={{ padding: '8px 24px' }}>Save Changes</button>
              <button onClick={() => { setEditingPost(false); setEditTitle(post.title); setEditBody(post.body); }} className="btn-secondary" style={{ padding: '8px 24px' }}>Cancel</button>
            </div>
          </>
        ) : (
        <>
        <div style={{display: 'flex', gap: '8px', marginBottom: '8px', flexWrap: 'wrap', alignItems: 'center'}}>
             <span style={styles.postTypeBadge}>{post.post_type.toUpperCase()}</span>
             {post.community_name && (
               <span
                 onClick={() => navigate(`/communities/${post.community_slug}`)}
                 style={styles.communityBadge}
               >
                 {post.community_name}
               </span>
             )}
          </div>
          
          <h1 style={styles.title}>{post.title}</h1>

          <div style={{...styles.meta, display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
            <div>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <span
                  onClick={() => navigate(`/profile/${post.author}`)}
                  style={{ cursor: 'pointer', textDecoration: 'underline', fontWeight: '700', color: 'var(--accent-primary)' }}
                  title="View Profile"
                >
                  {userMap[post.author] || "Loading..."}
                </span>
                {roleMap[post.author] && (
                  <span style={styles.roleTag}>
                    {formatRole(roleMap[post.author])}
                  </span>
                )}
              </span>
              <span>•</span>
              <span>{new Date(post.created_at).toLocaleString()}</span>
              {post.edited_at && (
                <>
                  <span>•</span>
                  <span style={{ fontStyle: 'italic', color: '#6b7280' }}>Edited {new Date(post.edited_at).toLocaleString()}</span>
                </>
              )}
            </div>
            {isPostOwner && (
              <div className="menu-container" style={{ position: 'relative' }}>
                <button 
                  onClick={() => setMenuOpen(!menuOpen)} 
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', padding: '4px', color: '#6b7280' }}
                >
                  ⋯
                </button>
                {menuOpen && (
                  <div style={{ position: 'absolute', right: 0, top: '100%', background: 'white', border: '1px solid #e5e7eb', borderRadius: '6px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', zIndex: 10, minWidth: '110px' }}>
                    <button 
                      onClick={() => { setEditingPost(true); setMenuOpen(false); }} 
                      style={{ display: 'block', width: '100%', padding: '8px 14px', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', color: '#111827', fontSize: '13px' }}
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => { handlePostDelete(); setMenuOpen(false); }} 
                      style={{ display: 'block', width: '100%', padding: '8px 14px', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', color: '#dc2626', fontSize: '13px' }}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <div style={styles.body} dangerouslySetInnerHTML={{ __html: post.body }} />

          {post.post_type === 'article' && post.link && (
            <a 
              href={post.link} 
              target="_blank" 
              rel="noopener noreferrer"
              style={{
                display: 'flex',
                flexDirection: 'row',
                gap: '16px',
                background: '#fafafa',
                border: 'var(--brutal-border)',
                boxShadow: 'var(--brutal-shadow)',
                padding: '16px',
                marginTop: '16px',
                marginBottom: '16px',
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
                    width: '120px',
                    height: '120px',
                    objectFit: 'cover',
                    border: 'var(--brutal-border)',
                    borderRadius: '4px',
                    flexShrink: 0
                  }}
                />
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <h4 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {post.link_title || post.link}
                </h4>
                <p style={{ margin: '8px 0 0 0', fontSize: '14px', color: '#4b5563', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.5 }}>
                  {post.link_description || "External URL resource preview."}
                </p>
                <span style={{ fontSize: '12px', color: '#6b7280', display: 'block', marginTop: '10px', fontWeight: 'bold' }}>
                  {post.link.startsWith('http') ? new URL(post.link).hostname : post.link}
                </span>
              </div>
            </a>
          )}

          {hasImages && (
            <div style={{ marginTop: '16px', position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <img 
                src={allImages[currentImageIndex].includes('http') ? allImages[currentImageIndex] : `http://localhost:8000${allImages[currentImageIndex]}`} 
                alt={`Image ${currentImageIndex + 1}`} 
                style={{ maxWidth: '100%', maxHeight: '500px', borderRadius: '8px', objectFit: 'contain' }} 
              />
              {allImages.length > 1 && (
                <>
                  <button 
                    onClick={prevImage} 
                    style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.7)', color: 'white', border: 'none', borderRadius: '50%', width: '40px', height: '40px', cursor: 'pointer', fontSize: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    ‹
                  </button>
                  <button 
                    onClick={nextImage} 
                    style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.7)', color: 'white', border: 'none', borderRadius: '50%', width: '40px', height: '40px', cursor: 'pointer', fontSize: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    ›
                  </button>
                  <div style={{ position: 'absolute', bottom: '10px', left: '50%', transform: 'translateX(-50%)', background: 'rgba(0,0,0,0.7)', color: 'white', padding: '4px 8px', borderRadius: '12px', fontSize: '12px' }}>
                    {currentImageIndex + 1} / {allImages.length}
                  </div>
                </>
              )}
            </div>
          )}

          {post.video && (
              <video controls style={{width: '100%', borderRadius: '8px', marginTop: '16px'}}>
                <source src={post.video.includes('http') ? post.video : `http://localhost:8000${post.video}`} type="video/mp4" />
              </video>
          )}

          {post.post_type === 'poll' && post.poll_options && (
            <div 
              style={{
                marginTop: '20px',
                marginBottom: '20px',
                background: '#f9fafb',
                border: 'var(--brutal-border)',
                boxShadow: 'var(--brutal-shadow)',
                padding: '24px',
                borderRadius: '8px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}
            >
              {(() => {
                const totalVotes = post.poll_options.reduce((sum, opt) => sum + opt.votes_count, 0);
                const hasVoted = post.user_voted_option_id !== null && post.user_voted_option_id !== undefined;
                
                return (
                  <>
                    <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>Poll</span>
                      <span style={{ fontSize: '13px', background: '#e0e7ff', color: '#4338ca', padding: '4px 10px', borderRadius: '9999px', border: '1px solid #000' }}>
                        {totalVotes} {totalVotes === 1 ? 'vote' : 'votes'}
                      </span>
                    </h3>

                    {post.poll_options.map((opt) => {
                      const pct = totalVotes > 0 ? Math.round((opt.votes_count / totalVotes) * 100) : 0;
                      const isVoted = opt.id === post.user_voted_option_id;

                      if (token && !hasVoted) {
                        return (
                          <button
                            key={opt.id}
                            onClick={() => handlePollVote(opt.id)}
                            style={{
                              width: '100%',
                              textAlign: 'left',
                              padding: '12px 16px',
                              background: 'white',
                              color: '#111827',
                              border: 'var(--brutal-border)',
                              boxShadow: '2px 2px 0px #000',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontWeight: '700',
                              fontSize: '14px',
                              transition: 'transform 0.1s ease',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center'
                            }}
                          >
                            <span>{opt.text}</span>
                            <span style={{ color: '#4b5563', fontSize: '12px' }}>Vote</span>
                          </button>
                        );
                      } else {
                        return (
                          <div 
                            key={opt.id}
                            onClick={() => {
                              if (token && isVoted) {
                                handlePollVote(opt.id);
                              }
                            }}
                            style={{ 
                              display: 'flex', 
                              flexDirection: 'column', 
                              gap: '4px',
                              cursor: (token && isVoted) ? 'pointer' : 'default'
                            }}
                            title={isVoted ? "Click to retract your vote" : undefined}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: '800' }}>
                              <span style={{ color: isVoted ? '#10b981' : '#111827' }}>
                                {isVoted && '✓ '}{opt.text}
                              </span>
                              <span>{pct}% ({opt.votes_count})</span>
                            </div>
                            <div style={{ width: '100%', height: '18px', background: '#e5e7eb', border: '1px solid #000', position: 'relative', borderRadius: '2px' }}>
                              <div style={{ width: `${pct}%`, height: '100%', background: isVoted ? '#10b981' : '#4f46e5' }} />
                            </div>
                          </div>
                        );
                      }
                    })}
                  </>
                );
              })()}
            </div>
          )}

          <div style={styles.voteBar}>
             <button onClick={handlePostUpvote} style={{...styles.voteBtn, background: post.has_upvoted ? '#dcfce7' : 'none', color: post.has_upvoted ? '#166534' : 'inherit'}}>
               <ThumbsUpIcon filled={post.has_upvoted} /> {post.upvotes_count || 0}
             </button>
             <button onClick={handlePostDownvote} style={{...styles.voteBtn, background: post.has_downvoted ? '#fee2e2' : 'none', color: post.has_downvoted ? '#991b1b' : 'inherit'}}>
               <ThumbsDownIcon filled={post.has_downvoted} /> {post.downvotes_count || 0}
             </button>
          </div>
        </>
      )}
      </div>

      {/* COMMENTS */}
      <div style={styles.commentsSection}>
        <h3 style={styles.sectionTitle}>Comments ({comments.length})</h3>

        {comments.length === 0 && !isAnyEditActive && (
          <p style={styles.empty}>No comments yet.</p>
        )}

        {rootComments.map((c) => (
          <CommentNode 
            key={c.id} 
            comment={c} 
            allComments={comments}
            onReply={initiateReply}
            onEdit={initiateEdit}
            onDelete={handleCommentDelete}
            onUpvote={handleCommentUpvote}
            onDownvote={handleCommentDownvote}
            onToggleAnswer={handleToggleAnswer}
            me={me}
            token={token}
            userMap={userMap}
            roleMap={roleMap}
            editingCommentId={editingCommentId}
            editCommentText={editCommentText}
            setEditCommentText={setEditCommentText}
            handleCommentUpdate={handleCommentUpdate}
            setEditingCommentId={setEditingCommentId}
            isAnyEditActive={isAnyEditActive}
            isPostOwner={isPostOwner}
            postType={post.post_type}
          />
        ))}

        {/* ADD COMMENT — hidden during any edit */}
        {!isAnyEditActive && token ? (
          <form onSubmit={handleAddComment} style={styles.commentForm}>
            {error && <p style={styles.error}>{error}</p>}

            {replyToCommentId && (
               <div style={{marginBottom: '10px', fontSize: '12px', background: 'var(--cat-meme)', padding: '6px 10px', borderRadius: '6px', border: 'var(--brutal-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                 <span style={{fontWeight: '600'}}>Replying to comment #{replyToCommentId}</span>
                 <button type="button" onClick={() => setReplyToCommentId(null)} className="btn-secondary" style={{padding: '4px 10px', fontSize: '12px'}}>Cancel Reply</button>
               </div>
            )}

            <textarea
              placeholder="Write a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              rows={3}
              required
              style={{width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #d1d5db', resize: 'vertical'}}
            />

            <button type="submit" className="btn-primary" style={{marginTop: '4px'}}>
              {replyToCommentId ? "Add Reply" : "Add Comment"}
            </button>
          </form>
        ) : !isAnyEditActive && (
          <p style={styles.loginHint}>Login to add a comment.</p>
        )}
      </div>
    </div>
  );
}

/* === STYLES === */
const styles = {
  page: { maxWidth: "900px", margin: "40px auto", padding: "0 20px" },
  loading: { padding: "60px", textAlign: "center", fontWeight: "700", fontSize: "18px" },
  postCard: { background: "#ffffff", border: "var(--brutal-border)", boxShadow: "var(--brutal-shadow)", borderRadius: "12px", padding: "32px", marginBottom: "40px" },
  postTypeBadge: { background: "var(--cat-question)", border: "var(--brutal-border)", padding: "4px 12px", borderRadius: "9999px", fontSize: "12px", fontWeight: "800", color: "#000", boxShadow: "2px 2px 0px #000" },
  title: { fontSize: "32px", fontWeight: "800", marginBottom: "8px", letterSpacing: "-0.5px" },
  meta: { fontSize: "14px", color: "#4b5563", fontWeight: "600", display: "flex", gap: "6px", marginBottom: "24px" },
  body: { fontSize: "16px", lineHeight: "1.7", whiteSpace: "pre-wrap", color: "#111827", paddingBottom: "16px" },
  voteBar: { display: 'flex', gap: '16px', marginTop: '24px', paddingTop: '20px', borderTop: '2px solid #000' },
  voteBtn: { border: 'var(--brutal-border)', borderRadius: '8px', padding: '8px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px', fontWeight: "700", boxShadow: "2px 2px 0px #000" },
  commentsSection: { background: "#FEF3C7", border: "var(--brutal-border)", boxShadow: "var(--brutal-shadow)", borderRadius: "12px", padding: "24px" },
  sectionTitle: { fontSize: "22px", fontWeight: "800", marginBottom: "20px", textTransform: "uppercase" },
  empty: { fontSize: "15px", color: "#4b5563", fontWeight: "600" },
  commentCard: { background: "#ffffff", border: "var(--brutal-border)", boxShadow: "2px 2px 0px #000", borderRadius: "8px", padding: "16px", marginBottom: "16px" },
  commentBody: { fontSize: "15px", marginBottom: "8px", fontWeight: "500" },
  commentMeta: { fontSize: "12px", color: "#4b5563", fontWeight: "600" },
  commentForm: { marginTop: "24px", display: "flex", flexDirection: "column", gap: "10px" },
  error: { color: "#dc2626", marginBottom: "8px", fontWeight: "700" },
  loginHint: { marginTop: "20px", fontSize: "15px", color: "#4b5563", fontWeight: "600" },
  communityBadge: { background: "var(--cat-discussion)", border: "var(--brutal-border)", padding: "4px 12px", borderRadius: "9999px", fontSize: "12px", fontWeight: "700", color: "#000", boxShadow: "2px 2px 0px #000", cursor: "pointer" },
  backBtn: { marginBottom: '20px', background: 'white', color: '#111827', border: 'var(--brutal-border)', boxShadow: '2px 2px 0px #000', padding: '8px 16px', borderRadius: '9999px', fontWeight: '700', cursor: 'pointer', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '6px' },
  roleTag: {
    background: '#e0e7ff',
    border: '1px solid #000',
    color: '#4338ca',
    padding: '1px 8px',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: '800',
    display: 'inline-block',
  },
};

export default PostDetail;
