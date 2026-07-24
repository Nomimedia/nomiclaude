/* =============================================================================
   Tiny in-memory cache with TTL.
   Keeps the OS fast and avoids hammering the Notion / Google APIs on every load.
   ============================================================================= */
"use strict";

const store = new Map();

/**
 * Return a cached value for `key`, or compute it with `fn` (async) and cache it.
 * @param {string} key
 * @param {number} ttlSeconds
 * @param {() => Promise<any>} fn
 */
async function cached(key, ttlSeconds, fn) {
  const now = Date.now();
  const hit = store.get(key);
  if (hit && hit.expires > now) return hit.value;

  const value = await fn();
  store.set(key, { value, expires: now + ttlSeconds * 1000 });
  return value;
}

/** Clear one key, or the whole cache when no key is given. */
function clear(key) {
  if (key) store.delete(key);
  else store.clear();
}

module.exports = { cached, clear };
