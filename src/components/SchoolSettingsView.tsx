import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  Building2,
  CheckCircle2,
  CreditCard,
  Landmark,
  Layers,
  Save,
  Settings,
  Sparkles,
  Store,
  Terminal,
  Users,
} from 'lucide-react';
import { usePlatform } from '../contexts/PlatformContext';
import { useAuth } from '../hooks/useAuth';
import {
  DEFAULT_ENABLED_MODULES,
  DEFAULT_OPERATIONAL_SETTINGS,
  useSchoolSettings,
} from '../hooks/useSchoolSettings';
import type {
  SchoolEnabledModules,
  SchoolModuleKey,
  SchoolOperationalSettings,
  SchoolPaymentMethod,
  SchoolPosOwnershipMode,
} from '../types';
import { useToast } from './ui/Toast';
import { StudentImportWizard } from './StudentImportWizard';

type SchoolFormState = {
  legalName: string;
  rfc: string;
  settlementCLABE: string;
  stpCostCenter: string;
  contactPerson: string;
  email: string;
  phone: string;
};

const MODULE_OPTIONS: Array<{ key: SchoolModuleKey; label: string; description: string }> = [
  { key: 'cafeteria', label: 'Cafetería', description: 'Operación POS principal para alimentos.' },
  { key: 'stationery', label: 'Papelería', description: 'Punto de venta adicional para útiles.' },
  { key: 'fees', label: 'Colegiaturas', description: 'Gestión y cobranza académica.' },
  { key: 'refunds', label: 'Refunds', description: 'Reembolsos y liquidaciones escolares.' },
  { key: 'collections', label: 'Cobranza', description: 'Seguimiento ejecutivo de recuperación.' },
  { key: 'reports', label: 'Reportes', description: 'Visibilidad operativa y financiera.' },
  { key: 'access', label: 'Accesos', description: 'Control de entradas, salidas y dispositivos.' },
  { key: 'announcements', label: 'Circulares', description: 'Mensajería institucional a familias.' },
  { key: 'trips', label: 'Viajes', description: 'Gestión de excursiones y pagos.' },
  { key: 'invoicing', label: 'Facturas', description: 'Seguimiento de facturación escolar.' },
  { key: 'rewards', label: 'Rewards', description: 'Programa global de puntos y marketplace.' },
];

const PAYMENT_METHOD_OPTIONS: Array<{ value: SchoolPaymentMethod; label: string }> = [
  { value: 'qr', label: 'QR' },
  { value: 'barcode', label: 'Código de barras' },
  { value: 'matricula', label: 'Matrícula' },
  { value: 'nfc', label: 'NFC' },
  { value: 'cash', label: 'Efectivo' },
  { value: 'card', label: 'Tarjeta' },
  { value: 'spei', label: 'SPEI' },
  { value: 'oxxo', label: 'OXXO' },
];

const OWNER_OPTIONS: Array<{ value: SchoolPosOwnershipMode; label: string; description: string }> = [
  { value: 'school', label: 'Operación de la escuela', description: 'La escuela opera directamente la POS.' },
  { value: 'concessionaire', label: 'Operación concesionada', description: 'Un tercero opera la POS y comparte ingresos.' },
  { value: 'mixed', label: 'Operación mixta', description: 'Conviven puntos propios y concesionados.' },
];

const EMPTY_SCHOOL_FORM: SchoolFormState = {
  legalName: '',
  rfc: '',
  settlementCLABE: '',
  stpCostCenter: '',
  contactPerson: '',
  email: '',
  phone: '',
};

const toggleListItem = <T extends string,>(items: T[], value: T): T[] =>
  items.includes(value) ? items.filter((item) => item !== value) : [...items, value];

export default function SchoolSettingsView() {
  const toast = useToast();
  const { user } = useAuth();
  const { schools, units, isLoading: platformLoading, saveSchool } = usePlatform();
  const schoolId = user?.schoolId;
  const { settings, loading, error, saveSettings } = useSchoolSettings(schoolId);

  const school = useMemo(
    () => schools.find((item) => item.id === schoolId),
    [schoolId, schools],
  );

  const [schoolForm, setSchoolForm] = useState<SchoolFormState>(EMPTY_SCHOOL_FORM);
  const [enabledModules, setEnabledModules] = useState<SchoolEnabledModules>(DEFAULT_ENABLED_MODULES);
  const [operationalSettings, setOperationalSettings] =
    useState<SchoolOperationalSettings>(DEFAULT_OPERATIONAL_SETTINGS);
  const [saving, setSaving] = useState(false);
  const [showImportWizard, setShowImportWizard] = useState(false);

  useEffect(() => {
    if (!school) {
      return;
    }

    setSchoolForm({
      legalName: school.legalName || '',
      rfc: school.rfc || '',
      settlementCLABE: school.settlementCLABE || '',
      stpCostCenter: school.stpCostCenter || '',
      contactPerson: school.contact?.contactPerson || '',
      email: school.contact?.email || '',
      phone: school.contact?.phone || '',
    });
  }, [school]);

  useEffect(() => {
    if (!settings) {
      return;
    }

    setEnabledModules(settings.enabled_modules);
    setOperationalSettings(settings.operational_settings);
  }, [settings]);

  const unitCount = useMemo(
    () => units.filter((unit) => unit.schoolId === schoolId).length,
    [schoolId, units],
  );

  const checklist = useMemo(
    () => [
      {
        label: 'Datos fiscales capturados',
        description: 'Razón social y RFC para facturación y validación.',
        complete: Boolean(schoolForm.legalName.trim() && schoolForm.rfc.trim()),
      },
      {
        label: 'Cuenta de liquidación lista',
        description: 'CLABE de 18 dígitos para dispersiones.',
        complete: schoolForm.settlementCLABE.replace(/\D/g, '').length === 18,
      },
      {
        label: 'Base estudiantil cargada',
        description: 'Al menos un alumno operativo en la escuela.',
        complete: (school?.studentCount || 0) > 0,
      },
      {
        label: 'POS o unidades activas',
        description: 'Debe existir al menos una unidad operativa.',
        complete: unitCount > 0,
      },
      {
        label: 'Operación habilitada',
        description: 'Hay módulos activos y métodos de cobro permitidos.',
        complete:
          Object.values(enabledModules).some(Boolean) &&
          operationalSettings.paymentMethods.length > 0 &&
          operationalSettings.ownerScenarios.length > 0,
      },
    ],
    [enabledModules, operationalSettings.ownerScenarios.length, operationalSettings.paymentMethods.length, school?.studentCount, schoolForm.legalName, schoolForm.rfc, schoolForm.settlementCLABE, unitCount],
  );

  const completedChecklist = checklist.filter((item) => item.complete).length;
  const canCompleteOnboarding = checklist.every((item) => item.complete);
  const activeModulesCount = Object.values(enabledModules).filter(Boolean).length;

  const handleSave = async (completeOnboarding: boolean) => {
    if (!schoolId || !school) {
      toast.error('Sin escuela asociada', 'Tu cuenta debe estar vinculada a una escuela para guardar cambios.');
      return;
    }

    const normalizedClabe = schoolForm.settlementCLABE.replace(/\D/g, '');
    if (schoolForm.settlementCLABE && normalizedClabe.length !== 18) {
      toast.error('CLABE inválida', 'La cuenta de liquidación debe tener 18 dígitos.');
      return;
    }

    if (completeOnboarding && !canCompleteOnboarding) {
      toast.warning('Faltan pasos por completar', 'Revisa el checklist antes de cerrar el onboarding.');
      return;
    }

    setSaving(true);

    const now = new Date().toISOString();
    const onboardingCompleted = completeOnboarding || settings?.onboarding_completed || false;

    const savedSchool = await saveSchool({
      ...school,
      legalName: schoolForm.legalName || undefined,
      rfc: schoolForm.rfc || undefined,
      settlementCLABE: normalizedClabe || undefined,
      stpCostCenter: schoolForm.stpCostCenter || undefined,
      contact: {
        email: schoolForm.email,
        phone: schoolForm.phone,
        contactPerson: schoolForm.contactPerson,
        position: school.contact?.position,
      },
      onboardingStatus: onboardingCompleted ? 'COMPLETED' : school.onboardingStatus,
    });

    if (!savedSchool) {
      toast.error('No se guardó la escuela', 'Hubo un problema al persistir los datos institucionales.');
      setSaving(false);
      return;
    }

    const persistedSettings = await saveSettings({
      enabled_modules: enabledModules,
      operational_settings: operationalSettings,
      onboarding_completed: onboardingCompleted,
      onboarding_completed_at: onboardingCompleted
        ? settings?.onboarding_completed_at || now
        : null,
    });

    setSaving(false);

    if (!persistedSettings) {
      toast.error('No se guardó la configuración', 'Hubo un problema al persistir school_settings.');
      return;
    }

    toast.success(
      completeOnboarding ? 'Onboarding completado' : 'Configuración guardada',
      completeOnboarding
        ? 'La escuela ya quedó marcada como operativa.'
        : 'Los ajustes operativos quedaron persistidos en Supabase.',
    );
  };

  if (!schoolId) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] p-5 md:p-8">
        <div className="max-w-5xl mx-auto bg-white rounded-[32px] border border-slate-200 p-10 text-center">
          <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-4" />
          <h1 className="text-2xl font-black text-slate-900">Sin escuela asociada</h1>
          <p className="text-slate-500 mt-3">Pide al Super Admin vincular tu usuario a una escuela antes de continuar.</p>
        </div>
      </div>
    );
  }

  if (platformLoading || loading || !school || !settings) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] p-5 md:p-8">
        <div className="max-w-5xl mx-auto bg-white rounded-[32px] border border-slate-200 p-10">
          <p className="text-[10px] font-black uppercase tracking-[4px] text-slate-400 mb-3">School Setup</p>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Configuración Operativa</h1>
          <p className="text-slate-400 mt-4">Cargando configuración real de la escuela...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-5 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="bg-white rounded-[32px] border border-slate-200 p-8 md:p-10 shadow-sm">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[4px] text-indigo-500 mb-2">School Setup</p>
              <h1 className="text-4xl font-black tracking-tight text-slate-900">Configuración Operativa</h1>
              <p className="text-slate-500 font-medium mt-3 max-w-2xl">
                Ajusta la operación real de {school.name}, completa el onboarding y define qué módulos quedan activos para tu equipo.
              </p>
              {error ? (
                <p className="text-sm text-amber-600 font-bold mt-4">{error}</p>
              ) : null}
            </div>

            <div className="flex flex-wrap gap-3">
              <StatusChip
                label={settings.onboarding_completed || school.onboardingStatus === 'COMPLETED' ? 'Onboarding completo' : 'Onboarding pendiente'}
                tone={settings.onboarding_completed || school.onboardingStatus === 'COMPLETED' ? 'success' : 'warning'}
              />
              {settings.is_demo_school ? <StatusChip label="Escuela demo" tone="neutral" /> : null}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
            <MetricCard icon={<Sparkles size={18} />} label="Progreso setup" value={`${completedChecklist}/5`} helper="Checklist de activación" />
            <MetricCard icon={<Users size={18} />} label="Estudiantes" value={String(school.studentCount || 0)} helper="Base actual registrada" />
            <MetricCard icon={<Store size={18} />} label="Unidades activas" value={String(unitCount)} helper="POS y puntos de venta" />
            <MetricCard icon={<Layers size={18} />} label="Módulos activos" value={String(activeModulesCount)} helper="Capacidades visibles" />
          </div>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-[1.15fr_0.85fr] gap-6">
          <section className="bg-white rounded-[32px] border border-slate-200 p-8 md:p-10 space-y-8 shadow-sm">
            <div className="flex items-center gap-3">
              <Building2 className="w-6 h-6 text-indigo-600" />
              <div>
                <h2 className="text-2xl font-black tracking-tight text-slate-900">Identidad y tesorería</h2>
                <p className="text-slate-500 text-sm">Estos datos alimentan el onboarding real de la escuela y las liquidaciones.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <TextField label="Razón social" value={schoolForm.legalName} onChange={(value) => setSchoolForm((current) => ({ ...current, legalName: value }))} placeholder="Colegio Demo S.C." />
              <TextField label="RFC" value={schoolForm.rfc} onChange={(value) => setSchoolForm((current) => ({ ...current, rfc: value.toUpperCase() }))} placeholder="ABC010101XYZ" />
              <TextField label="CLABE de liquidación" value={schoolForm.settlementCLABE} onChange={(value) => setSchoolForm((current) => ({ ...current, settlementCLABE: value.replace(/[^0-9]/g, '') }))} placeholder="18 dígitos" />
              <TextField label="STP Cost Center" value={schoolForm.stpCostCenter} onChange={(value) => setSchoolForm((current) => ({ ...current, stpCostCenter: value }))} placeholder="Centro de costo" />
              <TextField label="Responsable operativo" value={schoolForm.contactPerson} onChange={(value) => setSchoolForm((current) => ({ ...current, contactPerson: value }))} placeholder="Nombre del responsable" />
              <TextField label="Correo soporte" value={schoolForm.email} onChange={(value) => setSchoolForm((current) => ({ ...current, email: value }))} placeholder="operaciones@colegio.mx" />
              <TextField label="Teléfono soporte" value={schoolForm.phone} onChange={(value) => setSchoolForm((current) => ({ ...current, phone: value }))} placeholder="55 1234 5678" />
              <TextField label="Multiplicador refund → puntos" value={String(settings.pool_points_multiplier)} onChange={() => {}} placeholder="1.0" disabled />
            </div>

            <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[3px] text-slate-400 mb-2">Carga operativa</p>
                <p className="text-slate-800 font-bold">Importa alumnos desde esta pantalla para cerrar el setup sin salir del flujo.</p>
              </div>
              <button
                onClick={() => setShowImportWizard(true)}
                className="px-5 py-3 rounded-2xl bg-slate-900 text-white text-xs font-black uppercase tracking-widest"
              >
                Abrir importación
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Terminal className="w-5 h-5 text-indigo-600" />
                <h3 className="text-lg font-black text-slate-900">Módulos habilitados</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {MODULE_OPTIONS.map((module) => (
                  <ToggleCard
                    key={module.key}
                    label={module.label}
                    description={module.description}
                    active={enabledModules[module.key]}
                    onToggle={() =>
                      setEnabledModules((current) => ({
                        ...current,
                        [module.key]: !current[module.key],
                      }))
                    }
                  />
                ))}
              </div>
            </div>
          </section>

          <div className="space-y-6">
            <section className="bg-white rounded-[32px] border border-slate-200 p-8 space-y-6 shadow-sm">
              <div className="flex items-center gap-3">
                <CreditCard className="w-6 h-6 text-emerald-600" />
                <div>
                  <h2 className="text-2xl font-black tracking-tight text-slate-900">Operación POS</h2>
                  <p className="text-slate-500 text-sm">Define cómo cobra la escuela y qué escenarios operativos soporta.</p>
                </div>
              </div>

              <div>
                <p className="text-[10px] font-black uppercase tracking-[3px] text-slate-400 mb-3">Métodos permitidos</p>
                <div className="flex flex-wrap gap-2">
                  {PAYMENT_METHOD_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      onClick={() =>
                        setOperationalSettings((current) => ({
                          ...current,
                          paymentMethods: toggleListItem(current.paymentMethods, option.value),
                          allowCash:
                            option.value === 'cash'
                              ? !current.paymentMethods.includes('cash')
                              : current.allowCash,
                        }))
                      }
                      className={`px-3 py-2 rounded-2xl text-xs font-black uppercase tracking-wider border ${operationalSettings.paymentMethods.includes(option.value) ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-200 text-slate-500'}`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-[10px] font-black uppercase tracking-[3px] text-slate-400 mb-3">Escenarios de propiedad POS</p>
                <div className="space-y-3">
                  {OWNER_OPTIONS.map((option) => (
                    <ToggleCard
                      key={option.value}
                      label={option.label}
                      description={option.description}
                      active={operationalSettings.ownerScenarios.includes(option.value)}
                      onToggle={() =>
                        setOperationalSettings((current) => ({
                          ...current,
                          ownerScenarios: toggleListItem(current.ownerScenarios, option.value),
                        }))
                      }
                    />
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <ToggleCard
                  label="Permitir efectivo"
                  description="Mantiene visible el método cash en la operación diaria."
                  active={operationalSettings.allowCash}
                  onToggle={() =>
                    setOperationalSettings((current) => ({
                      ...current,
                      allowCash: !current.allowCash,
                      paymentMethods: current.allowCash
                        ? current.paymentMethods.filter((method) => method !== 'cash')
                        : toggleListItem(current.paymentMethods, 'cash'),
                    }))
                  }
                />
                <ToggleCard
                  label="Requerir identificación del alumno"
                  description="Bloquea ventas anónimas para mantener trazabilidad."
                  active={operationalSettings.requireStudentIdentification}
                  onToggle={() =>
                    setOperationalSettings((current) => ({
                      ...current,
                      requireStudentIdentification: !current.requireStudentIdentification,
                    }))
                  }
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TextField
                  label="Umbral saldo bajo"
                  value={String(operationalSettings.lowBalanceThreshold)}
                  onChange={(value) =>
                    setOperationalSettings((current) => ({
                      ...current,
                      lowBalanceThreshold: Number(value) || 0,
                    }))
                  }
                  placeholder="80"
                />
                <TextField
                  label="Correo operacional"
                  value={operationalSettings.supportEmail}
                  onChange={(value) =>
                    setOperationalSettings((current) => ({
                      ...current,
                      supportEmail: value,
                    }))
                  }
                  placeholder="soporte@colegio.mx"
                />
                <TextField
                  label="Teléfono operacional"
                  value={operationalSettings.supportPhone}
                  onChange={(value) =>
                    setOperationalSettings((current) => ({
                      ...current,
                      supportPhone: value,
                    }))
                  }
                  placeholder="55 1234 5678"
                />
                <TextAreaField
                  label="Notas operativas"
                  value={operationalSettings.notes || ''}
                  onChange={(value) =>
                    setOperationalSettings((current) => ({
                      ...current,
                      notes: value,
                    }))
                  }
                  placeholder="Observaciones para soporte, despliegue o QA"
                />
              </div>
            </section>

            <section className="bg-white rounded-[32px] border border-slate-200 p-8 space-y-4 shadow-sm">
              <div className="flex items-center gap-3">
                <Landmark className="w-6 h-6 text-violet-600" />
                <div>
                  <h2 className="text-2xl font-black tracking-tight text-slate-900">Checklist de activación</h2>
                  <p className="text-slate-500 text-sm">La escuela solo debe quedar como completada cuando esto esté resuelto.</p>
                </div>
              </div>

              <div className="space-y-3">
                {checklist.map((item) => (
                  <div key={item.label} className="flex items-start gap-3 rounded-2xl border border-slate-100 p-4 bg-slate-50">
                    {item.complete ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-0.5" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5" />
                    )}
                    <div>
                      <p className="text-sm font-black text-slate-800">{item.label}</p>
                      <p className="text-xs text-slate-500 mt-1">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-3 pt-3 md:flex-row">
                <button
                  onClick={() => void handleSave(false)}
                  disabled={saving}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-4 rounded-2xl bg-slate-900 text-white text-xs font-black uppercase tracking-widest disabled:opacity-60"
                >
                  <Save size={14} /> Guardar configuración
                </button>
                <button
                  onClick={() => void handleSave(true)}
                  disabled={saving || !canCompleteOnboarding}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-4 rounded-2xl bg-indigo-600 text-white text-xs font-black uppercase tracking-widest disabled:opacity-60"
                >
                  <CheckCircle2 size={14} /> Completar onboarding
                </button>
              </div>
            </section>
          </div>
        </div>
      </div>

      {showImportWizard ? (
        <StudentImportWizard
          schoolId={schoolId}
          stpCostCenter={schoolForm.stpCostCenter || school.stpCostCenter || ''}
          onComplete={() => {
            setShowImportWizard(false);
            toast.info('Importación finalizada', 'Revisa la base estudiantil para confirmar altas y validaciones.');
          }}
          onCancel={() => setShowImportWizard(false)}
        />
      ) : null}
    </div>
  );
}

function MetricCard({ icon, label, value, helper }: { icon: React.ReactNode; label: string; value: string; helper: string }) {
  return (
    <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
      <div className="flex items-center gap-2 text-slate-500 text-[10px] uppercase tracking-[3px] font-black mb-3">
        <span className="text-indigo-600">{icon}</span>
        {label}
      </div>
      <p className="text-3xl font-black text-slate-900 tracking-tight">{value}</p>
      <p className="text-xs text-slate-400 mt-2">{helper}</p>
    </div>
  );
}

function StatusChip({ label, tone }: { label: string; tone: 'success' | 'warning' | 'neutral' }) {
  const className =
    tone === 'success'
      ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
      : tone === 'warning'
        ? 'bg-amber-50 text-amber-700 border-amber-100'
        : 'bg-slate-100 text-slate-600 border-slate-200';

  return (
    <span className={`inline-flex items-center px-4 py-2 rounded-2xl border text-[10px] font-black uppercase tracking-widest ${className}`}>
      {label}
    </span>
  );
}

function TextField({
  label,
  value,
  onChange,
  placeholder,
  disabled = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}) {
  const fieldId = `school-settings-${label.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <div className="space-y-2">
      <label htmlFor={fieldId} className="text-[10px] font-black uppercase tracking-[3px] text-slate-400">
        {label}
      </label>
      <input
        id={fieldId}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-100 disabled:opacity-60"
      />
    </div>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  const fieldId = `school-settings-${label.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <div className="space-y-2 md:col-span-2">
      <label htmlFor={fieldId} className="text-[10px] font-black uppercase tracking-[3px] text-slate-400">
        {label}
      </label>
      <textarea
        id={fieldId}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        rows={4}
        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-100"
      />
    </div>
  );
}

function ToggleCard({
  label,
  description,
  active,
  onToggle,
}: {
  label: string;
  description: string;
  active: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className={`w-full text-left rounded-[24px] border p-4 transition-all ${active ? 'border-indigo-200 bg-indigo-50' : 'border-slate-200 bg-white hover:bg-slate-50'}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-black text-slate-800">{label}</p>
          <p className="text-xs text-slate-500 mt-1">{description}</p>
        </div>
        <div className={`mt-1 h-6 w-11 rounded-full p-1 transition-all ${active ? 'bg-indigo-600' : 'bg-slate-200'}`}>
          <div className={`h-4 w-4 rounded-full bg-white transition-all ${active ? 'translate-x-5' : 'translate-x-0'}`} />
        </div>
      </div>
    </button>
  );
}