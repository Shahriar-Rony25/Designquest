"use client";
import { useState } from "react";
import "./Hero.css";

export default function Hero({
  xp = 0,
  completedCount = 0,
  totalMissions = 4,
  onNavigate = () => {},
}) {
  const [tilt, setTilt] = useState({ rx: 6, ry: -8 });
  const level = Math.floor(xp / 500) + 1;

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({
      rx: Number((-y * 14).toFixed(2)),
      ry: Number((x * 16).toFixed(2)),
    });
  };

  const handleMouseLeave = () => {
    setTilt({ rx: 6, ry: -8 });
  };

  return (
    <section
      className="dq-hero"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div className="dq-hero-grid" aria-hidden="true" />
      <div className="dq-orb dq-orb-violet" aria-hidden="true" />
      <div className="dq-orb dq-orb-pink" aria-hidden="true" />

      <div className="dq-hero-inner">
        <div className="dq-hero-copy">
          <div className="dq-pill">
            <span className="dq-pill-dot" />
            <span>Gamified Design Studio &amp; Portfolio</span>
          </div>

          <h1 className="dq-hero-title">
            Craft Bold Visuals.
            <span>Level Up Your Craft.</span>
          </h1>

          <p className="dq-hero-subtitle">
            Complete structured design challenges, earn XP, build a persistent
            portfolio, and showcase your work in a live creative community.
          </p>

          <div className="dq-hero-actions">
            <button
              type="button"
              className="dq-btn-primary"
              onClick={() => onNavigate("courses")}
            >
              Start Missions
            </button>
            <button
              type="button"
              className="dq-btn-secondary"
              onClick={() => onNavigate("portfolio")}
            >
              Explore Portfolio
            </button>
          </div>

          <div className="dq-hero-metrics">
            <div className="dq-metric">
              <strong>Level {level}</strong>
              <span>{xp} Total XP</span>
            </div>
            <div className="dq-metric-divider" />
            <div className="dq-metric">
              <strong>
                {completedCount}/{totalMissions}
              </strong>
              <span>Missions Done</span>
            </div>
            <div className="dq-metric-divider" />
            <div className="dq-metric">
              <strong>100% Live</strong>
              <span>Cloud Synced</span>
            </div>
          </div>
        </div>

        <div className="dq-stage-perspective">
          <div
            className="dq-3d-stack"
            style={{
              transform: `rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
            }}
          >
            <div className="dq-layer dq-layer-back">
              <span className="dq-tag">Color &amp; Grid System</span>
              <div className="dq-swatches">
                <i style={{ background: "#7c3aed" }} />
                <i style={{ background: "#ec4899" }} />
                <i style={{ background: "#38bdf8" }} />
                <i style={{ background: "#f59e0b" }} />
              </div>
            </div>

            <div className="dq-layer dq-layer-mid">
              <div className="dq-mini-header">
                <span>Mission #02</span>
                <span>+250 XP</span>
              </div>
              <p>Poster Composition &amp; Hierarchy</p>
            </div>

            <div className="dq-layer dq-layer-front">
              <div className="dq-card-badge">3D Showcase</div>
              <h3>DesignQuest Studio</h3>
              <p>
                Interactive briefs, instant portfolio publishing, and real-time
                creator stats.
              </p>
              <div className="dq-card-footer">
                <span>Creator Rank · Lv.{level}</span>
                <span className="dq-status-dot">Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}