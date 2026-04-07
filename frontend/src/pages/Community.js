import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { BlogAPI } from "../api";

// Helper to convert image to Base64
const convertToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader();
    fileReader.readAsDataURL(file);
    fileReader.onload = () => resolve(fileReader.result);
    fileReader.onerror = (error) => reject(error);
  });
};

export default function Community() {
  const { user } = useContext(AuthContext);
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Tabs: 'all' or 'mine'
  const [activeTab, setActiveTab] = useState('all');

  // New Post State
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reply State (tracks which post we are typing a reply for)
  const [replyInputs, setReplyInputs] = useState({});

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      const data = await BlogAPI.list();
      setBlogs(data);
    } catch (err) {
      console.error("Failed to load community feed.");
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { // 2MB limit
      alert("Image must be smaller than 2MB");
      return;
    }
    const base64 = await convertToBase64(file);
    setImage(base64);
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    
    setIsSubmitting(true);
    try {
      const newPost = await BlogAPI.create({ title, content, image });
      setBlogs([newPost, ...blogs]); 
      setTitle("");
      setContent("");
      setImage("");
    } catch (err) {
      alert("Failed to create post.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this post?")) return;
    try {
      await BlogAPI.remove(id);
      setBlogs(blogs.filter(blog => blog._id !== id));
    } catch (err) {
      alert("Failed to delete post.");
    }
  };

  const handleReply = async (id) => {
    const text = replyInputs[id];
    if (!text || !text.trim()) return;

    try {
      const updatedBlog = await BlogAPI.reply(id, text);
      // Replace the old blog post with the updated one containing the new reply
      setBlogs(blogs.map(b => b._id === id ? updatedBlog : b));
      // Clear the input
      setReplyInputs(prev => ({ ...prev, [id]: "" }));
    } catch (err) {
      alert("Failed to send reply.");
    }
  };

  // Filter posts based on active tab
  const displayedBlogs = activeTab === 'all' 
    ? blogs 
    : blogs.filter(blog => blog.author?.email === user.email);

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto", color: "#f3f4f6" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <h2 style={{ fontSize: "2rem", color: "#8fd081", margin: 0 }}>Community 🌍</h2>
        
        {/* 🟢 TABS */}
        <div style={{ display: "flex", gap: "8px", background: "#1f2937", padding: "4px", borderRadius: "8px" }}>
          <button 
            onClick={() => setActiveTab('all')}
            style={{ padding: "8px 16px", borderRadius: "6px", border: "none", cursor: "pointer", background: activeTab === 'all' ? "#374151" : "transparent", color: activeTab === 'all' ? "white" : "#9ca3af", fontWeight: activeTab === 'all' ? "bold" : "normal" }}
          >
            Global Feed
          </button>
          <button 
            onClick={() => setActiveTab('mine')}
            style={{ padding: "8px 16px", borderRadius: "6px", border: "none", cursor: "pointer", background: activeTab === 'mine' ? "#374151" : "transparent", color: activeTab === 'mine' ? "white" : "#9ca3af", fontWeight: activeTab === 'mine' ? "bold" : "normal" }}
          >
            My Posts
          </button>
        </div>
      </div>

      {/* --- CREATE POST BOX --- */}
      <form onSubmit={handleCreatePost} style={{ background: "#1f2937", padding: "20px", borderRadius: "12px", border: "1px solid #374151", marginBottom: "32px" }}>
        <input 
          type="text" placeholder="Post Title..." value={title} onChange={(e) => setTitle(e.target.value)}
          style={{ width: "100%", background: "#111827", border: "1px solid #4b5563", color: "white", padding: "12px", borderRadius: "8px", marginBottom: "12px", outline: "none" }}
        />
        <textarea 
          placeholder="What's growing on?" value={content} onChange={(e) => setContent(e.target.value)} rows="3"
          style={{ width: "100%", background: "#111827", border: "1px solid #4b5563", color: "white", padding: "12px", borderRadius: "8px", marginBottom: "12px", outline: "none", resize: "vertical" }}
        />
        
        {image && (
          <img src={image} alt="Preview" style={{ width: "100px", height: "100px", objectFit: "cover", borderRadius: "8px", marginBottom: "12px" }} />
        )}

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <label className="btn btn--secondary btn--small" style={{ cursor: "pointer" }}>
            📷 Add Photo
            <input type="file" accept="image/*" onChange={handleImageUpload} hidden />
          </label>
          <button type="submit" className="btn btn--primary" disabled={isSubmitting || !title || !content}>
            {isSubmitting ? "Posting..." : "Post"}
          </button>
        </div>
      </form>

      {/* --- FEED --- */}
      {loading ? (
        <p style={{ textAlign: "center", color: "#9ca3af" }}>Loading feed...</p>
      ) : displayedBlogs.length === 0 ? (
        <p style={{ textAlign: "center", color: "#9ca3af" }}>No posts found.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {displayedBlogs.map((blog) => {
            const isAuthor = blog.author?._id === user._id;
            const canDelete = isAuthor || user.role === 'admin';

            return (
              <div key={blog._id} style={{ background: "#111827", padding: "20px", borderRadius: "12px", border: "1px solid #374151" }}>
                
                {/* POST HEADER */}
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: "1.2rem", color: "#f8fafc" }}>{blog.title}</h3>
                    <small style={{ color: "#64748b" }}>By {blog.author?.email?.split('@')[0]} • {new Date(blog.createdAt).toLocaleDateString()}</small>
                  </div>
                  {canDelete && (
                    <button onClick={() => handleDelete(blog._id)} style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer" }}>🗑️</button>
                  )}
                </div>

                {/* POST BODY & IMAGE */}
                <p style={{ color: "#d1d5db", lineHeight: "1.6", whiteSpace: "pre-wrap", marginBottom: "16px" }}>{blog.content}</p>
                {blog.image && (
                  <img src={blog.image} alt="Post attachment" style={{ width: "100%", maxHeight: "400px", objectFit: "cover", borderRadius: "8px", marginBottom: "16px" }} />
                )}

                {/* 🟢 REPLIES SECTION */}
                <div style={{ background: "#1f2937", borderRadius: "8px", padding: "16px" }}>
                  <h4 style={{ margin: "0 0 12px 0", fontSize: "14px", color: "#9ca3af" }}>Replies ({blog.replies?.length || 0})</h4>
                  
                  {blog.replies?.map(reply => (
                    <div key={reply._id} style={{ marginBottom: "12px", paddingBottom: "12px", borderBottom: "1px dashed #374151" }}>
                      <strong style={{ color: "#8fd081", fontSize: "12px" }}>{reply.author?.email?.split('@')[0]}</strong>
                      <span style={{ color: "#64748b", fontSize: "10px", marginLeft: "8px" }}>{new Date(reply.createdAt).toLocaleDateString()}</span>
                      <p style={{ margin: "4px 0 0 0", fontSize: "14px", color: "#d1d5db" }}>{reply.text}</p>
                    </div>
                  ))}

                  {/* Reply Input */}
                  <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
                    <input 
                      type="text" 
                      placeholder="Write a reply..." 
                      value={replyInputs[blog._id] || ""}
                      onChange={(e) => setReplyInputs(prev => ({ ...prev, [blog._id]: e.target.value }))}
                      style={{ flex: 1, background: "#111827", border: "1px solid #4b5563", color: "white", padding: "8px 12px", borderRadius: "6px", outline: "none" }}
                    />
                    <button onClick={() => handleReply(blog._id)} className="btn btn--primary btn--small">Reply</button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}