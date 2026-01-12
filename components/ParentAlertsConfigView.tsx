import React, { useState, useEffect } from 'react';
import { Bell, Mail, MessageSquare, Smartphone, Save } from 'lucide-react';
import { AlertConfig } from '../types';

interface ParentAlertsConfigViewProps {
  parentId: string;
  schoolId: string;
  onNavigate?: (view: string) => void;
}

export const ParentAlertsConfigView: React.FC<ParentAlertsConfigViewProps> = ({
  parentId,
  schoolId,
  onNavigate
}) => {
  const [config, setConfig] = useState<AlertConfig>({
    id: `alert_${parentId}`,
    parentId,
    lowBalanceAlert: true,
    lowBalanceThreshold: 100,
    largePurchaseAlert: true,
    largePurchaseThreshold: 500,
    deniedPurchaseAlert: true,
    alertChannels: ['IN_APP', 'EMAIL'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    // Update timestamp
    setConfig(prev => ({
      ...prev,
      updatedAt: new Date().toISOString()
    }));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const toggleChannel = (channel: 'EMAIL' | 'SMS' | 'IN_APP') => {
    setConfig(prev => ({
      ...prev,
      alertChannels: prev.alertChannels.includes(channel)
        ? prev.alertChannels.filter(c => c !== channel)
        : [...prev.alertChannels, channel]
    }));
  };

  return (
    <div className="h-full overflow-auto bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Bell className="w-8 h-8 text-blue-600 mr-3" />
          <h1 className="text-3xl font-bold text-gray-900">Configurar Alertas</h1>
        </div>

        {/* Success Message */}
        {saved && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-green-800">Configuración guardada correctamente</p>
            </div>
          </div>
        )}

        {/* Alert Channels */}
        <div className="bg-white rounded-lg shadow mb-6 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Canales de Notificación</h2>
          <p className="text-sm text-gray-600 mb-6">Selecciona cómo deseas recibir notificaciones</p>

          <div className="space-y-3">
            {/* Email */}
            <label className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
              <input
                type="checkbox"
                checked={config.alertChannels.includes('EMAIL')}
                onChange={() => toggleChannel('EMAIL')}
                className="w-5 h-5 rounded"
              />
              <Mail className="w-5 h-5 text-gray-500 mx-3" />
              <div className="flex-1">
                <p className="font-medium text-gray-900">Correo Electrónico</p>
                <p className="text-sm text-gray-600">Recibe alertas en tu email registrado</p>
              </div>
            </label>

            {/* SMS */}
            <label className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
              <input
                type="checkbox"
                checked={config.alertChannels.includes('SMS')}
                onChange={() => toggleChannel('SMS')}
                className="w-5 h-5 rounded"
              />
              <Smartphone className="w-5 h-5 text-gray-500 mx-3" />
              <div className="flex-1">
                <p className="font-medium text-gray-900">SMS</p>
                <p className="text-sm text-gray-600">Recibe alertas como mensajes de texto</p>
              </div>
            </label>

            {/* In-App */}
            <label className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
              <input
                type="checkbox"
                checked={config.alertChannels.includes('IN_APP')}
                onChange={() => toggleChannel('IN_APP')}
                className="w-5 h-5 rounded"
              />
              <MessageSquare className="w-5 h-5 text-gray-500 mx-3" />
              <div className="flex-1">
                <p className="font-medium text-gray-900">En la Aplicación</p>
                <p className="text-sm text-gray-600">Recibe notificaciones dentro de la app</p>
              </div>
            </label>
          </div>
        </div>

        {/* Low Balance Alert */}
        <div className="bg-white rounded-lg shadow mb-6 p-6">
          <div className="flex items-center mb-4">
            <input
              type="checkbox"
              checked={config.lowBalanceAlert}
              onChange={(e) => setConfig(prev => ({
                ...prev,
                lowBalanceAlert: e.target.checked
              }))}
              className="w-5 h-5 rounded"
            />
            <h2 className="text-lg font-semibold text-gray-900 ml-3">Alertas de Saldo Bajo</h2>
          </div>

          {config.lowBalanceAlert && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Recibe una notificación cuando el saldo de uno de tus hijos esté por debajo del threshold establecido.
              </p>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Threshold de Saldo Bajo (MXN)
                </label>
                <input
                  type="number"
                  value={config.lowBalanceThreshold}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    lowBalanceThreshold: Number(e.target.value)
                  }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                  step="10"
                />
                <p className="text-xs text-gray-500 mt-1">Se enviará alerta cuando el saldo esté por debajo de ${config.lowBalanceThreshold}</p>
              </div>
            </div>
          )}
        </div>

        {/* Large Purchase Alert */}
        <div className="bg-white rounded-lg shadow mb-6 p-6">
          <div className="flex items-center mb-4">
            <input
              type="checkbox"
              checked={config.largePurchaseAlert}
              onChange={(e) => setConfig(prev => ({
                ...prev,
                largePurchaseAlert: e.target.checked
              }))}
              className="w-5 h-5 rounded"
            />
            <h2 className="text-lg font-semibold text-gray-900 ml-3">Alertas de Compra Grande</h2>
          </div>

          {config.largePurchaseAlert && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Recibe una notificación cada vez que uno de tus hijos realice una compra superior al monto establecido.
              </p>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Threshold de Compra Grande (MXN)
                </label>
                <input
                  type="number"
                  value={config.largePurchaseThreshold}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    largePurchaseThreshold: Number(e.target.value)
                  }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                  step="50"
                />
                <p className="text-xs text-gray-500 mt-1">Se enviará alerta para compras mayores a ${config.largePurchaseThreshold}</p>
              </div>
            </div>
          )}
        </div>

        {/* Denied Purchase Alert */}
        <div className="bg-white rounded-lg shadow mb-6 p-6">
          <div className="flex items-center mb-4">
            <input
              type="checkbox"
              checked={config.deniedPurchaseAlert}
              onChange={(e) => setConfig(prev => ({
                ...prev,
                deniedPurchaseAlert: e.target.checked
              }))}
              className="w-5 h-5 rounded"
            />
            <h2 className="text-lg font-semibold text-gray-900 ml-3">Alertas de Compra Denegada</h2>
          </div>

          {config.deniedPurchaseAlert && (
            <p className="text-sm text-gray-600">
              Recibe una notificación cuando uno de tus hijos intente realizar una compra que sea rechazada por saldo insuficiente o límites.
            </p>
          )}
        </div>

        {/* Save Button */}
        <div className="flex gap-4">
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <Save className="w-5 h-5" />
            Guardar Cambios
          </button>
          <button
            onClick={() => onNavigate?.('PARENT_DASHBOARD')}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};
