import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

type Cat = {
  id: number;
  name: string;
  age: number;
  breed: string;
};

export default function CatDetails() {
  const { id } = useParams();
  const [cat, setCat] = useState<Cat | null>(null);

  useEffect(() => {
    fetch(`http://localhost:5000/cats/${id}`)
      .then(res => res.json())
      .then(data => setCat(data));
  }, [id]);

  if (!cat) return <div>Loading...</div>;

  const aiImageUrl = `https://api.dicebear.com/7.x/bottts/svg?seed=${cat.name}`;

  return (
    <div style={{ padding: "40px" }}>
      <h2>{cat.name}</h2>
      <p>Age: {cat.age}</p>
      <p>Breed: {cat.breed}</p>

      <img
        src={aiImageUrl}
        alt="AI Cat"
        style={{ marginTop: "20px", width: "200px" }}
      />
    </div>
  );
}