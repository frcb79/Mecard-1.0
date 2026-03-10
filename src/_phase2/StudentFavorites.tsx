import React, { useState, useEffect } from 'react';
import { Heart, Trash2, ShoppingCart } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { socialService } from '../services/supabaseSocial';
import { StudentFavorite } from '../types';

interface StudentFavoritesProps {
  studentId?: string;
  isViewingOtherStudent?: boolean;
  onSendGift?: (productId: string, productName: string, productImage?: string) => void;
}

/**
 * StudentFavorites Component
 *
 * Shows favorite products list for a student.
 * If viewing own favorites: can add/remove
 * If viewing others' public favorites: can send as gift
 */
export const StudentFavorites: React.FC<StudentFavoritesProps> = ({
  studentId,
  isViewingOtherStudent = false,
  onSendGift
}) => {
  const { user } = useAuth();
  const viewingOwnFavorites = !isViewingOtherStudent && studentId === user?.id;

  const [favorites, setFavorites] = useState<StudentFavorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const targetStudentId = studentId || user?.id;

  useEffect(() => {
    const loadFavorites = async () => {
      if (!targetStudentId) return;

      try {
        setLoading(true);
        // Load appropriate favorites based on view
        const data = isViewingOtherStudent
          ? await socialService.getPublicFavorites(targetStudentId)
          : await socialService.getStudentFavorites(targetStudentId);

        setFavorites(data);
        setError(null);
      } catch (err) {
        console.error('Error loading favorites:', err);
        setError('Error cargando favoritos');
      } finally {
        setLoading(false);
      }
    };

    loadFavorites();
  }, [targetStudentId, isViewingOtherStudent]);

  const handleRemoveFavorite = async (productId: string) => {
    try {
      if (!user?.id) return;
      await socialService.removeFavorite(user.id, productId);
      setFavorites(favorites.filter(f => f.productId !== productId));
    } catch (err) {
      console.error('Error removing favorite:', err);
      setError('Error eliminando favorito');
    }
  };

  const handleSendGift = (favorite: StudentFavorite) => {
    if (onSendGift && favorite.productId) {
      onSendGift(
        favorite.productId,
        favorite.productName || 'Producto',
        favorite.productImage
      );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-500">Cargando favoritos...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded p-4">
        <p className="text-red-800">{error}</p>
      </div>
    );
  }

  if (favorites.length === 0) {
    return (
      <div className="text-center p-8 bg-gray-50 rounded">
        <Heart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-600">
          {viewingOwnFavorites
            ? 'No tienes favoritos aún. ¡Agrega algunos productos!'
            : 'Este estudiante no ha agregado favoritos públicos.'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-4">
        <Heart className="w-5 h-5 text-red-500 fill-red-500" />
        <h3 className="font-semibold text-lg">
          {isViewingOtherStudent ? 'Campo que le encanta' : 'Mis Favoritos'}
        </h3>
        <span className="text-sm text-gray-500">({favorites.length})</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {favorites.map((favorite) => (
          <div
            key={favorite.id}
            className="bg-white border border-gray-200 rounded-lg p-3 hover:shadow-md transition"
          >
            {/* Product Image */}
            {favorite.productImage && (
              <div className="mb-2">
                <img
                  src={favorite.productImage}
                  alt={favorite.productName}
                  className="w-full h-24 object-cover rounded"
                />
              </div>
            )}

            {/* Product Name */}
            <p className="font-semibold text-sm text-gray-800 mb-2">
              {favorite.productName}
            </p>

            {/* Action Buttons */}
            <div className="flex gap-2">
              {viewingOwnFavorites ? (
                <button
                  onClick={() => handleRemoveFavorite(favorite.productId)}
                  className="flex items-center gap-1 flex-1 px-3 py-2 text-sm bg-red-50 text-red-600 hover:bg-red-100 rounded transition"
                >
                  <Trash2 className="w-4 h-4" />
                  Quitar
                </button>
              ) : (
                <button
                  onClick={() => handleSendGift(favorite)}
                  className="flex items-center gap-1 flex-1 px-3 py-2 text-sm bg-blue-50 text-blue-600 hover:bg-blue-100 rounded transition"
                >
                  <ShoppingCart className="w-4 h-4" />
                  Regalar
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudentFavorites;
