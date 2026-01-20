// ============================================
// ARCHIVO 7: pages/Unauthorized.tsx
// ============================================

import { useNavigate } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';

export default function Unauthorized() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <div className="w-24 h-24 bg-rose-50 rounded-[32px] flex items-center justify-center text-rose-500 mx-auto mb-8">
          <ShieldAlert size={48} />
        </div>
        <h1 className="text-4xl font-black text-slate-800 mb-4 italic">
          Acceso Denegado
        </h1>
        <p className="text-slate-600 font-medium mb-8">
          No tienes permisos para acceder a esta sección.
        </p>
        <button
          onClick={() => navigate('/')}
          className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-indigo-700 transition-all"
        >
          Volver al Inicio
        </button>
      </div>
    </div>
  );
}
