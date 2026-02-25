import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

type Cat = {
  id: number;
  name: string;
  age: number;
  breed: string;
  image?: string;
};

export default function CatDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [cat, setCat] = useState<Cat | null>(null);

  useEffect(() => {
    fetch(`http://localhost:5000/cats/${id}`)
      .then((res) => res.json())
      .then((data) => setCat(data));
  }, [id]);

  if (!cat) return <div style={{ marginTop: 100 }}>Loading...</div>;

  return (
    <div style={{ maxWidth: 800, margin: "80px auto" }}>
      <button onClick={() => navigate(-1)}>← Back</button>

      <div
        style={{
          borderRadius: 20,
          overflow: "hidden",
          boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
          background: "white",
          marginTop: 20,
        }}
      >
        <div
          style={{
            height: 150,
            background: "linear-gradient(90deg,#6a11cb,#2575fc)",
          }}
        />

        <div style={{ textAlign: "center", padding: 30 }}>
          <img
            src={cat.image}
            alt={cat.name}
            style={{
              width: 200,
              height: 200,
              borderRadius: "50%",
              objectFit: "cover",
              marginTop: -120,
              border: "6px solid white",
            }}
          />
          <h2>{cat.name}</h2>
          <p>🐾 Age: {cat.age}</p>
          <p>🧬 Breed: {cat.breed}</p>
        </div>
      </div>
    </div>
  );
}