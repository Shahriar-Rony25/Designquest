"use client";
import { useState, useEffect } from "react";
import "./Courses.css";

const defaultCourses = [
  {
    id: 1,
    title: "UI/UX Design Masterclass",
    category: "Product Design",
    level: "Beginner to Intermediate",
    instructor: "Rony_Clicks",
    description: "Learn wireframing, user flows, color accessibility, and high-fidelity prototyping using modern design tools.",
    lessons: [
      { id: 101, title: "1. Introduction to UX Research & Wireframes", duration: "15m", completed: false },
      { id: 102, title: "2. Grids, Layouts, and Spacing Rules", duration: "20m", completed: false },
      { id: 103, title: "3. Prototyping Interactions in Figma", duration: "25m", completed: false }
    ]
  },
  {
    id: 2,
    title: "Advanced Brand Identity Systems",
    category: "Branding",
    level: "Advanced",
    instructor: "DesignQuest Team",
    description: "Master logo design geometry, brand guidelines, typography hierarchies, and client presentation decks.",
    lessons: [
      { id: 201, title: "1. Conceptualizing Unique Logo Marks", duration: "18m", completed: false },
      { id: 202, title: "2. Building Comprehensive Brand Books", duration: "30m", completed: false }
    ]
  }
];

export default function Courses() {
  const [courses, setCourses] = useState(defaultCourses);

  useEffect(() => {
    const saved = window.localStorage.getItem("designquest-courses");
    if (saved) {
      try {
        setCourses(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved courses:", e);
      }
    }
  }, []);
  const [activeCourse, setActiveCourse] = useState(null);

  useEffect(() => {
    localStorage.setItem("designquest-courses", JSON.stringify(courses));
  }, [courses]);

  const toggleLesson = (courseId, lessonId) => {
    setCourses(prev => prev.map(course => {
      if (course.id !== courseId) return course;
      const updatedLessons = course.lessons.map(l => 
        l.id === lessonId ? { ...l, completed: !l.completed } : l
      );
      return { ...course, lessons: updatedLessons };
    }));
  };

  return (
    <div className="courses-container">
      <div className="courses-header">
        <h2>📚 DesignQuest Academy Courses</h2>
        <p>Structured masterclasses designed to elevate your creative expertise.</p>
      </div>

      <div className="courses-grid">
        {courses.map(course => {
          const completedCount = course.lessons.filter(l => l.completed).length;
          const progress = Math.round((completedCount / course.lessons.length) * 100);

          return (
            <div key={course.id} className="course-card">
              <span className="course-cat">{course.category}</span>
              <h3>{course.title}</h3>
              <p className="course-desc">{course.description}</p>
              <div className="course-meta">
                <span>👤 {course.instructor}</span>
                <span>⭐ {course.level}</span>
              </div>
              
              <div className="course-progress-bar">
                <div className="course-progress-fill" style={{ width: `${progress}%` }}></div>
              </div>
              <small>{completedCount} / {course.lessons.length} Lessons Completed ({progress}%)</small>

              <button className="primary-btn" style={{ width: "100%", marginTop: "15px" }} onClick={() => setActiveCourse(course)}>
                {progress === 100 ? "Review Course 🎉" : "Continue Learning 🚀"}
              </button>
            </div>
          );
        })}
      </div>

      {activeCourse && (
        <div className="modal-overlay" onClick={() => setActiveCourse(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="close-modal" onClick={() => setActiveCourse(null)}>✕</button>
            <h2>{activeCourse.title}</h2>
            <p style={{ color: "#aaa8bc", margin: "10px 0 20px" }}>{activeCourse.description}</p>
            
            <h3>Course Curriculum</h3>
            <div className="lesson-list">
              {activeCourse.lessons.map(lesson => (
                <div key={lesson.id} className="lesson-item" onClick={() => toggleLesson(activeCourse.id, lesson.id)}>
                  <input 
                    type="checkbox" 
                    checked={lesson.completed} 
                    onChange={() => {}} 
                  />
                  <span style={{ textDecoration: lesson.completed ? "line-through" : "none", color: lesson.completed ? "#4ade80" : "white" }}>
                    {lesson.title}
                  </span>
                  <small style={{ marginLeft: "auto", color: "#aaa8bc" }}>{lesson.duration}</small>
                </div>
              ))}
            </div>

            <button className="primary-btn" style={{ width: "100%", marginTop: "20px" }} onClick={() => setActiveCourse(null)}>
              Save & Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}