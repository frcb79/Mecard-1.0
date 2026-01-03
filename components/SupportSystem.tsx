
import React, { useState } from 'react';
import { MessageSquare, Send, CheckCircle, Clock, AlertTriangle, ChevronRight, X, Bot, Sparkles } from 'lucide-react';
import { SupportTicket, TicketMessage } from '../types';
import { Button } from './Button';

interface SupportSystemProps {
  tickets: SupportTicket[];
  isAdmin: boolean;
  onUpdateTicket?: (id: string, updates: Partial<SupportTicket>) => void;
  onSendMessage?: (ticketId: string, text: string) => void;
}

export const SupportSystem: React.FC<SupportSystemProps> = ({ tickets, isAdmin, onUpdateTicket, onSendMessage }) => {
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [newMessage, setNewMessage] = useState('');

  const handleSend = () => {
    if (!newMessage.trim() || !selectedTicket) return;
    onSendMessage?.(selectedTicket.id, newMessage);
    setNewMessage('');
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'OPEN': return 'text-rose-600 bg-rose-50 border-rose-100';
      case 'IN_PROGRESS': return 'text-amber-600 bg-amber-50 border-amber-100';
      case 'RESOLVED': return 'text-emerald-600 bg-emerald-50 border-emerald-100';
      default: return 'text-slate-400 bg-slate-50';
    }
  };

  return (
    <div className="h-full flex flex-col md:flex-row bg-[#fdfdfd] animate-in fade-in duration-500 overflow-hidden">
      {/* Sidebar de Tickets */}
      <div className="w-full md:w-96 border-r border-slate-100 flex flex-col h-full bg-white z-10">
        <div className="p-10 border-b border-slate-50">
          <h2 className="text-3xl font-black text-slate-800 tracking-tighter">Help Desk</h2>
          <p className="text-slate-400 font-bold uppercase text-[9px] tracking-[4px] mt-1">Centro de Soporte MeCard</p>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {tickets.map(t => (
            <button 
              key={t.id} 
              onClick={() => setSelectedTicket(t)}
              className={`w-full p-6 rounded-[32px] border text-left transition-all ${selectedTicket?.id === t.id ? 'bg-indigo-50 border-indigo-200 shadow-xl shadow-indigo-100/50' : 'bg-white border-slate-50 hover:border-slate-200'}`}
            >
              <div className="flex justify-between mb-3">
                <span className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border ${getStatusColor(t.status)}`}>{t.status}</span>
                <span className="text-[10px] font-mono text-slate-300">#{t.id}</span>
              </div>
              <h4 className="font-black text-slate-800 text-sm leading-tight mb-2 truncate">{t.subject}</h4>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{new Date(t.createdAt).toLocaleDateString()}</p>
            </button>
          ))}
        </div>
        {!isAdmin && (
          <div className="p-8 border-t border-slate-50">
             <Button className="w-full bg-indigo-600 rounded-2xl py-4 font-black uppercase tracking-widest text-[10px]">Abrir Nuevo Ticket</Button>
          </div>
        )}
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col h-full bg-slate-50/30">
        {selectedTicket ? (
          <>
            <div className="p-10 bg-white border-b border-slate-100 flex justify-between items-center shadow-sm">
               <div>
                  <h3 className="text-xl font-black text-slate-800 leading-none">{selectedTicket.subject}</h3>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Atendido por Soporte MeCard</p>
                  </div>
               </div>
               {isAdmin && selectedTicket.status !== 'RESOLVED' && (
                 <Button onClick={() => onUpdateTicket?.(selectedTicket.id, { status: 'RESOLVED' })} className="bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase"><CheckCircle size={16} className="mr-2"/> Resolver</Button>
               )}
            </div>
            
            <div className="flex-1 overflow-y-auto p-10 space-y-8 scroll-smooth">
               <div className="flex justify-center mb-10">
                  <div className="bg-indigo-50 px-4 py-2 rounded-full border border-indigo-100">
                    <p className="text-[9px] font-black text-indigo-500 uppercase tracking-widest">Ticket creado el {new Date(selectedTicket.createdAt).toLocaleString()}</p>
                  </div>
               </div>
               {selectedTicket.messages.map(m => (
                 <div key={m.id} className={`flex ${m.isAdmin ? 'justify-start' : 'justify-end'}`}>
                    <div className={`max-w-md p-6 rounded-[32px] shadow-sm ${m.isAdmin ? 'bg-white border border-slate-100 rounded-bl-none' : 'bg-indigo-600 text-white rounded-br-none shadow-xl shadow-indigo-100'}`}>
                       <p className={`text-[9px] font-black uppercase tracking-widest mb-2 ${m.isAdmin ? 'text-indigo-500' : 'text-indigo-200'}`}>{m.senderName}</p>
                       <p className="text-sm font-bold leading-relaxed">{m.text}</p>
                       <p className={`text-[8px] font-bold mt-3 uppercase tracking-widest text-right ${m.isAdmin ? 'text-slate-300' : 'text-indigo-300'}`}>{new Date(m.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                    </div>
                 </div>
               ))}
            </div>

            <div className="p-10 bg-white border-t border-slate-100 shadow-[0_-10px_30px_rgba(0,0,0,0.02)]">
               <div className="flex gap-4">
                  <div className="flex-1 relative">
                    <input 
                      value={newMessage}
                      onChange={e => setNewMessage(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleSend()}
                      placeholder="Escribe tu mensaje aquí..." 
                      className="w-full pl-8 pr-16 py-6 bg-slate-50 border-none rounded-[28px] font-bold text-slate-700 outline-none focus:ring-4 focus:ring-indigo-100 transition-all shadow-inner" 
                    />
                    <button onClick={handleSend} className="absolute right-4 top-1/2 -translate-y-1/2 bg-indigo-600 text-white p-4 rounded-2xl shadow-xl hover:scale-110 transition-all"><Send size={20}/></button>
                  </div>
               </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center opacity-20 p-20 grayscale">
             <div className="bg-indigo-50 p-12 rounded-[56px] mb-8"><MessageSquare size={120} strokeWidth={1} className="text-indigo-300" /></div>
             <h3 className="text-2xl font-black text-slate-800 uppercase tracking-[5px]">Selecciona un caso</h3>
             <p className="max-w-xs text-sm font-bold mt-4 leading-relaxed">Nuestros agentes están listos para ayudarte con cualquier problema técnico o financiero.</p>
          </div>
        )}
      </div>
    </div>
  );
};
