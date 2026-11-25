"use client";
import { useState, useEffect } from "react";
import "./Profile.css";

export default function Profile({ xp, completed }) {
  const [username, setUsername] = useState("Rony_Clicks");
  const [bio, setBio] = useState("UI/UX enthusiast, graphic designer & CSE Fest judge.");
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const savedUsername = window.localStorage.getItem("designquest-username");
    if (savedUsername) setUsername(savedUsername);

    const savedBio = window.localStorage.getItem("designquest-bio");
    if (savedBio) setBio(savedBio);
  }, []);

  const level = Math.floor(xp / 500) + 1;

  const handleSave = (e) => {
    e.preventDefault();
    localStorage.setItem("designquest-username", username);
    localStorage.setItem("designquest-bio", bio);
    window.dispatchEvent(new Event("designquest-username-updated"));
    setIsEditing(false);
  };

  return (
    <div className="profile-container">
      <div className="profile-header-card">
        <div className="profile-avatar">🎨</div>
        <div className="profile-info">
          {!isEditing ? (
            <>
              <h2>{username}</h2>
              <p className="profile-bio">{bio}</p>
              <button className="primary-btn" onClick={() => setIsEditing(true)}>Edit Profile</button>
            </>
          ) : (
            <form onSubmit={handleSave} className="edit-profile-form">
              <input 
                type="text" 
                value={username} 
                onChange={e => setUsername(e.target.value)} 
                required 
              />
              <textarea 
                value={bio} 
                onChange={e => setBio(e.target.value)} 
              />
              <button type="submit" className="primary-btn">Save Profile</button>
            </form>
          )}
        </div>
      </div>

      <div className="profile-stats-grid">
        <div className="stat-card">
          <span>⚡</span>
          <div>
            <strong>{xp} XP</strong>
            <small>Total Experience</small>
          </div>
        </div>
        <div className="stat-card">
          <span>⭐</span>
          <div>
            <strong>Level {level}</strong>
            <small>Creator Rank</small>
          </div>
        </div>
        <div className="stat-card">
          <span>🎯</span>
          <div>
            <strong>{completed.length} / 4</strong>
            <small>Missions Completed</small>
          </div>
        </div>
      </div>
    </div>
  );
}