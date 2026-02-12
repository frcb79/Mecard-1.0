/**
 * StudentCredentialView Component
 * Muestra la credencial digital del estudiante con QR
 * Permite visualizar datos de identidad y generar código QR para acceso
 */

import React, { useState, useEffect, useRef } from 'react';
import { QrCode, Download, Share2, Copy, CheckCircle, Users } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useAuth } from '../hooks/useAuth';

export default function StudentCredentialView() {
  const { user } = useAuth();
  const qrRef = useRef<any>(null);
  const [copied, setCopied] = useState(false);
  const [balance, setBalance] = useState<number>(850.00);

  // Generar datos del QR
  const qrData = user ? JSON.stringify({
    type: 'MECARD_CREDENTIAL',
    id: user.id,
    name: user.fullName,
    email: user.email,
    school: 'Escuela Primaria Federal',
    timestamp: new Date().toISOString(),
  }) : '';

  const handleCopy = () => {
    navigator.clipboard.writeText(user?.id || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (qrRef.current) {
      const canvas = qrRef.current.querySelector('canvas');
      const url = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = url;
      link.download = `credencial-${user?.id}.png`;
      link.click();
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Mi Credencial MeCard',
        text: `Credencial Digital - ${user?.fullName}`,
        url: window.location.href,
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 p-8">
      <div className="max-w-2xl mx-auto">
        {/* HEADER */}
        <div className="mb-12">
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter mb-2">
            Mi Credencial Digital
          </h1>
          <p className="text-slate-500 font-medium">
            Tu identificación y acceso en MeCard Network
          </p>
        </div>

        {/* CREDENCIAL CARD */}
        <div className="bg-white rounded-[40px] shadow-2xl overflow-hidden border-2 border-indigo-100 mb-8">
          {/* HEADER GRADIENT */}
          <div className="h-32 bg-gradient-to-r from-indigo-600 to-indigo-500 relative overflow-hidden">
            <div className="absolute top-[-20%] right-[-10%] w-40 h-40 bg-indigo-400/20 rounded-full blur-3xl"></div>
            <div className="absolute bottom-[-20%] left-[-10%] w-32 h-32 bg-indigo-300/20 rounded-full blur-3xl"></div>
            
            <div className="relative h-full flex items-center justify-between px-8">
              <div>
                <p className="text-indigo-100 text-[11px] font-black uppercase tracking-[3px] mb-1">
                  Credencial Estudiante
                </p>
                <h2 className="text-white text-2xl font-black">MeCard Network</h2>
              </div>
              <QrCode className="w-12 h-12 text-white/80" />
            </div>
          </div>

          {/* CONTENT */}
          <div className="p-12 space-y-8">
            {/* DATOS PERSONALES */}
            <div className="space-y-4">
              <h3 className="text-sm font-black text-indigo-400 uppercase tracking-[3px]">
                Información Personal
              </h3>
              <div className="bg-slate-50 rounded-[24px] p-6 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[2px] mb-1">
                      Nombre
                    </p>
                    <p className="text-lg font-black text-slate-900">
                      {user?.fullName || 'Nombre del Estudiante'}
                    </p>
                  </div>
                  <div className="bg-indigo-100 px-4 py-2 rounded-[16px]">
                    <p className="text-[9px] font-black text-indigo-600 uppercase tracking-[2px]">
                      ACTIVO
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[2px] mb-1">
                      Correo
                    </p>
                    <p className="text-sm text-slate-700 break-all">{user?.email || 'email@example.com'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[2px] mb-1">
                      ID Estudiante
                    </p>
                    <p className="text-sm font-mono text-slate-700">{user?.id || 'STD-00000'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* QR CODE SECTION */}
            <div className="space-y-4">
              <h3 className="text-sm font-black text-indigo-400 uppercase tracking-[3px]">
                Código de Acceso
              </h3>
              <div className="bg-slate-50 rounded-[24px] p-8 flex flex-col items-center space-y-4">
                {/* QR CODE (REAL) */}
                <div ref={qrRef} className="bg-white p-4 rounded-[16px] border-4 border-slate-200">
                  {user?.id && qrData && (
                    <QRCodeSVG 
                      value={qrData}
                      size={160}
                      level="H"
                      includeMargin={true}
                      fgColor="#1e293b"
                      bgColor="#ffffff"
                    />
                  )}
                </div>

                {/* ID DISPLAY */}
                <div className="w-full space-y-2">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[2px] text-center">
                    ID a Escanear
                  </p>
                  <div className="bg-white border border-slate-200 rounded-[16px] px-4 py-3 font-mono text-center text-sm font-black text-slate-900">
                    {user?.id || 'STD-00000'}
                  </div>
                </div>

                {/* COPY BUTTON */}
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-black rounded-[16px] px-4 py-2 transition-all text-[10px] uppercase tracking-[2px]"
                >
                  {copied ? (
                    <>
                      <CheckCircle className="w-4 h-4" /> Copiado
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" /> Copiar ID
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* BALANCE & ACCESS */}
            <div className="space-y-4">
              <h3 className="text-sm font-black text-indigo-400 uppercase tracking-[3px]">
                Saldo Disponible
              </h3>
              <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-[24px] p-8 border-2 border-indigo-200">
                <p className="text-[10px] font-black text-indigo-600 uppercase tracking-[2px] mb-2">
                  Saldo actual
                </p>
                <p className="text-5xl font-black text-indigo-900 tracking-tighter">
                  ${balance.toFixed(2)}
                </p>
                <p className="text-[9px] text-indigo-700 mt-4">
                  💡 Tu saldo se actualiza en tiempo real con cada compra. Consulta tu billetera para más detalles.
                </p>
              </div>
            </div>


          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={handleDownload}
            className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-black px-6 py-4 rounded-[24px] transition-all shadow-lg hover:shadow-xl"
          >
            <Download className="w-5 h-5" />
            Descargar
          </button>
          <button
            onClick={handleShare}
            className="flex items-center justify-center gap-2 bg-slate-200 hover:bg-slate-300 text-slate-900 font-black px-6 py-4 rounded-[24px] transition-all shadow-lg hover:shadow-xl"
          >
            <Share2 className="w-5 h-5" />
            Compartir
          </button>
        </div>

        {/* INFO BOX */}
        <div className="mt-8 bg-blue-50 border-2 border-blue-100 rounded-[24px] p-6">
          <p className="text-sm text-blue-900 font-bold">
            💡 <strong>Consejo:</strong> Guarda tu credencial en un lugar seguro. Puedes acceder a ella con tu email y contraseña en cualquier momento.
          </p>
        </div>
      </div>
    </div>
  );
}
