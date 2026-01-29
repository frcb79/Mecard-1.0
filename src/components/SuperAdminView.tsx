import React from 'react';
import { MOCK_SCHOOLS } from '../constants';
import { Users, DollarSign, School as SchoolIcon } from 'lucide-react';
import { Button } from './Button';

export const SuperAdminView: React.FC = () => {
  return (
    <div className="p-8 h-full overflow-y-auto bg-gray-50">
        <div className="max-w-6xl mx-auto">
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
                        <Button variant="secondary" size="sm">Manage</Button>
                    </div>
                ))}
            </div>
            
            <div className="mt-8 p-6 border-2 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center text-gray-500 hover:bg-gray-50 hover:border-gray-400 transition-colors cursor-pointer">
                <SchoolIcon className="w-8 h-8 mb-2" />
                <span className="font-medium">Onboard New School</span>
            </div>
        </div>
    </div>
  );
};
