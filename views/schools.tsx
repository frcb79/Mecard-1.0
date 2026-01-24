import React, { useState } from "react";
import { Plus, Settings, Building2 } from "lucide-react";
import { BusinessModelConfiguration } from "../components/BusinessModelConfiguration";
import { Button } from "../components/Button";

/**
 * MODELOS BASE
 * ============================
 */

interface School {
  id: string;
  name: string;
  city: string;
  status: "ACTIVE" | "INACTIVE";
}

/**
 * MOCK DATA (luego va API)
 * ============================
 */
const MOCK_SCHOOLS: School[] = [
  {
    id: "SCH-001",
    name: "Colegio MeCard Norte",
    city: "Monterrey",
    status: "ACTIVE",
  },
  {
    id: "SCH-002",
    name: "Instituto Central",
    city: "CDMX",
    status: "ACTIVE",
  },
  {
    id: "SCH-003",
    name: "Campus del Valle",
    city: "Guadalajara",
    status: "INACTIVE",
  },
];

/**
 * MAIN VIEW
 * ============================
 */
export default function Schools() {
  const [schools] = useState<School[]>(MOCK_SCHOOLS);
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const [showBusinessConfig, setShowBusinessConfig] = useState(false);

  /**
   * SAVE HANDLER
   * ============================
   * Aquí después conectas API real
   */
  const handleSaveBusinessModel = (model: any) => {
    console.log("💾 Guardando modelo de negocio:", {
      schoolId: selectedSchool?.id,
      model,
    });

    // 🔜 API CALL
    // await api.saveBusinessModel(selectedSchool.id, model)

    setShowBusinessConfig(false);
  };

  return (
    <div className="h-full p-12 bg-[#f8fafc]">
      {/* HEADER */}
      <header className="flex justify-between items-center mb-12">
        <div>
          <p className="text-indigo-600 font-black uppercase text-[10px] tracking-[6px] mb-4">
            MeCard Admin
          </p>
          <h1 className="text-5xl font-black tracking-tight text-slate-800 flex items-center gap-4">
            <Building2 size={48} className="text-indigo-600" />
            Schools
          </h1>
          <p className="text-slate-400 text-sm mt-2">
            Gestión de campus y configuración financiera
          </p>
        </div>

        <Button className="px-8 py-6 rounded-[28px] font-black uppercase tracking-[4px] text-xs">
          <Plus className="mr-2" /> Nueva Escuela
        </Button>
      </header>

      {/* CONTENT */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-12">
        {/* LISTADO DE ESCUELAS */}
        <div className="bg-white rounded-[48px] p-10 border border-slate-100 shadow-sm space-y-6">
          <h2 className="text-2xl font-black text-slate-800 mb-6">
            Campus Registrados
          </h2>

          {schools.map((school) => (
            <div
              key={school.id}
              className={`p-6 rounded-3xl border cursor-pointer transition-all ${
                selectedSchool?.id === school.id
                  ? "border-indigo-600 bg-indigo-50/50"
                  : "border-slate-100 hover:border-indigo-200"
              }`}
              onClick={() => setSelectedSchool(school)}
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-black text-slate-800">
                    {school.name}
                  </p>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">
                    {school.city}
                  </p>
                </div>
                <span
                  className={`text-[10px] font-black uppercase tracking-widest px-3 py-2 rounded-full ${
                    school.status === "ACTIVE"
                      ? "bg-emerald-100 text-emerald-600"
                      : "bg-slate-200 text-slate-500"
                  }`}
                >
                  {school.status}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* PANEL DE DETALLE */}
        <div className="xl:col-span-2">
          {!selectedSchool && (
            <div className="h-full bg-white rounded-[48px] border border-slate-100 flex items-center justify-center text-slate-400 font-black text-lg">
              Selecciona una escuela para administrar
            </div>
          )}

          {selectedSchool && !showBusinessConfig && (
            <div className="bg-white rounded-[48px] p-12 border border-slate-100 shadow-sm space-y-8">
              <div>
                <h2 className="text-3xl font-black text-slate-800">
                  {selectedSchool.name}
                </h2>
                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mt-2">
                  ID: {selectedSchool.id}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Button
                  onClick={() => setShowBusinessConfig(true)}
                  className="rounded-[32px] py-8 font-black uppercase tracking-[4px]"
                >
                  <Settings className="mr-3" />
                  Configurar Modelo de Negocio
                </Button>

                <Button
                  variant="secondary"
                  className="rounded-[32px] py-8 font-black uppercase tracking-[4px]"
                >
                  Ver Reportes
                </Button>
              </div>
            </div>
          )}

          {/* CONFIGURACIÓN FINANCIERA */}
          {selectedSchool && showBusinessConfig && (
            <BusinessModelConfiguration
              schoolId={selectedSchool.id}
              schoolName={selectedSchool.name}
              onSave={handleSaveBusinessModel}
              onCancel={() => setShowBusinessConfig(false)}
            />
          )}
        </div>
      </div>
    </div>
  );
}
