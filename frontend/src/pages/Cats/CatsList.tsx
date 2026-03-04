import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

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
};

/* ================= COMPONENT ================= */

export default function CatsList() {
  const navigate = useNavigate();

  const [cats, setCats] = useState<Cat[]>([]);
  const [breeds, setBreeds] = useState<Breed[]>([]);

  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<Cat | null>(null);

  const [form, setForm] = useState({
    name: "",
    age: "",
    breedId: "",
    image: "",
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

  /* ================= PAGINATION ================= */

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  /* ================= LOAD DATA ================= */

  const loadCats = async () => {
    const query = new URLSearchParams(
      Object.entries(filters).filter(([_, v]) => v !== ""),
    ).toString();

    const res = await fetch(`http://localhost:5000/cats?${query}`);
    const data = await res.json();
    setCats(data);
    setCurrentPage(1);
  };

  const loadBreeds = async () => {
    const res = await fetch("http://localhost:5000/breeds");
    const data = await res.json();
    setBreeds(data);
  };

  useEffect(() => {
    loadBreeds();
    loadCats();
  }, []);

  const totalPages = Math.ceil(cats.length / itemsPerPage);

  const paginatedCats = cats.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  /* ================= CREATE ================= */

  const handleCreate = async () => {
    await fetch("http://localhost:5000/cats", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        age: Number(form.age),
        breedId: Number(form.breedId),
        image: form.image,
      }),
    });

    setShowAdd(false);
    setForm({ name: "", age: "", breedId: "", image: "" });
    loadCats();
  };

  /* ================= UPDATE ================= */

  const handleUpdate = async () => {
    if (!editing) return;

    await fetch(`http://localhost:5000/cats/${editing.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editing),
    });

    setEditing(null);
    loadCats();
  };

  /* ================= DELETE ================= */

  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete this cat?")) return;

    await fetch(`http://localhost:5000/cats/${id}`, {
      method: "DELETE",
    });

    loadCats();
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

    setTimeout(loadCats, 0);
  };

  /* ================= UI ================= */

  return (
    <div style={{ maxWidth: 1200, margin: "80px auto" }}>
      <h1 style={{ textAlign: "center" }}>🐱 Cats</h1>

      {/* ================= ADD BUTTON ================= */}

      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <button style={primaryBtn} onClick={() => setShowAdd(true)}>
          ➕ Add Cat
        </button>
      </div>

      {/* ================= FILTERS ================= */}

      <div style={filterCard}>
        <div style={filterHeader}>Filters</div>

        <div style={filterGrid}>
          <input
            style={inputStyle}
            placeholder="Search..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />

          <input
            style={inputStyle}
            type="number"
            placeholder="Min Age"
            value={filters.minAge}
            onChange={(e) => setFilters({ ...filters, minAge: e.target.value })}
          />

          <input
            style={inputStyle}
            type="number"
            placeholder="Max Age"
            value={filters.maxAge}
            onChange={(e) => setFilters({ ...filters, maxAge: e.target.value })}
          />

          <select
            style={inputStyle}
            value={filters.breedId}
            onChange={(e) =>
              setFilters({ ...filters, breedId: e.target.value })
            }
          >
            <option value="">All Breeds</option>
            {breeds.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>

          <select
            style={inputStyle}
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          >
            <option value="">All Status</option>
            <option value="AVAILABLE">AVAILABLE</option>
            <option value="ADOPTED">ADOPTED</option>
            <option value="PENDING">PENDING</option>
          </select>

          <input
            type="date"
            style={inputStyle}
            value={filters.fromDate}
            onChange={(e) =>
              setFilters({ ...filters, fromDate: e.target.value })
            }
          />

          <input
            type="date"
            style={inputStyle}
            value={filters.toDate}
            onChange={(e) => setFilters({ ...filters, toDate: e.target.value })}
          />
        </div>

        <div style={buttonRow}>
          <button style={primaryBtn} onClick={loadCats}>
            🔎 Search
          </button>

          <button style={secondaryBtn} onClick={clearFilters}>
            Clear
          </button>
        </div>
      </div>

      {/* ================= TABLE ================= */}
<table style={tableStyle}>
  <thead>
    <tr>
      <th style={thStyle}>Name</th>
      <th style={thStyle}>Age</th>
      <th style={thStyle}>Breed</th>
      <th style={thStyle}>Status</th>
      <th style={thStyle}>Image</th>
      <th style={thStyle}>Actions</th>
    </tr>
  </thead>
      <tbody>
        {cats.length === 0 ? (
          <tr>
            <td colSpan={6} style={{ padding: 60 }}>
              <div style={emptyState}>
                🔍
                <h2>No Cats Found</h2>
                <p style={{ margin: 0, color: "#777" }}>
                  Try adjusting your filters
                </p>
              </div>
            </td>
          </tr>
        ) : (
          paginatedCats.map((cat) => (
            <tr
              key={cat.id}
              className="table-row-hover"
              style={{ textAlign: "center" }}
            >
              <td
                style={clickableName}
                onClick={() => navigate(`/cats/${cat.id}`)}
              >
                {cat.name}
              </td>

              <td>{cat.age}</td>
              <td>{cat.breed?.name}</td>
              <td>{cat.status}</td>

              <td>
                {cat.image && (
                  <img src={cat.image} style={{ width: 60, borderRadius: 8 }} />
                )}
              </td>

              <td>
                <button style={primaryBtn} onClick={() => setEditing(cat)}>
                  ✏ Edit
                </button>

                <button style={deleteBtn} onClick={() => handleDelete(cat.id)}>
                  Delete
                </button>
              </td>
            </tr>
          ))
        )}
      </tbody>
</table>
      {/* ================= PAGINATION ================= */}

      {cats.length > 0 && (
        <div style={paginationContainer}>
          <button
            style={primaryBtn}
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
          >
            ◀ Prev
          </button>

          <span>
            Page {currentPage} / {totalPages || 1}
          </span>

          <button
            style={primaryBtn}
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
          >
            Next ▶
          </button>
        </div>
      )}
      {/* ================= ADD MODAL ================= */}

      {showAdd && (
        <Modal title="Add Cat" onClose={() => setShowAdd(false)}>
          <input
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />

          <input
            type="number"
            placeholder="Age"
            value={form.age}
            onChange={(e) => setForm({ ...form, age: e.target.value })}
          />

          <select
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

          {/* IMAGE UPLOAD */}
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;

              const reader = new FileReader();
              reader.onload = () =>
                setForm({
                  ...form,
                  image: reader.result as string,
                });

              reader.readAsDataURL(file);
            }}
          />

          {/* AI GENERATE */}
          <button
            style={primaryBtn}
            onClick={async () => {
              const res = await fetch(
                "https://api.thecatapi.com/v1/images/search",
              );
              const data = await res.json();

              setForm({
                ...form,
                image: data[0]?.url || "",
              });
            }}
          >
            🤖 Generate Image
          </button>

          {form.image && (
            <img src={form.image} style={{ width: 120, borderRadius: 10 }} />
          )}

          <button style={primaryBtn} onClick={handleCreate}>
            Save
          </button>
        </Modal>
      )}

      {/* ================= EDIT MODAL ================= */}

      {editing && (
        <Modal title="Edit Cat" onClose={() => setEditing(null)}>
          <input
            value={editing.name}
            onChange={(e) =>
              setEditing({
                ...editing,
                name: e.target.value,
              })
            }
          />

          <input
            type="number"
            value={editing.age}
            onChange={(e) =>
              setEditing({
                ...editing,
                age: Number(e.target.value),
              })
            }
          />

          <button style={primaryBtn} onClick={handleUpdate}>
            Update
          </button>
        </Modal>
      )}
    </div>
  );
}

/* ================= MODAL ================= */

function Modal({ title, children, onClose }: any) {
  return (
    <div style={overlay} onClick={onClose}>
      <div style={modal} onClick={(e) => e.stopPropagation()}>
        <h3>{title}</h3>
        {children}
      </div>
    </div>
  );
}

/* ================= STYLES ================= */

const primaryBtn = {
  padding: "8px 16px",
  background: "linear-gradient(90deg,#6a11cb,#2575fc)",
  color: "white",
  border: "none",
  borderRadius: 8,
  cursor: "pointer",
};

const secondaryBtn = {
  padding: "8px 16px",
  borderRadius: 8,
  border: "1px solid #6a11cb",
  background: "white",
  color: "#6a11cb",
  cursor: "pointer",
};

const deleteBtn = {
  padding: "6px 10px",
  background: "#f44336",
  color: "white",
  border: "none",
  borderRadius: 6,
  cursor: "pointer",
};

const filterCard = {
  background: "white",
  borderRadius: 16,
  padding: 0,
  boxShadow: "0 6px 25px rgba(0,0,0,0.1)",
  marginBottom: 30,
};

const filterHeader = {
  background: "linear-gradient(90deg,#6a11cb,#2575fc)",
  color: "white",
  padding: "14px",
};

const filterGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
  gap: 15,
  padding: 20,
};

const buttonRow = {
  display: "flex",
  justifyContent: "flex-end",
  gap: 10,
  padding: "0 20px 20px",
};

const inputStyle = {
  padding: "10px",
  borderRadius: 8,
  border: "1px solid #ddd",
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse" as const,
  marginTop: 20,
};

const theadStyle = {
  background: "linear-gradient(90deg,#6a11cb,#2575fc)",
  color: "white",
};

const overlay = {
  position: "fixed" as const,
  inset: 0,
  background: "rgba(0,0,0,0.5)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
};

const modal = {
  background: "white",
  padding: 30,
  borderRadius: 12,
  display: "flex",
  flexDirection: "column" as const,
  gap: 10,
  width: 350,
};

const noDataContainer = {
  display: "flex" as const,
  flexDirection: "column" as const,
  alignItems: "center",
  justifyContent: "center",
  gap: 10,
  color: "#888",
  fontSize: 18,
};
/* ================= NEW STYLES ================= */

<style>
  {`
.table-row-hover {
  transition: all 0.2s ease;
}

.table-row-hover:hover {
  background: #f5f7ff;
  transform: scale(1.01);
}
`}
</style>;

const clickableName = {
  cursor: "pointer",
  color: "#2575fc",
  fontWeight: 600,
};

const emptyState = {
  textAlign: "center" as const,
  animation: "fadeIn 0.4s ease",
};

const paginationContainer = {
  marginTop: 30,
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  gap: 20,
};

const thStyle = {
  padding: "14px",
  background: "linear-gradient(90deg,#6a11cb,#2575fc)",
  color: "white",
  textAlign: "center" as const,
};

const emptyCell = {
  padding: "50px",
  textAlign: "center" as const,
  fontSize: 18,
};
