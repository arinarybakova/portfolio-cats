import React, { memo, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Slider from "@mui/material/Slider";
import { getToken, isAdmin } from "../../utils/auth";

/* ================= TYPES ================= */

type Breed = {
  id: number;
  name: string;
};

type Cat = {
  id: number;
  name: string;
  age: number;
  status: string;
  image?: string;
  breedId: number;
  breed: Breed;
  createdAt: string;
  priority?: boolean;
  owner?: {
    id: number;
    name: string;
  };
};

type ModalProps = {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
};

type CatRowProps = {
  cat: Cat;
  admin: boolean;
  onEdit: (cat: Cat) => void;
  onDelete: (id: number) => void;
  onOpen: (id: number) => void;
};

const PAGE_STYLES = `
  * { box-sizing: border-box; }
  .cats-page {
    min-height: 100vh;
    padding: 18px;
    color: white;
    font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
    background: linear-gradient(180deg, #111827 0%, #0f172a 45%, #020617 100%);
  }
  .cats-shell {
    max-width: 1380px;
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
    font-size: clamp(36px, 7vw, 64px);
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
  .panel {
    border: 1px solid rgba(255,255,255,0.08);
    background: rgba(255,255,255,0.04);
    border-radius: 22px;
  }
  .top-actions {
    display: flex;
    justify-content: center;
    margin-bottom: 16px;
  }
  .filters-card {
    margin-bottom: 18px;
    overflow: hidden;
  }
  .filters-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 14px 18px;
    background: linear-gradient(90deg, rgba(34,211,238,0.14), rgba(217,70,239,0.12), rgba(251,191,36,0.08));
    border-bottom: 1px solid rgba(255,255,255,0.05);
  }
  .filters-title {
    margin: 0;
    font-size: 18px;
    font-weight: 800;
  }
  .filters-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 12px;
    padding: 16px;
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
  .range-card {
    border: 1px solid rgba(255,255,255,0.05);
    background: rgba(255,255,255,0.03);
    border-radius: 18px;
    padding: 12px 12px 6px;
  }
  .range-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 6px;
    color: #e2e8f0;
    font-weight: 700;
    font-size: 13px;
  }
  .button-row {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    padding: 0 16px 16px;
    flex-wrap: wrap;
  }
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
  .table-card { overflow: hidden; }
  .table-scroll {
    overflow-x: auto;
    content-visibility: auto;
    contain: layout paint style;
  }
  .cats-table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
    min-width: 860px;
  }
  .cats-table thead th {
    padding: 14px 12px;
    text-align: center;
    font-size: 12px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: white;
    background: rgba(255,255,255,0.05);
    border-bottom: 1px solid rgba(255,255,255,0.05);
  }
  .cats-table tbody td {
    padding: 12px;
    text-align: center;
    color: #e5eefb;
    border-bottom: 1px solid rgba(255,255,255,0.05);
  }
  .table-row:hover { background: rgba(255,255,255,0.025); }
  .priority-row {
    background: rgba(245, 158, 11, 0.07);
  }
  .name-link {
    cursor: pointer;
    color: #7dd3fc;
    font-weight: 800;
  }
  .thumb {
    width: 56px;
    height: 56px;
    object-fit: cover;
    border-radius: 12px;
    border: 1px solid rgba(255,255,255,0.1);
  }
  .status-pill {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 110px;
    padding: 7px 10px;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 800;
    letter-spacing: 0.06em;
    border: 1px solid rgba(255,255,255,0.08);
    background: rgba(255,255,255,0.06);
  }
  .status-AVAILABLE { color: #bbf7d0; background: rgba(34,197,94,0.14); }
  .status-ADOPTED { color: #fecaca; background: rgba(239,68,68,0.14); }
  .status-PENDING { color: #fde68a; background: rgba(245,158,11,0.14); }
  .row-actions {
    display: flex;
    gap: 8px;
    justify-content: center;
    flex-wrap: wrap;
  }
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 10px;
    min-height: 220px;
    color: #cbd5e1;
  }
  .empty-emoji { font-size: 48px; }
  .pagination {
    margin-top: 18px;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
  }
  .page-chip {
    padding: 10px 14px;
    border-radius: 14px;
    border: 1px solid rgba(255,255,255,0.08);
    background: rgba(255,255,255,0.06);
    color: #e5eefb;
    font-weight: 700;
  }
  .modal-overlay {
    position: fixed;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 18px;
    background: rgba(2, 6, 23, 0.72);
    z-index: 1000;
  }
  .modal-card {
    width: 100%;
    max-width: 460px;
    border-radius: 20px;
    border: 1px solid rgba(255,255,255,0.1);
    background: #0f172a;
    box-shadow: 0 16px 40px rgba(0,0,0,0.24);
    padding: 18px;
    color: white;
  }
  .modal-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 14px;
  }
  .modal-title {
    margin: 0;
    font-size: 20px;
    font-weight: 800;
  }
  .modal-body {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .upload-wrap input[type="file"] { width: 100%; }
  .preview {
    width: 120px;
    height: 120px;
    object-fit: cover;
    border-radius: 16px;
    border: 1px solid rgba(255,255,255,0.1);
  }
  .slider-box .MuiSlider-root { color: #67e8f9; }
  .slider-box .MuiSlider-thumb { box-shadow: none; }
  .slider-box .MuiSlider-track {
    border: none;
    background: linear-gradient(90deg, #22d3ee, #d946ef);
  }
  .slider-box .MuiSlider-rail { background: rgba(255,255,255,0.16); }
  @media (max-width: 720px) {
    .cats-page { padding: 12px; }
    .cats-shell { border-radius: 22px; padding: 14px; }
    .filters-grid { grid-template-columns: 1fr; padding: 14px; }
    .button-row { padding: 0 14px 14px; }
    .btn, .btn-outline { width: 100%; }
  }
`;

const CatRow = memo(function CatRow({ cat, admin, onEdit, onDelete, onOpen }: CatRowProps) {
  return (
    <tr className={`table-row ${cat.priority ? "priority-row" : ""}`}>
      <td>
        <span className="name-link" onClick={() => onOpen(cat.id)}>
          {cat.priority && <span style={{ marginRight: 6 }}>👑</span>}
          {cat.name}
        </span>
      </td>
      <td>{cat.age}</td>
      <td>{cat.breed?.name || "Unknown breed"}</td>
      <td>
        <span className={`status-pill status-${cat.status}`}>{cat.status}</span>
      </td>
      <td>
        {cat.image ? (
          <img src={cat.image} alt={cat.name} className="thumb" loading="lazy" />
        ) : (
          <span style={{ color: "#94a3b8" }}>No image</span>
        )}
      </td>
      <td>
        <div className="row-actions">
          {admin ? (
            <>
              <button className="btn-outline" onClick={() => onEdit(cat)}>
                ✏ Edit
              </button>
              <button className="btn-danger" onClick={() => onDelete(cat.id)}>
                Delete
              </button>
            </>
          ) : (
            <button className="btn-outline" onClick={() => onOpen(cat.id)}>
              Open
            </button>
          )}
        </div>
      </td>
    </tr>
  );
});

export default function CatsList() {
  const navigate = useNavigate();
  const admin = isAdmin();

  const [cats, setCats] = useState<Cat[]>([]);
  const [breeds, setBreeds] = useState<Breed[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<Cat | null>(null);
  const [form, setForm] = useState({
    name: "",
    age: "",
    breedId: "",
    image: "",
    status: "AVAILABLE",
  });
  const [filters, setFilters] = useState({
    search: "",
    minAge: "",
    maxAge: "",
    breedId: "",
    status: "",
    fromDate: "",
    toDate: "",
  });

  const MIN = 1;
  const MAX = 20;
  const minAge = Number(filters.minAge || MIN);
  const maxAge = Number(filters.maxAge || MAX);
  const [ageDraft, setAgeDraft] = useState<[number, number]>([MIN, MAX]);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const [loading, setLoading] = useState(true);

  const authHeaders = (): HeadersInit => {
    const token = getToken();
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  };

  const authOnlyHeaders = (): HeadersInit => {
    const token = getToken();
    return {
      Authorization: `Bearer ${token}`,
    };
  };

  const loadCats = async () => {
    try {
      setLoading(true);

      const query = new URLSearchParams(
        Object.entries(filters).filter(([_, value]) => value !== "")
      ).toString();

      const baseUrl = admin
        ? "http://localhost:5000/cats"
        : "http://localhost:5000/my/cats";

      const url = `${baseUrl}${query ? `?${query}` : ""}`;

      const res = await fetch(url, {
        headers: authOnlyHeaders(),
      });

      if (!res.ok) {
        throw new Error(`Failed to fetch cats. Status: ${res.status}`);
      }

      const data: Cat[] = await res.json();

      setCats(Array.isArray(data) ? data : []);
      setCurrentPage(1);
    } catch (error) {
      console.error("Failed to load cats", error);
      setCats([]);
    } finally {
      setLoading(false);
    }
  };

  const loadBreeds = async () => {
    try {
      const res = await fetch("http://localhost:5000/breeds", {
        headers: authOnlyHeaders(),
      });

      if (!res.ok) {
        throw new Error(`Failed to fetch breeds. Status: ${res.status}`);
      }

      const data: Breed[] = await res.json();
      setBreeds(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load breeds", error);
      setBreeds([]);
    }
  };

  useEffect(() => {
    loadBreeds();
  }, []);

  useEffect(() => {
    loadCats();
  }, [admin]);

  useEffect(() => {
    setAgeDraft([minAge, maxAge]);
  }, [minAge, maxAge]);

  const totalPages = Math.max(1, Math.ceil(cats.length / itemsPerPage));

  const paginatedCats = useMemo(
    () => cats.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage),
    [cats, currentPage]
  );

  const handleCreate = async () => {
    try {
      const res = await fetch("http://localhost:5000/cats", {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          name: form.name,
          age: Number(form.age),
          breedId: Number(form.breedId),
          image: form.image,
          status: form.status,
        }),
      });

      if (!res.ok) {
        throw new Error(`Failed to create cat. Status: ${res.status}`);
      }

      setShowAdd(false);
      setForm({
        name: "",
        age: "",
        breedId: "",
        image: "",
        status: "AVAILABLE",
      });
      await loadCats();
    } catch (error) {
      console.error("Failed to create cat", error);
    }
  };

  const handleUpdate = async () => {
    if (!editing) return;

    try {
      const res = await fetch(`http://localhost:5000/cats/${editing.id}`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify({
          name: editing.name,
          age: Number(editing.age),
          status: editing.status,
          image: editing.image,
          priority: !!editing.priority,
          breedId: editing.breedId,
        }),
      });

      if (!res.ok) {
        throw new Error(`Failed to update cat. Status: ${res.status}`);
      }

      setEditing(null);
      await loadCats();
    } catch (error) {
      console.error("Failed to update cat", error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete this cat?")) return;

    try {
      const res = await fetch(`http://localhost:5000/cats/${id}`, {
        method: "DELETE",
        headers: authOnlyHeaders(),
      });

      if (!res.ok) {
        throw new Error(`Failed to delete cat. Status: ${res.status}`);
      }

      await loadCats();
    } catch (error) {
      console.error("Failed to delete cat", error);
    }
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      minAge: "",
      maxAge: "",
      breedId: "",
      status: "",
      fromDate: "",
      toDate: "",
    });
    setAgeDraft([MIN, MAX]);
    setCurrentPage(1);
  };

  return (
    <>
      <style>{PAGE_STYLES}</style>
      <div className="cats-page">
        <div className="cats-shell">
          <div className="hero">
            <div className="badge">{admin ? "Premium Cats Dashboard" : "My Cats"}</div>
            <h1 className="page-title">{admin ? "Cats Collection" : "Owned Cats"}</h1>
            <p className="page-subtitle">
              {admin
                ? "Manage all cats, filter quickly, and keep the same functionality with a polished premium interface."
                : "Browse and filter only the cats owned by your account in the same polished premium interface."}
            </p>
          </div>

          {admin && (
            <div className="top-actions">
              <button className="btn" onClick={() => setShowAdd(true)}>
                ➕ Add Cat
              </button>
            </div>
          )}

          <div className="panel filters-card">
            <div className="filters-head">
              <h2 className="filters-title">Filters</h2>
              <span style={{ color: "#e2e8f0", fontWeight: 700 }}>{cats.length} cats found</span>
            </div>

            <div className="filters-grid">
              <div className="field">
                <label>Search</label>
                <input
                  className="input"
                  placeholder="Search by name..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                />
              </div>

              <div className="field slider-box">
                <label>Age From</label>
                <div className="range-card">
                  <div className="range-top">
                    <span>Minimum age</span>
                    <span>{ageDraft[0]}</span>
                  </div>
                  <Slider
                    min={MIN}
                    max={MAX}
                    value={ageDraft[0]}
                    onChange={(_, value) => {
                      if (typeof value !== "number") return;
                      setAgeDraft(([_, max]) => [value, Math.max(value, max)]);
                    }}
                    onChangeCommitted={(_, value) => {
                      if (typeof value !== "number") return;
                      const newMin = value;
                      const adjustedMax = Math.max(newMin, ageDraft[1]);
                      setFilters((prev) => ({
                        ...prev,
                        minAge: String(newMin),
                        maxAge: String(adjustedMax),
                      }));
                    }}
                  />
                </div>
              </div>

              <div className="field slider-box">
                <label>Age To</label>
                <div className="range-card">
                  <div className="range-top">
                    <span>Maximum age</span>
                    <span>{ageDraft[1]}</span>
                  </div>
                  <Slider
                    min={MIN}
                    max={MAX}
                    value={ageDraft[1]}
                    onChange={(_, value) => {
                      if (typeof value !== "number") return;
                      setAgeDraft(([min]) => [Math.min(min, value), value]);
                    }}
                    onChangeCommitted={(_, value) => {
                      if (typeof value !== "number") return;
                      const newMax = value;
                      const adjustedMin = Math.min(ageDraft[0], newMax);
                      setFilters((prev) => ({
                        ...prev,
                        minAge: String(adjustedMin),
                        maxAge: String(newMax),
                      }));
                    }}
                  />
                </div>
              </div>

              <div className="field">
                <label>Breed</label>
                <select
                  className="input"
                  value={filters.breedId}
                  onChange={(e) => setFilters({ ...filters, breedId: e.target.value })}
                >
                  <option value="">All Breeds</option>
                  {breeds.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label>Status</label>
                <select
                  className="input"
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                >
                  <option value="">All Status</option>
                  <option value="AVAILABLE">AVAILABLE</option>
                  <option value="ADOPTED">ADOPTED</option>
                  <option value="PENDING">PENDING</option>
                </select>
              </div>

              <div className="field">
                <label>From Date</label>
                <input
                  type="date"
                  className="input"
                  value={filters.fromDate}
                  onChange={(e) => setFilters({ ...filters, fromDate: e.target.value })}
                />
              </div>

              <div className="field">
                <label>To Date</label>
                <input
                  type="date"
                  className="input"
                  value={filters.toDate}
                  onChange={(e) => setFilters({ ...filters, toDate: e.target.value })}
                />
              </div>
            </div>

            <div className="button-row">
              <button className="btn" onClick={loadCats}>
                🔎 Search
              </button>
              <button className="btn-outline" onClick={clearFilters}>
                Clear
              </button>
            </div>
          </div>

          <div className="panel table-card">
            <div className="table-scroll">
              <table className="cats-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Age</th>
                    <th>Breed</th>
                    <th>Status</th>
                    <th>Image</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={6}>
                        <div className="empty-state">
                          <div className="empty-emoji">⏳</div>
                          <h2 style={{ margin: 0 }}>Loading Cats</h2>
                        </div>
                      </td>
                    </tr>
                  ) : cats.length === 0 ? (
                    <tr>
                      <td colSpan={6}>
                        <div className="empty-state">
                          <div className="empty-emoji">🔍</div>
                          <h2 style={{ margin: 0 }}>No Cats Found</h2>
                          <p style={{ margin: 0, color: "#94a3b8" }}>
                            {admin ? "Try adjusting your filters." : "No owned cats match your filters."}
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    paginatedCats.map((cat) => (
                      <CatRow
                        key={cat.id}
                        cat={cat}
                        admin={admin}
                        onOpen={(catId) => navigate(`/cats/${catId}`)}
                        onEdit={setEditing}
                        onDelete={handleDelete}
                      />
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {!loading && cats.length > 0 && (
            <div className="pagination">
              <button
                className="btn-outline"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                style={{ opacity: currentPage === 1 ? 0.5 : 1 }}
              >
                ◀ Prev
              </button>
              <div className="page-chip">
                Page {currentPage} / {totalPages}
              </div>
              <button
                className="btn-outline"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
                style={{ opacity: currentPage === totalPages ? 0.5 : 1 }}
              >
                Next ▶
              </button>
            </div>
          )}

          {admin && showAdd && (
            <Modal title="Add Cat" onClose={() => setShowAdd(false)}>
              <input
                className="input"
                placeholder="Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              <input
                type="number"
                className="input"
                placeholder="Age"
                value={form.age}
                onChange={(e) => setForm({ ...form, age: e.target.value })}
              />
              <select
                className="input"
                value={form.breedId}
                onChange={(e) => setForm({ ...form, breedId: e.target.value })}
              >
                <option value="">Select Breed</option>
                {breeds.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
              <select
                className="input"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                <option value="AVAILABLE">Available</option>
                <option value="ADOPTED">Adopted</option>
                <option value="PENDING">Pending</option>
              </select>
              <div className="upload-wrap">
                <input
                  className="input"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = () => setForm({ ...form, image: reader.result as string });
                    reader.readAsDataURL(file);
                  }}
                />
              </div>
              <button
                className="btn"
                onClick={async () => {
                  const res = await fetch("https://api.thecatapi.com/v1/images/search");
                  const data = await res.json();
                  setForm({ ...form, image: data[0]?.url || "" });
                }}
              >
                🤖 Generate Image
              </button>
              {form.image && <img src={form.image} alt="Preview" className="preview" loading="lazy" />}
              <button className="btn" onClick={handleCreate}>
                Save
              </button>
            </Modal>
          )}

          {admin && editing && (
            <Modal title="Edit Cat" onClose={() => setEditing(null)}>
              <input
                className="input"
                value={editing.name}
                onChange={(e) => setEditing({ ...editing, name: e.target.value })}
              />
              <input
                type="number"
                className="input"
                value={editing.age}
                onChange={(e) => setEditing({ ...editing, age: Number(e.target.value) })}
              />
              <select
                className="input"
                value={editing.status}
                onChange={(e) => setEditing({ ...editing, status: e.target.value })}
              >
                <option value="AVAILABLE">Available</option>
                <option value="ADOPTED">Adopted</option>
                <option value="PENDING">Pending</option>
              </select>
              <select
                className="input"
                value={editing.breedId}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    breedId: Number(e.target.value),
                    breed: breeds.find((b) => b.id === Number(e.target.value)) || editing.breed,
                  })
                }
              >
                {breeds.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
              <label style={{ display: "flex", gap: 10, alignItems: "center", color: "white" }}>
                <input
                  type="checkbox"
                  checked={Boolean(editing.priority)}
                  onChange={(e) => setEditing({ ...editing, priority: e.target.checked })}
                />
                Priority
              </label>
              <button className="btn" onClick={handleUpdate}>
                Update
              </button>
            </Modal>
          )}
        </div>
      </div>
    </>
  );
}

const Modal = memo(function Modal({ title, children, onClose }: ModalProps) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h3 className="modal-title">{title}</h3>
          <button className="btn-outline" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
});