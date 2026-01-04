
import React, { useState, useRef, useEffect } from 'react';
import { 
  Scan, Barcode, Keyboard, Gift as GiftIcon, CheckCircle2, 
  AlertCircle, Loader2, ArrowLeft, Camera, ShoppingBag, User 
} from 'lucide-react';
import { socialService } from '../services/supabaseSocial';
import { Gift } from '../types';
import { Button } from './Button';

interface GiftRedemptionViewProps {
  unitId: string;
  onBack: () => void;
}

export const GiftRedemptionView: React.FC<GiftRedemptionViewProps> = ({ 
  unitId, 
  onBack 
}) => {
  const [code, setCode] = useState('');
  const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [redeemedGift, setRedeemedGift] = useState<Gift | null>(null);
  const [activeMethod, setActiveMethod] = useState<'manual' | 'scanner' | 'camera'>('scanner');
  
  const scannerInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (activeMethod === 'scanner' && status === 'idle') {
      scannerInputRef.current?.focus();
    }
  }, [activeMethod, status]);

  const handleManualRedeem = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!code || code.length < 6) {
      setMessage('El código debe tener 6 caracteres');
      return;
    }
    processRedemption(code);
  };

  const processRedemption = async (inputCode: string) => {
    setStatus('processing');
    setMessage('');
    
    try {
      const gift = await socialService.redeemGift(inputCode.toUpperCase(), unitId);
      setRedeemedGift(gift);
      setStatus('success');
      setCode('');
      
      setTimeout(() => {
        setStatus('idle');
        setRedeemedGift(null);
      }, 8000);
    } catch (err: any) {
      console.error('Error redeeming gift:', err);
      setStatus('error');
      setMessage(err.message || 'Código inválido o ya expirado.');
      setCode('');
      
      setTimeout(() => {
        setStatus('idle');
        setMessage('');
      }, 4000);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && code.length >= 6) {
      processRedemption(code);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 animate-in fade-in duration-300">
      <header className="bg-white p-6 border-b border-slate-200 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-xl font-black text-slate-800 tracking-tight italic">Canje de Regalos</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Validación MeCard POS</p>
          </div>
        </div>
        
        <div className="flex bg-slate-100 p-1 rounded-2xl">
          {[
            { id: 'scanner', icon: Barcode, label: 'Lector' },
            { id: 'camera', icon: Camera, label: 'Cámara' },
            { id: 'manual', icon: Keyboard, label: 'Manual' }
          ].map(method => (
            <button 
              key={method.id}
              onClick={() => setActiveMethod(method.id as any)}
              disabled={status !== 'idle'}
              className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase flex items-center gap-2 transition-all disabled:opacity-50 ${
                activeMethod === method.id ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'
              }`}
            >
              <method.icon size={14} /> {method.label}
            </button>
          ))}
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-8">
        {status === 'idle' && (
          <div className="max-w-md w-full text-center space-y-8 animate-in zoom-in duration-300">
            {activeMethod === 'scanner' && (
              <div className="space-y-6">
                <div className="w-40 h-40 bg-indigo-50 text-indigo-500 rounded-[48px] flex items-center justify-center mx-auto shadow-inner border border-indigo-100/50">
                  <Barcode size={64} strokeWidth={1.5} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-slate-800 tracking-tight">Esperando Escaneo...</h3>
                  <p className="text-slate-500 font-medium text-sm">Pase el código de barras o QR por el lector físico.</p>
                </div>
                <input 
                  ref={scannerInputRef}
                  type="text"
                  className="opacity-0 absolute pointer-events-none"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  onKeyDown={handleKeyDown}
                  maxLength={6}
                />
              </div>
            )}

            {activeMethod === 'manual' && (
              <form onSubmit={handleManualRedeem} className="bg-white p-12 rounded-[56px] shadow-2xl border border-slate-100 space-y-8">
                <div className="space-y-2 text-center">
                  <h3 className="text-2xl font-black text-slate-800 tracking-tighter italic uppercase">Ingreso Manual</h3>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-[3px]">Código de 6 dígitos</p>
                </div>
                <input 
                  type="text" autoFocus maxLength={6} placeholder="A4G9X2"
                  className="w-full text-center text-5xl font-black tracking-[10px] py-8 bg-slate-50 rounded-[32px] border-none outline-none focus:ring-4 focus:ring-indigo-100 uppercase transition-all shadow-inner"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                />
                {message && <p className="text-sm text-rose-600 font-bold text-center">{message}</p>}
                <Button type="submit" size="lg" className="w-full" disabled={code.length < 6}>Validar Regalo</Button>
              </form>
            )}
          </div>
        )}

        {status === 'processing' && (
          <div className="flex flex-col items-center gap-6 animate-pulse">
            <Loader2 className="w-20 h-20 text-indigo-600 animate-spin" />
            <p className="text-lg font-black text-slate-700 uppercase tracking-[4px] italic">Validando Regalo...</p>
          </div>
        )}

        {status === 'success' && redeemedGift && (
          <div className="bg-white p-12 rounded-[64px] shadow-2xl border border-emerald-100 max-w-md w-full animate-in zoom-in duration-500 text-center">
            <div className="w-28 h-28 bg-emerald-50 text-emerald-500 rounded-[40px] flex items-center justify-center mx-auto mb-8 shadow-inner border border-emerald-100">
              <CheckCircle2 size={56} />
            </div>
            <h2 className="text-4xl font-black text-slate-800 tracking-tighter mb-2">¡Canje Exitoso!</h2>
            <p className="text-emerald-600 font-black uppercase text-[10px] tracking-[4px] mb-10">Transacción Validada</p>
            
            <div className="bg-slate-50 p-8 rounded-[40px] text-left space-y-6 border border-slate-100">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center border border-slate-200 shadow-sm text-indigo-600">
                  <ShoppingBag size={28}/>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Entregar</p>
                  <p className="font-black text-slate-800 text-lg truncate leading-tight">{redeemedGift.item?.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center border border-slate-200 shadow-sm text-slate-400">
                  <User size={28}/>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Receptor</p>
                  <p className="font-black text-slate-800">{redeemedGift.receiver?.full_name}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="bg-white p-12 rounded-[64px] shadow-2xl border border-rose-100 max-w-md w-full animate-in shake duration-500 text-center">
            <div className="w-28 h-28 bg-rose-50 text-rose-500 rounded-[40px] flex items-center justify-center mx-auto mb-8">
              <AlertCircle size={56} />
            </div>
            <h2 className="text-3xl font-black text-slate-800 tracking-tighter mb-4 italic uppercase">Error en el Código</h2>
            <p className="text-rose-500 font-bold text-sm mb-12 bg-rose-50 p-4 rounded-2xl">{message}</p>
            <Button onClick={() => setStatus('idle')} variant="danger" className="w-full">Intentar de Nuevo</Button>
          </div>
        )}
      </main>
    </div>
  );
};
