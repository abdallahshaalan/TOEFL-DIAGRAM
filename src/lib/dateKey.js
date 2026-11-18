/** Local calendar YYYY-MM-DD (aligns with bury-until local 4am semantics). */
export function localDateKey(now = Date.now()) {
  const d = now instanceof Date ? now : new Date(now);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
