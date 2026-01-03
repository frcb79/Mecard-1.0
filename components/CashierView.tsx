
import React, { useState } from 'react';
import { Search, Banknote, History, ArrowUpCircle, User, CheckCircle2, XCircle, CreditCard } from 'lucide-react';
import { StudentProfile, Transaction } from '../types';
import { Button } from './Button';

interface CashierViewProps {
  student: StudentProfile;
  onDeposit: (amount: number) => void;
}

export const CashierView: React.FC<CashierViewProps> = ({ student, onDeposit }) => {
  const [searchId, setSearchId] = useState('');
  const [amount, setAmount] = useState<string>('');
  const [step, setStep] = useState<'search' | 'deposit' | 'success'>('search');
  const [lastAmount, setLastAmount] = useState(0);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchId === student.id || student.name.toLowerCase().includes(searchId.toLowerCase())) {
      setStep('deposit');
    } else {
      alert("Alumno no encontrado. Intenta con ID: 2024001");
    }
  };

  const confirmDeposit = () => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      alert("Ingresa un monto válido");
      return;
    }
    setLastAmount(numAmount);
    onDeposit(numAmount);
    setStep('success');
    setAmount('');
  };

  return (
    <div className="p-8 h-full bg-slate-50 overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        <header className="mb-12">
          <h1 className="text-4xl font-black text-slate-800 tracking-tighter">Caja de Recargas</h1>
          <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[3px] mt-1">Recepción de Efectivo y Abonos Directos</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Action Area */}
          <div className="lg:col-span-2 space-y-8">
            {step === 'search' && (
              <div className="bg-white p-12 rounded-[56px] shadow-sm border border-slate-100 animate-in fade-in zoom-in duration-300">
                <div className="bg-indigo-50 w-20 h-20 rounded-[32px] flex items-center justify-center text-indigo-600 mb-8">
                  <User size={40} />
                </div>
                <h2 className="text-3xl font-black text-slate-800 mb-4">Identificar Alumno</h2>
                <p className="text-slate-400 font-medium mb-10">Escanea la credencial o ingresa el número de matrícula para iniciar el abono.</p>
                
                <form onSubmit={handleSearch} className="space-y-6">
                  <div className="relative">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={24} />
                    <input 
                      autoFocus
                      type="text" 
                      value={searchId}
                      onChange={(e) => setSearchId(e.target.value)}
                      placeholder="ID o Nombre del Alumno..." 
                      className="w-full pl-16 pr-8 py-6 rounded-3xl bg-slate-50 border-none outline-none font-black text-xl text-slate-700 focus:ring-4 focus:ring-indigo-100 transition-all"
                    />
                  </div>
                  <Button type="submit" className="w-full py-6 rounded-3xl text-[12px] font-black uppercase tracking-widest bg-indigo-600 shadow-2xl shadow-indigo-100">
                    Buscar Alumno
                  </Button>
                </form>
              </div>
            )}

            {step === 'deposit' && (
              <div className="bg-white p-12 rounded-[56px] shadow-sm border border-slate-100 animate-in slide-in-from-right-4 duration-300">
                <div className="flex items-center gap-6 mb-12">
                  <img src={student.photo} className="w-20 h-20 rounded-3xl object-cover shadow-lg" />
                  <div>
                    <h3 className="text-2xl font-black text-slate-800">{student.name}</h3>
                    <p className="text-indigo-600 font-black text-xs uppercase tracking-widest">{student.grade}</p>
                  </div>
                  <button onClick={() => setStep('search')} className="ml-auto p-4 text-slate-300 hover:text-slate-800 transition-colors">
                    <XCircle size={24} />
                  </button>
                </div>

                <div className="bg-slate-50 p-10 rounded-[40px] border border-slate-100 mb-10">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 block">Monto a Recargar (MXN)</label>
                  <div className="flex items-center gap-4">
                    <span className="text-5xl font-black text-slate-300">$</span>
                    <input 
                      autoFocus
                      type="number" 
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full bg-transparent border-none outline-none font-black text-6xl text-slate-800"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-10">
                  {[50, 100, 200, 500].map(val => (
                    <button 
                      key={val} 
                      onClick={() => setAmount(val.toString())}
                      className="py-6 rounded-3xl border-2 border-slate-100 font-black text-slate-500 hover:border-indigo-600 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
                    >
                      + ${val}
                    </button>
                  ))}
                </div>

                <Button onClick={confirmDeposit} className="w-full py-6 rounded-3xl text-[12px] font-black uppercase tracking-widest bg-emerald-600 shadow-2xl shadow-emerald-100">
                  Confirmar Recarga en Efectivo
                </Button>
              </div>
            )}

            {step === 'success' && (
              <div className="bg-white p-12 rounded-[56px] shadow-xl border border-emerald-100 text-center animate-in zoom-in duration-300">
                <div className="bg-emerald-100 w-24 h-24 rounded-full flex items-center justify-center text-emerald-600 mx-auto mb-8">
                  <CheckCircle2 size={48} />
                </div>
                <h2 className="text-4xl font-black text-slate-800 mb-4">¡Recarga Exitosa!</h2>
                <p className="text-slate-500 font-medium text-lg mb-10">Se han abonado <span className="text-emerald-600 font-black">${lastAmount.toFixed(2)}</span> a la cuenta de {student.name}.</p>
                <Button onClick={() => setStep('search')} className="px-12 py-6 rounded-3xl bg-slate-900 text-white font-black uppercase tracking-widest text-[11px]">
                  Realizar otra Recarga
                </Button>
              </div>
            )}
          </div>

          {/* Side Info */}
          <div className="space-y-8">
            <div className="bg-slate-900 p-10 rounded-[48px] text-white shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10"><Banknote size={80}/></div>
              <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-10">Resumen de Caja</h4>
              <div className="space-y-6">
                <div>
                  <p className="text-xs font-bold text-slate-500 mb-1">Total Recaudado Hoy</p>
                  <p className="text-4xl font-black tracking-tighter">$12,450.00</p>
                </div>
                <div className="pt-6 border-t border-white/10 flex justify-between items-center">
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Operaciones</span>
                  <span className="font-black">24</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                <History size={14}/> Últimos Abonos
              </h4>
              <div className="space-y-4">
                {[
                  { name: 'Ana García', amt: 200, time: 'Hace 5 min' },
                  { name: 'Carlos López', amt: 50, time: 'Hace 12 min' },
                  { name: 'María R.', amt: 100, time: 'Hace 45 min' },
                ].map((log, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                    <div>
                      <p className="font-black text-slate-700 text-xs">{log.name}</p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase">{log.time}</p>
                    </div>
                    <span className="text-emerald-600 font-black text-sm">+${log.amt}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
