import React, { useState, useEffect } from 'react';
import { SpendingLimit, StudentProfile, Category } from '../types';

interface ParentLimitsViewProps {
  parentId: string;
  children: StudentProfile[];
  onBack?: () => void;
}

const ParentLimitsView: React.FC<ParentLimitsViewProps> = ({
  parentId,
  children,
  onBack,
}) => {
  const [limits, setLimits] = useState<Map<string, SpendingLimit>>(new Map());
  const [loading, setLoading] = useState(true);
  const [selectedChild, setSelectedChild] = useState<StudentProfile | null>(null);
  const [editingLimitId, setEditingLimitId] = useState<string | null>(null);

  useEffect(() => {
    loadLimits();
  }, [parentId]);

  const loadLimits = () => {
    setLoading(true);

    // Mock limits data
    const mockLimits: SpendingLimit[] = [
      {
        id: 'limit_1',
        parentId,
        studentId: children[0]?.id || 'student_1',
        dailyLimit: 500,
        weeklyLimit: 2500,
        monthlyLimit: 10000,
        restrictedCategories: [],
        restrictedProducts: [],
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'limit_2',
        parentId,
        studentId: children[1]?.id || 'student_2',
        dailyLimit: 400,
        weeklyLimit: 2000,
        monthlyLimit: 8000,
        restrictedCategories: [],
        restrictedProducts: [],
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    const limitsMap = new Map<string, SpendingLimit>();
    mockLimits.forEach(limit => {
      limitsMap.set(limit.studentId, limit);
    });
    setLimits(limitsMap);
    setSelectedChild(children[0] || null);
    setLoading(false);
  };

  const handleUpdateLimit = (studentId: string, updatedLimit: SpendingLimit) => {
    const newLimits = new Map(limits);
    newLimits.set(studentId, updatedLimit);
    setLimits(newLimits);
    setEditingLimitId(null);
    // TODO: Call limitsService.setStudentLimits
  };

  const handleToggleLimitActive = (studentId: string) => {
    const currentLimit = limits.get(studentId);
    if (currentLimit) {
      const toggled = { ...currentLimit, isActive: !currentLimit.isActive };
      handleUpdateLimit(studentId, toggled);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <p className="text-gray-600 text-lg">Cargando límites de gasto...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={onBack}
            className="text-indigo-600 hover:text-indigo-800 mb-4 flex items-center gap-2"
          >
            ← Volver
          </button>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
            Límites de Gasto
          </h1>
          <p className="text-gray-600">
            Controla el gasto de tus {children.length} hijo(s) en la plataforma
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Children Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="bg-indigo-600 text-white p-4">
                <h3 className="font-bold">Mis Estudiantes</h3>
              </div>
              <div className="divide-y">
                {children.map(child => (
                  <button
                    key={child.id}
                    onClick={() => setSelectedChild(child)}
                    className={`w-full text-left px-4 py-4 transition-colors ${
                      selectedChild?.id === child.id
                        ? 'bg-indigo-50 border-l-4 border-indigo-600'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={child.photo}
                        alt={child.name}
                        className="w-10 h-10 rounded-full"
                      />
                      <div>
                        <p className="font-semibold text-gray-800">{child.name}</p>
                        <p className="text-xs text-gray-600">{child.grade}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Limits Editor */}
          <div className="lg:col-span-2">
            {selectedChild ? (
              <LimitEditor
                child={selectedChild}
                limit={limits.get(selectedChild.id) || null}
                onUpdate={handleUpdateLimit}
                onToggleActive={handleToggleLimitActive}
                isEditing={editingLimitId === selectedChild.id}
                onEditChange={setEditingLimitId}
              />
            ) : (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <p className="text-gray-600 text-lg">
                  Selecciona un estudiante para editar sus límites
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

interface LimitEditorProps {
  child: StudentProfile;
  limit: SpendingLimit | null;
  onUpdate: (studentId: string, limit: SpendingLimit) => void;
  onToggleActive: (studentId: string) => void;
  isEditing: boolean;
  onEditChange: (id: string | null) => void;
}

const LimitEditor: React.FC<LimitEditorProps> = ({
  child,
  limit,
  onUpdate,
  onToggleActive,
  isEditing,
  onEditChange,
}) => {
  const [formData, setFormData] = useState<SpendingLimit | null>(limit);

  useEffect(() => {
    setFormData(limit);
  }, [limit]);

  if (!formData) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <p className="text-gray-600 text-lg mb-4">
          No hay límites configurados para {child.name}
        </p>
        <button
          onClick={() => {
            const newLimit: SpendingLimit = {
              id: `limit_${Date.now()}`,
              parentId: '',
              studentId: child.id,
              dailyLimit: 500,
              weeklyLimit: 2500,
              monthlyLimit: 10000,
              restrictedCategories: [],
              restrictedProducts: [],
              isActive: true,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            setFormData(newLimit);
            onEditChange(child.id);
          }}
          className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Crear Límites
        </button>
      </div>
    );
  }

  const handleSave = () => {
    if (formData) {
      onUpdate(child.id, {
        ...formData,
        updatedAt: new Date().toISOString(),
      });
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-500 to-blue-600 text-white p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img
              src={child.photo}
              alt={child.name}
              className="w-12 h-12 rounded-full"
            />
            <div>
              <h2 className="text-2xl font-bold">{child.name}</h2>
              <p className="text-indigo-100">Grado {child.grade}</p>
            </div>
          </div>
          <button
            onClick={() => onToggleActive(child.id)}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              formData.isActive
                ? 'bg-white text-indigo-600'
                : 'bg-red-500 text-white'
            }`}
          >
            {formData.isActive ? '✓ Activo' : '✕ Inactivo'}
          </button>
        </div>
      </div>

      {/* Form */}
      <div className="p-8">
        {isEditing ? (
          <LimitEditForm
            limit={formData}
            onChange={setFormData}
            onSave={handleSave}
            onCancel={() => onEditChange(null)}
          />
        ) : (
          <LimitDisplay
            limit={formData}
            onEdit={() => onEditChange(child.id)}
          />
        )}
      </div>
    </div>
  );
};

interface LimitDisplayProps {
  limit: SpendingLimit;
  onEdit: () => void;
}

const LimitDisplay: React.FC<LimitDisplayProps> = ({ limit, onEdit }) => {
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(amount);
  };

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-indigo-50 rounded-lg p-6">
          <p className="text-sm text-gray-600 mb-2">Límite Diario</p>
          <p className="text-3xl font-bold text-indigo-600">
            {formatAmount(limit.dailyLimit)}
          </p>
        </div>
        <div className="bg-blue-50 rounded-lg p-6">
          <p className="text-sm text-gray-600 mb-2">Límite Semanal</p>
          <p className="text-3xl font-bold text-blue-600">
            {formatAmount(limit.weeklyLimit)}
          </p>
        </div>
        <div className="bg-purple-50 rounded-lg p-6">
          <p className="text-sm text-gray-600 mb-2">Límite Mensual</p>
          <p className="text-3xl font-bold text-purple-600">
            {formatAmount(limit.monthlyLimit)}
          </p>
        </div>
      </div>

      {/* Restrictions */}
      <div className="space-y-6">
        {limit.restrictedCategories.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="font-semibold text-red-700 mb-3">📛 Categorías Restringidas</p>
            <div className="flex flex-wrap gap-2">
              {limit.restrictedCategories.map(cat => (
                <span
                  key={cat}
                  className="bg-red-200 text-red-800 px-3 py-1 rounded-full text-sm"
                >
                  {cat}
                </span>
              ))}
            </div>
          </div>
        )}

        {limit.restrictedProducts.length > 0 && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <p className="font-semibold text-orange-700 mb-3">📦 Productos Restringidos</p>
            <p className="text-sm text-orange-600">
              {limit.restrictedProducts.length} producto(s) bloqueado(s)
            </p>
          </div>
        )}

        {limit.restrictedCategories.length === 0 &&
          limit.restrictedProducts.length === 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-700 font-semibold">✓ Sin restricciones</p>
            </div>
          )}
      </div>

      <button
        onClick={onEdit}
        className="mt-8 w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
      >
        Editar Límites
      </button>
    </div>
  );
};

interface LimitEditFormProps {
  limit: SpendingLimit;
  onChange: (limit: SpendingLimit) => void;
  onSave: () => void;
  onCancel: () => void;
}

const LimitEditForm: React.FC<LimitEditFormProps> = ({
  limit,
  onChange,
  onSave,
  onCancel,
}) => {
  return (
    <form
      onSubmit={e => {
        e.preventDefault();
        onSave();
      }}
      className="space-y-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Límite Diario ($)
          </label>
          <input
            type="number"
            value={limit.dailyLimit}
            onChange={e =>
              onChange({ ...limit, dailyLimit: parseFloat(e.target.value) || 0 })
            }
            min="0"
            step="50"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Límite Semanal ($)
          </label>
          <input
            type="number"
            value={limit.weeklyLimit}
            onChange={e =>
              onChange({ ...limit, weeklyLimit: parseFloat(e.target.value) || 0 })
            }
            min="0"
            step="100"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Límite Mensual ($)
          </label>
          <input
            type="number"
            value={limit.monthlyLimit}
            onChange={e =>
              onChange({ ...limit, monthlyLimit: parseFloat(e.target.value) || 0 })
            }
            min="0"
            step="500"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Categorías Restringidas
        </label>
        <div className="space-y-2">
          {Object.values(Category).map(cat => (
            <label key={cat} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded">
              <input
                type="checkbox"
                checked={limit.restrictedCategories.includes(cat)}
                onChange={e => {
                  if (e.target.checked) {
                    onChange({
                      ...limit,
                      restrictedCategories: [...limit.restrictedCategories, cat],
                    });
                  } else {
                    onChange({
                      ...limit,
                      restrictedCategories: limit.restrictedCategories.filter(
                        c => c !== cat
                      ),
                    });
                  }
                }}
                className="w-4 h-4 text-indigo-600"
              />
              <span className="text-gray-700">{cat}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="flex gap-4 pt-4">
        <button
          type="submit"
          className="flex-1 bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
        >
          Guardar Cambios
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-gray-300 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-400 transition-colors"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
};

export default ParentLimitsView;
