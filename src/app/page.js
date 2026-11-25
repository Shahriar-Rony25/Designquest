"use client";

import { useState, useEffect } from "react";

export default function HomePage() {
  // Persistent XP and Progress State (safe in Next.js SSR + client)
  const [xp, setXp] = useState(120);
  const [completed, setCompleted] = useState([]);
  const [colorRewards, setColorRewards] = useState([false, false, false]);
  const [hasLoaded, setHasLoaded] = useState(false);

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

  // Save progress automatically after initial load
  useEffect(() => {
    if (!hasLoaded) return;
    localStorage.setItem(
      "designquest-progress",
      JSON.stringify({ xp, completed, colorRewards })
    );
  }, [xp, completed, colorRewards, hasLoaded]);

  // Level Calculations
  const level = Math.floor(xp / 500) + 1;
  const progressPercent = Math.min(100, (xp % 500) / 5);

  // Mission Modal State
  const [activeMission, setActiveMission] = useState(null);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  // World Map Modal State
  const [selectedWorld, setSelectedWorld] = useState(null);

  // Quiz Datasets for Missions 1, 2, and 3
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

  // World Map Data
  const worldsData = [
    { id: 1, name: "Design Island", reqXP: 0, icon: "🏝️", desc: "The starting grounds where every creator learns core foundational elements like contrast and alignment.", unlocked: true },
    { id: 2, name: "Color Kingdom", reqXP: 150, icon: "🏰", desc: "A vibrant realm ruled by palettes, harmonies, and contrast ratios.", unlocked: xp >= 150 },
    { id: 3, name: "Typography City", reqXP: 300, icon: "🏙️", desc: "A towering metropolis dedicated to font pairings, kerning, leading, and legibility.", unlocked: xp >= 300 },
    { id: 4, name: "Creative Valley", reqXP: 500, icon: "🌄", desc: "An advanced expanse focusing on layout flow, branding systems, and visual pacing.", unlocked: xp >= 500 },
    { id: 5, name: "Pro Designer World", reqXP: 800, icon: "👑", desc: "The ultimate peak for master creators building professional portfolios and client case studies.", unlocked: xp >= 800 }
  ];

  return (
    <>
      {/* Hero Section */}
      <header id="home" className="hero">
        <div className="hero-content">
          <span className="eyebrow">GAMIFIED CREATIVE ECOSYSTEM</span>
          <h1>Level Up Your <span>Design Skills</span> & Portfolio</h1>
          <p>Embark on creative adventures, master graphic design principles through interactive missions, and showcase your work to the community.</p>
          <a href="#missions" className="primary-btn">
            Start Learning Now 🚀
          </a>
        </div>
        <div className="hero-visual">
          <div className="floating-card">
            <span>🏆</span>
            <div>
              <strong>Level {level} Creator</strong>
              <small>Design Explorer</small>
            </div>
          </div>
          <div className="hero-art">🎨</div>
          <div className="floating-xp">+{xp} XP Total</div>
        </div>
      </header>

      {/* Stats Bar */}
      <section className="stats">
        <div className="stat-card">
          <span>⚡</span>
          <div>
            <strong>{xp} XP</strong>
            <small>Experience Points</small>
          </div>
        </div>
        <div className="stat-card">
          <span>⭐</span>
          <div>
            <strong>Level {level}</strong>
            <small>Current Rank</small>
          </div>
        </div>
        <div className="stat-card">
          <span>🎯</span>
          <div>
            <strong>{completed.length} Completed</strong>
            <small>Missions Done</small>
          </div>
        </div>
        <div className="stat-card">
          <span>🔥</span>
          <div>
            <strong>Active</strong>
            <small>Streak Status</small>
          </div>
        </div>
      </section>

      {/* Level Progress Section */}
      <section className="level-section">
        <div className="section-heading">
          <div>
            <h2>Your Journey Progress</h2>
            <p>Earn XP from quizzes and missions to rank up your designer profile.</p>
          </div>
          <span className="world-rank">Rank: Level {level}</span>
        </div>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${progressPercent}%` }}></div>
        </div>
        <small>{xp % 500} / 500 XP to Level {level + 1}</small>
      </section>

      {/* Missions Section */}
      <section id="missions" className="missions-section">
        <div className="section-heading">
          <div>
            <h2>Creative Missions</h2>
            <p>Complete hands-on modules to sharpen your design abilities.</p>
          </div>
          <strong>{completed.length}/4 Completed</strong>
        </div>

        <div className="mission-grid">
          <div className="mission-card">
            <div className="mission-top">
              <span className="mission-icon">💡</span>
              <span className="free-tag">FREE</span>
            </div>
            <small>BEGINNER MODULE</small>
            <h3>1. Design Fundamentals</h3>
            <p>Learn core foundational principles including contrast, alignment, and visual hierarchy.</p>
            <div className="mission-bottom">
              <span>+100 XP</span>
              <button className="mission-btn" onClick={() => handleStartMission(1)}>
                {completed.includes(1) ? "Replay Mission" : "Start Mission"}
              </button>
            </div>
          </div>

          <div className="mission-card">
            <div className="mission-top">
              <span className="mission-icon">🎨</span>
              <span className="free-tag">FREE</span>
            </div>
            <small>BEGINNER MODULE</small>
            <h3>2. Color Theory Master</h3>
            <p>Explore palettes, contrast ratios, and color harmonies for stunning digital compositions.</p>
            <div className="mission-bottom">
              <span>+150 XP</span>
              <button className="mission-btn" onClick={() => handleStartMission(2)}>
                {completed.includes(2) ? "Replay Mission" : "Start Mission"}
              </button>
            </div>
          </div>

          <div className="mission-card">
            <div className="mission-top">
              <span className="mission-icon">✍️</span>
              <span className="free-tag">FREE</span>
            </div>
            <small>INTERMEDIATE MODULE</small>
            <h3>3. Typography Challenge</h3>
            <p>Master font pairings, tracking, leading, and pairing serif with sans-serif fonts.</p>
            <div className="mission-bottom">
              <span>+200 XP</span>
              <button className="mission-btn" onClick={() => handleStartMission(3)}>
                {completed.includes(3) ? "Replay Mission" : "Start Mission"}
              </button>
            </div>
          </div>

          <div className="mission-card">
            <div className="mission-top">
              <span className="mission-icon">👑</span>
              <span className="premium-tag">PREMIUM</span>
            </div>
            <small>ADVANCED MODULE</small>
            <h3>4. Professional Branding</h3>
            <p>Build complete brand identity systems, guidelines, and client presentation decks.</p>
            <div className="mission-bottom">
              <span>+500 XP</span>
              <button className="mission-btn" onClick={() => alert("Unlock with Premium Membership!")}>
                Unlock Premium
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* World Map Section */}
      <section id="world" className="world-section">
        <div className="section-heading">
          <div>
            <h2>DesignQuest World Map</h2>
            <p>Click any world node below to inspect its realm and requirements.</p>
          </div>
          <span className="world-rank">Current World: Level {level}</span>
        </div>

        <div className="world-map">
          <div className="map-path"></div>
          {worldsData.map((world) => (
            <div
              key={world.id}
              className={`world-node ${world.unlocked ? "unlocked" : "locked"} ${level === world.id ? "active-node" : ""}`}
              onClick={() => setSelectedWorld(world)}
            >
              <span className="node-icon">{world.icon}</span>
              <span className="node-number">WORLD {world.id}</span>
              <strong>{world.name}</strong>
              <small>{world.unlocked ? "🔓 Unlocked" : `🔒 Req: ${world.reqXP} XP`}</small>
            </div>
          ))}
        </div>

        {selectedWorld && (
          <div className="world-details">
            <div className="world-detail-content">
              <span className="detail-icon">{selectedWorld.icon}</span>
              <div>
                <h3>World {selectedWorld.id}: {selectedWorld.name}</h3>
                <p>{selectedWorld.desc}</p>
                <small>Required XP: {selectedWorld.reqXP} XP {selectedWorld.unlocked ? "— Status: Unlocked & Accessible!" : "— Status: Locked (Keep earning XP!)"}</small>
              </div>
            </div>
            <button className="mission-btn" onClick={() => setSelectedWorld(null)}>Close Details</button>
          </div>
        )}
      </section>

      {/* Mini Games Section */}
      <section id="games" className="game-section">
        <h2>Design Mini-Game</h2>
        <p>Test your intuition with quick color matching challenges.</p>
        <div className="game-card">
          <span className="game-icon">🎯</span>
          <h3>Complementary Color Match</h3>
          <p>Which color pairs best with vibrant electric blue to create strong visual contrast?</p>
          <div className="answer-grid">
            <button
              className="answer-btn"
              onClick={() => alert("Correct! Orange complements Blue perfectly.")}
            >
              Warm Orange
            </button>
            <button
              className="answer-btn"
              onClick={() => alert("Not quite. Try a complementary warm tone!")}
            >
              Dark Navy
            </button>
          </div>
        </div>
      </section>

      {/* Premium Section */}
      <section id="premium" className="premium-section">
        <div>
          <h2>Unlock DesignQuest Pro</h2>
          <p>Get unlimited access to advanced branding masterclasses, mentorship sessions, and exclusive portfolio badges.</p>
        </div>
        <button className="premium-cta" onClick={() => alert("Redirecting to checkout...")}>
          Upgrade to Pro ✨
        </button>
      </section>

      {/* Mission Quiz Modal */}
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