import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { getStoredUser, logout } from "../utils/auth";

type User = {
  id?: number;
  name?: string;
  role?: string;
};

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<User | null>(getStoredUser());

  useEffect(() => {
    const refreshUser = () => {
      setUser(getStoredUser());
    };

    refreshUser();

    window.addEventListener("storage", refreshUser);
    window.addEventListener("authChanged", refreshUser as EventListener);

    return () => {
      window.removeEventListener("storage", refreshUser);
      window.removeEventListener("authChanged", refreshUser as EventListener);
    };
  }, []);

  const handleLogout = () => {
    logout();
    setUser(null);
    window.dispatchEvent(new Event("authChanged"));
    navigate("/puzzle");
  };

  const loggedIn = Boolean(user);
  const admin = String(user?.role ?? "").toLowerCase() === "admin";

  const isActive = (path: string) => location.pathname === path;

  const linkStyle = (path: string): React.CSSProperties => ({
    color: isActive(path) ? "#ffffff" : "#dbe4f2",
    textDecoration: "none",
    fontWeight: 800,
    whiteSpace: "nowrap",
    padding: "10px 14px",
    borderRadius: "14px",
    border: isActive(path)
      ? "1px solid rgba(255,255,255,0.14)"
      : "1px solid transparent",
    background: isActive(path)
      ? "linear-gradient(90deg, rgba(34,211,238,0.20), rgba(217,70,239,0.18), rgba(245,158,11,0.14))"
      : "transparent",
    boxShadow: isActive(path) ? "0 8px 22px rgba(0,0,0,0.18)" : "none",
    transition: "all 0.18s ease",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
  });

  const buttonStyle: React.CSSProperties = {
    color: "#dbe4f2",
    background: "transparent",
    border: "1px solid transparent",
    fontWeight: 800,
    cursor: "pointer",
    padding: "10px 14px",
    fontSize: "16px",
    whiteSpace: "nowrap",
    borderRadius: "14px",
    transition: "all 0.18s ease",
  };

  return (
    <>
      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          width: "100%",
          minHeight: "72px",
          background:
            "linear-gradient(180deg, rgba(15,23,42,0.96) 0%, rgba(15,23,42,0.92) 100%)",
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "20px",
          padding: "12px 28px",
          boxSizing: "border-box",
          boxShadow: "0 10px 30px rgba(0,0,0,0.30)",
          zIndex: 1000,
          fontFamily:
            "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
        }}
      >
        <h2 style={{ margin: 0, flexShrink: 0, fontSize: "24px", letterSpacing: "-0.03em" }}>
          <Link
            to="/puzzle"
            style={{
              textDecoration: "none",
              fontWeight: 900,
              color: "white",
              background: "linear-gradient(90deg, #fff, #dbeafe, #f5d0fe)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Portfolio Cats
          </Link>
        </h2>

        <div
          style={{
            display: "flex",
            gap: "10px",
            alignItems: "center",
            justifyContent: "flex-end",
            flexWrap: "wrap",
            flex: 1,
          }}
        >
          {!loggedIn && (
            <>
              <Link to="/puzzle" style={linkStyle("/puzzle")}>
                Puzzle
              </Link>
              <Link to="/login" style={linkStyle("/login")}>
                Login
              </Link>
              <Link to="/register" style={linkStyle("/register")}>
                Register
              </Link>
            </>
          )}

          {loggedIn && admin && (
            <>
              <Link to="/dashboard" style={linkStyle("/dashboard")}>
                Dashboard
              </Link>
              <Link to="/users" style={linkStyle("/users")}>
                Users
              </Link>
              <Link to="/cats" style={linkStyle("/cats")}>
                Cats
              </Link>
              <Link to="/puzzle" style={linkStyle("/puzzle")}>
                Puzzle
              </Link>
              <Link to="/me" style={linkStyle("/me")}>
                My Profile
              </Link>
              <button type="button" onClick={handleLogout} style={buttonStyle}>
                Logout
              </button>
            </>
          )}

          {loggedIn && !admin && (
            <>
              <Link to="/cats" style={linkStyle("/cats")}>
                Cats
              </Link>
              <Link to="/puzzle" style={linkStyle("/puzzle")}>
                Puzzle
              </Link>
              <Link to="/me" style={linkStyle("/me")}>
                My Profile
              </Link>
              <button type="button" onClick={handleLogout} style={buttonStyle}>
                Logout
              </button>
            </>
          )}
        </div>
      </nav>
    </>
  );
}