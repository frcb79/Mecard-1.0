import { useState, useMemo } from 'react';

export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  image?: string;
  available?: boolean;
}

export interface UseProductSearchOptions {
  products: Product[];
}

export interface UseProductSearchResult {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedCategories: string[];
  toggleCategory: (category: string) => void;
  priceRange: [number, number];
  setPriceRange: (range: [number, number]) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
  filteredProducts: Product[];
  totalResults: number;
  clearFilters: () => void;
  isFiltering: boolean;
  maxPrice: number;
}

export function useProductSearch({
  products,
}: UseProductSearchOptions): UseProductSearchResult {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100]);
  const [sortBy, setSortBy] = useState('');

  // Calcular el precio máximo disponible
  const maxPrice = useMemo(() => {
    return products.length > 0 ? Math.max(...products.map((p) => p.price)) : 100;
  }, [products]);

  // Filtrar productos
  const { filteredProducts, isFiltering } = useMemo(() => {
    let filtered = [...products];

    // Filtrar por búsqueda
    if (searchTerm) {
      filtered = filtered.filter((p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtrar por categorías
    if (selectedCategories.length > 0) {
      filtered = filtered.filter((p) => selectedCategories.includes(p.category));
    }

    // Filtrar por rango de precios
    filtered = filtered.filter(
      (p) => p.price >= priceRange[0] && p.price <= priceRange[1]
    );

    // Ordenar
    if (sortBy === 'price-asc') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      filtered.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'name') {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    }

    const isFiltering =
      searchTerm !== '' ||
      selectedCategories.length > 0 ||
      priceRange[0] !== 0 ||
      priceRange[1] !== maxPrice;

    return { filteredProducts: filtered, isFiltering };
  }, [searchTerm, selectedCategories, priceRange, sortBy, products, maxPrice]);

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategories([]);
    setPriceRange([0, maxPrice]);
    setSortBy('');
  };

  return {
    searchTerm,
    setSearchTerm,
    selectedCategories,
    toggleCategory,
    priceRange,
    setPriceRange,
    sortBy,
    setSortBy,
    filteredProducts,
    totalResults: filteredProducts.length,
    clearFilters,
    isFiltering,
    maxPrice,
  };
}
