import type { IndexNode } from "./model";

/** Relative so the site works under any base path Caddy serves it from. */
export const DATA_ROOT = "./engram-data";

async function fetchOk(url: string): Promise<Response> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res;
}

/** The file tree produced by index.py. */
export async function fetchIndex(): Promise<IndexNode[]> {
  const res = await fetchOk(`${DATA_ROOT}/index.json`);
  return (await res.json()) as IndexNode[];
}

/** URL of the rendered HTML fragment for a file's index path. */
export function documentUrl(path: string): string {
  return `${DATA_ROOT}/rendered/${path}`;
}

/** The server-rendered HTML fragment for a file. */
export async function fetchDocument(path: string): Promise<string> {
  const res = await fetchOk(documentUrl(path));
  return res.text();
}
