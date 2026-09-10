import { formatDate, formatUptime, hms } from "../format";

export interface ClockElements {
  time: HTMLElement;
  date: HTMLElement;
  uptime: HTMLElement;
}

/** CHRONO widget: wall clock, date, and time since the page loaded. */
export function startClock(els: ClockElements): () => void {
  const startedAt = Date.now();

  function tick(): void {
    const now = new Date();
    els.time.textContent = hms(now);
    els.date.textContent = formatDate(now);
    els.uptime.textContent = `UPTIME ${formatUptime(now.getTime() - startedAt)}`;
  }

  tick();
  const timer = setInterval(tick, 1000);
  return () => clearInterval(timer);
}
