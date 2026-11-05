/* Small helpers with no knowledge of Stepwise. */

const encoder = new TextEncoder();

export async function sha256Hex(text) {
  const digest = await crypto.subtle.digest('SHA-256', encoder.encode(text));
  return toHex(new Uint8Array(digest));
}
function toHex(bytes) {
  let out = '';
  for (const b of bytes) out += b.toString(16).padStart(2, '0');
  return out;
}

/* Compares two strings in time that depends only on their length, so nobody can learn a stored
   hash by timing guesses. Workers has a built-in for this, which it prefers. */
export function constantTimeEqual(a, b) {
  const x = encoder.encode(String(a)), y = encoder.encode(String(b));
  if (x.byteLength !== y.byteLength) return false;
  if (typeof crypto.subtle.timingSafeEqual === 'function') return crypto.subtle.timingSafeEqual(x, y);
  let diff = 0;
  for (let i = 0; i < x.byteLength; i++) diff |= x[i] ^ y[i];
  return diff === 0;
}

function sortedCopy(value) {
  if (Array.isArray(value)) return value.map(sortedCopy);
  if (value && typeof value === 'object') {
    const out = {};
    for (const k of Object.keys(value).sort()) out[k] = sortedCopy(value[k]);
    return out;
  }
  return value;
}
/* The same data always gives the same bytes, whatever order the keys came in. */
export function stableStringify(value, indent = 2) {
  return JSON.stringify(sortedCopy(value), null, indent);
}

export function intVar(raw, fallback, min = 0) {
  const n = Number(raw);
  return raw !== undefined && raw !== '' && Number.isFinite(n) && n >= min ? Math.floor(n) : fallback;
}
