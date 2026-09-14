import argparse
from http.server import HTTPServer, BaseHTTPRequestHandler
from pathlib import Path
import subprocess

def make_handler(source_dir: Path, web_root: Path):
    class Handler(BaseHTTPRequestHandler):
        def do_POST(self):
            if self.path == "/api/sync":
                subprocess.run([
                    "python3",
                    str(Path(__file__).parent / "index.py"),
                    "-i", str(source_dir),
                    "--web-root", str(web_root),
                ])
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

    return Handler

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("-i", type=Path, required=True, help="Source directory containing raw .eng files")
    parser.add_argument("--web-root", type=Path, required=True)
    args = parser.parse_args()

    HTTPServer(("localhost", 8001), make_handler(args.i, args.web_root)).serve_forever()
