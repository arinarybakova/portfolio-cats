import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

type Cat = {
  id: number;
  name: string;
  age: number;
  breed: string;
  image?: string;
};

export default function CatsList() {
  const [cats, setCats] = useState<Cat[]>([]);
  const [editing, setEditing] = useState<Cat | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [loadingImage, setLoadingImage] = useState(false);

  const [form, setForm] = useState({
    name: "",
    age: "",
    breed: "",
    image: "",
  });

  const navigate = useNavigate();

  /* ================= LOAD ================= */

  const loadCats = async () => {
    const res = await fetch("http://localhost:5000/cats");
    const data = await res.json();
    setCats(data);
  };

  useEffect(() => {
    loadCats();
  }, []);

  /* ================= GENERATE REAL CAT IMAGE ================= */

  const generateRealCat = async () => {
    try {
      setLoadingImage(true);
      const res = await fetch("https://api.thecatapi.com/v1/images/search");
      const data = await res.json();

      setForm({
        ...form,
        image: data[0].url,
      });
    } catch (err) {
      console.error("Failed to load cat image");
    } finally {
      setLoadingImage(false);
    }
  };

  /* ================= CREATE ================= */

  const handleCreate = async () => {
    if (!form.name || !form.age || !form.breed) return;

    await fetch("http://localhost:5000/cats", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        age: Number(form.age),
        breed: form.breed,
        image: form.image,
      }),
    });

    setForm({ name: "", age: "", breed: "", image: "" });
    setShowAdd(false);
    loadCats();
  };

  /* ================= UPDATE ================= */

  const handleSaveEdit = async () => {
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
    await fetch(`http://localhost:5000/cats/${id}`, {
      method: "DELETE",
    });

    loadCats();
  };

  return (
    <div style={{ maxWidth: 1000, margin: "80px auto" }}>
      <h1 style={{ textAlign: "center", marginBottom: 30 }}>🐱 Cats</h1>

      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <button
          onClick={() => setShowAdd(true)}
          style={primaryBtn}
        >
          + Add Cat
        </button>
      </div>

      {/* TABLE */}
      <table style={tableStyle}>
        <thead>
          <tr style={theadStyle}>
            <th style={th}>Name</th>
            <th style={th}>Age</th>
            <th style={th}>Breed</th>
            <th style={th}>Actions</th>
          </tr>
        </thead>

        <tbody>
          {cats.map((cat, index) => (
            <tr
              key={cat.id}
              style={{
                backgroundColor: index % 2 === 0 ? "#f9f9f9" : "#fff",
                textAlign: "center",
              }}
            >
              <td
                style={{ padding: 12, cursor: "pointer", fontWeight: "bold" }}
                onClick={() => navigate(`/cats/${cat.id}`)}
              >
                {cat.name}
              </td>
              <td style={{ padding: 12 }}>{cat.age}</td>
              <td style={{ padding: 12 }}>{cat.breed}</td>
              <td style={{ padding: 12 }}>
                <button
                  style={editBtn}
                  onClick={() => setEditing({ ...cat })}
                >
                  Edit
                </button>
                <button
                  style={deleteBtn}
                  onClick={() => handleDelete(cat.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ================= ADD MODAL ================= */}
      {showAdd && (
        <Modal title="Add New Cat 🐱" onClose={() => setShowAdd(false)}>
          <input
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <input
            placeholder="Age"
            value={form.age}
            onChange={(e) => setForm({ ...form, age: e.target.value })}
          />
          <input
            placeholder="Breed"
            value={form.breed}
            onChange={(e) => setForm({ ...form, breed: e.target.value })}
          />

          <button onClick={generateRealCat}>
            {loadingImage ? "Loading kitten..." : "Generate Real Kitten 🐱"}
          </button>

          {form.image && (
            <img
              src={form.image}
              alt="preview"
              style={{ width: 150, borderRadius: 12 }}
            />
          )}

          <button onClick={handleCreate} style={saveBtn}>
            Create
          </button>
        </Modal>
      )}

      {/* ================= EDIT MODAL ================= */}
      {editing && (
        <Modal title="Edit Cat 🐾" onClose={() => setEditing(null)}>
          <input
            value={editing.name}
            onChange={(e) =>
              setEditing({ ...editing, name: e.target.value })
            }
          />
          <input
            value={editing.age}
            onChange={(e) =>
              setEditing({
                ...editing,
                age: Number(e.target.value),
              })
            }
          />
          <input
            value={editing.breed}
            onChange={(e) =>
              setEditing({ ...editing, breed: e.target.value })
            }
          />

          <button onClick={handleSaveEdit} style={saveBtn}>
            Save
          </button>
        </Modal>
      )}
    </div>
  );
}

/* ================= MODAL ================= */

function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div onClick={onClose} style={overlay}>
      <div onClick={(e) => e.stopPropagation()} style={modalStyle}>
        <h2>{title}</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {children}
        </div>
      </div>
    </div>
  );
}

/* ================= STYLES ================= */

const tableStyle = {
  width: "100%",
  borderCollapse: "separate" as const,
  borderRadius: 12,
  overflow: "hidden",
  boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
};

const theadStyle = {
  background: "linear-gradient(90deg,#6a11cb,#2575fc)",
  color: "white",
};

const th = { padding: 15 };

const primaryBtn = {
  padding: "10px 20px",
  borderRadius: 8,
  border: "none",
  background: "linear-gradient(90deg,#6a11cb,#2575fc)",
  color: "white",
  fontWeight: "bold",
  cursor: "pointer",
};

const editBtn = {
  marginRight: 8,
  background: "#ff9800",
  color: "white",
  border: "none",
  padding: "6px 10px",
  borderRadius: 6,
  cursor: "pointer",
};

const deleteBtn = {
  background: "#f44336",
  color: "white",
  border: "none",
  padding: "6px 10px",
  borderRadius: 6,
  cursor: "pointer",
};

const saveBtn = {
  background: "#4CAF50",
  color: "white",
  border: "none",
  padding: "8px",
  borderRadius: 8,
  cursor: "pointer",
};

const overlay = {
  position: "fixed" as const,
  inset: 0,
  background: "rgba(0,0,0,0.6)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
};

const modalStyle = {
  background: "white",
  padding: 30,
  borderRadius: 16,
  minWidth: 350,
};