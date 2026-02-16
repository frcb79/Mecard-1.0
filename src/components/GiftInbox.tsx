import React, { useState, useEffect } from 'react';
import { Gift, AlertCircle, Check, X } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { socialService } from '../services/supabaseSocial';
import { Gift as GiftType } from '../types';

interface GiftInboxProps {
  onGiftAccepted?: (giftId: string, code: string) => void;
}

/**
 * GiftInbox Component
 *
 * Shows gifts a student has received:
 * - Pending gifts from friends
 * - Gift details (product, sender, message)
 * - Redemption code to use at POS
 * - Accept/Decline buttons
 */
export const GiftInbox: React.FC<GiftInboxProps> = ({ onGiftAccepted }) => {
  const { user } = useAuth();

  const [gifts, setGifts] = useState<GiftType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadGifts = async () => {
      if (!user?.id) return;

      try {
        setLoading(true);
        const { data, error: loadError } = await socialService.getReceivedGifts(user.id);

        if (loadError) {
          setError('Error cargando regalos');
          return;
        }

        setGifts(data || []);
        setError(null);
      } catch (err) {
        console.error('Error loading gifts:', err);
        setError('Error cargando tus regalos');
      } finally {
        setLoading(false);
      }
    };

    loadGifts();
  }, [user?.id]);

  const handleAcceptGift = (gift: GiftType) => {
    if (onGiftAccepted && gift.id && gift.redemption_code) {
      onGiftAccepted(gift.id, gift.redemption_code);
    }
  };

  const handleDeclineGift = (gift: GiftType) => {
    // TODO: Implement decline logic (send back to sender, no charge)
    console.log('Decline gift:', gift.id);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-500">Cargando regalos...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded p-4">
        <p className="text-red-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          {error}
        </p>
      </div>
    );
  }

  if (gifts.length === 0) {
    return (
      <div className="text-center p-8 bg-gray-50 rounded">
        <Gift className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-600">No tienes regalos pendientes aún</p>
        <p className="text-sm text-gray-500 mt-2">
          Cuando tus amigos te regalen algo, aparecerá aquí
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Gift className="w-6 h-6 text-pink-500" />
        <h3 className="text-lg font-bold">Regalos Recibidos</h3>
        <span className="text-sm bg-pink-100 text-pink-800 px-2 py-1 rounded-full">
          {gifts.length}
        </span>
      </div>

      <div className="space-y-3">
        {gifts.map((gift) => (
          <div
            key={gift.id}
            className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
          >
            <div className="flex gap-4">
              {/* Product Image */}
              {gift.product_image && (
                <div className="flex-shrink-0">
                  <img
                    src={gift.product_image}
                    alt={gift.product_name}
                    className="w-20 h-20 object-cover rounded"
                  />
                </div>
              )}

              {/* Gift Details */}
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold text-gray-900">
                      {gift.product_name}
                    </p>
                    <p className="text-sm text-gray-600">
                      De: <span className="font-medium">{gift.sender_name}</span>
                    </p>
                  </div>
                  <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                    Pendiente
                  </span>
                </div>

                {/* Message */}
                {gift.message && (
                  <div className="mb-3 p-2 bg-blue-50 border-l-2 border-blue-300 rounded">
                    <p className="text-sm text-gray-700">💬 {gift.message}</p>
                  </div>
                )}

                {/* Redemption Code */}
                <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded">
                  <p className="text-xs text-gray-600 mb-1">Código para canjear en POS:</p>
                  <p className="font-mono text-lg font-bold text-gray-900">
                    {gift.redemption_code}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAcceptGift(gift)}
                    className="flex items-center gap-1 flex-1 px-3 py-2 bg-green-600 text-white text-sm font-medium rounded hover:bg-green-700 transition"
                  >
                    <Check className="w-4 h-4" />
                    Ir al POS a Canjear
                  </button>
                  <button
                    onClick={() => handleDeclineGift(gift)}
                    className="flex items-center gap-1 px-3 py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded hover:bg-gray-300 transition"
                  >
                    <X className="w-4 h-4" />
                    Rechazar
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Instructions */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded">
        <p className="text-sm text-blue-900">
          <strong>¿Cómo canjear?</strong>
          <br />
          1. Ve a la cafetería y ve al POS
          <br />
          2. Escanea tu credencial (QR/tarjeta)
          <br />
          3. Di el código de tu regalo
          <br />
          4. ¡Confirma y listo! 🎉
        </p>
      </div>
    </div>
  );
};

export default GiftInbox;
