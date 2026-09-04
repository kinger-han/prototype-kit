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

## push 网络与代理（2026-08-17 实测）

- **本机 git 全局代理已配置**：`git config --global http.proxy = http://127.0.0.1:10809` → 普通 `git push` 自动走代理；**不要用 `-c http.proxy= -c https.proxy=` 强制直连**（直连大陆常 `Connection was reset`，仅当全局代理挡路时才尝试临时直连）
- **publish-preview.sh 已内置 push 重试（2026-08-17 修复）**：`git_push_with_retry()` → 第1次全局代理 → 失败第2次显式 `-c http.proxy=http://127.0.0.1:10809` 重试 → 仍失败输出 4 条可操作提示（代理未启动/网络不通/认证过期/手动命令），不再静默 `set -e` 退出。**发布失败第一排查：代理 10809 是否启动**
- push 超时先 `git status -sb` 确认是否 ahead，再换通道重试，不要反复跑发布脚本
- **发布脚本自动设置浏览器标题**（输出 `🔖 浏览器标题已设置`，读 publish-config.json 的 `title`）——"预览标题对但本地打开标题不对"时，要改源 shell（`prototype/shell-pc.html` 的 `<title>`）+ 重建 dist，build.py 不覆盖 shell title
- build.bat `publish` 参数模式（智能导游已实现）：构建 → bash 存在性检查（`where bash`）→ 调 publish-preview.sh → errorlevel 检查 + 可操作提示；Windows 下 bash 缺失时明确报"请使用 git-bash 环境"

## 本地管理工具（manager.bat）故障排查

工具位置：`D:/hpy/桌面/数熙相关文档/prototype-preview/tools/manager.bat`（双击 → http://localhost:8765，功能：发布/改名/改浏览器标题/复制链接/下线）

**⚠️ [WinError 2] 系统找不到指定的文件（2026-08-17 实测）**：manager.bat 用 Windows 原生 Python 启动，PATH 里没有 git-bash → `subprocess.run(['bash', ...])` 报 WinError 2（终端里手跑脚本正常是因为终端本身就是 bash 环境）。已修复：manager_server.py 顶部解析 bash 绝对路径（`shutil.which('bash')` 失败则回退 `C:\Program Files\Git\bin\bash.exe` / `usr\bin\bash.exe` / `x86\Git` 候选），调用处用 `[BASH, SCRIPT, ...]`。改完代码必须**重启 manager.bat**（旧进程不加载新代码）。验证：`python -c "import manager_server; print(manager_server.BASH)"`。

**⚠️ 端口 8765 残留进程（2026-08-10 实测）**：kill 服务时只杀 bash 包装进程会留 python 子进程占着 8765，多个实例同时监听导致请求打到旧代码。清理：`netstat -ano | grep 8765` 找 LISTENING PID → python subprocess 调 `taskkill /F /PID`（bash 里 taskkill 参数会被路径转换搞坏）→ 确认无监听再重启。

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
