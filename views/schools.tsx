import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { Plus, School as SchoolIcon, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

type School = {
  id: string;
  name: string;
  status: string;
  created_at: string;
};

export default function Schools() {
  const [schools, setSchools] = useState<School[]>([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadSchools();
  }, []);

  async function loadSchools() {
    setLoading(true);
    setError(null);

    const { data, error } = await supabase
      .from("schools")
      .select("id, name, status, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      setError("Error cargando escuelas");
      console.error(error);
    } else {
      setSchools(data || []);
    }

    setLoading(false);
  }

  async function createSchool() {
    if (!name.trim()) return;

    setCreating(true);
    setError(null);
    setSuccess(null);

    const { error } = await supabase.from("schools").insert({
      name: name.trim(),
      status: "ACTIVE",
    });

    if (error) {
      setError("Error creando la escuela");
      console.error(error);
    } else {
      setSuccess("Escuela creada correctamente");
      setName("");
      loadSchools();
    }

    setCreating(false);
  }

  return (
    <div className="p-10 max-w-6xl mx-auto space-y-10">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-black text-slate-800 flex items-center gap-4">
          <SchoolIcon className="text-indigo-600" />
          Escuelas
        </h1>
        <p className="text-slate-400 mt-2">
          Administra las instituciones registradas en la plataforma
        </p>
      </div>

      {/* Crear escuela */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4 items-center">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nombre de la escuela"
          className="flex-1 px-5 py-3 rounded-2xl bg-slate-50 border border-slate-200 outline-none focus:ring-4 focus:ring-indigo-100 font-semibold"
        />
        <button
          onClick={createSchool}
          disabled={creating}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-indigo-600 text-white font-black disabled:opacity-50 hover:scale-105 transition"
        >
          {creating ? (
            <>
              <Loader2 className="animate-spin" size={18} />
              Creando…
            </>
          ) : (
            <>
              <Plus size={18} />
              Crear
            </>
          )}
        </button>
      </div>

      {/* Feedback */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 text-rose-600 font-bold">
          {error}
        </div>
      )}
      {success && (
        <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-600 font-bold">
          {success}
        </div>
      )}

      {/* Loader */}
      {loading && (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-indigo-600" size={40} />
        </div>
      )}

      {/* Empty state */}
      {!loading && schools.length === 0 && (
        <div className="text-center py-20 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
          <SchoolIcon size={48} className="mx-auto text-slate-300 mb-4" />
          <p className="text-slate-500 font-semibold">
            No hay escuelas registradas aún
          </p>
          <p className="text-slate-400 text-sm mt-1">
            Crea la primera para comenzar
          </p>
        </div>
      )}

      {/* Lista de escuelas */}
      {!loading && schools.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {schools.map((school) => (
            <div
              key={school.id}
              className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover:shadow-lg hover:-translate-y-1 transition cursor-pointer"
            >
              <h3 className="text-xl font-black text-slate-800">
                {school.name}
              </h3>
              <p className="text-xs uppercase tracking-widest font-bold text-slate-400 mt-2">
                Estado
              </p>
              <span className="inline-block mt-2 px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-700">
                {school.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
