import { useState, useEffect, useContext, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getCommunity, joinCommunity, deleteCommunity, updateCommunityIcon } from "../api/communities";
import { getPosts } from "../api/posts";
import { AuthContext } from "../context/AuthContext";
import PostCard from "../components/PostCard";
import { BACKEND_URL } from "../api/axios";

function CommunityDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { token, me } = useContext(AuthContext);
  const iconInputRef = useRef(null);

  const [community, setCommunity] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ordering, setOrdering] = useState("new");
  const [iconUploading, setIconUploading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    fetchAll();
  }, [slug]);

  useEffect(() => {
    if (!loading) fetchPosts();
  }, [ordering]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [comRes, postsRes] = await Promise.all([
        getCommunity(slug),
        getPosts({ community: slug, ordering }),
      ]);
      setCommunity(comRes.data);
      setPosts(postsRes.data);
    } catch (err) {
      console.error("Failed to load community details", err);
      setCommunity(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchPosts = async () => {
    try {
      const res = await getPosts({ community: slug, ordering });
      setPosts(res.data);
    } catch {}
  };

  const handleJoin = async () => {
    if (!token) return navigate("/login");
    try {
      const res = await joinCommunity(slug);
      if (res.data.status === "deleted") {
        // creator left → community was deleted
        navigate("/communities");
        return;
      }
      setCommunity((prev) => ({
        ...prev,
        is_member: res.data.status === "joined",
        member_count: prev.member_count + (res.data.status === "joined" ? 1 : -1),
      }));
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to join/leave community.");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteCommunity(slug);
      navigate("/communities");
    } catch {
      alert("Failed to delete community.");
    }
  };

  const handleIconUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIconUploading(true);
    try {
      const fd = new FormData();
      fd.append("icon", file);
      const res = await updateCommunityIcon(slug, fd);
      setCommunity((prev) => ({ ...prev, icon: res.data.icon }));
    } catch {
      alert("Failed to upload icon.");
    } finally {
      setIconUploading(false);
      if (iconInputRef.current) iconInputRef.current.value = "";
    }
  };

  // is_creator comes from the server (get_is_creator in serializer) — more reliable than client-side ID comparison
  const isCreator = !!community?.is_creator;

  if (loading) return <p style={styles.loading}>Loading community...</p>;
  if (!community) return <p style={styles.loading}>Community not found.</p>;

  return (
    <div>
      {/* Banner */}
      <div style={styles.banner}>
        {community.banner
          ? <img src={`${BACKEND_URL}${community.banner}`} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          : <div style={styles.bannerPlaceholder} />
        }
        <button onClick={() => navigate(-1)} style={styles.backBtnBanner}>
          ← Back
        </button>
      </div>

      <div style={styles.page}>
        {/* Community header */}
        <div style={styles.comHeader}>
          {/* Icon / pfp */}
          <div style={{ position: "relative", flexShrink: 0 }}>
            <div style={styles.iconCircle}>
              {community.icon
                ? <img src={`${BACKEND_URL}${community.icon}`} alt={community.name} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }} />
                : <span style={styles.iconLetter}>{community.name[0].toUpperCase()}</span>
              }
            </div>
            {isCreator && (
              <>
                <button
                  onClick={() => iconInputRef.current?.click()}
                  style={styles.iconEditBtn}
                  title="Change icon"
                  disabled={iconUploading}
                >
                  {iconUploading ? "..." : "Edit"}
                </button>
                <input type="file" ref={iconInputRef} accept="image/*" onChange={handleIconUpload} style={{ display: "none" }} />
              </>
            )}
          </div>

          {/* Name + stats */}
          <div style={styles.comInfo}>
            <h1 style={styles.comName}>{community.name}</h1>
            <div style={styles.comMeta}>
              <span><strong>{community.member_count}</strong> members</span>
              <span>·</span>
              <span><strong>{community.post_count}</strong> posts</span>
            </div>
            {community.description && <p style={styles.comDesc}>{community.description}</p>}
          </div>

          {/* Action buttons */}
          <div style={styles.comActions}>
            {isCreator ? (
              <>
                <button
                  onClick={() => navigate(`/create?community=${slug}`)}
                  className="btn-primary"
                  style={{ padding: "9px 20px", fontSize: "14px" }}
                >
                  Create Post
                </button>
                {confirmDelete ? (
                  <div style={styles.confirmBox}>
                    <span style={{ fontSize: "13px", fontWeight: "700" }}>Delete this community?</span>
                    <button onClick={handleDelete} className="btn-danger" style={{ padding: "6px 14px", fontSize: "13px" }}>Yes, delete</button>
                    <button onClick={() => setConfirmDelete(false)} className="btn-secondary" style={{ padding: "6px 14px", fontSize: "13px" }}>Cancel</button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmDelete(true)}
                    className="btn-secondary"
                    style={{ padding: "9px 20px", fontSize: "14px" }}
                  >
                    Delete
                  </button>
                )}
              </>
            ) : (
              <>
                <button
                  onClick={handleJoin}
                  className={community.is_member ? "btn-secondary" : "btn-primary"}
                  style={{ padding: "9px 22px", fontSize: "14px" }}
                >
                  {community.is_member ? "Leave" : "Join"}
                </button>
                {community.is_member && (
                  <button
                    onClick={() => navigate(`/create?community=${slug}`)}
                    className="btn-primary"
                    style={{ padding: "9px 20px", fontSize: "14px" }}
                  >
                    Create Post
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Main layout */}
        <div style={styles.layout}>
          <div style={styles.feed}>
            {/* Sort tabs */}
            <div style={styles.tabs}>
              {["new", "hot", "top"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setOrdering(tab)}
                  className={ordering === tab ? "btn-primary" : "btn-secondary"}
                  style={{ padding: "7px 18px", fontSize: "13px" }}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            {posts.length === 0 ? (
              <div style={styles.empty}>
                <p>No posts in this community yet.</p>
                {(community.is_member || isCreator) && (
                  <button
                    onClick={() => navigate(`/create?community=${slug}`)}
                    className="btn-primary"
                    style={{ padding: "9px 20px" }}
                  >
                    Be the first to post
                  </button>
                )}
              </div>
            ) : (
              posts.map((post) => <PostCard key={post.id} post={post} />)
            )}
          </div>

          {/* Sidebar */}
          <aside>
            <div style={styles.sideCard}>
              <h3 style={styles.sideTitle}>About</h3>
              <p style={styles.sideText}>{community.description || "No description provided."}</p>
              <div style={styles.sideStat}>
                <div><strong>{community.member_count}</strong><br /><span>Members</span></div>
                <div><strong>{community.post_count}</strong><br /><span>Posts</span></div>
              </div>
              {(community.is_member || isCreator) ? (
                <button
                  onClick={() => navigate(`/create?community=${slug}`)}
                  className="btn-primary"
                  style={{ width: "100%" }}
                >
                  Create Post
                </button>
              ) : (
                <button
                  onClick={handleJoin}
                  className="btn-primary"
                  style={{ width: "100%" }}
                >
                  Join to Post
                </button>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

const styles = {
  loading: { padding: "60px", textAlign: "center", color: "#6b7280" },
  banner: { height: "180px", overflow: "hidden", position: "relative" },
  bannerPlaceholder: { width: "100%", height: "100%", background: "linear-gradient(135deg, var(--cat-discussion) 0%, var(--cat-question) 100%)" },
  backBtnBanner: { position: 'absolute', top: '20px', left: '24px', background: 'white', color: '#111827', border: 'var(--brutal-border)', boxShadow: '2px 2px 0px #000', padding: '8px 16px', borderRadius: '9999px', fontWeight: '700', cursor: 'pointer', fontSize: '13px', zIndex: 10 },
  page: { maxWidth: "1100px", margin: "0 auto", padding: "0 24px 40px" },

  comHeader: { display: "flex", alignItems: "flex-end", gap: "20px", marginTop: "-36px", marginBottom: "28px", flexWrap: "wrap" },
  iconCircle: { width: "80px", height: "80px", borderRadius: "50%", border: "4px solid white", background: "var(--accent-primary)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", boxShadow: "2px 2px 0 black" },
  iconLetter: { color: "white", fontWeight: "900", fontSize: "34px" },
  iconEditBtn: { position: "absolute", bottom: 0, right: 0, padding: "3px 8px", fontSize: "10px", fontWeight: "800", background: "white", border: "var(--brutal-border)", borderRadius: "9999px", cursor: "pointer", boxShadow: "1px 1px 0 black" },
  comInfo: { flex: 1, minWidth: "200px" },
  comName: { margin: "0 0 4px", fontSize: "24px", fontWeight: "900" },
  comMeta: { fontSize: "13px", color: "#6b7280", display: "flex", gap: "6px", marginBottom: "6px" },
  comDesc: { fontSize: "14px", color: "#374151", margin: 0 },
  comActions: { display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" },
  confirmBox: { display: "flex", gap: "8px", alignItems: "center", background: "var(--cat-news)", padding: "8px 12px", border: "var(--brutal-border)", borderRadius: "8px", boxShadow: "2px 2px 0 black" },

  layout: { display: "grid", gridTemplateColumns: "1fr 280px", gap: "28px", alignItems: "start" },
  feed: { display: "flex", flexDirection: "column", gap: "16px" },
  tabs: { display: "flex", gap: "8px", marginBottom: "4px" },
  empty: { textAlign: "center", padding: "40px 0", color: "#6b7280", display: "flex", flexDirection: "column", gap: "12px", alignItems: "center" },

  sideCard: { background: "white", border: "var(--brutal-border)", borderRadius: "12px", boxShadow: "var(--brutal-shadow)", padding: "20px", display: "flex", flexDirection: "column", gap: "14px" },
  sideTitle: { margin: 0, fontWeight: "800", fontSize: "16px" },
  sideText: { margin: 0, fontSize: "13px", color: "#374151", lineHeight: "1.6" },
  sideStat: { display: "flex", justifyContent: "space-around", textAlign: "center", fontSize: "13px", color: "#6b7280", borderTop: "1px solid #e5e7eb", borderBottom: "1px solid #e5e7eb", padding: "12px 0" },
};

export default CommunityDetail;
