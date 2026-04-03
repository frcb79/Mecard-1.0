/**
 * CustomRolesManager — Gestión de Roles Personalizados
 * CRUD roles, asignación de permisos por grupo, badges de sistema vs custom
 */

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  Shield, Plus, Edit2, Trash2, X, Check, Users, Lock, Unlock,
  ChevronDown, ChevronRight, Settings
} from 'lucide-react';
import { CustomRole, AppPermission, UserRole } from '../types';
import { RoleService, PERMISSION_LABELS, PERMISSION_GROUPS } from '../services/RoleService';
import { useToast } from './ui/Toast';
import { useAuth } from '../hooks/useAuth';

const BASE_ROLE_LABELS: Record<string, string> = {
  [UserRole.SCHOOL_ADMIN]: 'Director Escolar',
  [UserRole.SCHOOL_FINANCE]: 'Finanzas',
  [UserRole.UNIT_MANAGER]: 'Gerente Unidad',
  [UserRole.CASHIER]: 'Cajero',
  [UserRole.CAFETERIA_STAFF]: 'Staff Cafetería',
  [UserRole.STATIONERY_STAFF]: 'Staff Papelería',
  [UserRole.POS_OPERATOR]: 'Operador POS',
};

export default function CustomRolesManager() {
  const toast = useToast();
  const { user } = useAuth();
  const schoolId = user?.schoolId || '';

  const [roles, setRoles] = useState<CustomRole[]>(() => RoleService.getRoles(schoolId));
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<CustomRole | null>(null);
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);

  // Form state
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formBase, setFormBase] = useState<UserRole>(UserRole.CASHIER);
  const [formColor, setFormColor] = useState('#6366f1');
  const [formPerms, setFormPerms] = useState<Set<AppPermission>>(new Set());

  const stats = useMemo(() => RoleService.getStats(schoolId), [roles, schoolId]);

  const reload = useCallback(() => setRoles(RoleService.getRoles(schoolId)), [schoolId]);

  useEffect(() => {
    reload();
  }, [reload]);

  const openAdd = () => {
    setEditing(null);
    setFormName(''); setFormDesc(''); setFormBase(UserRole.CASHIER); setFormColor('#6366f1');
    setFormPerms(new Set());
    setShowModal(true);
  };

  const openEdit = (role: CustomRole) => {
    setEditing(role);
    setFormName(role.name); setFormDesc(role.description); setFormBase(role.baseRole); setFormColor(role.color);
    setFormPerms(new Set(role.permissions));
    setShowModal(true);
  };

  const togglePerm = (p: AppPermission) => {
    setFormPerms(prev => {
      const next = new Set(prev);
      next.has(p) ? next.delete(p) : next.add(p);
      return next;
    });
  };

  const toggleGroup = (permissions: AppPermission[]) => {
    const allSelected = permissions.every(p => formPerms.has(p));
    setFormPerms(prev => {
      const next = new Set(prev);
      permissions.forEach(p => allSelected ? next.delete(p) : next.add(p));
      return next;
    });
  };

  const saveRole = () => {
    if (!formName.trim()) { toast.warning('Requerido', 'El nombre es obligatorio'); return; }
    const data: CustomRole = {
      id: editing?.id || `role_${Date.now()}`,
      schoolId,
      name: formName.trim(),
      description: formDesc.trim(),
      baseRole: formBase,
      permissions: Array.from(formPerms),
      isSystem: editing?.isSystem ?? false,
      color: formColor,
      createdAt: editing?.createdAt || new Date().toISOString().slice(0, 10),
      updatedAt: new Date().toISOString().slice(0, 10),
    };
    if (editing) { RoleService.updateRole(data); toast.info('Actualizado', `Rol "${data.name}" actualizado`); }
    else { RoleService.createRole(data); toast.info('Creado', `Rol "${data.name}" creado`); }
    reload();
    setShowModal(false);
  };

  const deleteRole = (role: CustomRole) => {
    if (role.isSystem) { toast.warning('No permitido', 'No puedes eliminar roles de sistema'); return; }
    if (RoleService.deleteRole(role.id)) {
      toast.info('Eliminado', `Rol "${role.name}" eliminado`);
      reload();
    }
  };

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50/30 p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter flex items-center gap-3">
              <Shield className="w-9 h-9 text-indigo-600" /> Roles y Permisos
            </h1>
            <p className="text-slate-400 font-bold text-sm mt-1">Configura roles personalizados con permisos granulares</p>
          </div>
          <button onClick={openAdd} className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-[2px] hover:bg-indigo-700 transition-all shadow-lg">
            <Plus size={16} /> Nuevo Rol
          </button>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-[32px] border border-indigo-100 shadow-sm">
            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[3px] mb-1">Total Roles</p>
            <p className="text-2xl font-black text-indigo-600 tracking-tighter">{stats.totalRoles}</p>
          </div>
          <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[3px] mb-1">De Sistema</p>
            <p className="text-2xl font-black text-slate-600 tracking-tighter">{stats.systemRoles}</p>
          </div>
          <div className="bg-white p-6 rounded-[32px] border border-purple-100 shadow-sm">
            <p className="text-[10px] font-black text-purple-400 uppercase tracking-[3px] mb-1">Personalizados</p>
            <p className="text-2xl font-black text-purple-600 tracking-tighter">{stats.customRoles}</p>
          </div>
        </div>

        {/* Roles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {roles.map(role => (
            <div key={role.id} className="bg-white rounded-[32px] p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: role.color + '20', color: role.color }}>
                    {role.isSystem ? <Lock size={18} /> : <Shield size={18} />}
                  </div>
                  <div>
                    <h3 className="font-black text-slate-800 text-sm tracking-tight">{role.name}</h3>
                    <p className="text-[10px] text-slate-400">{role.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {role.isSystem && (
                    <span className="px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest bg-slate-100 text-slate-400 mr-1">Sistema</span>
                  )}
                  <button onClick={() => openEdit(role)} className="p-2 hover:bg-slate-50 rounded-xl transition-all">
                    <Edit2 size={14} className="text-slate-400" />
                  </button>
                  {!role.isSystem && (
                    <button onClick={() => deleteRole(role)} className="p-2 hover:bg-rose-50 rounded-xl transition-all">
                      <Trash2 size={14} className="text-rose-400" />
                    </button>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Base:</span>
                <span className="px-2 py-0.5 rounded-lg text-[9px] font-black bg-indigo-50 text-indigo-600">
                  {BASE_ROLE_LABELS[role.baseRole] || role.baseRole}
                </span>
              </div>
              <div className="flex flex-wrap gap-1">
                {role.permissions.slice(0, 6).map(p => (
                  <span key={p} className="px-2 py-0.5 rounded text-[8px] font-bold bg-slate-50 text-slate-500 truncate max-w-[130px]">
                    {PERMISSION_LABELS[p]}
                  </span>
                ))}
                {role.permissions.length > 6 && (
                  <span className="px-2 py-0.5 rounded text-[8px] font-black bg-indigo-50 text-indigo-500">
                    +{role.permissions.length - 6} más
                  </span>
                )}
              </div>
              <div className="mt-3 pt-3 border-t border-slate-50 flex justify-between">
                <span className="text-[9px] text-slate-300">{role.permissions.length} permisos</span>
                <span className="text-[9px] text-slate-300">Actualizado: {role.updatedAt}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-6">
          <div className="bg-white rounded-[40px] p-10 w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black text-slate-800 tracking-tighter">
                {editing ? 'Editar Rol' : 'Nuevo Rol'}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 rounded-xl"><X size={18} /></button>
            </div>

            {/* Name & Description */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Nombre</label>
                <input value={formName} onChange={e => setFormName(e.target.value)} placeholder="Ej: Coordinador Académico"
                  className="w-full p-3.5 bg-slate-50 rounded-2xl outline-none font-bold text-slate-700 focus:ring-4 focus:ring-indigo-100" />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Rol Base</label>
                <select value={formBase} onChange={e => setFormBase(e.target.value as UserRole)}
                  className="w-full p-3.5 bg-slate-50 rounded-2xl outline-none font-bold text-slate-700">
                  {Object.entries(BASE_ROLE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Descripción</label>
              <input value={formDesc} onChange={e => setFormDesc(e.target.value)} placeholder="Descripción breve del rol"
                className="w-full p-3.5 bg-slate-50 rounded-2xl outline-none font-bold text-slate-700 focus:ring-4 focus:ring-indigo-100" />
            </div>

            {/* Color */}
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Color</label>
              <div className="flex gap-2">
                {COLORS.map(c => (
                  <button key={c} onClick={() => setFormColor(c)}
                    className={`w-8 h-8 rounded-xl transition-all ${formColor === c ? 'ring-4 ring-offset-2 ring-indigo-200 scale-110' : 'hover:scale-105'}`}
                    style={{ backgroundColor: c }} />
                ))}
              </div>
            </div>

            {/* Permissions by Group */}
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">
                Permisos ({formPerms.size} seleccionados)
              </label>
              <div className="space-y-2">
                {PERMISSION_GROUPS.map(group => {
                  const isExpanded = expandedGroup === group.label;
                  const selectedCount = group.permissions.filter(p => formPerms.has(p)).length;
                  const allSelected = selectedCount === group.permissions.length;
                  return (
                    <div key={group.label} className="bg-slate-50 rounded-2xl overflow-hidden">
                      <button onClick={() => setExpandedGroup(isExpanded ? null : group.label)}
                        className="w-full flex items-center justify-between p-4 hover:bg-slate-100 transition-all text-left">
                        <div className="flex items-center gap-3">
                          {isExpanded ? <ChevronDown size={14} className="text-slate-400" /> : <ChevronRight size={14} className="text-slate-400" />}
                          <span className="text-xs font-black text-slate-700">{group.label}</span>
                          <span className="text-[9px] font-bold text-slate-400">{selectedCount}/{group.permissions.length}</span>
                        </div>
                        <button onClick={e => { e.stopPropagation(); toggleGroup(group.permissions); }}
                          className={`px-3 py-1 rounded-xl text-[9px] font-black uppercase transition-all ${allSelected ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-200 text-slate-400 hover:bg-slate-300'}`}>
                          {allSelected ? 'Quitar todos' : 'Seleccionar todos'}
                        </button>
                      </button>
                      {isExpanded && (
                        <div className="px-4 pb-4 space-y-1">
                          {group.permissions.map(p => (
                            <label key={p} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white cursor-pointer transition-all">
                              <input type="checkbox" checked={formPerms.has(p)} onChange={() => togglePerm(p)} className="accent-indigo-600 w-4 h-4" />
                              <span className="text-xs font-bold text-slate-600">{PERMISSION_LABELS[p]}</span>
                              <span className="text-[8px] font-mono text-slate-300 ml-auto">{p}</span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <button onClick={() => setShowModal(false)}
                className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold text-xs hover:bg-slate-200 transition-all">
                Cancelar
              </button>
              <button onClick={saveRole}
                className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-[2px] shadow-lg hover:bg-indigo-700 transition-all">
                {editing ? 'Guardar Cambios' : 'Crear Rol'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
