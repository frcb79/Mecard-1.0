import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserRole } from '../types';
import { useAuth } from '../hooks/useAuth';
import { useToast } from './ui/Toast';
import {
  Zap, ArrowRight, ShieldCheck, UserCircle,
  GraduationCap, Building2, ShieldAlert, Info,
  ArrowLeft, Loader2, Lock, Mail, KeyRound, Hash
} from 'lucide-react';

type GatewayType = 'choice' | 'parent' | 'student' | 'institution' | 'corporate';

// =============================================
// GATEWAY CARD — typed, accessible, design-token-based
// =============================================
type GatewayColor = 'brand' | 'trust' | 'surface' | 'purple';

interface GatewayCardProps {
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
  description: string;
  color: GatewayColor;
  tag: string;
}

const colorMap: Record<GatewayColor, { card: string; icon: string; tag: string; arrow: string }> = {
  brand: {
    card: 'border-brand-100 hover:border-brand-400 hover:bg-brand-50/30',
    icon: 'bg-brand-50 text-brand-500',
    tag: 'bg-brand-50 text-brand-500 border-brand-100',
    arrow: 'group-hover:text-brand-500',
  },
  trust: {
    card: 'border-trust-100 hover:border-trust-400 hover:bg-trust-50/30',
    icon: 'bg-trust-50 text-trust-500',
    tag: 'bg-trust-50 text-trust-600 border-trust-100',
    arrow: 'group-hover:text-trust-500',
  },
  surface: {
    card: 'border-surface-200 hover:border-surface-400 hover:bg-surface-50/40',
    icon: 'bg-surface-100 text-surface-600',
    tag: 'bg-surface-100 text-surface-500 border-surface-200',
    arrow: 'group-hover:text-surface-700',
  },
  purple: {
    card: 'border-purple-100 hover:border-purple-400 hover:bg-purple-50/30',
    icon: 'bg-purple-50 text-purple-600',
    tag: 'bg-purple-50 text-purple-600 border-purple-100',
    arrow: 'group-hover:text-purple-600',
  },
};

function GatewayCard({ onClick, icon, title, description, color, tag }: GatewayCardProps) {
  const c = colorMap[color];
  return (
    <button
      onClick={onClick}
      className={`relative p-7 sm:p-8 rounded-2xl border bg-white transition-all duration-300 text-left flex flex-col group
        h-full shadow-xs hover:shadow-lg hover:-translate-y-1 focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:outline-none ${c.card}`}
      aria-label={`Acceder como ${title}`}
    >
      <span className={`absolute top-5 right-5 px-2.5 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider border ${c.tag}`}>
        {tag}
      </span>
      <span className={`w-14 h-14 rounded-xl flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-105 ${c.icon}`}>
        {icon}
      </span>
      <h3 className="text-xl font-bold text-surface-800 mb-2">{title}</h3>
      <p className="text-sm text-surface-400 leading-relaxed flex-1">{description}</p>
      <span className={`mt-5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-surface-300 transition-colors ${c.arrow}`}>
        Continuar <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
      </span>
    </button>
  );
}

// =============================================
// FORM PANEL — reusable sub-gateway form
// =============================================

interface FormPanelProps {
  icon: React.ReactNode;
  iconBg: string;
  bg: string;
  title: string;
  subtitle: string;
  fields: React.ReactNode;
  buttonLabel: string;
  buttonLoadingLabel: string;
  buttonClass: string;
  isLoading: boolean;
  disabled?: boolean;
  onSubmit: () => void;
  onBack: () => void;
}

function FormPanel({ icon, iconBg, bg, title, subtitle, fields, buttonLabel, buttonLoadingLabel, buttonClass, isLoading, disabled, onSubmit, onBack }: FormPanelProps) {
  return (
    <div className={`h-screen w-full ${bg} flex items-center justify-center p-4 sm:p-6`}>
      <div className="max-w-md w-full animate-fade-in-up">
        <div className="bg-white rounded-2xl shadow-xl border border-surface-100 overflow-hidden">
          {/* Header */}
          <div className="pt-10 pb-6 px-8 text-center">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-md ${iconBg}`}>
              {icon}
            </div>
            <h2 className="text-2xl font-bold text-surface-800 mb-1">{title}</h2>
            <p className="text-sm text-surface-400">{subtitle}</p>
          </div>
          {/* Body */}
          <div className="px-8 pb-8 space-y-5">
            {fields}
            <button
              onClick={onSubmit}
              disabled={isLoading || disabled}
              className={`w-full py-3.5 rounded-xl font-semibold text-sm transition-all shadow-sm
                disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${buttonClass}`}
            >
              {isLoading ? (
                <><Loader2 size={16} className="animate-spin" /> {buttonLoadingLabel}</>
              ) : buttonLabel}
            </button>
            <button
              onClick={onBack}
              className="w-full text-sm text-surface-400 hover:text-surface-600 transition-colors py-2 flex items-center justify-center gap-1"
            >
              <ArrowLeft size={14} /> Volver al inicio
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// =============================================
// MAIN LOGIN VIEW
// =============================================

export const LoginView: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isDemoMode, loginAsRole, login, user, isLoading: authLoading } = useAuth();
  const toast = useToast();

  const [gateway, setGateway] = useState<GatewayType>('choice');
  const [isLoading, setIsLoading] = useState(false);
  const [masterKeyInput, setMasterKeyInput] = useState('');
  const [corporateEmail, setCorporateEmail] = useState('');
  const [corporatePassword, setCorporatePassword] = useState('');
  const [institutionEmail, setInstitutionEmail] = useState('');
  const [institutionPassword, setInstitutionPassword] = useState('');

  useEffect(() => {
    if (isAuthenticated && user) {
      const path = getDashboardPath(user.role);
      navigate(path, { replace: true });
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
    if (role === UserRole.SUPER_ADMIN && masterKeyInput.toUpperCase() !== 'MECARD2025') {
      toast.warning('Llave Maestra incorrecta', 'Verifica la clave e intenta de nuevo.');
      return;
    }

    setIsLoading(true);
    try {
      if (isDemoMode) {
        await new Promise(resolve => setTimeout(resolve, 600));
        loginAsRole(role);
      } else {
        if (role === UserRole.SUPER_ADMIN) {
          const email = corporateEmail.trim();
          if (!email || !corporatePassword) {
            toast.warning('Faltan credenciales', 'Ingresa correo y contraseña de Super Admin.');
            return;
          }
          await login(email, corporatePassword, role);
          return;
        }

        if (role === UserRole.SCHOOL_ADMIN) {
          const email = institutionEmail.trim();
          if (!email || !institutionPassword) {
            toast.warning('Faltan credenciales', 'Ingresa correo y contraseña institucional.');
            return;
          }
          await login(email, institutionPassword, role);
          return;
        }

        toast.info('Acceso no habilitado', 'Este tipo de inicio de sesión aún no está habilitado en modo real.');
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Intenta de nuevo más tarde.';
      toast.error('Error de autenticación', message);
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setGateway('choice');
    setMasterKeyInput('');
    setCorporateEmail('');
    setCorporatePassword('');
    setInstitutionEmail('');
    setInstitutionPassword('');
    setIsLoading(false);
  };

  // ── Loading state ──
  if (authLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-white">
        <div className="text-center animate-fade-in">
          <div className="w-14 h-14 border-[3px] border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-surface-500 font-medium text-sm">Cargando…</p>
        </div>
      </div>
    );
  }

  // ── Gateway choice ──
  if (gateway === 'choice') {
    return (
      <div className="min-h-screen w-full bg-surface-50 flex flex-col items-center justify-center px-4 py-10 sm:p-6 relative overflow-hidden">
        {/* Ambient blobs */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-brand-100 rounded-full blur-[140px] opacity-30 pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-trust-100 rounded-full blur-[140px] opacity-30 pointer-events-none" />

        {/* Branding */}
        <div className="relative z-10 text-center mb-12 animate-fade-in-up">
          <div className="bg-brand-500 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-brand-200/60 rotate-3">
            <Zap className="text-white w-8 h-8" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-surface-800 tracking-tight mb-3 leading-none">
            MeCard<span className="text-brand-500">.</span>
          </h1>
          <p className="text-surface-400 text-sm sm:text-base font-medium max-w-md mx-auto">
            Plataforma inteligente para la gestión de ecosistemas escolares
          </p>
        </div>

        {/* Gateway cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 w-full max-w-5xl relative z-10">
          <GatewayCard
            onClick={() => setGateway('parent')}
            icon={<UserCircle size={26} />}
            title="Padres"
            description="Control de gastos, recargas y límites nutricionales."
            color="brand"
            tag="Familia"
          />
          <GatewayCard
            onClick={() => setGateway('student')}
            icon={<GraduationCap size={26} />}
            title="Alumnos"
            description="Credencial digital, saldo y consumo saludable."
            color="trust"
            tag="Estudiante"
          />
          <GatewayCard
            onClick={() => setGateway('institution')}
            icon={<Building2 size={26} />}
            title="Colegios"
            description="Administración de unidades POS e inventarios."
            color="surface"
            tag="Escuela"
          />
          <GatewayCard
            onClick={() => setGateway('corporate')}
            icon={<ShieldCheck size={26} />}
            title="Corporativo"
            description="Panel Maestro para despliegue de infraestructura."
            color="purple"
            tag="Admin"
          />
        </div>

        {/* Footer */}
        <p className="relative z-10 mt-10 text-xs text-surface-300">
          © {new Date().getFullYear()} MeCard Network — v1.3
        </p>
      </div>
    );
  }

  // ── Corporate / Super Admin ──
  if (gateway === 'corporate') {
    return (
      <div className="h-screen w-full bg-surface-900 flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(139,92,246,0.15),_transparent_60%)]" />
        <div className="max-w-md w-full animate-fade-in-up relative z-10">
          <div className="bg-surface-800/80 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
            <div className="pt-10 pb-6 px-8 text-center">
              <div className="w-16 h-16 rounded-2xl bg-purple-600 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-purple-900/40 border border-purple-400/20">
                <ShieldAlert className="text-white w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-1">Acceso Maestro</h2>
              <p className="text-sm text-surface-400">Panel corporativo de la red MeCard</p>
            </div>
            <div className="px-8 pb-8 space-y-5">
              <div>
                <label htmlFor="corporate-email" className="block text-xs font-semibold text-surface-400 mb-2">
                  Correo Super Admin
                </label>
                <div className="relative mb-3">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-500" />
                  <input
                    id="corporate-email"
                    type="email"
                    value={corporateEmail}
                    onChange={(e) => setCorporateEmail(e.target.value)}
                    placeholder="admin@mecard.mx"
                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white font-medium
                      placeholder:text-surface-500 outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400/30 transition-all"
                    autoComplete="username"
                  />
                </div>
                <label htmlFor="master-key" className="block text-xs font-semibold text-surface-400 mb-2">
                  Master Key
                </label>
                <div className="relative">
                  <KeyRound size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-500" />
                  <input
                    id="master-key"
                    type="password"
                    value={corporatePassword}
                    onChange={(e) => setCorporatePassword(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleLogin(UserRole.SUPER_ADMIN)}
                    placeholder="Ingresa tu contraseña"
                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white font-medium text-center tracking-widest
                      placeholder:text-surface-500 placeholder:tracking-normal outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400/30 transition-all"
                    autoComplete="current-password"
                  />
                </div>
                <label htmlFor="master-approval" className="block text-xs font-semibold text-surface-400 mb-2 mt-3">
                  Llave Maestra
                </label>
                <div className="relative">
                  <KeyRound size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-500" />
                  <input
                    id="master-approval"
                    type="text"
                    value={masterKeyInput}
                    onChange={(e) => setMasterKeyInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleLogin(UserRole.SUPER_ADMIN)}
                    placeholder="MECARD2025"
                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white font-medium text-center tracking-widest
                      placeholder:text-surface-500 placeholder:tracking-normal outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400/30 transition-all"
                    autoComplete="off"
                  />
                </div>
                <div className="mt-3 p-3 bg-purple-500/10 rounded-lg border border-purple-400/10 flex gap-3 items-start">
                  <Info size={14} className="text-purple-300 mt-0.5 shrink-0" />
                  <p className="text-xs text-purple-200/80">Usa la clave: MECARD2025</p>
                </div>
              </div>
              <button
                onClick={() => handleLogin(UserRole.SUPER_ADMIN)}
                disabled={isLoading || !masterKeyInput || !corporateEmail || !corporatePassword}
                className="w-full py-3.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-sm
                  transition-all shadow-lg shadow-purple-900/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? <><Loader2 size={16} className="animate-spin" /> Autorizando…</> : 'Entrar como Super Admin'}
              </button>
              <button
                onClick={reset}
                className="w-full text-sm text-surface-500 hover:text-surface-300 transition-colors py-2 flex items-center justify-center gap-1"
              >
                <ArrowLeft size={14} /> Volver al inicio
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Parent ──
  if (gateway === 'parent') {
    return (
      <FormPanel
        icon={<UserCircle className="text-brand-500 w-8 h-8" />}
        iconBg="bg-brand-50"
        bg="bg-gradient-to-br from-brand-50/50 via-white to-brand-50/30"
        title="Portal Familiar"
        subtitle="Gestiona el saldo y consumo de tus hijos"
        buttonLabel="Entrar a Billetera"
        buttonLoadingLabel="Entrando…"
        buttonClass="bg-brand-500 hover:bg-brand-600 text-white"
        isLoading={isLoading}
        onSubmit={() => handleLogin(UserRole.PARENT)}
        onBack={reset}
        fields={
          <>
            <div>
              <label htmlFor="parent-email" className="block text-xs font-semibold text-surface-500 mb-1.5">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-300" />
                <input id="parent-email" type="email" placeholder="tu-email@gmail.com"
                  className="w-full pl-10 pr-4 py-3 bg-surface-50 border border-surface-200 rounded-xl text-sm font-medium
                    outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 transition-all" />
              </div>
            </div>
            <div>
              <label htmlFor="parent-pass" className="block text-xs font-semibold text-surface-500 mb-1.5">Contraseña</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-300" />
                <input id="parent-pass" type="password" placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 bg-surface-50 border border-surface-200 rounded-xl text-sm font-medium
                    outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 transition-all" />
              </div>
            </div>
          </>
        }
      />
    );
  }

  // ── Student ──
  if (gateway === 'student') {
    return (
      <FormPanel
        icon={<GraduationCap className="text-trust-500 w-8 h-8" />}
        iconBg="bg-trust-50"
        bg="bg-gradient-to-br from-trust-50/50 via-white to-trust-50/30"
        title="Portal Estudiante"
        subtitle="Accede a tu credencial y saldo"
        buttonLabel="Acceder a Mi Perfil"
        buttonLoadingLabel="Entrando…"
        buttonClass="bg-trust-500 hover:bg-trust-600 text-white"
        isLoading={isLoading}
        onSubmit={() => handleLogin(UserRole.STUDENT)}
        onBack={reset}
        fields={
          <>
            <div>
              <label htmlFor="student-id" className="block text-xs font-semibold text-surface-500 mb-1.5">Matrícula</label>
              <div className="relative">
                <Hash size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-300" />
                <input id="student-id" type="text" placeholder="2024-12345"
                  className="w-full pl-10 pr-4 py-3 bg-surface-50 border border-surface-200 rounded-xl text-sm font-medium uppercase
                    outline-none focus:border-trust-400 focus:ring-2 focus:ring-trust-100 transition-all text-center" />
              </div>
            </div>
            <div>
              <label htmlFor="student-pin" className="block text-xs font-semibold text-surface-500 mb-1.5">PIN</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-300" />
                <input id="student-pin" type="password" placeholder="••••"
                  className="w-full pl-10 pr-4 py-3 bg-surface-50 border border-surface-200 rounded-xl text-sm font-medium
                    outline-none focus:border-trust-400 focus:ring-2 focus:ring-trust-100 transition-all text-center" />
              </div>
            </div>
          </>
        }
      />
    );
  }

  // ── Institution ──
  if (gateway === 'institution') {
    return (
      <FormPanel
        icon={<Building2 className="text-surface-600 w-8 h-8" />}
        iconBg="bg-surface-100"
        bg="bg-gradient-to-br from-surface-50/50 via-white to-surface-50/30"
        title="Portal Escolar"
        subtitle="Panel administrativo de la institución"
        buttonLabel="Acceder al Panel"
        buttonLoadingLabel="Entrando…"
        buttonClass="bg-surface-800 hover:bg-surface-700 text-white"
        isLoading={isLoading}
        onSubmit={() => handleLogin(UserRole.SCHOOL_ADMIN)}
        onBack={reset}
        fields={
          <>
            <div>
              <label htmlFor="inst-email" className="block text-xs font-semibold text-surface-500 mb-1.5">Email Institucional</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-300" />
                <input id="inst-email" type="email" placeholder="admin@escuela.mx"
                  value={institutionEmail}
                  onChange={(e) => setInstitutionEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-surface-50 border border-surface-200 rounded-xl text-sm font-medium
                    outline-none focus:border-surface-500 focus:ring-2 focus:ring-surface-100 transition-all" />
              </div>
            </div>
            <div>
              <label htmlFor="inst-pass" className="block text-xs font-semibold text-surface-500 mb-1.5">Contraseña</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-300" />
                <input id="inst-pass" type="password" placeholder="••••••••"
                  value={institutionPassword}
                  onChange={(e) => setInstitutionPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-surface-50 border border-surface-200 rounded-xl text-sm font-medium
                    outline-none focus:border-surface-500 focus:ring-2 focus:ring-surface-100 transition-all" />
              </div>
            </div>
          </>
        }
      />
    );
  }

  return null;
};

export default LoginView;
