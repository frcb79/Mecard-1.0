import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

type School = {
  id: string;
  name: string;
  status: string;
  created_at: string;
};

export default function Schools() {
  const [schools, setSchools] = useState<School[]>([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSchools();
  }, []);

  async function loadSchools() {
    const { data, error } = await supabase
      .from("schools")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setSchools(data);
    }
  }

  async function createSchool() {
    if (!name.trim()) return;

    setLoading(true);

    await supabase.from("schools").insert({
      name,
    });

    setName("");
    setLoading(false);
    loadSchools();
  }

  return (
    <div>
      <h2>Escuelas</h2>

      <div style={{ marginBottom: 20 }}>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nombre de la escuela"
        />
        <button onClick={createSchool} disabled={loading}>
          Crear
        </button>
      </div>

      <ul>
        {schools.map((school) => (
          <li key={school.id}>{school.name}</li>
        ))}
      </ul>
    </div>
  );
}
