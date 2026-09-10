export interface StatElements {
  /** Bar fill; driven via transform: scaleX(). */
  fill: HTMLElement;
  /** Percentage label. */
  value: HTMLElement;
}

export interface ResourcesOptions {
  /** Starting value per stat, 0-100. */
  initial: Record<string, number>;
  intervalMs?: number;
}

const MIN = 4;
const MAX = 98;
const STEP = 8;

/**
 * RESOURCES widget: decorative CPU/MEM/NET/IO bars that random-walk around
 * their starting values. The numbers mean nothing.
 */
export function startResources(
  stats: Record<string, StatElements>,
  opts: ResourcesOptions,
): () => void {
  const values: Record<string, number> = { ...opts.initial };

  function jiggle(): void {
    for (const [key, els] of Object.entries(stats)) {
      const prev = values[key] ?? 50;
      const next = Math.max(MIN, Math.min(MAX, prev + (Math.random() - 0.5) * STEP));
      values[key] = next;
      els.fill.style.transform = `scaleX(${next / 100})`;
      els.value.textContent = `${Math.round(next)}%`;
    }
  }

  jiggle();
  const timer = setInterval(jiggle, opts.intervalMs ?? 1500);
  return () => clearInterval(timer);
}
