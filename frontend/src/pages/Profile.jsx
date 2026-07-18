import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import api, { BACKEND_URL } from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import ProfilePostCard from "../components/ProfilePostCard";
import ProfileCommentCard from "../components/ProfileCommentCard";

function Profile() {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!token) return;

    api.get("auth/me/")
      .then((res) => {
        setData(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [token]);

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

  if (!token) return <p style={styles.center}>Please login</p>;
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
            {data.profile.role && (data.profile.role === 'admin' || data.profile.role === 'moderator') && (
              <span style={styles.roleBadge}>
                {data.profile.role === 'admin' ? 'Admin' : 'Moderator'}
              </span>
            )}
          </div>

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

          {(!data.profile.role || (data.profile.role !== 'admin' && data.profile.role !== 'moderator')) ? (
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
        <h2 style={styles.sectionTitle}>My Posts</h2>

        {data.posts.length === 0 && <p>No posts yet.</p>}

        <div style={styles.list}>
          {data.posts.map((post) => (
            <ProfilePostCard key={post.id} post={post} />
          ))}
        </div>
      </section>

      {/* Comments */}
      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>My Comments</h2>

        {data.comments.length === 0 && <p>No comments yet.</p>}

        <div style={styles.list}>
          {data.comments.map((comment) => (
            <ProfileCommentCard key={comment.id} comment={comment} />
          ))}
        </div>
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
};

export default Profile;
