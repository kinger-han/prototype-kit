#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""原型符号核对：死函数扫描 / 断链扫描 / 单页函数外部引用盘点。

用法（用绝对路径的 Python 跑，项目目录给绝对路径）:
    python scan-page-symbols.py <项目目录>
    python scan-page-symbols.py <项目目录> --page 03-resource-mgmt-b.html
    python scan-page-symbols.py <项目目录> --page prototype/pages/_res-core.html

判读口径（三个都要看）:
  1) 死函数   —— 全站出现次数（含定义文件自身）减去定义处 == 0，才可删。
                 不要用「其他文件有没有引用」的简化版。
  2) 断链     —— HTML 事件属性 / script 拼串里调用的名字，减去已定义函数，差集必须为空。
  3) 单页盘点 —— 该页每个函数仍被哪些文件引用；有 >0 项即「隐藏共享源」，
                 删文件会静默打断它们，应退役为 _ 前缀共享组件（见 dead-code-audit.md）。
"""
import argparse
import glob
import os
import re
import sys

DEF_RE = re.compile(r'function[ \t]+([A-Za-z_$][\w$]*)')
ASSIGN_FN_RE = re.compile(r'(?:var|let|const)[ \t]+([A-Za-z_$][\w$]*)[ \t]*=[ \t]*function')
EVENT_ATTR_RE = re.compile(
    r'on(?:click|change|input|keyup|keydown|keypress|blur|focus|submit|mouseenter|mouseleave|dblclick|load|error)'
    r'[ \t]*=[ \t]*"([^"]*)"'
)
EVENT_ATTR_SQ_RE = re.compile(
    r"on(?:click|change|input|keyup|keydown|blur|focus|submit|load|error)[ \t]*=[ \t]*'([^']*)'"
)
CALL_RE = re.compile(r'([A-Za-z_$][\w$]*)[ \t]*\(')
MEMBER_CALL_RE = re.compile(r'\.\s*[A-Za-z_$][\w$]*\s*\(')

# 只保留语言关键字白名单：成员调用已由 MEMBER_CALL_RE 剥掉，
# 剩下会误入的只有 if/for 这类语法关键字。
KEYWORDS = {
    'if', 'for', 'while', 'switch', 'catch', 'return', 'typeof', 'function',
    'new', 'delete', 'in', 'of', 'do', 'else', 'try', 'void', 'instanceof',
}


def load_sources(project):
    patterns = (
        'prototype/pages/*.html',
        'prototype/pages/**/*.html',
        'prototype/shell-*.html',
    )
    found = []
    for pat in patterns:
        found += glob.glob(os.path.join(project, pat), recursive=True)
    sources = {}
    for path in sorted(set(found)):
        rel = os.path.relpath(path, project).replace('\\', '/')
        try:
            with open(path, encoding='utf-8') as fh:
                sources[rel] = fh.read()
        except (OSError, UnicodeDecodeError) as exc:  # noqa: BLE001
            print('  !! 读取失败 %s: %s' % (rel, exc))
    return sources


def defined_functions(sources):
    names = set()
    for text in sources.values():
        names |= set(DEF_RE.findall(text))
        names |= set(ASSIGN_FN_RE.findall(text))
    return names


def occurrences(name, sources):
    """全站出现次数，减去定义处（function name / 赋值定义）。"""
    pat = re.compile(r'\b' + re.escape(name) + r'\b')
    defpat = re.compile(r'function[ \t]+' + re.escape(name) + r'\b')
    total = 0
    for text in sources.values():
        total += len(pat.findall(text)) - len(defpat.findall(text))
    return max(total, 0)


def bare_calls(expr):
    """从事件属性片段里取裸函数调用：先剥掉 obj.method( 再抽标识符。"""
    expr = MEMBER_CALL_RE.sub('.', expr)
    return {n for n in CALL_RE.findall(expr) if n not in KEYWORDS}


def called_names(sources):
    calls = set()
    for text in sources.values():
        for attr in EVENT_ATTR_RE.findall(text):
            calls |= bare_calls(attr)
        for attr in EVENT_ATTR_SQ_RE.findall(text):
            calls |= bare_calls(attr)
        # script 拼串：onclick="fn(' + id + ')"  → 抓 fn
        for chunk in re.findall(r'on(?:click|change|input)[^"\']*[\'\"]([^\'\"]+)', text):
            calls |= bare_calls(chunk)
    return calls


def report_dead(sources):
    defined = defined_functions(sources)
    dead = sorted(n for n in defined if occurrences(n, sources) == 0)
    print('=== 死函数（全站计数为 0，可删）: %d ===' % len(dead))
    for name in dead:
        print('    %s' % name)
    if not dead:
        print('    （无）')
    return dead


def report_broken(sources):
    defined = defined_functions(sources)
    broken = sorted(c for c in called_names(sources) if c not in defined)
    print()
    print('=== 断链（被 HTML 事件/拼串调用但无定义）: %d ===' % len(broken))
    for name in broken:
        where = [f for f, t in sources.items()
                 if re.search(r'\b' + re.escape(name) + r'\b', t)]
        print('    %-28s 出现于: %s' % (name, ', '.join(where)))
    print('    判读：protoShowPage / resToast 等由 build 或别处注入的属正常；其余必须补实现或删调用')
    return broken


def report_page(sources, page_key):
    matches = [f for f in sources if f.endswith(page_key) or f == page_key]
    if not matches:
        print('!! 未找到页面文件: %s' % page_key)
        print('   可用文件:')
        for f in sources:
            print('     ', f)
        return 1
    page = matches[0]
    text = sources[page]
    names = sorted(set(DEF_RE.findall(text)) | set(ASSIGN_FN_RE.findall(text)))
    print('=== 页面退役门禁：%s（%d 个函数） ===' % (page, len(names)))
    print()
    external = 0
    for name in names:
        refs = []
        for fname, ftext in sources.items():
            if fname == page:
                continue
            if re.search(r'\b' + re.escape(name) + r'\b', ftext):
                refs.append(fname)
        if refs:
            external += 1
            print('  %-28s 被引用于: %s' % (name, ', '.join(refs)))
    if external == 0:
        print('  （无外部引用）—— 该页对外无依赖；仍需确认页内自用后再删')
    else:
        print()
        print('  ⚠ %d 个函数仍被外部引用 —— 该页是「隐藏共享源」，不要删文件，' % external)
        print('    按 dead-code-audit.md「页面退役」转成 _ 前缀共享组件。')
    return 0


def main():
    parser = argparse.ArgumentParser(description='原型符号核对（死函数 / 断链 / 页面盘点）')
    parser.add_argument('project', help='项目目录（绝对路径）')
    parser.add_argument('--page', help='只盘点该页面的函数被谁引用（删页/退役前门禁）')
    args = parser.parse_args()

    if not os.path.isdir(args.project):
        print('!! 项目目录不存在: %s' % args.project)
        return 2

    sources = load_sources(args.project)
    if not sources:
        print('!! 未找到任何页面/shell 源文件（看的是 prototype/pages/*.html 与 prototype/shell-*.html）')
        return 2
    print('扫描文件 %d 个' % len(sources))
    print()

    if args.page:
        return report_page(sources, args.page)

    report_dead(sources)
    broken = report_broken(sources)
    return 1 if broken else 0


if __name__ == '__main__':
    sys.exit(main())
