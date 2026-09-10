import type { FileNode, FolderNode, IndexNode } from "./model";
import { clear, el } from "./dom";

export interface TreeController {
  /** Replace the whole tree with a fresh index. */
  setIndex(nodes: readonly IndexNode[]): void;
  /** Replace the tree with a single error row. */
  showError(message: string): void;
  /** Case-insensitive substring filter on file names. Empty string shows everything. */
  setFilter(query: string): void;
  expandAll(): void;
  collapseAll(): void;
}

interface FileRow {
  kind: "file";
  node: FileNode;
  rowEl: HTMLElement;
  /** Lower-cased display name, precomputed for filtering. */
  searchName: string;
}

interface FolderRow {
  kind: "folder";
  node: FolderNode;
  rowEl: HTMLElement;
  caretEl: HTMLElement;
  childrenEl: HTMLElement;
  /** Every file row below this folder, at any depth. */
  descendants: FileRow[];
}

type Row = FileRow | FolderRow;

const CARET_OPEN = "▾"; // ▾
const CARET_CLOSED = "▸"; // ▸
const DEPTH_MARK = ">";
const THIN_SPACE = " ";

/** "notes.eng" -> ["notes", ".eng"]; "README" -> ["README", ""]. */
function splitExt(name: string): [string, string] {
  const match = /(\.[^.]+)$/.exec(name);
  if (match === null || match[1] === undefined) return [name, ""];
  return [name.slice(0, -match[1].length), match[1]];
}

function setHidden(node: HTMLElement, hidden: boolean): void {
  // .tree-node is display:flex in CSS, which beats the [hidden] UA rule.
  node.style.display = hidden ? "none" : "";
}

export function createTree(
  root: HTMLElement,
  onSelect: (file: FileNode) => void,
): TreeController {
  let rows: Row[] = [];
  let activeEl: HTMLElement | null = null;
  let query = "";

  function setCollapsed(row: FolderRow, collapsed: boolean): void {
    row.childrenEl.dataset.collapsed = String(collapsed);
    row.caretEl.textContent = collapsed ? CARET_CLOSED : CARET_OPEN;
  }

  function select(row: FileRow): void {
    if (activeEl !== null) delete activeEl.dataset.active;
    activeEl = row.rowEl;
    activeEl.dataset.active = "true";
    onSelect(row.node);
  }

  function makeRowEl(
    node: IndexNode,
    depth: number,
  ): { rowEl: HTMLElement; caretEl: HTMLElement } {
    const [name, ext] = node.type === "file" ? splitExt(node.name) : [node.name, ""];
    const caretEl = el("span", {
      className: "caret",
      text: node.type === "folder" ? CARET_OPEN : " ",
    });
    const rowEl = el(
      "div",
      { className: "tree-node", dataset: { type: node.type } },
      caretEl,
      el("span", {
        className: "gt",
        text: Array<string>(depth + 1).fill(DEPTH_MARK).join(THIN_SPACE),
      }),
      el("span", { className: "name", text: name }),
      el("span", { className: "ext", text: ext }),
    );
    return { rowEl, caretEl };
  }

  /** Build rows for `nodes` under `parent`; returns every file row created. */
  function build(
    nodes: readonly IndexNode[],
    depth: number,
    parent: HTMLElement,
  ): FileRow[] {
    const files: FileRow[] = [];
    for (const node of nodes) {
      const { rowEl, caretEl } = makeRowEl(node, depth);
      parent.append(rowEl);

      if (node.type === "folder") {
        const childrenEl = el("div", { className: "tree-children" });
        parent.append(childrenEl);
        const descendants = build(node.children, depth + 1, childrenEl);
        const row: FolderRow = {
          kind: "folder",
          node,
          rowEl,
          caretEl,
          childrenEl,
          descendants,
        };
        rows.push(row);
        rowEl.addEventListener("click", () => {
          setCollapsed(row, childrenEl.dataset.collapsed !== "true");
        });
        files.push(...descendants);
      } else {
        const row: FileRow = {
          kind: "file",
          node,
          rowEl,
          searchName: node.name.toLowerCase(),
        };
        rows.push(row);
        rowEl.addEventListener("click", () => select(row));
        files.push(row);
      }
    }
    return files;
  }

  function fileMatches(row: FileRow): boolean {
    return query === "" || row.searchName.includes(query);
  }

  function applyFilter(): void {
    for (const row of rows) {
      if (row.kind === "file") {
        setHidden(row.rowEl, !fileMatches(row));
      } else {
        // A folder is only worth showing while something under it is visible.
        setHidden(row.rowEl, query !== "" && !row.descendants.some(fileMatches));
      }
    }
  }

  function setAllCollapsed(collapsed: boolean): void {
    for (const row of rows) {
      if (row.kind === "folder") setCollapsed(row, collapsed);
    }
  }

  return {
    setIndex(nodes) {
      rows = [];
      activeEl = null;
      clear(root);
      build(nodes, 0, root);
      applyFilter();
    },
    showError(message) {
      rows = [];
      activeEl = null;
      clear(root);
      root.append(
        el(
          "div",
          { className: "tree-node", dataset: { type: "file" } },
          el("span", { className: "caret", text: " " }),
          el("span", { className: "gt", text: DEPTH_MARK }),
          el("span", { className: "name", text: message }),
          el("span", { className: "ext" }),
        ),
      );
    },
    setFilter(q) {
      query = q.toLowerCase().trim();
      applyFilter();
    },
    expandAll: () => setAllCollapsed(false),
    collapseAll: () => setAllCollapsed(true),
  };
}
