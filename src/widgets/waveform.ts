import { clear, el } from "../dom";

export interface WaveformOptions {
  bars?: number;
  intervalMs?: number;
}

/** SIGNAL widget: a row of bars riding a travelling sine wave plus noise. */
export function startWaveform(
  container: HTMLElement,
  opts: WaveformOptions = {},
): () => void {
  const count = opts.bars ?? 32;
  clear(container);
  const bars: HTMLElement[] = [];
  for (let i = 0; i < count; i++) {
    const bar = el("div", { className: "bar" });
    bar.style.height = "4px";
    container.append(bar);
    bars.push(bar);
  }

  function tick(): void {
    const t = Date.now() / 200;
    bars.forEach((bar, i) => {
      const h = 6 + Math.abs(Math.sin(t + i * 0.4)) * 22 + Math.random() * 4;
      bar.style.height = `${h}px`;
    });
  }

  const timer = setInterval(tick, opts.intervalMs ?? 90);
  return () => clearInterval(timer);
}
