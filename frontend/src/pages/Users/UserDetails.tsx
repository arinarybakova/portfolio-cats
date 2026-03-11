import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getToken, isAdmin } from "../../utils/auth";

type User = {
  id: number;
  name: string;
  email: string;
  role: string;
};

type Cat = {
  id: number;
  name: string;
  age: number;
  status: string;
  image?: string;
  owner?: {
    id: number;
    name: string;
  };
  breed?: {
    id: number;
    name: string;
  };
};

type Address = {
  id: number;
  label?: string;
  line1?: string;
  city?: string;
  country?: string;
};

type TabKey = "info" | "cats" | "addresses" | "settings";

const styles = `
  * { box-sizing: border-box; }
  .user-page {
    min-height: 100vh;
    padding: 18px;
    color: white;
    font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
    background: linear-gradient(180deg, #111827 0%, #0f172a 45%, #020617 100%);
  }
  .user-shell {
    max-width: 1320px;
    margin: 0 auto;
    border-radius: 28px;
    border: 1px solid rgba(255,255,255,0.08);
    background: rgba(15, 23, 42, 0.88);
    box-shadow: 0 10px 30px rgba(0,0,0,0.22);
    padding: 20px;
  }
  .hero {
    text-align: center;
    max-width: 860px;
    margin: 0 auto 20px;
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
    font-size: clamp(36px, 7vw, 60px);
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
    justify-content: flex-start;
    margin-bottom: 16px;
  }
  .panel {
    border: 1px solid rgba(255,255,255,0.08);
    background: rgba(255,255,255,0.04);
    border-radius: 22px;
  }
  .profile-card {
    padding: 18px;
    margin-bottom: 16px;
  }
  .profile-grid {
    display: grid;
    grid-template-columns: 320px 1fr;
    gap: 18px;
    align-items: start;
  }
  .avatar-panel {
    padding: 20px;
    text-align: center;
    border-radius: 20px;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.06);
  }
  .avatar {
    width: 120px;
    height: 120px;
    display: grid;
    place-items: center;
    margin: 0 auto 14px;
    border-radius: 50%;
    background: linear-gradient(135deg, #22d3ee, #d946ef, #f59e0b);
    color: white;
    font-size: 42px;
    font-weight: 800;
  }
  .user-name {
    margin: 0 0 8px;
    font-size: 28px;
    font-weight: 800;
  }
  .role-pill {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 110px;
    padding: 8px 10px;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 800;
    letter-spacing: 0.06em;
    border: 1px solid rgba(255,255,255,0.08);
    background: rgba(255,255,255,0.06);
    text-transform: uppercase;
  }
  .role-admin { color: #fde68a; background: rgba(245,158,11,0.14); }
  .role-user { color: #bfdbfe; background: rgba(59,130,246,0.14); }
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 12px;
    margin-top: 16px;
  }
  .stat-card {
    border-radius: 18px;
    border: 1px solid rgba(255,255,255,0.08);
    background: rgba(255,255,255,0.04);
    padding: 14px;
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
    font-size: 20px;
    font-weight: 800;
  }
  .tabs {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
    margin-bottom: 16px;
  }
  .tab-btn {
    border: 1px solid rgba(255,255,255,0.08);
    background: rgba(255,255,255,0.05);
    color: white;
    border-radius: 14px;
    padding: 10px 14px;
    cursor: pointer;
    font-weight: 700;
  }
  .tab-btn.active {
    background: linear-gradient(90deg, #22d3ee, #d946ef, #f59e0b);
    border-color: transparent;
  }
  .content-card {
    padding: 18px;
  }
  .grid-2 {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
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
    border: 1px solid rgba(255,255,255,0.1);
    background: rgba(255,255,255,0.06);
    color: white;
    border-radius: 14px;
    padding: 12px 14px;
    outline: none;
  }
  .input::placeholder { color: #94a3b8; }
  .input option { color: #0f172a; }
  .btn, .btn-outline, .btn-danger {
    border: 0;
    cursor: pointer;
    font-weight: 700;
    transition: opacity .15s ease;
  }
  .btn:hover, .btn-outline:hover, .btn-danger:hover { opacity: 0.95; }
  .btn {
    padding: 11px 15px;
    border-radius: 14px;
    color: white;
    background: linear-gradient(90deg, #22d3ee, #d946ef, #f59e0b);
  }
  .btn-outline {
    padding: 11px 15px;
    border-radius: 14px;
    color: white;
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.1);
  }
  .btn-danger {
    padding: 10px 12px;
    border-radius: 12px;
    color: white;
    background: linear-gradient(90deg, #ef4444, #f97316);
  }
  .stack { display: flex; flex-direction: column; gap: 12px; }
  .row { display: flex; gap: 10px; flex-wrap: wrap; }
  .cat-list, .address-list {
    display: grid;
    gap: 12px;
    margin-top: 14px;
  }
  .cat-card, .address-card {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    border-radius: 18px;
    border: 1px solid rgba(255,255,255,0.08);
    background: rgba(255,255,255,0.04);
    padding: 14px;
  }
  .cat-left {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .cat-thumb {
    width: 56px;
    height: 56px;
    object-fit: cover;
    border-radius: 12px;
    border: 1px solid rgba(255,255,255,0.1);
    background: rgba(255,255,255,0.05);
  }
  .muted { color: #94a3b8; }
  .section-title-inline {
    margin: 0 0 12px;
    font-size: 20px;
    font-weight: 800;
  }
  .switch-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 14px;
    border-radius: 18px;
    border: 1px solid rgba(255,255,255,0.08);
    background: rgba(255,255,255,0.04);
  }
  .loading-box {
    min-height: 60vh;
    display: grid;
    place-items: center;
    text-align: center;
  }
  @media (max-width: 920px) {
    .profile-grid, .grid-2, .stats-grid { grid-template-columns: 1fr; }
  }
  @media (max-width: 720px) {
    .user-page { padding: 12px; }
    .user-shell { border-radius: 22px; padding: 14px; }
    .row, .top-actions, .tabs { justify-content: center; }
    .btn, .btn-outline, .btn-danger { width: 100%; }
  }
`;

export default function UserDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const admin = isAdmin();
  const token = getToken();

  const [user, setUser] = useState<User | null>(null);
  const [form, setForm] = useState<User | null>(null);
  const [cats, setCats] = useState<Cat[]>([]);
  const [allCats, setAllCats] = useState<Cat[]>([]);
  const [addresses] = useState<Address[]>([]);
  const [tab, setTab] = useState<TabKey>("info");
  const [selectedCatId, setSelectedCatId] = useState<number | "">("");
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({
    notifications: true,
    darkMode: true,
    marketing: false,
  });

  const routeUserId = id ? Number(id) : null;
  const viewedUserId = user?.id ?? routeUserId ?? 0;

  const fetchUser = async () => {
    try {
      const url = admin && id
        ? `http://localhost:5000/users/${id}`
        : "http://localhost:5000/me";

      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error(`Failed to fetch user. Status: ${res.status}`);
      }

      const data: User = await res.json();
      setUser(data);
      setForm({
        ...data,
        role: String(data.role).toUpperCase(),
      });
    } catch (err) {
      console.error("Failed to fetch user", err);
      setUser(null);
      setForm(null);
    }
  };

  const fetchCats = async () => {
    try {
      const url = admin
        ? "http://localhost:5000/cats"
        : "http://localhost:5000/my/cats";

      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error(`Failed to fetch cats. Status: ${res.status}`);
      }

      const data: Cat[] = await res.json();
      setAllCats(data);

      if (admin) {
        const targetUserId = id ? Number(id) : 0;
        setCats(data.filter((cat) => cat.owner?.id === targetUserId));
      } else {
        setCats(data);
      }
    } catch (err) {
      console.error("Failed to fetch cats", err);
      setAllCats([]);
      setCats([]);
    }
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchUser(), fetchCats()]).finally(() => setLoading(false));
  }, [id, admin, token]);
  

  const availableCats = useMemo(() => {
    if (!admin || !viewedUserId) return [];
    return allCats.filter((cat) => !cat.owner || cat.owner.id === viewedUserId);
  }, [allCats, viewedUserId, admin]);

  const handleSaveInfo = async () => {
    if (!form || !user) return;

    try {
      const payload = admin
        ? {
            name: form.name,
            email: form.email,
            role: String(form.role).toUpperCase(),
          }
        : {
            name: form.name,
            email: form.email,
          };

      const url = admin
        ? `http://localhost:5000/users/${user.id}`
        : "http://localhost:5000/me";

      const res = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(`Failed to save user. Status: ${res.status}`);
      }

      const updated: User = await res.json();
      setUser(updated);
      setForm({
        ...updated,
        role: String(updated.role).toUpperCase(),
      });
    } catch (err) {
      console.error("Failed to save user", err);
    }
  };

  const assignCat = async () => {
    if (!admin || !selectedCatId || !viewedUserId) return;

    try {
      const res = await fetch(`http://localhost:5000/cats/${selectedCatId}/assign-owner`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ownerId: viewedUserId }),
      });

      if (!res.ok) {
        throw new Error(`Failed to assign cat. Status: ${res.status}`);
      }

      await res.json();
      setSelectedCatId("");
      await fetchCats();
    } catch (err) {
      console.error("Failed to assign cat", err);
    }
  };

  const removeCat = async (catId: number) => {
    if (!admin) return;

    try {
      const res = await fetch(`http://localhost:5000/cats/${catId}/remove-owner`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error(`Failed to remove cat. Status: ${res.status}`);
      }

      await res.json();
      await fetchCats();
    } catch (err) {
      console.error("Failed to remove cat", err);
    }
  };

  if (loading) {
    return (
      <>
        <style>{styles}</style>
        <div className="user-page">
          <div className="user-shell">
            <div className="loading-box">
              <h2>Loading user...</h2>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (admin && !id) {
    return (
      <>
        <style>{styles}</style>
        <div className="user-page">
          <div className="user-shell">
            <div className="loading-box">
              <h2>User ID not found.</h2>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (!user || !form) {
    return (
      <>
        <style>{styles}</style>
        <div className="user-page">
          <div className="user-shell">
            <div className="loading-box">
              <h2>User data could not be loaded.</h2>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{styles}</style>
      <div className="user-page">
        <div className="user-shell">
          <div className="hero">
            <div className="badge">{admin ? "User Details" : "My Profile"}</div>
            <h1 className="page-title">{user.name}</h1>
            <p className="page-subtitle">
              {admin
                ? "View and manage user details, owned cats, addresses, and settings from one page."
                : "Manage your own profile, view your account information, and see the cats you own."}
            </p>
          </div>

          <div className="top-actions">
            <button className="btn-outline" onClick={() => navigate(admin ? "/users" : "/cats")}>
              ← Back
            </button>
          </div>

          <div className="panel profile-card">
            <div className="profile-grid">
              <div className="avatar-panel">
                <div className="avatar">{user.name?.charAt(0)?.toUpperCase() || "U"}</div>
                <h2 className="user-name">{user.name}</h2>
                <div
                  className={`role-pill ${
                    String(user.role).toLowerCase() === "admin" ? "role-admin" : "role-user"
                  }`}
                >
                  {user.role}
                </div>
              </div>

              <div>
                <div className="stats-grid">
                  <div className="stat-card">
                    <div className="stat-label">Email</div>
                    <div className="stat-value" style={{ fontSize: 16 }}>
                      {user.email}
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-label">Owned Cats</div>
                    <div className="stat-value">{cats.length}</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-label">Addresses</div>
                    <div className="stat-value">{addresses.length}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="tabs">
            <button className={`tab-btn ${tab === "info" ? "active" : ""}`} onClick={() => setTab("info")}>
              User Info
            </button>

            <button className={`tab-btn ${tab === "cats" ? "active" : ""}`} onClick={() => setTab("cats")}>
              {admin ? "Owned Cats" : "My Cats"}
            </button>

            <button
              className={`tab-btn ${tab === "addresses" ? "active" : ""}`}
              onClick={() => setTab("addresses")}
            >
              Addresses
            </button>

            <button
              className={`tab-btn ${tab === "settings" ? "active" : ""}`}
              onClick={() => setTab("settings")}
            >
              Settings
            </button>
          </div>

          <div className="panel content-card">
            {tab === "info" && (
              <div className="stack">
                <h3 className="section-title-inline">User Info</h3>
                <div className="grid-2">
                  <div className="field">
                    <label>Name</label>
                    <input
                      className="input"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                    />
                  </div>

                  <div className="field">
                    <label>Email</label>
                    <input
                      className="input"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                    />
                  </div>

                  {admin && (
                    <div className="field">
                      <label>Role</label>
                      <select
                        className="input"
                        value={String(form.role).toUpperCase()}
                        onChange={(e) => setForm({ ...form, role: e.target.value })}
                      >
                        <option value="USER">User</option>
                        <option value="ADMIN">Admin</option>
                      </select>
                    </div>
                  )}
                </div>

                <div className="row">
                  <button className="btn" onClick={handleSaveInfo}>
                    Save User Info
                  </button>
                </div>
              </div>
            )}

            {tab === "cats" && (
              <div className="stack">
                <h3 className="section-title-inline">{admin ? "Owned Cats" : "My Cats"}</h3>

                {admin && (
                  <div className="row">
                    <select
                      className="input"
                      value={selectedCatId}
                      onChange={(e) => setSelectedCatId(e.target.value ? Number(e.target.value) : "")}
                      style={{ maxWidth: 340 }}
                    >
                      <option value="">Select cat to assign</option>
                      {availableCats.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                    <button className="btn" onClick={assignCat} disabled={!selectedCatId}>
                      Assign Cat
                    </button>
                  </div>
                )}

                <div className="cat-list">
                  {cats.length === 0 ? (
                    <div className="muted">
                      {admin ? "This user does not own any cats yet." : "You do not own any cats yet."}
                    </div>
                  ) : (
                    cats.map((cat) => (
                      <div key={cat.id} className="cat-card">
                        <div className="cat-left">
                          {cat.image ? (
                            <img src={cat.image} alt={cat.name} className="cat-thumb" />
                          ) : (
                            <div className="cat-thumb" />
                          )}
                          <div>
                            <div style={{ fontWeight: 800 }}>{cat.name}</div>
                            <div className="muted">
                              {cat.breed?.name || "Unknown breed"} · Age {cat.age} · {cat.status}
                            </div>
                            {admin && cat.owner && (
                              <div className="muted">Owner: {cat.owner.name}</div>
                            )}
                          </div>
                        </div>

                        <div className="row" style={{ justifyContent: "flex-end" }}>
                          <button className="btn-outline" onClick={() => navigate(`/cats/${cat.id}`)}>
                            Open Cat
                          </button>
                          {admin && (
                            <button className="btn-danger" onClick={() => removeCat(cat.id)}>
                              Remove
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {tab === "addresses" && (
              <div className="stack">
                <h3 className="section-title-inline">Addresses</h3>
                <div className="address-list">
                  {addresses.length === 0 ? (
                    <div className="muted">
                      Addresses section is available in the UI. No address data is connected yet.
                    </div>
                  ) : (
                    addresses.map((address) => (
                      <div key={address.id} className="address-card">
                        <div>
                          <div style={{ fontWeight: 800 }}>{address.label || "Address"}</div>
                          <div className="muted">{address.line1 || "No line"}</div>
                          <div className="muted">
                            {address.city || "No city"}
                            {address.country ? `, ${address.country}` : ""}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {tab === "settings" && (
              <div className="stack">
                <h3 className="section-title-inline">Settings</h3>

                <div className="switch-row">
                  <div>
                    <div style={{ fontWeight: 800 }}>Notifications</div>
                    <div className="muted">Receive updates about owned cats and profile activity.</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.notifications}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        notifications: e.target.checked,
                      })
                    }
                  />
                </div>

                <div className="switch-row">
                  <div>
                    <div style={{ fontWeight: 800 }}>Dark Mode</div>
                    <div className="muted">Keep this premium dark interface enabled.</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.darkMode}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        darkMode: e.target.checked,
                      })
                    }
                  />
                </div>

                <div className="switch-row">
                  <div>
                    <div style={{ fontWeight: 800 }}>Marketing Emails</div>
                    <div className="muted">Allow promotional emails and product announcements.</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.marketing}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        marketing: e.target.checked,
                      })
                    }
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}