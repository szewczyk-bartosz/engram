from http.server import HTTPServer, BaseHTTPRequestHandler
from pathlib import Path
import subprocess
import shutil

SCRIPT_DIR = Path("/var/www/engram")
SOURCE_DIR = Path("/home/cheryllamb/engram-data")

class Handler(BaseHTTPRequestHandler):
    def do_POST(self):
        print(f"{SCRIPT_DIR=} {SOURCE_DIR=}")
        if self.path == "/api/sync":
            subprocess.run(["python3", str(SCRIPT_DIR / "index.py"), str(SOURCE_DIR)])
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(b'{"ok": true}')
        else:
            self.send_response(404)
            self.end_headers()

    def log_message(self, format, *args):
        pass  # silence the request logs

HTTPServer(("localhost", 8001), Handler).serve_forever()
