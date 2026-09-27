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
        <div className="tree-label file-label" onClick={() => setActivePath(node.path)}>{node.name}</div>
        </div>
        )
    } else {
        return (
        <div className="tree-node">
        <div onClick={(e) => { setCollapsed(!collapsed);}} data-collapsed={collapsed} className="tree-label folder-label">{node.name}</div>
        <div  className="tree-children" >{node.children.map((child) => <TreeNodeComponent key={child.name} node={child} setActivePath={setActivePath} />)}</div>
        </div>
        )
    }
}


export default function FileTree({setActivePath}: FileTreeProps) {
    const[tree, setTree] = useState<FolderNode | null>(null);
    useEffect(() => {
        fetch("/api/index").then(response => response.json()).then(data => setTree(data))
    }, [])
    return <>
    <div id="file-tree">{tree && <TreeNodeComponent node={tree} setActivePath={setActivePath}/>}</div>
    </>
}
