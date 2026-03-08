/**
 * AdminRewardsConfig Component
 * Panel de configuración de Rewards para Super Admin
 * Permite ajustar: markup %, puntos por peso, tiers, ciclos
 */

import React, { useState, useEffect } from 'react';
import {
  Settings,
  Save,
  RotateCcw,
  AlertCircle,
  CheckCircle,
  Loader2,
  Percent,
  Zap,
  Calendar,
  Trophy,
  ImagePlus,
  PackagePlus,
  Inbox
} from 'lucide-react';
import { SchoolRewardsConfig } from '../types';
import { MarketplaceSuggestion, rewardsService } from '../services/rewardsService';

interface AdminRewardsConfigProps {
  schoolId?: string;
  schoolName?: string;
  onSave?: (config: SchoolRewardsConfig) => void;
}

interface AdminMarketplaceProduct {
  id: string;
  name: string;
  description: string;
  pointsCost: number;
  stock: number;
  imageUrl?: string;
}

export const AdminRewardsConfig: React.FC<AdminRewardsConfigProps> = ({
  schoolId = 'mx_01',
  schoolName = 'Instituto Cumbres',
  onSave
}) => {
  const [config, setConfig] = useState<SchoolRewardsConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [marketplaceProducts, setMarketplaceProducts] = useState<AdminMarketplaceProduct[]>([]);
  const [marketplaceLoading, setMarketplaceLoading] = useState(false);
  const [marketplaceSuggestions, setMarketplaceSuggestions] = useState<MarketplaceSuggestion[]>([]);
  const [draftProduct, setDraftProduct] = useState({
    name: '',
    description: '',
    category: 'TECH',
    pointsCost: '500',
    stock: '10',
    imageUrl: '',
  });

  // Load config on mount
  useEffect(() => {
    loadConfig();
  }, [schoolId]);

  useEffect(() => {
    loadMarketplaceData();
  }, [schoolId]);

  const loadConfig = async () => {
    setLoading(true);
    try {
      const cfg = await rewardsService.mockGetSchoolRewardsConfig(schoolId);
      setConfig(cfg);
      setHasChanges(false);
    } catch (err) {
      setMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Error cargando configuración'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadMarketplaceData = async () => {
    setMarketplaceLoading(true);
    try {
      const [products, suggestions] = await Promise.all([
        rewardsService.getMarketplaceProducts(schoolId),
        rewardsService.getMarketplaceSuggestions()
      ]);

      setMarketplaceProducts(
        products.map((item) => ({
          id: item.id,
          name: item.name,
          description: item.description,
          pointsCost: item.pointsCost,
          stock: item.currentStock,
          imageUrl: item.imageUrl
        }))
      );
      setMarketplaceSuggestions(suggestions);
    } catch {
      setMessage({
        type: 'error',
        text: 'No se pudieron cargar productos o sugerencias del marketplace'
      });
    } finally {
      setMarketplaceLoading(false);
    }
  };

  const handleFieldChange = (field: string, value: string | number | boolean) => {
    if (!config) return;

    let updatedConfig = { ...config };

    if (field.startsWith('tiers.')) {
      const tierField = field.split('.')[1];
      updatedConfig.tierThresholds = {
        ...updatedConfig.tierThresholds,
        [tierField]: parseInt(value) || 0
      };
    } else {
      updatedConfig = {
        ...updatedConfig,
        [field]: typeof value === 'boolean' ? value : (
          field === 'markupPercentage' || field === 'pointsPerPeso' ? parseInt(value) || 0 : value
        )
      };
    }

    setConfig(updatedConfig);
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!config) return;

    setSaving(true);
    try {
      // Here you would call a real Supabase API to save
      // For now, just simulate success
      await new Promise(resolve => setTimeout(resolve, 1000));

      setMessage({
        type: 'success',
        text: 'Configuración guardada exitosamente'
      });
      setHasChanges(false);
      onSave?.(config);

      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Error al guardar'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    loadConfig();
    setHasChanges(false);
  };

  const handleProductImageUpload = (file: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setDraftProduct(prev => ({
        ...prev,
        imageUrl: String(reader.result || ''),
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleAddMarketplaceProduct = async () => {
    if (!draftProduct.name.trim() || !draftProduct.description.trim()) {
      setMessage({
        type: 'error',
        text: 'Nombre y descripcion del producto son obligatorios'
      });
      return;
    }

    const pointsCost = Number(draftProduct.pointsCost);
    const stock = Number(draftProduct.stock);

    try {
      const created = await rewardsService.createMarketplaceProduct({
        name: draftProduct.name.trim(),
        description: draftProduct.description.trim(),
        category: draftProduct.category,
        pointsCost: Number.isFinite(pointsCost) && pointsCost > 0 ? pointsCost : 500,
        stockQuantity: Number.isFinite(stock) && stock >= 0 ? stock : 0,
        imageUrl: draftProduct.imageUrl || undefined,
        available: true,
        featured: false,
        schoolId
      });

      const newProduct: AdminMarketplaceProduct = {
        id: created.id,
        name: created.name,
        description: created.description,
        pointsCost: created.pointsCost,
        stock: created.currentStock,
        imageUrl: created.imageUrl
      };

      setMarketplaceProducts(prev => [newProduct, ...prev]);
      setDraftProduct({ name: '', description: '', category: 'TECH', pointsCost: '500', stock: '10', imageUrl: '' });
      setMessage({ type: 'success', text: 'Producto del marketplace guardado' });
      setTimeout(() => setMessage(null), 3000);
    } catch {
      setMessage({ type: 'error', text: 'No se pudo guardar el producto del marketplace' });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-indigo-600 mx-auto mb-3 animate-spin" />
          <p className="text-slate-600 font-semibold">Cargando configuración...</p>
        </div>
      </div>
    );
  }

  if (!config) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
        <div className="flex gap-3">
          <AlertCircle className="text-red-600 flex-shrink-0" />
          <p className="text-red-700 font-semibold">Error al cargar la configuración</p>
        </div>
      </div>
    );
  }

  const handleConfigTest = () => {
    const { markupAmount, pointsEarned } = rewardsService.calculatePointsFromPurchase(100, config);
    setMessage({
      type: 'success',
      text: `Prueba: Compra de $100 → Markup: $${markupAmount.toFixed(2)} → ${pointsEarned} puntos`
    });
    setTimeout(() => setMessage(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-100 rounded-lg">
            <Settings className="text-indigo-600" size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900">Configuración de Rewards</h2>
            <p className="text-slate-600 text-sm">{schoolName || schoolId}</p>
          </div>
        </div>
        {hasChanges && (
          <div className="text-amber-600 text-sm font-bold flex items-center gap-2">
            <AlertCircle size={16} />
            Cambios sin guardar
          </div>
        )}
      </div>

      {/* Notification */}
      {message && (
        <div className={`p-4 rounded-2xl flex items-center gap-3 ${
          message.type === 'success'
            ? 'bg-green-50 text-green-700 border border-green-200'
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle size={20} />
          ) : (
            <AlertCircle size={20} />
          )}
          <p className="font-semibold">{message.text}</p>
        </div>
      )}

      {/* Main Config Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sección 1: Parámetros Básicos */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
          <h3 className="text-lg font-black text-slate-900 mb-5 flex items-center gap-2">
            <Percent size={20} />
            Parámetros Básicos
          </h3>

          <div className="space-y-5">
            {/* Markup Percentage */}
            <div>
              <label htmlFor="rewards-markup" className="block text-sm font-bold text-slate-700 mb-2">
                Porcentaje de Markup (%)<span className="text-red-500">*</span>
              </label>
              <p className="text-xs text-slate-500 mb-2">
                Incremento sobre precio base que financia los rewards (5-15% recomendado)
              </p>
              <div className="flex items-center gap-2">
                <input
                  id="rewards-markup"
                  type="number"
                  min="1"
                  max="30"
                  step="0.5"
                  value={config.markupPercentage}
                  onChange={(e) => handleFieldChange('markupPercentage', e.target.value)}
                  className="flex-1 px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />
                <span className="text-2xl font-black text-indigo-600">%</span>
              </div>
            </div>

            {/* Points Per Peso */}
            <div>
              <label htmlFor="rewards-points-per-peso" className="block text-sm font-bold text-slate-700 mb-2">
                Puntos por Peso<span className="text-red-500">*</span>
              </label>
              <p className="text-xs text-slate-500 mb-2">
                Cuántos puntos se generan por cada peso de markup (default: 10)
              </p>
              <div className="flex items-center gap-2">
                <input
                  id="rewards-points-per-peso"
                  type="number"
                  min="1"
                  max="50"
                  step="1"
                  value={config.pointsPerPeso}
                  onChange={(e) => handleFieldChange('pointsPerPeso', e.target.value)}
                  className="flex-1 px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />
                <span className="text-2xl font-black text-indigo-600">pts/$</span>
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.enabled}
                  onChange={(e) => handleFieldChange('enabled', e.target.checked)}
                  className="w-5 h-5 rounded border-slate-300"
                  role="switch"
                  aria-checked={config.enabled}
                />
                <span className="text-sm font-bold text-slate-700">Sistema Habilitado</span>
              </label>
            </div>

            {/* Test Button */}
            <button
              onClick={handleConfigTest}
              className="w-full mt-4 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg transition-colors text-sm"
            >
              Probar Configuración
            </button>
          </div>
        </div>

        {/* Sección 2: Ciclo Escolar */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
          <h3 className="text-lg font-black text-slate-900 mb-5 flex items-center gap-2">
            <Calendar size={20} />
            Ciclo Escolar
          </h3>

          <div className="space-y-5">
            {/* Cycle Start */}
            <div>
              <label htmlFor="rewards-cycle-start" className="block text-sm font-bold text-slate-700 mb-2">
                Inicio de Ciclo<span className="text-red-500">*</span>
              </label>
              <input
                id="rewards-cycle-start"
                type="date"
                value={config.cycleStartDate}
                onChange={(e) => handleFieldChange('cycleStartDate', e.target.value)}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            {/* Cycle End */}
            <div>
              <label htmlFor="rewards-cycle-end" className="block text-sm font-bold text-slate-700 mb-2">
                Fin de Ciclo<span className="text-red-500">*</span>
              </label>
              <input
                id="rewards-cycle-end"
                type="date"
                value={config.cycleEndDate}
                onChange={(e) => handleFieldChange('cycleEndDate', e.target.value)}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-700">
              <p className="font-bold mb-1">ℹ️ Duración del ciclo</p>
              <p>
                Desde {new Date(config.cycleStartDate).toLocaleDateString('es-MX')} hasta{' '}
                {new Date(config.cycleEndDate).toLocaleDateString('es-MX')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Sección 3: Tiers y Thresholds */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
        <h3 className="text-lg font-black text-slate-900 mb-5 flex items-center gap-2">
          <Trophy size={20} />
          Umbrales de Tiers
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Silver */}
          <div>
            <label htmlFor="tier-silver" className="block text-sm font-bold text-slate-700 mb-2">
              🥈 Nivel Silver<span className="text-red-500">*</span>
            </label>
            <p className="text-xs text-slate-500 mb-2">Puntos para alcanzar Silver</p>
            <div className="flex items-center gap-2">
              <input
                id="tier-silver"
                type="number"
                min="100"
                step="100"
                value={config.tierThresholds.silver}
                onChange={(e) => handleFieldChange('tiers.silver', e.target.value)}
                className="flex-1 px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              />
              <span className="text-sm font-bold text-slate-600">pts</span>
            </div>
          </div>

          {/* Gold */}
          <div>
            <label htmlFor="tier-gold" className="block text-sm font-bold text-slate-700 mb-2">
              🥇 Nivel Gold<span className="text-red-500">*</span>
            </label>
            <p className="text-xs text-slate-500 mb-2">Puntos para alcanzar Gold</p>
            <div className="flex items-center gap-2">
              <input
                id="tier-gold"
                type="number"
                min="100"
                step="100"
                value={config.tierThresholds.gold}
                onChange={(e) => handleFieldChange('tiers.gold', e.target.value)}
                className="flex-1 px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              />
              <span className="text-sm font-bold text-slate-600">pts</span>
            </div>
          </div>

          {/* Platinum */}
          <div>
            <label htmlFor="tier-platinum" className="block text-sm font-bold text-slate-700 mb-2">
              💎 Nivel Platinum<span className="text-red-500">*</span>
            </label>
            <p className="text-xs text-slate-500 mb-2">Puntos para alcanzar Platinum</p>
            <div className="flex items-center gap-2">
              <input
                id="tier-platinum"
                type="number"
                min="100"
                step="100"
                value={config.tierThresholds.platinum}
                onChange={(e) => handleFieldChange('tiers.platinum', e.target.value)}
                className="flex-1 px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              />
              <span className="text-sm font-bold text-slate-600">pts</span>
            </div>
          </div>
        </div>

        {/* Tier Benefits */}
        <div className="mt-6 p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg border border-amber-200">
          <p className="text-xs font-bold text-amber-900 mb-2">📊 Beneficios por Tier:</p>
          <ul className="text-xs text-amber-800 space-y-1">
            <li>🥉 <strong>Bronze (0 - {config.tierThresholds.silver}):</strong> 0% multiplicador</li>
            <li>🥈 <strong>Silver ({config.tierThresholds.silver} - {config.tierThresholds.gold}):</strong> 5% multiplicador</li>
            <li>🥇 <strong>Gold ({config.tierThresholds.gold} - {config.tierThresholds.platinum}):</strong> 10% multiplicador</li>
            <li>💎 <strong>Platinum ({config.tierThresholds.platinum}+):</strong> 15% multiplicador</li>
          </ul>
        </div>
      </div>

      {/* Seccion 4: Marketplace Products */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-5">
        <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
          <PackagePlus size={20} /> Productos del Marketplace
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div>
              <label htmlFor="marketplace-name" className="block text-sm font-bold text-slate-700 mb-2">Nombre del producto</label>
              <input
                id="marketplace-name"
                value={draftProduct.name}
                onChange={(e) => setDraftProduct(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="Ej. Kit STEM Basico"
              />
            </div>

            <div>
              <label htmlFor="marketplace-description" className="block text-sm font-bold text-slate-700 mb-2">Descripcion del producto</label>
              <textarea
                id="marketplace-description"
                value={draftProduct.description}
                onChange={(e) => setDraftProduct(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="Describe beneficios, contenido y restricciones del producto"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label htmlFor="marketplace-category" className="block text-sm font-bold text-slate-700 mb-2">Categoria</label>
                <select
                  id="marketplace-category"
                  value={draftProduct.category}
                  onChange={(e) => setDraftProduct(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="TECH">Tecnologia</option>
                  <option value="SCHOOL_SUPPLIES">Utiles</option>
                  <option value="SPORTS">Deportes</option>
                  <option value="ENTERTAINMENT">Entretenimiento</option>
                  <option value="GIFT_CARDS">Gift Cards</option>
                  <option value="EXPERIENCES">Experiencias</option>
                </select>
              </div>
              <div>
                <label htmlFor="marketplace-points" className="block text-sm font-bold text-slate-700 mb-2">Costo en puntos</label>
                <input
                  id="marketplace-points"
                  type="number"
                  min={1}
                  value={draftProduct.pointsCost}
                  onChange={(e) => setDraftProduct(prev => ({ ...prev, pointsCost: e.target.value }))}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <div>
                <label htmlFor="marketplace-stock" className="block text-sm font-bold text-slate-700 mb-2">Stock</label>
                <input
                  id="marketplace-stock"
                  type="number"
                  min={0}
                  value={draftProduct.stock}
                  onChange={(e) => setDraftProduct(prev => ({ ...prev, stock: e.target.value }))}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label htmlFor="marketplace-image" className="block text-sm font-bold text-slate-700 mb-2">Imagen del producto</label>
              <label htmlFor="marketplace-image" className="w-full px-4 py-3 border-2 border-dashed border-slate-200 rounded-lg text-sm font-bold text-slate-600 hover:border-indigo-300 hover:text-indigo-600 cursor-pointer flex items-center justify-center gap-2">
                <ImagePlus size={16} /> Subir imagen
              </label>
              <input
                id="marketplace-image"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleProductImageUpload(e.target.files?.[0] || null)}
              />
            </div>

            <button
              onClick={handleAddMarketplaceProduct}
              className="w-full px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-colors"
            >
              Guardar Producto
            </button>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-bold text-slate-700">Vista previa del producto</p>
            <div className="border border-slate-100 rounded-2xl p-4 bg-slate-50">
              <div className="w-full h-36 rounded-xl bg-white border border-slate-200 flex items-center justify-center overflow-hidden mb-3">
                {draftProduct.imageUrl ? (
                  <img src={draftProduct.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-slate-300 text-sm font-bold">Sin imagen</span>
                )}
              </div>
              <p className="font-black text-slate-800">{draftProduct.name || 'Nombre del producto'}</p>
              <p className="text-xs text-slate-500 mt-1">{draftProduct.description || 'Descripcion del producto'}</p>
              <div className="mt-3 flex items-center justify-between text-xs font-bold">
                <span className="text-indigo-600">{draftProduct.pointsCost || '0'} pts</span>
                <span className="text-slate-500">Stock {draftProduct.stock || '0'}</span>
              </div>
            </div>
          </div>
        </div>

        {marketplaceLoading && (
          <p className="text-xs font-semibold text-slate-500">Cargando productos del marketplace...</p>
        )}

        {marketplaceProducts.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-bold text-slate-700">Productos registrados</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {marketplaceProducts.map(product => (
                <div key={product.id} className="p-3 border border-slate-100 rounded-xl bg-white">
                  <p className="font-bold text-sm text-slate-800">{product.name}</p>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{product.description}</p>
                  <p className="text-[11px] text-indigo-600 font-bold mt-1">{product.pointsCost} pts</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Seccion 5: Sugerencias de productos */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-4">
        <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
          <Inbox size={20} /> Sugerencias al Marketplace
        </h3>
        <p className="text-sm text-slate-600">Espacio para revisar recomendaciones enviadas por familias para nuevos productos.</p>
        <div className="space-y-2">
          {marketplaceSuggestions.length === 0 && (
            <p className="text-xs text-slate-500">No hay sugerencias registradas todavia.</p>
          )}
          {marketplaceSuggestions.map((item) => (
            <div key={item.id} className="p-3 rounded-xl border border-slate-100 bg-slate-50">
              <p className="text-xs font-black text-slate-700">
                {item.parentName || item.parentId} - {item.category}
              </p>
              <p className="text-sm text-slate-600 mt-1">{item.suggestion}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 sticky bottom-0 bg-white p-6 border-t border-slate-100 rounded-b-3xl">
        <button
          onClick={handleReset}
          disabled={!hasChanges || saving}
          className="px-6 py-3 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-700 font-bold rounded-lg transition-colors flex items-center gap-2"
        >
          <RotateCcw size={18} />
          Descartar Cambios
        </button>
        <button
          onClick={handleSave}
          disabled={!hasChanges || saving}
          className="flex-1 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          {saving ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Guardando...
            </>
          ) : (
            <>
              <Save size={18} />
              Guardar Configuración
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default AdminRewardsConfig;
