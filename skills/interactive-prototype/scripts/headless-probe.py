#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
headless-probe.py — 原型产物 JS 运行时探针

用途：改过 prototype/pages/*.html 的 JS 后，用 Edge headless 真跑一遍构建产物，
      抓运行时异常 + 关键容器渲染行数。静态检查（node --check / 断链扫描）
      抓不到这一层问题。

用法：
    python headless-probe.py <产物.html> --page <路由名> [--sel <选择器>] [--wait 800]
                             [--call fn1,fn2] [--expr "<js>"]

示例：
    python headless-probe.py "prototype/dist/主题管理V2-pc-原型.html" \
        --page demand-detail --sel "#ddTableBody" \
        --call ddAddRow --wait 900

输出：一行 JSON（title 里带出来的），含
      ok / afterShow / 选择器状态 / 调用结果 / errs(页面异常列表)

退出码：0 = 无错误；1 = 有异常或探针失败（可直接用于脚本门禁）
"""
import argparse
import json
import os
import re
import subprocess
import sys

EDGE_CANDIDATES = [
    r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
    r"C:\Program Files\Microsoft\Edge\Application\msedge.exe",
]


def find_edge():
    for p in EDGE_CANDIDATES:
        if os.path.exists(p):
            return p
    raise SystemExit("找不到 msedge.exe，请手动指定 EDGE 路径")


def build_probe(page, sel, wait_ms, calls, expr):
    calls_js = json.dumps(calls or [])
    expr_js = json.dumps(expr or "")
    sel_js = json.dumps(sel or "")
    return """<script>
setTimeout(function () {
  var out = { ok: true };
  var errs = [];
  try {
    if (%s) { protoShowPage(%s); }
    out.afterShow = 'ok';
  } catch (e) { out.afterShow = String(e); out.ok = false; }

  try {
    var sel = %s;
    if (sel) {
      var el = document.querySelector(sel);
      out.found = !!el;
      if (el) {
        out.tagname = el.tagName;
        out.childRows = el.querySelectorAll('tr').length;
        out.text = (el.textContent || '').trim().slice(0, 160);
        out.htmlHead = (el.innerHTML || '').slice(0, 200);
      }
    }
  } catch (e) { out.selErr = String(e); out.ok = false; }

  try {
    out.calls = {};
    var fns = %s;
    for (var i = 0; i < fns.length; i++) {
      var n = fns[i];
      try {
        if (typeof window[n] !== 'function') { out.calls[n] = 'UNDEFINED'; out.ok = false; }
        else { window[n](); out.calls[n] = 'ok'; }
      } catch (e) { out.calls[n] = String(e); out.ok = false; }
    }
  } catch (e) { out.callErr = String(e); out.ok = false; }

  try {
    var ex = %s;
    if (ex) { out.expr = String(eval(ex)).slice(0, 300); }
  } catch (e) { out.exprErr = String(e); out.ok = false; }

  out.errs = window.__ERRS || [];
  if (out.errs.length) out.ok = false;
  document.title = 'PROBE' + JSON.stringify(out);
}, %d);
</script>""" % (json.dumps(page or ""), json.dumps(page or ""), sel_js, calls_js,
                   expr_js, int(wait_ms))


COLLECT = """<script>
window.__ERRS = [];
window.addEventListener('error', function (e) {
  window.__ERRS.push((e.message || '') + ' @line' + (e.lineno || ''));
});
window.addEventListener('unhandledrejection', function (e) {
  window.__ERRS.push('unhandledrejection: ' + String(e.reason));
});
</script>"""


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("dist", help="构建产物 HTML 路径")
    ap.add_argument("--page", default="", help="要切换到的页面路由名（protoShowPage 参数）")
    ap.add_argument("--sel", default="", help="要检查的容器选择器，如 #ddTableBody")
    ap.add_argument("--wait", type=int, default=800, help="探针延时(ms)，需小于 virtual-time-budget")
    ap.add_argument("--budget", type=int, default=8000, help="headless virtual-time-budget(ms)")
    ap.add_argument("--call", default="", help="逗号分隔的待调用函数名（验证按钮处理函数不炸）")
    ap.add_argument("--expr", default="", help="额外求值的 JS 表达式，结果写进 expr")
    ap.add_argument("--out", default="", help="临时文件路径（默认写到 TMPDIR）")
    a = ap.parse_args()

    src = os.path.abspath(a.dist)
    if not os.path.exists(src):
        raise SystemExit("产物不存在：" + src)

    tmpdir = a.out or os.environ.get("TMPDIR") or os.environ.get("TEMP") or "."
    test = os.path.join(tmpdir, "headless-probe.html")

    s = open(src, encoding="utf-8").read()
    if "</head>" not in s or "</body>" not in s:
        raise SystemExit("产物结构异常：找不到 </head> 或 </body>")
    calls = [c.strip() for c in a.call.split(",") if c.strip()]
    s = s.replace("</head>", COLLECT + "</head>", 1)
    s = s.replace("</body>", build_probe(a.page, a.sel, a.wait, calls, a.expr) + "</body>", 1)
    with open(test, "w", encoding="utf-8") as f:
        f.write(s)

    edge = find_edge()
    url = "file:///" + test.replace("\\", "/")
    r = subprocess.run(
        [edge, "--headless", "--disable-gpu", "--no-sandbox",
         "--virtual-time-budget=%d" % a.budget, "--dump-dom", url],
        capture_output=True, text=True, encoding="utf-8", errors="replace", timeout=180)

    m = re.search(r"<title>(.*?)</title>", r.stdout or "", re.S)
    if not m:
        print("未能取到 title —— headless 可能未渲染完成，试试加大 --budget")
        return 2
    raw = m.group(1).strip()
    if not raw.startswith("PROBE"):
        print("探针未执行，title =", raw[:200])
        return 2
    try:
        data = json.loads(raw[len("PROBE"):])
    except Exception as e:
        print("解析探针结果失败：", e, raw[:300])
        return 2

    print(json.dumps(data, ensure_ascii=False, indent=2))
    return 0 if data.get("ok") else 1


if __name__ == "__main__":
    sys.exit(main())
