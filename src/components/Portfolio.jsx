"use client";

import { useState, useEffect, useRef } from "react";
import "./Portfolio.css";

const DEFAULT_PROJECTS = [
  {
    id: "seed-1",
    title: "Neon Grid Poster Series",
    category: "Poster",
    author: "Creator",
    description:
      "Exploring typographic hierarchy, deep violet atmospheric lighting, and balanced grid rhythm.",
    image: "",
    likes: 12,
    liked: false,
    comments: [
      {
        id: "c-1",
        author: "Studio Peer",
        text: "Love how the depth layers separate the headline from the grid.",
      },
    ],
  },
  {
    id: "seed-2",
    title: "3D Brand Identity Kit",
    category: "Branding",
    author: "Creator",
    description:
      "Cohesive logomark, color tokens, and tactile card system designed for a creative studio.",
    image: "",
    likes: 19,
    liked: false,
    comments: [],
  },
];

const CATEGORIES = ["All", "Poster", "Branding", "UI/UX", "Illustration"];
const MAX_SINGLE_IMAGE_CHARS = 750_000; // ~560 KB encoded string budget per image

function compressImageFile(file, maxWidth = 760, quality = 0.68) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith("image/")) {
      reject(new Error("Please choose a valid image file (PNG, JPG, or WebP)."));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read that image file."));
    reader.onload = () => {
      if (typeof reader.result !== "string") {
        reject(new Error("Invalid image data."));
        return;
      }

      const img = new Image();
      img.onerror = () => reject(new Error("Could not load image dimensions."));
      img.onload = () => {
        const scale = img.width > maxWidth ? maxWidth / img.width : 1;
        const targetWidth = Math.max(1, Math.round(img.width * scale));
        const targetHeight = Math.max(1, Math.round(img.height * scale));

        const canvas = document.createElement("canvas");
        canvas.width = targetWidth;
        canvas.height = targetHeight;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(reader.result);
          return;
        }

        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
        const compressed = canvas.toDataURL("image/jpeg", quality);
        resolve(compressed);
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

export default function Portfolio({
  currentUser = "Creator",
  storageKey = "designquest-portfolio",
}) {
  const [projects, setProjects] = useState(DEFAULT_PROJECTS);
  const [hasLoaded, setHasLoaded] = useState(false);

  // View & Filter State
  const [activeTab, setActiveTab] = useState("community"); // "community" | "mine"
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showUploadForm, setShowUploadForm] = useState(false);

  // Upload Form & Friendly Storage Notice State
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Poster");
  const [description, setDescription] = useState("");
  const [imageData, setImageData] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [storageNotice, setStorageNotice] = useState("");
  const fileInputRef = useRef(null);

  // Detail Modal & Comment State
  const [activeProjectId, setActiveProjectId] = useState(null);
  const [commentText, setCommentText] = useState("");

  // Load saved items safely from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setProjects(parsed);
        }
      }
    } catch {
      setStorageNotice(
        "Browser storage had trouble reading saved items—showing default gallery pieces."
      );
    } finally {
      setHasLoaded(true);
    }
  }, [storageKey]);

  // Persist changes to localStorage with friendly fallback if quota is full
  useEffect(() => {
    if (!hasLoaded) return;

    try {
      localStorage.setItem(storageKey, JSON.stringify(projects));
    } catch {
      try {
        const strippedImages = projects.map((item) => ({
          ...item,
          image: item.image?.startsWith("data:") ? "" : item.image,
        }));
        localStorage.setItem(storageKey, JSON.stringify(strippedImages));
        setStorageNotice(
          "Your browser's localStorage is nearly full, so your project details were saved while older/large image previews were skipped for storage."
        );
      } catch {
        setStorageNotice(
          "Your browser's localStorage limit is full. Your artwork still shows in this session, or you can clear older items to free space."
        );
      }
    }
  }, [projects, storageKey, hasLoaded]);

  // Keep author name in sync when Profile updates via custom window event
  useEffect(() => {
    const handleAuthorSync = (e) => {
      const nextName = e?.detail?.name;
      if (!nextName) return;
      setProjects((prev) =>
        prev.map((item) =>
          item.author === "Creator" || item.author === currentUser
            ? { ...item, author: nextName }
            : item
        )
      );
    };
    window.addEventListener("designquest:profile-updated", handleAuthorSync);
    return () =>
      window.removeEventListener("designquest:profile-updated", handleAuthorSync);
  }, [currentUser]);

  const processImageFile = async (file) => {
    if (!file) return;
    setIsCompressing(true);
    setStorageNotice("");

    try {
      const compressed = await compressImageFile(file, 760, 0.68);
      if (compressed.length > MAX_SINGLE_IMAGE_CHARS) {
        setImageData(compressed);
        setStorageNotice(
          "This image is still quite detailed for localStorage (~5 MB browser limit). It will preview here, though localStorage may skip saving the image if space runs low."
        );
      } else {
        setImageData(compressed);
      }
    } catch (err) {
      setStorageNotice(
        err instanceof Error
          ? err.message
          : "Could not process that image. Please try another file."
      );
    } finally {
      setIsCompressing(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    processImageFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    processImageFile(file);
  };

  const handleCreateProject = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newItem = {
      id: `proj-${Date.now()}`,
      title: title.trim(),
      category,
      author: currentUser || "Creator",
      description:
        description.trim() ||
        "Original creative work published inside DesignQuest.",
      image: imageData,
      likes: 0,
      liked: false,
      comments: [],
    };

    setProjects((prev) => [newItem, ...prev]);
    setTitle("");
    setDescription("");
    setImageData("");
    setCategory("Poster");
    setShowUploadForm(false);
    setActiveTab("mine");
  };

  const toggleLike = (id, e) => {
    if (e) e.stopPropagation();
    setProjects((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const nextLiked = !item.liked;
        return {
          ...item,
          liked: nextLiked,
          likes: nextLiked ? item.likes + 1 : Math.max(0, item.likes - 1),
        };
      })
    );
  };

  const handleAddComment = (e) => {
    e.preventDefault();
    if (!commentText.trim() || !activeProjectId) return;

    const nextComment = {
      id: `cmt-${Date.now()}`,
      author: currentUser || "Creator",
      text: commentText.trim(),
    };

    setProjects((prev) =>
      prev.map((item) =>
        item.id === activeProjectId
          ? { ...item, comments: [...item.comments, nextComment] }
          : item
      )
    );
    setCommentText("");
  };

  const visibleProjects = projects.filter((item) => {
    const matchesTab =
      activeTab === "community"
        ? true
        : item.author === (currentUser || "Creator");
    const matchesCat =
      selectedCategory === "All" ? true : item.category === selectedCategory;
    return matchesTab && matchesCat;
  });

  const activeProject =
    projects.find((item) => item.id === activeProjectId) || null;

  return (
    <section className="dq-portfolio">
      <div className="dq-portfolio-header">
        <div>
          <span className="eyebrow">CREATIVE SHOWCASE</span>
          <h2>DesignQuest Portfolio &amp; Gallery</h2>
          <p>
            Publish your design pieces, filter by discipline, and inspect work
            in a split-pane studio viewer.
          </p>
        </div>

        <button
          type="button"
          className="primary-btn dq-upload-toggle"
          onClick={() => {
            setStorageNotice("");
            setShowUploadForm((prev) => !prev);
          }}
        >
          {showUploadForm ? "Close Studio Form" : "+ Publish Artwork"}
        </button>
      </div>

      {/* Friendly Storage / Compression Notice */}
      {storageNotice && (
        <div
          role="status"
          style={{
            marginBottom: "22px",
            padding: "13px 16px",
            borderRadius: "12px",
            background: "rgba(250, 204, 21, 0.12)",
            border: "1px solid rgba(250, 204, 21, 0.38)",
            color: "#fde68a",
            fontSize: "13px",
            lineHeight: 1.55,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <span>💡 {storageNotice}</span>
          <button
            type="button"
            onClick={() => setStorageNotice("")}
            style={{
              background: "transparent",
              border: "1px solid rgba(250, 204, 21, 0.35)",
              borderRadius: "8px",
              color: "#fef08a",
              padding: "4px 10px",
              fontSize: "11px",
              cursor: "pointer",
              flexShrink: 0,
            }}
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Custom Upload Dropzone Form */}
      {showUploadForm && (
        <form className="dq-upload-panel" onSubmit={handleCreateProject}>
          <div className="dq-form-grid">
            <div className="dq-form-fields">
              <label className="dq-label">
                Artwork Title
                <input
                  type="text"
                  className="dq-input"
                  placeholder="e.g., Retro Sunset Poster"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </label>

              <label className="dq-label">
                Category
                <select
                  className="dq-select"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  {CATEGORIES.filter((c) => c !== "All").map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </label>

              <label className="dq-label">
                Design Notes
                <textarea
                  rows={3}
                  className="dq-textarea"
                  placeholder="Share your palette choices, typography, or layout process..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </label>
            </div>

            <div
              className={`dq-dropzone ${isDragging ? "dragging" : ""}`}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => !isCompressing && fileInputRef.current?.click()}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  if (!isCompressing) fileInputRef.current?.click();
                }
              }}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                hidden
              />

              {isCompressing ? (
                <div className="dq-dropzone-empty">
                  <span className="dq-dropzone-icon">⏳</span>
                  <strong>Optimizing image for gallery...</strong>
                  <small>Resizing to fit localStorage smoothly</small>
                </div>
              ) : imageData ? (
                <div className="dq-dropzone-preview">
                  <img src={imageData} alt="Selected artwork preview" />
                  <button
                    type="button"
                    className="dq-clear-img-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      setImageData("");
                      setStorageNotice("");
                    }}
                  >
                    Change Image
                  </button>
                </div>
              ) : (
                <div className="dq-dropzone-empty">
                  <span className="dq-dropzone-icon">🖼️</span>
                  <strong>Drop artwork here or click to browse</strong>
                  <small>
                    Auto-compressed for localStorage · Best in 4:3 or landscape
                  </small>
                </div>
              )}
            </div>
          </div>

          <div className="dq-form-actions">
            <button
              type="submit"
              className="primary-btn"
              disabled={isCompressing}
            >
              Publish to Gallery
            </button>
          </div>
        </form>
      )}

      {/* Segmented Tabs & Category Filter Pills */}
      <div className="dq-toolbar">
        <div className="dq-tabs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "community"}
            className={`dq-tab-btn ${activeTab === "community" ? "active" : ""}`}
            onClick={() => setActiveTab("community")}
          >
            Community Gallery
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "mine"}
            className={`dq-tab-btn ${activeTab === "mine" ? "active" : ""}`}
            onClick={() => setActiveTab("mine")}
          >
            My Portfolio
          </button>
        </div>

        <div className="dq-filters">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              className={`dq-filter-pill ${
                selectedCategory === cat ? "active" : ""
              }`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* 4:3 Showcase Grid */}
      {visibleProjects.length === 0 ? (
        <div className="dq-empty-state">
          <p>No pieces match this filter yet.</p>
          <button
            type="button"
            className="mission-btn"
            onClick={() => {
              setActiveTab("community");
              setSelectedCategory("All");
            }}
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="dq-gallery-grid">
          {visibleProjects.map((item) => (
            <article
              key={item.id}
              className="dq-art-card"
              onClick={() => setActiveProjectId(item.id)}
            >
              <div className="dq-art-frame">
                {item.image ? (
                  <img src={item.image} alt={item.title} />
                ) : (
                  <div className="dq-art-placeholder">
                    <span>✦</span>
                    <small>{item.category}</small>
                  </div>
                )}
                <span className="dq-category-badge">{item.category}</span>
              </div>

              <div className="dq-art-body">
                <h3>{item.title}</h3>
                <p>{item.description}</p>

                <div className="dq-art-footer">
                  <span className="dq-author">by {item.author}</span>
                  <div className="dq-meta-actions">
                    <button
                      type="button"
                      className={`dq-like-btn ${item.liked ? "liked" : ""}`}
                      onClick={(e) => toggleLike(item.id, e)}
                    >
                      {item.liked ? "♥" : "♡"} {item.likes}
                    </button>
                    <span className="dq-comment-count">
                      💬 {item.comments.length}
                    </span>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Split-Pane Detail Modal */}
      {activeProject && (
        <div
          className="dq-modal-backdrop"
          onClick={() => setActiveProjectId(null)}
        >
          <div
            className="dq-split-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="dq-modal-close"
              aria-label="Close artwork viewer"
              onClick={() => setActiveProjectId(null)}
            >
              ✕
            </button>

            <div className="dq-modal-left">
              {activeProject.image ? (
                <img src={activeProject.image} alt={activeProject.title} />
              ) : (
                <div className="dq-modal-art-fallback">
                  <span>✦</span>
                  <strong>{activeProject.category} Concept</strong>
                  <small>3D Studio Preview</small>
                </div>
              )}
            </div>

            <div className="dq-modal-right">
              <div className="dq-modal-meta">
                <span className="dq-category-badge">
                  {activeProject.category}
                </span>
                <h3>{activeProject.title}</h3>
                <p className="dq-modal-author">
                  Created by {activeProject.author}
                </p>
                <p className="dq-modal-desc">{activeProject.description}</p>

                <button
                  type="button"
                  className={`dq-like-btn dq-modal-like ${
                    activeProject.liked ? "liked" : ""
                  }`}
                  onClick={(e) => toggleLike(activeProject.id, e)}
                >
                  {activeProject.liked ? "♥ Liked" : "♡ Appreciate"} (
                  {activeProject.likes})
                </button>
              </div>

              <div className="dq-comments-box">
                <h4>Critique &amp; Notes ({activeProject.comments.length})</h4>

                <div className="dq-comments-list">
                  {activeProject.comments.length === 0 ? (
                    <p className="dq-no-comments">
                      No notes yet—leave constructive feedback below.
                    </p>
                  ) : (
                    activeProject.comments.map((c) => (
                      <div key={c.id} className="dq-comment-item">
                        <strong>{c.author}</strong>
                        <p>{c.text}</p>
                      </div>
                    ))
                  )}
                </div>

                <form className="dq-comment-form" onSubmit={handleAddComment}>
                  <input
                    type="text"
                    className="dq-input"
                    placeholder="Add a design note..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                  />
                  <button type="submit" className="mission-btn">
                    Post
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}