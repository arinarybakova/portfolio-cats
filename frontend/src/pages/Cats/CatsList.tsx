import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

type Cat = {
  id: number;
  name: string;
  age: number;
  breed: string;
};

export default function CatsList() {
  const [cats, setCats] = useState<Cat[]>([]);
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [breed, setBreed] = useState("");
  const [editing, setEditing] = useState<Cat | null>(null);

  const navigate = useNavigate();

  const loadCats = async () => {
    const res = await fetch("http://localhost:5000/cats");
    const data = await res.json();
    setCats(data);
  };

  useEffect(() => {
    loadCats();
  }, []);

  const handleCreate = async () => {
    await fetch("http://localhost:5000/cats", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        age: Number(age),
        breed,
      }),
    });

    setName("");
    setAge("");
    setBreed("");

    loadCats();
  };

  const handleDelete = async (id: number) => {
    await fetch(`http://localhost:5000/cats/${id}`, {
      method: "DELETE",
    });

    loadCats();
  };

  return (
    <div style={{ padding: "40px" }}>
      <h1>Cats 🐱</h1>

      {/* Create Form */}
      <div style={{ marginBottom: "20px" }}>
        <input
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          placeholder="Age"
          value={age}
          onChange={(e) => setAge(e.target.value)}
        />
        <input
          placeholder="Breed"
          value={breed}
          onChange={(e) => setBreed(e.target.value)}
        />

        <button onClick={handleCreate}>Create</button>
      </div>

      {/* Table */}
      <table border={1} style={{ width: "100%", cursor: "pointer" }}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Age</th>
            <th>Breed</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {cats.map((cat) => (
            <tr key={cat.id}>
              <td onClick={() => navigate(`/cats/${cat.id}`)}>{cat.name}</td>
              <td>{cat.age}</td>
              <td>{cat.breed}</td>
              <td>
                <button
                  style={{ background: "red", color: "white" }}
                  onClick={() => handleDelete(cat.id)}
                >
                  Delete
                </button>
                <button onClick={() => setEditing(cat)}>Edit</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {editing && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            background: "rgba(0,0,0,0.5)",
            width: "100%",
            height: "100%",
          }}
        >
          <div style={{ background: "white", padding: 20 }}>
            <h2>Edit Cat</h2>

            <input
              value={editing.name}
              onChange={(e) => setEditing({ ...editing, name: e.target.value })}
            />

            <input
              value={editing.age}
              onChange={(e) =>
                setEditing({ ...editing, age: Number(e.target.value) })
              }
            />

            <input
              value={editing.breed}
              onChange={(e) =>
                setEditing({ ...editing, breed: e.target.value })
              }
            />

            <button
              onClick={async () => {
                await fetch(`http://localhost:5000/cats/${editing.id}`, {
                  method: "PUT",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(editing),
                });

                setEditing(null);
                loadCats();
              }}
            >
              Save
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
