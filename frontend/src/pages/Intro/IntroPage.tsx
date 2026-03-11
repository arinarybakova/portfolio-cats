import React from "react";
import { Link } from "react-router-dom";

const styles = `
  * { box-sizing: border-box; }
  .intro-page {
    min-height: 100vh;
    display: grid;
    place-items: center;
    padding: 18px;
    color: white;
    font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
    background:
      radial-gradient(circle at top, rgba(34,211,238,0.14), transparent 30%),
      radial-gradient(circle at right, rgba(217,70,239,0.14), transparent 28%),
      linear-gradient(180deg, #111827 0%, #0f172a 45%, #020617 100%);
  }
  .intro-shell {
    width: 100%;
    max-width: 1160px;
    border-radius: 28px;
    border: 1px solid rgba(255,255,255,0.08);
    background: rgba(15, 23, 42, 0.88);
    box-shadow: 0 10px 30px rgba(0,0,0,0.22);
    padding: 34px;
    overflow: hidden;
  }
  .hero {
    display: grid;
    grid-template-columns: 1.1fr 0.9fr;
    gap: 20px;
    align-items: stretch;
  }
  .hero-left, .hero-right {
    border-radius: 24px;
    border: 1px solid rgba(255,255,255,0.08);
    background: rgba(255,255,255,0.04);
    padding: 24px;
  }
  .badge {
    display: inline-flex;
    align-items: center;
    padding: 8px 14px;
    border-radius: 999px;
    border: 1px solid rgba(255,255,255,0.1);
    background: rgba(255,255,255,0.05);
    font-size: 12px;
    color: rgba(255,255,255,0.86);
  }
  .title {
    margin: 18px 0 10px;
    font-size: clamp(40px, 7vw, 72px);
    line-height: 0.95;
    font-weight: 900;
    letter-spacing: -0.05em;
    background: linear-gradient(90deg, #fff, #dbeafe, #f5d0fe);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
  }
  .subtitle {
    margin: 0;
    max-width: 720px;
    color: #dbe4f2;
    font-size: 17px;
    line-height: 1.7;
  }
  .actions {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
    margin-top: 28px;
  }
  .btn, .btn-outline {
    text-decoration: none;
    border: 0;
    cursor: pointer;
    font-weight: 800;
    border-radius: 16px;
    padding: 14px 18px;
  }
  .btn {
    color: white;
    background: linear-gradient(90deg, #22d3ee, #d946ef, #f59e0b);
  }
  .btn-outline {
    color: white;
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.10);
  }
  .stats-grid {
    display: grid;
    gap: 12px;
  }
  .stat-card {
    padding: 16px;
    border-radius: 18px;
    border: 1px solid rgba(255,255,255,0.08);
    background: rgba(255,255,255,0.04);
  }
  .stat-label {
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: #cbd5e1;
    font-weight: 700;
    margin-bottom: 8px;
  }
  .stat-value {
    font-size: 24px;
    font-weight: 900;
  }
  .muted {
    margin-top: 8px;
    color: #94a3b8;
    line-height: 1.6;
  }
  @media (max-width: 960px) {
    .hero {
      grid-template-columns: 1fr;
    }
  }
`;

export default function Intro() {
  return (
    <>
      <style>{styles}</style>
      <div className="intro-page">
        <div className="intro-shell">
          <div className="hero">
            <div className="hero-left">
              <div className="badge">Premium Cat Shelter Platform</div>
              <h1 className="title">Role-based shelter management.</h1>
              <p className="subtitle">
                Guests see this intro page. Admins manage all cats, users, and dashboard data.
                Users see only their own details and owned cats.
              </p>

              <div className="actions">
                <Link className="btn" to="/login">Login</Link>
                <Link className="btn-outline" to="/register">Register</Link>
              </div>
            </div>

            <div className="hero-right">
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-label">Guest</div>
                  <div className="stat-value">Intro + Auth</div>
                  <div className="muted">Only intro, login, and register pages.</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">User</div>
                  <div className="stat-value">Own Data</div>
                  <div className="muted">Only own user details and owned cats list.</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Admin</div>
                  <div className="stat-value">Full Access</div>
                  <div className="muted">Dashboard, users, all cats, and full management.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}