import React, { useState } from 'react';
import { MOCK_SCHOOLS } from '../constants';
import { Users, DollarSign, School as SchoolIcon, Settings, Gift } from 'lucide-react';
import { Button } from './Button';
import { AdminRewardsConfig } from './AdminRewardsConfig';

export const SuperAdminView: React.FC = () => {
  const [view, setView] = useState<'overview' | 'rewards'>('overview');
  const [selectedSchoolId, setSelectedSchoolId] = useState<string | null>(null);

  const selectedSchool = selectedSchoolId 
    ? MOCK_SCHOOLS.find(s => s.id === selectedSchoolId)
    : null;

  return (
    <div className="p-8 h-full overflow-y-auto bg-gray-50">
        <div className="max-w-6xl mx-auto">
            {/* Navigation Tabs */}
            <div className="mb-8 flex gap-4">
              <button
                onClick={() => setView('overview')}
                className={`px-6 py-3 rounded-lg font-bold transition-all ${
                  view === 'overview'
                    ? 'bg-indigo-600 text-white shadow-lg'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  <SchoolIcon size={20} />
                  Platform Overview
                </div>
              </button>
              <button
                onClick={() => setView('rewards')}
                className={`px-6 py-3 rounded-lg font-bold transition-all ${
                  view === 'rewards'
                    ? 'bg-indigo-600 text-white shadow-lg'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Gift size={20} />
                  MeCard Rewards
                </div>
              </button>
            </div>

            {/* OVERVIEW VIEW */}
            {view === 'overview' && (
              <>
                <header className="mb-10">
                    <h1 className="text-3xl font-bold text-gray-900">Platform Overview</h1>
                    <p className="text-gray-500">Manage all registered schools in Mexico.</p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                        <p className="text-sm text-gray-500 font-medium">Total Schools</p>
                        <p className="text-3xl font-bold text-gray-900 mt-1">{MOCK_SCHOOLS.length}</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                         <p className="text-sm text-gray-500 font-medium">Total Students</p>
                         <p className="text-3xl font-bold text-gray-900 mt-1">
                            {MOCK_SCHOOLS.reduce((acc, s) => acc + s.studentCount, 0).toLocaleString()}
                         </p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                         <p className="text-sm text-gray-500 font-medium">Platform Volume</p>
                         <p className="text-3xl font-bold text-indigo-600 mt-1">
                            ${MOCK_SCHOOLS.reduce((acc, s) => acc + s.balance, 0).toLocaleString()}
                         </p>
                    </div>
                </div>

                <h2 className="text-xl font-bold text-gray-800 mb-6">Registered Schools</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {MOCK_SCHOOLS.map(school => (
                        <div key={school.id} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-6 hover:shadow-md transition-shadow">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-3xl">
                                {school.logo}
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-lg text-gray-900">{school.name}</h3>
                                <div className="flex gap-4 mt-2 text-sm text-gray-500">
                                    <span className="flex items-center"><Users className="w-4 h-4 mr-1"/> {school.studentCount} Students</span>
                                    <span className="flex items-center"><DollarSign className="w-4 h-4 mr-1"/> ${school.balance.toLocaleString()} Vol</span>
                                </div>
                            </div>
                            <div className="flex gap-2">
                              <Button variant="secondary" size="sm">Manage</Button>
                              <button
                                onClick={() => {
                                  setSelectedSchoolId(school.id);
                                  setView('rewards');
                                }}
                                className="px-3 py-2 bg-amber-100 hover:bg-amber-200 text-amber-700 font-bold rounded-lg text-sm flex items-center gap-2 transition-colors"
                              >
                                <Gift size={16} />
                                Rewards
                              </button>
                            </div>
                        </div>
                    ))}
                </div>
                
                <div className="mt-8 p-6 border-2 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center text-gray-500 hover:bg-gray-50 hover:border-gray-400 transition-colors cursor-pointer">
                    <SchoolIcon className="w-8 h-8 mb-2" />
                    <span className="font-medium">Onboard New School</span>
                </div>
              </>
            )}

            {/* REWARDS VIEW */}
            {view === 'rewards' && (
              <>
                <div className="mb-8">
                  <button
                    onClick={() => {
                      setSelectedSchoolId(null);
                      setView('overview');
                    }}
                    className="text-indigo-600 font-bold hover:text-indigo-700 flex items-center gap-2"
                  >
                    ← Back to Overview
                  </button>
                </div>

                {!selectedSchoolId ? (
                  <div className="bg-white rounded-2xl p-10 text-center border border-slate-200">
                    <Gift className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-600 font-bold mb-6">Selecciona una escuela para configurar sus Rewards</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {MOCK_SCHOOLS.map(school => (
                        <button
                          key={school.id}
                          onClick={() => setSelectedSchoolId(school.id)}
                          className="p-4 border border-slate-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-all text-left"
                        >
                          <div className="text-2xl mb-2">{school.logo}</div>
                          <p className="font-bold text-slate-900">{school.name}</p>
                          <p className="text-sm text-slate-500">{school.studentCount} estudiantes</p>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <AdminRewardsConfig
                    schoolId={selectedSchoolId}
                    schoolName={selectedSchool?.name}
                    onSave={(config) => {
                      // Here you would save to backend
                    }}
                  />
                )}
              </>
            )}
        </div>
    </div>
  );
};
