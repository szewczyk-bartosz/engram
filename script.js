/*EDITMODE-BEGIN*/
const settings = {
  theme: "red",
  fxIntensity: 65,
  scanlines: true,
  globeSpeed: 24,
  showLeftBrackets: false,
  monoBody: false,
  fontPair: "all-mono",
};
/*EDITMODE-END*/

// ============== TREE DATA ==============
let INDEX = [];
let lastSyncTime = null;

function relTime(ts) {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 10) return "Just now";
  if (s < 60) return s + "s ago";
  const m = Math.floor(s / 60);
  if (m < 60) return m + "m ago";
  const h = Math.floor(m / 60);
  if (h < 24) return h + "h ago";
  return Math.floor(h / 24) + "d ago";
}

function countFiles(nodes) {
  let n = 0;
  for (const node of nodes) {
    if (node.type === "file") n++;
    else if (node.children) n += countFiles(node.children);
  }
  return n;
}

function renderTreeError() {
  const root = document.getElementById("tree");
  root.innerHTML = "";
  const el = document.createElement("div");
  el.className = "tree-node";
  el.dataset.type = "file";
  el.innerHTML = `
							<span class="caret"> </span>
							<span class="gt">></span>
							<span class="name">FAILED TO LOAD INDEX</span>
							<span class="ext"></span>
							`;
  root.appendChild(el);
}

function renderTree(index) {
  const root = document.getElementById("tree");
  root.innerHTML = "";
  function walk(nodes, depth, parentEl) {
    nodes.forEach((node) => {
      const el = document.createElement("div");
      el.className = "tree-node";
      el.dataset.type = node.type;
      const gt = Array(depth + 1).fill(">").join("&#8201;");
      const caret = node.type === "folder" ? (node.collapsed ? "▸" : "▾") : " ";
      const extMatch =
        node.type === "file" ? node.name.match(/(\.[^.]+)$/) : null;
      const displayName = extMatch
        ? node.name.slice(0, -extMatch[1].length)
        : node.name;
      const displayExt = node.ext || (extMatch ? extMatch[1] : "");
      el.innerHTML = `
							<span class="caret">${caret}</span>
							<span class="gt">${gt}</span>
							<span class="name">${displayName}</span>
							<span class="ext">${displayExt}</span>
							`;
      parentEl.appendChild(el);
      if (node.type === "folder" && node.children) {
        const kids = document.createElement("div");
        kids.className = "tree-children";
        if (node.collapsed) kids.dataset.collapsed = "true";
        parentEl.appendChild(kids);
        walk(node.children, depth + 1, kids);
        el.addEventListener("click", () => {
          const c = kids.dataset.collapsed === "true";
          kids.dataset.collapsed = c ? "false" : "true";
          el.querySelector(".caret").textContent = c ? "▾" : "▸";
        });
      } else if (node.type === "file") {
        el.addEventListener("click", () => {
          document
            .querySelectorAll(".tree-node[data-active='true']")
            .forEach((n) => n.removeAttribute("data-active"));
          el.dataset.active = "true";
          loadDoc(node);
        });
      }
    });
  }
  walk(index, 0, root);
}

// ============== FETCH INDEX ==============
async function fetchIndex() {
  const btn = document.getElementById("sync-btn");
  if (btn.dataset.syncing === "true") return;
  btn.dataset.syncing = "true";
  btn.querySelector(".sync-label").textContent = "SCANNING...";
  try {
    const res = await fetch("./engram-data/index.json");
    if (!res.ok) throw new Error("HTTP " + res.status);
    INDEX = await res.json();
    lastSyncTime = Date.now();
    renderTree(INDEX);
    document.getElementById("file-count").textContent =
      countFiles(INDEX) + " FILES";
    document.getElementById("last-sync").textContent = relTime(lastSyncTime);
  } catch (_) {
    renderTreeError();
  } finally {
    btn.dataset.syncing = "false";
    btn.querySelector(".sync-label").textContent = "SYNC FILES";
  }
}

// ============== TREE FILTER ==============
document.getElementById("tree-filter").addEventListener("input", (e) => {
  const q = e.target.value.toLowerCase().trim();
  document.querySelectorAll(".tree-node").forEach((n) => {
    if (n.dataset.type !== "file") return;
    const name = n.querySelector(".name").textContent.toLowerCase();
    n.style.display = !q || name.includes(q) ? "" : "none";
  });
});

// ============== DOC LOADING ==============
async function loadDoc(node) {
  const target = document.getElementById("engram-doc");
  target.style.opacity = 0;
  await new Promise((r) => setTimeout(r, 120));
  const url = "./engram-data/rendered/" + node.path;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(res.status);
    target.innerHTML = await res.text();
  } catch (_) {
    target.innerHTML = `<h1>404</h1><p>Fragment not found at <code>${url}</code></p>`;
  }
  target.style.transition = "opacity 0.35s";
  target.style.opacity = 1;
  updateDocMeta(node);
  updateCrumbs(node);
}

function updateDocMeta(node) {
  const read = Math.max(1, Math.ceil(node.words / 220));
  document.getElementById("m-words").textContent = node.words.toLocaleString();
  document.getElementById("m-bytes").textContent = node.size.toLocaleString();
  document.getElementById("m-lines").textContent = node.lines.toLocaleString();
  document.getElementById("m-read").textContent = read + " MIN";
  const frame = document.getElementById("doc-frame");
  const basename = node.path.split("/").pop();
  frame.dataset.docId = basename.toUpperCase().slice(0, 24);
  frame.dataset.docBytes = node.size.toLocaleString();
  frame.dataset.docWords = node.words.toLocaleString();
  document.getElementById("status-doc").textContent =
    basename.replace(/\.eng$/, "").toUpperCase() + ".ENGRAM";
}

function updateCrumbs(node) {
  const parts = node.path.split("/");
  const folders = parts.slice(0, -1);
  const basename = parts[parts.length - 1];
  const sep = `<span style="color:var(--fg-faint)">/</span>`;
  const docFolders = folders.map((f) => sep + `<span>${f}</span>`).join("");
  document.getElementById("doc-path").innerHTML =
    `<span>~</span>${docFolders}${sep}<span class="here">${basename}</span>`;
  const crumbFolders = folders
    .map((f) => `<span class="sep">›</span><span>${f}</span>`)
    .join("");
  document.getElementById("crumbs").innerHTML =
    `<span class="dim">~/notes</span>${crumbFolders}<span class="sep">›</span><span class="here">${node.name}</span>`;
}

// ============== CLOCK ==============
const startTime = Date.now();
function tick() {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  const hms = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
  document.getElementById("clock-time").textContent = hms;
  const dateStr = now
    .toLocaleDateString("en-GB", {
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
    .toUpperCase();
  document.getElementById("clock-date").textContent = dateStr;
  const up = Math.floor((Date.now() - startTime) / 1000);
  const uH = pad(Math.floor(up / 3600));
  const uM = pad(Math.floor((up % 3600) / 60));
  const uS = pad(up % 60);
  document.getElementById("clock-uptime").textContent =
    `UPTIME ${uH}:${uM}:${uS}`;
}
setInterval(tick, 1000);
tick();

// ============== STATS ==============
const statTargets = { cpu: 32, mem: 47, net: 18, io: 60 };
function jiggle() {
  for (const key of Object.keys(statTargets)) {
    let v = statTargets[key] + (Math.random() - 0.5) * 8;
    v = Math.max(4, Math.min(98, v));
    statTargets[key] = v;
    const fill = document.getElementById("bar-" + key);
    const val = document.getElementById("val-" + key);
    if (fill) fill.style.transform = `scaleX(${v / 100})`;
    if (val) val.textContent = Math.round(v) + "%";
  }
}
setInterval(jiggle, 1500);
jiggle();

// ============== WAVEFORM ==============
const wf = document.getElementById("waveform");
for (let i = 0; i < 32; i++) {
  const b = document.createElement("div");
  b.className = "bar";
  b.style.height = "4px";
  wf.appendChild(b);
}
function tickWave() {
  [...wf.children].forEach((b, i) => {
    const t = Date.now() / 200 + i * 0.4;
    const h = 6 + Math.abs(Math.sin(t)) * 22 + Math.random() * 4;
    b.style.height = h + "px";
  });
}
setInterval(tickWave, 90);

// ============== GLOBE ==============
// True 3D point-cloud projection. Each meridian and parallel is a set of
// sample points on a unit sphere. We rotate them by the phase angle around
// the Y axis, project to 2D (drop Z, keep front-facing only), and draw.
// Constant phase advance => constant rotation, no cusps.
const meridiansEl = document.getElementById("globe-meridians");
const NS = "http://www.w3.org/2000/svg";
const R = 48;

// Build sample points: meridians (12 lines of constant longitude),
// parallels (5 lines of constant latitude). Each as an array of {lat,lon}.
const SAMPLES = [];
const MERIDIANS = 12;
const PARALLELS = 5;
const POINTS_PER_LINE = 36;
// meridians
for (let m = 0; m < MERIDIANS; m++) {
  const lon0 = (m / MERIDIANS) * Math.PI * 2;
  const pts = [];
  for (let i = 0; i <= POINTS_PER_LINE; i++) {
    const lat = -Math.PI / 2 + (i / POINTS_PER_LINE) * Math.PI;
    pts.push({ lat, lon: lon0, kind: "meridian" });
  }
  SAMPLES.push(pts);
}
// parallels (skip poles) — sample 0..2π but we'll shift seam to back at runtime
for (let p = 1; p < PARALLELS; p++) {
  const lat0 = -Math.PI / 2 + (p / PARALLELS) * Math.PI;
  const pts = [];
  for (let i = 0; i <= POINTS_PER_LINE; i++) {
    const lon = (i / POINTS_PER_LINE) * Math.PI * 2;
    pts.push({ lat: lat0, lon, kind: "parallel" });
  }
  SAMPLES.push(pts);
}

// Pre-create a path per line (supports multiple M...L subpaths)
const lineNodes = SAMPLES.map(() => {
  const p = document.createElementNS(NS, "path");
  p.setAttribute("fill", "none");
  p.setAttribute("stroke", "currentColor");
  p.setAttribute("stroke-width", 0.5);
  p.setAttribute("stroke-linecap", "round");
  p.setAttribute("stroke-linejoin", "round");
  meridiansEl.appendChild(p);
  return p;
});

// A single tracking dot so the eye can lock onto rotation
const tracker = document.createElementNS(NS, "circle");
tracker.setAttribute("r", 1.4);
tracker.setAttribute("fill", "currentColor");
meridiansEl.appendChild(tracker);

window.__globeSpeed = window.__globeSpeed || 24;

function tickGlobe(now) {
  const speed = window.__globeSpeed || 24;
  const phase = (now / 1000 / speed) * Math.PI * 2;
  const sinP = Math.sin(phase),
    cosP = Math.cos(phase);

  SAMPLES.forEach((line, idx) => {
    // For parallels (closed loops), find the most-back-facing sample and
    // rotate the iteration to start there, so the seam where the loop
    // begins/ends is always hidden behind the sphere — preventing the
    // visible arc from being split into two pieces near a duplicated seam.
    let startIdx = 0;
    if (line[0].kind === "parallel") {
      let minZ = Infinity;
      for (let i = 0; i < line.length - 1; i++) {
        const { lat, lon } = line[i];
        const cl = Math.cos(lat);
        const x0 = cl * Math.cos(lon);
        const z0 = cl * Math.sin(lon);
        const z = x0 * sinP + z0 * cosP;
        if (z < minZ) {
          minZ = z;
          startIdx = i;
        }
      }
    }
    const segments = [];
    let cur = [];
    const N = line[0].kind === "parallel" ? line.length - 1 : line.length;
    for (let k = 0; k < N; k++) {
      const { lat, lon } = line[(startIdx + k) % N];
      const cl = Math.cos(lat);
      const x0 = cl * Math.cos(lon);
      const y0 = Math.sin(lat);
      const z0 = cl * Math.sin(lon);
      const x = x0 * cosP - z0 * sinP;
      const z = x0 * sinP + z0 * cosP;
      const y = y0;
      if (z >= 0) {
        cur.push((x * R).toFixed(2) + "," + (-y * R).toFixed(2));
      } else if (cur.length) {
        if (cur.length > 1) segments.push(cur);
        cur = [];
      }
    }
    if (cur.length > 1) segments.push(cur);
    const d = segments
      .map((seg) => "M" + seg[0] + " L" + seg.slice(1).join(" L"))
      .join(" ");
    lineNodes[idx].setAttribute("d", d);
    lineNodes[idx].setAttribute(
      "opacity",
      line[0].kind === "parallel" ? 0.5 : 0.7,
    );
  });

  // tracker on equator at lon=0
  const tx = Math.cos(phase) * R;
  const tz = Math.sin(phase);
  tracker.setAttribute("cx", tx.toFixed(2));
  tracker.setAttribute("cy", 0);
  tracker.setAttribute("opacity", tz >= 0 ? 1 : 0);

  requestAnimationFrame(tickGlobe);
}
requestAnimationFrame(tickGlobe);

// ============== ACTIVITY LOG ==============
const logMsgs = [
  "Database indexed...",
  "Loaded themes...",
  "Parser success...",
  "Renderer success",
  "theme applied...",
  "globe animation frames loaded...",
  "no remote — local-only mode",
  "checksum OK · 0xJP2137",
];
const logEl = document.getElementById("log");
function pushLog() {
  const now = new Date();
  const ts = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;
  const msg = logMsgs[Math.floor(Math.random() * logMsgs.length)];
  const row = document.createElement("div");
  row.className = "row";
  row.innerHTML = `<span class="ts">${ts}</span><span class="msg">${msg}</span>`;
  logEl.prepend(row);
  while (logEl.children.length > 8) logEl.lastChild.remove();
}
for (let i = 0; i < 5; i++) pushLog();
setInterval(pushLog, 4200);

// ============== SYNC ==============
document
  .getElementById("sync-btn")
  .addEventListener("click", () => fetchIndex());
setInterval(() => {
  if (lastSyncTime) {
    document.getElementById("last-sync").textContent = relTime(lastSyncTime);
  }
}, 30000);

// ============== PANEL TOGGLES ==============
const app = document.getElementById("app");
document.getElementById("toggle-right").addEventListener("click", () => {
  app.dataset.rightClosed =
    app.dataset.rightClosed === "true" ? "false" : "true";
});
document.getElementById("toggle-left").addEventListener("click", () => {
  app.dataset.leftClosed = app.dataset.leftClosed === "true" ? "false" : "true";
});
document.getElementById("reopen-right").addEventListener("click", () => {
  app.dataset.rightClosed = "false";
});
document.getElementById("reopen-left").addEventListener("click", () => {
  app.dataset.leftClosed = "false";
});

// ============== BOOT SEQUENCE ==============
const BOOT_LINES = [
  { t: "[<span class='ok'>OK</span>] engram-core v0.1.4 loaded", d: 60 },
  { t: "[<span class='ok'>OK</span>] mounting filesystem ~/notes", d: 60 },
  { t: "<span class='dim'>... scanning directories</span>", d: 80 },
  { t: "<span class='dim'>... 3 folders / 14 files</span>", d: 80 },
  { t: "[<span class='ok'>OK</span>] renderer ready (engram-html v2)", d: 80 },
  { t: "[<span class='ok'>OK</span>] theme: phosphor.green", d: 60 },
  {
    t: "[<span class='ok'>OK</span>] fx-layer: scanlines · grain · flicker",
    d: 60,
  },
  {
    t: "[<span class='ok'>OK</span>] aux: chrono · globe · resources · signal",
    d: 60,
  },
  {
    t: "[<span class='warn'>WARN</span>] remote sync disabled (local-only)",
    d: 90,
  },
  { t: "[<span class='ok'>OK</span>] watcher attached", d: 60 },
  {
    t: "<span class='dim'>... loading File 02 — Spectral Decomposition</span>",
    d: 100,
  },
  { t: "[<span class='ok'>OK</span>] ready.", d: 80 },
];
function runBoot() {
  const boot = document.getElementById("boot");
  boot.dataset.done = "false";
  boot.style.opacity = "";
  boot.style.visibility = "";
  const lines = document.getElementById("boot-lines");
  lines.innerHTML = "";
  let total = 0;
  BOOT_LINES.forEach((l, i) => {
    total += l.d;
    setTimeout(() => {
      const el = document.createElement("div");
      el.className = "line";
      el.innerHTML = "&gt; " + l.t;
      el.style.animationDelay = "0s";
      el.style.opacity = 1;
      lines.appendChild(el);
      if (i === BOOT_LINES.length - 1) {
        const cur = document.createElement("span");
        cur.className = "cursor";
        el.appendChild(cur);
      }
    }, total);
  });
  setTimeout(() => {
    boot.dataset.done = "true";
  }, total + 700);
}
document.getElementById("replay-boot").addEventListener("click", runBoot);

// ============== INIT ==============
fetchIndex();
runBoot();

// ============== TWEAK APPLICATION ==============
function applyTweaks(t) {
  document.documentElement.dataset.theme =
    t.theme === "phosphor" ? "" : t.theme;
  if (t.theme === "phosphor")
    document.documentElement.removeAttribute("data-theme");
  const themeName =
    {
      phosphor: "PHOSPHOR",
      amber: "AMBER",
      cyan: "CYAN",
      red: "RED·ALERT",
      mono: "MONOCHROME",
      calm: "CALM·FOCUS",
    }[t.theme] || "PHOSPHOR";
  const ts = document.getElementById("status-theme");
  if (ts) ts.textContent = themeName;
  // FX intensity drives several CSS vars
  const k = (t.fxIntensity || 0) / 100;
  document.documentElement.style.setProperty(
    "--scanline-opacity",
    t.scanlines ? 0.1 + k * 0.45 : 0,
  );
  document.documentElement.style.setProperty(
    "--glow-strength",
    (0.4 + k * 1.2).toFixed(2),
  );
  document.documentElement.style.setProperty(
    "--flicker-strength",
    (k * 1.2).toFixed(2),
  );
  document.documentElement.style.setProperty(
    "--grain-opacity",
    (0.02 + k * 0.07).toFixed(3),
  );
  // Globe speed
  window.__globeSpeed = t.globeSpeed || 24;
  // Body font
  const fontMap = {
    "inter-jb": {
      serif: '"Inter", system-ui, sans-serif',
      mono: '"JetBrains Mono", monospace',
    },
    "lora-jb": {
      serif: '"Lora", Georgia, serif',
      mono: '"JetBrains Mono", monospace',
    },
    "plex-jb": {
      serif: '"IBM Plex Serif", Georgia, serif',
      mono: '"JetBrains Mono", monospace',
    },
    "all-mono": {
      serif: '"JetBrains Mono", monospace',
      mono: '"JetBrains Mono", monospace',
    },
  };
  const fp = fontMap[t.fontPair] || fontMap["all-mono"];
  document.documentElement.style.setProperty(
    "--serif",
    t.monoBody ? fp.mono : fp.serif,
  );
  document.documentElement.style.setProperty("--mono", fp.mono);
}
// expose for tweaks panel
window.__applyEngramTweaks = applyTweaks;
applyTweaks(settings);
// Topbar theme dropdown
const themeSelect = document.getElementById("theme-select");
themeSelect.value = settings.theme;
themeSelect.addEventListener("change", (e) => {
  const v = e.target.value;
  window.parent.postMessage(
    { type: "__edit_mode_set_keys", edits: { theme: v } },
    "*",
  );
  applyTweaks({ ...settings, ...window.__lastTweaks, theme: v });
  window.__lastTweaks = { ...(window.__lastTweaks || {}), theme: v };
});
// Topbar font dropdown
const fontSelect = document.getElementById("font-select");
fontSelect.value = settings.fontPair;
fontSelect.addEventListener("change", (e) => {
  const v = e.target.value;
  window.parent.postMessage(
    { type: "__edit_mode_set_keys", edits: { fontPair: v } },
    "*",
  );
  applyTweaks({ ...settings, ...window.__lastTweaks, fontPair: v });
  window.__lastTweaks = { ...(window.__lastTweaks || {}), fontPair: v };
});
const _origApply = window.__applyEngramTweaks;
window.__applyEngramTweaks = function (t) {
  _origApply(t);
  window.__lastTweaks = t;
  if (themeSelect.value !== t.theme) themeSelect.value = t.theme;
  if (fontSelect.value !== t.fontPair) fontSelect.value = t.fontPair;
};
