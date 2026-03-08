import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Gift, AlertTriangle, Coffee, Candy, Apple, ShoppingBag,
  Calendar, User, Eye, EyeOff, Filter, ChevronDown, ChevronUp,
  Ban, CheckCircle2, Clock, Info
} from 'lucide-react';
import { useToast } from './ui/Toast';
import { useParentStudents } from '../hooks/useParentStudents';
import ParentNoStudentsState from './ParentNoStudentsState';

// ===== TYPES =====

type GiftStatus = 'aceptado' | 'pendiente' | 'rechazado' | 'canjeado';

interface ReceivedGift {
  id: string;
  childId: string;
  childName: string;
  senderName: string;
  senderGrade: string;
  productName: string;
  productCategory: string;
  productEmoji: string;
  productPrice: number;
  message: string;
  date: string;
  status: GiftStatus;
  isHealthConcern: boolean;    // flagged if conflicts with parent restrictions
  healthNote?: string;
}

// ===== MOCK DATA =====

const MOCK_GIFTS: ReceivedGift[] = [
  {
    id: 'gift-001',
    childId: '2024002',
    childName: 'Ana García',
    senderName: 'Sofía Martínez',
    senderGrade: '2° Primaria',
    productName: 'Galletas de Chocolate',
    productCategory: 'Snacks',
    productEmoji: '🍪',
    productPrice: 25.00,
    message: '¡Feliz día amiga! 🎉',
    date: '2026-02-19',
    status: 'pendiente',
    isHealthConcern: true,
    healthNote: 'Contiene azúcar — Ana tiene restricción de snacks los lunes',
  },
  {
    id: 'gift-002',
    childId: '2024002',
    childName: 'Ana García',
    senderName: 'Camila Hernández',
    senderGrade: '2° Primaria',
    productName: 'Jugo Natural de Naranja',
    productCategory: 'Drinks',
    productEmoji: '🍊',
    productPrice: 18.00,
    message: 'Para que tengas energía hoy ☀️',
    date: '2026-02-18',
    status: 'aceptado',
    isHealthConcern: false,
  },
  {
    id: 'gift-003',
    childId: '2024001',
    childName: 'Santiago González',
    senderName: 'Diego Ruiz',
    senderGrade: '4° Primaria',
    productName: 'Papas con Chile',
    productCategory: 'Snacks',
    productEmoji: '🌶️',
    productPrice: 20.00,
    message: '¡A compartir bro!',
    date: '2026-02-19',
    status: 'canjeado',
    isHealthConcern: false,
  },
  {
    id: 'gift-004',
    childId: '2024001',
    childName: 'Santiago González',
    senderName: 'Luis Torres',
    senderGrade: '4° Primaria',
    productName: 'Refresco de Cola',
    productCategory: 'Drinks',
    productEmoji: '🥤',
    productPrice: 15.00,
    message: '',
    date: '2026-02-17',
    status: 'aceptado',
    isHealthConcern: true,
    healthNote: 'Bebida azucarada — Santiago tiene límite de gasto diario de $50',
  },
  {
    id: 'gift-005',
    childId: '2024002',
    childName: 'Ana García',
    senderName: 'Valentina López',
    senderGrade: '2° Primaria',
    productName: 'Paleta de Hielo de Fresa',
    productCategory: 'Snacks',
    productEmoji: '🍓',
    productPrice: 12.00,
    message: '¡Te quiero amiga!',
    date: '2026-02-14',
    status: 'canjeado',
    isHealthConcern: false,
  },
];

// ===== COMPONENT =====

export default function ParentGiftsView() {
  const navigate = useNavigate();
  const toast = useToast();
  const { students: parentStudents, loading: studentsLoading } = useParentStudents();

  const children = parentStudents.map((student, idx) => ({
    id: student.id,
    name: (student as any).name || student.fullName || 'Estudiante',
    photo: student.photo ? '👤' : idx % 2 === 0 ? '👦' : '👧',
    grade: student.grade,
    schoolId: student.schoolId,
    points: Number((student as any)?.rewardsPoints?.availablePoints || (student as any)?.rewardsPoints?.points || 0),
  }));

  const [gifts, setGifts] = useState<ReceivedGift[]>(MOCK_GIFTS);
  const [selectedChild, setSelectedChild] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | GiftStatus>('all');
  const [showHealthOnly, setShowHealthOnly] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const statusConfig: Record<GiftStatus, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
    pendiente: { label: 'Pendiente', color: 'text-amber-600', bg: 'bg-amber-50', icon: <Clock size={12} /> },
    aceptado: { label: 'Aceptado', color: 'text-emerald-600', bg: 'bg-emerald-50', icon: <CheckCircle2 size={12} /> },
    rechazado: { label: 'Rechazado', color: 'text-red-500', bg: 'bg-red-50', icon: <Ban size={12} /> },
    canjeado: { label: 'Canjeado', color: 'text-blue-600', bg: 'bg-blue-50', icon: <ShoppingBag size={12} /> },
  };

  const filteredGifts = gifts.filter(g => {
    const matchesChild = selectedChild === 'all' || g.childId === selectedChild;
    const matchesStatus = filterStatus === 'all' || g.status === filterStatus;
    const matchesHealth = !showHealthOnly || g.isHealthConcern;
    return matchesChild && matchesStatus && matchesHealth;
  });

  const healthConcernCount = gifts.filter(g => g.isHealthConcern).length;
  const totalGiftValue = gifts.reduce((sum, g) => sum + g.productPrice, 0);
  const thisWeekGifts = gifts.filter(g => g.date >= '2026-02-17');

  const pooledPoints = children.reduce((sum, child) => sum + child.points, 0);
  const pooledStudentsCount = children.length;

  if (studentsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-pink-50 to-sky-50 p-4 md:p-8 flex items-center justify-center">
        <p className="text-slate-500 font-bold">Cargando estudiantes...</p>
      </div>
    );
  }

  if (children.length === 0) {
    return (
      <ParentNoStudentsState
        title="Regalos Recibidos"
        description="Vincula estudiantes para ver y filtrar los regalos que reciben en la escuela."
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-pink-50 to-sky-50 pb-40">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 sticky top-0 z-30 shadow-sm">
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
          <div className="flex items-center gap-3 md:gap-4 mb-4">
            <div className="p-3 md:p-4 bg-gradient-to-br from-pink-50 to-purple-50 rounded-lg md:rounded-2xl">
              <Gift size={24} className="text-pink-600" />
            </div>
            <div>
              <h1 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tighter">Regalos Recibidos</h1>
              <p className="text-slate-400 text-[10px] md:text-xs font-bold uppercase tracking-widest mt-1">Productos que le han regalado a tus hijos</p>
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Child filter */}
            <select
              value={selectedChild}
              onChange={(e) => setSelectedChild(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg font-bold text-sm text-slate-700 focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all"
            >
              <option value="all">Todos los hijos</option>
              {children.map(c => (
                <option key={c.id} value={c.id}>{c.photo} {c.name}</option>
              ))}
            </select>

            {/* Status filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg font-bold text-sm text-slate-700 focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all"
            >
              <option value="all">Todos los estados</option>
              <option value="pendiente">Pendientes</option>
              <option value="aceptado">Aceptados</option>
              <option value="canjeado">Canjeados</option>
              <option value="rechazado">Rechazados</option>
            </select>

            {/* Health concerns toggle */}
            <button
              onClick={() => setShowHealthOnly(!showHealthOnly)}
              className={`p-3 rounded-lg font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                showHealthOnly
                  ? 'bg-red-600 text-white shadow-md'
                  : 'bg-white text-slate-500 border border-slate-200 hover:bg-red-50'
              }`}
            >
              <AlertTriangle size={16} /> Solo Alertas ({healthConcernCount})
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="parent-card parent-card--featured">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Total Regalos</p>
            <p className="text-2xl md:text-3xl font-black text-pink-600">{gifts.length}</p>
          </div>
          <div className="parent-card parent-card--featured">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Esta Semana</p>
            <p className="text-2xl md:text-3xl font-black text-purple-600">{thisWeekGifts.length}</p>
          </div>
          <div className="parent-card parent-card--featured">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Valor Total</p>
            <p className="text-2xl md:text-3xl font-black text-emerald-600">${totalGiftValue.toFixed(0)}</p>
          </div>
          <div className="parent-card parent-card--featured">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Alertas Salud</p>
            <p className={`text-2xl md:text-3xl font-black ${healthConcernCount > 0 ? 'text-red-500' : 'text-slate-300'}`}>{healthConcernCount}</p>
          </div>
        </div>

        {/* Shared points helper */}
        <div className="parent-card border border-indigo-100 bg-indigo-50/50">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <p className="text-sm font-black text-slate-900">Bolsa de Puntos para Regalos y Rewards</p>
              <p className="text-xs text-slate-500 mt-1">
                {`Puntos familiares disponibles: ${pooledPoints} pts (${pooledStudentsCount} alumno(s)).`}
                {' '}Operacion unificada con el mismo valor de puntos para todos los colegios.
              </p>
            </div>
            <button
              onClick={() => navigate('/parent/rewards', { state: { openPointsTopUp: true } })}
              className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-black uppercase tracking-widest hover:bg-indigo-700 transition-colors"
            >
              Comprar con Puntos
            </button>
          </div>
        </div>

        {/* Health alert */}
        {healthConcernCount > 0 && (
          <div className="parent-alert parent-alert--warning flex items-start gap-3">
            <AlertTriangle size={18} className="text-amber-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-black text-sm text-slate-800">Alerta de alimentación</p>
              <p className="text-xs text-slate-500 mt-1">
                {healthConcernCount} regalo(s) podrían entrar en conflicto con las restricciones alimenticias que configuraste para tus hijos.
                Revisa los regalos marcados con ⚠️ para más detalles.
              </p>
            </div>
          </div>
        )}

        {/* Gifts List */}
        {filteredGifts.length === 0 ? (
          <div className="parent-card text-center py-12">
            <Gift size={48} className="mx-auto text-slate-300 mb-4" />
            <p className="font-black text-slate-400 text-lg">No hay regalos que mostrar</p>
            <p className="text-xs text-slate-400 mt-2">Cuando tus hijos reciban regalos de sus compañeros, aparecerán aquí.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredGifts.map(gift => {
              const sConf = statusConfig[gift.status];
              const isExpanded = expandedId === gift.id;

              return (
                <div
                  key={gift.id}
                  className={`parent-card transition-all cursor-pointer ${
                    gift.isHealthConcern ? 'border-l-4 border-l-amber-400' : ''
                  }`}
                  onClick={() => setExpandedId(isExpanded ? null : gift.id)}
                >
                  <div className="flex items-center gap-3">
                    {/* Product emoji */}
                    <div className="w-12 h-12 rounded-xl bg-pink-50 flex items-center justify-center text-2xl flex-shrink-0">
                      {gift.productEmoji}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-black text-slate-800 text-sm">{gift.productName}</p>
                        {gift.isHealthConcern && (
                          <span className="text-[10px] font-black text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                            <AlertTriangle size={10} /> Alerta
                          </span>
                        )}
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-black ${sConf.color} ${sConf.bg}`}>
                          {sConf.icon} {sConf.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="text-[10px] font-bold text-slate-400">
                          Para: <span className="text-slate-600">{gift.childName}</span>
                        </span>
                        <span className="text-[10px] text-slate-300">•</span>
                        <span className="text-[10px] font-bold text-slate-400">
                          De: <span className="text-slate-600">{gift.senderName}</span> ({gift.senderGrade})
                        </span>
                        <span className="text-[10px] text-slate-300">•</span>
                        <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                          <Calendar size={10} /> {gift.date}
                        </span>
                      </div>
                    </div>

                    {/* Price & expand */}
                    <div className="text-right flex-shrink-0 flex items-center gap-2">
                      <span className="font-black text-slate-800 text-sm">${gift.productPrice.toFixed(2)}</span>
                      <span className="text-slate-400">
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </span>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="mt-3 pt-3 border-t border-slate-100 space-y-3">
                      {gift.message && (
                        <div className="bg-pink-50 p-3 rounded-lg">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Mensaje</p>
                          <p className="text-sm text-slate-700">💬 {gift.message}</p>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-slate-50 p-3 rounded-lg">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Categoría</p>
                          <p className="text-sm font-bold text-slate-700">{gift.productCategory}</p>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-lg">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Valor</p>
                          <p className="text-sm font-bold text-slate-700">${gift.productPrice.toFixed(2)}</p>
                        </div>
                      </div>

                      {gift.isHealthConcern && gift.healthNote && (
                        <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg flex items-start gap-2">
                          <AlertTriangle size={14} className="text-amber-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-xs font-black text-amber-700">Advertencia Alimentaria</p>
                            <p className="text-xs text-amber-600 mt-0.5">{gift.healthNote}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Info box */}
        <div className="parent-card bg-gradient-to-br from-pink-50 to-purple-50 border border-pink-100 space-y-2">
          <div className="flex items-center gap-2">
            <Info size={16} className="text-pink-500" />
            <p className="font-black text-slate-800 text-sm">¿Cómo funcionan los regalos?</p>
          </div>
          <ul className="text-xs text-slate-600 space-y-1 list-disc list-inside">
            <li>Los compañeros pueden regalar productos de la cafetería a tus hijos</li>
            <li>El costo se cobra del saldo del compañero que envía el regalo</li>
            <li>Tu hijo recibe un código para canjear el producto en el POS</li>
            <li>Si un regalo entra en <strong>conflicto con las restricciones</strong> que configuraste, verás una alerta ⚠️</li>
            <li>Puedes revisar tus restricciones en la sección de <strong>Límites</strong></li>
          </ul>
        </div>
      </div>
    </div>
  );
}
