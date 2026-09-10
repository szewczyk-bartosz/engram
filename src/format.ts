/** Pure formatting helpers. No DOM access. */

export function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

/** "HH:MM:SS" in local time. */
export function hms(d: Date): string {
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}`;
}

/** e.g. "WED, 10 SEP 2026". */
export function formatDate(d: Date): string {
  return d
    .toLocaleDateString("en-GB", {
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
    .toUpperCase();
}

/** Elapsed milliseconds as "HH:MM:SS". Hours are not capped at 24. */
export function formatUptime(ms: number): string {
  const total = Math.floor(ms / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return `${pad2(h)}:${pad2(m)}:${pad2(s)}`;
}

/** Coarse relative time for a past timestamp: "Just now", "5s ago", "3m ago", ... */
export function relTime(ts: number, now: number = Date.now()): string {
  const s = Math.floor((now - ts) / 1000);
  if (s < 10) return "Just now";
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}
