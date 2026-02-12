import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserRole } from '../types';
// CORRECCIÓN: La ruta ahora es ../hooks porque hooks está dentro de src
import { useAuth } from '../hooks/useAuth';
import { 
  Zap, ArrowRight, ShieldCheck, UserCircle, 
  GraduationCap, Building2, ShieldAlert, Info
} from 'lucide-react';
import { Button } from './Button';

type GatewayType = 'choice' | 'parent' | 'student' | 'institution' | 'corporate';

export const LoginView: React.FC = () => {
  const navigate = useNavigate();
  // CORRECCIÓN: Renombramos isLoading a authLoading para evitar conflictos
  const { isAuthenticated, isDemoMode, loginAsRole, user, isLoading: authLoading } = useAuth();
  
  const [gateway, setGateway] = useState<GatewayType>('choice');
  const [isLoading, setIsLoading] = useState(false);
  const [masterKeyInput, setMasterKeyInput] = useState('');

  // Mapear gateway a rol de usuario
  const gatewayToRole = (gw: GatewayType): UserRole => {
    switch (gw) {
      case 'parent':
        return UserRole.PARENT;
      case 'student':
        return UserRole.STUDENT;
      case 'institution':
        return UserRole.SCHOOL_ADMIN;
      case 'corporate':
        return UserRole.SUPER_ADMIN;
      default:
        return UserRole.STUDENT;
    }
  };

  // Redirección automática si ya está autenticado
  useEffect(() => {
    if (isAuthenticated && user) {
      const dashboardPath = getDashboardPath(user.role);
      navigate(dashboardPath, { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const getDashboardPath = (role: UserRole): string => {
    const pathMap: Record<UserRole, string> = {
      [UserRole.SUPER_ADMIN]: '/admin',
      [UserRole.SCHOOL_ADMIN]: '/school',
      [UserRole.SCHOOL_FINANCE]: '/school',
      [UserRole.UNIT_MANAGER]: '/unit',
      [UserRole.POS_OPERATOR]: '/pos',
      [UserRole.CAFETERIA_STAFF]: '/pos',
      [UserRole.STATIONERY_STAFF]: '/pos/stationery',
      [UserRole.CASHIER]: '/cashier',
      [UserRole.PARENT]: '/parent',
      [UserRole.STUDENT]: '/student',
    };
    return pathMap[role] || '/login';
  };

  const handleLogin = async (role: UserRole) => {
    // Validación especial para Super Admin
    if (role === UserRole.SUPER_ADMIN) {
      if (masterKeyInput.toUpperCase() !== 'MECARD2025') {
        alert("⚠️ Llave Maestra Incorrecta. Acceso Denegado.\nUsa: MECARD2025");
        return;
      }
    }

    setIsLoading(true);
    
    try {
      if (isDemoMode) {
        // Simular delay de autenticación
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Hacer login con el rol especificado
        loginAsRole(role);
        
        // Aquí la redirección ocurre automáticamente via useEffect
        // porque loginAsRole actualiza el state `user` que dispara isAuthenticated
      } else {
        throw new Error('Real auth not implemented yet');
      }
    } catch (error) {
      console.error('Error during login:', error);
      alert('Error de autenticación. Intenta de nuevo.');
      setIsLoading(false);
    }
  };

  const reset = () => {
    setGateway('choice');
    setMasterKeyInput('');
    setIsLoading(false);
  };

  // Usamos authLoading aquí
  if (authLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-semibold">Cargando...</p>
        </div>
      </div>
    );
  }

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

  if (gateway === 'parent') {
    return (
      <div className="h-screen w-full bg-gradient-to-br from-indigo-50 via-white to-indigo-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full animate-in zoom-in duration-500">
          <div className="bg-white p-12 rounded-[48px] shadow-2xl space-y-8">
            <div className="text-center">
              <div className="bg-indigo-100 w-24 h-24 rounded-[32px] flex items-center justify-center mx-auto mb-6 shadow-lg shadow-indigo-200">
                <UserCircle className="text-indigo-600 w-12 h-12" />
              </div>
              <h2 className="text-3xl font-black text-slate-800 tracking-tighter">Portal Familiar</h2>
              <p className="text-[10px] text-slate-400 uppercase tracking-[2px] font-bold mt-2">Gestiona el saldo de tus hijos</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Email</label>
                <input type="email" placeholder="tu-email@gmail.com" className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-medium outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Contraseña</label>
                <input type="password" placeholder="••••••••" className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-medium outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all" />
              </div>
            </div>

            <Button 
              onClick={() => handleLogin(UserRole.PARENT)} 
              disabled={isLoading}
              className="w-full py-6 rounded-[24px] bg-indigo-600 text-white font-black text-xs uppercase tracking-[3px] shadow-lg"
            >
              {isLoading ? 'Entrando...' : 'Entrar a Billetera'}
            </Button>

            <button onClick={reset} className="block w-full text-slate-400 font-black text-[9px] uppercase tracking-[3px]">← Volver</button>
          </div>
        </div>
      </div>
    );
  }

  if (gateway === 'student') {
    return (
      <div className="h-screen w-full bg-gradient-to-br from-emerald-50 via-white to-emerald-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full animate-in zoom-in duration-500">
          <div className="bg-white p-12 rounded-[48px] shadow-2xl space-y-8">
            <div className="text-center">
              <div className="bg-emerald-100 w-24 h-24 rounded-[32px] flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-200">
                <GraduationCap className="text-emerald-600 w-12 h-12" />
              </div>
              <h2 className="text-3xl font-black text-slate-800 tracking-tighter">Portal Estudiante</h2>
              <p className="text-[10px] text-slate-400 uppercase tracking-[2px] font-bold mt-2">Accede a tu credencial y saldo</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Matrícula</label>
                <input type="text" placeholder="2024-12345" className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-medium uppercase outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 transition-all text-center" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest">PIN</label>
                <input type="password" placeholder="••••" className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-medium outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 transition-all text-center" />
              </div>
            </div>

            <Button 
              onClick={() => handleLogin(UserRole.STUDENT)} 
              disabled={isLoading}
              className="w-full py-6 rounded-[24px] bg-emerald-600 text-white font-black text-xs uppercase tracking-[3px] shadow-lg"
            >
              {isLoading ? 'Entrando...' : 'Acceder a Mi Perfil'}
            </Button>

            <button onClick={reset} className="block w-full text-slate-400 font-black text-[9px] uppercase tracking-[3px]">← Volver</button>
          </div>
        </div>
      </div>
    );
  }

  if (gateway === 'institution') {
    return (
      <div className="h-screen w-full bg-gradient-to-br from-slate-50 via-white to-slate-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full animate-in zoom-in duration-500">
          <div className="bg-white p-12 rounded-[48px] shadow-2xl space-y-8">
            <div className="text-center">
              <div className="bg-slate-100 w-24 h-24 rounded-[32px] flex items-center justify-center mx-auto mb-6 shadow-lg shadow-slate-200">
                <Building2 className="text-slate-700 w-12 h-12" />
              </div>
              <h2 className="text-3xl font-black text-slate-800 tracking-tighter">Portal Escolar</h2>
              <p className="text-[10px] text-slate-400 uppercase tracking-[2px] font-bold mt-2">Panel administrativo de la institución</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Email Institucional</label>
                <input type="email" placeholder="admin@escuela.mx" className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-medium outline-none focus:border-slate-700 focus:ring-2 focus:ring-slate-100 transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Contraseña</label>
                <input type="password" placeholder="••••••••" className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-medium outline-none focus:border-slate-700 focus:ring-2 focus:ring-slate-100 transition-all" />
              </div>
            </div>

            <Button 
              onClick={() => handleLogin(UserRole.SCHOOL_ADMIN)} 
              disabled={isLoading}
              className="w-full py-6 rounded-[24px] bg-slate-800 text-white font-black text-xs uppercase tracking-[3px] shadow-lg"
            >
              {isLoading ? 'Entrando...' : 'Panel Administrativo'}
            </Button>

            <button onClick={reset} className="block w-full text-slate-400 font-black text-[9px] uppercase tracking-[3px]">← Volver</button>
          </div>
        </div>
      </div>
    );
  }
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

export default LoginView;
