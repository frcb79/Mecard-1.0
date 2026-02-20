import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Mail, Smartphone, Clock, Save } from 'lucide-react';
import { Button } from './Button';
import { useToast } from './ui/Toast';

export default function ParentNotificationsView() {
  const navigate = useNavigate();
  const toast = useToast();
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [pushEnabled, setPushEnabled] = useState(true);
  const [smsEnabled, setSmsEnabled] = useState(false);
  
  const [alertOnPurchase, setAlertOnPurchase] = useState(true);
  const [alertOnLowBalance, setAlertOnLowBalance] = useState(true);
  const [alertOnThreshold, setAlertOnThreshold] = useState(true);
  
  const [quietHours, setQuietHours] = useState(true);
  const [quietStart, setQuietStart] = useState('22:00');
  const [quietEnd, setQuietEnd] = useState('08:00');
  
  const [dailySummary, setDailySummary] = useState(true);
  const [weeklySummary, setWeeklySummary] = useState(false);

  const handleSave = () => {
    toast.success('Actualizado', 'Preferencias de notificaciones actualizadas');
  };

  const ToggleSwitch = ({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) => (
    <label className="relative inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only peer"
      />
      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
    </label>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-sky-50 pb-40">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 sticky top-0 z-30 shadow-sm">
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="p-3 md:p-4 bg-gradient-to-br from-emerald-50 to-sky-50 rounded-lg md:rounded-2xl">
              <Bell size={24} className="text-emerald-600" />
            </div>
            <div>
              <h1 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tighter">Configurar Notificaciones</h1>
              <p className="text-slate-400 text-[10px] md:text-xs font-bold uppercase tracking-widest mt-1">Controla cómo recibes alertas</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6 md:space-y-8">
        
        {/* CANALES */}
        <div className="parent-card space-y-6">
          <h2 className="text-xl md:text-2xl font-black text-slate-900 flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-sky-100 flex items-center justify-center text-sky-600 font-black text-sm">📡</div>
            Canales de Notificación
          </h2>
          
          <div className="space-y-4 md:space-y-6">
            {/* Email */}
            <div className="flex items-center justify-between p-4 md:p-6 bg-slate-50 rounded-xl hover:bg-slate-100 transition-all">
              <div className="flex items-center gap-4 flex-1">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                  <Mail size={20} />
                </div>
                <div>
                  <p className="font-black text-slate-900">Notificaciones por Email</p>
                  <p className="text-xs text-slate-500">Recibe alertas a tu correo electrónico</p>
                </div>
              </div>
              <ToggleSwitch checked={emailEnabled} onChange={setEmailEnabled} />
            </div>

            {/* Push */}
            <div className="flex items-center justify-between p-4 md:p-6 bg-slate-50 rounded-xl hover:bg-slate-100 transition-all">
              <div className="flex items-center gap-4 flex-1">
                <div className="w-10 h-10 rounded-lg bg-sky-100 flex items-center justify-center text-sky-600">
                  <Bell size={20} />
                </div>
                <div>
                  <p className="font-black text-slate-900">Notificaciones Push</p>
                  <p className="text-xs text-slate-500">Alertas instantáneas en tu dispositivo</p>
                </div>
              </div>
              <ToggleSwitch checked={pushEnabled} onChange={setPushEnabled} />
            </div>

            {/* SMS */}
            <div className="flex items-center justify-between p-4 md:p-6 bg-slate-50 rounded-xl hover:bg-slate-100 transition-all">
              <div className="flex items-center gap-4 flex-1">
                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center text-green-600">
                  <Smartphone size={20} />
                </div>
                <div>
                  <p className="font-black text-slate-900">Notificaciones por SMS</p>
                  <p className="text-xs text-slate-500">Mensajes de texto a tu celular</p>
                </div>
              </div>
              <ToggleSwitch checked={smsEnabled} onChange={setSmsEnabled} />
            </div>
          </div>
        </div>

        {/* TIPOS DE ALERTAS */}
        <div className="parent-card space-y-6">
          <h2 className="text-xl md:text-2xl font-black text-slate-900 flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-emerald-100 flex items-center justify-center text-emerald-600 font-black text-sm">⚡</div>
            Tipos de Alertas
          </h2>

          <div className="space-y-4">
            {/* Alerta por Compra */}
            <div className="flex items-center justify-between p-4 md:p-6 bg-emerald-50 border border-emerald-100 rounded-xl">
              <div>
                <p className="font-black text-slate-900">Alertar en cada compra</p>
                <p className="text-xs text-slate-600 mt-1">Notificación cada vez que tu hijo haga una compra</p>
              </div>
              <ToggleSwitch checked={alertOnPurchase} onChange={setAlertOnPurchase} />
            </div>

            {/* Alerta Saldo Bajo */}
            <div className="flex items-center justify-between p-4 md:p-6 bg-rose-50 border border-rose-100 rounded-xl">
              <div>
                <p className="font-black text-slate-900">Saldo bajo</p>
                <p className="text-xs text-slate-600 mt-1">Aviso cuando el balance sea menor al límite configurado</p>
              </div>
              <ToggleSwitch checked={alertOnLowBalance} onChange={setAlertOnLowBalance} />
            </div>

            {/* Alerta Threshold */}
            <div className="flex items-center justify-between p-4 md:p-6 bg-sky-50 border border-sky-100 rounded-xl">
              <div>
                <p className="font-black text-slate-900">Supera límite de gasto</p>
                <p className="text-xs text-slate-600 mt-1">Notificación si gasta más del límite diario configurado</p>
              </div>
              <ToggleSwitch checked={alertOnThreshold} onChange={setAlertOnThreshold} />
            </div>
          </div>
        </div>

        {/* HORARIO SILENCIOSO */}
        <div className="parent-card space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl md:text-2xl font-black text-slate-900 flex items-center gap-3">
              <div className="w-8 h-8 rounded bg-amber-100 flex items-center justify-center text-amber-600 font-black text-sm">🔕</div>
              Horario Silencioso
            </h2>
            <ToggleSwitch checked={quietHours} onChange={setQuietHours} />
          </div>

          {quietHours && (
            <div className="space-y-4 p-6 bg-amber-50 border border-amber-100 rounded-xl">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">De</label>
                  <input
                    type="time"
                    value={quietStart}
                    onChange={(e) => setQuietStart(e.target.value)}
                    className="w-full p-3 bg-white border border-amber-200 rounded-lg font-bold text-sm text-slate-700 focus:ring-2 focus:ring-amber-600 focus:border-transparent"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Hasta</label>
                  <input
                    type="time"
                    value={quietEnd}
                    onChange={(e) => setQuietEnd(e.target.value)}
                    className="w-full p-3 bg-white border border-amber-200 rounded-lg font-bold text-sm text-slate-700 focus:ring-2 focus:ring-amber-600 focus:border-transparent"
                  />
                </div>
              </div>
              <p className="text-xs text-slate-600 italic">Durante estas horas no recibirás notificaciones, excepto alertas de emergencia.</p>
            </div>
          )}
        </div>

        {/* RESÚMENES */}
        <div className="parent-card space-y-6">
          <h2 className="text-xl md:text-2xl font-black text-slate-900 flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center text-slate-600 font-black text-sm">📊</div>
            Resúmenes Automáticos
          </h2>

          <div className="space-y-4">
            {/* Resumen Diario */}
            <div className="flex items-center justify-between p-4 md:p-6 bg-slate-50 rounded-xl hover:bg-slate-100 transition-all">
              <div className="flex items-center gap-4 flex-1">
                <div className="w-10 h-10 rounded-lg bg-slate-200 flex items-center justify-center text-slate-600">
                  <Clock size={20} />
                </div>
                <div>
                  <p className="font-black text-slate-900">Resumen Diario</p>
                  <p className="text-xs text-slate-500">Un correo cada mañana con el resumen del día anterior</p>
                </div>
              </div>
              <ToggleSwitch checked={dailySummary} onChange={setDailySummary} />
            </div>

            {/* Resumen Semanal */}
            <div className="flex items-center justify-between p-4 md:p-6 bg-slate-50 rounded-xl hover:bg-slate-100 transition-all">
              <div className="flex items-center gap-4 flex-1">
                <div className="w-10 h-10 rounded-lg bg-slate-200 flex items-center justify-center text-slate-600">
                  <Clock size={20} />
                </div>
                <div>
                  <p className="font-black text-slate-900">Resumen Semanal</p>
                  <p className="text-xs text-slate-500">Un reporte cada lunes con el resumen de la semana</p>
                </div>
              </div>
              <ToggleSwitch checked={weeklySummary} onChange={setWeeklySummary} />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex gap-3">
          <button onClick={() => navigate('/parent')} className="flex-1 py-4 rounded-lg bg-slate-100 text-slate-600 font-black uppercase text-xs tracking-widest hover:bg-slate-200 transition-all">Cancelar</button>
          <Button 
            onClick={handleSave}
            className="flex-1 py-4 rounded-lg bg-gradient-to-r from-emerald-600 to-sky-600 text-white font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-emerald-200/50"
          >
            <Save size={18} /> Guardar Preferencias
          </Button>
        </div>
      </div>
    </div>
  );
}
