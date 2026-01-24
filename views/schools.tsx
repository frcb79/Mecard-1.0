import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { Button } from "../components/Button";

type SchoolStatus = "trial" | "active" | "suspended";

type School = {
  id: string;
  name: string;
  status: SchoolStatus;
  created_at: string;
};

export default function Schools() {
  const [schools, setSchools] = useState<School[]>([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingList, setLoadingList] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSchools();
  }, []);

  async function loadSchools() {
    setError(null);
    setLoadingList(true);

    const { data, error } = await supabase
      .from("schools")
      .select("id, name, status, created_at")
      .order("created_at", { ascending: false });

    setLoadingList(false);

    if (error) {
      console.error(error);
      setError("Error cargando escuelas");
      return;
    }

    setSchools(data ?? []);
  }

  async function createSchool() {
    if (!name.trim()) return;

    setLoading(true);
    setError(null);

    const { error } = await supabase.from("schools").insert({
      name: name.trim(),
      status: "trial",
    });

    setLoading(false);

    if (error) {
      console.error(error);
      setError("Error creando la escuela");
      return;
    }

    setName("");
    loadSchools();
  }

  function statusBadge(status: SchoolStatus) {
    const styles: Record<SchoolStatus, string> = {
      trial: "bg-yellow-100 text-yellow-800",
      active: "bg-green-100 text-green-800",
      suspended: "bg-red-100 text-red-800",
    };

    const labels: Record<SchoolStatus, string> = {
      trial: "Trial",
      active: "Activa",
      suspended: "Suspendida",
    };

    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-bold ${styles[status]}`}
      >
        {labels[status]}
      </span>
    );
  }

  return (
    <div className="p-8 max-w-5xl">
      <h1 className="text-3xl font-black mb-6">Escuelas</h1>

      {/* Crear escuela */}
      <div className="bg-white border rounded-xl p-6 mb-8 flex gap-4 items-end">
        <div className="flex-1">
          <label className="block text-sm font-bold mb-1">
            Nombre de la escuela
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej. Colegio MeCard"
            className="w-full border rounded-lg px-4 py-2"
          />
        </div>

        <Button onClick={createSchool} disabled={loading}>
          {loading ? "Creando..." : "Crear escuela"}
        </Button>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 text-red-600 font-semibold">
          {error}
        </div>
      )}

      {/* Loading */}
      {loadingList && <p>Cargando escuelas...</p>}

      {/* Lista */}
      {!loadingList && schools.length > 0 && (
        <div className="bg-white border rounded-xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 text-left text-sm">
              <tr>
                <th className="p-4">Escuela</th>
                <th className="p-4">Estado</th>
                <th className="p-4">Creada</th>
              </tr>
            </thead>
            <tbody>
              {schools.map((school) => (
                <tr
                  key={school.id}
                  className="border-t hover:bg-slate-50"
                >
                  <td className="p-4 font-semibold">
                    {school.name}
