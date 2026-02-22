import React, { useState } from 'react';
import { Gift, Send, Inbox, Clock, Users, Search, Heart, Check, X, QrCode, Sparkles, UserPlus } from 'lucide-react';
import { MOCK_STUDENT_GIFTS_SENT, MOCK_STUDENT_GIFTS_RECEIVED, MOCK_STUDENT_FRIENDS } from '../constants';
import type { Gift as GiftType, Friend } from '../types';

type Tab = 'send' | 'received' | 'sent' | 'friends';

export default function StudentGiftsView() {
  const [tab, setTab] = useState<Tab>('received');
  const [searchFriend, setSearchFriend] = useState('');
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [giftMessage, setGiftMessage] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [addFriendSearch, setAddFriendSearch] = useState('');

  const friends = MOCK_STUDENT_FRIENDS;
  const received = MOCK_STUDENT_GIFTS_RECEIVED;
  const sent = MOCK_STUDENT_GIFTS_SENT;

  const filteredFriends = searchFriend
    ? friends.filter(f => f.fullName.toLowerCase().includes(searchFriend.toLowerCase()) || f.studentId.includes(searchFriend))
    : friends;

  const tabs: { id: Tab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'received', label: 'Recibidos', icon: <Inbox size={16} />, badge: received.filter(g => g.status === 'PENDING').length },
    { id: 'send', label: 'Enviar', icon: <Send size={16} /> },
    { id: 'sent', label: 'Enviados', icon: <Clock size={16} /> },
    { id: 'friends', label: 'Amigos', icon: <Users size={16} /> },
  ];

  const statusBadge = (status: string) => {
    const map: Record<string, { bg: string; text: string; label: string }> = {
      PENDING: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Pendiente' },
      REDEEMED: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Canjeado' },
      EXPIRED: { bg: 'bg-red-100', text: 'text-red-700', label: 'Expirado' },
      CANCELLED: { bg: 'bg-slate-100', text: 'text-slate-500', label: 'Cancelado' },
    };
    const s = map[status] || { bg: 'bg-slate-100', text: 'text-slate-500', label: status };
    return <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${s.bg} ${s.text}`}>{s.label}</span>;
  };

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `hace ${mins}m`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `hace ${hours}h`;
    const days = Math.floor(hours / 24);
    return `hace ${days}d`;
  };

  // Demo favorite products for the "send" flow
  const DEMO_FRIEND_FAVORITES = [
    { id: 'fav1', name: 'Torta de Jamón', emoji: '🥪', price: 45 },
    { id: 'fav2', name: 'Jugo de Naranja', emoji: '🧃', price: 25 },
    { id: 'fav3', name: 'Galletas', emoji: '🍪', price: 15 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-teal-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white">
            <Gift size={22} />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-800">Regalos</h1>
            <p className="text-xs text-slate-500">Envía y recibe regalos de compañeros</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all relative ${tab === t.id ? 'bg-emerald-600 text-white' : 'bg-white text-slate-600 border border-slate-200'}`}>
              {t.icon} {t.label}
              {t.badge && t.badge > 0 && (
                <span className={`ml-1 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black ${tab === t.id ? 'bg-white text-emerald-600' : 'bg-rose-500 text-white'}`}>
                  {t.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Received Tab */}
        {tab === 'received' && (
          <div className="space-y-3">
            {received.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center border border-slate-100">
                <Inbox className="mx-auto text-slate-300 mb-3" size={40} />
                <p className="text-sm text-slate-500 font-bold">No has recibido regalos aún</p>
              </div>
            ) : (
              received.map(gift => (
                <div key={gift.id} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${gift.status === 'PENDING' ? 'bg-amber-100' : 'bg-slate-100'}`}>
                      <Gift size={18} className={gift.status === 'PENDING' ? 'text-amber-600' : 'text-slate-400'} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-bold text-slate-800">{gift.productName}</h3>
                        {statusBadge(gift.status)}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">De: <span className="font-bold">{gift.senderId === '2024003' ? 'Valentina López' : 'Mateo Hernández'}</span></p>
                      {gift.message && <p className="text-xs text-slate-500 italic mt-1">"{gift.message}"</p>}
                      <p className="text-[10px] text-slate-400 mt-1">{timeAgo(gift.sentAt)}</p>
                    </div>
                  </div>

                  {gift.status === 'PENDING' && gift.redemptionCode && (
                    <div className="mt-3 bg-emerald-50 rounded-xl p-3 border border-emerald-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <QrCode size={14} className="text-emerald-600" />
                          <span className="text-xs font-bold text-emerald-700">Código de Canje</span>
                        </div>
                        <span className="text-sm font-mono font-black text-emerald-800 tracking-wider">{gift.redemptionCode}</span>
                      </div>
                      <p className="text-[10px] text-emerald-500 mt-1">Muestra este código en la cafetería para recibir tu regalo</p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* Send Tab */}
        {tab === 'send' && (
          <div className="space-y-4">
            {!selectedFriend ? (
              <>
                {/* Search friend */}
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                  <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2"><Search size={14} /> Buscar amigo</h3>
                  <div className="flex gap-2">
                    <input type="text" placeholder="Nombre o matrícula..."
                      value={searchFriend} onChange={e => setSearchFriend(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                  </div>
                </div>

                {/* Friend results */}
                <div className="space-y-2">
                  {filteredFriends.map(f => (
                    <button key={f.id} onClick={() => { setSelectedFriend(f); setSearchFriend(''); }}
                      className="w-full bg-white rounded-xl p-3 shadow-sm border border-slate-100 flex items-center gap-3 hover:border-emerald-300 transition-all text-left">
                      <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold text-sm">
                        {f.fullName.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-800 truncate">{f.fullName}</p>
                        <p className="text-[10px] text-slate-400">{f.grade} • {f.studentId}</p>
                      </div>
                      {f.favoritesPublic && <Heart size={14} className="text-rose-400 flex-shrink-0" />}
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <>
                {/* Selected friend */}
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-emerald-200">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold">
                        {selectedFriend.fullName.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">{selectedFriend.fullName}</p>
                        <p className="text-[10px] text-slate-400">{selectedFriend.grade}</p>
                      </div>
                    </div>
                    <button onClick={() => { setSelectedFriend(null); setSelectedProduct(null); setGiftMessage(''); }}
                      className="p-1 rounded-lg hover:bg-slate-100"><X size={16} className="text-slate-400" /></button>
                  </div>

                  {/* Allergen Warning */}
                  {selectedFriend.allergies && selectedFriend.allergies.length > 0 && (
                    <div className="bg-rose-50 rounded-lg p-2 border border-rose-200 mb-3">
                      <p className="text-[10px] text-rose-700 font-bold">⚠️ Alergias: {selectedFriend.allergies.join(', ')}</p>
                    </div>
                  )}

                  {/* Product selection */}
                  <p className="text-xs font-bold text-slate-600 mb-2">
                    {selectedFriend.favoritesPublic ? '❤️ Sus favoritos:' : '🎁 Productos disponibles:'}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {DEMO_FRIEND_FAVORITES.map(p => (
                      <button key={p.id} onClick={() => setSelectedProduct(p.id)}
                        className={`p-3 rounded-xl border text-left transition-all ${selectedProduct === p.id ? 'border-emerald-400 bg-emerald-50' : 'border-slate-200 bg-white hover:border-emerald-200'}`}>
                        <span className="text-xl">{p.emoji}</span>
                        <p className="text-xs font-bold text-slate-800 mt-1">{p.name}</p>
                        <p className="text-[10px] text-emerald-600 font-bold">${p.price}</p>
                      </button>
                    ))}
                  </div>

                  {/* Message */}
                  <input type="text" placeholder="Mensaje (opcional)..."
                    value={giftMessage} onChange={e => setGiftMessage(e.target.value)}
                    className="w-full mt-3 px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />

                  {/* Send Button */}
                  <button disabled={!selectedProduct}
                    onClick={() => {
                      alert('🎉 ¡Regalo enviado! (Demo)');
                      setSelectedFriend(null); setSelectedProduct(null); setGiftMessage('');
                    }}
                    className={`w-full mt-3 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold transition-all ${selectedProduct ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}>
                    <Send size={16} /> Enviar Regalo
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* Sent Tab */}
        {tab === 'sent' && (
          <div className="space-y-3">
            {sent.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center border border-slate-100">
                <Send className="mx-auto text-slate-300 mb-3" size={40} />
                <p className="text-sm text-slate-500 font-bold">No has enviado regalos aún</p>
              </div>
            ) : (
              sent.map(gift => (
                <div key={gift.id} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center">
                      <Send size={16} className="text-teal-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-bold text-slate-800">{gift.productName}</h3>
                        {statusBadge(gift.status)}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">Para: <span className="font-bold">{gift.receiverId === '2024003' ? 'Valentina López' : 'Compañero'}</span></p>
                      {gift.message && <p className="text-xs text-slate-500 italic mt-1">"{gift.message}"</p>}
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-[10px] text-slate-400">{timeAgo(gift.sentAt)}</span>
                        <span className="text-[10px] font-bold text-emerald-600">${gift.amount.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Friends Tab */}
        {tab === 'friends' && (
          <div className="space-y-4">
            {/* Add friend */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
              <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2"><UserPlus size={14} /> Agregar amigo</h3>
              <div className="flex gap-2">
                <input type="text" placeholder="Matrícula del compañero..."
                  value={addFriendSearch} onChange={e => setAddFriendSearch(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                <button onClick={() => { alert('🎉 Solicitud enviada (Demo)'); setAddFriendSearch(''); }}
                  className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 disabled:opacity-50" disabled={!addFriendSearch.trim()}>
                  Agregar
                </button>
              </div>
            </div>

            {/* Friend List */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 divide-y divide-slate-100">
              {friends.map(f => (
                <div key={f.id} className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold">
                    {f.fullName.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-800 truncate">{f.fullName}</p>
                    <p className="text-[10px] text-slate-400">{f.grade} • {f.studentId}</p>
                    {f.favorites && f.favorites.length > 0 && f.favoritesPublic && (
                      <div className="flex items-center gap-1 mt-0.5">
                        <Heart size={10} className="text-rose-400" />
                        <span className="text-[10px] text-slate-400">{f.favorites.length} favoritos</span>
                      </div>
                    )}
                  </div>
                  <button onClick={() => { setSelectedFriend(f); setTab('send'); }}
                    className="p-2 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-all">
                    <Gift size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Demo Banner */}
        <div className="mt-6 bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-center">
          <p className="text-xs text-emerald-700 font-bold">🎮 Modo Demo — datos de ejemplo</p>
        </div>
      </div>
    </div>
  );
}
