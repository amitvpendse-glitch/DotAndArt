/**
 * Safe fetch utility that verifies responses are JSON before parsing.
 * Gracefully handles 404s, static platform deployments (e.g. Vercel),
 * and network blips without uncaught errors or empty screens.
 */

import { handleClientFallbackApi } from './clientFallbackApi';

export async function safeResponseJson<T = any>(
  res: Response,
  fallbackValue: any = null,
  options?: RequestInit
): Promise<T> {
  try {
    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const data = await res.json();
      return data as T;
    }
  } catch (err) {
    console.warn('[safeResponseJson] Failed to parse JSON response', err);
  }

  // Fallback to client-side API engine if server returns non-JSON or HTML
  const fallbackData = await handleClientFallbackApi<T>(res.url || '', options);
  if (fallbackData !== null) {
    return fallbackData;
  }

  return fallbackValue as T;
}

export async function safeFetchJson<T = any>(
  input: RequestInfo | URL,
  init?: RequestInit,
  fallbackValue: any = null
): Promise<T> {
  const urlString = String(input);
  try {
    const res = await fetch(input, init);
    if (res.ok) {
      return await safeResponseJson<T>(res, fallbackValue, init);
    }
  } catch (err) {
    console.warn(`[safeFetchJson] Server fetch error for ${urlString}, switching to client engine`, err);
  }

  // Try client-side fallback API engine (e.g. for static Vercel builds)
  const clientData = await handleClientFallbackApi<T>(urlString, init);
  if (clientData !== null) {
    return clientData;
  }

  return fallbackValue as T;
}
