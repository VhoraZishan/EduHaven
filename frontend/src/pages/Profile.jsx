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

  // Load profile data
  useEffect(() => {
    if (!token) return;

    api.get("auth/me/")
      .then((res) => {
        setData(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [token]);

  // Avatar upload handler
  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("avatar", file); // MUST be "avatar"

    try {
      setUploading(true);

      await api.post("auth/me/avatar/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // Refresh profile after upload
      const res = await api.get("auth/me/");
      setData(res.data);
    } catch (err) {
      console.error("Avatar upload failed", err);
      alert("Failed to upload avatar");
    } finally {
      setUploading(false);
    }
  };

  if (!token) return <p>Please login</p>;
  if (loading) return <p>Loading...</p>;
  if (!data) return <p>Error loading profile</p>;

  return (
    <div style={styles.container}>
      {/* ===== HEADER ===== */}
      <div style={styles.header}>
        {data.profile?.avatar && (
          <img
            src={`${BACKEND_URL}${data.profile.avatar}`}
            alt="avatar"
            style={styles.avatar}
          />
        )}

        <div>
          <h2>{data.user.username}</h2>

          {/* Change avatar */}
          <label style={styles.editBtn}>
            {uploading ? "Uploading..." : "Change avatar"}
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

      {/* ===== POSTS ===== */}
      <section style={styles.section}>
        <h3>My Posts</h3>

        {data.posts.length === 0 && <p>No posts yet.</p>}

        {data.posts.map((post) => (
          <ProfilePostCard key={post.id} post={post} />
        ))}
      </section>

      {/* ===== COMMENTS ===== */}
      <section style={styles.section}>
        <h3>My Comments</h3>

        {data.comments.length === 0 && <p>No comments yet.</p>}

        {data.comments.map((comment) => (
          <ProfileCommentCard key={comment.id} comment={comment} />
        ))}
      </section>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "800px",
    margin: "30px auto",
    background: "#fff",
    padding: "24px",
    borderRadius: "8px",
  },
  header: {
    display: "flex",
    alignItems: "center",
    gap: "20px",
    marginBottom: "30px",
  },
  avatar: {
    width: "100px",
    height: "100px",
    borderRadius: "50%",
    objectFit: "cover",
    border: "1px solid #ccc",
  },
  editBtn: {
    display: "inline-block",
    marginTop: "8px",
    padding: "6px 10px",
    cursor: "pointer",
    border: "1px solid #ccc",
    borderRadius: "4px",
    fontSize: "14px",
  },
  section: {
    marginTop: "30px",
  },
};

export default Profile;
