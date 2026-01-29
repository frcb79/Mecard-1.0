
import React, { useState } from 'react';
import { Upload, CheckCircle, AlertCircle, Download, FileText, Users, X, ArrowRight } from 'lucide-react';
import { StudentImportService, ValidationResult, ImportResult } from '../services/studentImportService';
import { Button } from './Button';
import { StudentProfile } from '../types';

interface StudentImportWizardProps {
  schoolId: string;
  stpCostCenter: string;
  existingStudents: StudentProfile[];
  onComplete: (newStudents: StudentProfile[]) => void;
  onCancel: () => void;
}

export const StudentImportWizard: React.FC<StudentImportWizardProps> = ({
  schoolId,
  stpCostCenter,
  existingStudents,
  onComplete,
  onCancel
}) => {
  const [step, setStep] = useState<'upload' | 'validate' | 'import' | 'complete'>('upload');
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFileUpload = async (file: File) => {
    setLoading(true);
    try {
      const rows = await StudentImportService.parseCSV(file);
      const results = await StudentImportService.validateRows(rows, existingStudents);
      setValidationResults(results);
      setStep('validate');
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmImport = async () => {
    setLoading(true);
    setStep('import');
    try {
      const validRows = validationResults.filter(r => r.valid);
      const result = await StudentImportService.importStudents(validRows, schoolId, stpCostCenter);
      setImportResult(result);
      setStep('complete');
    } catch (error: any) {
      alert(`Error en importación: ${error.message}`);
      setStep('validate');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadTemplate = () => {
    const template = StudentImportService.generateTemplate();
    const blob = new Blob([template], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'plantilla_alumnos_mecard.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const validCount = validationResults.filter(r => r.valid).length;
  const invalidCount = validationResults.filter(r => !r.valid).length;

  return (
    <div className="fixed inset-0 z-[150] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-6">
      <div className="bg-white rounded-[64px] shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col relative animate-in zoom-in duration-300">
        <button onClick={onCancel} className="absolute top-10 right-10 text-slate-300 hover:text-slate-800 z-10">
          <X size={32} />
        </button>

        {/* Wizard Header */}
        <div className="p-12 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-4 mb-8">
            <div className="bg-indigo-600 p-3 rounded-2xl text-white">
              <Users size={24} />
            </div>
            <div>
              <h2 className="text-3xl font-black text-slate-800 tracking-tighter">Importar Base Estudiantil</h2>
              <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[4px]">Paso {step === 'upload' ? 1 : step === 'validate' ? 2 : step === 'import' ? 3 : 4} de 4</p>
            </div>
          </div>

          {/* Stepper Visual */}
          <div className="flex gap-2">
            {['upload', 'validate', 'import', 'complete'].map((s, idx) => (
              <div key={s} className={`h-2 flex-1 rounded-full transition-all duration-500 ${
                (step === s) || (idx < ['upload', 'validate', 'import', 'complete'].indexOf(step)) 
                ? 'bg-indigo-600' : 'bg-slate-100'
              }`} />
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-12">
          {step === 'upload' && (
            <div className="space-y-10 animate-in slide-in-from-bottom-4 duration-500">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="bg-indigo-50/50 p-10 rounded-[48px] border border-indigo-100 flex flex-col justify-between">
                  <div>
                    <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-50 mb-6">
                      <FileText size={32} />
                    </div>
                    <h3 className="text-2xl font-black text-slate-800 tracking-tight mb-3">Plantilla de Datos</h3>
                    <p className="text-slate-500 text-sm leading-relaxed mb-8">
                      Para asegurar una importación correcta, utiliza nuestra plantilla oficial. Contiene los encabezados necesarios para validar CURPs, Tutores y Límites.
                    </p>
                  </div>
                  <button onClick={handleDownloadTemplate} className="flex items-center justify-center gap-3 w-full py-5 bg-white border-2 border-indigo-600 text-indigo-600 rounded-3xl font-black uppercase text-[11px] tracking-widest hover:bg-indigo-50 transition-all">
                    <Download size={18} /> Descargar Plantilla .CSV
                  </button>
                </div>

                <div 
                  className="border-4 border-dashed border-slate-200 rounded-[48px] p-12 flex flex-col items-center justify-center text-center hover:border-indigo-400 transition-all bg-slate-50/50 cursor-pointer group"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const file = e.dataTransfer.files[0];
                    if (file) handleFileUpload(file);
                  }}
                  onClick={() => document.getElementById('wizard-file')?.click()}
                >
                  <div className="w-20 h-20 bg-white rounded-[32px] flex items-center justify-center text-slate-300 group-hover:text-indigo-600 shadow-sm transition-all mb-6">
                    <Upload size={40} />
                  </div>
                  <h3 className="text-xl font-black text-slate-800 mb-2">Sube tu Archivo</h3>
                  <p className="text-slate-400 text-sm mb-6">Arrastra tu archivo Excel o CSV aquí</p>
                  <span className="bg-white px-4 py-2 rounded-xl text-[9px] font-black text-slate-400 border border-slate-100 uppercase tracking-widest">Formatos: CSV, XLSX</span>
                  <input type="file" id="wizard-file" hidden accept=".csv,.xlsx" onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])} />
                </div>
              </div>

              {loading && (
                <div className="flex items-center justify-center gap-4 py-10 animate-pulse">
                  <div className="w-6 h-6 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-indigo-600 font-black uppercase text-[10px] tracking-widest">Procesando estructura de datos...</p>
                </div>
              )}
            </div>
          )}

          {step === 'validate' && (
            <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
              <div className="grid grid-cols-3 gap-6">
                <ValidationCard title="Registros" value={validationResults.length} icon={<Users />} color="slate" />
                <ValidationCard title="Válidos" value={validCount} icon={<CheckCircle />} color="emerald" />
                <ValidationCard title="Con Error" value={invalidCount} icon={<AlertCircle />} color="rose" />
              </div>

              <div className="bg-white rounded-[40px] border border-slate-100 shadow-inner overflow-hidden max-h-80 overflow-y-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 sticky top-0 font-black text-[10px] text-slate-400 uppercase tracking-widest">
                    <tr>
                      <th className="p-6">Fila</th>
                      <th className="p-6">Alumno</th>
                      <th className="p-6">CURP</th>
                      <th className="p-6">Validación</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {validationResults.map((r, i) => (
                      <tr key={i} className={`hover:bg-slate-50/50 ${!r.valid ? 'bg-rose-50/20' : ''}`}>
                        <td className="p-6 font-mono text-xs text-slate-400">{r.row}</td>
                        <td className="p-6 font-black text-slate-700 text-sm">{r.data?.nombre_completo || 'N/A'}</td>
                        <td className="p-6 font-mono text-xs text-slate-500 uppercase">{r.data?.curp || 'N/A'}</td>
                        <td className="p-6">
                          {r.valid ? (
                            <span className="text-emerald-600 flex items-center gap-2 text-[10px] font-black uppercase"><CheckCircle size={14} /> Listo</span>
                          ) : (
                            <div className="text-rose-500 text-[10px] font-bold uppercase space-y-1">
                              {r.errors.map((e, ei) => <p key={ei}>• {e}</p>)}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex gap-4 pt-6">
                <button onClick={() => setStep('upload')} className="flex-1 py-6 bg-slate-100 text-slate-500 rounded-3xl font-black uppercase text-[11px] tracking-widest hover:bg-slate-200 transition-all">Re-subir Archivo</button>
                <Button disabled={validCount === 0 || loading} onClick={handleConfirmImport} className="flex-[2] py-6 rounded-3xl bg-indigo-600 font-black uppercase text-[11px] tracking-widest shadow-2xl">
                  {loading ? 'Importando...' : `Importar ${validCount} Alumnos`}
                </Button>
              </div>
            </div>
          )}

          {step === 'import' && (
            <div className="flex-1 flex flex-col items-center justify-center py-20 text-center animate-in fade-in duration-700">
               <div className="w-24 h-24 border-8 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-8"></div>
               <h3 className="text-3xl font-black text-slate-800 tracking-tight">Creando Infraestructura de Cuentas</h3>
               <p className="text-slate-400 font-medium max-w-md mt-4">Estamos generando las CLABEs STP, perfiles parentales y monederos digitales para los nuevos alumnos.</p>
            </div>
          )}

          {step === 'complete' && importResult && (
            <div className="flex-1 flex flex-col items-center text-center animate-in zoom-in duration-500">
               <div className="bg-emerald-100 w-28 h-28 rounded-[40px] flex items-center justify-center text-emerald-600 mb-10 shadow-xl shadow-emerald-100 border-4 border-white">
                 <CheckCircle size={56} />
               </div>
               <h2 className="text-4xl font-black text-slate-800 tracking-tighter mb-4">¡Importación Completada!</h2>
               <p className="text-slate-500 font-medium text-lg mb-12">La base de datos del colegio ha sido actualizada exitosamente.</p>
               
               <div className="grid grid-cols-2 gap-6 w-full max-w-lg mb-12">
                  <div className="bg-slate-50 p-8 rounded-[40px] border border-slate-100">
                    <p className="text-4xl font-black text-indigo-600 tracking-tighter">{importResult.studentsCreated}</p>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Alumnos Creados</p>
                  </div>
                  <div className="bg-slate-50 p-8 rounded-[40px] border border-slate-100">
                    <p className="text-4xl font-black text-emerald-600 tracking-tighter">{importResult.parentsCreated}</p>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Padres Vinculados</p>
                  </div>
               </div>

               <Button onClick={() => onComplete(importResult.newStudents)} className="w-full max-w-sm py-7 rounded-[32px] bg-slate-900 text-white font-black text-[12px] uppercase tracking-widest shadow-2xl">Cerrar y Ver Directorio</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ValidationCard = ({ title, value, icon, color }: any) => {
  const themes: any = {
    slate: 'bg-slate-50 border-slate-100 text-slate-800',
    emerald: 'bg-emerald-50 border-emerald-100 text-emerald-700',
    rose: 'bg-rose-50 border-rose-100 text-rose-700'
  };
  return (
    <div className={`p-8 rounded-[40px] border flex items-center justify-between ${themes[color]}`}>
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2">{title}</p>
        <p className="text-4xl font-black tracking-tighter">{value}</p>
      </div>
      <div className="opacity-40">{React.cloneElement(icon, { size: 32 })}</div>
    </div>
  );
};
