
import React, { useState } from 'react';
import { UserRole } from '../types';
import { 
  Zap, ArrowRight, ShieldCheck, Mail, Lock, UserCircle, 
  GraduationCap, Smartphone, ChevronRight, X, CheckCircle2, 
  Sparkles, Bot, Building2, Store, ShieldAlert, Key, 
  Fingerprint, ChevronLeft, ArrowLeftRight, Utensils, PenTool,
  User, LockKeyhole, Hash, Info
} from 'lucide-react';
import { Button } from './Button';

interface LoginViewProps {
  onLogin: (role: UserRole) => void;
}

type GatewayType = 'choice' | 'parent' | 'student' | 'institution' | 'corporate';

export const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
  const [gateway, setGateway] = useState<GatewayType>('choice');
  const [isLoading, setIsLoading] = useState(false);

  // Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [studentId, setStudentId] = useState('');
  const [pin, setPin] = useState('');
  const [masterKeyInput, setMasterKeyInput] = useState('');

  const handleLogin = (role: UserRole) => {
    // Verificación Crítica de Master Key
    if (role === UserRole.SUPER_ADMIN) {
        if (masterKeyInput.toUpperCase() !== 'MECARD2025') {
            alert("⚠️ Llave Maestra Incorrecta. Acceso Denegado.\nUsa: MECARD2025");
            return;
        }
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onLogin(role);
    }, 800);
  };

  const reset = () => {
    setGateway('choice');
    setMasterKeyInput('');
  };

  if (gateway === 'choice') {
    return (
      <div className="h-screen w-full bg-[#f8fafc] flex flex-col items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-100 rounded-full blur-[120px] opacity-40"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-50 rounded-full blur-[120px] opacity-40"></div>
        
        <div className="relative z-10 text-center mb-16 animate-in fade-in slide-in-from-top-4 duration-700">
            <div className="bg-indigo-600 w-20 h-20 rounded-[28px] flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-indigo-100 rotate-6">
                <Zap className="text-white w-10 h-10" />
            </div>
            <h1 className="text-6xl font-black text-slate-800 tracking-tighter mb-4 leading-none">MeCard Network</h1>
            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[5px]">Gestión Inteligente de Ecosistemas Escolares</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 w-full max-w-7xl relative z-10">
            <GatewayCard 
                onClick={() => setGateway('parent')}
                icon={<UserCircle size={32}/>}
                title="Padres"
                description="Control de gastos, recargas y límites nutricionales."
                color="indigo"
                tag="FAMILIA"
            />
            <GatewayCard 
                onClick={() => setGateway('student')}
                icon={<GraduationCap size={32}/>}
                title="Alumnos"
                description="Credencial digital, saldo y consumo saludable."
                color="emerald"
                tag="ESTUDIANTE"
            />
            <GatewayCard 
                onClick={() => setGateway('institution')}
                icon={<Building2 size={32}/>}
                title="Colegios"
                description="Administración de unidades POS e inventarios."
                color="slate"
                tag="STAFF"
            />
            <GatewayCard 
                onClick={() => setGateway('corporate')}
                icon={<ShieldCheck size={32}/>}
                title="Corporativo"
                description="Panel Maestro para despliegue de infraestructura."
                color="purple"
                tag="ADMIN"
            />
        </div>
      </div>
    );
  }

  if (gateway === 'corporate') {
    return (
      <div className="h-screen w-full bg-[#0a0a0c] flex items-center justify-center p-6">
        <div className="max-w-md w-full animate-in zoom-in duration-500 text-center">
          <div className="bg-purple-600 w-24 h-24 rounded-[36px] flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-purple-900/40 border border-purple-400/30">
            <ShieldAlert className="text-white w-12 h-12" />
          </div>
          <h2 className="text-3xl font-black text-white tracking-tighter">Acceso Maestro</h2>
          
          <div className="bg-white/5 backdrop-blur-2xl border border-white/10 p-12 rounded-[64px] space-y-8 mt-10">
            <div className="space-y-4 text-left">
                <label className="text-slate-500 font-black text-[10px] uppercase tracking-widest px-2">Master Key</label>
                <input 
                    type="text" 
                    value={masterKeyInput}
                    onChange={(e) => setMasterKeyInput(e.target.value)}
                    placeholder="Escribe: MECARD2025" 
                    className="w-full px-8 py-6 bg-white/5 border border-white/10 rounded-3xl font-black text-white outline-none focus:border-purple-500 transition-all text-center tracking-[4px] text-2xl" 
                />
                <div className="p-4 bg-purple-950/40 rounded-2xl border border-purple-500/20 flex gap-4 items-center">
                    <Info size={16} className="text-purple-400 shrink-0"/>
                    <p className="text-[10px] font-bold text-purple-200 uppercase">Clave necesaria para gestionar la red global.</p>
                </div>
            </div>

            <Button 
                onClick={() => handleLogin(UserRole.SUPER_ADMIN)} 
                disabled={isLoading || !masterKeyInput}
                className="w-full py-8 rounded-[32px] bg-purple-600 text-white font-black text-xs uppercase tracking-[4px] shadow-2xl"
            >
              {isLoading ? 'Autorizando...' : 'Entrar como Super Admin'}
            </Button>
            
            <button onClick={reset} className="block w-full text-slate-500 font-black text-[9px] uppercase tracking-[3px] mt-4">Regresar</button>
          </div>
        </div>
      </div>
    );
  }

  // Fallback para otros portales (usando handleLogin directo para fines de demo)
  return (
    <div className="h-screen w-full flex items-center justify-center bg-slate-100">
        <div className="bg-white p-16 rounded-[64px] shadow-2xl text-center">
            <h2 className="text-3xl font-black mb-8">Portal en Desarrollo</h2>
            <Button onClick={() => handleLogin(gateway.toUpperCase() as any)} className="px-12 py-6 rounded-3xl">Simular Entrada</Button>
            <button onClick={reset} className="block w-full mt-6 text-slate-400 font-black uppercase text-[10px]">Volver</button>
        </div>
    </div>
  );
};

const GatewayCard = ({ onClick, icon, title, description, color, tag }: any) => {
  const themes = {
    indigo: 'border-indigo-100 hover:border-indigo-600 bg-white hover:bg-indigo-50/20',
    emerald: 'border-emerald-100 hover:border-emerald-600 bg-white hover:bg-emerald-50/20',
    slate: 'border-slate-100 hover:border-slate-800 bg-white hover:bg-slate-50/20',
    purple: 'border-purple-100 hover:border-purple-600 bg-white hover:bg-purple-50/20'
  };
  const iconColors = {
    indigo: 'bg-indigo-50 text-indigo-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    slate: 'bg-slate-100 text-slate-800',
    purple: 'bg-purple-50 text-purple-600'
  };

  return (
    <button onClick={onClick} className={`p-10 rounded-[56px] border-2 transition-all duration-500 text-left flex flex-col group relative overflow-hidden h-full shadow-sm hover:shadow-2xl hover:-translate-y-3 ${themes[color as keyof typeof themes]}`}>
      <div className="absolute top-8 right-8 bg-slate-50 px-3 py-1 rounded-xl text-[8px] font-black uppercase tracking-widest text-slate-400 border border-slate-100">{tag}</div>
      <div className={`w-20 h-20 rounded-[32px] flex items-center justify-center mb-8 transition-transform duration-500 group-hover:scale-110 ${iconColors[color as keyof typeof iconColors]}`}>{icon}</div>
      <h3 className="text-3xl font-black text-slate-800 tracking-tighter mb-4">{title}</h3>
      <p className="text-slate-400 font-medium leading-relaxed flex-1 text-base">{description}</p>
      <div className="mt-10 flex items-center gap-3 font-black text-[9px] uppercase tracking-[3px] text-slate-300 group-hover:text-slate-800 transition-colors">Entrar <ArrowRight size={16}/></div>
    </button>
  );
};
