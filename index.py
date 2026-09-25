from __future__ import annotations

import argparse
import hashlib
import json
import subprocess
from dataclasses import asdict, dataclass
from pathlib import Path

# All output lives in ./engrams/ next to this script, regardless of cwd.


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


def main():
    parser = argparse.ArgumentParser(
        description="Render .eng files from a source directory into ./engrams/ "
        "and generate an index."
    )
    parser.add_argument(
        "-i", type=Path, help="Source directory containing raw .eng files"
    )

    parser.add_argument("--web-root", type=Path, metavar="DIRECTORY", help="output HTML file")

    parser.add_argument("--check", action="store_true")
    parser.add_argument("--hard", action="store_true")
    args = parser.parse_args()

    source_dir: Path = args.i
    if not source_dir.is_dir():
        parser.error(f"source directory does not exist: {source_dir}")

    MEDIA_DIR = args.web_root / "dynamic"
    ENGRAMS_DIR = MEDIA_DIR / "engrams/"
    RENDER_DIR = ENGRAMS_DIR / "rendered/"
    INDEX_PATH = ENGRAMS_DIR / "index.json"
    ENGRAMS_DIR.mkdir(parents=True, exist_ok=True)
    RENDER_DIR.mkdir(parents=True, exist_ok=True)

    rawIndex = createIndex(source_dir)
    new_tree = flatten_files([asdict(i) for i in rawIndex])
    old_tree = flatten_files(load_index(INDEX_PATH))

    if args.check:
        for i in rawIndex:
            print(i)

    for path, new_node in new_tree.items():
        old_node = old_tree.get(path)

        output_path = RENDER_DIR / new_node["path"]
        if (
            old_node
            and old_node["source_hash"] == new_node["source_hash"]
            and output_path.exists()
            and not args.hard
        ):
            continue
        else:
            print(f"{new_node} has changed! rendering it:")
            output_path.parent.mkdir(parents=True, exist_ok=True)
            _ = subprocess.run(
                [
                    "bmd",
                    "-i",
                    str(source_dir / new_node["path"]),
                    "-o",
                    str(output_path),
                    "--engram",
                ]
            )
    save_index(INDEX_PATH, rawIndex)


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
