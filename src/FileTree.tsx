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

function walk(node: TreeNode, setActivePath: (path: string) => void) {
  if (node.type == "folder") {
    return (
        <TreeNodeComponent node={node} setActivePath={setActivePath}/>
    );
  } else {
    return (
      <div className="tree-node">
        <div className="tree-label" onClick={() => setActivePath(node.path)}>{node.name}</div>
      </div>
    );
  }
}

interface FileTreeProps {
   setActivePath: ((path: string) => void) 
}

interface TreeNodeComponentProps {
    node: TreeNode
    setActivePath: ((path: string) => void),
}
function TreeNodeComponent({node, setActivePath}: TreeNodeComponentProps) {
    const[collapsed, setCollapsed] = useState<boolean>(false)
    if (node.type === "file") {
        return (
        <div className="tree-node">
        <div className="tree-label" onClick={() => setActivePath(node.path)}>{node.name}</div>
        </div>
        )
    } else {
        return (
        <div className="tree-node">
        <div onClick={(e) => { setCollapsed(!collapsed);}} className="tree-label">{node.name}</div>
        <div  className="tree-children" data-collapsed={collapsed}>{node.children.map((child) => <TreeNodeComponent key={child.name} node={child} setActivePath={setActivePath} />)}</div>
        </div>
        )
    }
    


}

export default function FileTree({setActivePath}: FileTreeProps) {
    const[tree, setTree] = useState<FolderNode | null>(null);
    useEffect(() => {
        fetch("/api/index").then(response => response.json()).then(data => setTree(data))
    }, [])
    return <div id="file-tree">{tree && walk(tree, setActivePath)}</div>
}
