import { el } from "../dom";
import { hms } from "../format";

export interface ActivityLogOptions {
  /** Rows kept before the oldest is dropped. */
  maxRows?: number;
  intervalMs?: number;
  /** Rows to show immediately on start. */
  initialRows?: number;
}

/** Decorative; these are not real events. */
const MESSAGES: readonly string[] = [
  "Database indexed...",
  "Loaded themes...",
  "Parser success...",
  "Renderer success",
  "theme applied...",
  "globe animation frames loaded...",
  "no remote — local-only mode",
  "checksum OK · 0xJP2137",
];

function randomMessage(): string {
  return MESSAGES[Math.floor(Math.random() * MESSAGES.length)] ?? "";
}

/** ACTIVITY widget: prepends a timestamped random message on an interval. */
export function startActivityLog(
  container: HTMLElement,
  opts: ActivityLogOptions = {},
): () => void {
  const maxRows = opts.maxRows ?? 8;

  function push(): void {
    container.prepend(
      el(
        "div",
        { className: "row" },
        el("span", { className: "ts", text: hms(new Date()) }),
        el("span", { className: "msg", text: randomMessage() }),
      ),
    );
    while (container.children.length > maxRows) container.lastElementChild?.remove();
  }

  for (let i = 0; i < (opts.initialRows ?? 5); i++) push();
  const timer = setInterval(push, opts.intervalMs ?? 4200);
  return () => clearInterval(timer);
}
