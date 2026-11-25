"use client";

import { useState, useEffect, useRef } from "react";
import "./PortfolioShowcase.css";

const INITIAL_PROJECTS = [
  {
    id: "dq-3d-identity",
    title: "DesignQuest — 3D Studio & Gamified Identity",
    category: "UI/UX & 3D",
    role: "Lead Designer & Developer",
    year: "2026",
    client: "Project 300 Studio",
    summary:
      "A dark-violet 3D creative learning environment combining tilt-reactive hero depth, XP/rank progression, and realm exploration.",
    palette: ["#09090f", "#8b5cf6", "#c084fc", "#38bdf8", "#facc15"],
    blocks: [
      {
        type: "banner",
        caption: "01 · Hero Stage & Depth Hierarchy",
        note: "Layered backplates, floating rank/XP cards, and subtle pointer tilt anchor the dark obsidian canvas without clutter.",
        aspect: "wide",
        gradient: "linear-gradient(135deg, #1e1438 0%, #0d0b18 55%, #241942 100%)",
        badge: "3D PERSPECTIVE STAGE",
      },
      {
        type: "story",
        heading: "Why Long-Scroll Case Studies Work",
        body: "Short gallery cards force tall posters and multi-part UI flows into cramped boxes. Stacking full-width presentation bands lets every visual beat breathe—mirroring how designers walk through real work on Behance.",
      },
      {
        type: "split",
        caption: "02 · Realm Map & Progression Flow",
        leftLabel: "WORLD PATH",
        rightLabel: "INSPECTOR PANEL",
        note: "Connecting realms with a live progress trail turns abstract XP numbers into clear spatial milestones.",
      },
    ],
  },
  {
    id: "retro-poster-series",
    title: "Golden Hour & Editorial Poster Series",
    category: "Editorial & Print",
    role: "Visual Designer",
    year: "2026",
    client: "Independent Series",
    summary:
      "Warm nostalgic lighting, expressive typographic hierarchy, and hand-crafted framing designed for tall vertical and editorial presentation.",
    palette: ["#1b1218", "#d97757", "#f2c68d", "#7c2d36", "#f8f4ec"],
    blocks: [
      {
        type: "banner",
        caption: "01 · Key Art & Typographic Rhythm",
        note: "High-contrast display type paired with warm film grain and balanced negative space.",
        aspect: "tall",
        gradient: "linear-gradient(150deg, #3b1d2a 0%, #17111a 55%, #5c3228 100%)",
        badge: "EDITORIAL KEY ART",
      },
      {
        type: "story",
        heading: "Pacing Visual Tension Across Vertical Bands",
        body: "Alternating full-width focal plates with concise commentary keeps a long scroll engaging from top to bottom.",
      },
    ],
  },
  {
    id: "spatial-boho-concept",
    title: "Warm Boho Spatial & Interior Study",
    category: "Spatial & Concept",
    role: "Concept Artist",
    year: "2026",
    client: "Architectural Study",
    summary:
      "Earthy textures, soft daylight falloff, and structured spatial zoning translated into a clean visual walkthrough.",
    palette: ["#161311", "#c89d7c", "#8c6246", "#3d4a3e", "#efe6dc"],
    blocks: [
      {
        type: "banner",
        caption: "01 · Spatial Layout & Light Study",
        note: "Warm timber and plaster tones balanced against deep shadow pockets for readable depth.",
        aspect: "wide",
        gradient: "linear-gradient(135deg, #2b211b 0%, #121014 60%, #3a2b20 100%)",
        badge: "SPATIAL WALKTHROUGH",
      },
      {
        type: "story",
        heading: "From Floor Plan Logic to Mood",
        body: "Every room zone is presented with clear intent so viewers understand both spatial flow and atmosphere.",
      },
    ],
  },
];

const CATEGORIES = ["All", "UI/UX & 3D", "Editorial & Print", "Spatial & Concept"];
const STORAGE_KEY = "designquest-behance-projects-v1";

export default function PortfolioShowcase() {
  const [projects, setProjects] = useState(INITIAL_PROJECTS);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [activeProjectId, setActiveProjectId] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showComposer, setShowComposer] = useState(false);

  // New project composer state
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("UI/UX & 3D");
  const [role, setRole] = useState("Designer");
  const [summary, setSummary] = useState("");
  const [imageDataUrl, setImageDataUrl] = useState("");
  const [uploadNotice, setUploadNotice] = useState("");

  const modalRef = useRef(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setProjects(parsed);
        }
      }
    } catch (err) {
      console.error("Failed to load saved projects:", err);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
    } catch (err) {
      if (err?.name === "QuotaExceededError") {
        setUploadNotice("Storage limit reached — project shown for this session.");
      }
    }
  }, [projects]);

  // Lock background scroll when full-screen viewer is open + handle Escape
  useEffect(() => {
    if (!activeProjectId) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        closeViewer();
      }
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [activeProjectId]);

  const filteredProjects =
    selectedCategory === "All"
      ? projects
      : projects.filter((p) => p.category === selectedCategory);

  const activeIndex = projects.findIndex((p) => p.id === activeProjectId);
  const activeProject = activeIndex >= 0 ? projects[activeIndex] : null;

  const openFullScreenProject = async (projectId) => {
    setActiveProjectId(projectId);
    try {
      if (document.documentElement.requestFullscreen && !document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
      }
    } catch {
      // Fallback gracefully to full-viewport modal if browser blocks fullscreen
      setIsFullscreen(false);
    }
  };

  const closeViewer = async () => {
    setActiveProjectId(null);
    setIsFullscreen(false);
    try {
      if (document.fullscreenElement && document.exitFullscreen) {
        await document.exitFullscreen();
      }
    } catch {
      // Ignore exit errors
    }
  };

  const toggleBrowserFullscreen = async () => {
    try {
      if (!document.fullscreenElement && modalRef.current?.requestFullscreen) {
        await modalRef.current.requestFullscreen();
        setIsFullscreen(true);
      } else if (document.fullscreenElement && document.exitFullscreen) {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch {
      setIsFullscreen((prev) => !prev);
    }
  };

  // Compress uploaded artwork so localStorage stays safe
  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadNotice("");

    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const maxWidth = 960;
        const scale = img.width > maxWidth ? maxWidth / img.width : 1;
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        setImageDataUrl(canvas.toDataURL("image/jpeg", 0.72));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  };

  const handleAddProject = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newProject = {
      id: `proj-${Date.now()}`,
      title: title.trim(),
      category,
      role: role.trim() || "Designer",
      year: "2026",
      client: "DesignQuest Showcase",
      summary:
        summary.trim() ||
        "Full-bleed case study added to your DesignQuest portfolio.",
      palette: ["#09090f", "#8b5cf6", "#c084fc", "#a78bfa", "#f8f7ff"],
      imageUrl: imageDataUrl || "",
      blocks: [
        {
          type: "banner",
          caption: "01 · Full-Screen Showcase Plate",
          note:
            summary.trim() ||
            "Presented in full-screen long-scroll mode for detailed review.",
          aspect: "wide",
          gradient:
            "linear-gradient(135deg, #261847 0%, #0d0b18 55%, #372063 100%)",
          badge: "CASE STUDY PLATE",
        },
      ],
    };

    setProjects((prev) => [newProject, ...prev]);
    setTitle("");
    setSummary("");
    setImageDataUrl("");
    setShowComposer(false);
  };

  return (
    <section id="portfolio" className="behance-section">
      <div className="behance-header">
        <div>
          <span className="eyebrow">BEHANCE-STYLE CASE STUDIES</span>
          <h2>Long-Grid Portfolio &amp; Full-Screen View</h2>
          <p>
            Browse tall editorial project stacks and open any work in full screen
            to inspect every section top-to-bottom.
          </p>
        </div>

        <button
          type="button"
          className="primary-btn"
          style={{ marginTop: 0 }}
          onClick={() => setShowComposer((prev) => !prev)}
        >
          {showComposer ? "Close Composer" : "+ Add Case Study"}
        </button>
      </div>

      {/* Category Filter Bar */}
      <div className="behance-filters" role="tablist" aria-label="Portfolio categories">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            className={`behance-filter-btn ${selectedCategory === cat ? "is-active" : ""}`}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Optional Case Study Composer */}
      {showComposer && (
        <form className="behance-composer" onSubmit={handleAddProject}>
          <div className="composer-grid">
            <label>
              Project Title *
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Neon Editorial Poster System"
                required
              />
            </label>

            <label>
              Category
              <select value={category} onChange={(e) => setCategory(e.target.value)}>
                {CATEGORIES.filter((c) => c !== "All").map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Role
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g., Art Direction & Layout"
              />
            </label>

            <label>
              Artwork Image (Auto-Compressed)
              <input type="file" accept="image/*" onChange={handleImageUpload} />
            </label>
          </div>

          <label className="composer-summary">
            Case Study Overview
            <textarea
              rows={2}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Describe your concept, grid system, and visual choices..."
            />
          </label>

          {uploadNotice && <p className="composer-notice">{uploadNotice}</p>}

          <div className="composer-actions">
            <button type="submit" className="primary-btn" style={{ marginTop: 0 }}>
              Publish to Long Grid
            </button>
          </div>
        </form>
      )}

      {/* Long-Form Project Stack (Behance-style vertical cadence) */}
      <div className="behance-long-grid">
        {filteredProjects.map((project, index) => (
          <article key={project.id} className="behance-project-card">
            <div className="behance-card-top">
              <div>
                <span className="behance-index">
                  PROJECT {String(index + 1).padStart(2, "0")} · {project.category}
                </span>
                <h3>{project.title}</h3>
              </div>

              <button
                type="button"
                className="behance-fullscreen-trigger"
                onClick={() => openFullScreenProject(project.id)}
              >
                ⛶ Open Full Screen
              </button>
            </div>

            <p className="behance-summary">{project.summary}</p>

            {/* Tall stacked visual plates inside the long card */}
            <div className="behance-plate-stack">
              {project.imageUrl ? (
                <div
                  className="behance-plate behance-plate-image"
                  onClick={() => openFullScreenProject(project.id)}
                >
                  <img src={project.imageUrl} alt={project.title} />
                </div>
              ) : (
                project.blocks.map((block, bIdx) => (
                  <div
                    key={bIdx}
                    className={`behance-plate behance-plate-${block.aspect || "wide"}`}
                    style={{ background: block.gradient }}
                    onClick={() => openFullScreenProject(project.id)}
                  >
                    <span className="plate-badge">{block.badge}</span>
                    <div className="plate-caption-bar">
                      <strong>{block.caption}</strong>
                      <span>{block.note}</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Swatches + Metadata footer */}
            <div className="behance-card-footer">
              <div className="behance-swatches" title="Color Palette">
                {project.palette.map((hex) => (
                  <span
                    key={hex}
                    style={{ backgroundColor: hex }}
                    aria-label={hex}
                  />
                ))}
              </div>
              <span className="behance-meta">
                {project.role} · {project.year}
              </span>
            </div>
          </article>
        ))}
      </div>

      {/* Full-Screen Behance Case Study Viewer */}
      {activeProject && (
        <div
          ref={modalRef}
          className="behance-viewer-overlay"
          role="dialog"
          aria-modal="true"
          aria-label={activeProject.title}
        >
          <header className="behance-viewer-topbar">
            <div className="viewer-title-group">
              <span className="viewer-cat">{activeProject.category}</span>
              <strong>{activeProject.title}</strong>
            </div>

            <div className="viewer-controls">
              <button
                type="button"
                className="viewer-btn"
                disabled={activeIndex <= 0}
                onClick={() =>
                  activeIndex > 0 &&
                  setActiveProjectId(projects[activeIndex - 1].id)
                }
              >
                ← Prev
              </button>
              <button
                type="button"
                className="viewer-btn"
                disabled={activeIndex >= projects.length - 1}
                onClick={() =>
                  activeIndex < projects.length - 1 &&
                  setActiveProjectId(projects[activeIndex + 1].id)
                }
              >
                Next →
              </button>
              <button
                type="button"
                className="viewer-btn"
                onClick={toggleBrowserFullscreen}
              >
                {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
              </button>
              <button
                type="button"
                className="viewer-close-btn"
                onClick={closeViewer}
              >
                ✕ Close
              </button>
            </div>
          </header>

          <div className="behance-viewer-canvas">
            <div className="viewer-hero-band">
              <span className="eyebrow">CASE STUDY · {activeProject.year}</span>
              <h1>{activeProject.title}</h1>
              <p>{activeProject.summary}</p>
              <div className="viewer-specs">
                <span>
                  <strong>Role:</strong> {activeProject.role}
                </span>
                <span>
                  <strong>Context:</strong> {activeProject.client}
                </span>
              </div>
            </div>

            {activeProject.imageUrl && (
              <figure className="viewer-full-figure">
                <img src={activeProject.imageUrl} alt={activeProject.title} />
                <figcaption>Full-resolution artwork view</figcaption>
              </figure>
            )}

            <div className="viewer-blocks">
              {activeProject.blocks.map((block, idx) =>
                block.type === "story" ? (
                  <div key={idx} className="viewer-story-block">
                    <h3>{block.heading}</h3>
                    <p>{block.body}</p>
                  </div>
                ) : (
                  <div
                    key={idx}
                    className={`viewer-visual-block is-${block.aspect || "wide"}`}
                    style={{ background: block.gradient }}
                  >
                    <span className="plate-badge">{block.badge}</span>
                    <div className="viewer-visual-overlay">
                      <strong>{block.caption}</strong>
                      <p>{block.note}</p>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}