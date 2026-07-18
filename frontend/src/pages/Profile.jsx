import { useEffect, useState, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api, { BACKEND_URL } from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import ProfilePostCard from "../components/ProfilePostCard";
import ProfileCommentCard from "../components/ProfileCommentCard";

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

function Profile() {
  const { token, me } = useContext(AuthContext);
  const { userId } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showAllPosts, setShowAllPosts] = useState(false);
  const [showAllComments, setShowAllComments] = useState(false);

  const isOwnProfile = !userId || (me && me.id === parseInt(userId));

  useEffect(() => {
    setLoading(true);
    const endpoint = isOwnProfile ? "auth/me/" : `auth/users/${userId}/`;

    api.get(endpoint)
      .then((res) => {
        setData(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [token, userId, isOwnProfile]);

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("avatar", file);

    try {
      setUploading(true);
      await api.post("auth/me/avatar/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const res = await api.get("auth/me/");
      setData(res.data);
    } finally {
      setUploading(false);
    }
  };

  const handleRoleChange = async (e) => {
    const newRole = e.target.value;
    try {
      const res = await api.put("auth/me/", { role: newRole });
      setData((prev) => ({
        ...prev,
        profile: res.data.profile
      }));
    } catch {
      alert("Failed to update role");
    }
  };

  if (isOwnProfile && !token) return <p style={styles.center}>Please login</p>;
  if (loading) return <p style={styles.center}>Loading profile…</p>;
  if (!data) return <p style={styles.center}>Error loading profile</p>;

  return (
    <div style={styles.page}>
      <button onClick={() => navigate(-1)} style={styles.backBtn}>
        ← Back
      </button>
      {/* Header */}
      <div style={styles.headerCard}>
        <img
          src={`${BACKEND_URL}${data.profile.avatar}`}
          alt="avatar"
          style={styles.avatar}
        />

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={styles.username}>{data.user.username}</h1>
            {data.profile.role && (!isOwnProfile || data.profile.role === 'admin' || data.profile.role === 'moderator') && (
              <span style={styles.roleBadge}>
                {formatRole(data.profile.role)}
              </span>
            )}
          </div>

          {isOwnProfile && (
            <label style={styles.changeAvatar}>
              {uploading ? "Uploading…" : "Change avatar"}
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                style={{ display: "none" }}
                disabled={uploading}
              />
            </label>
          )}

          {isOwnProfile && (!data.profile.role || (data.profile.role !== 'admin' && data.profile.role !== 'moderator')) ? (
            <div style={{ marginTop: "12px", display: "flex", flexDirection: "column", gap: "4px" }}>
              <label style={{ fontSize: "11px", fontWeight: "800", textTransform: "uppercase", color: "#6b7280" }}>
                Primary Role
              </label>
              <select
                value={data.profile.role || "student"}
                onChange={handleRoleChange}
                style={styles.select}
              >
                <option value="student">Student</option>
                <option value="educator">Educator</option>
                <option value="researcher">Researcher</option>
                <option value="professional">Professional</option>
                <option value="self_learner">Self-Learner</option>
              </select>
            </div>
          ) : null}
        </div>
      </div>

      {/* Posts */}
      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>
          {isOwnProfile ? "My Posts" : `${data.user.username}'s Posts`}
        </h2>

        {data.posts.length === 0 && <p>No posts yet.</p>}

        <div style={styles.list}>
          {(showAllPosts ? data.posts : data.posts.slice(0, 10)).map((post) => (
            <ProfilePostCard key={post.id} post={post} />
          ))}
        </div>

        {data.posts.length > 10 && (
          <button
            onClick={() => setShowAllPosts(!showAllPosts)}
            style={styles.showMoreBtn}
          >
            {showAllPosts ? "Show Less ↑" : `Show More (${data.posts.length - 10} more) ↓`}
          </button>
        )}
      </section>

      {/* Comments */}
      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>
          {isOwnProfile ? "My Comments" : `${data.user.username}'s Comments`}
        </h2>

        {data.comments.length === 0 && <p>No comments yet.</p>}

        <div style={styles.list}>
          {(showAllComments ? data.comments : data.comments.slice(0, 10)).map((comment) => (
            <ProfileCommentCard key={comment.id} comment={comment} />
          ))}
        </div>

        {data.comments.length > 10 && (
          <button
            onClick={() => setShowAllComments(!showAllComments)}
            style={styles.showMoreBtn}
          >
            {showAllComments ? "Show Less ↑" : `Show More (${data.comments.length - 10} more) ↓`}
          </button>
        )}
      </section>
    </div>
  );
}

const styles = {
  page: {
    maxWidth: "900px",
    margin: "40px auto",
    padding: "0 20px",
  },
  center: {
    padding: "60px",
    textAlign: "center",
    fontWeight: "700",
    fontSize: "18px",
  },
  headerCard: {
    display: "flex",
    gap: "32px",
    alignItems: "center",
    background: "#ffffff",
    border: "var(--brutal-border)",
    boxShadow: "var(--brutal-shadow)",
    borderRadius: "12px",
    padding: "32px",
    marginBottom: "40px",
  },
  avatar: {
    width: "110px",
    height: "110px",
    borderRadius: "50%",
    objectFit: "cover",
    border: "var(--brutal-border)",
    boxShadow: "2px 2px 0px #000",
  },
  username: {
    margin: 0,
    fontSize: "32px",
    fontWeight: "800",
    letterSpacing: "-0.5px",
  },
  changeAvatar: {
    display: "inline-block",
    marginTop: "12px",
    fontSize: "14px",
    fontWeight: "800",
    color: "#fff",
    background: "var(--accent-primary)",
    padding: "6px 12px",
    borderRadius: "9999px",
    cursor: "pointer",
    border: "var(--brutal-border)",
    boxShadow: "2px 2px 0px #000",
  },
  section: {
    marginBottom: "40px",
  },
  sectionTitle: {
    fontSize: "24px",
    fontWeight: "800",
    marginBottom: "16px",
    letterSpacing: "-0.5px",
    textTransform: "uppercase",
  },
  list: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  backBtn: { marginBottom: '20px', background: 'white', color: '#111827', border: 'var(--brutal-border)', boxShadow: '2px 2px 0px #000', padding: '8px 16px', borderRadius: '9999px', fontWeight: '700', cursor: 'pointer', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '6px' },
  roleBadge: {
    background: '#fef3c7',
    border: 'var(--brutal-border)',
    color: '#000',
    padding: '4px 10px',
    borderRadius: '9999px',
    fontSize: '12px',
    fontWeight: '800',
    boxShadow: '1px 1px 0px #000'
  },
  select: {
    padding: '8px 12px',
    fontSize: '13px',
    fontFamily: 'inherit',
    fontWeight: '700',
    background: 'white',
    border: 'var(--brutal-border)',
    boxShadow: '2px 2px 0px #000',
    borderRadius: '8px',
    width: 'auto',
    cursor: 'pointer'
  },
  showMoreBtn: {
    display: "block",
    margin: "16px auto 0",
    background: "white",
    color: "#000",
    border: "var(--brutal-border)",
    boxShadow: "2px 2px 0px #000",
    padding: "8px 16px",
    borderRadius: "8px",
    fontWeight: "700",
    cursor: "pointer",
    fontSize: "14px",
    textAlign: "center",
  },
};

export default Profile;
