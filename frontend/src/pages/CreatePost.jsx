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
  page: { minHeight: "calc(100vh - 70px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 20px" },
  card: { width: "100%", maxWidth: "700px", background: "#ffffff", border: "var(--brutal-border)", boxShadow: "var(--brutal-shadow)", borderRadius: "12px", padding: "32px" },
  title: { margin: 0, fontSize: "28px", fontWeight: "800", letterSpacing: "-0.5px" },
  subtitle: { marginTop: "6px", marginBottom: "24px", fontSize: "15px", color: "#4b5563", fontWeight: "500" },
  error: { background: "var(--cat-news)", color: "#9f1239", padding: "12px", borderRadius: "6px", fontSize: "14px", marginBottom: "16px", border: "var(--brutal-border)", boxShadow: "2px 2px 0px #000", fontWeight: "600" },
  form: { display: "flex", flexDirection: "column", gap: "16px" },
  input: { padding: "12px", fontSize: "15px", borderRadius: "8px", border: "var(--brutal-border)", boxShadow: "2px 2px 0px rgba(0,0,0,1)", appearance: "auto", fontWeight: "500" },
  quillWrapper: { background: "white", border: "var(--brutal-border)", boxShadow: "2px 2px 0px rgba(0,0,0,1)", borderRadius: "8px" },
  mediaContainer: { display: 'flex', flexDirection: 'column', gap: '10px' },
  mediaToolbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--cat-meme)', padding: '10px 14px', borderRadius: '8px', border: 'var(--brutal-border)' },
  toolbarLeft: { display: 'flex', gap: '16px' },
  iconBtn: { background: 'white', border: 'var(--brutal-border)', color: '#000', display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 10px', borderRadius: '4px', transition: 'transform 0.1s ease', boxShadow: "2px 2px 0px #000", fontWeight: "700" },
  previewArea: { display: 'flex', flexWrap: 'wrap', gap: '10px', fontSize: '13px', color: '#000', padding: '0 8px', fontWeight: "600" },
  badge: { background: 'var(--cat-discussion)', color: '#000', padding: '4px 10px', borderRadius: '12px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '6px', border: "var(--brutal-border)" },
  clearBadge: { cursor: 'pointer', background: '#000', color: "white", borderRadius: '50%', width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' },
  submitButton: { marginTop: "16px", padding: "14px", fontSize: "16px", fontWeight: "800", background: "var(--accent-primary)", color: "#ffffff", border: "var(--brutal-border)", boxShadow: "var(--brutal-shadow)", borderRadius: "9999px", cursor: "pointer", textTransform: "uppercase" },
};

export default CreatePost;
