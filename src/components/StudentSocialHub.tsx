import React, { useState } from 'react';
import { Gift, Heart, Send, InboxIcon } from 'lucide-react';
import { GiftSender } from './GiftSender';
import { GiftInbox } from './GiftInbox';
import { StudentFavorites } from './StudentFavorites';

type TabType = 'send' | 'inbox' | 'favorites';

/**
 * StudentSocialHub
 *
 * Main component for student gift social network:
 * - Send gifts to friends (GiftSender)
 * - View received gifts (GiftInbox)
 * - Manage favorite products (StudentFavorites)
 */
export const StudentSocialHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('send');

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'send', label: 'Enviar Regalo', icon: <Send className="w-4 h-4" /> },
    { id: 'inbox', label: 'Mis Regalos', icon: <InboxIcon className="w-4 h-4" /> },
    { id: 'favorites', label: 'Mis Favoritos', icon: <Heart className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm py-6">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center gap-3 mb-6">
            <Gift className="w-8 h-8 text-purple-600" />
            <h1 className="text-3xl font-bold text-gray-900">Red Social MeCard</h1>
          </div>
          <p className="text-gray-600">
            Regala productos a tus amigos y descubre qué les encanta para sorprenderlos
          </p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-4 font-medium flex items-center gap-2 border-b-2 transition ${
                  activeTab === tab.id
                    ? 'border-purple-600 text-purple-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {activeTab === 'send' && <GiftSender />}
        {activeTab === 'inbox' && <GiftInbox />}
        {activeTab === 'favorites' && <StudentFavorites />}
      </div>

      {/* Footer Info */}
      <div className="bg-gradient-to-r from-purple-100 to-blue-100 mt-12 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <h3 className="font-bold text-lg text-gray-900 mb-4">¿Cómo funciona?</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-2xl font-bold text-purple-600 mb-2">1</div>
              <p className="text-sm text-gray-700">
                <strong>Agrega tus favoritos</strong>: Selecciona los productos que te encantaría recibir
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-2xl font-bold text-purple-600 mb-2">2</div>
              <p className="text-sm text-gray-700">
                <strong>Regala a un amigo</strong>: Busca a un amigo, ve sus favoritos y envía un regalo
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-2xl font-bold text-purple-600 mb-2">3</div>
              <p className="text-sm text-gray-700">
                <strong>Canjea en POS</strong>: Ve a la cafetería, escanea tu credencial y usa el código
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentSocialHub;
