import React, { useState, useEffect } from 'react';
import { Send, Search, AlertCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { socialService } from '../services/supabaseSocial';
import { Friend, StudentFavorite } from '../types';

interface GiftSenderProps {
  onGiftSent?: (recipientId: string, productId: string) => void;
}

/**
 * GiftSender Component
 *
 * Allows Student A to:
 * 1. Search for a friend
 * 2. View their public favorites
 * 3. Select a product to gift
 * 4. Send gift with optional message
 * 5. Balance is deferred until POS redemption
 */
export const GiftSender: React.FC<GiftSenderProps> = ({ onGiftSent }) => {
  const { user } = useAuth();
  const schoolId = (user as any)?.schoolId || 'mx_01';

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [friendFavorites, setFriendFavorites] = useState<StudentFavorite[]>([]);
  const [selectedFavorite, setSelectedFavorite] = useState<StudentFavorite | null>(null);
  const [message, setMessage] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Step 1: Search for friend
  const handleSearchFriend = async () => {
    if (!searchTerm.trim() || !schoolId) {
      setError('Ingresa la matrícula o nombre del amigo');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const { data, error: searchError } = await socialService.findPotentialFriend(
        schoolId,
        searchTerm
      );

      if (searchError || !data) {
        setError('Amigo no encontrado. Verifica la matrícula o nombre.');
        setSelectedFriend(null);
        return;
      }

      setSelectedFriend(data);
      // Once friend is found, load their public favorites
      await loadFriendFavorites(data.id);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error buscando amigo');
      setSelectedFriend(null);
    } finally {
      setLoading(false);
    }
  };

  // Load friend's public favorites
  const loadFriendFavorites = async (friendId: string) => {
    try {
      const favorites = await socialService.getPublicFavorites(friendId);
      setFriendFavorites(favorites);
      setSelectedFavorite(null);

      if (favorites.length === 0) {
        setError('Este amigo no ha agregado productos a favoritos aún.');
      }
    } catch (err) {
      console.error('Error loading favorites:', err);
      setError('Error cargando favoritos del amigo');
      setFriendFavorites([]);
    }
  };

  // Step 3: Send gift
  const handleSendGift = async () => {
    if (!selectedFriend || !selectedFavorite || !user?.id) {
      setError('Selecciona un amigo y un producto');
      return;
    }

    if (!selectedFavorite.productId) {
      setError('Error: producto inválido');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Call sendGift service
      const { giftId, code } = await socialService.sendGift(
        user.id,
        selectedFriend.id,
        {
          id: selectedFavorite.productId,
          name: selectedFavorite.productName || 'Producto',
          price: 0 // Price will be fetched from inventory in actual implementation
        },
        schoolId,
        message || undefined
      );

      setSuccess(true);
      setMessage('');
      setSelectedFavorite(null);
      setSearchTerm('');
      setSelectedFriend(null);

      if (onGiftSent) {
        onGiftSent(selectedFriend.id, selectedFavorite.productId);
      }

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error enviando regalo');
    } finally {
      setLoading(false);
    }
  };

  const canSendGift = selectedFriend && selectedFavorite && !loading;

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Send className="w-5 h-5 text-blue-600" />
          Enviar un regalo
        </h3>

        {/* Step 1: Search Friend */}
        <div className="space-y-3 mb-6">
          <label className="block text-sm font-medium text-gray-700">
            1. Busca a un amigo
          </label>
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Ingresa matrícula o nombre"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearchFriend()}
                disabled={loading}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={handleSearchFriend}
              disabled={loading || !searchTerm.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {loading ? 'Buscando...' : 'Buscar'}
            </button>
          </div>
        </div>

        {/* Step 2: Friend's Favorites */}
        {selectedFriend && friendFavorites.length > 0 && (
          <div className="space-y-3 mb-6">
            <label className="block text-sm font-medium text-gray-700">
              2. Selecciona un regalo de sus favoritos
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {friendFavorites.map((fav) => (
                <button
                  key={fav.id}
                  onClick={() => setSelectedFavorite(fav)}
                  className={`p-3 rounded border-2 transition text-left ${
                    selectedFavorite?.id === fav.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  {fav.productImage && (
                    <img
                      src={fav.productImage}
                      alt={fav.productName}
                      className="w-full h-20 object-cover rounded mb-2"
                    />
                  )}
                  <p className="font-semibold text-sm text-gray-800">
                    {fav.productName}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Message */}
        {selectedFavorite && (
          <div className="space-y-3 mb-6">
            <label className="block text-sm font-medium text-gray-700">
              3. Agrega un mensaje (opcional)
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="¡Espero que te encante! ✨"
              maxLength={200}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
            <p className="text-xs text-gray-500">
              {message.length}/200 caracteres
            </p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded flex gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded">
            <p className="text-sm text-green-800">
              ✅ ¡Regalo enviado! {selectedFriend?.fullName} lo recibirá en la app
            </p>
          </div>
        )}

        {/* Send Button */}
        <button
          onClick={handleSendGift}
          disabled={!canSendGift}
          className="w-full px-4 py-3 bg-green-600 text-white font-semibold rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
        >
          <Send className="w-4 h-4" />
          Enviar Regalo
        </button>

        {/* Info Text */}
        <p className="mt-4 text-xs text-gray-500 text-center">
          💡 Nota: El dinero no se cobra hasta que tu amigo lo canjee en el POS
        </p>
      </div>

      {/* Selected Friend Summary */}
      {selectedFriend && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-900">
            <strong>Enviando a:</strong> {selectedFriend.fullName}
            {selectedFavorite && (
              <>
                <br />
                <strong>Producto:</strong> {selectedFavorite.productName}
              </>
            )}
          </p>
        </div>
      )}
    </div>
  );
};

export default GiftSender;
