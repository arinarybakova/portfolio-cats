import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const styles = `
  * { box-sizing: border-box; }
  .auth-page {
    min-height: 100vh;
    display: grid;
    place-items: center;
    padding: 18px;
    color: white;
    font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
    background: radial-gradient(circle at top, rgba(34,211,238,0.14), transparent 30%),
                radial-gradient(circle at right, rgba(217,70,239,0.14), transparent 28%),
                linear-gradient(180deg, #111827 0%, #0f172a 45%, #020617 100%);
  }
  .auth-shell {
    width: 100%;
    max-width: 1120px;
    display: grid;
    grid-template-columns: 1.05fr 0.95fr;
    gap: 18px;
    align-items: stretch;
  }
  .hero-panel, .form-panel {
    border-radius: 28px;
    border: 1px solid rgba(255,255,255,0.08);
    background: rgba(15, 23, 42, 0.86);
    box-shadow: 0 10px 30px rgba(0,0,0,0.22);
  }
  .hero-panel {
    padding: 34px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    min-height: 680px;
    position: relative;
    overflow: hidden;
  }
  .hero-panel::before {
    content: "";
    position: absolute;
    inset: auto -80px -80px auto;
    width: 260px;
    height: 260px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(245,158,11,0.30), transparent 68%);
    pointer-events: none;
  }
  .hero-badge {
    display: inline-flex;
    align-items: center;
    width: fit-content;
    padding: 8px 14px;
    border-radius: 999px;
    border: 1px solid rgba(255,255,255,0.10);
    background: rgba(255,255,255,0.05);
    font-size: 12px;
    color: rgba(255,255,255,0.88);
  }
  .hero-title {
    margin: 20px 0 12px;
    font-size: clamp(38px, 6vw, 70px);
    line-height: 0.98;
    font-weight: 900;
    letter-spacing: -0.05em;
    background: linear-gradient(90deg, #fff, #dbeafe, #f5d0fe);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
  }
  .hero-subtitle {
    margin: 0;
    max-width: 580px;
    font-size: 16px;
    line-height: 1.7;
    color: #dbe4f2;
  }
  .hero-stats {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 12px;
    margin-top: 24px;
  }
  .stat-card {
    padding: 14px;
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
    font-size: 22px;
    font-weight: 900;
  }
  .feature-list {
    display: grid;
    gap: 12px;
    margin-top: 26px;
  }
  .feature-item {
    padding: 14px 16px;
    border-radius: 18px;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.06);
    color: #dbe4f2;
  }
  .form-panel {
    padding: 26px;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
  .form-card {
    padding: 10px;
  }
  .form-badge {
    display: inline-flex;
    align-items: center;
    padding: 8px 14px;
    border-radius: 999px;
    border: 1px solid rgba(255,255,255,0.10);
    background: rgba(255,255,255,0.05);
    font-size: 12px;
    color: rgba(255,255,255,0.88);
    margin-bottom: 14px;
  }
  .form-title {
    margin: 0 0 8px;
    font-size: 34px;
    font-weight: 900;
    letter-spacing: -0.04em;
  }
  .form-subtitle {
    margin: 0 0 20px;
    color: #94a3b8;
    line-height: 1.6;
  }
  .tabs {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
    margin-bottom: 18px;
  }
  .tab-btn {
    border: 1px solid rgba(255,255,255,0.08);
    background: rgba(255,255,255,0.05);
    color: white;
    border-radius: 16px;
    padding: 12px 14px;
    cursor: pointer;
    font-weight: 800;
  }
  .tab-btn.active {
    background: linear-gradient(90deg, #22d3ee, #d946ef, #f59e0b);
    border-color: transparent;
  }
  .stack {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }
  .field {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .field label {
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: #cbd5e1;
    font-weight: 700;
  }
  .input {
    width: 100%;
    border: 1px solid rgba(255,255,255,0.10);
    background: rgba(255,255,255,0.06);
    color: white;
    border-radius: 16px;
    padding: 14px 15px;
    outline: none;
  }
  .input::placeholder {
    color: #94a3b8;
  }
  .error-box {
    border-radius: 16px;
    padding: 12px 14px;
    background: rgba(239,68,68,0.12);
    border: 1px solid rgba(239,68,68,0.22);
    color: #fecaca;
    font-size: 14px;
  }
  .btn, .btn-outline {
    border: 0;
    cursor: pointer;
    font-weight: 800;
    border-radius: 16px;
    padding: 14px 16px;
    transition: opacity .15s ease;
  }
  .btn:hover, .btn-outline:hover {
    opacity: 0.96;
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
  .bottom-note {
    margin-top: 16px;
    color: #94a3b8;
  }
  .bottom-note a {
    color: white;
    font-weight: 800;
    text-decoration: none;
  }
  @media (max-width: 980px) {
    .auth-shell {
      grid-template-columns: 1fr;
    }
    .hero-panel {
      min-height: auto;
    }
  }
  @media (max-width: 720px) {
    .auth-page {
      padding: 12px;
    }
    .hero-panel, .form-panel {
      border-radius: 22px;
      padding: 18px;
    }
    .hero-stats {
      grid-template-columns: 1fr;
    }
  }
`;

type AccountType = "USER" | "ADMIN";

export default function Login() {
  const navigate = useNavigate();
  const [role, setRole] = useState<AccountType>("USER");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          role,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        const backendMessage = data?.error || "Login failed";

        const prettyMessage =
          backendMessage === "Selected account type does not match this user"
            ? "The selected account type does not match this profile. Please switch between User and Admin and try again."
            : backendMessage;

        throw new Error(prettyMessage);
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      window.dispatchEvent(new Event("authChanged"));

      if (String(data.user.role).toUpperCase() === "ADMIN") {
        navigate("/dashboard");
      } else {
        navigate("/cats");
      }
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{styles}</style>
      <div className="auth-page">
        <div className="auth-shell">
          <div className="hero-panel">
            <div>
              <div className="hero-badge">Cat Shelter Access</div>
              <h1 className="hero-title">Welcome back to your adoption hub.</h1>
              <p className="hero-subtitle">
                Log in as a user or admin and continue managing cats, owners,
                breeds, and dashboard insights in one workspace.
              </p>

              <div className="hero-stats">
                <div className="stat-card">
                  <div className="stat-label">Accounts</div>
                  <div className="stat-value">User + Admin</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Security</div>
                  <div className="stat-value">JWT Auth</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Access</div>
                  <div className="stat-value">Role Based</div>
                </div>
              </div>
            </div>

            <div className="feature-list">
              <div className="feature-item">
                Track cats, breeds, owners, and adoptions in a single polished
                admin system.
              </div>
              <div className="feature-item">
                Switch cleanly between user and admin account types from the
                login experience.
              </div>
              <div className="feature-item">
                Designed for real flows and future Playwright end-to-end
                coverage.
              </div>
            </div>
          </div>

          <div className="form-panel">
            <div className="form-card">
              <div className="form-badge">Sign In</div>
              <h2 className="form-title">Login</h2>
              <p className="form-subtitle">
                Choose your account type and enter your credentials to continue.
              </p>

              <div className="tabs">
                <button
                  type="button"
                  className={`tab-btn ${role === "USER" ? "active" : ""}`}
                  onClick={() => setRole("USER")}
                >
                  User
                </button>
                <button
                  type="button"
                  className={`tab-btn ${role === "ADMIN" ? "active" : ""}`}
                  onClick={() => setRole("ADMIN")}
                >
                  Admin
                </button>
              </div>

              <form className="stack" onSubmit={handleLogin}>
                <div className="field">
                  <label>Email</label>
                  <input
                    className="input"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    data-testid="login-email"
                  />
                </div>

                <div className="field">
                  <label>Password</label>
                  <input
                    className="input"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    data-testid="login-password"
                  />
                </div>

                {error ? (
                  <div className="error-box" data-testid="login-error">
                    {error}
                  </div>
                ) : null}

                <button
                  className="btn"
                  type="submit"
                  disabled={loading}
                  data-testid="login-submit"
                >
                  {loading
                    ? "Signing In..."
                    : `Login as ${role === "ADMIN" ? "Admin" : "User"}`}
                </button>

                <button
                  type="button"
                  className="btn-outline"
                  onClick={() => navigate("/")}
                >
                  Back to Home
                </button>
              </form>

              <div className="bottom-note">
                Don’t have an account?{" "}
                <Link to="/register">Create one here</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
