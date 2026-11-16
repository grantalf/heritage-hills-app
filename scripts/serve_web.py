"""Serve an exported web build with single-page-app fallback. Usage: serve_web.py <dir> <port>"""
import http.server
import os
import sys

root, port = sys.argv[1], int(sys.argv[2])


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=root, **kwargs)

    def do_GET(self):
        path = self.translate_path(self.path.split("?")[0])
        if not os.path.isfile(path):
            self.path = "/index.html"
        return super().do_GET()

    def log_message(self, *args):
        pass


http.server.ThreadingHTTPServer(("127.0.0.1", port), Handler).serve_forever()
