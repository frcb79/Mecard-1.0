/**
 * StudentMenuView Component
 * Muestra el menú disponible para el estudiante con categorización
 * Accesible desde student y parent dashboards
 */

import React, { useState, useEffect } from 'react';
import { Search, UtensilsCrossed, Salad, Coffee, Cake, TrendingUp, Sparkles } from 'lucide-react';
import { getNutritionalRecommendations } from '../services/geminiService';

export default function StudentMenuView() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | string>('all');
  const [aiInsights, setAiInsights] = useState<string>('');
  const [nutritionTip, setNutritionTip] = useState<string>('');
  const [aiLoading, setAiLoading] = useState<boolean>(false);

  // Load AI nutrition insights on component mount
  useEffect(() => {
    loadAIInsights();
  }, []);

  const loadAIInsights = async () => {
    setAiLoading(true);
    try {
      // Get nutritional insights for today
      const insights = await getNutritionalRecommendations(
        ['Pollo Asado', 'Ensalada Mixta', 'Sandwich Jamón y Queso'],
        [{ calories: 450, protein: '32g', carbs: '45g' }],
        'healthy' // dietary preference
      );
      setAiInsights(insights);
      setNutritionTip('💚 Recuerda mantener un balance nutricional en tus comidas del día');
    } catch (error) {
      setAiInsights('Elige opciones balanceadas de proteína, carbohidratos y vegetales para una alimentación saludable');
      setNutritionTip('🌟 Consulta con la nutricionista escolar para recomendaciones personalizadas');
    } finally {
      setAiLoading(false);
    }
  };

  // MOCK: Menú del día disponible
  const menuItems = [
    {
      id: '1',
      name: 'Pollo Asado con Arroz',
      category: 'hot_meals',
      price: 65.00,
      image: '🍗',
      description: 'Pechuga de pollo a la parrilla',
      available: true,
      nutrition: { calories: 450, protein: '32g', carbs: '45g' }
    },
    {
      id: '2',
      name: 'Ensalada Mixta',
      category: 'salad',
      price: 45.00,
      image: '🥗',
      description: 'Lechuga, tomate, zanahoria',
      available: true,
      nutrition: { calories: 120, protein: '8g', carbs: '15g' }
    },
    {
      id: '3',
      name: 'Café Americano',
      category: 'drinks',
      price: 15.00,
      image: '☕',
      description: 'Café fresco recién preparado',
      available: true,
      nutrition: { calories: 5, protein: '0g', carbs: '1g' }
    },
    {
      id: '4',
      name: 'Pastel de Chocolate',
      category: 'snacks',
      price: 35.00,
      image: '🍰',
      description: 'Porción de pastel casero',
      available: false,
      nutrition: { calories: 280, protein: '4g', carbs: '35g' }
    },
    {
      id: '5',
      name: 'Sandwich Jamón y Queso',
      category: 'sandwiches',
      price: 50.00,
      image: '🥪',
      description: 'Pan integral, jamón de pavo, queso',
      available: true,
      nutrition: { calories: 320, protein: '18g', carbs: '28g' }
    },
    {
      id: '6',
      name: 'Agua Natural',
      category: 'drinks',
      price: 10.00,
      image: '💧',
      description: 'Agua purificada',
      available: true,
      nutrition: { calories: 0, protein: '0g', carbs: '0g' }
    },
  ];

  const categories = [
    { id: 'all', name: 'Todos', icon: '📋' },
    { id: 'hot_meals', name: 'Comidas Calientes', icon: '🍗' },
    { id: 'sandwiches', name: 'Sándwiches', icon: '🥪' },
    { id: 'salad', name: 'Ensaladas', icon: '🥗' },
    { id: 'snacks', name: 'Snacks', icon: '🍿' },
    { id: 'drinks', name: 'Bebidas', icon: '☕' },
  ];

  // Filtrar menú
  const filteredMenu = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Estadísticas
  const availableCount = filteredMenu.filter(i => i.available).length;
  const avgPrice = filteredMenu.length > 0 ? filteredMenu.reduce((acc, i) => acc + i.price, 0) / filteredMenu.length : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-orange-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter mb-2 flex items-center gap-3">
            <UtensilsCrossed className="w-8 h-8 text-orange-600" />
            Menú Disponible Hoy
          </h1>
          <p className="text-slate-500 font-medium">
            Consulta los productos disponibles en nuestras unidades de venta
          </p>
        </div>

        {/* AI NUTRITION INSIGHTS */}
        <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-[28px] shadow-lg p-6 mb-8 border-2 border-emerald-200">
          {aiLoading ? (
            <div className="flex items-center justify-center py-6">
              <div className="animate-spin mr-3">
                <Sparkles className="w-6 h-6 text-emerald-600" />
              </div>
              <p className="text-emerald-700 font-bold text-lg">Analizando opciones nutricionales...</p>
            </div>
          ) : (
            <div>
              <div className="flex items-start gap-3 mb-4">
                <TrendingUp className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h3 className="font-black text-slate-900 text-lg mb-2">💚 Recomendación Nutricional de Hoy</h3>
                  <p className="text-emerald-900 font-medium">{aiInsights}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm bg-white rounded-[16px] p-3">
                <span className="text-lg">🌟</span>
                <p className="text-slate-700 font-semibold">{nutritionTip}</p>
              </div>
              <button
                onClick={loadAIInsights}
                disabled={aiLoading}
                className="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-[12px] transition-all disabled:opacity-50"
              >
                Actualizar Recomendación
              </button>
            </div>
          )}
        </div>

        {/* BÚSQUEDA */}
        <div className="bg-white rounded-[28px] shadow-lg p-6 mb-8">
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar productos, comidas, bebidas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-[16px] outline-none focus:border-orange-600 transition-all font-medium"
            />
          </div>

          {/* CATEGORÍAS */}
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-[16px] font-black text-[10px] uppercase tracking-[1px] transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-orange-600 text-white shadow-lg'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span className="mr-2">{cat.icon}</span> {cat.name}
              </button>
            ))}
          </div>

          {/* ESTADÍSTICAS */}
          <div className="mt-6 pt-6 border-t border-slate-100 grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[2px]">Total</p>
              <p className="text-2xl font-black text-slate-900">{filteredMenu.length}</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[2px]">Disponibles</p>
              <p className="text-2xl font-black text-emerald-600">{availableCount}</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] font-black text-orange-400 uppercase tracking-[2px]">Precio Promedio</p>
              <p className="text-2xl font-black text-orange-600">${avgPrice.toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* GRID DE PRODUCTOS */}
        {filteredMenu.length === 0 ? (
          <div className="bg-white rounded-[28px] shadow-lg p-12 text-center">
            <UtensilsCrossed className="w-16 h-16 text-slate-200 mx-auto mb-4" />
            <p className="text-slate-500 font-bold text-lg">No hay productos que coincidan</p>
            <p className="text-slate-400 text-sm mt-1">Intenta cambiar tu búsqueda o categoría</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMenu.map(item => (
              <div
                key={item.id}
                className={`rounded-[28px] shadow-lg p-6 transition-all hover:shadow-2xl hover:-translate-y-2 ${
                  item.available ? 'bg-white' : 'bg-slate-100 opacity-60'
                }`}
              >
                {/* HEADER */}
                <div className="flex items-start justify-between mb-4">
                  <div className="text-5xl">{item.image}</div>
                  {!item.available && (
                    <span className="bg-rose-100 text-rose-600 px-3 py-1 rounded-[12px] text-[8px] font-black uppercase tracking-[1px]">
                      Agotado
                    </span>
                  )}
                  {item.available && (
                    <span className="bg-emerald-100 text-emerald-600 px-3 py-1 rounded-[12px] text-[8px] font-black uppercase tracking-[1px]">
                      Disponible
                    </span>
                  )}
                </div>

                {/* INFO */}
                <h3 className="text-lg font-black text-slate-900 mb-1">{item.name}</h3>
                <p className="text-[11px] text-slate-500 font-medium mb-4">{item.description}</p>

                {/* NUTRICIÓN */}
                <div className="mb-4 p-3 bg-orange-50 rounded-[16px]">
                  <p className="text-[9px] font-black text-orange-600 uppercase tracking-[1px] mb-2 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" /> Nutrición
                  </p>
                  <div className="grid grid-cols-3 gap-2 text-[10px] font-bold text-slate-700">
                    <div>
                      <p className="text-orange-600">{item.nutrition.calories}</p>
                      <p className="text-slate-500">kcal</p>
                    </div>
                    <div>
                      <p className="text-orange-600">{item.nutrition.protein}</p>
                      <p className="text-slate-500">proteína</p>
                    </div>
                    <div>
                      <p className="text-orange-600">{item.nutrition.carbs}</p>
                      <p className="text-slate-500">carbs</p>
                    </div>
                  </div>
                </div>

                {/* PRECIO Y BOTÓN */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[1px]">Precio</p>
                    <p className="text-2xl font-black text-orange-600">${item.price.toFixed(2)}</p>
                  </div>
                  <button
                    disabled={!item.available}
                    className={`px-4 py-2 rounded-[16px] font-black text-[10px] uppercase tracking-[1px] transition-all ${
                      item.available
                        ? 'bg-orange-600 hover:bg-orange-700 text-white hover:shadow-lg'
                        : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    Agregar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* INFO BOX */}
        <div className="mt-12 bg-blue-50 border-2 border-blue-100 rounded-[24px] p-6">
          <p className="text-sm text-blue-900 font-bold">
            💡 <strong>Información Nutricional:</strong> Los datos mostrados son aproximadas. Consulta con el personal de la cafetería para información dietética específica o ingredientes alérgenos.
          </p>
        </div>

        {/* HORARIOS */}
        <div className="mt-6 bg-amber-50 border-2 border-amber-100 rounded-[24px] p-6">
          <p className="text-[10px] font-black text-amber-600 uppercase tracking-[2px] mb-3">Horarios de Servicio</p>
          <div className="grid grid-cols-3 gap-4 text-sm font-medium text-amber-900">
            <div>
              <p className="font-black">🌅 Desayuno</p>
              <p className="text-[11px]">7:00 AM - 9:00 AM</p>
            </div>
            <div>
              <p className="font-black">🍽️ Comida</p>
              <p className="text-[11px]">12:00 PM - 1:30 PM</p>
            </div>
            <div>
              <p className="font-black">☕ Refección</p>
              <p className="text-[11px]">3:00 PM - 4:00 PM</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
