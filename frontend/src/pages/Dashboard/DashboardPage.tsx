import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

type Overview = {
  totalCats: number;
  availableCats: number;
  adoptedCats: number;
  pendingCats: number;
  totalUsers: number;
  totalBreeds: number;
  ownersCount: number;
};

type BreedStat = {
  id: number;
  name: string;
  count: number;
};

type StatusStat = {
  status: string;
  count: number;
};

type Cat = {
  id: number;
  name: string;
  age: number;
  status: string;
  image?: string;
  breed?: {
    id: number;
    name: string;
  };
  owner?: {
    id: number;
    name: string;
  } | null;
};

type User = {
  id: number;
  name: string;
  email: string;
  role: string;
  cats?: Cat[];
};

type DashboardData = {
  overview: Overview;
  recentCats: Cat[];
  recentUsers: User[];
  catsByBreed: BreedStat[];
  catsByStatus: StatusStat[];
};

const styles = `
  * { box-sizing: border-box; }
  .dashboard-page {
    min-height: 100vh;
    padding: 18px;
    color: white;
    font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
    background: linear-gradient(180deg, #111827 0%, #0f172a 45%, #020617 100%);
  }
  .dashboard-shell {
    max-width: 1320px;
    margin: 0 auto;
    border-radius: 28px;
    border: 1px solid rgba(255,255,255,0.08);
    background: rgba(15, 23, 42, 0.88);
    box-shadow: 0 10px 30px rgba(0,0,0,0.22);
    padding: 20px;
  }
  .hero {
    margin-bottom: 20px;
    text-align: center;
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
  .page-title {
    margin: 14px 0 8px;
    font-size: clamp(34px, 6vw, 56px);
    line-height: 1;
    font-weight: 800;
    letter-spacing: -0.04em;
    background: linear-gradient(90deg, #fff, #dbeafe, #f5d0fe);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
  }
  .page-subtitle {
    margin: 0 auto;
    max-width: 760px;
    color: #dbe4f2;
    font-size: 16px;
    line-height: 1.6;
  }
  .top-actions {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
    margin-bottom: 18px;
  }
  .btn, .btn-outline {
    border: 0;
    cursor: pointer;
    font-weight: 700;
    border-radius: 14px;
    padding: 11px 15px;
  }
  .btn {
    color: white;
    background: linear-gradient(90deg, #22d3ee, #d946ef, #f59e0b);
  }
  .btn-outline {
    color: white;
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.1);
  }
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 14px;
    margin-bottom: 18px;
  }
  .panel {
    border: 1px solid rgba(255,255,255,0.08);
    background: rgba(255,255,255,0.04);
    border-radius: 22px;
  }
  .stat-card {
    padding: 16px;
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
    font-size: 30px;
    font-weight: 800;
  }
  .stat-subtext {
    margin-top: 8px;
    color: #94a3b8;
    font-size: 13px;
  }
  .content-grid {
    display: grid;
    grid-template-columns: 1.1fr 0.9fr;
    gap: 16px;
  }
  .section-card {
    padding: 18px;
  }
  .section-title {
    margin: 0 0 14px;
    font-size: 20px;
    font-weight: 800;
  }
  .list {
    display: grid;
    gap: 10px;
  }
  .list-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    padding: 12px 14px;
    border-radius: 16px;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.06);
  }
  .item-title {
    font-weight: 800;
  }
  .muted {
    color: #94a3b8;
  }
  .pill {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 90px;
    padding: 7px 10px;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 800;
    border: 1px solid rgba(255,255,255,0.08);
    background: rgba(255,255,255,0.06);
  }
  .status-AVAILABLE { color: #86efac; }
  .status-ADOPTED { color: #93c5fd; }
  .status-PENDING { color: #fde68a; }
  .loading-box {
    min-height: 60vh;
    display: grid;
    place-items: center;
    text-align: center;
  }
  @media (max-width: 1100px) {
    .stats-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .content-grid { grid-template-columns: 1fr; }
  }
  @media (max-width: 720px) {
    .dashboard-page { padding: 12px; }
    .dashboard-shell { padding: 14px; border-radius: 22px; }
    .stats-grid { grid-template-columns: 1fr; }
    .top-actions { justify-content: center; }
    .btn, .btn-outline { width: 100%; }
  }
`;

export default function DashboardPage() {
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await fetch("http://localhost:5000/dashboard/stats");
        if (!res.ok) {
          throw new Error(`Failed to fetch dashboard. Status: ${res.status}`);
        }

        const json: DashboardData = await res.json();
        setData(json);
      } catch (error) {
        console.error("Failed to fetch dashboard", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <>
        <style>{styles}</style>
        <div className="dashboard-page">
          <div className="dashboard-shell">
            <div className="loading-box">
              <h2>Loading dashboard...</h2>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (!data) {
    return (
      <>
        <style>{styles}</style>
        <div className="dashboard-page">
          <div className="dashboard-shell">
            <div className="loading-box">
              <h2>Dashboard data could not be loaded.</h2>
            </div>
          </div>
        </div>
      </>
    );
  }

  const { overview, recentCats, recentUsers, catsByBreed, catsByStatus } = data;

  return (
    <>
      <style>{styles}</style>
      <div className="dashboard-page">
        <div className="dashboard-shell">
          <div className="hero">
            <div className="badge">Admin Dashboard</div>
            <h1 className="page-title">Shelter Overview</h1>
            <p className="page-subtitle">
              Quick insight into cats, users, owners, breeds, and latest activity.
            </p>
          </div>

          <div className="top-actions">
            <button className="btn-outline" onClick={() => navigate(-1)}>
              ← Back
            </button>
            <button className="btn" onClick={() => navigate("/cats")}>
              Open Cats
            </button>
            <button className="btn" onClick={() => navigate("/users")}>
              Open Users
            </button>
          </div>

          <div className="stats-grid">
            <div className="panel stat-card">
              <div className="stat-label">Total Cats</div>
              <div className="stat-value">{overview.totalCats}</div>
              <div className="stat-subtext">All cats in the system</div>
            </div>

            <div className="panel stat-card">
              <div className="stat-label">Available Cats</div>
              <div className="stat-value">{overview.availableCats}</div>
              <div className="stat-subtext">Ready for adoption</div>
            </div>

            <div className="panel stat-card">
              <div className="stat-label">Adopted Cats</div>
              <div className="stat-value">{overview.adoptedCats}</div>
              <div className="stat-subtext">Already assigned to owners</div>
            </div>

            <div className="panel stat-card">
              <div className="stat-label">Pending Cats</div>
              <div className="stat-value">{overview.pendingCats}</div>
              <div className="stat-subtext">Currently in progress</div>
            </div>

            <div className="panel stat-card">
              <div className="stat-label">Total Users</div>
              <div className="stat-value">{overview.totalUsers}</div>
              <div className="stat-subtext">All registered users</div>
            </div>

            <div className="panel stat-card">
              <div className="stat-label">Owners</div>
              <div className="stat-value">{overview.ownersCount}</div>
              <div className="stat-subtext">Users with at least one cat</div>
            </div>

            <div className="panel stat-card">
              <div className="stat-label">Breeds</div>
              <div className="stat-value">{overview.totalBreeds}</div>
              <div className="stat-subtext">Breed records available</div>
            </div>

            <div className="panel stat-card">
              <div className="stat-label">Adoption Rate</div>
              <div className="stat-value">
                {overview.totalCats > 0
                  ? `${Math.round((overview.adoptedCats / overview.totalCats) * 100)}%`
                  : "0%"}
              </div>
              <div className="stat-subtext">Adopted out of all cats</div>
            </div>
          </div>

          <div className="content-grid">
            <div className="panel section-card">
              <h3 className="section-title">Recent Cats</h3>
              <div className="list">
                {recentCats.length === 0 ? (
                  <div className="muted">No cats found.</div>
                ) : (
                  recentCats.map((cat) => (
                    <div key={cat.id} className="list-item">
                      <div>
                        <div className="item-title">{cat.name}</div>
                        <div className="muted">
                          {cat.breed?.name || "Unknown breed"} · Age {cat.age}
                          {cat.owner ? ` · Owner: ${cat.owner.name}` : ""}
                        </div>
                      </div>
                      <div className={`pill status-${cat.status}`}>{cat.status}</div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="panel section-card">
              <h3 className="section-title">Recent Users</h3>
              <div className="list">
                {recentUsers.length === 0 ? (
                  <div className="muted">No users found.</div>
                ) : (
                  recentUsers.map((user) => (
                    <div key={user.id} className="list-item">
                      <div>
                        <div className="item-title">{user.name}</div>
                        <div className="muted">
                          {user.email} · {user.role}
                        </div>
                      </div>
                      <div className="pill">{user.cats?.length || 0} cats</div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="panel section-card">
              <h3 className="section-title">Cats by Breed</h3>
              <div className="list">
                {catsByBreed.length === 0 ? (
                  <div className="muted">No breed data found.</div>
                ) : (
                  catsByBreed.map((breed) => (
                    <div key={breed.id} className="list-item">
                      <div className="item-title">{breed.name}</div>
                      <div className="pill">{breed.count}</div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="panel section-card">
              <h3 className="section-title">Cats by Status</h3>
              <div className="list">
                {catsByStatus.length === 0 ? (
                  <div className="muted">No status data found.</div>
                ) : (
                  catsByStatus.map((item) => (
                    <div key={item.status} className="list-item">
                      <div className="item-title">{item.status}</div>
                      <div className="pill">{item.count}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}