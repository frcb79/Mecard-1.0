import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { Plus } from "lucide-react";

type Campus = {
  id: string;
  name: string;
};

export default function SchoolCampusTab({ schoolId }: { schoolId: string }) {
  const [campuses, setCampuses] = useState<Campus[]>([]);
  const [name, setName] = useState("");

  useEffect(() => {
    loadCampuses();
  }, [schoolId]);

  async function loadCampuses() {
    const { data } = await supabase
      .from("campuses")
      .select("id, name")
      .eq("school_id", schoolId);

    setCampuses(data || []);
  }

  async function createCampus() {
    if (!name.trim()) return;

    await supabase.from("campuses").insert({
      school_id: schoolId,
      name,
    });

    setName("");
    loadCampuses();
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-4">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nombre del campus"
          className="flex-1 px-4 py-2 rounded-xl border"
        />
        <button
          onClick={createCampus}
          className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-black flex items-center gap-2"
        >
          <Plus size={16} /> Crear
        </button>
      </div>

      <ul className="space-y-3">
        {campuses.map((c) => (
          <li
            key={c.id}
            className="p-4 bg-white rounded-2xl border font-bold"
          >
            {c.name}
          </li>
        ))}
      </ul>
    </div>
  );
}
