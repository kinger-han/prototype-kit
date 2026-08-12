# GitHub Pages 在线预览发布 — 完整规程（2026-08-10 落地）

发布仓：`kinger-han/prototype-preview`（公开，本地 `D:/hpy/桌面/数熙相关文档/prototype-preview/`）
地址模式：`https://kinger-han.github.io/prototype-preview/<slug>/`（根地址是导航页）

## 发布脚本能力（tools/publish-preview.sh）

一次 `--project <项目目录>` 调用自动完成：
1. 读 `<项目目录>/publish-config.json`（支持单原型或 `prototypes` 数组）
2. 按 `dist_glob` 找 dist 产物 → 取**最新修改时间**且**排除文件名含"标注"**的那个
3. 复制产物 → `<slug>/index.html`；复制 `assets_dir` → `<slug>/assets`
4. **自动压缩大图**：assets 内 >300KB 的 png/jpg → 缩放最长边 1080px + 转 WebP q82（method=6），删原文件，HTML 内文件名一并替换
5. HTML 内 `../assets/` → `assets/` 路径重写
6. 更新导航页（已存在则跳过）；多原型统一一次 commit+push

## publish-config.json 两种格式

单原型（主题管理）：
```json
{"slug":"topic-mgmt-v2","name":"资源管理","desc":"智融平台 - 资源管理 原型","dist_glob":"prototype/dist/*.html","assets_dir":"prototype/assets"}
```
多原型（智能导游 PC+移动端，一次发布）：
```json
{"prototypes":[
  {"slug":"smart-guide-pc","name":"智能导游（PC端）","desc":"...","dist_glob":"prototype/dist/*pc-原型.html","assets_dir":"prototype/assets"},
  {"slug":"smart-guide-mobile","name":"智能导游（移动端）","desc":"...","dist_glob":"prototype/dist/*mobile-原型.html","assets_dir":"prototype/assets"}
]}
```
- 脚本自动兼容两种：`cfg.get('prototypes') if isinstance(...list) else [cfg]`
- `dist_glob` 建议带平台关键词（`*pc-原型.html` / `*mobile-原型.html`），避免选错产物；"标注"过滤是硬规则
- slug 必须英文（URL 一部分）；slug 定下后**不要改**，改 slug 会破坏已分享链接——改名只改 `name` 字段

## 图片压缩（GitHub Pages 大陆访问慢的根治手段）

**现象**：大陆直连 github.io 慢；1920×1080 原图 6 张共 10MB → 打开"咔咔的"。
**处理**：发布时自动压缩（源项目 assets 原图不动！压缩只发生在发布仓副本）：
- 阈值 >300KB、最长边 1080px、WebP quality=82 → 实测 10MB → 380KB（每张 48-78KB，-96%）
- HTML 文件名替换陷阱：`1.png` 是 `11.png` 的子串，`replace('1.png','1.webp')` 会把 `11.png` 顺带改成 `11.webp`（本例恰好正确，但替换顺序要意识到这点）；unique 文件名替换用 `s.count(old)` 先确认命中
- 验证：线上 HTML `grep -c 'assets/img/'` 应等于本地引用数、`grep -c '\.\./assets/'` 应为 0

## 改名显示名（不改链接）

1. 改项目 `publish-config.json` 的 `name`（和 desc）——下次发布生效
2. **手动 patch 导航页** `prototype-preview/index.html` 对应卡片（脚本对已存在卡片"跳过"，不会自动更新旧卡片名）
3. 把 config 改动 commit+push 回源码私有仓

## build.bat 集成自动发布

```bat
@echo off
echo === Step 1: Build prototype ===
"D:/HermesData/hermes-agent/venv/Scripts/python.exe" "D:/hpy/文档/ObsidianVault/06-资源/模板/prototype-kit/build.py" pc --project-path="%~dp0"
echo.
echo === Step 2: Publish to GitHub Pages preview ===
bash "D:/hpy/桌面/数熙相关文档/prototype-preview/tools/publish-preview.sh" --project "%~dp0"
echo.
pause
```
踩坑：老 build.bat 里引用了不存在的 `data-inject.ps1`（死步骤）；中文路径被存成 `??`（历史编码损坏，实际跑不通）。**Windows .bat 必须用 GBK 编码写**（python `open(...,'wb').write(content.encode('gbk'))`），UTF-8 写中文路径在 cmd 里会乱码。

## GitHub API 调用坑（启用 Pages / 建仓）

- **curl `-d` 带中文 JSON → "Problems parsing JSON" (400)**；`-d @file` 读中文路径文件也会失败。**改用 Python urllib**：
```python
import json, urllib.request, os, re
token = re.search(r'https://[^:]+:([^@]+)@github\.com', open(os.path.expanduser('~/.git-credentials'), encoding='utf-8').read()).group(1)
body = json.dumps({...}).encode('utf-8')
req = urllib.request.Request(url, data=body, method='POST', headers={'Authorization':'token '+token,'Accept':'application/vnd.github+json','Content-Type':'application/json'})
```
- git credential store（`~/.git-credentials`）里有可用 PAT（40位），可提取调 API；**不要打印/写入记忆**
- 私有仓启用 Pages：POST 报 422 "Your current plan does not support GitHub Pages for this repository" → 免费版只能公开仓开 Pages
- 启用 Pages（公开仓）：POST `/repos/kinger-han/prototype-preview/pages` `{"source":{"branch":"main","path":"/"}}`

## 验证清单（发布后）

- 部署约 1 分钟生效；github.io 大陆访问抖动，curl/urllib 超时是常态——**用 `--max-time` 短超时 + 重试**，不要一失败就重来
- 逐个 `curl -s -o /dev/null -w "%{http_code}" -L <url>/` 应全 200
- 图片 URL（含中文文件名）需 `urllib.parse.quote` 编码验证；svg 无碍
- 导航页卡片名与 publish-config 的 name 一致

## 其他

- 中文文件名图片在 urllib 验证时要 quote；浏览器自动处理
- 一个项目发布多个原型时 slug 用 `-pc` / `-mobile` 后缀区分
- 新原型接入：项目根放 publish-config.json + 确认 build.bat 已集成 → 一条命令发布
