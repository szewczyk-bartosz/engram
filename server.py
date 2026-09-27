import argparse
from http.server import HTTPServer, BaseHTTPRequestHandler
from pathlib import Path
import subprocess
from typing import final


def make_handler(source_dir: Path, web_root: Path):
    class Handler(BaseHTTPRequestHandler):
        def do_POST(self):
            if self.path == "/api/sync":
                subprocess.run(
                    [
                        "python3",
                        str(Path(__file__).parent / "index.py"),
                        "-i",
                        str(source_dir),
                        "--web-root",
                        str(web_root),
                        "--hard",
                    ]
                )
                self.send_response(200)
                self.send_header("Content-Type", "application/json")
                self.send_header("Access-Control-Allow-Origin", "*")
                self.end_headers()
                self.wfile.write(b'{"ok": true}')
            else:
                self.send_response(404)
                self.end_headers()

        def log_message(self, format, *args):
            pass

        def do_GET(self):
            if self.path == "/api/index":
                try:
                    data = (web_root / "engrams/index.json").read_bytes()
                    self.send_response(200)
                    self.send_header("Content-Type", "application/json")
                    self.send_header("Access-Control-Allow-Origin", "*")
                    self.end_headers()
                    self.wfile.write(data)
                except FileNotFoundError:
                    print("Index file not found")
                    self.send_response(404)
                    self.end_headers()

            elif self.path.startswith("/api/files/"):
                try:
                    requestedPath = Path(self.path.removeprefix("/api/files/"))
                    engrams_dir = web_root / "engrams/rendered"
                    finalPath = (engrams_dir / requestedPath).resolve(strict=True)
                    if web_root.resolve() in finalPath.parents and finalPath.is_file():
                        data = finalPath.read_bytes()
                        self.send_response(200)
                        self.send_header("Content-Type", "application/json")
                        self.send_header("Access-Control-Allow-Origin", "*")
                        self.end_headers()
                        self.wfile.write(data)
                    else:
                        print(f"Possible attack attempt? {self.path}")
                        self.send_response(404)
                        self.end_headers()
                except OSError as e:
                    print(f"OSError Encountered when fetching {self.path}: {e}")
                    self.send_response(404)
                    self.end_headers()
            else:
                print(f"Unkown endpoint {self.path}")
                self.send_response(404)
                self.end_headers()

    return Handler


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "-i",
        type=Path,
        required=True,
        help="Source directory containing raw .eng files",
    )
    parser.add_argument("--web-root", type=Path, required=True)
    args = parser.parse_args()

    HTTPServer(("localhost", 8001), make_handler(args.i, args.web_root)).serve_forever()
