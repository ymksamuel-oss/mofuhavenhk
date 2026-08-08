/**
 * Google Sheets 同步 API 端點
 * 
 * 用途：從 Google Sheets 讀取產品數據並轉換為應用程式格式
 * 
 * 使用方式：
 *   GET /api/sync/google-sheets
 *   GET /api/sync/google-sheets?category=dogs
 *   GET /api/sync/google-sheets?refresh=true
 */

import { NextRequest, NextResponse } from 'next/server';

// Google Sheets 配置
const SHEET_ID = '1zTZxk-cidcgcmGsM79jMQD72Fznmd7CfAQNS79pp6i0';
const SHEET_NAME = 'Mofu Haven HK｜102 項保留商品核心目錄';

// 快取設定 (5 分鐘)
const CACHE_DURATION = 5 * 60 * 1000;
let cachedData: any = null;
let lastCacheTime = 0;

/**
 * 從 Google Sheets CSV 匯出 URL 讀取數據
 */
async function fetchGoogleSheetData() {
  try {
    // 使用 Google Sheets CSV 匯出 URL
    const csvUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=0`;
    
    const response = await fetch(csvUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Mofu Haven Sync)',
      },
    });

    if (!response.ok) {
      throw new Error(`Google Sheets fetch failed: ${response.status}`);
    }

    const csv = await response.text();
    return parseCSV(csv);
  } catch (error) {
    console.error('Error fetching Google Sheets:', error);
    throw error;
  }
}

/**
 * 解析 CSV 數據
 */
function parseCSV(csv: string): any[] {
  const lines = csv.split('\n').filter(line => line.trim());
  if (lines.length < 2) return [];

  const headers = parseCSVLine(lines[0]);
  const products = [];

  for (let i = 2; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length < 3) continue; // 跳過空行

    const product = {
      序號: values[0],
      商品ID: values[1],
      主分類代碼: values[2],
      主分類中文名稱: values[3],
      主分類英文名稱: values[4],
      子分類: values[5],
      中文商品名稱: values[6],
      英文商品名稱: values[7],
      售價HKD: values[8],
      原價HKD: values[9],
      庫存狀態: values[10],
      品牌: values[11],
      供應商: values[12],
      系列中文: values[13],
      系列英文: values[14],
      小食系列: values[15],
      商品類型: values[16],
      中文描述: values[17],
      英文描述: values[18],
      標籤: values[19],
      規格中文: values[20],
      規格英文: values[21],
      推薦品種: values[22],
      本地圖片路徑: values[23],
      來源圖片URL: values[24],
      商品來源URL: values[25],
      來源handle: values[26],
      來源分類: values[27],
    };

    products.push(product);
  }

  return products;
}

/**
 * 解析 CSV 行（處理引號）
 */
function parseCSVLine(line: string): string[] {
  const result = [];
  let current = '';
  let insideQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        current += '"';
        i++;
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (char === ',' && !insideQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  result.push(current.trim());
  return result;
}

/**
 * 將 Google Sheets 產品轉換為應用程式格式
 */
function convertToProductFormat(sheetProduct: any) {
  const price = parseFloat(sheetProduct.售價HKD?.replace('HK$', '').replace(',', '') || '0');
  const originalPrice = sheetProduct.原價HKD
    ? parseFloat(sheetProduct.原價HKD.replace('HK$', '').replace(',', ''))
    : undefined;

  return {
    id: sheetProduct.商品ID,
    categorySlug: sheetProduct.主分類代碼,
    subcategory: sheetProduct.子分類,
    image: sheetProduct.本地圖片路徑 || sheetProduct.來源圖片URL,
    name: {
      zh: sheetProduct.中文商品名稱,
      en: sheetProduct.英文商品名稱,
    },
    price,
    originalPrice,
    series: {
      zh: sheetProduct.系列中文,
      en: sheetProduct.系列英文,
    },
    icon: sheetProduct.主分類代碼 === 'cats' ? 'cat' : 'dog',
    description: {
      zh: sheetProduct.中文描述,
      en: sheetProduct.英文描述,
    },
    tags: sheetProduct.標籤?.split(';').map((t: string) => t.trim()) || [],
    productType: sheetProduct.商品類型,
    specs: [
      {
        zh: `品牌：${sheetProduct.品牌}`,
        en: `Brand: ${sheetProduct.品牌}`,
      },
      {
        zh: `規格：${sheetProduct.規格中文}`,
        en: `Spec: ${sheetProduct.規格英文}`,
      },
    ],
    inStock: sheetProduct.庫存狀態 === '在售',
    sourceUrl: sheetProduct.商品來源URL,
  };
}

/**
 * GET 端點：讀取 Google Sheets 產品
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');
    const refresh = searchParams.get('refresh') === 'true';

    // 檢查快取
    const now = Date.now();
    if (!refresh && cachedData && now - lastCacheTime < CACHE_DURATION) {
      console.log('Using cached Google Sheets data');
      let data = cachedData;

      // 按分類篩選
      if (category) {
        data = data.filter((p: any) => p.categorySlug === category);
      }

      return NextResponse.json({
        success: true,
        source: 'cache',
        count: data.length,
        data,
      });
    }

    // 從 Google Sheets 讀取新數據
    console.log('Fetching fresh data from Google Sheets...');
    const sheetProducts = await fetchGoogleSheetData();
    
    // 轉換格式
    const products = sheetProducts
      .map(convertToProductFormat)
      .filter((p: any) => p.id); // 移除無效產品

    // 更新快取
    cachedData = products;
    lastCacheTime = now;

    // 按分類篩選
    let filteredData = products;
    if (category) {
      filteredData = products.filter((p: any) => p.categorySlug === category);
    }

    return NextResponse.json({
      success: true,
      source: 'google-sheets',
      count: filteredData.length,
      total: products.length,
      data: filteredData,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * POST 端點：手動觸發同步
 */
export async function POST(request: NextRequest) {
  try {
    // 清除快取並重新讀取
    cachedData = null;
    lastCacheTime = 0;

    const sheetProducts = await fetchGoogleSheetData();
    const products = sheetProducts
      .map(convertToProductFormat)
      .filter((p: any) => p.id);

    cachedData = products;
    lastCacheTime = Date.now();

    return NextResponse.json({
      success: true,
      message: 'Sync completed',
      count: products.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Sync Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
