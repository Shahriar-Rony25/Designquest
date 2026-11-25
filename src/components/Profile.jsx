"use client";

import { useState, useEffect } from "react";
import "./Profile.css";

const AVATAR_CHOICES = ["🎨", "✦", "👑", "🚀", "🎭", "⚡"];

const DEFAULT_PROFILE = {
  name: "Shahriar Hossain Rony",
  handle: "@techvivuu",
  role: "Metropolitan University · Project 300",
  bio: "Crafting gamified design systems, 3D visual layouts, and expressive posters inside DesignQuest.",
  avatar: "🎨",
};

function getCreatorRank(level) {
  if (level >= 6) return { title: "Studio Grandmaster", badge: "👑" };
  if (level >= 4) return { title: "Layout Architect", badge: "⚡" };
  if (level >= 3) return { title: "Typography & Color Tactician", badge: "✦" };
  if (level >= 2) return { title: "Creative Voyager", badge: "🚀" };
  return { title: "Design Explorer", badge: "🎨" };
}

export default function Profile({
  xp: propXp,
  completed: propCompleted,
  profileStorageKey = "designquest-profile",
  progressStorageKey = "designquest-progress",
}) {
  const [profile, setProfile] = useState(DEFAULT_PROFILE);
  const [draft, setDraft] = useState(DEFAULT_PROFILE);
  const [isEditing, setIsEditing] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  // Live XP & Completed Missions synced with page.js / localStorage
  const [localXp, setLocalXp] = useState(typeof propXp === "number" ? propXp : 120);
  const [localCompleted, setLocalCompleted] = useState(
    Array.isArray(propCompleted) ? propCompleted : []
  );

  useEffect(() => {
    if (typeof propXp === "number") {
      setLocalXp(propXp);
    }
  }, [propXp]);

  useEffect(() => {
    if (Array.isArray(propCompleted)) {
      setLocalCompleted(propCompleted);
    }
  }, [propCompleted]);

  useEffect(() => {
    try {
      const savedProfile = localStorage.getItem(profileStorageKey);
      if (savedProfile) {
        const parsed = JSON.parse(savedProfile);
        const merged = { ...DEFAULT_PROFILE, ...parsed };
        setProfile(merged);
        setDraft(merged);
      }

      if (typeof propXp !== "number" || !Array.isArray(propCompleted)) {
        const savedProgress = localStorage.getItem(progressStorageKey);
        if (savedProgress) {
          const parsedProg = JSON.parse(savedProgress);
          if (typeof parsedProg.xp === "number") setLocalXp(parsedProg.xp);
          if (Array.isArray(parsedProg.completed)) {
            setLocalCompleted(parsedProg.completed);
          }
        }
      }
    } catch (err) {
      console.error("Failed to load profile state:", err);
    } finally {
      setHasLoaded(true);
    }
  }, [profileStorageKey, progressStorageKey, propXp, propCompleted]);

  useEffect(() => {
    if (!hasLoaded) return;
    try {
      localStorage.setItem(profileStorageKey, JSON.stringify(profile));
      window.dispatchEvent(
        new CustomEvent("designquest:profile-updated", { detail: profile })
      );
    } catch (err) {
      console.error("Failed to save profile state:", err);
    }
  }, [profile, profileStorageKey, hasLoaded]);

  const xp = typeof propXp === "number" ? propXp : localXp;
  const completed = Array.isArray(propCompleted) ? propCompleted : localCompleted;

  const level = Math.floor(xp / 500) + 1;
  const progressPercent = Math.min(100, (xp % 500) / 5);
  const xpIntoLevel = xp % 500;
  const rank = getCreatorRank(level);

  const startEditing = () => {
    setDraft(profile);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setDraft(profile);
    setIsEditing(false);
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    const cleaned = {
      ...draft,
      name: draft.name.trim() || DEFAULT_PROFILE.name,
      handle: draft.handle.trim() || DEFAULT_PROFILE.handle,
      role: draft.role.trim() || DEFAULT_PROFILE.role,
      bio: draft.bio.trim() || DEFAULT_PROFILE.bio,
    };
    setProfile(cleaned);
    setDraft(cleaned);
    setIsEditing(false);
  };

  const unlockedRealmsCount = [0, 150, 300, 500, 800].filter(
    (req) => xp >= req
  ).length;

  const rankBadges = [
    {
      id: "first-mission",
      label: "Mission Starter",
      desc: "Completed at least 1 design mission",
      unlocked: completed.length >= 1,
      icon: "🎯",
    },
    {
      id: "realm-walker",
      label: "Realm Walker",
      desc: "Unlocked 2+ DesignQuest worlds",
      unlocked: unlockedRealmsCount >= 2,
      icon: "🗺️",
    },
    {
      id: "xp-surge",
      label: "XP Surge (250+)",
      desc: "Accumulated 250 or more total XP",
      unlocked: xp >= 250,
      icon: "⚡",
    },
    {
      id: "master-crafter",
      label: "Studio Master",
      desc: "Reached Level 3 or higher",
      unlocked: level >= 3,
      icon: "👑",
    },
  ];

  return (
    <section className="dq-profile-section">
      <div className="dq-profile-banner">
        <div className="dq-profile-identity">
          <div className="dq-avatar-3d" aria-hidden="true">
            <span>{profile.avatar}</span>
          </div>

          <div className="dq-identity-text">
            <div className="dq-rank-pill">
              <span>{rank.badge}</span>
              <strong>{rank.title}</strong>
              <span className="dq-level-tag">LVL {level}</span>
            </div>

            <h2>{profile.name}</h2>
            <p className="dq-handle-line">
              <span>{profile.handle}</span> · <span>{profile.role}</span>
            </p>
            <p className="dq-bio-copy">{profile.bio}</p>
          </div>
        </div>

        <div className="dq-profile-actions">
          {!isEditing ? (
            <button
              type="button"
              className="primary-btn dq-edit-btn"
              onClick={startEditing}
            >
              Edit Profile ✎
            </button>
          ) : (
            <div className="dq-edit-btn-group">
              <button
                type="button"
                className="dq-cancel-btn"
                onClick={handleCancelEdit}
              >
                Cancel
              </button>
              <button
                type="submit"
                form="dq-profile-form"
                className="primary-btn dq-save-btn"
              >
                Save Changes
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Edit Mode Form */}
      {isEditing && (
        <form
          id="dq-profile-form"
          className="dq-edit-card"
          onSubmit={handleSaveProfile}
        >
          <div className="dq-edit-header">
            <h3>Customize Creator Card</h3>
            <small>Changes update your profile immediately or discard on Cancel.</small>
          </div>

          <div className="dq-avatar-picker">
            <span>Studio Emblem</span>
            <div className="dq-avatar-row">
              {AVATAR_CHOICES.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  className={`dq-avatar-choice ${
                    draft.avatar === emoji ? "active" : ""
                  }`}
                  onClick={() => setDraft((prev) => ({ ...prev, avatar: emoji }))}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <div className="dq-edit-grid">
            <label className="dq-field">
              Display Name
              <input
                type="text"
                className="dq-field-input"
                value={draft.name}
                onChange={(e) =>
                  setDraft((prev) => ({ ...prev, name: e.target.value }))
                }
                required
              />
            </label>

            <label className="dq-field">
              Creator Handle
              <input
                type="text"
                className="dq-field-input"
                value={draft.handle}
                onChange={(e) =>
                  setDraft((prev) => ({ ...prev, handle: e.target.value }))
                }
              />
            </label>
          </div>

          <label className="dq-field">
            Studio / Academic Tagline
            <input
              type="text"
              className="dq-field-input"
              value={draft.role}
              onChange={(e) =>
                setDraft((prev) => ({ ...prev, role: e.target.value }))
              }
            />
          </label>

          <label className="dq-field">
            Bio
            <textarea
              rows={3}
              className="dq-field-textarea"
              value={draft.bio}
              onChange={(e) =>
                setDraft((prev) => ({ ...prev, bio: e.target.value }))
              }
            />
          </label>

          <div className="dq-form-footer-actions">
            <button
              type="button"
              className="dq-cancel-btn"
              onClick={handleCancelEdit}
            >
              Cancel
            </button>
            <button type="submit" className="primary-btn dq-save-btn">
              Save Profile
            </button>
          </div>
        </form>
      )}

      {/* Live XP Progress & Stats Grid */}
      <div className="dq-profile-stats-grid">
        <div className="dq-xp-card">
          <div className="dq-xp-top">
            <div>
              <span className="eyebrow">LIVE PROGRESSION</span>
              <h3>Level {level} · {rank.title}</h3>
            </div>
            <strong className="dq-xp-total">{xp} XP</strong>
          </div>

          <div className="progress-track dq-profile-bar">
            <div
              className="progress-fill"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="dq-xp-meta">
            <span>{xpIntoLevel} / 500 XP toward Level {level + 1}</span>
            <span>{Math.round(progressPercent)}%</span>
          </div>
        </div>

        <div className="dq-mini-metrics">
          <div className="dq-metric-tile">
            <span>🎯</span>
            <div>
              <strong>{completed.length}/4</strong>
              <small>Missions Cleared</small>
            </div>
          </div>
          <div className="dq-metric-tile">
            <span>🗺️</span>
            <div>
              <strong>{unlockedRealmsCount}/5</strong>
              <small>World Realms</small>
            </div>
          </div>
        </div>
      </div>

      {/* Rank & Milestone Badges */}
      <div className="dq-badges-block">
        <div className="dq-badges-heading">
          <h3>Creator Rank &amp; Milestone Badges</h3>
          <small>
            {rankBadges.filter((b) => b.unlocked).length} of {rankBadges.length} unlocked
          </small>
        </div>

        <div className="dq-badges-grid">
          {rankBadges.map((badge) => (
            <div
              key={badge.id}
              className={`dq-badge-card ${
                badge.unlocked ? "unlocked" : "locked"
              }`}
            >
              <span className="dq-badge-icon">{badge.icon}</span>
              <div>
                <strong>{badge.label}</strong>
                <p>{badge.desc}</p>
              </div>
              <span className="dq-badge-status">
                {badge.unlocked ? "UNLOCKED" : "LOCKED"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}