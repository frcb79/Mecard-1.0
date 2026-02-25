/**
 * StudentCredentialView — Credencial Digital del Estudiante
 * QR code real, descarga funcional (SVG→Canvas), barcode, NFC, expiración
 */

import React, { useState, useRef, useCallback } from 'react';
import {
  QrCode, Download, Share2, Copy, CheckCircle, Shield, Wifi, Calendar,
  CreditCard, AlertTriangle, Lock
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useAuth } from '../hooks/useAuth';
import { MOCK_STUDENT } from '../constants';
import { useToast } from './ui/Toast';

export default function StudentCredentialView() {
  const { user } = useAuth();
  const toast = useToast();
  const qrRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  // Use MOCK_STUDENT credential data
  const student = MOCK_STUDENT;
  const credential = student.credential;
  const balance = student.balance;
  const isExpired = credential.expiresAt ? new Date(credential.expiresAt) < new Date() : false;
  const isBlocked = !!credential.blockedAt;
  const isActive = credential.isActive && !isExpired && !isBlocked;

  // QR payload — matches what POS expects
  const qrData = JSON.stringify({
    type: 'MECARD_CREDENTIAL',
    studentId: student.studentId,
    id: student.id,
    name: student.fullName,
    schoolId: student.schoolId,
    qrCode: credential.qrCode,
    ts: new Date().toISOString(),
  });

  const handleCopy = () => {
    navigator.clipboard.writeText(student.studentId);
    setCopied(true);
    toast.info('Copiado', 'Matrícula copiada al portapapeles');
    setTimeout(() => setCopied(false), 2000);
  };

  // Fixed download: SVG → Canvas → PNG
  const handleDownload = useCallback(() => {
    if (!qrRef.current) return;
    const svgEl = qrRef.current.querySelector('svg');
    if (!svgEl) { toast.warning('Error', 'No se pudo generar la imagen'); return; }

    const svgData = new XMLSerializer().serializeToString(svgEl);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      canvas.width = img.width * 2;
      canvas.height = img.height * 2;
      ctx!.fillStyle = '#ffffff';
      ctx!.fillRect(0, 0, canvas.width, canvas.height);
      ctx!.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);

      const pngUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = pngUrl;
      link.download = `credencial-${student.studentId}.png`;
      link.click();
      toast.info('Descargado', 'QR guardado como imagen');
    };
    img.src = url;
  }, [student.studentId, toast]);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Mi Credencial MeCard',
        text: `Credencial Digital — ${student.fullName} (${student.studentId})`,
        url: window.location.href,
      });
    } else {
      handleCopy();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-teal-50/30 p-8">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter flex items-center gap-3">
            <CreditCard className="w-9 h-9 text-emerald-600" /> Mi Credencial Digital
          </h1>
          <p className="text-slate-400 font-bold text-sm mt-1">Tu identificación y acceso en MeCard Network</p>
        </div>

        {/* Status Banner */}
        {!isActive && (
          <div className={`p-5 rounded-[28px] flex items-center gap-3 ${isBlocked ? 'bg-rose-50 border border-rose-200' : 'bg-amber-50 border border-amber-200'}`}>
            {isBlocked ? <Lock size={20} className="text-rose-600" /> : <AlertTriangle size={20} className="text-amber-600" />}
            <div>
              <p className={`text-sm font-black ${isBlocked ? 'text-rose-700' : 'text-amber-700'}`}>
                {isBlocked ? 'Credencial Bloqueada' : 'Credencial Expirada'}
              </p>
              <p className={`text-[10px] font-bold ${isBlocked ? 'text-rose-500' : 'text-amber-500'}`}>
                {isBlocked ? `Motivo: ${credential.blockedReason || 'Contacta a tu escuela'}` : `Expiró: ${credential.expiresAt}`}
              </p>
            </div>
          </div>
        )}

        {/* Credential Card */}
        <div className="bg-white rounded-[40px] shadow-xl overflow-hidden border border-emerald-100">
          {/* Header Gradient */}
          <div className="h-28 bg-gradient-to-r from-emerald-600 to-teal-500 relative overflow-hidden">
            <div className="absolute top-[-20%] right-[-10%] w-40 h-40 bg-emerald-400/20 rounded-full blur-3xl" />
            <div className="absolute bottom-[-20%] left-[-10%] w-32 h-32 bg-teal-300/20 rounded-full blur-3xl" />
            <div className="relative h-full flex items-center justify-between px-8">
              <div>
                <p className="text-emerald-100 text-[10px] font-black uppercase tracking-[3px]">Credencial Estudiante</p>
                <h2 className="text-white text-2xl font-black tracking-tighter">MeCard Network</h2>
              </div>
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${isActive ? 'bg-white/20' : 'bg-rose-500/40'}`}>
                {isActive ? <QrCode className="w-8 h-8 text-white" /> : <Lock className="w-7 h-7 text-white" />}
              </div>
            </div>
          </div>

          <div className="p-10 space-y-8">
            {/* Personal Info */}
            <div>
              <h3 className="text-[10px] font-black text-emerald-500 uppercase tracking-[3px] mb-3">Información Personal</h3>
              <div className="bg-slate-50 rounded-[24px] p-6 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[2px] mb-1">Nombre</p>
                    <p className="text-lg font-black text-slate-900">{student.fullName}</p>
                  </div>
                  <span className={`px-4 py-2 rounded-2xl text-[9px] font-black uppercase tracking-[2px] ${isActive ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                    {isActive ? 'ACTIVO' : isBlocked ? 'BLOQUEADO' : 'EXPIRADO'}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[2px] mb-1">Matrícula</p>
                    <p className="text-sm font-mono font-bold text-slate-700">{student.studentId}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[2px] mb-1">Grado</p>
                    <p className="text-sm font-bold text-slate-700">{student.grade}{student.group ? ` - ${student.group}` : ''}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[2px] mb-1">Correo</p>
                    <p className="text-sm text-slate-700 truncate">{user?.email || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* QR Code */}
            <div>
              <h3 className="text-[10px] font-black text-emerald-500 uppercase tracking-[3px] mb-3">Código de Acceso</h3>
              <div className="bg-slate-50 rounded-[24px] p-8 flex flex-col items-center space-y-4">
                <div ref={qrRef} className="bg-white p-4 rounded-[20px] border-4 border-slate-200 shadow-sm">
                  <QRCodeSVG value={qrData} size={180} level="H" includeMargin fgColor="#1e293b" bgColor="#ffffff" />
                </div>
                <div className="w-full text-center space-y-1">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">QR: {credential.qrCode}</p>
                  {credential.usageCount > 0 && (
                    <p className="text-[9px] text-slate-300">{credential.usageCount} escaneos • Último: {credential.lastUsed || 'N/A'}</p>
                  )}
                </div>
                <button onClick={handleCopy}
                  className="flex items-center gap-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 font-black rounded-2xl px-5 py-2.5 transition-all text-[10px] uppercase tracking-[2px]">
                  {copied ? <><CheckCircle size={14} /> Copiado</> : <><Copy size={14} /> Copiar Matrícula</>}
                </button>
              </div>
            </div>

            {/* Identifiers Row: Barcode + NFC */}
            <div className="grid grid-cols-2 gap-4">
              {/* Barcode */}
              <div className="bg-slate-50 rounded-[24px] p-6 text-center">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[2px] mb-3 flex items-center justify-center gap-1">
                  <CreditCard size={12} /> Código de Barras
                </h3>
                {credential.barcode ? (
                  <>
                    <div className="bg-white rounded-xl p-3 border border-slate-200 font-mono text-xs tracking-widest text-slate-700">
                      {credential.barcode}
                    </div>
                    <p className="text-[9px] text-slate-300 mt-2">Disponible en TPV</p>
                  </>
                ) : (
                  <p className="text-xs text-slate-300 font-bold">No asignado</p>
                )}
              </div>

              {/* NFC */}
              <div className="bg-slate-50 rounded-[24px] p-6 text-center">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[2px] mb-3 flex items-center justify-center gap-1">
                  <Wifi size={12} /> NFC
                </h3>
                {credential.nfcUid ? (
                  <>
                    <div className="bg-white rounded-xl p-3 border border-slate-200 font-mono text-xs tracking-widest text-slate-700">
                      {credential.nfcUid}
                    </div>
                    <p className="text-[9px] text-slate-300 mt-2">Chip activo</p>
                  </>
                ) : (
                  <p className="text-xs text-slate-300 font-bold">No configurado</p>
                )}
              </div>
            </div>

            {/* Validity */}
            <div className="flex gap-4">
              <div className="flex-1 bg-slate-50 rounded-2xl p-4 flex items-center gap-3">
                <Calendar size={16} className="text-emerald-500" />
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase">Emitida</p>
                  <p className="text-xs font-bold text-slate-700">{credential.issuedAt}</p>
                </div>
              </div>
              <div className="flex-1 bg-slate-50 rounded-2xl p-4 flex items-center gap-3">
                <Shield size={16} className={`${isExpired ? 'text-rose-500' : 'text-emerald-500'}`} />
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase">Vence</p>
                  <p className={`text-xs font-bold ${isExpired ? 'text-rose-600' : 'text-slate-700'}`}>{credential.expiresAt || 'Sin vencimiento'}</p>
                </div>
              </div>
            </div>

            {/* Balance */}
            <div>
              <h3 className="text-[10px] font-black text-emerald-500 uppercase tracking-[3px] mb-3">Saldo Disponible</h3>
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-[24px] p-8 border border-emerald-100">
                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[2px] mb-2">Saldo actual</p>
                <p className="text-5xl font-black text-emerald-900 tracking-tighter">${balance.toFixed(2)}</p>
                <p className="text-[9px] text-teal-600 mt-3 font-bold">Se actualiza en tiempo real con cada compra</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <button onClick={handleDownload} disabled={!isActive}
            className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black px-6 py-4 rounded-[24px] transition-all shadow-lg text-[10px] uppercase tracking-[2px]">
            <Download size={18} /> Descargar QR
          </button>
          <button onClick={handleShare}
            className="flex items-center justify-center gap-2 bg-slate-200 hover:bg-slate-300 text-slate-900 font-black px-6 py-4 rounded-[24px] transition-all shadow-lg text-[10px] uppercase tracking-[2px]">
            <Share2 size={18} /> Compartir
          </button>
        </div>
      </div>
    </div>
  );
}
