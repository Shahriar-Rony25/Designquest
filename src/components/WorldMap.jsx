"use client";

import { useMemo, useState } from "react";
import "./WorldMap.css";

const DEFAULT_REALMS = [
  {
    id: "grid-foundations",
    order: "01",
    name: "Grid & Layout Citadel",
    subtitle: "Rhythm, alignment & visual hierarchy",
    requiredXp: 0,
    rewardBadge: "Grid Architect",
    accent: "#8b5cf6",
    coords: { x: 14, y: 66 },
    craftTip: "Anchor headlines to an 8px baseline rhythm and lock focal points on rule-of-thirds intersections.",
    focusCategory: "Poster",
  },
  {
    id: "color-alchemy",
    order: "02",
    name: "Chroma & Contrast Sanctum",
    subtitle: "Atmospheric palettes & luminance balance",
    requiredXp: 100,
    rewardBadge: "Color Alchemist",
    accent: "#a855f7",
    coords: { x: 38, y: 34 },
    craftTip: "Reserve high-saturation violet/magenta accents for primary actions and let deep obsidian carry depth.",
    focusCategory: "Branding",
  },
  {
    id: "spatial-depth",
    order: "03",
    name: "3D Perspective Spire",
    subtitle: "Z-axis elevation, light falloff & parallax",
    requiredXp: 250,
    rewardBadge: "Spatial Sculptor",
    accent: "#c084fc",
    coords: { x: 64, y: 62 },
    craftTip: "Separate foreground, mid-ground, and backdrop planes with subtle scale shifts and rim lighting.",
    focusCategory: "UI/UX",
  },
  {
    id: "design-systems",
    order: "04",
    name: "Studio Systems Summit",
    subtitle: "Cohesive tokens, components & portfolio craft",
    requiredXp: 450,
    rewardBadge: "Master of Craft",
    accent: "#38bdf8",
    coords: { x: 88, y: 28 },
    craftTip: "Codify repeatable tokens for spacing, borders, and motion so every screen feels unmistakably yours.",
    focusCategory: "Illustration",
  },
];

export default function WorldMap({
  xp = 0,
  completedMissions = [],
  onSelectRealmCategory,
  onOpenMissionForRealm,
}) {
  const [selectedId, setSelectedId] = useState(DEFAULT_REALMS[0].id);

  const enrichedRealms = useMemo(() => {
    return DEFAULT_REALMS.map((realm, idx) => {
      const unlocked = xp >= realm.requiredXp;
      const nextThreshold =
        DEFAULT_REALMS[idx + 1]?.requiredXp ?? realm.requiredXp + 250;
      const mastered =
        unlocked &&
        (idx === DEFAULT_REALMS.length - 1
          ? xp >= realm.requiredXp + 200
          : xp >= nextThreshold);

      return {
        ...realm,
        unlocked,
        mastered,
        nextThreshold,
      };
    });
  }, [xp]);

  const activeRealm =
    enrichedRealms.find((r) => r.id === selectedId) || enrichedRealms[0];

  const unlockedCount = enrichedRealms.filter((r) => r.unlocked).length;
  const routeCompletionRatio = Math.min(
    1,
    Math.max(0, (unlockedCount - 1) / (DEFAULT_REALMS.length - 1))
  );

  return (
    <section className="dq-worldmap" aria-label="DesignQuest World Map">
      <div className="dq-worldmap-header">
        <div>
          <span className="eyebrow">REALM PROGRESSION</span>
          <h2>Interactive 3D World Map</h2>
          <p>
            Travel across design realms as your XP rises. Select any realm node
            to inspect studio rules and jump straight into practice.
          </p>
        </div>

        <div className="dq-worldmap-summary">
          <div className="dq-wm-stat">
            <strong>
              {unlockedCount} / {enrichedRealms.length}
            </strong>
            <span>Realms Unlocked</span>
          </div>
          <div className="dq-wm-stat">
            <strong>{xp} XP</strong>
            <span>Current Power</span>
          </div>
          <div className="dq-wm-stat">
            <strong>{completedMissions.length}</strong>
            <span>Missions Cleared</span>
          </div>
        </div>
      </div>

      {/* Interactive Map Stage */}
      <div className="dq-map-stage">
        <div className="dq-map-grid-bg" aria-hidden="true" />

        {/* SVG Route Connecting Nodes */}
        <svg
          className="dq-map-svg"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="dqRouteActive" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#8b5cf6" />
              <stop offset="65%" stopColor="#c084fc" />
              <stop offset="100%" stopColor="#38bdf8" />
            </linearGradient>
          </defs>

          <path
            d="M 14 66 C 26 66, 26 34, 38 34 C 50 34, 52 62, 64 62 C 76 62, 76 28, 88 28"
            className="dq-route-track"
          />
          <path
            d="M 14 66 C 26 66, 26 34, 38 34 C 50 34, 52 62, 64 62 C 76 62, 76 28, 88 28"
            className="dq-route-progress"
            pathLength="100"
            style={{
              strokeDasharray: 100,
              strokeDashoffset: 100 - routeCompletionRatio * 100,
            }}
          />
        </svg>

        {/* Realm Nodes */}
        {enrichedRealms.map((realm) => {
          const isSelected = realm.id === activeRealm.id;
          const statusLabel = realm.mastered
            ? "Mastered"
            : realm.unlocked
            ? "Unlocked"
            : `${realm.requiredXp} XP`;

          return (
            <button
              key={realm.id}
              type="button"
              className={[
                "dq-realm-node",
                realm.unlocked ? "is-unlocked" : "is-locked",
                realm.mastered ? "is-mastered" : "",
                isSelected ? "is-selected" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              style={{
                left: `${realm.coords.x}%`,
                top: `${realm.coords.y}%`,
                "--realm-accent": realm.accent,
              }}
              onClick={() => setSelectedId(realm.id)}
            >
              <span className="dq-node-pulse" aria-hidden="true" />
              <span className="dq-node-core">
                <span className="dq-node-order">{realm.order}</span>
                <span className="dq-node-icon">
                  {realm.unlocked ? "✦" : "🔒"}
                </span>
              </span>
              <span className="dq-node-label">{realm.name}</span>
              <span className="dq-node-pill">{statusLabel}</span>
            </button>
          );
        })}
      </div>

      {/* Selected Realm Inspector Panel */}
      <div className="dq-realm-inspector">
        <div className="dq-inspector-main">
          <div className="dq-inspector-top">
            <span className="dq-inspector-tag">
              REALM {activeRealm.order} ·{" "}
              {activeRealm.mastered
                ? "MASTERED"
                : activeRealm.unlocked
                ? "UNLOCKED"
                : `REQUIRES ${activeRealm.requiredXp} XP`}
            </span>
            <span className="dq-inspector-badge">
              🏅 Badge: {activeRealm.rewardBadge}
            </span>
          </div>

          <h3>{activeRealm.name}</h3>
          <p className="dq-inspector-sub">{activeRealm.subtitle}</p>
          <blockquote className="dq-inspector-tip">
            “{activeRealm.craftTip}”
          </blockquote>
        </div>

        <div className="dq-inspector-actions">
          {!activeRealm.unlocked && (
            <div className="dq-unlock-meter">
              <div className="dq-unlock-copy">
                <span>Progress to unlock</span>
                <strong>
                  {Math.min(xp, activeRealm.requiredXp)} /{" "}
                  {activeRealm.requiredXp} XP
                </strong>
              </div>
              <div className="dq-unlock-bar">
                <div
                  className="dq-unlock-fill"
                  style={{
                    width: `${Math.min(
                      100,
                      Math.round((xp / activeRealm.requiredXp) * 100)
                    )}%`,
                  }}
                />
              </div>
            </div>
          )}

          <div className="dq-inspector-buttons">
            {typeof onOpenMissionForRealm === "function" && (
              <button
                type="button"
                className="primary-btn"
                onClick={() => onOpenMissionForRealm(activeRealm)}
              >
                {activeRealm.unlocked ? "Launch Realm Quest" : "Preview Quest"}
              </button>
            )}
            {typeof onSelectRealmCategory === "function" && (
              <button
                type="button"
                className="mission-btn"
                onClick={() => onSelectRealmCategory(activeRealm.focusCategory)}
              >
                Filter {activeRealm.focusCategory} Works
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}