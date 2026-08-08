/**
 * useGoogleSheetsSync Hook
 * 
 * 用途：從 Google Sheets 同步產品數據
 * 
 * 使用方式：
 *   const { products, loading, error, refresh } = useGoogleSheetsSync('dogs');
 */

import { useState, useEffect, useCallback } from 'react';

interface SyncProduct {
  id: string;
  categorySlug: string;
  subcategory: string;
  image: string;
  name: {
    zh: string;
    en: string;
  };
  price: number;
  originalPrice?: number;
  series: {
    zh: string;
    en: string;
  };
  icon: string;
  description: {
    zh: string;
    en: string;
  };
  tags: string[];
  productType: string;
  specs: Array<{
    zh: string;
    en: string;
  }>;
  inStock: boolean;
  sourceUrl?: string;
}

interface SyncResponse {
  success: boolean;
  source: 'cache' | 'google-sheets';
  count: number;
  total?: number;
  data: SyncProduct[];
  timestamp?: string;
  error?: string;
}

export function useGoogleSheetsSync(category?: string) {
  const [products, setProducts] = useState<SyncProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  const fetchProducts = useCallback(async (forceRefresh = false) => {
    try {
      setLoading(true);
      setError(null);

      const url = new URL('/api/sync/google-sheets', window.location.origin);
      if (category) {
        url.searchParams.append('category', category);
      }
      if (forceRefresh) {
        url.searchParams.append('refresh', 'true');
      }

      const response = await fetch(url.toString());

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data: SyncResponse = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Sync failed');
      }

      setProducts(data.data);
      setLastSync(new Date());
      console.log(
        `✅ Synced ${data.count} products from ${data.source}`,
        data
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('❌ Google Sheets sync error:', err);
    } finally {
      setLoading(false);
    }
  }, [category]);

  // 初始載入
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // 定期同步 (每 5 分鐘)
  useEffect(() => {
    const interval = setInterval(() => {
      fetchProducts();
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [fetchProducts]);

  const refresh = useCallback(() => {
    return fetchProducts(true);
  }, [fetchProducts]);

  return {
    products,
    loading,
    error,
    lastSync,
    refresh,
    count: products.length,
  };
}
