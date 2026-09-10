/** Small DOM helpers so modules never touch innerHTML with data in it. */

/** Look up an element by id, throwing if the HTML is missing it. */
export function byId<T extends Element = HTMLElement>(id: string): T {
  const node = document.getElementById(id);
  if (node === null) throw new Error(`missing element #${id}`);
  return node as unknown as T;
}

export interface ElProps {
  className?: string;
  text?: string;
  dataset?: Record<string, string>;
}

type Child = Node | string;

/** Create an element with optional class, text, data-* attributes and children. */
export function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  props: ElProps = {},
  ...children: Child[]
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (props.className !== undefined) node.className = props.className;
  if (props.text !== undefined) node.textContent = props.text;
  if (props.dataset !== undefined) {
    for (const [k, v] of Object.entries(props.dataset)) node.dataset[k] = v;
  }
  for (const child of children) {
    node.append(child);
  }
  return node;
}

const SVG_NS = "http://www.w3.org/2000/svg";

/** Create an SVG element in the SVG namespace with the given attributes. */
export function svgEl<K extends keyof SVGElementTagNameMap>(
  tag: K,
  attrs: Record<string, string | number> = {},
): SVGElementTagNameMap[K] {
  const node = document.createElementNS(SVG_NS, tag);
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, String(v));
  return node;
}

/** Remove every child of a node. */
export function clear(node: Element): void {
  node.replaceChildren();
}
