import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "";
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || "";
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const SUPABASE_FETCH_TIMEOUT_MS = 12_000;
const SUPABASE_FETCH_RETRIES = 3;

function requestPath(input: RequestInfo | URL): string {
  try {
    return new URL(typeof input === "string" ? input : input.toString()).pathname;
  } catch {
    return "unknown";
  }
}

function retryDelay(attempt: number): number {
  return 250 * 2 ** attempt;
}

function retryableStatus(status: number): boolean {
  return status === 408 || status === 425 || status === 429 || status >= 500;
}

function sleep(milliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

/**
 * Supabase uses HTTPS REST under the hood. This wrapper makes transient Node
 * TLS/socket failures observable and retries only network/5xx/429 failures.
 */
export async function supabaseFetch(input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> {
  let lastError: unknown;
  const path = requestPath(input);

  for (let attempt = 0; attempt < SUPABASE_FETCH_RETRIES; attempt += 1) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), SUPABASE_FETCH_TIMEOUT_MS);
    const callerSignal = init.signal;
    const abortFromCaller = () => controller.abort();
    callerSignal?.addEventListener("abort", abortFromCaller, { once: true });

    try {
      if (callerSignal?.aborted) throw new DOMException("The request was aborted.", "AbortError");
      const response = await globalThis.fetch(input, { ...init, signal: controller.signal });
      if (!retryableStatus(response.status) || attempt === SUPABASE_FETCH_RETRIES - 1) return response;

      console.warn("[supabase] transient REST response; retrying", {
        path,
        status: response.status,
        attempt: attempt + 1,
        maxAttempts: SUPABASE_FETCH_RETRIES,
      });
      await response.body?.cancel();
      await sleep(retryDelay(attempt));
    } catch (error) {
      lastError = error;
      const abortedByTimeout = controller.signal.aborted && !callerSignal?.aborted;
      console.warn("[supabase] REST request attempt failed", {
        path,
        attempt: attempt + 1,
        maxAttempts: SUPABASE_FETCH_RETRIES,
        errorName: error instanceof Error ? error.name : "unknown",
        errorMessage: error instanceof Error ? error.message : String(error),
        abortedByTimeout,
      });
      if (callerSignal?.aborted || attempt === SUPABASE_FETCH_RETRIES - 1) break;
      await sleep(retryDelay(attempt));
    } finally {
      clearTimeout(timeoutId);
      callerSignal?.removeEventListener("abort", abortFromCaller);
    }
  }

  console.error("[supabase] REST request failed after retries", {
    path,
    attempts: SUPABASE_FETCH_RETRIES,
    errorName: lastError instanceof Error ? lastError.name : "unknown",
    errorMessage: lastError instanceof Error ? lastError.message : String(lastError),
  });
  throw lastError instanceof Error ? lastError : new Error("Supabase REST request failed");
}

const clientOptions = {
  auth: { persistSession: false, autoRefreshToken: false },
  global: { fetch: supabaseFetch },
};

export function getSupabasePublic(): SupabaseClient | null {
  if (!url || !anonKey) return null;
  return createClient(url, anonKey, clientOptions);
}

export function getSupabaseAdmin(): SupabaseClient | null {
  if (!url || !serviceKey) return null;
  return createClient(url, serviceKey, clientOptions);
}

export function isSupabaseConfigured() {
  return Boolean(url && (anonKey || serviceKey));
}
