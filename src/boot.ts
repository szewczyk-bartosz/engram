import { clear, el } from "./dom";

export type BootLineKind = "ok" | "warn" | "dim";

export interface BootLine {
  kind: BootLineKind;
  text: string;
  /** Milliseconds to wait after the previous line before showing this one. */
  delay: number;
}

export interface Boot {
  /** (Re)play the sequence from the top. Cancels a run already in progress. */
  run(): void;
}

/** Pause after the last line before the overlay fades out. */
const DONE_DELAY_MS = 700;

export const BOOT_SCRIPT: readonly BootLine[] = [
  { kind: "ok", text: "engram-core v0.1.4 loaded", delay: 60 },
  { kind: "ok", text: "mounting filesystem ~/notes", delay: 60 },
  { kind: "dim", text: "... scanning directories", delay: 80 },
  { kind: "dim", text: "... 3 folders / 14 files", delay: 80 },
  { kind: "ok", text: "renderer ready (engram-html v2)", delay: 80 },
  { kind: "ok", text: "theme: phosphor.green", delay: 60 },
  { kind: "ok", text: "fx-layer: scanlines · grain · flicker", delay: 60 },
  { kind: "ok", text: "aux: chrono · globe · resources · signal", delay: 60 },
  { kind: "warn", text: "remote sync disabled (local-only)", delay: 90 },
  { kind: "ok", text: "watcher attached", delay: 60 },
  { kind: "dim", text: "... loading File 02 — Spectral Decomposition", delay: 100 },
  { kind: "ok", text: "ready.", delay: 80 },
];

function renderLine(line: BootLine, isLast: boolean): HTMLElement {
  const row = el("div", { className: "line" }, "> ");
  switch (line.kind) {
    case "ok":
      row.append("[", el("span", { className: "ok", text: "OK" }), `] ${line.text}`);
      break;
    case "warn":
      row.append("[", el("span", { className: "warn", text: "WARN" }), `] ${line.text}`);
      break;
    case "dim":
      row.append(el("span", { className: "dim", text: line.text }));
      break;
  }
  if (isLast) row.append(el("span", { className: "cursor" }));
  return row;
}

export function createBoot(
  boot: HTMLElement,
  lines: HTMLElement,
  script: readonly BootLine[] = BOOT_SCRIPT,
): Boot {
  let timers: number[] = [];

  function cancel(): void {
    for (const t of timers) clearTimeout(t);
    timers = [];
  }

  function run(): void {
    cancel();
    boot.dataset.done = "false";
    clear(lines);
    let at = 0;
    script.forEach((line, i) => {
      at += line.delay;
      timers.push(
        window.setTimeout(() => {
          lines.append(renderLine(line, i === script.length - 1));
        }, at),
      );
    });
    timers.push(
      window.setTimeout(() => {
        boot.dataset.done = "true";
      }, at + DONE_DELAY_MS),
    );
  }

  return { run };
}
