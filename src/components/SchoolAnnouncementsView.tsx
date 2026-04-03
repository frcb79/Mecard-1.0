/**
 * SchoolAnnouncementsView — Circulares y Avisos Escolares
 * CRUD de circulares, targeting por audiencia, prioridad, estadísticas de lectura
 */

import React, { useState, useMemo } from 'react';
import {
  Megaphone, Plus, Edit2, Trash2, X, Eye, Send, AlertTriangle, Info, AlertOctagon,
  Users, GraduationCap, Calendar, Clock, ChevronRight, Search
} from 'lucide-react';
import { SchoolAnnouncement, AnnouncementPriority } from '../types';
import { MOCK_ANNOUNCEMENTS } from '../constants';
import { useToast } from './ui/Toast';
import { useAuth } from '../hooks/useAuth';

const PRIORITY_CONFIG: Record<AnnouncementPriority, { label: string; color: string; bg: string; border: string; icon: React.ReactNode }> = {
  [AnnouncementPriority.INFO]: { label: 'Informativo', color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-100', icon: <Info size={16} /> },
  [AnnouncementPriority.URGENT]: { label: 'Urgente', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100', icon: <AlertTriangle size={16} /> },
  [AnnouncementPriority.EMERGENCY]: { label: 'Emergencia', color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-100', icon: <AlertOctagon size={16} /> },
};

export default function SchoolAnnouncementsView() {
  const toast = useToast();
  const { user } = useAuth();
  const schoolId = user?.schoolId || '';
  const [announcements, setAnnouncements] = useState<SchoolAnnouncement[]>(MOCK_ANNOUNCEMENTS);
  const [showModal, setShowModal] = useState(false);
  const [editingAnn, setEditingAnn] = useState<SchoolAnnouncement | null>(null);
  const [previewAnn, setPreviewAnn] = useState<SchoolAnnouncement | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [form, setForm] = useState({
    title: '', body: '', priority: AnnouncementPriority.INFO,
    audienceType: 'all' as 'all' | 'grades' | 'groups',
    targets: '', expiresAt: '',
  });

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return announcements;
    const q = searchQuery.toLowerCase();
    return announcements.filter(a => a.title.toLowerCase().includes(q) || a.body.toLowerCase().includes(q));
  }, [announcements, searchQuery]);

  const openCreate = () => {
    setEditingAnn(null);
    setForm({ title: '', body: '', priority: AnnouncementPriority.INFO, audienceType: 'all', targets: '', expiresAt: '' });
    setShowModal(true);
  };

  const openEdit = (ann: SchoolAnnouncement) => {
    setEditingAnn(ann);
    setForm({
      title: ann.title, body: ann.body, priority: ann.priority,
      audienceType: ann.audience.type, targets: ann.audience.targets?.join(', ') || '',
      expiresAt: ann.expiresAt?.slice(0, 10) || '',
    });
    setShowModal(true);
  };

  const saveAnnouncement = () => {
    if (!form.title.trim() || !form.body.trim()) { toast.warning('Requerido', 'Título y contenido son obligatorios'); return; }
    const now = new Date().toISOString();
    const annData: SchoolAnnouncement = {
      id: editingAnn?.id || `ann_${Date.now()}`,
      schoolId, title: form.title.trim(), body: form.body.trim(), priority: form.priority,
      audience: form.audienceType === 'all' ? { type: 'all' } : { type: form.audienceType, targets: form.targets.split(',').map(t => t.trim()).filter(Boolean) },
      publishedAt: editingAnn?.publishedAt || now,
      expiresAt: form.expiresAt ? `${form.expiresAt}T23:59:59Z` : undefined,
      createdBy: 'Admin Escolar',
      readByCount: editingAnn?.readByCount || 0,
      totalRecipients: editingAnn?.totalRecipients || 120,
    };
    if (editingAnn) {
      setAnnouncements(announcements.map(a => a.id === editingAnn.id ? annData : a));
      toast.info('Actualizado', 'Circular actualizada');
    } else {
      setAnnouncements([annData, ...announcements]);
      toast.info('Publicada', 'Circular enviada a los destinatarios');
    }
    setShowModal(false);
  };

  const deleteAnnouncement = () => {
    if (deleteConfirm) {
      setAnnouncements(announcements.filter(a => a.id !== deleteConfirm));
      toast.info('Eliminada', 'Circular eliminada');
      setDeleteConfirm(null);
    }
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-5 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter flex items-center gap-3">
              <Megaphone className="w-9 h-9 text-indigo-600" /> Circulares y Avisos
            </h1>
            <p className="text-slate-400 font-bold text-sm mt-1">Comunica avisos a padres de familia y comunidad escolar</p>
          </div>
          <button onClick={openCreate} className="flex items-center gap-2 bg-indigo-600 text-white px-8 py-4 rounded-[24px] font-black text-[10px] uppercase tracking-widest shadow-lg hover:bg-indigo-700 transition-all">
            <Plus size={18} /> Nueva Circular
          </button>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-3 gap-6">
          {Object.entries(PRIORITY_CONFIG).map(([key, config]) => {
            const count = announcements.filter(a => a.priority === key).length;
            return (
              <div key={key} className={`bg-white p-6 rounded-[32px] border ${config.border} shadow-sm`}>
                <div className={`flex items-center gap-2 ${config.color} mb-2`}>
                  {config.icon}
                  <span className="text-[10px] font-black uppercase tracking-widest">{config.label}</span>
                </div>
                <p className={`text-2xl font-black tracking-tighter ${config.color}`}>{count}</p>
              </div>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" />
          <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Buscar circulares..."
            className="w-full pl-14 pr-6 py-4 bg-white rounded-2xl border border-slate-100 outline-none font-bold text-sm text-slate-700 focus:ring-4 focus:ring-indigo-100 shadow-sm" />
        </div>

        {/* Announcements List */}
        <div className="space-y-4">
          {filtered.map(ann => {
            const pc = PRIORITY_CONFIG[ann.priority];
            const readPercent = ann.totalRecipients > 0 ? Math.round((ann.readByCount / ann.totalRecipients) * 100) : 0;

            return (
              <div key={ann.id} className={`bg-white rounded-[32px] p-8 border ${pc.border} shadow-sm hover:shadow-md transition-all`}>
                <div className="flex items-start gap-6">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${pc.bg} ${pc.color} flex-shrink-0 mt-1`}>{pc.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${pc.bg} ${pc.color}`}>{pc.label}</span>
                      <span className="text-[10px] text-slate-300 font-bold">{formatDate(ann.publishedAt)}</span>
                      {ann.expiresAt && (
                        <span className="text-[10px] text-slate-300 font-bold flex items-center gap-1"><Clock size={10} /> Expira: {new Date(ann.expiresAt).toLocaleDateString('es-MX')}</span>
                      )}
                    </div>
                    <h3 className="text-lg font-black text-slate-800 tracking-tight mb-2">{ann.title}</h3>
                    <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed">{ann.body}</p>

                    <div className="flex items-center gap-6 mt-4">
                      <div className="flex items-center gap-2">
                        {ann.audience.type === 'all' ? (
                          <><Users size={14} className="text-slate-300" /><span className="text-[10px] font-bold text-slate-400">Todos</span></>
                        ) : (
                          <><GraduationCap size={14} className="text-slate-300" /><span className="text-[10px] font-bold text-slate-400">{ann.audience.targets?.join(', ')}</span></>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Eye size={14} className="text-slate-300" />
                        <span className="text-[10px] font-bold text-slate-400">{ann.readByCount}/{ann.totalRecipients} leído ({readPercent}%)</span>
                      </div>
                      <span className="text-[10px] font-bold text-slate-300">Por: {ann.createdBy}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button onClick={() => setPreviewAnn(ann)} className="p-2.5 text-slate-300 hover:text-indigo-600 rounded-xl hover:bg-indigo-50 transition-all" title="Ver"><Eye size={16} /></button>
                    <button onClick={() => openEdit(ann)} className="p-2.5 text-slate-300 hover:text-indigo-600 rounded-xl hover:bg-indigo-50 transition-all" title="Editar"><Edit2 size={16} /></button>
                    <button onClick={() => setDeleteConfirm(ann.id)} className="p-2.5 text-slate-300 hover:text-rose-500 rounded-xl hover:bg-rose-50 transition-all" title="Eliminar"><Trash2 size={16} /></button>
                  </div>
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div className="bg-white rounded-[32px] p-16 text-center opacity-30 border border-slate-100">
              <Megaphone size={48} className="mx-auto mb-4" />
              <p className="font-black uppercase tracking-widest text-xs">No hay circulares</p>
            </div>
          )}
        </div>
      </div>

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-6">
          <div className="bg-white rounded-[32px] p-12 w-full max-w-lg shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setShowModal(false)} className="absolute top-8 right-8 text-slate-300 hover:text-slate-800"><X size={28} /></button>
            <h3 className="text-2xl font-black text-slate-800 tracking-tighter mb-8">{editingAnn ? 'Editar Circular' : 'Nueva Circular'}</h3>
            <div className="space-y-5">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Título *</label>
                <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Ej: Junta de Padres de Familia"
                  className="w-full p-4 bg-slate-50 rounded-2xl border-none outline-none font-bold text-slate-700 focus:ring-4 focus:ring-indigo-100" />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Contenido *</label>
                <textarea value={form.body} onChange={e => setForm({ ...form, body: e.target.value })} rows={6} placeholder="Escribe el contenido de la circular..."
                  className="w-full p-4 bg-slate-50 rounded-2xl border-none outline-none font-bold text-slate-700 focus:ring-4 focus:ring-indigo-100 resize-none" />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Prioridad</label>
                <div className="flex gap-2">
                  {Object.entries(PRIORITY_CONFIG).map(([key, config]) => (
                    <button key={key} onClick={() => setForm({ ...form, priority: key as AnnouncementPriority })}
                      className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-bold transition-all ${form.priority === key ? `${config.bg} ${config.color} ring-2 ring-current` : 'bg-slate-50 text-slate-400'}`}>
                      {config.icon} {config.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Audiencia</label>
                <div className="flex gap-2 mb-3">
                  <button onClick={() => setForm({ ...form, audienceType: 'all' })} className={`px-5 py-3 rounded-xl text-xs font-bold transition-all ${form.audienceType === 'all' ? 'bg-indigo-600 text-white' : 'bg-slate-50 text-slate-400'}`}>Todos</button>
                  <button onClick={() => setForm({ ...form, audienceType: 'grades' })} className={`px-5 py-3 rounded-xl text-xs font-bold transition-all ${form.audienceType === 'grades' ? 'bg-indigo-600 text-white' : 'bg-slate-50 text-slate-400'}`}>Por grados</button>
                  <button onClick={() => setForm({ ...form, audienceType: 'groups' })} className={`px-5 py-3 rounded-xl text-xs font-bold transition-all ${form.audienceType === 'groups' ? 'bg-indigo-600 text-white' : 'bg-slate-50 text-slate-400'}`}>Por grupos</button>
                </div>
                {form.audienceType !== 'all' && (
                  <input value={form.targets} onChange={e => setForm({ ...form, targets: e.target.value })}
                    placeholder={form.audienceType === 'grades' ? '1° Primaria, 2° Primaria' : 'A, B, C'}
                    className="w-full p-4 bg-slate-50 rounded-2xl border-none outline-none font-bold text-slate-700 focus:ring-4 focus:ring-indigo-100" />
                )}
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Fecha de expiración (opcional)</label>
                <input type="date" value={form.expiresAt} onChange={e => setForm({ ...form, expiresAt: e.target.value })}
                  className="w-full p-4 bg-slate-50 rounded-2xl border-none outline-none font-bold text-slate-700 focus:ring-4 focus:ring-indigo-100" />
              </div>
              <button onClick={saveAnnouncement} className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-[2px] shadow-lg hover:bg-indigo-700 transition-all flex items-center justify-center gap-2">
                <Send size={16} /> {editingAnn ? 'Guardar Cambios' : 'Publicar Circular'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewAnn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-6">
          <div className="bg-white rounded-[32px] p-12 w-full max-w-lg shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setPreviewAnn(null)} className="absolute top-8 right-8 text-slate-300 hover:text-slate-800"><X size={28} /></button>
            <div className="mb-6">
              <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${PRIORITY_CONFIG[previewAnn.priority].bg} ${PRIORITY_CONFIG[previewAnn.priority].color}`}>
                {PRIORITY_CONFIG[previewAnn.priority].label}
              </span>
            </div>
            <h3 className="text-2xl font-black text-slate-800 tracking-tighter mb-4">{previewAnn.title}</h3>
            <div className="flex items-center gap-4 text-[10px] text-slate-400 font-bold mb-6">
              <span className="flex items-center gap-1"><Calendar size={12} /> {formatDate(previewAnn.publishedAt)}</span>
              <span>Por: {previewAnn.createdBy}</span>
            </div>
            <div className="prose prose-slate prose-sm max-w-none">
              {previewAnn.body.split('\n').map((line, i) => (
                <p key={i} className="text-slate-600 leading-relaxed mb-2">{line || <br />}</p>
              ))}
            </div>
            <div className="mt-8 pt-6 border-t border-slate-100 flex items-center gap-4 text-[10px] text-slate-400 font-bold">
              {previewAnn.audience.type === 'all' ? (
                <span className="flex items-center gap-1"><Users size={12} /> Para: Todos</span>
              ) : (
                <span className="flex items-center gap-1"><GraduationCap size={12} /> Para: {previewAnn.audience.targets?.join(', ')}</span>
              )}
              <span className="flex items-center gap-1"><Eye size={12} /> {previewAnn.readByCount}/{previewAnn.totalRecipients} leído</span>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-6">
          <div className="bg-white rounded-[32px] p-10 w-full max-w-sm shadow-2xl text-center">
            <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center mx-auto mb-6"><AlertTriangle size={32} className="text-rose-500" /></div>
            <h3 className="text-xl font-black text-slate-800 tracking-tight mb-2">¿Eliminar circular?</h3>
            <p className="text-sm text-slate-500 mb-8">Esta acción no se puede deshacer.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold text-xs">Cancelar</button>
              <button onClick={deleteAnnouncement} className="flex-1 py-4 bg-rose-500 text-white rounded-2xl font-bold text-xs hover:bg-rose-600 transition-all">Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
