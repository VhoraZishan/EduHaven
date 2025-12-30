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
    margin: "30px auto",
    padding: "0 20px",
  },
  center: {
    padding: "40px",
    textAlign: "center",
  },

  headerCard: {
    display: "flex",
    gap: "24px",
    alignItems: "center",
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
    padding: "24px",
    marginBottom: "32px",
  },
  avatar: {
    width: "96px",
    height: "96px",
    borderRadius: "50%",
    objectFit: "cover",
    border: "1px solid #e5e7eb",
  },
  username: {
    margin: 0,
    fontSize: "22px",
    fontWeight: "600",
  },
  changeAvatar: {
    display: "inline-block",
    marginTop: "8px",
    fontSize: "14px",
    color: "#4f46e5",
    cursor: "pointer",
  },

  section: {
    marginBottom: "32px",
  },
  sectionTitle: {
    fontSize: "18px",
    fontWeight: "600",
    marginBottom: "12px",
  },
  list: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
};

export default Profile;
