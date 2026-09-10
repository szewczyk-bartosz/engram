import type { IndexNode } from "./model";
import { countFiles } from "./model";
import { fetchIndex } from "./api";
import { relTime } from "./format";

export interface SyncElements {
  button: HTMLButtonElement;
  label: HTMLElement;
  lastSync: HTMLElement;
  fileCount: HTMLElement;
}

export interface Sync {
  /** Fetch the index and hand it to onIndex. No-op while a fetch is in flight. */
  run(): Promise<void>;
}

const LABEL_IDLE = "SYNC FILES";
const LABEL_BUSY = "SCANNING...";
const RELTIME_REFRESH_MS = 30_000;

export function createSync(
  els: SyncElements,
  onIndex: (nodes: IndexNode[]) => void,
  onError: (err: unknown) => void,
): Sync {
  let syncing = false;
  let lastSyncTime: number | null = null;

  function refreshLastSync(): void {
    if (lastSyncTime !== null) els.lastSync.textContent = relTime(lastSyncTime);
  }

  async function run(): Promise<void> {
    if (syncing) return;
    syncing = true;
    els.button.dataset.syncing = "true";
    els.label.textContent = LABEL_BUSY;
    try {
      const nodes = await fetchIndex();
      lastSyncTime = Date.now();
      onIndex(nodes);
      els.fileCount.textContent = `${countFiles(nodes)} FILES`;
      refreshLastSync();
    } catch (err) {
      onError(err);
    } finally {
      syncing = false;
      els.button.dataset.syncing = "false";
      els.label.textContent = LABEL_IDLE;
    }
  }

  els.button.addEventListener("click", () => void run());
  setInterval(refreshLastSync, RELTIME_REFRESH_MS);

  return { run };
}
