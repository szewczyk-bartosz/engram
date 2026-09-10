/**
 * Shape of engram-data/index.json, as written by index.py.
 * Keep in sync with the FileNode / FolderNode dataclasses there.
 */

export interface FileNode {
  type: "file";
  name: string;
  /** Path relative to the data root, POSIX separators. */
  path: string;
  source_hash: string;
  words: number;
  size: number;
  lines: number;
}

export interface FolderNode {
  type: "folder";
  name: string;
  children: IndexNode[];
}

export type IndexNode = FileNode | FolderNode;

export function countFiles(nodes: readonly IndexNode[]): number {
  let n = 0;
  for (const node of nodes) {
    n += node.type === "file" ? 1 : countFiles(node.children);
  }
  return n;
}
