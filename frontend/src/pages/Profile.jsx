import { useEffect, useState, useContext } from "react";
import api, { BACKEND_URL } from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import ProfilePostCard from "../components/ProfilePostCard";
import ProfileCommentCard from "../components/ProfileCommentCard";

function Profile() {
  const { token } = useContext(AuthContext);

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

  if (!token) return <p style={styles.center}>Please login</p>;
  if (loading) return <p style={styles.center}>Loading profile…</p>;
  if (!data) return <p style={styles.center}>Error loading profile</p>;

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.headerCard}>
        <img
          src={`${BACKEND_URL}${data.profile.avatar}`}
          alt="avatar"
          style={styles.avatar}
        />

        <div>
          <h1 style={styles.username}>{data.user.username}</h1>

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
};

export default Profile;
