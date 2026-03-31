import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { Plus } from "lucide-react";

type POS = {
  id: string;
  name: string;
  status: string;
};

export default function CampusPOSTab({ campusId }: { campusId: string }) {
  const [posList, setPosList] = useState<POS[]>([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPOS();
  }, [campusId]);

  async function loadPOS() {
    setLoading(true);
    setError(null);

    const { data, error: queryError } = await supabase
      .from("pos_terminals")
      .select("id, name, status, operating_units!inner(campus_id)")
      .eq("operating_units.campus_id", campusId)
      .order("created_at", { ascending: false });

    if (queryError) {
      setError(`Error cargando POS: ${queryError.message}`);
      setPosList([]);
      setLoading(false);
      return;
    }

    setPosList((data || []).map((item: { id: string; name: string; status: string }) => ({
      id: item.id,
      name: item.name,
      status: item.status,
    })));
    setLoading(false);
  }

  async function createPOS() {
    if (!name.trim()) return;

    setError(null);

    const { data: unit, error: unitError } = await supabase
      .from("operating_units")
      .select("id, school_id")
      .eq("campus_id", campusId)
      .limit(1)
      .maybeSingle();

    if (unitError) {
      setError(`No se pudo resolver unidad del campus: ${unitError.message}`);
      return;
    }

    if (!unit?.id || !unit?.school_id) {
      setError("No hay operating_units para este campus. Crea una unidad primero.");
      return;
    }

    const { error: insertError } = await supabase.from("pos_terminals").insert({
      school_id: unit.school_id,
      unit_id: unit.id,
      name: name.trim(),
      status: "active",
    });

    if (insertError) {
      setError(`Error creando POS: ${insertError.message}`);
      return;
    }

    setName("");
    await loadPOS();
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-4">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nombre del POS"
          className="flex-1 px-4 py-2 rounded-xl border"
        />
        <button
          onClick={createPOS}
          className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-black flex items-center gap-2"
        >
          <Plus size={16} /> Crear POS
        </button>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-sm font-semibold border border-rose-100">
          {error}
        </div>
      )}

      {loading && (
        <p className="text-sm text-slate-500 font-semibold">Cargando terminales...</p>
      )}

      <ul className="space-y-3">
        {posList.map((p) => (
          <li
            key={p.id}
            className="p-4 bg-white rounded-2xl border font-bold flex items-center justify-between"
          >
            <span>{p.name}</span>
            <span className="text-xs uppercase tracking-wider text-slate-500">{p.status}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
