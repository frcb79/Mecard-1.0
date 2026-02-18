import React, { useState } from 'react';
import { Sliders, Save, AlertCircle } from 'lucide-react';
import { Button } from './Button';
import { useToast } from './ui/Toast';

export default function ParentLimitsView() {
  const toast = useToast();
  const [dailyLimit, setDailyLimit] = useState(500);
  const [lowBalanceAlert, setLowBalanceAlert] = useState(true);
  const [alertThreshold, setAlertThreshold] = useState(50);
  const [spendAlert, setSpendAlert] = useState(true);
  const [spendThreshold, setSpendThreshold] = useState(200);

  const handleSave = () => {
    toast.success('Guardado', 'Límites guardados correctamente');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-sky-50 pb-40">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 sticky top-0 z-30 shadow-sm">
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="p-3 md:p-4 bg-gradient-to-br from-emerald-50 to-sky-50 rounded-lg md:rounded-2xl">
              <Sliders size={24} className="text-emerald-600" />
            </div>
            <div>
              <h1 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tighter">Límites de Presupuesto</h1>
              <p className="text-slate-400 text-[10px] md:text-xs font-bold uppercase tracking-widest mt-1">Control parental y alertas</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6 md:space-y-8">
        
        {/* Límite Diario */}
        <div className="parent-card space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 font-black">₱</div>
            <h2 className="text-xl md:text-2xl font-black text-slate-900">Límite Diario</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label htmlFor="daily-limit-range" className="block text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Cantidad máxima diaria: $<span className="text-emerald-600 text-lg">{dailyLimit}</span></label>
              <input
                id="daily-limit-range"
                type="range"
                min="100"
                max="2000"
                step="50"
                value={dailyLimit}
                onChange={(e) => setDailyLimit(Number(e.target.value))}
                className="w-full h-2 bg-slate-100 rounded-full appearance-none cursor-pointer accent-emerald-600"
              />
              <div className="flex justify-between text-[9px] text-slate-400 mt-2 font-bold">
                <span>$100</span>
                <span>$2,000</span>
              </div>
            </div>
            <p className="text-[10px] md:text-xs text-slate-500 italic">El estudiante no podrá gastar más de esta cantidad en un día.</p>
          </div>
        </div>

        {/* Alertas de Saldo Bajo */}
        <div className="parent-card space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-rose-50 flex items-center justify-center text-rose-600 font-black">!</div>
              <h2 className="text-xl md:text-2xl font-black text-slate-900">Alerta de Saldo Bajo</h2>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={lowBalanceAlert}
                onChange={(e) => setLowBalanceAlert(e.target.checked)}
                className="sr-only peer"
                role="switch"
                aria-checked={lowBalanceAlert}
                aria-label="Activar alerta de saldo bajo"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>
          {lowBalanceAlert && (
            <div className="space-y-4">
              <div>
                <label htmlFor="alert-threshold-range" className="block text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Alertar cuando el saldo sea menor a: $<span className="text-rose-600 text-lg">{alertThreshold}</span></label>
                <input
                  id="alert-threshold-range"
                  type="range"
                  min="10"
                  max="500"
                  step="10"
                  value={alertThreshold}
                  onChange={(e) => setAlertThreshold(Number(e.target.value))}
                  className="w-full h-2 bg-slate-100 rounded-full appearance-none cursor-pointer accent-rose-600"
                />
              </div>
            </div>
          )}
        </div>

        {/* Alertas de Gasto */}
        <div className="parent-card space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-sky-50 flex items-center justify-center text-sky-600 font-black">📊</div>
              <h2 className="text-xl md:text-2xl font-black text-slate-900">Alerta de Gasto</h2>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={spendAlert}
                onChange={(e) => setSpendAlert(e.target.checked)}
                className="sr-only peer"
                role="switch"
                aria-checked={spendAlert}
                aria-label="Activar alerta de gasto"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>
          {spendAlert && (
            <div className="space-y-4">
              <div>
                <label htmlFor="spend-threshold-range" className="block text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Alertar cuando el gasto diario sea mayor a: $<span className="text-sky-600 text-lg">{spendThreshold}</span></label>
                <input
                  id="spend-threshold-range"
                  type="range"
                  min="50"
                  max="1000"
                  step="50"
                  value={spendThreshold}
                  onChange={(e) => setSpendThreshold(Number(e.target.value))}
                  className="w-full h-2 bg-slate-100 rounded-full appearance-none cursor-pointer accent-sky-600"
                />
              </div>
              <p className="text-[10px] md:text-xs text-slate-500 italic">Recibirás una notificación cuando se alcance este límite.</p>
            </div>
          )}
        </div>

        {/* Info Box */}
        <div className="parent-alert parent-alert--warning flex items-start gap-3">
          <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-sm mb-1">Tip: Control Parental Efectivo</p>
            <p className="text-xs opacity-80">Los límites se aplican en tiempo real. Tu hijo recibirá notificaciones cuando se acerque a los límites establecidos.</p>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex gap-3">
          <button className="flex-1 py-4 rounded-lg bg-slate-100 text-slate-600 font-black uppercase text-xs tracking-widest hover:bg-slate-200 transition-all">Cancelar</button>
          <Button 
            onClick={handleSave}
            className="flex-1 py-4 rounded-lg bg-gradient-to-r from-emerald-600 to-sky-600 text-white font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-emerald-200/50"
          >
            <Save size={18} /> Guardar Límites
          </Button>
        </div>
      </div>
    </div>
  );
}
