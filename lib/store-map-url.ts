import { absoluteUrl } from "@/lib/site-url";

/** Anchor id used by the store map section on the About page. */
export const STORE_MAP_ANCHOR = "store-map";

/**
 * Generates a fully-qualified URL that deep-links to a specific store
 * location on the About page.
 *
 * Example output: https://mywebsite.com/about?location=clx123abc
 *
 * Safe to call on both server and client (uses NEXT_PUBLIC_SITE_URL).
 */
export function storeLocationUrl(locationId: string): string {
  return absoluteUrl(`/about?location=${encodeURIComponent(locationId)}`);
}
