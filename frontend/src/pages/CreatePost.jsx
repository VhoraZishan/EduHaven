import { useState, useContext, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { createPost } from "../api/posts";
import { getCommunities } from "../api/communities";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import { ImageIcon, VideoIcon } from "../components/Icons";

function CreatePost() {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const presetSlug = searchParams.get("community") || "";

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [postType, setPostType] = useState("standard");
  // Store the community ID directly — avoids any slug→id lookup issues at submit time
  const [communityId, setCommunityId] = useState("");
  const [communities, setCommunities] = useState([]);
  const [images, setImages] = useState([]);
  const [video, setVideo] = useState(null);
  const [link, setLink] = useState("");
  const [pollOptions, setPollOptions] = useState(["", ""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const imageInputRef = useRef(null);
  const videoInputRef = useRef(null);

  // Redirect guests
  useEffect(() => {
    if (!token) navigate("/login");
  }, [token, navigate]);

  // Load communities, then pre-select if ?community= was in URL
  useEffect(() => {
    getCommunities()
      .then((r) => {
        setCommunities(r.data);
        if (presetSlug) {
          const match = r.data.find((c) => c.slug === presetSlug);
          if (match) setCommunityId(String(match.id));
        }
      })
      .catch(() => {});
  }, [presetSlug]);

  const handleImageSelect = (e) => {
    if (e.target.files) {
      setImages(Array.from(e.target.files));
      setVideo(null);
    }
  };

  const handleVideoSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      setVideo(e.target.files[0]);
      setImages([]);
    }
  };

  const removeImage = (indexToRemove) => {
    setImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
    if (images.length === 1 && imageInputRef.current) {
      imageInputRef.current.value = "";
    }
  };

  const removeVideo = () => {
    setVideo(null);
    if (videoInputRef.current) videoInputRef.current.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("title", title);
      formData.append("body", body);
      formData.append("post_type", postType);
      if (communityId) formData.append("community", communityId);

      if (postType === "article") {
        if (!link.trim()) {
          setError("Article posts require a link.");
          setLoading(false);
          return;
        }
        formData.append("link", link.trim());
      }

      if (postType === "poll") {
        const activeOptions = pollOptions.filter(o => o.trim() !== "");
        if (activeOptions.length < 2) {
          setError("A poll requires at least 2 options.");
          setLoading(false);
          return;
        }
        activeOptions.forEach((opt) => formData.append("options", opt));
      }

      images.forEach((img) => formData.append("images", img));
      if (video) formData.append("video", video);

      const res = await createPost(formData);
      navigate(`/posts/${res.data.id}`);
    } catch (err) {
      console.error("CREATE POST ERROR:", err.response || err);
      setError(
        err.response?.data?.detail ||
          JSON.stringify(err.response?.data) ||
          "Failed to create post"
      );
    } finally {
      setLoading(false);
    }
  };

  if (!token) return null;

  return (
    <div style={styles.page}>
      <div style={{ width: '100%', maxWidth: '700px', display: 'flex', flexDirection: 'column' }}>
        <button onClick={() => navigate(-1)} style={styles.backBtn}>
          ← Back
        </button>
        <div style={styles.card}>
        <h1 style={styles.heading}>Create a new post</h1>
        <p style={styles.subtitle}>Share something with the EduHaven community</p>

        {error && <div style={styles.errorBox}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          {/* Row: post type + community */}
          <div style={styles.row}>
            <select
              value={postType}
              onChange={(e) => {
                setPostType(e.target.value);
                setError("");
              }}
              style={styles.select}
            >
              <option value="standard">Standard Post</option>
              <option value="question">Question</option>
              <option value="article">Article</option>
              <option value="poll">Poll</option>
            </select>

            <select
              value={communityId}
              onChange={(e) => setCommunityId(e.target.value)}
              style={styles.select}
            >
              <option value="">Global (no community)</option>
              {communities.map((c) => (
                <option key={c.id} value={String(c.id)}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <input
            style={styles.input}
            placeholder="Post title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          {postType === "article" && (
            <input
              style={styles.input}
              placeholder="Article Link (URL, e.g. https://example.com)"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              required
            />
          )}

          {postType === "poll" && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', background: '#f9fafb', padding: '16px', border: 'var(--brutal-border)', borderRadius: '8px', boxShadow: '2px 2px 0px #000' }}>
              <span style={{ fontWeight: '800', fontSize: '14px' }}>Poll Options (2 to 10 options):</span>
              {pollOptions.map((option, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input
                    style={{ ...styles.input, flex: 1, padding: '8px 12px' }}
                    placeholder={`Option ${idx + 1}`}
                    value={option}
                    onChange={(e) => {
                      const updated = [...pollOptions];
                      updated[idx] = e.target.value;
                      setPollOptions(updated);
                    }}
                    required={idx < 2}
                  />
                  {pollOptions.length > 2 && (
                    <button
                      type="button"
                      onClick={() => setPollOptions(pollOptions.filter((_, i) => i !== idx))}
                      style={{ background: '#fee2e2', color: '#dc2626', border: 'var(--brutal-border)', boxShadow: '1px 1px 0 #000', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
              {pollOptions.length < 10 && (
                <button
                  type="button"
                  onClick={() => setPollOptions([...pollOptions, ""])}
                  style={{ background: '#dcfce7', color: '#166534', border: 'var(--brutal-border)', boxShadow: '1px 1px 0 #000', padding: '8px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px', marginTop: '4px' }}
                >
                  + Add Option
                </button>
              )}
            </div>
          )}

          <div style={styles.quillWrapper}>
            <ReactQuill
              theme="snow"
              value={body}
              onChange={setBody}
              placeholder="Write your post..."
              style={{ height: "200px", marginBottom: "40px" }}
            />
          </div>

          {/* Media toolbar */}
          <div style={styles.mediaToolbar}>
            <button
              type="button"
              onClick={() => imageInputRef.current?.click()}
              style={{ ...styles.mediaBtn, opacity: video ? 0.4 : 1, cursor: video ? "not-allowed" : "pointer" }}
              disabled={!!video}
            >
              <ImageIcon />
              <span>Add Images</span>
            </button>
            <input type="file" ref={imageInputRef} accept="image/*" multiple onChange={handleImageSelect} style={{ display: "none" }} />

            <button
              type="button"
              onClick={() => videoInputRef.current?.click()}
              style={{ ...styles.mediaBtn, opacity: images.length > 0 ? 0.4 : 1, cursor: images.length > 0 ? "not-allowed" : "pointer" }}
              disabled={images.length > 0}
            >
              <VideoIcon />
              <span>Add Video</span>
            </button>
            <input type="file" ref={videoInputRef} accept="video/*" onChange={handleVideoSelect} style={{ display: "none" }} />
          </div>

          {/* Selected file badges */}
          {(images.length > 0 || video) && (
            <div style={styles.previewArea}>
              {images.map((img, idx) => (
                <span key={idx} style={styles.badge}>
                  {img.name.length > 22 ? img.name.slice(0, 22) + "…" : img.name}
                  <span onClick={() => removeImage(idx)} style={styles.badgeX}>&times;</span>
                </span>
              ))}
              {video && (
                <span style={styles.badge}>
                  {video.name.length > 22 ? video.name.slice(0, 22) + "…" : video.name}
                  <span onClick={removeVideo} style={styles.badgeX}>&times;</span>
                </span>
              )}
            </div>
          )}

          <button style={styles.submitBtn} type="submit" disabled={loading}>
            {loading ? "Publishing..." : "Publish Post"}
          </button>
        </form>
      </div>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: "calc(100vh - 64px)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 20px" },
  card: { width: "100%", background: "#ffffff", border: "var(--brutal-border)", boxShadow: "var(--brutal-shadow)", borderRadius: "12px", padding: "32px" },
  backBtn: { alignSelf: 'flex-start', marginBottom: '20px', background: 'white', color: '#111827', border: 'var(--brutal-border)', boxShadow: '2px 2px 0px #000', padding: '8px 16px', borderRadius: '9999px', fontWeight: '700', cursor: 'pointer', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '6px' },
  heading: { margin: 0, fontSize: "26px", fontWeight: "800", letterSpacing: "-0.5px" },
  subtitle: { marginTop: "6px", marginBottom: "24px", fontSize: "14px", color: "#4b5563", fontWeight: "500" },
  errorBox: { background: "var(--cat-news)", color: "#9f1239", padding: "12px", borderRadius: "6px", fontSize: "14px", marginBottom: "16px", border: "var(--brutal-border)", boxShadow: "2px 2px 0 #000", fontWeight: "600" },
  form: { display: "flex", flexDirection: "column", gap: "16px" },
  row: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" },
  select: { padding: "11px 12px", fontSize: "14px", border: "var(--brutal-border)", boxShadow: "2px 2px 0 #000", borderRadius: "8px", fontFamily: "inherit", fontWeight: "600", background: "white", appearance: "auto" },
  input: { padding: "12px", fontSize: "15px", borderRadius: "8px", border: "var(--brutal-border)", boxShadow: "2px 2px 0 #000", fontWeight: "500", background: "white" },
  quillWrapper: { background: "white", border: "var(--brutal-border)", boxShadow: "2px 2px 0 #000", borderRadius: "8px" },
  mediaToolbar: { display: "flex", gap: "12px", background: "var(--cat-meme)", padding: "10px 14px", borderRadius: "8px", border: "var(--brutal-border)" },
  mediaBtn: { background: "white", border: "var(--brutal-border)", color: "#000", display: "flex", alignItems: "center", gap: "6px", padding: "6px 12px", borderRadius: "6px", boxShadow: "2px 2px 0 #000", fontWeight: "700", fontSize: "13px" },
  previewArea: { display: "flex", flexWrap: "wrap", gap: "10px", fontSize: "13px" },
  badge: { background: "var(--cat-discussion)", color: "#000", padding: "4px 10px", borderRadius: "12px", fontWeight: "700", display: "flex", alignItems: "center", gap: "6px", border: "var(--brutal-border)" },
  badgeX: { cursor: "pointer", background: "#000", color: "white", borderRadius: "50%", width: "16px", height: "16px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: "11px" },
  submitBtn: { marginTop: "8px", padding: "14px", fontSize: "15px", fontWeight: "800", background: "var(--accent-primary)", color: "#fff", border: "var(--brutal-border)", boxShadow: "var(--brutal-shadow)", borderRadius: "9999px", cursor: "pointer", textTransform: "uppercase", letterSpacing: "0.05em" },
};

export default CreatePost;
