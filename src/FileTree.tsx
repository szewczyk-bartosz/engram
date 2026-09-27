import { act, useState, useEffect } from "react";

type FileNode = {
  name: string;
  path: string;
  source_hash: string;
  words: number;
  size: number;
  lines: number;
  type: "file";
};

type FolderNode = {
  name: string;
  children: (FileNode | FolderNode)[];
  type: "folder";
};

export type TreeNode = FileNode | FolderNode;

interface FileTreeProps {
  setActivePath: (path: string) => void;
}

interface TreeNodeComponentProps {
  node: TreeNode;
  setActivePath: (path: string) => void;
  filterString: string
  collapsed: Set<string>
  setCollapsed: (newSet: Set<string>) => void;
  path: string;
}

function hasMatch(node: TreeNode, filter: string): boolean {
  if (node.type == "file") {
    return node.name.includes(filter);
  } else {
    return node.children.some(child => hasMatch(child, filter));
  }
};

function TreeNodeComponent({ node, setActivePath, filterString, collapsed, setCollapsed, path }: TreeNodeComponentProps) {
  if (node.type === "file") {
    if (hasMatch(node, filterString)) {
    return (
      <div className="tree-node">
        <div
          className="tree-label file-label"
          onClick={() => setActivePath(node.path)}
        >
          {node.name}
        </div>
      </div>
    );
    } else {
      return <></>
    }
  } else {
    if (hasMatch(node, filterString)) {
    let thisPath: string = path + node.name + "/";
    return (
      <div className="tree-node">
        <div
          onClick={() => {
            if (collapsed.has(thisPath)) {
              setCollapsed(new Set([...collapsed].filter(x => x !== thisPath)));
            } else {
            setCollapsed(new Set([...collapsed, thisPath]));
            }
          }}
          data-collapsed={collapsed.has(thisPath)}
          className="tree-label folder-label"
        >
          {node.name}
        </div>
        <div className="tree-children">
          {node.children.map((child) => (
            <TreeNodeComponent
              filterString = {filterString}
              key={child.name}
              node={child}
              setActivePath={setActivePath}
              collapsed = {collapsed}
              setCollapsed = {setCollapsed}
              path = {thisPath}
            />
          ))}
        </div>
      </div>
    );
    } else return <></>
  }
}

function SearchBox({setFilterString}: {setFilterString: (query: string) => void} ) {
  return <input placeholder="input..." className="tree-search-box" onChange={(e) => setFilterString(e.target.value)}/>
}

function getAllFolderPaths(node: TreeNode, path: string): string[] {
  let thisPath: string = path + node.name + "/";
  if (node.type == "folder") {
    return [thisPath, ...node.children.flatMap(child => getAllFolderPaths(child, path))]
  } else {
    return []
  }
}


export default function FileTree({ setActivePath }: FileTreeProps) {
  const [tree, setTree] = useState<FolderNode | null>(null);
  const [filterString, setFilterString] = useState<string>("");
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  useEffect(() => {
    fetch("/api/index")
      .then((response) => response.json())
      .then((data) => setTree(data));
  }, []);
  return (
    <>
      <SearchBox setFilterString={setFilterString} />
      <div className="file-tree-expand-collapse-buttons">
      <button onClick={() => setCollapsed(new Set())}>[Expand All]</button>
      <button onClick={() => tree && setCollapsed(new Set(getAllFolderPaths(tree, "/")))}>[Collapse All]</button>
      </div>
      <div id="file-tree">
        {tree && (
          <TreeNodeComponent node={tree} setActivePath={setActivePath} filterString={filterString} collapsed={collapsed} setCollapsed={setCollapsed} path="/"/>
        )}
      </div>
    </>
  );
}
