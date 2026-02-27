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
};

/* ================= COMPONENT ================= */

export default function CatsList() {
  const navigate = useNavigate();

  const [cats, setCats] = useState<Cat[]>([]);
  const [breeds, setBreeds] = useState<Breed[]>([]);
  const [editing, setEditing] = useState<Cat | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [loadingImage, setLoadingImage] = useState(false);

  const [form, setForm] = useState({
    name: "",
    age: "",
    breedId: "",
    image: "",
  });

  /* ================= LOAD DATA ================= */

  const loadCats = async () => {
    try {
      const res = await fetch("http://localhost:5000/cats");
      const data = await res.json();
      setCats(data);
    } catch (err) {
      console.error("Failed to load cats");
    }
  };

  const loadBreeds = async () => {
    try {
      const res = await fetch("http://localhost:5000/breeds");
      const data = await res.json();
      setBreeds(data);
    } catch (err) {
      console.error("Failed to load breeds");
    }
  };

  useEffect(() => {
    loadCats();
    loadBreeds();
  }, []);

  /* ================= IMAGE GENERATION ================= */

  const generateRealCat = async () => {
    try {
      setLoadingImage(true);
      const res = await fetch("https://api.thecatapi.com/v1/images/search");
      const data = await res.json();

      setForm((prev) => ({
        ...prev,
        image: data[0]?.url || "",
      }));
    } catch (err) {
      console.error("Image generation failed");
    } finally {
      setLoadingImage(false);
    }
  };

  /* ================= CREATE ================= */

  const handleCreate = async () => {
    if (!form.name || !form.age || !form.breedId) {
      alert("Please fill all fields");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/cats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          age: Number(form.age),
          image: form.image,
          breedId: Number(form.breedId),
          status: "AVAILABLE",
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to create cat");
      }

      setForm({
        name: "",
        age: "",
        breedId: "",
        image: "",
      });

      setShowAdd(false);
      loadCats();
    } catch (err) {
      console.error(err);
      alert("Error creating cat");
    }
  };

  /* ================= UPDATE ================= */

  const handleSaveEdit = async () => {
    if (!editing) return;

    try {
      const res = await fetch(
        `http://localhost:5000/cats/${editing.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editing),
        }
      );

      if (!res.ok) throw new Error("Update failed");

      setEditing(null);
      loadCats();
    } catch (err) {
      console.error(err);
      alert("Failed to update cat");
    }
  };

  /* ================= DELETE ================= */

  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete this cat?")) return;

    try {
      await fetch(`http://localhost:5000/cats/${id}`, {
        method: "DELETE",
      });

      loadCats();
    } catch (err) {
      console.error("Delete failed");
    }
  };

  /* ================= UI ================= */

  return (
    <div style={{ maxWidth: 1000, margin: "80px auto" }}>
      <h1 style={{ textAlign: "center", marginBottom: 30 }}>🐱 Cats</h1>

      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <button onClick={() => setShowAdd(true)} style={primaryBtn}>
          + Add Cat
        </button>
      </div>

      {/* ================= TABLE ================= */}

      <table style={tableStyle}>
        <thead>
          <tr style={theadStyle}>
            <th style={th}>Name</th>
            <th style={th}>Age</th>
            <th style={th}>Breed</th>
            <th style={th}>Status</th>
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
              <td style={{ padding: 12 }}>{cat.breed?.name}</td>
              <td style={{ padding: 12 }}>{cat.status}</td>

              <td style={{ padding: 12 }}>
                <button
                  style={editBtn}
                  onClick={() => setEditing(cat)}
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
            onChange={(e) =>
              setForm({ ...form, name: e.target.value })
            }
          />

          <input
            placeholder="Age"
            type="number"
            value={form.age}
            onChange={(e) =>
              setForm({ ...form, age: e.target.value })
            }
          />

          <select
            value={form.breedId}
            onChange={(e) =>
              setForm({ ...form, breedId: e.target.value })
            }
          >
            <option value="">Select Breed</option>
            {breeds.map((breed) => (
              <option key={breed.id} value={breed.id}>
                {breed.name}
              </option>
            ))}
          </select>

          <button onClick={generateRealCat}>
            {loadingImage
              ? "Loading kitten..."
              : "Generate Real Kitten 🐱"}
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
      <div
        onClick={(e) => e.stopPropagation()}
        style={modalStyle}
      >
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