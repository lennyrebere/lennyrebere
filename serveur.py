
#!/usr/bin/env python3
import http.server
import json
import os
import base64
import urllib.parse
import unicodedata
from pathlib import Path

ROOT = Path(__file__).parent

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        if parsed.path == '/api/list-images':
            params = urllib.parse.parse_qs(parsed.query)
            sous_dossier = params.get('dossier', ['assets/images'])[0]
            dossier = (ROOT / sous_dossier).resolve()
            if ROOT.resolve() not in dossier.parents and dossier != ROOT.resolve():
                self.send_response(400)
                self.end_headers()
                return
            extensions = {'.jpg', '.jpeg', '.png', '.gif', '.webp'}
            fichiers = sorted(unicodedata.normalize('NFC', f.name) for f in dossier.iterdir() if f.is_file() and f.suffix.lower() in extensions) if dossier.exists() else []
            self._ok({'images': fichiers})
            return
        super().do_GET()

    def do_POST(self):
        try:
            self._do_POST()
        except (BrokenPipeError, ConnectionResetError):
            pass
        except Exception as e:
            try:
                self.send_response(500)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'error': str(e)}).encode())
            except Exception:
                pass

    def _do_POST(self):
        length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(length)
        data = json.loads(body)

        if self.path == '/api/save-html':
            fichier = data['fichier']
            contenu = data['contenu']
            chemin = ROOT / fichier
            chemin.parent.mkdir(parents=True, exist_ok=True)
            chemin.write_text(contenu, encoding='utf-8')
            self._ok({'status': 'ok'})

        elif self.path == '/api/delete-file':
            fichier = data['fichier']
            chemin = ROOT / fichier
            if chemin.exists() and ROOT in chemin.parents:
                chemin.unlink()
                self._ok({'status': 'ok'})
            else:
                self._ok({'status': 'not_found'})

        elif self.path == '/api/save-image':
            fichier = data['fichier']
            image_b64 = data['image']
            image_bytes = base64.b64decode(image_b64)
            chemin = ROOT / 'assets' / 'images' / fichier
            chemin.parent.mkdir(parents=True, exist_ok=True)
            chemin.write_bytes(image_bytes)
            self._ok({'status': 'ok'})

        elif self.path == '/api/save-fichier':
            fichier = data['fichier']
            dossier = data.get('dossier', 'assets/fichiers')
            contenu_b64 = data['contenu']
            contenu_bytes = base64.b64decode(contenu_b64)
            chemin = (ROOT / dossier / fichier).resolve()
            if ROOT.resolve() not in chemin.parents:
                self.send_response(400)
                self.end_headers()
                return
            chemin.parent.mkdir(parents=True, exist_ok=True)
            chemin.write_bytes(contenu_bytes)
            self._ok({'status': 'ok'})

        else:
            self.send_response(404)
            self.end_headers()

    def _ok(self, data):
        resp = json.dumps(data).encode()
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Content-Length', len(resp))
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(resp)

    def end_headers(self):
        # Désactiver le cache pour CSS, HTML et JS (toujours servir la version fraîche)
        path = self.path.split('?')[0]
        if path.endswith('.css') or path.endswith('.html') or path.endswith('.js'):
            self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
            self.send_header('Pragma', 'no-cache')
            self.send_header('Expires', '0')
        super().end_headers()

    def log_message(self, format, *args):
        pass  # silencieux

if __name__ == '__main__':
    import webbrowser, threading
    port = 8000
    print(f'Serveur lancé → http://localhost:{port}/editeur.html')
    threading.Timer(1, lambda: webbrowser.open(f'http://localhost:{port}/editeur.html')).start()
    http.server.ThreadingHTTPServer(('', port), Handler).serve_forever()
