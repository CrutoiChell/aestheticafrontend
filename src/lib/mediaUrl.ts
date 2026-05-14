import type { Exhibition } from '@/lib/types';

function dedupePreserveOrder(urls: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const u of urls) {
    const t = u.trim();
    if (t && !seen.has(t)) {
      seen.add(t);
      out.push(t);
    }
  }
  return out;
}

/** Canonical ordered list for an exhibition payload */
export function exhibitionImageUrls(
  exhibition: Pick<Exhibition, 'imageUrl' | 'imageUrls'>
): string[] {
  // imageUrls may come as string (old DB schema) or array (new schema)
  const raw = exhibition.imageUrls;
  let fromApi: string[] = [];

  if (Array.isArray(raw)) {
    fromApi = raw.filter((u): u is string => typeof u === 'string' && u.trim() !== '');
  } else if (typeof raw === 'string' && (raw as string).trim()) {
    // old schema: single string
    fromApi = [(raw as string).trim()];
  }

  const base = fromApi.length ? fromApi : exhibition.imageUrl ? [exhibition.imageUrl] : [];
  return dedupePreserveOrder(base);
}

/**
 * Build absolute URLs for images served from this API (/uploads/...) while leaving full http(s) URLs unchanged.
 */

function apiOrigin(): string {
  const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  return base.replace(/\/+$/, '');
}

export function resolveMediaUrl(url: string | undefined | null): string {
  const u = String(url ?? '').trim();
  if (!u) return '';
  if (/^https?:\/\//i.test(u)) return u;
  const path = u.startsWith('/') ? u : `/${u}`;
  return `${apiOrigin()}${path}`;
}
