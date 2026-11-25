"use client";

import { useState, useEffect } from "react";
import "./PortfolioShowcase.css";

const INITIAL_PROJECTS = [
  {
    id: "proj-3d-studio",
    title: "DesignQuest 3D Studio & Dark UI System",
    category: "UI/UX & 3D",
    role: "Lead Designer & Developer",
    year: "2026",
    summary:
      "Full-height visual presentation of the dark violet studio interface, 3D hero depth stage, and realm progression flow.",
    aspect: "tall",
    gradient:
      "linear-gradient(165deg, #27174d 0%, #110d1f 45%, #1b1233 78%, #2e1a59 100%)",
    badge: "TALL SHOWCASE · 1440×2400",
    sections: [
      {
        label: "01 · Hero Depth & Typography",
        caption:
          "High-contrast display hierarchy over a #09090f obsidian ground with #8b5cf6 and #c084fc violet depth cues.",
        heightClass: "tall-band-lg",
        surface:
          "linear-gradient(145deg, rgba(139,92,246,0.28) 0%, rgba(16,13,29,0.96) 65%)",
      },
      {
        label: "02 · Realm Progression & Inspector",
        caption:
          "Structured spatial milestones with clear unlocked/locked states and instant quest transitions.",
        heightClass: "tall-band-xl",
        surface:
          "linear-gradient(160deg, rgba(109,69,213,0.24) 0%, rgba(12,11,22,0.98) 70%)",
      },
    ],
  },
  {
    id: "proj-tall-poster",
    title: "Tall Editorial Poster & Key Art Series",
    category: "Editorial & Print",
    role: "Visual Designer",
    year: "2026",
    summary:
      "Vertical poster compositions built for full-window scrolling so tall artwork can be read from top margin to bottom edge.",
    aspect: "tall",
    gradient:
      "linear-gradient(170deg, #472133 0%, #17101c 50%, #593329 100%)",
    badge: "VERTICAL POSTER · TALL SCROLL",
    sections: [
      {
        label: "01 · Upper Title & Focal Composition",
        caption:
          "Warm golden-hour highlights and expressive framing designed to hold attention across tall vertical proportions.",
        heightClass: "tall-band-xl",
        surface:
          "linear-gradient(155deg, rgba(217,119,87,0.26) 0%, rgba(20,14,24,0.96) 72%)",
      },
      {
        label: "02 · Lower Credits & Negative Space",
        caption:
          "Balanced bottom spacing and typographic lockups that stay clear when scrolling the full window.",
        heightClass: "tall-band-lg",
        surface:
          "linear-gradient(165deg, rgba(124,45,54,0.26) 0%, rgba(14,11,19,0.98) 75%)",
      },
    ],
  },
  {
    id: "proj-spatial-boho",
    title: "Spatial Boho Concept — Tall Walkthrough",
    category: "Spatial & Concept",
    role: "Concept Artist",
    year: "2026",
    summary:
      "Earthy spatial concept study laid out as a continuous tall scroll inside the full-window viewer.",
    aspect: "tall",
    gradient:
      "linear-gradient(165deg, #33251e 0%, #121015 55%, #283329 100%)",
    badge: "SPATIAL STUDY · FULL WINDOW",
    sections: [
      {
        label: "01 · Daylight & Material Palette",
        caption:
          "Soft warm timber, muted clay, and deep shadows arranged in a tall vertical showcase frame.",
        heightClass: "tall-band-xl",
        surface:
          "linear-gradient(155deg, rgba(200,157,124,0.22) 0%, rgba(16,14,19,0.97) 75%)",
      },
    ],
  },
];

const CATEGORIES = ["All", "UI/UX & 3D", "Editorial & Print", "Spatial & Concept"];
const STORAGE_KEY = "designquest-fullwindow-projects-v1";

export default function PortfolioShowcase() {
  const [projects, setProjects] = useState(INITIAL_PROJECTS);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [openProjectId, setOpenProjectId] = useState(null);
  const [showComposer, setShowComposer] = useState(false);

  // Composer inputs
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("UI/UX & 3D");
  const [role, setRole] = useState("Designer");
  const [summary, setSummary] = useState("");
  const [imageDataUrl, setImageDataUrl] = useState("");
  const [storageNotice, setStorageNotice] = useState("");

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
      console.error("Could not load projects:", err);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
    } catch (err) {
      if (err?.name === "QuotaExceededError") {
        setStorageNotice("Storage quota reached — keeping new project in current session.");
      }
    }
  }, [projects]);

  // Lock page behind full-window scrollable viewer + close on Escape
  useEffect(() => {
    if (!openProjectId) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setOpenProjectId(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [openProjectId]);

  const visibleProjects =
    selectedCategory === "All"
      ? projects
      : projects.filter((p) => p.category === selectedCategory);

  const activeIndex = projects.findIndex((p) => p.id === openProjectId);
  const activeProject = activeIndex >= 0 ? projects[activeIndex] : null;

  // Compress uploaded tall images so they render crisply without bloating localStorage
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setStorageNotice("");

    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const maxWidth = 1100;
        const scale = img.width > maxWidth ? maxWidth / img.width : 1;
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        setImageDataUrl(canvas.toDataURL("image/jpeg", 0.75));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  };

  const handleCreateProject = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    const created = {
      id: `project-${Date.now()}`,
      title: title.trim(),
      category,
      role: role.trim() || "Designer",
      year: "2026",
      summary:
        summary.trim() ||
        "Tall full-window scrollable project showcase.",
      gradient:
        "linear-gradient(165deg, #2b1854 0%, #110e1d 55%, #1f143b 100%)",
      badge: "CUSTOM TALL PROJECT",
      imageUrl: imageDataUrl || "",
      sections: [
        {
          label: "01 · Full-Window Tall Canvas",
          caption:
            summary.trim() ||
            "Scroll vertically inside the full window to view tall artwork and details.",
          heightClass: "tall-band-xl",
          surface:
            "linear-gradient(155deg, rgba(139,92,246,0.25) 0%, rgba(14,12,24,0.97) 75%)",
        },
      ],
    };

    setProjects((prev) => [created, ...prev]);
    setTitle("");
    setSummary("");
    setImageDataUrl("");
    setShowComposer(false);
  };

  return (
    <section id="portfolio" className="fw-portfolio">
      <div className="fw-portfolio-head">
        <div>
          <span className="eyebrow">FULL-WINDOW TALL PROJECT VIEWER</span>
          <h2>Portfolio Showcase</h2>
          <p>
            Click any project to open it in a full-window scrollable view—ideal
            for tall posters, long layouts, and full-height designs.
          </p>
        </div>

        <button
          type="button"
          className="primary-btn"
          style={{ marginTop: 0 }}
          onClick={() => setShowComposer((prev) => !prev)}
        >
          {showComposer ? "Close Form" : "+ Add Project"}
        </button>
      </div>

      {/* Category Filter */}
      <div className="fw-filter-row">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            className={`fw-filter-btn ${selectedCategory === cat ? "active" : ""}`}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Add Tall Project Form */}
      {showComposer && (
        <form className="fw-composer" onSubmit={handleCreateProject}>
          <div className="fw-composer-grid">
            <label>
              Project Title *
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Tall Concert Poster or Full-Page UI"
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
              Your Role
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g., Graphic & UI Designer"
              />
            </label>

            <label>
              Tall Artwork / Screenshot
              <input type="file" accept="image/*" onChange={handleFileChange} />
            </label>
          </div>

          <label className="fw-composer-notes">
            Description
            <textarea
              rows={2}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Add project context or notes..."
            />
          </label>

          {storageNotice && <p className="fw-notice">{storageNotice}</p>}

          <div className="fw-composer-submit">
            <button type="submit" className="primary-btn" style={{ marginTop: 0 }}>
              Save Project
            </button>
          </div>
        </form>
      )}

      {/* Clickable Project Grid (clicking any card opens the Full-Window Scrollable View) */}
      <div className="fw-project-grid">
        {visibleProjects.map((project) => (
          <article
            key={project.id}
            className="fw-project-tile"
            onClick={() => setOpenProjectId(project.id)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setOpenProjectId(project.id);
              }
            }}
          >
            <div
              className="fw-tile-preview"
              style={{ background: project.gradient }}
            >
              {project.imageUrl ? (
                <img src={project.imageUrl} alt={project.title} />
              ) : (
                <span className="fw-tile-tag">{project.badge}</span>
              )}
              <span className="fw-open-pill">Click for Full-Window Scroll ↕</span>
            </div>

            <div className="fw-tile-body">
              <span className="fw-tile-cat">
                {project.category} · {project.year}
              </span>
              <h3>{project.title}</h3>
              <p>{project.summary}</p>
              <span className="fw-tile-role">{project.role}</span>
            </div>
          </article>
        ))}
      </div>

      {/* FULL-WINDOW SCROLLABLE PROJECT VIEWER */}
      {activeProject && (
        <div
          className="fw-window-modal"
          role="dialog"
          aria-modal="true"
          aria-label={activeProject.title}
        >
          <div className="fw-window-topbar">
            <div className="fw-window-meta">
              <span className="fw-window-badge">{activeProject.category}</span>
              <strong>{activeProject.title}</strong>
            </div>

            <div className="fw-window-actions">
              <button
                type="button"
                className="fw-nav-btn"
                disabled={activeIndex <= 0}
                onClick={() =>
                  activeIndex > 0 && setOpenProjectId(projects[activeIndex - 1].id)
                }
              >
                ↑ Prev Project
              </button>
              <button
                type="button"
                className="fw-nav-btn"
                disabled={activeIndex >= projects.length - 1}
                onClick={() =>
                  activeIndex < projects.length - 1 &&
                  setOpenProjectId(projects[activeIndex + 1].id)
                }
              >
                Next Project ↓
              </button>
              <button
                type="button"
                className="fw-close-btn"
                onClick={() => setOpenProjectId(null)}
              >
                ✕ Close (Esc)
              </button>
            </div>
          </div>

          {/* Scrollable Full-Window Content Area */}
          <div className="fw-window-scroll-area">
            <div className="fw-window-inner">
              <header className="fw-project-banner">
                <span className="eyebrow">
                  FULL-WINDOW VIEW · {activeProject.role} · {activeProject.year}
                </span>
                <h1>{activeProject.title}</h1>
                <p>{activeProject.summary}</p>
              </header>

              {/* If the user uploaded a tall image, render it at natural full width so it scrolls vertically */}
              {activeProject.imageUrl ? (
                <div className="fw-tall-artwork-frame">
                  <img
                    src={activeProject.imageUrl}
                    alt={activeProject.title}
                    className="fw-tall-artwork-img"
                  />
                </div>
              ) : (
                <div className="fw-tall-canvas-stack">
                  {activeProject.sections.map((sec, idx) => (
                    <div
                      key={idx}
                      className={`fw-tall-band ${sec.heightClass || "tall-band-lg"}`}
                      style={{ background: sec.surface }}
                    >
                      <span className="fw-band-tag">{sec.label}</span>
                      <div className="fw-band-footer">
                        <p>{sec.caption}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}