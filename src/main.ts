import { byId } from "./dom";
import { createBoot } from "./boot";
import { initPanels } from "./panels";
import { createReader } from "./reader";
import { createSync } from "./sync";
import { createTree } from "./tree";
import { startActivityLog } from "./widgets/activity-log";
import { startClock } from "./widgets/clock";
import { startGlobe } from "./widgets/globe";
import { startResources } from "./widgets/resources";
import { startWaveform } from "./widgets/waveform";

// ---- centre pane + file tree -------------------------------------------------
const reader = createReader({
  doc: byId("engram-doc"),
  frame: byId("doc-frame"),
  docPath: byId("doc-path"),
  crumbs: byId("crumbs"),
  statusDoc: byId("status-doc"),
  words: byId("m-words"),
  bytes: byId("m-bytes"),
  lines: byId("m-lines"),
  read: byId("m-read"),
});

const tree = createTree(byId("tree"), (file) => void reader.show(file));

const filter = byId<HTMLInputElement>("tree-filter");
filter.addEventListener("input", () => tree.setFilter(filter.value));
byId("expand-all").addEventListener("click", () => tree.expandAll());
byId("collapse-all").addEventListener("click", () => tree.collapseAll());

const sync = createSync(
  {
    button: byId<HTMLButtonElement>("sync-btn"),
    label: byId("sync-label"),
    lastSync: byId("last-sync"),
    fileCount: byId("file-count"),
  },
  (nodes) => tree.setIndex(nodes),
  () => tree.showError("FAILED TO LOAD INDEX"),
);

// ---- chrome ------------------------------------------------------------------
initPanels(byId("app"), {
  toggleLeft: byId("toggle-left"),
  toggleRight: byId("toggle-right"),
  reopenLeft: byId("reopen-left"),
  reopenRight: byId("reopen-right"),
});

const boot = createBoot(byId("boot"), byId("boot-lines"));
byId("replay-boot").addEventListener("click", () => boot.run());

// ---- right-pane widgets ------------------------------------------------------
startClock({
  time: byId("clock-time"),
  date: byId("clock-date"),
  uptime: byId("clock-uptime"),
});
startGlobe(byId<SVGGElement>("globe-meridians"));
startResources(
  {
    cpu: { fill: byId("bar-cpu"), value: byId("val-cpu") },
    mem: { fill: byId("bar-mem"), value: byId("val-mem") },
    net: { fill: byId("bar-net"), value: byId("val-net") },
    io: { fill: byId("bar-io"), value: byId("val-io") },
  },
  { initial: { cpu: 32, mem: 47, net: 18, io: 60 } },
);
startWaveform(byId("waveform"));
startActivityLog(byId("log"));

// ---- go ----------------------------------------------------------------------
void sync.run();
boot.run();
