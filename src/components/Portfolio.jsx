"use client";
import { useState, useEffect } from "react";
import "./Portfolio.css";

const categories = ["All", "Logo", "Branding", "Poster", "UI/UX", "Social Media", "Illustration", "Other"];

const sampleProjects = [
  {
    id: "sample-1",
    title: "Creative Brand Identity",
    category: "Branding",
    author: "Rony_Clicks",
    isOwnProject: true,
    image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=60",
    description: "A modern, minimalist brand identity package designed for a tech startup.",
    likes: 14,
    comments: ["Amazing color choices!", "Super clean typography!"]
  },
  {
    id: "sample-2",
    title: "Neon Poster Design",
    category: "Poster",
    author: "DesignQuest Creator",
    isOwnProject: false,
    image: "https://images.unsplash.com/photo-1563089145-599997674d42?w=600&auto=format&fit=crop&q=60",
    description: "A cyberpunk-inspired vibrant poster featuring high-contrast neon lighting and custom typography.",
    likes: 22,
    comments: ["Love the cyberpunk vibe!"]
  }
];

function compressImage(file, maxWidth = 1200, quality = 0.75) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxWidth / img.width);
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = reject;
      img.src = event.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function mapDbItemToProject(item, fallbackAuthor = "Rony_Clicks", fallbackDesc = "No description provided.", isOwnProject = true) {
  return {
    id: item.id,
    title: item.title,
    category: item.category || "Other",
    author: fallbackAuthor,
    isOwnProject,
    image: item.imageData || sampleProjects[0].image,
    description: fallbackDesc,
    likes: 0,
    comments: []
  };
}

export default function Portfolio() {
  const [activeTab, setActiveTab] = useState("personal");
  const [projects, setProjects] = useState(sampleProjects);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [currentUsername, setCurrentUsername] = useState("Rony_Clicks");

  const getDisplayAuthor = (proj) => {
    if (!proj) return currentUsername;
    return proj.isOwnProject ? currentUsername : proj.author;
  };

  useEffect(() => {
    const syncUsername = () => {
      const savedName = window.localStorage.getItem("designquest-username");
      if (savedName && savedName.trim()) {
        setCurrentUsername(savedName.trim());
      }
    };

    syncUsername();
    window.addEventListener("storage", syncUsername);
    window.addEventListener("designquest-username-updated", syncUsername);

    return () => {
      window.removeEventListener("storage", syncUsername);
      window.removeEventListener("designquest-username-updated", syncUsername);
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    const savedName = window.localStorage.getItem("designquest-username");
    const activeName = savedName && savedName.trim() ? savedName.trim() : "Rony_Clicks";

    async function loadPortfolio() {
      const saved = window.localStorage.getItem("designquest-projects");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0 && isMounted) {
            setProjects(parsed);
          }
        } catch (e) {
          console.error("Failed to parse saved projects:", e);
        }
      }

      try {
        const res = await fetch("/api/portfolio", { cache: "no-store" });
        if (!res.ok) return;
        const dbItems = await res.json();
        if (!Array.isArray(dbItems) || dbItems.length === 0 || !isMounted) return;

        const mappedDb = dbItems.map((item) =>
          mapDbItemToProject(item, activeName, "No description provided.", true)
        );
        setProjects((prev) => {
          const existingIds = new Set(mappedDb.map((p) => String(p.id)));
          const localExtras = prev.filter((p) => !existingIds.has(String(p.id)));
          return [...mappedDb, ...localExtras];
        });
      } catch (err) {
        console.error("Failed to fetch /api/portfolio:", err);
      }
    }

    loadPortfolio();
    return () => {
      isMounted = false;
    };
  }, []);

  const [category, setCategory] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [projCategory, setProjCategory] = useState("Logo");
  const [imageFile, setImageFile] = useState(null);
  const [newComment, setNewComment] = useState("");

  useEffect(() => {
    try {
      window.localStorage.setItem("designquest-projects", JSON.stringify(projects));
    } catch (e) {
      console.warn("Could not save projects to localStorage:", e);
    }
  }, [projects]);

  const handleImageChange = async (e) => {
    setUploadError("");
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const compressed = await compressImage(file);
      setImageFile(compressed);
    } catch (err) {
      console.error("Error compressing image:", err);
      setUploadError("Could not process that image. Please try another file.");
    }
  };

  const handleAddProject = async (e) => {
    e.preventDefault();
    if (!title.trim() || !imageFile || isSubmitting) return;

    setIsSubmitting(true);
    setUploadError("");

    const savedName = window.localStorage.getItem("designquest-username");
    const currentAuthor = savedName && savedName.trim() ? savedName.trim() : currentUsername;
    const finalDesc = desc.trim() || "No description provided.";

    try {
      const res = await fetch("/api/portfolio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          category: projCategory,
          imageData: imageFile,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Upload failed (${res.status})`);
      }

      const createdItem = await res.json();
      const newProj = {
        ...mapDbItemToProject(createdItem, currentAuthor, finalDesc, true),
        author: currentAuthor,
        isOwnProject: true,
      };

      setProjects((prev) => [newProj, ...prev]);
      setTitle("");
      setDesc("");
      setImageFile(null);
      setShowForm(false);
    } catch (err) {
      console.error("POST /api/portfolio failed:", err);
      setUploadError(err.message || "Failed to save project to server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLike = (id, e) => {
    e.stopPropagation();
    setProjects(prev => prev.map(p => p.id === id ? { ...p, likes: p.likes + 1 } : p));
    if (selectedProject && selectedProject.id === id) {
      setSelectedProject(prev => ({ ...prev, likes: prev.likes + 1 }));
    }
  };

  const handleAddComment = (e) => {
    e.preventDefault();
    if (!newComment.trim() || !selectedProject) return;

    const updatedComments = [...selectedProject.comments, newComment];
    setProjects(prev => prev.map(p => p.id === selectedProject.id ? { ...p, comments: updatedComments } : p));
    setSelectedProject(prev => ({ ...prev, comments: updatedComments }));
    setNewComment("");
  };

  const filteredProjects = category === "All" ? projects : projects.filter(p => p.category === category);

  return (
    <div className="portfolio-container">
      <div className="portfolio-header">
        <h2>🎨 DesignQuest Portfolios & Community</h2>
        <p>Explore creative works, upvote designs, and leave feedback for fellow creators!</p>
        
        <div className="portfolio-tabs">
          <button className={`tab-btn ${activeTab === "personal" ? "active" : ""}`} onClick={() => setActiveTab("personal")}>
            👤 Personal Portfolio
          </button>
          <button className={`tab-btn ${activeTab === "community" ? "active" : ""}`} onClick={() => setActiveTab("community")}>
            🌍 Community Gallery
          </button>
        </div>
      </div>

      <div className="portfolio-actions">
        <div className="category-filters">
          {categories.map((cat) => (
            <button key={cat} className={`cat-btn ${category === cat ? "active" : ""}`} onClick={() => setCategory(cat)}>
              {cat}
            </button>
          ))}
        </div>
        <button className="add-project-btn" onClick={() => setShowForm(!showForm)}>
          {showForm ? "✕ Close Form" : "+ Add New Project"}
        </button>
      </div>

      {showForm && (
        <form className="project-form" onSubmit={handleAddProject}>
          <h3>Upload New Design Project</h3>
          {uploadError && <p style={{ color: "#ff7b7b", fontSize: "13px" }}>{uploadError}</p>}
          <input type="text" placeholder="Project Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
          <select value={projCategory} onChange={(e) => setProjCategory(e.target.value)}>
            {categories.filter(c => c !== "All").map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <textarea placeholder="Project Description..." value={desc} onChange={(e) => setDesc(e.target.value)} />
          <input type="file" accept="image/*" onChange={handleImageChange} required />
          {imageFile && <img src={imageFile} alt="Preview" className="image-preview" />}
          <button type="submit" className="submit-btn" disabled={isSubmitting}>
            {isSubmitting ? "Publishing..." : "Publish Project"}
          </button>
        </form>
      )}

      <div className="projects-grid">
        {filteredProjects.length === 0 ? (
          <p className="no-projects">No projects found in this category.</p>
        ) : (
          filteredProjects.map((proj) => (
            <div key={proj.id} className="project-card" onClick={() => setSelectedProject(proj)}>
              <img src={proj.image} alt={proj.title} />
              <div className="project-info">
                <span className="project-category">{proj.category}</span>
                <h4>{proj.title}</h4>
                <p className="project-author">By {getDisplayAuthor(proj)}</p>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "10px" }}>
                  <button className="like-btn" onClick={(e) => handleLike(proj.id, e)}>
                    ❤️ {proj.likes}
                  </button>
                  <small style={{ color: "#aaa8bc" }}>💬 {proj.comments.length} comments</small>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {selectedProject && (
        <div className="modal-overlay" onClick={() => setSelectedProject(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-modal" onClick={() => setSelectedProject(null)}>✕</button>
            <img src={selectedProject.image} alt={selectedProject.title} />
            <h3>{selectedProject.title}</h3>
            <span className="modal-category">{selectedProject.category}</span>
            <p className="modal-author">Created by: {getDisplayAuthor(selectedProject)}</p>
            <p className="modal-desc">{selectedProject.description}</p>
            
            <div style={{ margin: "15px 0", display: "flex", gap: "15px", alignItems: "center" }}>
              <button className="like-btn" onClick={(e) => handleLike(selectedProject.id, e)}>
                ❤️ {selectedProject.likes} Likes
              </button>
            </div>

            <div className="comments-section">
              <h4>Community Comments</h4>
              <div className="comments-list">
                {selectedProject.comments.length === 0 ? (
                  <p style={{ color: "#8a869e", fontSize: "12px" }}>No comments yet. Be the first!</p>
                ) : (
                  selectedProject.comments.map((c, idx) => (
                    <div key={idx} className="comment-bubble">"{c}"</div>
                  ))
                )}
              </div>
              <form onSubmit={handleAddComment} style={{ display: "flex", gap: "10px", marginTop: "12px" }}>
                <input 
                  type="text" 
                  placeholder="Write a supportive comment..." 
                  value={newComment} 
                  onChange={e => setNewComment(e.target.value)}
                  style={{ flex: 1, padding: "8px", background: "#221d38", border: "1px solid #48415f", color: "white", borderRadius: "8px" }}
                />
                <button type="submit" className="primary-btn" style={{ padding: "8px 14px", fontSize: "13px" }}>Send</button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}