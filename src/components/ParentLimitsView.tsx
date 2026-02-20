/**
 * ParentLimitsView — Control Parental por Hijo
 * ─────────────────────────────────────────────
 * Permite configurar POR CADA HIJO:
 *  • Límite diario de gasto (diferente por día de la semana)
 *  • Categorías permitidas / bloqueadas (por día)
 *  • Productos específicos bloqueados
 *  • Alertas de saldo bajo y gasto
 */

import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sliders, Save, AlertCircle, ChevronRight, User,
  Ban, ShieldCheck, DollarSign,
  Utensils, Coffee, ShoppingBag, BookOpen, Laptop, Shirt
} from 'lucide-react';
import { Button } from './Button';
import { useToast } from './ui/Toast';
import { MOCK_STUDENTS_LIST, PRODUCTS } from '../constants';
import { Category } from '../types';

// ─── Types ───────────────────────────────────────

type DayKey = 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN';

const DAYS: { key: DayKey; label: string; short: string }[] = [
  { key: 'MON', label: 'Lunes', short: 'Lun' },
  { key: 'TUE', label: 'Martes', short: 'Mar' },
  { key: 'WED', label: 'Miércoles', short: 'Mié' },
  { key: 'THU', label: 'Jueves', short: 'Jue' },
  { key: 'FRI', label: 'Viernes', short: 'Vie' },
  { key: 'SAT', label: 'Sábado', short: 'Sáb' },
  { key: 'SUN', label: 'Domingo', short: 'Dom' },
];

const WEEKDAYS: DayKey[] = ['MON', 'TUE', 'WED', 'THU', 'FRI'];

const CATEGORY_META: Record<Category, { label: string; icon: React.ReactNode; color: string }> = {
  [Category.HOT_MEALS]: { label: 'Comidas', icon: <Utensils size={16} />, color: 'bg-orange-50 text-orange-600 border-orange-200' },
  [Category.COMBO_MEALS]: { label: 'Combos', icon: <Utensils size={16} />, color: 'bg-amber-50 text-amber-600 border-amber-200' },
  [Category.SNACKS]: { label: 'Snacks', icon: <Coffee size={16} />, color: 'bg-pink-50 text-pink-600 border-pink-200' },
  [Category.DRINKS]: { label: 'Bebidas', icon: <Coffee size={16} />, color: 'bg-sky-50 text-sky-600 border-sky-200' },
  [Category.SUPPLIES]: { label: 'Papelería', icon: <ShoppingBag size={16} />, color: 'bg-indigo-50 text-indigo-600 border-indigo-200' },
  [Category.UNIFORMS]: { label: 'Uniformes', icon: <Shirt size={16} />, color: 'bg-violet-50 text-violet-600 border-violet-200' },
  [Category.BOOKS]: { label: 'Libros', icon: <BookOpen size={16} />, color: 'bg-emerald-50 text-emerald-600 border-emerald-200' },
  [Category.TECH]: { label: 'Tecnología', icon: <Laptop size={16} />, color: 'bg-slate-100 text-slate-600 border-slate-200' },
};

interface DayConfig {
  limit: number;
  blockedCategories: Category[];
  freeDay: boolean;
}

interface ChildLimits {
  studentId: string;
  days: Record<DayKey, DayConfig>;
  blockedProducts: string[];
  lowBalanceAlert: boolean;
  lowBalanceThreshold: number;
  spendAlert: boolean;
  spendAlertThreshold: number;
}

function defaultDayConfig(): DayConfig {
  return { limit: 100, blockedCategories: [], freeDay: false };
}

function buildDefaultLimits(studentId: string): ChildLimits {
  const days = {} as Record<DayKey, DayConfig>;
  DAYS.forEach(d => { days[d.key] = defaultDayConfig(); });
  return {
    studentId,
    days,
    blockedProducts: [],
    lowBalanceAlert: true,
    lowBalanceThreshold: 50,
    spendAlert: true,
    spendAlertThreshold: 200,
  };
}

// ─── Component ───────────────────────────────────

export default function ParentLimitsView() {
  const navigate = useNavigate();
  const toast = useToast();

  const students = MOCK_STUDENTS_LIST.slice(0, 2);

  const [limitsMap, setLimitsMap] = useState<Record<string, ChildLimits>>(() => {
    const m: Record<string, ChildLimits> = {};
    students.forEach(s => { m[s.id] = buildDefaultLimits(s.id); });
    return m;
  });

  const [activeChildId, setActiveChildId] = useState(students[0]?.id || '');
  const [activeDay, setActiveDay] = useState<DayKey | 'ALL'>('ALL');

  const limits = limitsMap[activeChildId];
  const activeStudent = students.find(s => s.id === activeChildId);

  const updateLimits = (patch: Partial<ChildLimits>) => {
    setLimitsMap(prev => ({
      ...prev,
      [activeChildId]: { ...prev[activeChildId], ...patch },
    }));
  };

  const updateDay = (day: DayKey, patch: Partial<DayConfig>) => {
    setLimitsMap(prev => {
      const child = { ...prev[activeChildId] };
      child.days = { ...child.days, [day]: { ...child.days[day], ...patch } };
      return { ...prev, [activeChildId]: child };
    });
  };

  const updateMultipleDays = (days: DayKey[], patch: Partial<DayConfig>) => {
    setLimitsMap(prev => {
      const child = { ...prev[activeChildId] };
      const newDays = { ...child.days };
      days.forEach(d => { newDays[d] = { ...newDays[d], ...patch }; });
      child.days = newDays;
      return { ...prev, [activeChildId]: child };
    });
  };

  const toggleCategoryForDay = (day: DayKey, cat: Category) => {
    const current = limits.days[day].blockedCategories;
    const next = current.includes(cat)
      ? current.filter(c => c !== cat)
      : [...current, cat];
    updateDay(day, { blockedCategories: next });
  };

  const toggleCategoryForAllDays = (cat: Category) => {
    const allBlocked = WEEKDAYS.every(d => limits.days[d].blockedCategories.includes(cat));
    setLimitsMap(prev => {
      const child = { ...prev[activeChildId] };
      const newDays = { ...child.days };
      WEEKDAYS.forEach(d => {
        const blocked = newDays[d].blockedCategories;
        newDays[d] = {
          ...newDays[d],
          blockedCategories: allBlocked
            ? blocked.filter(c => c !== cat)
            : blocked.includes(cat) ? blocked : [...blocked, cat],
        };
      });
      child.days = newDays;
      return { ...prev, [activeChildId]: child };
    });
  };

  const toggleProductBlock = (productId: string) => {
    const current = limits.blockedProducts;
    const next = current.includes(productId)
      ? current.filter(id => id !== productId)
      : [...current, productId];
    updateLimits({ blockedProducts: next });
  };

  const handleSave = () => {
    toast.success('Guardado', `Configuración de ${studentName} guardada correctamente`);
  };

  const foodProducts = useMemo(() => {
    const foodCats = [Category.HOT_MEALS, Category.COMBO_MEALS, Category.SNACKS, Category.DRINKS];
    return PRODUCTS.filter(p => foodCats.includes(p.category));
  }, []);

  if (!limits || !activeStudent) return null;

  const studentName = (activeStudent as any).name || activeStudent.fullName || 'Estudiante';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-sky-50 pb-40">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 sticky top-0 z-30 shadow-sm">
        <div className="p-4 md:p-6 max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-emerald-50 to-sky-50 rounded-2xl">
              <Sliders size={24} className="text-emerald-600" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tighter">Control Parental</h1>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-0.5">Límites, categorías y alertas por hijo</p>
            </div>
          </div>

          {/* Child Selector */}
          <div className="flex gap-3 overflow-x-auto pb-1">
            {students.map(s => {
              const sName = (s as any).name || s.fullName;
              const isActive = s.id === activeChildId;
              return (
                <button
                  key={s.id}
                  onClick={() => { setActiveChildId(s.id); setActiveDay('ALL'); }}
                  className={`flex items-center gap-3 px-5 py-3 rounded-2xl border-2 transition-all whitespace-nowrap ${
                    isActive
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-700 shadow-md'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                  }`}
                >
                  {s.photo ? (
                    <img src={s.photo} alt={sName} className="w-8 h-8 rounded-full object-cover border-2 border-white" />
                  ) : (
                    <User size={18} />
                  )}
                  <span className="font-black text-sm">{sName}</span>
                  {isActive && <ChevronRight size={16} />}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-8">

        {/* SECTION 1: Spending Limits Per Day */}
        <div className="parent-card space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
              <DollarSign size={20} />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900">Límites de Gasto por Día</h2>
              <p className="text-xs text-slate-400">Define cuánto puede gastar <span className="font-bold text-emerald-600">{studentName}</span> cada día</p>
            </div>
          </div>

          {/* Quick apply */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <p className="text-xs font-bold text-emerald-800 flex-1">📌 Aplicar un mismo límite Lun–Vie:</p>
            <div className="flex items-center gap-2">
              <span className="text-sm font-black text-emerald-700">$</span>
              <input
                type="number"
                min={0}
                max={5000}
                step={10}
                className="w-24 p-2 bg-white border border-emerald-300 rounded-lg text-sm font-black text-center focus:ring-2 focus:ring-emerald-400 outline-none"
                placeholder="100"
                onBlur={(e) => {
                  const v = Number(e.target.value);
                  if (v > 0) updateMultipleDays(WEEKDAYS, { limit: v });
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const v = Number((e.target as HTMLInputElement).value);
                    if (v > 0) updateMultipleDays(WEEKDAYS, { limit: v });
                  }
                }}
              />
            </div>
          </div>

          {/* Per-day grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-7 gap-3">
            {DAYS.map(d => {
              const dc = limits.days[d.key];
              const isWeekend = d.key === 'SAT' || d.key === 'SUN';
              return (
                <div
                  key={d.key}
                  className={`rounded-2xl border-2 p-4 text-center transition-all ${
                    isWeekend ? 'bg-slate-50 border-slate-200' : 'bg-white border-emerald-100'
                  }`}
                >
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">{d.short}</p>
                  <div className="relative">
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">$</span>
                    <input
                      type="number"
                      min={0}
                      max={5000}
                      step={10}
                      value={dc.limit}
                      onChange={(e) => updateDay(d.key, { limit: Number(e.target.value) })}
                      className="w-full p-2 pl-5 bg-slate-50 border border-slate-200 rounded-lg text-center font-black text-lg text-slate-800 outline-none focus:ring-2 focus:ring-emerald-400"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* SECTION 2: Categories Per Day */}
        <div className="parent-card space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-rose-50 flex items-center justify-center text-rose-600">
              <Ban size={20} />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900">Categorías Permitidas y Bloqueadas</h2>
              <p className="text-xs text-slate-400">Selecciona un día o "Todos" para bloquear categorías. 🔴 = Bloqueado</p>
            </div>
          </div>

          {/* Day selector tabs */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setActiveDay('ALL')}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${
                activeDay === 'ALL' ? 'bg-emerald-600 text-white shadow' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
              }`}
            >
              Todos (L–V)
            </button>
            {DAYS.map(d => (
              <button
                key={d.key}
                onClick={() => setActiveDay(d.key)}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${
                  activeDay === d.key ? 'bg-emerald-600 text-white shadow' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                }`}
              >
                {d.short}
              </button>
            ))}
          </div>

          {/* Free day toggle */}
          {activeDay !== 'ALL' && (
            <div className="flex items-center justify-between p-4 bg-indigo-50 border border-indigo-200 rounded-xl">
              <div>
                <p className="font-black text-slate-900 text-sm">🎉 Día libre (sin restricciones de categoría)</p>
                <p className="text-xs text-slate-500 mt-0.5">Todas las categorías estarán permitidas este día</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={limits.days[activeDay as DayKey].freeDay}
                  onChange={(e) => updateDay(activeDay as DayKey, { freeDay: e.target.checked, blockedCategories: e.target.checked ? [] : limits.days[activeDay as DayKey].blockedCategories })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>
          )}

          {/* Category grid */}
          {(activeDay === 'ALL' || !limits.days[activeDay as DayKey]?.freeDay) && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {Object.entries(CATEGORY_META).map(([catKey, meta]) => {
                const cat = catKey as Category;
                let isBlocked: boolean;
                if (activeDay === 'ALL') {
                  isBlocked = WEEKDAYS.every(d => limits.days[d].blockedCategories.includes(cat));
                } else {
                  isBlocked = limits.days[activeDay as DayKey].blockedCategories.includes(cat);
                }

                return (
                  <button
                    key={cat}
                    onClick={() => {
                      if (activeDay === 'ALL') toggleCategoryForAllDays(cat);
                      else toggleCategoryForDay(activeDay as DayKey, cat);
                    }}
                    className={`p-4 rounded-xl border-2 transition-all text-left group ${
                      isBlocked
                        ? 'bg-rose-50 border-rose-300 ring-2 ring-rose-200'
                        : `${meta.color} border hover:shadow-md`
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      {meta.icon}
                      <span className="text-sm font-black">{meta.label}</span>
                    </div>
                    <p className={`text-[10px] font-black uppercase tracking-widest ${isBlocked ? 'text-rose-600' : 'text-emerald-600'}`}>
                      {isBlocked ? '🔴 Bloqueado' : '🟢 Permitido'}
                    </p>
                  </button>
                );
              })}
            </div>
          )}

          {/* Visual summary table */}
          <div className="bg-slate-50 rounded-xl p-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Resumen semanal de categorías</p>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr>
                    <th className="text-left pr-4 py-1 font-bold text-slate-500">Categoría</th>
                    {DAYS.map(d => (
                      <th key={d.key} className="text-center px-1 py-1 font-bold text-slate-500 min-w-[36px]">{d.short}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(CATEGORY_META).map(([catKey, meta]) => {
                    const cat = catKey as Category;
                    return (
                      <tr key={cat} className="border-t border-slate-100">
                        <td className="pr-4 py-2 font-bold text-slate-700">{meta.label}</td>
                        {DAYS.map(d => {
                          const dc = limits.days[d.key];
                          const blocked = !dc.freeDay && dc.blockedCategories.includes(cat);
                          return (
                            <td key={d.key} className="text-center py-2">
                              <span className={`inline-block w-5 h-5 rounded-full text-[10px] leading-5 font-black ${
                                dc.freeDay ? 'bg-indigo-100 text-indigo-500' :
                                blocked ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'
                              }`}>
                                {dc.freeDay ? '★' : blocked ? '✕' : '✓'}
                              </span>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="flex gap-4 mt-3 text-[9px] font-bold text-slate-400">
              <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded-full bg-emerald-100"></span> Permitido</span>
              <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded-full bg-rose-100"></span> Bloqueado</span>
              <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded-full bg-indigo-100"></span> Día libre</span>
            </div>
          </div>
        </div>

        {/* SECTION 3: Blocked Products */}
        <div className="parent-card space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
              <ShoppingBag size={20} />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900">Productos Bloqueados</h2>
              <p className="text-xs text-slate-400">Bloquea productos específicos para <span className="font-bold text-amber-600">{studentName}</span>. Aplica todos los días.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {foodProducts.map(p => {
              const blocked = limits.blockedProducts.includes(p.id);
              return (
                <button
                  key={p.id}
                  onClick={() => toggleProductBlock(p.id)}
                  className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${
                    blocked
                      ? 'bg-rose-50 border-rose-300'
                      : 'bg-white border-slate-100 hover:border-slate-300'
                  }`}
                >
                  {p.image && <img src={p.image} alt={p.name} className="w-10 h-10 rounded-lg object-cover" />}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-800 truncate">{p.name}</p>
                    <p className="text-[10px] text-slate-400">${p.price.toFixed(2)}</p>
                  </div>
                  <span className={`text-[9px] font-black uppercase ${blocked ? 'text-rose-600' : 'text-emerald-600'}`}>
                    {blocked ? '🔴' : '🟢'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* SECTION 4: Alerts */}
        <div className="parent-card space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-sky-50 flex items-center justify-center text-sky-600">
              <AlertCircle size={20} />
            </div>
            <h2 className="text-xl font-black text-slate-900">Alertas para {studentName}</h2>
          </div>

          {/* Low balance */}
          <div className="flex items-center justify-between p-4 bg-rose-50 border border-rose-200 rounded-xl">
            <div>
              <p className="font-black text-slate-900 text-sm">Alerta de Saldo Bajo</p>
              <p className="text-xs text-slate-500 mt-0.5">Alertar cuando el saldo sea menor a: $<span className="font-black text-rose-600">{limits.lowBalanceThreshold}</span></p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={limits.lowBalanceAlert}
                onChange={(e) => updateLimits({ lowBalanceAlert: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>
          {limits.lowBalanceAlert && (
            <div className="px-4">
              <input
                type="range" min={10} max={500} step={10}
                value={limits.lowBalanceThreshold}
                onChange={(e) => updateLimits({ lowBalanceThreshold: Number(e.target.value) })}
                className="w-full h-2 bg-slate-100 rounded-full appearance-none cursor-pointer accent-rose-600"
              />
              <div className="flex justify-between text-[9px] text-slate-400 mt-1 font-bold"><span>$10</span><span>$500</span></div>
            </div>
          )}

          {/* Spend alert */}
          <div className="flex items-center justify-between p-4 bg-sky-50 border border-sky-200 rounded-xl">
            <div>
              <p className="font-black text-slate-900 text-sm">Alerta de Gasto Diario</p>
              <p className="text-xs text-slate-500 mt-0.5">Alertar si {studentName} supera: $<span className="font-black text-sky-600">{limits.spendAlertThreshold}</span> en un día</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={limits.spendAlert}
                onChange={(e) => updateLimits({ spendAlert: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>
          {limits.spendAlert && (
            <div className="px-4">
              <input
                type="range" min={50} max={1000} step={50}
                value={limits.spendAlertThreshold}
                onChange={(e) => updateLimits({ spendAlertThreshold: Number(e.target.value) })}
                className="w-full h-2 bg-slate-100 rounded-full appearance-none cursor-pointer accent-sky-600"
              />
              <div className="flex justify-between text-[9px] text-slate-400 mt-1 font-bold"><span>$50</span><span>$1,000</span></div>
            </div>
          )}
        </div>

        {/* Info Box */}
        <div className="parent-alert parent-alert--warning flex items-start gap-3">
          <ShieldCheck size={20} className="flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-sm mb-1">Control Individual por Hijo</p>
            <p className="text-xs opacity-80">Cada configuración aplica exclusivamente a <strong>{studentName}</strong>. Cambia de hijo en la parte superior para configurar límites distintos.</p>
          </div>
        </div>

        {/* Save */}
        <div className="flex gap-3">
          <button onClick={() => navigate('/parent')} className="flex-1 py-4 rounded-lg bg-slate-100 text-slate-600 font-black uppercase text-xs tracking-widest hover:bg-slate-200 transition-all">Cancelar</button>
          <Button
            onClick={handleSave}
            className="flex-1 py-4 rounded-lg bg-gradient-to-r from-emerald-600 to-sky-600 text-white font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-emerald-200/50"
          >
            <Save size={18} /> Guardar Configuración
          </Button>
        </div>
      </div>
    </div>
  );
}
