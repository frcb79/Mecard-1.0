import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { Plus } from "lucide-react";

type POS = {
  id: string;
  name: string;
};

export default function CampusPOSTab({ campusId }: { campusId: string }) {
  const [posList, setPosList] = useState<POS[]>([]);
  const [name, setName] = useState("");

  useEffect(() => {
    loadPOS();
  }, [campusId]);

  async function loadPOS() {
    const { data } = await supabase
      .from("pos")
      .select("id, name")
      .eq("campus_id", campusId);

    setPosList(data || []);
  }

  async function createPOS() {
    if (!name.trim()) return;

    await supabase.from("pos").insert({
      campus_id: campusId,
      name,
    });

    setName("");
    loadPOS();
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

      <ul className="space-y-3">
        {posList.map((p) => (
          <li
            key={p.id}
            className="p-4 bg-white rounded-2xl border font-bold"
          >
            {p.name}
          </li>
        ))}
      </ul>
    </div>
  );
}
