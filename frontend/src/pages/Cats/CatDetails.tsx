import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

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
};

export default function CatDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [cat, setCat] = useState<Cat | null>(null);
  const [formData, setFormData] = useState<Cat | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [ownerId, setOwnerId] = useState<number | "">("");
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  /* ================= FETCH CAT ================= */

  const fetchCat = async () => {
    try {
      const res = await fetch(`http://localhost:5000/cats/${id}`);
      const data = await res.json();
      setCat(data);
      setFormData(data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCat();
  }, [id]);

  /* ================= FETCH USERS ================= */

  useEffect(() => {
    fetch("http://localhost:5000/users")
      .then((res) => res.json())
      .then((data) => setUsers(data))
      .catch((err) => console.error("Failed to fetch users", err));
  }, []);

  if (loading) {
    return (
      <div style={{ marginTop: 120, textAlign: "center" }}>
        <h2>Loading Cat...</h2>
      </div>
    );
  }

  if (!cat || !formData) return null;

  /* ================= SAVE CAT ================= */

  const handleSave = async () => {
    try {
      setSaving(true);

      const res = await fetch(`http://localhost:5000/cats/${cat.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          age: formData.age,
          status: formData.status,
          image: formData.image,
        }),
      });

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

  /* ================= ASSIGN OWNER ================= */

  const assignOwner = async () => {
    if (!ownerId) return;

    try {
      const res = await fetch(
        `http://localhost:5000/cats/${cat.id}/assign-owner`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ownerId }),
        },
      );

      const updated = await res.json();
      setCat(updated);
      setFormData(updated);
      setOwnerId("");
    } catch (err) {
      console.error("Assign owner failed", err);
    }
  };

  /* ================= REMOVE OWNER ================= */

  const removeOwner = async () => {
    try {
      const res = await fetch(
        `http://localhost:5000/cats/${cat.id}/remove-owner`,
        { method: "POST" },
      );

      const updated = await res.json();
      setCat(updated);
      setFormData(updated);
    } catch (err) {
      console.error("Remove owner failed", err);
    }
  };

  /* ================= DELETE CAT ================= */

  const deleteCat = async () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this cat?",
    );

    if (!confirmDelete) return;

    try {
      await fetch(`http://localhost:5000/cats/${cat.id}`, {
        method: "DELETE",
      });

      navigate("/");
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  /* ================= UI ================= */

  return (
    <div
      style={{
        maxWidth: 900,
        margin: "100px auto",
        padding: 20,
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <button
        onClick={() => navigate(-1)}
        style={{
          background: "none",
          border: "none",
          fontSize: 16,
          cursor: "pointer",
          marginBottom: 20,
        }}
      >
        ← Back
      </button>

      <div
        style={{
          borderRadius: 24,
          overflow: "hidden",
          boxShadow: "0 25px 60px rgba(0,0,0,0.15)",
          background: "white",
        }}
      >
        <div
          style={{
            height: 180,
            background: "linear-gradient(135deg,#667eea,#764ba2,#6B73FF)",
          }}
        />

        <div style={{ textAlign: "center", padding: 40 }}>
          <img
            src={formData.image || "https://via.placeholder.com/200"}
            alt={formData.name}
            style={{
              width: 220,
              height: 220,
              borderRadius: "50%",
              objectFit: "cover",
              marginTop: -140,
              border: "8px solid white",
              boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
            }}
          />

          {/* ================= EDIT MODE ================= */}

          {isEditing ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 15,
                marginTop: 30,
              }}
            >
              <input
                style={inputStyle}
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />

              <input
                style={inputStyle}
                type="number"
                value={formData.age}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    age: Number(e.target.value),
                  })
                }
              />

              <select
                style={inputStyle}
                value={formData.status}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    status: e.target.value,
                  })
                }
              >
                <option value="AVAILABLE">Available</option>
                <option value="ADOPTED">Adopted</option>
                <option value="PENDING">Pending</option>
              </select>

              {/* IMAGE */}
              <input type="file" />

              {/* ================= OWNER SECTION ================= */}

              {/* ✅ SHOW DROPDOWN ONLY IF NO OWNER */}
              {!cat.owner && (
                <>
                  <select
                    style={inputStyle}
                    value={ownerId}
                    onChange={(e) => setOwnerId(Number(e.target.value))}
                  >
                    <option value="">Select Owner</option>

                    {users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name}
                      </option>
                    ))}
                  </select>

                  <button
                    style={secondaryButton}
                    onClick={assignOwner}
                    disabled={!ownerId}
                  >
                    👤 Assign Owner
                  </button>
                </>
              )}

              {/* ✅ SHOW REMOVE ONLY IF OWNER EXISTS */}
              {cat.owner && (
                <button style={dangerButton} onClick={removeOwner}>
                  ❌ Remove Owner
                </button>
              )}
            </div>
          ) : (
            <>
              <h1 style={{ marginTop: 30, fontSize: 32 }}>{cat.name}</h1>
              <p>🐾 Age: {cat.age}</p>
              <p>🧬 Breed: {cat.breed.name}</p>
              <p>📌 Status: {cat.status}</p>
              <p>👤 Owner: {cat.owner?.name || "No owner yet"}</p>
            </>
          )}
        </div>

        {/* ================= ACTION BUTTONS ================= */}

        <div style={{ textAlign: "center", marginBottom: 40 }}>
          {isEditing ? (
            <>
              <button
                style={primaryButton}
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>

              <button style={dangerButton} onClick={handleCancel}>
                Cancel
              </button>
            </>
          ) : (
            <>
              <button style={primaryButton} onClick={() => setIsEditing(true)}>
                ✏️ Edit
              </button>

              <button style={dangerButton} onClick={deleteCat}>
                🗑 Delete Cat
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ================= STYLES ================= */

const inputStyle: React.CSSProperties = {
  padding: "12px 16px",
  borderRadius: 12,
  border: "1px solid #ddd",
  fontSize: 16,
};

const primaryButton: React.CSSProperties = {
  padding: "12px 28px",
  borderRadius: 30,
  border: "none",
  background: "linear-gradient(135deg,#667eea,#764ba2)",
  color: "white",
  fontWeight: 600,
  cursor: "pointer",
  marginRight: 10,
};

const secondaryButton: React.CSSProperties = {
  padding: "10px 20px",
  borderRadius: 20,
  border: "none",
  background: "#eee",
  cursor: "pointer",
};

const dangerButton: React.CSSProperties = {
  padding: "12px 28px",
  borderRadius: 30,
  border: "none",
  background: "#ff4d4f",
  color: "white",
  fontWeight: 600,
  cursor: "pointer",
  marginLeft: 10,
};
