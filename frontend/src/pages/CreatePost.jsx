import { useState, useContext, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { createPost } from "../api/posts";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import { ImageIcon, VideoIcon } from "../components/Icons";

function CreatePost() {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [postType, setPostType] = useState("standard");
  const [images, setImages] = useState([]);
  const [video, setVideo] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const imageInputRef = useRef(null);
  const videoInputRef = useRef(null);

  // 🔐 Redirect guests properly
  useEffect(() => {
    if (!token) {
      navigate("/login");
    }
  }, [token, navigate]);

  const handleImageSelect = (e) => {
    if (e.target.files) {
      setImages(Array.from(e.target.files));
      setVideo(null); // Clear video if images selected
    }
  };

  const handleVideoSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      setVideo(e.target.files[0]);
      setImages([]); // Clear images if video selected
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
      
      images.forEach(img => formData.append("images", img));
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
      <div style={styles.card}>
        <h1 style={styles.title}>Create a new post</h1>
        <p style={styles.subtitle}>
          Share something with the EduHaven community
        </p>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <select 
            value={postType} 
            onChange={(e) => setPostType(e.target.value)}
            style={styles.input}
          >
            <option value="standard">Standard Post</option>
            <option value="question">Question</option>
            <option value="article">Article</option>
          </select>

          <input
            style={styles.input}
            placeholder="Post title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <div style={styles.quillWrapper}>
             <ReactQuill theme="snow" value={body} onChange={setBody} placeholder="Write your post..." style={{height: '200px', marginBottom: '40px'}}/>
          </div>
          
          <div style={styles.mediaContainer}>
            <div style={styles.mediaToolbar}>
               <div style={styles.toolbarLeft}>
                 <button 
                   type="button" 
                   onClick={() => imageInputRef.current?.click()} 
                   style={{...styles.iconBtn, opacity: video ? 0.4 : 1, cursor: video ? 'not-allowed' : 'pointer'}}
                   disabled={!!video}
                 >
                   <ImageIcon /> <span style={{fontSize: '14px'}}>Add Images</span>
                 </button>
                 <input type="file" ref={imageInputRef} accept="image/*" multiple onChange={handleImageSelect} style={{display: 'none'}} />

                 <button 
                   type="button" 
                   onClick={() => videoInputRef.current?.click()} 
                   style={{...styles.iconBtn, opacity: images.length > 0 ? 0.4 : 1, cursor: images.length > 0 ? 'not-allowed' : 'pointer'}}
                   disabled={images.length > 0}
                 >
                   <VideoIcon /> <span style={{fontSize: '14px'}}>Add Video</span>
                 </button>
                 <input type="file" ref={videoInputRef} accept="video/*" onChange={handleVideoSelect} style={{display: 'none'}} />
               </div>
            </div>
            
            {(images.length > 0 || video) && (
               <div style={styles.previewArea}>
                  {images.map((img, idx) => (
                    <span key={idx} style={styles.badge}>
                      {img.name.length > 20 ? img.name.slice(0, 20) + "..." : img.name}
                      <span onClick={() => removeImage(idx)} style={styles.clearBadge}>&times;</span>
                    </span>
                  ))}
                  {video && (
                    <span style={styles.badge}>
                      {video.name.length > 20 ? video.name.slice(0, 20) + "..." : video.name}
                      <span onClick={removeVideo} style={styles.clearBadge}>&times;</span>
                    </span>
                  )}
               </div>
            )}
          </div>

          <button style={styles.submitButton} type="submit" disabled={loading}>
            {loading ? "Posting…" : "Publish post"}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: "calc(100vh - 64px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 20px" },
  card: { width: "100%", maxWidth: "700px", background: "#ffffff", border: "1px solid #e5e7eb", borderRadius: "12px", padding: "32px" },
  title: { margin: 0, fontSize: "24px", fontWeight: "600" },
  subtitle: { marginTop: "6px", marginBottom: "24px", fontSize: "14px", color: "#6b7280" },
  error: { background: "#fee2e2", color: "#b91c1c", padding: "10px", borderRadius: "6px", fontSize: "14px", marginBottom: "16px" },
  form: { display: "flex", flexDirection: "column", gap: "16px" },
  input: { padding: "12px", fontSize: "15px", borderRadius: "8px", border: "1px solid #d1d5db", appearance: "auto" },
  quillWrapper: { background: 'white' },
  mediaContainer: { display: 'flex', flexDirection: 'column', gap: '10px' },
  mediaToolbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f9fafb', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e5e7eb' },
  toolbarLeft: { display: 'flex', gap: '16px' },
  iconBtn: { background: 'none', border: 'none', color: '#4b5563', display: 'flex', alignItems: 'center', gap: '6px', padding: '4px', borderRadius: '4px', transition: 'all 0.2s' },
  previewArea: { display: 'flex', flexWrap: 'wrap', gap: '10px', fontSize: '13px', color: '#6b7280', padding: '0 8px' },
  badge: { background: '#e0e7ff', color: '#4338ca', padding: '4px 8px', borderRadius: '12px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '6px' },
  clearBadge: { cursor: 'pointer', background: '#c7d2fe', borderRadius: '50%', width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' },
  submitButton: { marginTop: "10px", padding: "12px", fontSize: "16px", fontWeight: "600", background: "#4f46e5", color: "#ffffff", border: "none", borderRadius: "8px", cursor: "pointer" },
};

export default CreatePost;
