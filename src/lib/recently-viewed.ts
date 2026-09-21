"use client";

import { useCallback, useEffect, useState } from "react";

export const RECENTLY_VIEWED_STORAGE_KEY = "mofu_recently_viewed";
const MAX_RECENTLY_VIEWED = 8;

type StoredRecentlyViewed = unknown;

function sanitizeIds(value: StoredRecentlyViewed): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((id): id is string => typeof id === "string" && id.trim().length > 0)
    .map((id) => id.trim())
    .filter((id, index, ids) => ids.indexOf(id) === index)
    .slice(0, MAX_RECENTLY_VIEWED);
}

function readRecentlyViewed(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(RECENTLY_VIEWED_STORAGE_KEY);
    return raw ? sanitizeIds(JSON.parse(raw)) : [];
  } catch {
    return [];
  }
}

function writeRecentlyViewed(ids: string[]) {
  try {
    window.localStorage.setItem(RECENTLY_VIEWED_STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // Private browsing mode or a full storage quota should not break the PDP.
  }
}

export function useRecentlyViewed(productId?: string) {
  const [recentIds, setRecentIds] = useState<string[]>([]);

  useEffect(() => {
    const currentId = productId?.trim();
    const previousIds = readRecentlyViewed();
    const nextIds = currentId
      ? [currentId, ...previousIds.filter((id) => id !== currentId)].slice(0, MAX_RECENTLY_VIEWED)
      : previousIds;
    setRecentIds(nextIds);
    if (currentId) writeRecentlyViewed(nextIds);
  }, [productId]);

  const clearRecentlyViewed = useCallback(() => {
    setRecentIds([]);
    try {
      window.localStorage.removeItem(RECENTLY_VIEWED_STORAGE_KEY);
    } catch {
      // Ignore unavailable localStorage; the UI state is still cleared.
    }
  }, []);

  return { recentIds, clearRecentlyViewed };
}
