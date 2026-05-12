from __future__ import annotations

import sys
import hashlib
import json
from dataclasses import dataclass
from pathlib import Path
from venv import create


def sha256_of(path: Path, chunk_size: int = 1 << 20) -> str:
    h = hashlib.sha256()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(chunk_size), b""):
            h.update(chunk)
    return f"sha256:{h.hexdigest()}"


@dataclass
class FileNode:
    name: str
    path: str
    source_hash: str  # "sha256:<hex>"
    words: int
    size: int
    lines: int

    type: str = "file"


@dataclass
class FolderNode:
    name: str
    children: list[FolderNode | FileNode]
    type: str = "folder"


def count_words_and_lines(file: Path) -> tuple[int, int]:
    with open(file, "r") as f:
        lines = f.read().split("\n")
        return sum([len(line.split()) for line in lines]), len(lines)


def createIndex(root: Path):
    def walk(target: Path) -> list[FolderNode | FileNode]:
        children: list[FolderNode | FileNode] = []
        for item in sorted(
            target.iterdir(), key=lambda x: (x.is_file(), x.name.lower())
        ):
            if item.name.startswith("."):
                continue
            if item.is_dir():
                children.append(FolderNode(name=item.name, children=walk(item)))
            else:
                n_words, n_lines = count_words_and_lines(item)
                children.append(
                    FileNode(
                        name=item.name,
                        path=item.relative_to(root).as_posix(),
                        source_hash=sha256_of(item),
                        words=n_words,
                        lines=n_lines,
                        size=item.stat().st_size,
                    )
                )

        return children

    return walk(root)


def flatten_files(tree):
    """Walk the tree and return {path: file_node} for every file."""
    result = {}

    def visit(nodes):
        for node in nodes:
            if node["type"] == "file":
                result[node["path"]] = node
            else:
                visit(node["children"])

    visit(tree)
    return result


import argparse
from dataclasses import asdict
import subprocess


def main():
    parser = argparse.ArgumentParser(
        description="Generate an index for a rendered engram directory."
    )
    parser.add_argument("root", type=Path, help="Root directory to index")

    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()

    index_path = Path("engram-data/index.json")
    render_dir = Path("engram-data/rendered/")
    raw_dir = Path("engram-data/raw/")
    rawIndex = createIndex(args.root)
    new_tree = flatten_files([asdict(i) for i in rawIndex])
    old_tree = flatten_files(load_index(index_path))

    if args.check:
        for i in rawIndex:
            print(i)

    for path, new_node in new_tree.items():
        old_node = old_tree.get(path)

        output_path = render_dir / new_node["path"]
        if (
            old_node
            and old_node["source_hash"] == new_node["source_hash"]
            and output_path.exists()
        ):
            continue
        else:
            print(f"{new_node} has changed! rendering it:")
            output_path.parent.mkdir(parents=True, exist_ok=True)
            _ = subprocess.run(
                [
                    "bmd",
                    "-i",
                    str(raw_dir / new_node["path"]),
                    "-o",
                    str(output_path),
                    "--engram",
                ]
            )
    save_index(index_path, rawIndex)


def save_index(path: Path, tree: list) -> None:
    with path.open("w", encoding="utf-8") as f:
        json.dump([asdict(n) for n in tree], f, indent=2, ensure_ascii=False)


def load_index(path: Path):
    try:
        with path.open("r", encoding="utf-8") as f:
            return json.load(f)
    except FileNotFoundError:
        return []


if __name__ == "__main__":
    main()
