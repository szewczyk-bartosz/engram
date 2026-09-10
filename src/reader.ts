import type { FileNode } from "./model";
import { documentUrl, fetchDocument } from "./api";
import { clear, el } from "./dom";

export interface ReaderElements {
  /** Container the rendered fragment goes into. */
  doc: HTMLElement;
  /** Article frame; its data-doc-* attributes feed the CSS BEGIN/EOF rules. */
  frame: HTMLElement;
  docPath: HTMLElement;
  crumbs: HTMLElement;
  statusDoc: HTMLElement;
  words: HTMLElement;
  bytes: HTMLElement;
  lines: HTMLElement;
  read: HTMLElement;
}

export interface Reader {
  show(file: FileNode): Promise<void>;
}

const FADE_OUT_MS = 120;
const WORDS_PER_MINUTE = 220;
const DOC_ID_MAX = 24;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function notFound(url: string): HTMLElement[] {
  return [
    el("h1", { text: "404" }),
    el("p", {}, "Fragment not found at ", el("code", { text: url })),
  ];
}

export function createReader(els: ReaderElements): Reader {
  // Incremented per show(); a stale response must not overwrite a newer one.
  let requestSeq = 0;

  els.doc.style.transition = `opacity 0.35s`;

  function updateMeta(file: FileNode): void {
    const readMinutes = Math.max(1, Math.ceil(file.words / WORDS_PER_MINUTE));
    els.words.textContent = file.words.toLocaleString();
    els.bytes.textContent = file.size.toLocaleString();
    els.lines.textContent = file.lines.toLocaleString();
    els.read.textContent = `${readMinutes} MIN`;

    const basename = file.path.split("/").pop() ?? file.name;
    els.frame.dataset.docId = basename.toUpperCase().slice(0, DOC_ID_MAX);
    els.frame.dataset.docBytes = file.size.toLocaleString();
    els.frame.dataset.docWords = file.words.toLocaleString();
    els.statusDoc.textContent = `${basename.replace(/\.eng$/, "").toUpperCase()}.ENGRAM`;
  }

  function updatePaths(file: FileNode): void {
    const parts = file.path.split("/");
    const folders = parts.slice(0, -1);
    const basename = parts[parts.length - 1] ?? file.name;

    clear(els.docPath);
    els.docPath.append(el("span", { text: "~" }));
    for (const folder of folders) {
      els.docPath.append(
        el("span", { className: "sep", text: "/" }),
        el("span", { text: folder }),
      );
    }
    els.docPath.append(
      el("span", { className: "sep", text: "/" }),
      el("span", { className: "here", text: basename }),
    );

    clear(els.crumbs);
    els.crumbs.append(el("span", { className: "dim", text: "~/notes" }));
    for (const folder of folders) {
      els.crumbs.append(
        el("span", { className: "sep", text: "›" }), // ›
        el("span", { text: folder }),
      );
    }
    els.crumbs.append(
      el("span", { className: "sep", text: "›" }),
      el("span", { className: "here", text: file.name }),
    );
  }

  async function show(file: FileNode): Promise<void> {
    const seq = ++requestSeq;
    els.doc.style.opacity = "0";
    await delay(FADE_OUT_MS);

    let html: string | null = null;
    try {
      html = await fetchDocument(file.path);
    } catch {
      html = null;
    }
    if (seq !== requestSeq) return;

    if (html === null) {
      clear(els.doc);
      els.doc.append(...notFound(documentUrl(file.path)));
    } else {
      // Trusted: this is the server-rendered fragment produced by bmd.
      els.doc.innerHTML = html;
    }
    els.doc.style.opacity = "1";
    updateMeta(file);
    updatePaths(file);
  }

  return { show };
}
