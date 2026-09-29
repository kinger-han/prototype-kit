#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""扫「JS 引用了、但全项目源码里没有声明的 element id」。

为什么需要：build.py 组件化原型里弹窗 DOM 在 pages/_shared.html、触发 JS 在业务页，
两侧 id 很容易对不上。一旦 `document.getElementById('X').textContent = ...` 抛错，
函数里后面那句 `classList.add('show')` 就永不执行 —— 症状是「点按钮毫无反应，
控制台也没有显眼报错」，而且可能从写下那天起就是坏的。

用法：
    python find-missing-element-ids.py <项目目录>

输出「文件 + 缺失 id」候选清单，**需人工核对**：
由 JS 动态 createElement 的元素（resToast / 动态下拉 等）本就不在源码里声明，属正常豁免；
重点看 *Name / *Desc / *Body / *Modal 这类静态弹窗元素。
dist/ 被刻意跳过 —— 它是构建产物，重复的 id 会把问题掩盖掉。
"""
import os
import re
import sys

ID_DECL = re.compile(r'id="([^"]+)"')
ID_USED = re.compile(r"getElementById\(\s*'([^']+)'\s*\)|getElementById\(\s*\"([^\"]+)\"\s*\)")
SKIP_DIRS = {'.git', 'dist', 'node_modules', '__pycache__', '.venv'}


def scan(root):
    declared, used = set(), []
    for dirpath, dirnames, filenames in os.walk(root):
        dirnames[:] = [d for d in dirnames if d not in SKIP_DIRS]
        for fn in filenames:
            if not fn.endswith(('.html', '.js')):
                continue
            path = os.path.join(dirpath, fn)
            try:
                text = open(path, 'rb').read().decode('utf-8', 'replace')
            except OSError:
                continue
            declared.update(ID_DECL.findall(text))
            for m in ID_USED.finditer(text):
                used.append((os.path.relpath(path, root).replace('\\', '/'), m.group(1) or m.group(2)))
    return declared, used


def main():
    if len(sys.argv) < 2:
        print(__doc__)
        return 2
    root = sys.argv[1]
    if not os.path.isdir(root):
        print('目录不存在: %s' % root)
        return 2

    declared, used = scan(root)
    seen, missing = set(), []
    for f, ident in used:
        if ident in declared or (f, ident) in seen:
            continue
        seen.add((f, ident))
        missing.append((f, ident))

    if not missing:
        print('OK: 所有 getElementById 引用的 id 都能在源码里找到声明')
        return 0

    print('候选清单（JS 引用了但源码里没有声明）—— 逐个核对：')
    for f, ident in sorted(missing):
        print('  %-42s %s' % (f, ident))
    print('\n注意：JS 动态创建的元素（toast 等）属正常豁免，')
    print('重点核对 *Name / *Desc / *Body / *Modal 这类静态弹窗元素。')
    return 0


if __name__ == '__main__':
    sys.exit(main())
