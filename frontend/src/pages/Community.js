import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { BlogAPI } from "../api";

export default function Community() {
  const { user } = useContext(AuthContext);
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // New Post State
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    
    setIsSubmitting(true);
    try {
      const newPost = await BlogAPI.create({ title, content });
      // Prepend the new post to the feed instantly
      setBlogs([newPost, ...blogs]); 
      setTitle("");
      setContent("");
    } catch (err) {
      alert("Failed to create post.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    
    try {
      await BlogAPI.remove(id);
      setBlogs(blogs.filter(blog => blog._id !== id));
    } catch (err) {
      alert("Failed to delete post. You might not have permission.");
    }
  };

  const handleFlag = async (id) => {
    try {
      await BlogAPI.flag(id);
      alert("Post flagged for admin review. Thank you for keeping the community safe!");
    } catch (err) {
      alert("You have already flagged this post.");
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto", color: "#f3f4f6" }}>
      <h2 style={{ fontSize: "2rem", color: "#8fd081", marginBottom: "8px" }}>Community Board 🌍</h2>
      <p style={{ color: "#9ca3af", marginBottom: "24px" }}>Share tips, ask questions, and connect with other gardeners.</p>

      {/* --- CREATE POST BOX --- */}
      <form onSubmit={handleCreatePost} style={{ background: "#1f2937", padding: "20px", borderRadius: "12px", border: "1px solid #374151", marginBottom: "32px" }}>
        <input 
          type="text" 
          placeholder="Give your post a title..." 
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{ width: "100%", background: "#111827", border: "1px solid #4b5563", color: "white", padding: "12px", borderRadius: "8px", marginBottom: "12px", outline: "none" }}
        />
        <textarea 
          placeholder="What's growing on?" 
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows="4"
          style={{ width: "100%", background: "#111827", border: "1px solid #4b5563", color: "white", padding: "12px", borderRadius: "8px", marginBottom: "12px", outline: "none", resize: "vertical" }}
        />
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button type="submit" className="btn btn--primary" disabled={isSubmitting || !title || !content}>
            {isSubmitting ? "Posting..." : "Post to Community"}
          </button>
        </div>
      </form>

      {/* --- COMMUNITY FEED --- */}
      {loading ? (
        <p style={{ textAlign: "center", color: "#9ca3af" }}>Loading feed...</p>
      ) : blogs.length === 0 ? (
        <p style={{ textAlign: "center", color: "#9ca3af" }}>It's quiet here. Be the first to post!</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {blogs.map((blog) => {
            // Determine permissions
            const isAuthor = blog.author?._id === user._id;
            const isAdmin = user.role === 'admin';
            const canDelete = isAuthor || isAdmin;

            return (
              <div key={blog._id} style={{ background: "#111827", padding: "20px", borderRadius: "12px", border: "1px solid #374151" }}>
                
                {/* Header: Title & Meta */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: "1.2rem", color: "#f8fafc" }}>{blog.title}</h3>
                    <small style={{ color: "#64748b" }}>
                      By {blog.author?.email?.split('@')[0] || "Unknown User"} • {new Date(blog.createdAt).toLocaleDateString()}
                    </small>
                  </div>
                  
                  {/* Admin Flag Indicator */}
                  {isAdmin && blog.isFlagged && (
                    <span style={{ background: "rgba(239, 68, 68, 0.2)", color: "#ef4444", padding: "4px 8px", borderRadius: "4px", fontSize: "12px", fontWeight: "bold" }}>
                      🚩 Flagged
                    </span>
                  )}
                </div>

                {/* Body */}
                <p style={{ color: "#d1d5db", lineHeight: "1.6", whiteSpace: "pre-wrap", marginBottom: "16px" }}>
                  {blog.content}
                </p>

                {/* Footer Actions */}
                <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", borderTop: "1px solid #1f2937", paddingTop: "12px" }}>
                  {!canDelete && (
                    <button onClick={() => handleFlag(blog._id)} className="btn btn--ghost btn--small" style={{ color: "#9ca3af" }}>
                      🚩 Report
                    </button>
                  )}
                  {canDelete && (
                    <button onClick={() => handleDelete(blog._id)} className="btn btn--ghost btn--small" style={{ color: "#ef4444" }}>
                      🗑️ Delete
                    </button>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}