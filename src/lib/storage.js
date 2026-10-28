// Saved on the phone: the app's own small database (expo-sqlite), through the same localStorage the
// website uses (installed in src/app/_layout.tsx), so the code copied from the website reads and
// writes its settings as before.

// Read a saved value; the fallback is returned when nothing is saved or it cannot be read.
/** @param {string} key @param {any} [fallback] @returns {any} */
export function readJSON(key, fallback = null) {
  try {
    return JSON.parse(globalThis.localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
}

// Save a value (silently ignored if it cannot be written).
export function writeJSON(key, value) {
  try {
    globalThis.localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

// A day as 'YYYY-MM-DD', in the reader's own time zone (today when no date is given)
export function dayKey(date = new Date()) {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
