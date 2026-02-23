import SchoolCampusTab from "./SchoolCampusTab";
import { useState } from "react";
import { Building2, DollarSign, MapPin, Terminal } from "lucide-react";
import { BusinessModelConfiguration } from "./BusinessModelConfiguration";

const TABS = [
  { id: "general", label: "General", icon: Building2 },
  { id: "business", label: "Negocio", icon: DollarSign },
  { id: "campus", label: "Campus", icon: MapPin },
  { id: "pos", label: "POS", icon: Terminal },
];

export default function SchoolTabs({ schoolId }: { schoolId: string }) {
  const [activeTab, setActiveTab] = useState("general");

  return (
    <div className="space-y-8">
      {/* Tabs header */}
      <div className="flex gap-4 border-b border-slate-200">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-3 font-black text-sm rounded-t-xl transition ${
              activeTab === tab.id
                ? "bg-indigo-600 text-white"
                : "text-slate-400 hover:text-slate-600"
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === "general" && (
        <div className="bg-white p-8 rounded-3xl border">
          <h2 className="text-2xl font-black mb-4">Información General</h2>
          <p className="text-slate-500">
            Datos básicos de la institución, estatus y metadata.
          </p>
        </div>
      )}

      {activeTab === "business" && (
        <BusinessModelConfiguration
          schoolId={schoolId}
          onSave={(model) => {
          }}
        />
      )}

     {activeTab === "campus" && (
  <SchoolCampusTab schoolId={schoolId} />
)}

      {activeTab === "pos" && (
        <div className="bg-white p-8 rounded-3xl border space-y-4">
          <h2 className="text-2xl font-black">POS</h2>
          <p className="text-slate-500">
            Cada campus puede tener múltiples POS:
          </p>
          <ul className="list-disc pl-6 text-slate-600">
            <li>POS Cafetería Principal</li>
            <li>POS Kiosko</li>
            <li>POS Eventos</li>
          </ul>
        </div>
      )}
    </div>
  );
}
