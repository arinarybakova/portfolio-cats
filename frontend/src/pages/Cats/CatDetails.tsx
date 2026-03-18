import React, { memo, useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getToken, isAdmin } from "../../utils/auth";

type Cat = {
  id: number;
  name: string;
  age: number;
  status: string;
  image?: string;
  breed: {
    id: number;
    name: string;
  };
  owner?: {
    id: number;
    name: string;
  };
  priority?: boolean;
};

type User = {
  id: number;
  name: string;
};

type InfoCardProps = {
  label: string;
  value: string;
};

const sharedStyles = `
  * { box-sizing: border-box; }
  .details-page {
    min-height: 100vh;
    color: white;
    font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
    background: linear-gradient(180deg, #111827 0%, #0f172a 45%, #020617 100%);
  }
  .details-shell {
    max-width: 1120px;
    margin: 0 auto;
    border-radius: 28px;
    border: 1px solid rgba(255,255,255,0.08);
    background: rgba(15, 23, 42, 0.88);
    box-shadow: 0 10px 30px rgba(0,0,0,0.22);
    padding: 20px;
  }
  .loading-shell {
    min-height: calc(100vh - 36px);
    display: flex;
    align-items: center;
    justify-content: center;
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
  .profile-card {
    overflow: hidden;
    border-radius: 22px;
    border: 1px solid rgba(255,255,255,0.08);
    background: rgba(255,255,255,0.04);
  }
  .hero-strip {
    height: 160px;
    background: linear-gradient(135deg, rgba(34,211,238,0.26), rgba(217,70,239,0.22), rgba(59,130,246,0.20));
  }
  .profile-content {
    padding: 0 20px 20px;
    text-align: center;
  }
  .avatar-wrap {
    margin-top: -86px;
    display: flex;
    justify-content: center;
  }
  .avatar {
    width: 172px;
    height: 172px;
    border-radius: 50%;
    object-fit: cover;
    border: 6px solid rgba(255,255,255,0.92);
    background: white;
  }
  .title-row {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    flex-wrap: wrap;
    margin-top: 20px;
    margin-bottom: 18px;
  }
  .cat-name {
    margin: 0;
    font-size: clamp(28px, 5vw, 42px);
    font-weight: 800;
  }
  .priority-icon { margin-right: 8px; }
  .status-pill {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 116px;
    padding: 8px 12px;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 800;
    letter-spacing: 0.08em;
    border: 1px solid rgba(255,255,255,0.08);
    background: rgba(255,255,255,0.06);
  }
  .status-AVAILABLE { color: #bbf7d0; background: rgba(34,197,94,0.14); }
  .status-ADOPTED { color: #fecaca; background: rgba(239,68,68,0.14); }
  .status-PENDING { color: #fde68a; background: rgba(245,158,11,0.14); }
  .info-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
    content-visibility: auto;
    contain: layout paint style;
  }
  .info-card {
    border-radius: 18px;
    border: 1px solid rgba(255,255,255,0.08);
    background: rgba(255,255,255,0.04);
    padding: 16px;
    text-align: left;
  }
  .info-label {
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: #cbd5e1;
    font-weight: 700;
    margin-bottom: 8px;
  }
  .info-value {
    font-size: 17px;
    font-weight: 800;
    color: #f8fafc;
  }
  .edit-stack {
    max-width: 560px;
    margin: 24px auto 0;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .glass-input {
    width: 100%;
    border: 1px solid rgba(255,255,255,0.1);
    background: rgba(255,255,255,0.06);
    color: white;
    border-radius: 14px;
    padding: 12px 14px;
    outline: none;
  }
  .glass-input::placeholder { color: #94a3b8; }
  .glass-input option { color: #0f172a; }
  .check-row {
    display: flex;
    align-items: center;
    gap: 10px;
    justify-content: flex-start;
    color: #e2e8f0;
    font-weight: 700;
    padding: 4px 2px;
  }
  .actions-row {
    display: flex;
    justify-content: center;
    gap: 12px;
    flex-wrap: wrap;
    padding: 0 20px 20px;
  }
  .btn-primary, .btn-soft, .btn-outline, .btn-danger {
    border: 0;
    cursor: pointer;
    font-weight: 700;
    transition: opacity .15s ease;
  }
  .btn-primary:hover, .btn-soft:hover, .btn-outline:hover, .btn-danger:hover { opacity: 0.95; }
  .btn-primary {
    padding: 12px 16px;
    border-radius: 14px;
    color: white;
    background: linear-gradient(90deg, #22d3ee, #d946ef, #f59e0b);
  }
  .btn-soft {
    padding: 12px 16px;
    border-radius: 14px;
    color: white;
    background: rgba(255,255,255,0.08);
    border: 1px solid rgba(255,255,255,0.1);
  }
  .btn-outline {
    padding: 11px 15px;
    border-radius: 14px;
    color: white;
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.1);
  }
  .btn-danger {
    padding: 12px 16px;
    border-radius: 14px;
    color: white;
    background: linear-gradient(90deg, #ef4444, #f97316);
  }
  .loading-box {
    text-align: center;
    color: #e5eefb;
  }
  .loading-spinner {
    width: 44px;
    height: 44px;
    margin: 0 auto 14px;
    border-radius: 50%;
    border: 3px solid rgba(255,255,255,0.14);
    border-top-color: #67e8f9;
    animation: spin 1s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  @media (max-width: 820px) {
    .details-page { padding: 12px; }
    .details-shell { border-radius: 22px; padding: 14px; }
    .profile-content { padding: 0 14px 18px; }
    .avatar { width: 144px; height: 144px; }
    .avatar-wrap { margin-top: -72px; }
    .info-grid { grid-template-columns: 1fr; }
    .actions-row, .top-actions { justify-content: center; }
    .btn-primary, .btn-soft, .btn-outline, .btn-danger { width: 100%; }
  }
`;

const InfoCard = memo(function InfoCard({ label, value }: InfoCardProps) {
  return (
    <div className="info-card">
      <div className="info-label">{label}</div>
      <div className="info-value">{value}</div>
    </div>
  );
});

export default function CatDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const admin = isAdmin();
  const token = getToken();

  const [cat, setCat] = useState<Cat | null>(null);
  const [formData, setFormData] = useState<Cat | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [ownerId, setOwnerId] = useState<number | "">("");
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchCat = async () => {
    try {
      const res = await fetch(`http://localhost:5000/cats/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error(`Failed to fetch cat. Status: ${res.status}`);
      }

      const data = await res.json();
      setCat(data);
      setFormData(data);
    } catch (err) {
      console.error("Failed to fetch cat", err);
      setCat(null);
      setFormData(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    if (!admin) return;

    try {
      const res = await fetch("http://localhost:5000/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error(`Failed to fetch users. Status: ${res.status}`);
      }

      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error("Failed to fetch users", err);
      setUsers([]);
    }
  };

  useEffect(() => {
    fetchCat();
  }, [id]);

  useEffect(() => {
    fetchUsers();
  }, [admin]);

  const ownerOptions = useMemo(
    () =>
      users.map((user) => (
        <option key={user.id} value={user.id}>
          {user.name}
        </option>
      )),
    [users]
  );

  const handleSave = async () => {
    if (!formData || !cat || !admin) return;

    try {
      setSaving(true);

      const res = await fetch(`http://localhost:5000/cats/${cat.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formData.name,
          age: formData.age,
          status: formData.status,
          image: formData.image,
          priority: !!formData.priority,
        }),
      });

      if (!res.ok) {
        throw new Error(`Failed to save cat. Status: ${res.status}`);
      }

      const updated = await res.json();
      setCat(updated);
      setFormData(updated);
      setIsEditing(false);
    } catch (err) {
      console.error("Save failed", err);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData(cat);
    setIsEditing(false);
  };

  const assignOwner = async () => {
    if (!ownerId || !cat || !admin) return;

    try {
      const res = await fetch(`http://localhost:5000/cats/${cat.id}/assign-owner`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ownerId }),
      });

      if (!res.ok) {
        throw new Error(`Failed to assign owner. Status: ${res.status}`);
      }

      const updated = await res.json();
      setCat(updated);
      setFormData(updated);
      setOwnerId("");
    } catch (err) {
      console.error("Assign owner failed", err);
    }
  };

  const removeOwner = async () => {
    if (!cat || !admin) return;

    try {
      const res = await fetch(`http://localhost:5000/cats/${cat.id}/remove-owner`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error(`Failed to remove owner. Status: ${res.status}`);
      }

      const updated = await res.json();
      setCat(updated);
      setFormData(updated);
    } catch (err) {
      console.error("Remove owner failed", err);
    }
  };

  const deleteCat = async () => {
    if (!cat || !admin) return;
    const confirmDelete = window.confirm("Are you sure you want to delete this cat?");
    if (!confirmDelete) return;

    try {
      const res = await fetch(`http://localhost:5000/cats/${cat.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error(`Failed to delete cat. Status: ${res.status}`);
      }

      navigate("/cats");
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  if (loading) {
    return (
      <>
        <style>{sharedStyles}</style>
        <div className="details-page">
          <div className="details-shell loading-shell">
            <div className="loading-box">
              <div className="loading-spinner" />
              <h2>Loading Cat...</h2>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (!cat || !formData) {
    return (
      <>
        <style>{sharedStyles}</style>
        <div className="details-page">
          <div className="details-shell loading-shell">
            <div className="loading-box">
              <h2>Cat data could not be loaded.</h2>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{sharedStyles}</style>
      <div className="details-page">
        <div className="details-shell">
          <div className="hero">
            <div className="badge">{admin ? "Cat Details" : "My Cat Details"}</div>
            <h1 className="page-title">Meet {cat.name}</h1>
            <p className="page-subtitle">
              {admin
                ? "View, edit, assign an owner, and manage cat."
                : "View details of your cat in the same interface."}
            </p>
          </div>

          <div className="top-actions">
            <button onClick={() => navigate("/cats")} className="btn-outline">← Back</button>
          </div>

          <div className="profile-card">
            <div className="hero-strip" />

            <div className="profile-content">
              <div className="avatar-wrap">
                <img
                  src={formData.image || "https://via.placeholder.com/200"}
                  alt={formData.name}
                  className="avatar"
                  loading="lazy"
                />
              </div>

              {!isEditing ? (
                <>
                  <div className="title-row">
                    <h2 className="cat-name">
                      {cat.priority && <span className="priority-icon">👑</span>}
                      {cat.name}
                    </h2>
                    <span className={`status-pill status-${cat.status}`}>{cat.status}</span>
                  </div>

                  <div className="info-grid">
                    <InfoCard label="Age" value={`🐾 ${cat.age}`} />
                    <InfoCard label="Breed" value={`🧬 ${cat.breed.name}`} />
                    <InfoCard label="Owner" value={`👤 ${cat.owner?.name || "No owner yet"}`} />
                    <InfoCard label="Priority" value={cat.priority ? "Yes" : "No"} />
                  </div>
                </>
              ) : (
                <div className="edit-stack">
                  <input
                    className="glass-input"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />

                  <input
                    className="glass-input"
                    type="number"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: Number(e.target.value) })}
                  />

                  <select
                    className="glass-input"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="AVAILABLE">Available</option>
                    <option value="ADOPTED">Adopted</option>
                    <option value="PENDING">Pending</option>
                  </select>

                  <label className="check-row">
                    <input
                      type="checkbox"
                      checked={Boolean(formData.priority)}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.checked })}
                    />
                    <span>Priority</span>
                  </label>

                  {!cat.owner && (
                    <>
                      <select
                        className="glass-input"
                        value={ownerId}
                        onChange={(e) => setOwnerId(e.target.value ? Number(e.target.value) : "")}
                      >
                        <option value="">Select Owner</option>
                        {ownerOptions}
                      </select>

                      <button className="btn-soft" onClick={assignOwner} disabled={!ownerId}>
                        👤 Assign Owner
                      </button>
                    </>
                  )}

                  {cat.owner && (
                    <button className="btn-danger" onClick={removeOwner}>
                      ❌ Remove Owner
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="actions-row">
              {admin ? (
                isEditing ? (
                  <>
                    <button className="btn-primary" onClick={handleSave} disabled={saving}>
                      {saving ? "Saving..." : "Save Changes"}
                    </button>
                    <button className="btn-danger" onClick={handleCancel}>Cancel</button>
                  </>
                ) : (
                  <>
                    <button className="btn-primary" onClick={() => setIsEditing(true)}>✏️ Edit</button>
                    <button className="btn-danger" onClick={deleteCat}>🗑 Delete Cat</button>
                  </>
                )
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}