#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Layout Benchmark 生成器：media-detail 三组海报详情页（16:9 / 9:16 / 1:1）
从 ui-system 真实资产组装单 HTML（tokens + layout + 组件 CSS 内联）。
验证 Layout Intelligence：不同 aspect_ratio → 不同 Layout Directive（split 档 / 媒体档）。

用法：
  python scripts/build-layout-benchmark.py
输出到 D:/hpy/桌面/日常临时会话/layout-benchmark/（含 BENCHMARK-RESULT.md 记录）

配套：ui-system/layout/benchmark.md（10 Case 全量清单）、critic.md（检查+Score）
验证方法：browser_navigate 打开产物 → browser_console 用 getBoundingClientRect() 取数值证据。
"""
import os, re, json

UI = "D:/HermesData/skills/product-management/interactive-prototype/ui-system"
OUT = "D:/hpy/桌面/日常临时会话/layout-benchmark"

def read(p):
    with open(os.path.join(UI, p), encoding="utf-8") as f:
        return f.read()

def extract_style(html):
    """提取组件文件里的 <style> 块"""
    m = re.search(r"<style>(.*?)</style>", html, re.DOTALL)
    return m.group(1) if m else ""

# ---- 读取真实资产 ----
tokens_css = read("tokens.css")
layout_tokens_css = read("layout/layout-tokens.css")
layout_css = read("layout/layout.css")
styles = "\n".join([
    extract_style(read(f"components/{c}.html"))
    for c in ["button", "page-header", "status-tag", "descriptions", "card", "table"]
])

ALL_CSS = f"""{tokens_css}
{layout_tokens_css}
{layout_css}
{styles}"""

def page_header(title, desc, back):
    return f"""
  <div class="ui-page-header">
    <div>
      <div style="display:flex;align-items:center;gap:var(--spacing-md);">
        <span class="ui-btn ui-btn-link" onclick="history.back()"><i data-lucide="arrow-left"></i>返回</span>
        <span class="ui-page-header-title">{title}</span>
      </div>
      <div class="ui-page-header-desc">{desc}</div>
    </div>
    <div class="ui-page-header-actions">
      <button class="ui-btn"><i data-lucide="download"></i>下载</button>
      <button class="ui-btn ui-btn-primary"><i data-lucide="pencil"></i>编辑</button>
    </div>
  </div>"""

def media_preview(variant, caption, poster_inner):
    return f"""
      <div class="layout-region">
        <div class="layout-media layout-media-{variant}">
          {poster_inner}
          <div class="layout-media-caption">
            <span><i data-lucide="image"></i> {caption}</span>
            <span>{variant.upper()}</span>
          </div>
        </div>
      </div>"""

def poster_block(bg_class, icon, name, size):
    return f"""
          <div style="width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:var(--spacing-md);background:var(--color-primary-bg);">
            <i data-lucide="{icon}" style="width:48px;height:48px;color:var(--color-primary);"></i>
            <div style="font-size:var(--font-size-lg);font-weight:var(--font-weight-semibold);color:var(--color-text);">{name}</div>
            <div style="font-size:var(--font-size-sm);color:var(--color-text-tertiary);">{size}</div>
          </div>"""

def metadata_panel(fields, related_rows=None, with_scroll=False):
    rows = "".join(
        f"<tr><th>{k}</th><td>{v}</td></tr>" for k, v in fields)
    rel = ""
    if related_rows:
        rel_rows = "".join(
            f"<tr><td>{r[0]}</td><td>{r[1]}</td><td>{r[2]}</td><td>{r[3]}</td></tr>"
            for r in related_rows)
        rel = f"""
  <div class="layout-region" style="grid-column:1/-1;">
    <div class="ui-card">
      <div class="ui-card-header"><div class="ui-card-title">使用记录</div></div>
      <div class="ui-card-body flush">
        <table class="ui-table">
          <thead><tr><th>场景</th><th>位置</th><th>更新时间</th><th>状态</th></tr></thead>
          <tbody>{rel_rows}</tbody>
        </table>
      </div>
    </div>
  </div>"""
    scroll_cls = " layout-panel-scroll" if with_scroll else ""
    return f"""
      <div class="layout-region layout-panel{scroll_cls}">
        <div class="ui-card">
          <div class="ui-card-header"><div class="ui-card-title">资源信息</div></div>
          <div class="ui-card-body">
            <table class="ui-descriptions ui-desc-col-2">
              <tbody>{rows}</tbody>
            </table>
          </div>
        </div>
        <div class="layout-section-title">操作</div>
        <div style="display:flex;gap:var(--spacing-sm);flex-wrap:wrap;">
          <button class="ui-btn"><i data-lucide="refresh-cw"></i>替换</button>
          <button class="ui-btn"><i data-lucide="share-2"></i>分享</button>
          <button class="ui-btn ui-btn-danger"><i data-lucide="trash-2"></i>删除</button>
        </div>
      </div>{rel}"""

def build_case(name, title, variant, split, density, fields, caption, related_rows, poster, with_scroll=False):
    page = f"""<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{title} - Layout Benchmark</title>
<style>
{ALL_CSS}
</style>
</head>
<body style="background:var(--color-bg-layout);margin:0;font-family:var(--font-family);">
<div class="layout-page layout-density-{density}">
  {page_header(title, "Layout Benchmark: " + variant, True)}
  <div class="layout-split {split}">
    {media_preview(variant, caption, poster)}
    {metadata_panel(fields, related_rows, with_scroll)}
  </div>
</div>
<script src="https://cdn.jsdelivr.net/npm/lucide@0.454.0/dist/umd/lucide.min.js"></script>
<script>
try {{ lucide.createIcons(); }} catch(e) {{}}
</script>
</body>
</html>"""
    return page

def main():
    os.makedirs(OUT, exist_ok=True)

    related = [
        ("朋友圈广告", "Banner 位 A1", "2026-08-09 10:00", '<span class="ui-tag ui-tag-success">投放中</span>'),
        ("抖音信息流", "Feed 位 C3", "2026-08-09 10:02", '<span class="ui-tag ui-tag-success">投放中</span>'),
        ("公众号推文", "封面", "2026-08-08 18:00", '<span class="ui-tag ui-tag-default">待排期</span>'),
    ]

    cases = [
        dict(name="case1-16x9-landscape.html", title="夏季促销海报详情", variant="landscape",
             split="layout-split-64", density="comfortable",
             fields=[("资源 ID", "RES-20260810-001"), ("状态", '<span class="ui-tag ui-tag-success">已发布</span>'), ("尺寸", "1920 × 1080 px"), ("文件大小", "2.4 MB"), ("创建人", "李明（市场部）"), ("创建时间", "2026-08-08 14:30"), ("使用渠道", "微信朋友圈 / 抖音信息流"), ("标签", "夏季促销 / 新品上市")],
             caption="夏季促销主视觉.jpg",
             poster=poster_block("landscape", "image", "夏季促销主视觉", "1920×1080"),
             related_rows=related),
        dict(name="case2-9x16-portrait.html", title="新品竖版海报详情", variant="portrait",
             split="layout-split-38", density="comfortable",
             fields=[("资源 ID", "RES-20260810-003"), ("状态", '<span class="ui-tag ui-tag-success">已发布</span>'), ("尺寸", "1080 × 1920 px"), ("文件大小", "1.8 MB"), ("创建人", "王芳（品牌部）"), ("创建时间", "2026-08-09 11:20"), ("使用渠道", "抖音信息流 / 快手"), ("标签", "新品上市 / 竖版视频封面")],
             caption="新品上市竖版海报.png",
             poster=poster_block("portrait", "image", "新品上市竖版海报", "1080×1920"),
             related_rows=related),
        dict(name="case3-1x1-square.html", title="产品主图详情", variant="square",
             split="layout-split-50", density="comfortable",
             fields=[("资源 ID", "RES-20260810-002"), ("状态", '<span class="ui-tag ui-tag-processing">审核中</span>'), ("尺寸", "1080 × 1080 px"), ("创建时间", "2026-08-09 09:12")],
             caption="产品主图.png",
             poster=poster_block("square", "image", "产品主图", "1080×1080"),
             related_rows=related),
    ]

    for c in cases:
        html = build_case(**c)
        out = os.path.join(OUT, c["name"])
        with open(out, "w", encoding="utf-8", newline="") as f:
            f.write(html)
        div_open = html.count("<div")
        div_close = html.count("</div>")
        print(f"✅ {c['name']}  ({len(html)}B, div平衡: {div_open}/{div_close}, split={c['split']}, variant={c['variant']})")

if __name__ == "__main__":
    main()
