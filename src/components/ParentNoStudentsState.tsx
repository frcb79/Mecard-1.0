import React from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus } from 'lucide-react';

interface ParentNoStudentsStateProps {
  title: string;
  description: string;
  ctaLabel?: string;
}

export default function ParentNoStudentsState({
  title,
  description,
  ctaLabel = 'Vincular Estudiante',
}: ParentNoStudentsStateProps) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-8 flex items-center justify-center">
      <div className="w-full max-w-xl bg-white border border-slate-100 rounded-3xl p-8 md:p-10 text-center shadow-lg">
        <div className="w-20 h-20 rounded-3xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-6">
          <UserPlus size={34} />
        </div>
        <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900">{title}</h1>
        <p className="text-sm md:text-base text-slate-500 mt-3">{description}</p>
        <button
          onClick={() => navigate('/parent', { state: { openLinkModal: true } })}
          className="mt-8 w-full md:w-auto px-8 py-4 rounded-2xl bg-indigo-600 text-white text-xs font-black uppercase tracking-widest hover:bg-indigo-700 transition-colors"
        >
          {ctaLabel}
        </button>
      </div>
    </div>
  );
}
