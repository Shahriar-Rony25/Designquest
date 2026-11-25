import Link from "next/link";
import "./globals.css";

export const metadata = {
  title: "DesignQuest",
  description: "Gamified Graphic Design Learning & Community Portfolio",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <div className="app">
          <nav className="navbar">
            <Link href="/" className="logo">
              Design<span>Quest</span>
            </Link>
            <div className="nav-links">
              <Link href="/">Home</Link>
              <Link href="/#missions">Missions</Link>
              <Link href="/#world">World Map</Link>
              <Link href="/#games">Mini Games</Link>
              <Link href="/courses">Courses</Link>
              <Link href="/portfolio">Portfolio</Link>
              <Link href="/profile">Profile</Link>
              <Link href="/#premium">Premium</Link>
            </div>
            <Link href="/profile" className="profile-btn">
              👤 Profile / Portfolio
            </Link>
          </nav>

          {children}

          <footer>
            <p>DesignQuest — Gamified Graphic Learning & Community Portfolio</p>
            <small>© 2026 DesignQuest. All rights reserved.</small>
          </footer>
        </div>
      </body>
    </html>
  );
}