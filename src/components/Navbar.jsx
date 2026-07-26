import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutGrid,
  Plus,
  MessageSquare,
  Compass,
  BarChart3,
  Award,
  TrendingUp,
  ArrowDownUp,
  Archive,
  Flame,
  Leaf,
  Zap,
  Target,
  CheckCircle2,
  Sun,
  Moon,
  User,
  LogOut,
  Users,
  Mail,
  ClipboardList,
  GraduationCap,
  Menu,
  X,
} from "lucide-react";
import "./Navbar.css";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Review Queue", icon: LayoutGrid },
  { to: "/log", label: "Log Problem", icon: Plus },
  { to: "/problems", label: "All Problems", icon: MessageSquare },
  { to: "/assignments", label: "Assignments", icon: ClipboardList },
  { to: "/archive", label: "Archive", icon: Archive },
  { to: "/topics", label: "Topics", icon: Compass },
  { to: "/stats", label: "Stats", icon: BarChart3 },
  { to: "/achievements", label: "Achievements", icon: Award },
  { to: "/leaderboard", label: "Leaderboard", icon: TrendingUp },
  { to: "/import-export", label: "Import/Export", icon: ArrowDownUp },
  { to: "/about", label: "About", icon: Users },  
  { to: "/contact", label: "Contact", icon: Mail },
];

export default function Navbar({
  stats = {},
  dueCount = 0,
  solvedCount = 0,
  darkMode = true,
  toggleDark = () => {},
  onSignOut = () => {},
  isProfessor = false,
}) {
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navItems = isProfessor
    ? [
        { to: "/teacher", label: "Assign", icon: GraduationCap },
        { to: "/teacher/progress", label: "Progress", icon: ClipboardList },
      ]
    : NAV_ITEMS;

  // NOTE: confirm these three field names against useStats.js — I don't have
  // that file, so this is a best guess at how streak/rank/xp are named on
  // the stats object. dueCount and solvedCount are exact since they're
  // passed as their own props from App.jsx.
  const streak = stats?.streak ?? stats?.streak_days ?? 0;
  const rank = stats?.rank ?? "Novice";
  const xp = stats?.xp ?? stats?.total_xp ?? 0;

  return (
    <>
    <div className="tk-navbar">
      {/* top row: brand + stats + utility icons */}
      <div className="tk-topbar">
        <div className="tk-brand">
          <div className="tk-brand-mark">T</div>
          <span className="tk-brand-name">Track-It</span>
        </div>

        <div className="tk-stats">
          {!isProfessor && (
            <>
              <div className="tk-stat-streak-wrap">
                <span className="tk-ember tk-ember-1" aria-hidden="true" />
                <span className="tk-ember tk-ember-2" aria-hidden="true" />
                <span className="tk-ember tk-ember-3" aria-hidden="true" />
                <span className="tk-ember tk-ember-4" aria-hidden="true" />
                <span className="tk-ember tk-ember-5" aria-hidden="true" />
                <span className="tk-ember tk-ember-6" aria-hidden="true" />
                <div className="tk-stat tk-stat--streak">
                  <Flame size={18} strokeWidth={2.6} className="tk-stat-icon" />
                  <span className="tk-stat-value">{streak}d</span>
                  <span className="tk-stat-label">Streak</span>
                </div>
              </div>

              <div className="tk-stat tk-stat--rank">
                <Leaf size={15} strokeWidth={2.4} className="tk-stat-icon" />
                <span className="tk-stat-value">{rank}</span>
                <span className="tk-stat-label">Rank</span>
              </div>

              <div className="tk-stat tk-stat--xp">
                <Zap size={15} strokeWidth={2.4} className="tk-stat-icon" />
                <span className="tk-stat-value">{xp}</span>
                <span className="tk-stat-label">Xp</span>
              </div>

              <div className="tk-stat tk-stat--due">
                <Target size={15} strokeWidth={2.4} className="tk-stat-icon" />
                <span className="tk-stat-value">{dueCount}</span>
                <span className="tk-stat-label">Due</span>
              </div>

              <div className="tk-stat tk-stat--solved">
                <CheckCircle2 size={15} strokeWidth={2.4} className="tk-stat-icon" />
                <span className="tk-stat-value">{solvedCount}</span>
                <span className="tk-stat-label">Solved</span>
              </div>
            </>
          )}
        </div>

        <div className="tk-actions">
          <button
            className="tk-icon-btn tk-hamburger"
            aria-label={drawerOpen ? "Close menu" : "Open menu"}
            onClick={() => setDrawerOpen((v) => !v)}
          >
            {drawerOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
          <button className="tk-icon-btn" aria-label="Toggle theme" onClick={toggleDark}>
            {darkMode ? <Sun size={17} /> : <Moon size={17} />}
          </button>
          <button
            className="tk-icon-btn"
            aria-label="Profile"
            onClick={() => navigate("/profile")}
          >
            <User size={17} />
          </button>
          <button
            className="tk-icon-btn tk-icon-btn--danger"
            aria-label="Log out"
            onClick={onSignOut}
          >
            <LogOut size={17} />
          </button>
        </div>
      </div>

      <div className="tk-divider" />

      {/* single nav row, no duplicates — desktop/tablet only, replaced by the drawer on mobile */}
      <nav className="tk-nav tk-nav--desktop">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `tk-nav-item ${isActive ? "tk-nav-item--active" : ""}`
            }
          >
            <Icon size={16} strokeWidth={2.2} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </div>

      {/* mobile-only slide-in drawer nav — rendered OUTSIDE .tk-navbar deliberately:
          .tk-navbar has backdrop-filter, which (like `filter`) creates a new
          containing block for position:fixed descendants in modern browsers.
          Nesting the drawer inside it clipped the fixed drawer to the navbar's
          own (short) box instead of the full viewport — only the first couple
          items that fit inside that sliver were ever visible. */}
      {drawerOpen && (
        <div className="tk-drawer-backdrop" onClick={() => setDrawerOpen(false)} />
      )}
      <nav className={`tk-drawer ${drawerOpen ? "tk-drawer--open" : ""}`}>
        <div className="tk-drawer-header">
          <div className="tk-brand">
            <div className="tk-brand-mark">T</div>
            <span className="tk-brand-name">Track-It</span>
          </div>
          <button className="tk-icon-btn" aria-label="Close menu" onClick={() => setDrawerOpen(false)}>
            <X size={18} />
          </button>
        </div>
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => setDrawerOpen(false)}
            className={({ isActive }) =>
              `tk-drawer-item ${isActive ? "tk-drawer-item--active" : ""}`
            }
          >
            <Icon size={18} strokeWidth={2.2} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </>
  );
}