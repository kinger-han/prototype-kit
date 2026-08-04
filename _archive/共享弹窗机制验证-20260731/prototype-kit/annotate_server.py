import http.server
import json
import os
import sys
import shutil
import subprocess
import datetime
import argparse
from urllib.parse import urlparse

parser = argparse.ArgumentParser()
parser.add_argument('--project-path', required=True)
parser.add_argument('--port', type=int, default=8765)
args = parser.parse_args()

PROJECT_PATH = os.path.abspath(args.project_path)
ANNOTATIONS_FILE = os.path.join(PROJECT_PATH, 'prototype', 'annotations', 'annotations.json')
BACKUP_DIR = os.path.join(PROJECT_PATH, 'prototype', 'annotations', 'backup')
DIST_DIR = os.path.join(PROJECT_PATH, 'prototype', 'dist')
KIT_DIR = os.path.dirname(os.path.abspath(__file__))  # build.py 所在目录

os.makedirs(BACKUP_DIR, exist_ok=True)


class Handler(http.server.BaseHTTPRequestHandler):
    def _cors(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')

    def do_OPTIONS(self):
        self.send_response(200)
        self._cors()
        self.end_headers()

    def do_GET(self):
        path = urlparse(self.path).path
        if path == '/ping':
            self._json_response({'status': 'ok'})
        elif path == '/annotations':
            with open(ANNOTATIONS_FILE, 'r', encoding='utf-8') as f:
                data = json.load(f)
            self._json_response(data)
        elif path.startswith('/dist/'):
            self._serve_static(path)
        else:
            self.send_response(404)
            self._cors()
            self.end_headers()

    def do_POST(self):
        path = urlparse(self.path).path
        length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(length)
        if path == '/save':
            data = json.loads(body)
            self._save_annotation(data['id'], data['content'])
        elif path == '/rebuild':
            self._rebuild()
        else:
            self.send_response(404)
            self._cors()
            self.end_headers()

    # ---------- 具体逻辑 ----------

    def _save_annotation(self, anno_id, content):
        with open(ANNOTATIONS_FILE, 'r', encoding='utf-8') as f:
            data = json.load(f)

        if anno_id not in data.get('items', {}):
            self._json_response({'success': False, 'message': f'未找到编号 {anno_id}'})
            return

        # 保存前自动备份
        ts = datetime.datetime.now().strftime('%Y%m%d-%H%M%S')
        backup_path = os.path.join(BACKUP_DIR, f'annotations-{ts}.json')
        shutil.copy(ANNOTATIONS_FILE, backup_path)

        data['items'][anno_id]['content'] = content
        data['items'][anno_id]['updatedAt'] = datetime.datetime.now().isoformat()

        with open(ANNOTATIONS_FILE, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)

        self._json_response({'success': True})

    def _rebuild(self):
        try:
            result = subprocess.run(
                [sys.executable, os.path.join(KIT_DIR, 'build.py'), 'pc',
                 f'--project-path={PROJECT_PATH}', '--with-annotations'],
                capture_output=True, text=True, timeout=60
            )
            success = result.returncode == 0
            # 从输出中提取文件名
            dist_file = ''
            for line in result.stdout.split('\n'):
                if '构建完成' in line:
                    parts = line.strip().split(': ')
                    if len(parts) > 1:
                        dist_file = parts[-1]
                    break
            self._json_response({
                'success': success,
                'log': result.stdout + result.stderr,
                'distFile': dist_file
            })
        except Exception as e:
            self._json_response({'success': False, 'log': str(e), 'distFile': ''})

    def _serve_static(self, path):
        rel_path = path[len('/dist/'):]
        file_path = os.path.join(DIST_DIR, rel_path)
        if not os.path.exists(file_path):
            self.send_response(404)
            self._cors()
            self.end_headers()
            return
        self.send_response(200)
        self._cors()
        self.send_header('Content-Type', 'text/html; charset=utf-8')
        self.end_headers()
        with open(file_path, 'rb') as f:
            self.wfile.write(f.read())

    def _json_response(self, obj):
        self.send_response(200)
        self._cors()
        self.send_header('Content-Type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps(obj, ensure_ascii=False).encode('utf-8'))

    def log_message(self, format, *args):
        pass  # 静默日志，避免刷屏


if __name__ == '__main__':
    server = http.server.HTTPServer(('127.0.0.1', args.port), Handler)
    print(f'标注服务已启动: http://127.0.0.1:{args.port}')
    print(f'项目路径: {PROJECT_PATH}')
    print('保持此窗口运行，标注编辑会实时保存')
    server.serve_forever()
