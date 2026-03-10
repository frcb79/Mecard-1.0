import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import SchoolTabs from "./SchoolTabs";
import { Loader2, School as SchoolIcon } from "lucide-react";

type School = {
  id: string;
  name: string;
  status: string;
};

export default function SchoolDetail() {
  const { id } = useParams();
  const [school, setSchool] = useState<School | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) loadSchool();
  }, [id]);

  async function loadSchool() {
    setLoading(true);

    const { data, error } = await supabase
      .from("schools")
      .select("id, name, status")
      .eq("id", id)
      .single();

    if (!error) setSchool(data);
    setLoading(false);
  }

  if (loading) {
    return (
      <div className="flex justify-center py-40">
        <Loader2 className="animate-spin text-indigo-600" size={40} />
      </div>
    );
  }

  if (!school) {
    return <p className="p-10">Escuela no encontrada</p>;
  }

  return (
    <div className="p-10 max-w-7xl mx-auto space-y-10">
      {/* Header */}
      <div className="flex items-center gap-4">
        <SchoolIcon className="text-indigo-600" size={40} />
        <div>
          <h1 className="text-4xl font-black text-slate-800">
            {school.name}
          </h1>
          <p className="text-sm text-slate-400 uppercase tracking-widest">
            Estado: {school.status}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <SchoolTabs schoolId={school.id} />
    </div>
  );
}
