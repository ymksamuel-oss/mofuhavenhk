'use client';

import { useEffect, useState } from 'react';

export interface WTJapanDogProduct {
  id: string;
  brand: string;
  name: string;
  category: string;
  categoryName: string;
  price: number;
  originalPrice: number | null;
  spec: string;
  inStock: boolean;
}

interface UseWTJapanDogProductsReturn {
  products: WTJapanDogProduct[];
  loading: boolean;
  error: string | null;
}

/**
 * Hook to fetch and parse WT Japan dog treats from wt_japan_products.json
 * This allows dynamic loading of dog treat products from the JSON file
 */
export function useWTJapanDogProducts(): UseWTJapanDogProductsReturn {
  const [products, setProducts] = useState<WTJapanDogProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch('/wt_japan_products.json');

        if (!response.ok) {
          throw new Error(`Failed to fetch WT Japan dog products: ${response.statusText}`);
        }

        const data: WTJapanDogProduct[] = await response.json();
        setProducts(data);
        setError(null);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        setError(errorMessage);
        console.error('Error fetching WT Japan dog products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return {
    products,
    loading,
    error,
  };
}
