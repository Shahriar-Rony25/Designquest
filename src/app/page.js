"use client";

import { useState, useEffect } from "react";
import WorldMap from "@/components/WorldMap";

export default function HomePage() {
  const [xp, setXp] = useState(120);
  const [completed, setCompleted] = useState([]);
  const [colorRewards, setColorRewards] = useState([false, false, false]);
  const [hasLoaded, setHasLoaded] = useState(false);

  const [heroTilt, setHeroTilt] = useState({ rx: 6, ry: -10 });
  const [activeLeftTool, setActiveLeftTool] = useState("marquee");
  const [activeRightTool, setActiveRightTool] = useState("pen");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("designquest-progress");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.xp === "number") setXp(parsed.xp);
        if (Array.isArray(parsed.completed)) setCompleted(parsed.completed);
        if (Array.isArray(parsed.colorRewards)) setColorRewards(parsed.colorRewards);
      }
    } catch (e) {
      console.error("Failed to parse saved progress", e);
    } finally {
      setHasLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!hasLoaded) return;
    try {
      localStorage.setItem(
        "designquest-progress",
        JSON.stringify({ xp, completed, colorRewards })
      );
    } catch (e) {
      console.error("Failed to save progress", e);
    }
  }, [xp, completed, colorRewards, hasLoaded]);

  const level = Math.floor(xp / 500) + 1;
  const progressPercent = Math.min(100, (xp % 500) / 5);

  const [activeMission, setActiveMission] = useState(null);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  const missionQuizzes = {
    1: {
      title: "Mission 1: Design Fundamentals",
      rewardXP: 100,
      questions: [
        {
          question: "Which principle creates a strong focal point by making elements distinct?",
          options: ["Alignment", "Contrast", "Repetition", "Proximity"],
          correct: 1,
          explanation: "Contrast makes elements stand out by creating visual difference in weight, size, or color."
        },
        {
          question: "What does alignment help achieve in a clean layout?",
          options: ["Random chaos", "Visual connection and order", "File compression", "Color harmony"],
          correct: 1,
          explanation: "Alignment builds an invisible structure that connects elements and makes layouts look organized."
        },
        {
          question: "Which color pair sits opposite each other on the color wheel?",
          options: ["Blue and Orange", "Red and Orange", "Blue and Cyan", "Green and Yellow"],
          correct: 0,
          explanation: "Complementary colors sit opposite each other, creating high visual contrast."
        },
        {
          question: "What are serifs on typography characters?",
          options: ["Small decorative strokes at the edge of letters", "The height of lowercase letters", "The spacing between lines", "The thickness of a stroke"],
          correct: 0,
          explanation: "Serifs are the traditional small feet or strokes attached to the end of main letter strokes."
        },
        {
          question: "Visual hierarchy guides the viewer's eye by:",
          options: ["Hiding unimportant elements", "Displaying everything in identical size", "Establishing the order of importance", "Using only black and white"],
          correct: 2,
          explanation: "Visual hierarchy uses size, weight, and placement to show users what to look at first."
        }
      ]
    },
    2: {
      title: "Mission 2: Color Theory Master",
      rewardXP: 150,
      questions: [
        {
          question: "What emotion or vibe do warm colors (reds, yellows, oranges) typically evoke?",
          options: ["Calmness and cold", "Energy, warmth, and passion", "Neutrality and corporate safety", "Medical sterility"],
          correct: 1,
          explanation: "Warm colors tend to evoke energy, excitement, and warmth."
        },
        {
          question: "What does saturation refer to in color theory?",
          options: ["The lightness or darkness of a color", "The purity or intensity of a color", "The transparency level", "The temperature of a color"],
          correct: 1,
          explanation: "Saturation describes the intensity or vibrancy of a color compared to neutral grey."
        },
        {
          question: "Which color scheme uses different shades and tints of a single base hue?",
          options: ["Complementary", "Monochromatic", "Triadic", "Split-complementary"],
          correct: 1,
          explanation: "A monochromatic palette uses variations in lightness and saturation of a single color."
        }
      ]
    },
    3: {
      title: "Mission 3: Typography Challenge",
      rewardXP: 200,
      questions: [
        {
          question: "What is 'kerning' in typography?",
          options: ["Adjusting the spacing between a specific pair of letters", "The vertical space between lines of text", "The overall width of letterforms", "The choice of font weight"],
          correct: 0,
          explanation: "Kerning is the adjustment of space between individual character pairs to ensure visual balance."
        },
        {
          question: "What is 'leading' (line height)?",
          options: ["The distance from baseline to baseline of successive lines of text", "The leading title of a paragraph", "The thickness of character stems", "The capitalization style"],
          correct: 0,
          explanation: "Leading refers to the vertical distance between consecutive lines of text."
        },
        {
          question: "Sans-serif typefaces are generally best known for looking:",
          options: ["Traditional and bookish", "Modern, clean, and legible on digital screens", "Highly ornate and handwritten", "Difficult to read at large sizes"],
          correct: 1,
          explanation: "Sans-serif fonts lack decorative feet, giving them a clean, modern aesthetic ideal for UI and screens."
        }
      ]
    }
  };

  const handleStartMission = (missionId) => {
    if (missionQuizzes[missionId]) {
      setActiveMission(missionId);
      setCurrentQuestionIdx(0);
      setSelectedOption(null);
      setIsAnswerSubmitted(false);
      setQuizScore(0);
      setQuizFinished(false);
    } else {
      alert("This mission is coming soon!");
    }
  };

  const currentQuizData = activeMission ? missionQuizzes[activeMission] : null;

  const handleAnswerSubmit = () => {
    if (selectedOption === null || !currentQuizData) return;
    setIsAnswerSubmitted(true);
    const currentQ = currentQuizData.questions[currentQuestionIdx];
    if (selectedOption === currentQ.correct) {
      setQuizScore((prev) => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    if (!currentQuizData) return;
    if (currentQuestionIdx < currentQuizData.questions.length - 1) {
      setCurrentQuestionIdx((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswerSubmitted(false);
    } else {
      setQuizFinished(true);
      if (!completed.includes(activeMission)) {
        setCompleted((prev) => [...prev, activeMission]);
        setXp((prev) => prev + currentQuizData.rewardXP);
      }
    }
  };

  const worldNames = [
    "Design Island",
    "Color Kingdom",
    "Typography City",
    "Creative Valley",
    "Pro Designer World",
  ];
  const currentWorldName =
    worldNames[Math.min(level - 1, worldNames.length - 1)] || worldNames[0];

  const handleHeroMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width - 0.5;
    const ny = (e.clientY - rect.top) / rect.height - 0.5;
    setHeroTilt({
      rx: Number((-ny * 14).toFixed(2)),
      ry: Number((nx * 18).toFixed(2)),
    });
  };

  const handleHeroMouseLeave = () => {
    setHeroTilt({ rx: 6, ry: -10 });
  };

  const handleOpenMissionForRealm = () => {
    const nextMissionId = !completed.includes(1)
      ? 1
      : !completed.includes(2)
      ? 2
      : 3;
    handleStartMission(nextMissionId);
  };

  const handleSelectRealmCategory = () => {
    document.getElementById("missions")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <header
        id="home"
        className="hero poster-hero-stage"
        onMouseMove={handleHeroMouseMove}
        onMouseLeave={handleHeroMouseLeave}
      >
        <div className="poster-bg-grid" aria-hidden="true" />
        <div className="poster-ghost-type" aria-hidden="true">
          GRAPHIC DESIGN
        </div>

        <aside
          className="tool-panel-3d tool-panel-left"
          aria-label="Design selection and layout tools"
          style={{
            transform: `perspective(1100px) rotateY(${18 + heroTilt.ry * 0.45}deg) rotateX(${
              8 + heroTilt.rx * 0.45
            }deg) rotateZ(-6deg)`,
          }}
        >
          <div className="tool-panel-cap" />
          <button
            type="button"
            className={`tool-slot ${activeLeftTool === "marquee" ? "is-active" : ""}`}
            title="Marquee Selection"
            onClick={() => setActiveLeftTool("marquee")}
          >
            ⬚
          </button>
          <button
            type="button"
            className={`tool-slot ${activeLeftTool === "lasso" ? "is-active" : ""}`}
            title="Lasso / Freehand"
            onClick={() => setActiveLeftTool("lasso")}
          >
            ✎
          </button>
          <button
            type="button"
            className={`tool-slot ${activeLeftTool === "frame" ? "is-active" : ""}`}
            title="Crop & Frame"
            onClick={() => setActiveLeftTool("frame")}
          >
            ⊞
          </button>
          <button
            type="button"
            className={`tool-slot ${activeLeftTool === "eyedropper" ? "is-active" : ""}`}
            title="Eyedropper"
            onClick={() => setActiveLeftTool("eyedropper")}
          >
            💧
          </button>
          <div className="tool-panel-divider" />
          <div className="tool-swatch-pair" aria-hidden="true">
            <span className="swatch-front" />
            <span className="swatch-back" />
          </div>
        </aside>

        <div className="poster-hero-center">
          <div className="poster-kicker-row">
            <span className="poster-ribbon-tag">LEVEL {level} STUDIO</span>
            <span className="eyebrow">3D GAMIFIED CREATIVE ECOSYSTEM</span>
          </div>

          <h1>
            LEVEL UP YOUR <span>DESIGN SKILLS</span>
            <span className="poster-headline-pill">TO CRAFT STUNNING VISUALS</span>
          </h1>

          <p className="poster-subcopy">
            Master contrast, color theory, and typography through interactive
            missions in <strong>{currentWorldName}</strong> — built for creators
            leveling up their craft.
          </p>

          <div className="hero-actions poster-actions">
            <a href="#missions" className="primary-btn">
              Start Learning Now 🚀
            </a>
            <a href="#world" className="secondary-hero-btn">
              Explore World Map 🗺️
            </a>
          </div>

          <div className="poster-disciplines" aria-label="Design disciplines">
            <span>LOGO</span>
            <span>MENU</span>
            <span>COVER</span>
            <span>BANNER</span>
            <span>POSTER</span>
            <span>FLYER</span>
            <span>BRANDING</span>
            <span>UI</span>
          </div>
        </div>

        <aside
          className="tool-panel-3d tool-panel-right"
          aria-label="Vector, pen, and typography tools"
          style={{
            transform: `perspective(1100px) rotateY(${-18 + heroTilt.ry * 0.45}deg) rotateX(${
              8 + heroTilt.rx * 0.45
            }deg) rotateZ(6deg)`,
          }}
        >
          <div className="tool-panel-cap" />
          <button
            type="button"
            className={`tool-slot ${activeRightTool === "move" ? "is-active" : ""}`}
            title="Move & Transform"
            onClick={() => setActiveRightTool("move")}
          >
            ✥
          </button>
          <button
            type="button"
            className={`tool-slot ${activeRightTool === "pen" ? "is-active" : ""}`}
            title="Pen / Bezier Path"
            onClick={() => setActiveRightTool("pen")}
          >
            ✒
          </button>
          <button
            type="button"
            className={`tool-slot ${activeRightTool === "shape" ? "is-active" : ""}`}
            title="Shape Builder"
            onClick={() => setActiveRightTool("shape")}
          >
            ◇
          </button>
          <button
            type="button"
            className={`tool-slot ${activeRightTool === "brush" ? "is-active" : ""}`}
            title="Brush & Stroke"
            onClick={() => setActiveRightTool("brush")}
          >
            🖌
          </button>
          <button
            type="button"
            className={`tool-slot ${activeRightTool === "type" ? "is-active" : ""}`}
            title="Typography"
            onClick={() => setActiveRightTool("type")}
          >
            T
          </button>
          <div className="tool-badge-xp">+{xp} XP</div>
        </aside>

        <div className="poster-bottom-bar">
          <a href="#missions" className="poster-cta-stamp">
            PLAY NOW!
          </a>
          <span className="poster-bar-sep" aria-hidden="true">|</span>
          <span>{completed.length}/4 MISSIONS DONE</span>
          <span className="poster-bar-sep" aria-hidden="true">|</span>
          <span>{currentWorldName.toUpperCase()}</span>
          <span className="poster-bar-sep" aria-hidden="true">|</span>
          <span>{xp} XP EARNED</span>
          <span className="poster-bar-brand">DESIGNQUEST · 300</span>
        </div>
      </header>

      {/* Poster-Matched Stats Bar */}
      <section className="stats poster-stats-strip">
        <div className="stat-card poster-stat-card">
          <span className="poster-stat-icon">⚡</span>
          <div>
            <strong>{xp} XP</strong>
            <small>EXPERIENCE POINTS</small>
          </div>
          <span className="poster-stat-stamp">LIVE</span>
        </div>
        <div className="stat-card poster-stat-card">
          <span className="poster-stat-icon">⭐</span>
          <div>
            <strong>Level {level}</strong>
            <small>CURRENT RANK</small>
          </div>
          <span className="poster-stat-stamp">TIER</span>
        </div>
        <div className="stat-card poster-stat-card">
          <span className="poster-stat-icon">🎯</span>
          <div>
            <strong>{completed.length}/4</strong>
            <small>MISSIONS DONE</small>
          </div>
          <span className="poster-stat-stamp">QUESTS</span>
        </div>
        <div className="stat-card poster-stat-card">
          <span className="poster-stat-icon">🔥</span>
          <div>
            <strong>{currentWorldName}</strong>
            <small>ACTIVE REALM</small>
          </div>
          <span className="poster-stat-stamp">MAP</span>
        </div>
      </section>

      {/* Poster-Matched Level Progress Section */}
      <section className="level-section poster-level-panel">
        <div className="section-heading poster-section-head">
          <div>
            <span className="poster-ribbon-mini">XP TELEMETRY</span>
            <h2>YOUR JOURNEY PROGRESS</h2>
            <p>Earn XP from missions and challenges to unlock higher studio ranks.</p>
          </div>
          <span className="world-rank poster-rank-pill">RANK · LEVEL {level}</span>
        </div>
        <div className="progress-track poster-progress-track">
          <div className="progress-fill" style={{ width: `${progressPercent}%` }}></div>
        </div>
        <div className="poster-progress-footer">
          <small>{xp % 500} / 500 XP TO LEVEL {level + 1}</small>
          <small>{Math.round(progressPercent)}% COMPLETE</small>
        </div>
      </section>

      {/* Poster-Matched Missions Section */}
      <section id="missions" className="missions-section poster-missions-zone">
        <div className="section-heading poster-section-head">
          <div>
            <span className="poster-ribbon-mini">CURRICULUM DECK</span>
            <h2>CREATIVE MISSIONS</h2>
            <p>Complete hands-on modules to sharpen contrast, color, and type craft.</p>
          </div>
          <strong className="poster-counter-box">{completed.length}/4 COMPLETED</strong>
        </div>

        <div className="mission-grid">
          <div className="mission-card poster-mission-card">
            <div className="mission-top">
              <span className="mission-icon">💡</span>
              <span className="free-tag">FREE</span>
            </div>
            <small className="poster-module-code">MOD 01 · BEGINNER</small>
            <h3>1. DESIGN FUNDAMENTALS</h3>
            <p>Master contrast, alignment, visual hierarchy, and composition balance.</p>
            <div className="mission-bottom">
              <span>+100 XP</span>
              <button className="mission-btn poster-action-btn" onClick={() => handleStartMission(1)}>
                {completed.includes(1) ? "REPLAY MISSION ↻" : "START MISSION →"}
              </button>
            </div>
          </div>

          <div className="mission-card poster-mission-card">
            <div className="mission-top">
              <span className="mission-icon">🎨</span>
              <span className="free-tag">FREE</span>
            </div>
            <small className="poster-module-code">MOD 02 · BEGINNER</small>
            <h3>2. COLOR THEORY MASTER</h3>
            <p>Explore harmonies, saturation, contrast ratios, and expressive palettes.</p>
            <div className="mission-bottom">
              <span>+150 XP</span>
              <button className="mission-btn poster-action-btn" onClick={() => handleStartMission(2)}>
                {completed.includes(2) ? "REPLAY MISSION ↻" : "START MISSION →"}
              </button>
            </div>
          </div>

          <div className="mission-card poster-mission-card">
            <div className="mission-top">
              <span className="mission-icon">✍️</span>
              <span className="free-tag">FREE</span>
            </div>
            <small className="poster-module-code">MOD 03 · INTERMEDIATE</small>
            <h3>3. TYPOGRAPHY CHALLENGE</h3>
            <p>Dial in kerning, leading, display scale, and serif + sans pairings.</p>
            <div className="mission-bottom">
              <span>+200 XP</span>
              <button className="mission-btn poster-action-btn" onClick={() => handleStartMission(3)}>
                {completed.includes(3) ? "REPLAY MISSION ↻" : "START MISSION →"}
              </button>
            </div>
          </div>

          <div className="mission-card poster-mission-card is-pro-card">
            <div className="mission-top">
              <span className="mission-icon">👑</span>
              <span className="premium-tag">PRO</span>
            </div>
            <small className="poster-module-code">MOD 04 · ADVANCED</small>
            <h3>4. PROFESSIONAL BRANDING</h3>
            <p>Build full identity systems, poster grids, and client pitch decks.</p>
            <div className="mission-bottom">
              <span>+500 XP</span>
              <button
                className="mission-btn poster-action-btn"
                onClick={() => alert("Unlock with DesignQuest Pro!")}
              >
                UNLOCK PRO ✦
              </button>
            </div>
          </div>
        </div>
      </section>

      <div id="world">
        <WorldMap
          xp={xp}
          completedMissions={completed}
          onOpenMissionForRealm={handleOpenMissionForRealm}
          onSelectRealmCategory={handleSelectRealmCategory}
        />
      </div>

      {/* Poster-Matched Mini-Game Section */}
      <section id="games" className="game-section poster-game-zone">
        <span className="poster-ribbon-mini">SPEED LAB</span>
        <h2>DESIGN MINI-GAME</h2>
        <p>Test your color intuition with fast contrast &amp; harmony picks.</p>

        <div className="game-card poster-game-card">
          <div className="poster-game-header">
            <span className="game-icon">🎯</span>
            <span className="poster-game-tag">COLOR CONTRAST</span>
          </div>
          <h3>COMPLEMENTARY COLOR MATCH</h3>
          <p>
            Which color pairs best with vibrant electric blue to create high-impact
            poster contrast?
          </p>
          <div className="answer-grid">
            <button
              type="button"
              className="answer-btn poster-answer-btn"
              onClick={() => alert("Correct! Warm Orange complements Blue with strong contrast.")}
            >
              WARM ORANGE
            </button>
            <button
              type="button"
              className="answer-btn poster-answer-btn"
              onClick={() => alert("Not quite — try a warm opposite hue!")}
            >
              DARK NAVY
            </button>
          </div>
        </div>
      </section>

      {/* Poster-Matched Pro Banner */}
      <section id="premium" className="premium-section poster-pro-banner">
        <div>
          <span className="poster-ribbon-mini">STUDIO ACCESS</span>
          <h2>UNLOCK DESIGNQUEST PRO</h2>
          <p>
            Get full access to pro branding modules, layout kits, and creator
            badges for your portfolio.
          </p>
        </div>
        <button
          type="button"
          className="premium-cta poster-pro-btn"
          onClick={() => alert("Redirecting to Pro checkout...")}
        >
          UPGRADE TO PRO ✦
        </button>
      </section>

      {activeMission && currentQuizData && (
        <div className="mission-overlay">
          <div className="mission-play-card">
            {!quizFinished ? (
              <>
                <h2>{currentQuizData.title}</h2>
                <div className="mission-progress">
                  <div
                    className="mission-progress-fill"
                    style={{ width: `${((currentQuestionIdx + 1) / currentQuizData.questions.length) * 100}%` }}
                  ></div>
                </div>
                <p><strong>Question {currentQuestionIdx + 1} of {currentQuizData.questions.length}</strong></p>
                <p style={{ margin: "15px 0", fontSize: "16px", color: "white" }}>
                  {currentQuizData.questions[currentQuestionIdx].question}
                </p>

                <div className="mission-options">
                  {currentQuizData.questions[currentQuestionIdx].options.map((opt, idx) => (
                    <button
                      key={idx}
                      className={`mission-option ${selectedOption === idx ? "selected" : ""}`}
                      onClick={() => !isAnswerSubmitted && setSelectedOption(idx)}
                    >
                      {opt}
                    </button>
                  ))}
                </div>

                {isAnswerSubmitted && (
                  <p className={selectedOption === currentQuizData.questions[currentQuestionIdx].correct ? "correct-feedback" : "wrong-feedback"}>
                    {selectedOption === currentQuizData.questions[currentQuestionIdx].correct ? "✨ Correct! " : "❌ Incorrect. "}
                    {currentQuizData.questions[currentQuestionIdx].explanation}
                  </p>
                )}

                {!isAnswerSubmitted ? (
                  <button
                    className="mission-submit"
                    disabled={selectedOption === null}
                    onClick={handleAnswerSubmit}
                  >
                    Submit Answer
                  </button>
                ) : (
                  <button
                    className="mission-submit"
                    onClick={handleNextQuestion}
                  >
                    {currentQuestionIdx < currentQuizData.questions.length - 1 ? "Next Question" : "Complete Mission 🎉"}
                  </button>
                )}

                <button className="mission-back" onClick={() => setActiveMission(null)}>
                  Exit Mission
                </button>
              </>
            ) : (
              <div style={{ textAlign: "center" }}>
                <h2>🎉 Mission Completed!</h2>
                <p style={{ margin: "20px 0" }}>You scored {quizScore} / {currentQuizData.questions.length} correct and earned <strong>+{currentQuizData.rewardXP} XP</strong>!</p>
                <button className="mission-submit" onClick={() => setActiveMission(null)}>
                  Return to Dashboard
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}