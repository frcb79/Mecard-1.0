import React, { useState, useEffect } from 'react';
import { StudentProfile } from '../types';

interface ParentChildrenManagementViewProps {
  parentId: string;
  schoolId: string;
  onBack?: () => void;
}

const ParentChildrenManagementView: React.FC<ParentChildrenManagementViewProps> = ({
  parentId,
  schoolId,
  onBack,
}) => {
  const [children, setChildren] = useState<StudentProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedChild, setSelectedChild] = useState<StudentProfile | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'detail'>('list');

  useEffect(() => {
    loadChildren();
  }, [parentId]);

  const loadChildren = () => {
    setLoading(true);
    // Mock data - in production, fetch from parentService or supabaseAuth
    const mockChildren: StudentProfile[] = [
      {
        id: 'student_1',
        name: 'Carlos González',
        grade: '10A',
        photo:
          'https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos&backgroundColor=random',
        schoolId,
        balance: 2450.75,
        dailyLimit: 500,
        spentToday: 125.50,
        restrictedCategories: [],
        restrictedProducts: [],
        allergies: ['Nuts'],
        parentName: 'María González',
        status: 'Active',
        enrollmentDate: '2023-09-01',
        clabePersonal: '012345678901234567890',
      },
      {
        id: 'student_2',
        name: 'Sofia González',
        grade: '8B',
        photo:
          'https://api.dicebear.com/7.x/avataaars/svg?seed=Sofia&backgroundColor=random',
        schoolId,
        balance: 1850.25,
        dailyLimit: 400,
        spentToday: 0,
        restrictedCategories: [],
        restrictedProducts: [],
        allergies: [],
        parentName: 'María González',
        status: 'Active',
        enrollmentDate: '2023-09-01',
        clabePersonal: '012345678901234567891',
      },
    ];

    setChildren(mockChildren);
    setLoading(false);
  };

  const handleSelectChild = (child: StudentProfile) => {
    setSelectedChild(child);
    setViewMode('detail');
  };

  const handleBack = () => {
    setViewMode('list');
    setSelectedChild(null);
  };

  const handleUpdateChild = (updatedChild: StudentProfile) => {
    setChildren(children.map(c => (c.id === updatedChild.id ? updatedChild : c)));
    handleBack();
    // TODO: Call service to update in database
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 text-lg">Cargando información de estudiantes...</p>
        </div>
      </div>
    );
  }

  if (viewMode === 'detail' && selectedChild) {
    return (
      <ChildDetailView
        child={selectedChild}
        parentId={parentId}
        onBack={handleBack}
        onUpdate={handleUpdateChild}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={onBack}
            className="text-indigo-600 hover:text-indigo-800 mb-4 flex items-center gap-2"
          >
            ← Volver
          </button>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
            Gestión de Hijos
          </h1>
          <p className="text-gray-600">
            Administra la información y límites de tus {children.length} hijo(s)
          </p>
        </div>

        {/* Children List */}
        {children.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-600 text-lg">No hay estudiantes registrados</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {children.map(child => (
              <div
                key={child.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => handleSelectChild(child)}
              >
                <div className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <img
                      src={child.photo}
                      alt={child.name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-800">{child.name}</h3>
                      <p className="text-gray-600">Grado: {child.grade}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span
                          className={`inline-block w-2 h-2 rounded-full ${
                            child.status === 'Active' ? 'bg-green-500' : 'bg-gray-400'
                          }`}
                        />
                        <span className="text-sm text-gray-600">{child.status}</span>
                      </div>
                    </div>
                  </div>

                  {/* Balance Section */}
                  <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg p-4 mb-4">
                    <p className="text-sm text-gray-600 mb-1">Saldo Disponible</p>
                    <p className="text-2xl font-bold text-indigo-600">
                      ${child.balance.toFixed(2)}
                    </p>
                  </div>

                  {/* Daily Limit */}
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-sm font-semibold text-gray-700">Límite Diario</p>
                      <p className="text-sm text-gray-600">
                        ${child.spentToday.toFixed(2)} / ${child.dailyLimit.toFixed(2)}
                      </p>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-indigo-600 h-2 rounded-full"
                        style={{
                          width: `${Math.min(
                            (child.spentToday / child.dailyLimit) * 100,
                            100
                          )}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Allergies */}
                  {child.allergies && child.allergies.length > 0 && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                      <p className="text-xs font-semibold text-red-700 mb-1">Alergias</p>
                      <p className="text-sm text-red-600">{child.allergies.join(', ')}</p>
                    </div>
                  )}

                  {/* Action Button */}
                  <button className="w-full bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700 transition-colors">
                    Ver Detalles
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

interface ChildDetailViewProps {
  child: StudentProfile;
  parentId: string;
  onBack: () => void;
  onUpdate: (child: StudentProfile) => void;
}

const ChildDetailView: React.FC<ChildDetailViewProps> = ({
  child,
  parentId,
  onBack,
  onUpdate,
}) => {
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState(child);

  const handleSave = () => {
    onUpdate(formData);
    setEditMode(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <button
          onClick={onBack}
          className="text-indigo-600 hover:text-indigo-800 mb-4 flex items-center gap-2"
        >
          ← Volver
        </button>

        {/* Child Info Card */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-6">
          <div className="flex items-start gap-6 mb-6">
            <img
              src={child.photo}
              alt={child.name}
              className="w-24 h-24 rounded-full object-cover"
            />
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">{child.name}</h1>
              <p className="text-gray-600 mb-4">Grado: {child.grade}</p>
              <div className="flex gap-4">
                <div>
                  <p className="text-sm text-gray-600">Saldo</p>
                  <p className="text-2xl font-bold text-indigo-600">
                    ${child.balance.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Límite Diario</p>
                  <p className="text-2xl font-bold text-gray-800">${child.dailyLimit}</p>
                </div>
              </div>
            </div>
            {!editMode && (
              <button
                onClick={() => setEditMode(true)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Editar
              </button>
            )}
          </div>

          {/* Details */}
          {editMode ? (
            <ChildEditForm
              child={formData}
              onChange={setFormData}
              onSave={handleSave}
              onCancel={() => setEditMode(false)}
            />
          ) : (
            <ChildDetailsDisplay child={child} />
          )}
        </div>
      </div>
    </div>
  );
};

interface ChildEditFormProps {
  child: StudentProfile;
  onChange: (child: StudentProfile) => void;
  onSave: () => void;
  onCancel: () => void;
}

const ChildEditForm: React.FC<ChildEditFormProps> = ({
  child,
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Nombre
          </label>
          <input
            type="text"
            value={child.name}
            onChange={e => onChange({ ...child, name: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Grado
          </label>
          <input
            type="text"
            value={child.grade}
            onChange={e => onChange({ ...child, grade: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Límite Diario ($)
          </label>
          <input
            type="number"
            value={child.dailyLimit}
            onChange={e => onChange({ ...child, dailyLimit: parseFloat(e.target.value) })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Alergias
        </label>
        <input
          type="text"
          value={child.allergies.join(', ')}
          onChange={e =>
            onChange({
              ...child,
              allergies: e.target.value ? e.target.value.split(',').map(a => a.trim()) : [],
            })
          }
          placeholder="Separadas por comas"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
        />
      </div>

      <div className="flex gap-4">
        <button
          type="submit"
          className="flex-1 bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
        >
          Guardar Cambios
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-gray-300 text-gray-800 py-2 rounded-lg font-semibold hover:bg-gray-400 transition-colors"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
};

interface ChildDetailsDisplayProps {
  child: StudentProfile;
}

const ChildDetailsDisplay: React.FC<ChildDetailsDisplayProps> = ({ child }) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-gray-600">Número de Matrícula</p>
          <p className="text-gray-800 font-semibold">{child.enrollmentDate}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Estado</p>
          <p className="text-gray-800 font-semibold">{child.status}</p>
        </div>
      </div>

      {child.allergies.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm font-semibold text-red-700 mb-2">⚠️ Alergias Registradas</p>
          <p className="text-red-600">{child.allergies.join(', ')}</p>
        </div>
      )}
    </div>
  );
};

export default ParentChildrenManagementView;
