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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSchools();
  }, []);

  async function loadSchools() {
    setError(null);

    const { data, error } = await supabase
      .from("schools")
      .select("id, name, status, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      setError("Error cargando escuelas");
      console.error(error);
      return;
    }

    if (data) {
      setSchools(data);
    }
  }

  async function createSchool() {
    if (!name.trim()) return;

    setLoading(true);
    setError(null);

    const { error } = await supabase.from("schools").insert({
      name: name.trim(),
      status: "ACTIVE",
    });

    setLoading(false);

    if (error) {
      setError("Error creando la escuela");
      console.error(error);
      return;
    }

    setName("");
    loadSchools();
  }

  return (
    <div>
      <h2>Escuelas</h2>

      {/* Crear escuela */}
      <div style={{ marginBottom: 20 }}>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nombre de la escuela"
        />
        <button onClick={createSchool} disabled={loading}>
          {loading ? "Creando..." : "Crear"}
        </button>
      </div>

      {/* Error */}
      {error && (
        <p style={{ color: "red", marginBottom: 10 }}>
          {error}
        </p>
      )}

      {/* Lista */}
      <ul>
        {schools.map((school) => (
          <li key={school.id}>
            <strong>{school.name}</strong> — {school.status}
          </li>
        ))}
      </ul>

      {/* Empty */}
      {schools.length === 0 && !error && (
        <p>No hay escuelas registradas.</p>
      )}
    </div>
  );
}
