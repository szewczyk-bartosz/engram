/*EDITMODE-BEGIN*/
const TWEAK_DEFAULTS = {
  theme: "phosphor",
  fxIntensity: 65,
  scanlines: true,
  globeSpeed: 24,
  showLeftBrackets: false,
  monoBody: false,
  fontPair: "lora-jb",
};
/*EDITMODE-END*/

// ============== TREE DATA ==============
const TREE = [
  {
    type: "folder",
    name: "Folder A",
    children: [
      {
        type: "folder",
        name: "Subfolder A1",
        children: [
          { type: "file", name: "File 01", ext: ".eng" },
          {
            type: "file",
            name: "File 02 — Spectral Decomposition",
            ext: ".eng",
            active: true,
          },
          { type: "file", name: "File 03", ext: ".eng" },
        ],
      },
      {
        type: "folder",
        name: "Subfolder A2",
        children: [
          { type: "file", name: "File 04", ext: ".eng" },
          { type: "file", name: "File 05", ext: ".eng" },
        ],
      },
      { type: "file", name: "File 06 (root of A)", ext: ".eng" },
    ],
  },
  {
    type: "folder",
    name: "Folder B",
    collapsed: true,
    children: [
      { type: "file", name: "File 07", ext: ".eng" },
      {
        type: "folder",
        name: "Subfolder B1",
        children: [
          { type: "file", name: "File 08", ext: ".eng" },
          { type: "file", name: "File 09", ext: ".eng" },
        ],
      },
    ],
  },
  {
    type: "folder",
    name: "Folder C",
    children: [
      { type: "file", name: "File 10", ext: ".eng" },
      { type: "file", name: "File 11", ext: ".eng" },
      { type: "file", name: "File 12", ext: ".eng" },
      {
        type: "folder",
        name: "Subfolder C1",
        collapsed: true,
        children: [{ type: "file", name: "File 13", ext: ".eng" }],
      },
    ],
  },
  { type: "file", name: "README", ext: ".eng" },
  { type: "file", name: "Index", ext: ".eng" },
];

function renderTree() {
  const root = document.getElementById("tree");
  root.innerHTML = "";
  function walk(nodes, depth, parentEl) {
    nodes.forEach((node, i) => {
      const el = document.createElement("div");
      el.className = "tree-node";
      el.dataset.type = node.type;
      if (node.active) el.dataset.active = "true";
      const gt = ">".repeat(depth + 1);
      const caret = node.type === "folder" ? (node.collapsed ? "▸" : "▾") : " ";
      el.innerHTML = `
							<span class="caret">${caret}</span>
							<span class="gt">${gt}</span>
							<span class="name">${node.name}</span>
							<span class="ext">${node.ext || ""}</span>
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
          loadDoc(node.name);
        });
      }
    });
  }
  walk(TREE, 0, root);
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
// This represents what the user's renderer would inject as ready-to-go HTML.
function buildSampleDoc(title) {
  return `
											<h1>${title}</h1>
											<div class="doc-meta">
											<span>EDITED 2026-05-07 11:42</span>
											<span>SIZE 4.7 KB</span>
											<span>TAGS theory · linear-algebra</span>
											</div>
											<p>The <strong>spectral theorem</strong> is one of those ideas that keeps showing up — every time you think you've moved past it, it reappears wearing a slightly different hat. The core claim is simple enough: a real symmetric matrix can be diagonalised by an orthogonal matrix, and the diagonal it produces is its spectrum.</p>
											
											<p>What's interesting isn't the statement, it's the <em>shape</em> of the proof. You build it out of two facts that don't obviously fit together — that symmetric operators have real eigenvalues, and that eigenvectors for distinct eigenvalues are orthogonal. The proof is the gluing.</p>
											
											<h2>Setup</h2>
											<p>Let \\(A \\in \\mathbb{R}^{n \\times n}\\) with \\(A^\\top = A\\). We want to find an orthogonal \\(Q\\) and diagonal \\(D\\) such that:</p>
											<pre data-lang="math"><code>A = Q D Q^T,    where Q^T Q = I</code></pre>
											
											<p>The columns of <code>Q</code> are an orthonormal basis of eigenvectors. Read this aloud once or twice — it's the whole punchline.</p>
											
											<h3>A small example</h3>
											<p>Take the matrix:</p>
											<pre data-lang="math"><code>A = | 4  1 |
											| 1  2 |</code></pre>
											<p>Its characteristic polynomial is <code>(λ-4)(λ-2) - 1 = λ² - 6λ + 7</code>, giving eigenvalues <code>3 ± √2</code>. Both real — as promised.</p>
											
											<div class="callout">
											Symmetry isn't aesthetic here. It's a structural promise: the operator agrees with its own transpose, which forces the algebra to behave.
											</div>
											
											<h2>Why this matters</h2>
											<ul>
											<li>PCA falls out of this — the principal components are the eigenvectors of the covariance matrix.</li>
											<li>Quadratic forms become trivially classifiable: positive-definite ⇔ all eigenvalues positive.</li>
											<li>It generalises cleanly to compact self-adjoint operators on a Hilbert space.</li>
											</ul>
											
											<h3>Pseudocode</h3>
											<pre data-lang="python"><code>import numpy as np
											
											def spectral_decompose(A):
											assert np.allclose(A, A.T), "A must be symmetric"
											eigvals, eigvecs = np.linalg.eigh(A)
											# eigh returns sorted real eigenvalues for symmetric A
											return eigvecs, np.diag(eigvals)
											
											Q, D = spectral_decompose(A)
											# A == Q @ D @ Q.T  (up to floating point)</code></pre>
											
											<blockquote>
											"Diagonalisation isn't a trick. It's the act of finding the coordinate system the operator was always speaking in."
											</blockquote>
											
											<h2>Open questions</h2>
											<ol>
											<li>What is the cleanest proof of the orthogonality of eigenvectors that doesn't go through complex numbers?</li>
											<li>How does this break for non-normal matrices, and what replaces it (Schur, SVD)?</li>
											<li>Numerically: when does <code>eigh</code> drift, and how do we detect it?</li>
											</ol>
											
											<hr>
											
											<table>
											<thead>
											<tr><th>Property</th><th>Symmetric</th><th>Normal</th><th>General</th></tr>
											</thead>
											<tbody>
											<tr><td>Real eigenvalues</td><td>✓</td><td>—</td><td>—</td></tr>
											<tr><td>Orthogonal eigenvectors</td><td>✓</td><td>✓</td><td>—</td></tr>
											<tr><td>Diagonalisable</td><td>✓</td><td>✓</td><td>—</td></tr>
											</tbody>
											</table>
											
											<p>Next time: link this to the <a href="#">SVD note</a> and to the <a href="#">PCA derivation</a>.</p>
											`;
}

function loadDoc(title) {
  const target = document.getElementById("engram-doc");
  target.style.opacity = 0;
  setTimeout(() => {
    target.innerHTML = buildSampleDoc(title);
    target.style.transition = "opacity 0.35s";
    target.style.opacity = 1;
    updateDocMeta(title);
    updateCrumbs(title);
  }, 120);
}

function updateDocMeta(title) {
  const text = document.getElementById("engram-doc").innerText;
  const words = text.trim().split(/\s+/).length;
  const bytes = new Blob([text]).size;
  const lines = text.split("\n").length;
  const read = Math.max(1, Math.round(words / 220));
  document.getElementById("m-words").textContent = words.toLocaleString();
  document.getElementById("m-bytes").textContent = bytes.toLocaleString();
  document.getElementById("m-lines").textContent = lines.toLocaleString();
  document.getElementById("m-read").textContent = read + " MIN";
  const frame = document.getElementById("doc-frame");
  frame.dataset.docId = title.toUpperCase().replace(/\s+/g, "-").slice(0, 24);
  frame.dataset.docBytes = bytes.toLocaleString();
  frame.dataset.docWords = words.toLocaleString();
  document.getElementById("status-doc").textContent =
    title.toUpperCase().replace(/[^\w]+/g, "-") + ".ENGRAM";
}

function updateCrumbs(title) {
  const slug = title.toLowerCase().replace(/[^\w]+/g, "-");
  document.getElementById("doc-path").innerHTML = `
												<span>~</span>
												<span style="color:var(--fg-faint)">/</span>
												<span>folder-a</span>
												<span style="color:var(--fg-faint)">/</span>
												<span>subfolder-a1</span>
												<span style="color:var(--fg-faint)">/</span>
												<span class="here">${slug}.engram</span>`;
  const cb = document.getElementById("crumbs");
  cb.innerHTML = `
												<span class="dim">~/notes</span>
												<span class="sep">›</span><span>Folder A</span>
												<span class="sep">›</span><span>Subfolder A1</span>
												<span class="sep">›</span><span class="here">${title}</span>`;
}

// ============== CLOCK ==============
const startTime = Date.now();
function tick() {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  const hms = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
  document.getElementById("clock-time").textContent = hms;
  document.getElementById("topbar-clock").textContent = hms;
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
  "indexed Folder A/Subfolder A1",
  "watcher attached → ~/notes",
  "loaded File 02 (4.7 KB)",
  "renderer: 12 blocks parsed",
  "fx: scanlines @ 0.35",
  "theme: phosphor.green active",
  "globe rotation @ 24s/rev",
  "search index rebuilt (42 files)",
  "no remote — local-only mode",
  "checksum OK · 0xA3F2",
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
document.getElementById("sync-btn").addEventListener("click", (e) => {
  const btn = e.currentTarget;
  if (btn.dataset.syncing === "true") return;
  btn.dataset.syncing = "true";
  btn.querySelector(".sync-label").textContent = "SCANNING...";
  setTimeout(() => {
    btn.dataset.syncing = "false";
    btn.querySelector(".sync-label").textContent = "SYNC FILES";
    document.getElementById("last-sync").textContent = "just now";
    pushLog();
  }, 1600);
});

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
renderTree();
loadDoc("File 02 — Spectral Decomposition");
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
  const fp = fontMap[t.fontPair] || fontMap["lora-jb"];
  document.documentElement.style.setProperty(
    "--serif",
    t.monoBody ? fp.mono : fp.serif,
  );
  document.documentElement.style.setProperty("--mono", fp.mono);
}
// expose for tweaks panel
window.__applyEngramTweaks = applyTweaks;
applyTweaks(TWEAK_DEFAULTS);
// Topbar theme dropdown
const themeSelect = document.getElementById("theme-select");
themeSelect.value = TWEAK_DEFAULTS.theme;
themeSelect.addEventListener("change", (e) => {
  const v = e.target.value;
  window.parent.postMessage(
    { type: "__edit_mode_set_keys", edits: { theme: v } },
    "*",
  );
  applyTweaks({ ...TWEAK_DEFAULTS, ...window.__lastTweaks, theme: v });
  window.__lastTweaks = { ...(window.__lastTweaks || {}), theme: v };
});
const _origApply = window.__applyEngramTweaks;
window.__applyEngramTweaks = function (t) {
  _origApply(t);
  window.__lastTweaks = t;
  if (themeSelect.value !== t.theme) themeSelect.value = t.theme;
};
