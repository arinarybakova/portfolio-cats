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
    min-height: 700px;
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
  .hero-grid {
    display: grid;
    gap: 12px;
    margin-top: 26px;
  }
  .hero-card {
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
  }
`;

type AccountType = "USER" | "ADMIN";

export default function Register() {
  const navigate = useNavigate();
  const [role, setRole] = useState<AccountType>("USER");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
          role,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Registration failed");
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      if (String(data.user.role).toUpperCase() === "ADMIN") {
        navigate("/dashboard");
      } else {
        navigate("/cats");
      }
    } catch (err: any) {
      setError(err.message || "Registration failed");
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
              <div className="hero-badge">Create Access</div>
              <h1 className="hero-title">Join the shelter platform in style.</h1>
              <p className="hero-subtitle">
                Register a new user or admin account and start managing cats, owners, analytics, and platform activity.
              </p>
            </div>

            <div className="hero-grid">
              <div className="hero-card">Create user accounts for adoption flows and profile management.</div>
              <div className="hero-card">Create admin accounts for dashboard insights and full system control.</div>
              <div className="hero-card">Same UI language as the rest of the platform for a good experience.</div>
            </div>
          </div>

          <div className="form-panel">
            <div>
              <div className="form-badge">Create Account</div>
              <h2 className="form-title">Register</h2>
              <p className="form-subtitle">
                Pick the account type, fill in your details, and create access instantly.
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

              <form className="stack" onSubmit={handleRegister}>
                <div className="field">
                  <label>Name</label>
                  <input
                    className="input"
                    type="text"
                    placeholder="Your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    data-testid="register-name"
                  />
                </div>

                <div className="field">
                  <label>Email</label>
                  <input
                    className="input"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    data-testid="register-email"
                  />
                </div>

                <div className="field">
                  <label>Password</label>
                  <input
                    className="input"
                    type="password"
                    placeholder="Create a password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    data-testid="register-password"
                  />
                </div>

                {error ? <div className="error-box">{error}</div> : null}

                <button className="btn" type="submit" disabled={loading} data-testid="register-submit">
                  {loading ? "Creating Account..." : `Register as ${role === "ADMIN" ? "Admin" : "User"}`}
                </button>

                <button type="button" className="btn-outline" onClick={() => navigate("/")}>
                  Back to Home
                </button>
              </form>

              <div className="bottom-note">
                Already have an account? <Link to="/login">Go to login</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}