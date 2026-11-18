function distance(a, b) {
  const row = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let prev = row[0];
    row[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const tmp = row[j];
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = tmp;
    }
  }
  return row[b.length];
}
export function search(items, query, limit = 60) {
  const q = query.trim().toLowerCase();
  if (!q) return items.slice(0, limit);
  const scored = [];
  for (const item of items) {
    let best = Infinity;
    for (const word of item.title.toLowerCase().split(" ")) {
      best = Math.min(best, distance(q, word.slice(0, q.length + 2)));
    }
    if (best <= Math.max(1, Math.floor(q.length / 3))) scored.push({ item, best });
  }
  scored.sort((a, b) => a.best - b.best || b.item.rating - a.item.rating);
  return scored.slice(0, limit).map((s) => s.item);
}
