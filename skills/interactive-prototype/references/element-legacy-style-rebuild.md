# 老版 Element UI 样式重构执行流程（隔离副本 + 复用官方资源）

> 承接 `element-ui-legacy-doc-fetch.md`（那是"判哪些页面需UI、核查Element能力"的决策框架）。本文档是**实际动手做样式重构**的执行规程：把已有 AntD 原型重构成老版 Element UI 风格，只换样式、逻辑/数据/交互全不动，且不碰原项目。2026-08-21 主题管理V2实战确立。

## 触发场景
用户要求"按老系统 UI 规范（Element UI）重新生成/重构这个模块的页面"，并强调：
- "绝对禁止重复造轮子（自己写组件样式）"——必须复用 Element 官方组件/样式
- "样式重构，但是其他都不变"——逻辑、数据、交互、函数名、onclick 全部保留
- 界面里已有组件的直接复用；老系统没有的页面才动

## 工作流（照做）

### 1. 建独立副本目录，原项目完全不动（铁律）
- 复制到平级新目录，例如 `D:\...\主题管理\` → `D:\...\主题管理-老版UI\`：复制 `prototype/` + `publish-config.json` + `README.md`
- 原项目只读参考；所有重构改在副本里。原项目 commit 保持干净，随时可对照/回滚。
- 独立副本还能避免改坏原项目 + 让 UI/前端拿旧版参照。

### 2. 下载 Element 官方 CSS + 图标字体（真实资源，非自造）
用 unpkg（Element 是老 SPA 无 CDN 文档，直接从 npm 包抓成品）：
```bash
# Element UI 2.x 官方发布包
curl -sL "https://unpkg.com/element-ui@2.15.14/lib/theme-chalk/index.css" -o index.css
# 图标字体（CSS 里 @font-face 引用 fonts/element-icons.woff / .ttf）
curl -sL "https://unpkg.com/element-ui@2.15.14/lib/theme-chalk/fonts/element-icons.woff" -o element-icons.woff
curl -sL "https://unpkg.com/element-ui@2.15.14/lib/theme-chalk/fonts/element-icons.ttf" -o element-icons.ttf
```
- 落到副本 `prototype/assets/element/css/index.css` + `prototype/assets/element/fonts/`（**必须保持 `fonts/` 与 CSS 平级下的相对路径**，因 CSS 内写 `url(fonts/element-icons.woff)`）
- 主色 #409EFF 即 Element 老系统蓝，与现网截图一致。
- 这份 index.css 含全部组件类（el-table/el-dialog/el-tree/el-pagination/el-button/el-icon-*）约 230KB。

### 3. build.py 的 shell 不被覆盖 —— 所以 CSS 注入 shell 安全
`build.py resolve_shell_path()`：**项目有 `prototype/shell-pc.html` 副本 → 用项目副本，不覆盖**；首次构建才从模板复制。所以副本项目里直接改自己的 `shell-pc.html` 的 `<head>` 注入 Element CSS 是安全的：
```html
<link rel="stylesheet" href="assets/element/css/index.css">
```
（用相对路径，build 后路径解析一致。）

### 4. 复用红线（用户强要求，违反即返工）
- **只用 Element 官方 CSS 类**（el-table、el-dialog、el-tree、el-pagination、el-button、el-icon-* 等，全在 index.css 已定义）
- **禁止自己手写组件样式**去仿 Element（不许发明新类、不许手写边框/色值/阴影）
- **图标必须用 Element 官方 `el-icon-*`**（如 el-icon-search/el-icon-download/el-icon-refresh，见 index.css 内 @font-face + content 定义）
- 老系统没有的（资源卡片网格、统计卡大盘）用 Element 基础组件**组合**（el-card + flex/grid），不脱离 Element 自造视觉
- 保留每个控件原有 `id` 和 `onclick/onchange` 事件绑定，只换外层 class 到 Element 类名

### 5. 规模评估：大重构先做 1 个最复杂样例页再铺开
- 10 页 / 12000+ 行级别的完整重构，**一次派子 agent 全做完风险高**（上下文分散、易半途崩）。
- 先做**控件最全的 1 页**（如公共资源07页：表格+左树+统计卡+卡片+筛选+批量操作+视图切换全都有）作为样例 → 用户验收老风格达标 → 再复制它的做法铺开其余页。
- 统计页面规模：`wc -l pages/*.html | sort -n`，挑最大最全的当样例。

### 6. 委派子 agent（MIMO）执行
- 写交接文档放副本根目录（`HANDOFF-*.md`），含：任务概述、项目绝对路径、老版视觉要点（深蓝侧边栏/斑马纹表格/共N条分页/状态标签色）、复用红线、必须保留项（JS逻辑/数据/交互/函数名/onclick）、构建命令、禁止项（禁改 dist、禁 pages 放临时 html、不 git commit）、验收标准。
- 子 agent 完成阈值：改完文件 + build.py 重建 + node --check 通过，报告改动清单、用到的 Element 类名、老系统没有处的组合方案。
- Hermes 负责验收（JS语法/构建/dist检查/Element类名是否注入）+ commit。

## 委派子 agent 超时的半成品接手（2026-08-21 实战：MIMO 600s 超时）
单页重构（如 07 页 1800+ 行）委派子 agent 常在**做完静态层、未改 JS 动态模板**处超时（600s 硬超时，20 次 API call 全耗在读文件/大 patch 上）。接手要点：
- **先查工作区再判断，别凭\"超时\"就重做**：`ls pages/*.html` + shell + dist 的 mtime 与派发时间对比。本案例 MIMO 已改 shell(head 注入 CSS) + 07 页静态 HTML/CSS 完成、dist 未重建（mtime 停在复制时）。副本无 .git 时用 mtime；有 git 用 `git diff`。
- **超时的子 agent 往往做对了方向**：静态层（统计卡/筛选/树/按钮/分页 → el-card/el-input/el-form-item/el-button/el-pagination）已完整 Element 化且保留 id/onclick，这已验证方向正确，不需要推倒。**半成品 ≠ 白干**——接手是补完 JS 动态部分，不是重做。
- **补完对象 = JS 里生成 HTML 的函数**（`resMgmtCardHtml`/`resMgmtPlatformsHtml`/主题表格 `ops` 等）：把卡片本体 el-card、状态标签 el-tag、操作按钮 el-button、平台标签 el-tag，全部替换时保留每个原 id/onclick/事件绑定。
- **Patch 整块带转义 JS 会 Escape-drift（本会话卡片函数反复报 `\\\\'`）**：含 `\` 拼接 onclick 的整函数块，patch 单次替换会把正确 `\'` 写坏成 `\\'`。治本：Python 读文件定位，`html.count(old)` 验证锚点唯一后再 replace；统计反斜杠数量用 `seg.count('\\')`（heredoc 里 `'\\'` 在 Python 内要写作 `chr(92)` 或 `'\\\\'` 免转义地狱）。改完必须 `node --check`。
- **验证完成度**：源文件页 `action-btn`/旧类清零即可（dist 里残留是其它未重构页的合并，属正常）。
- 补完 → build.py 重建 → dist 验收（Element CSS link 1处、el-card/el-button/el-icon/el-tag 数量、07页路由 2、页面 id 去重）→ 副本 git init + commit 作基线。

## 需用户拍板的点（老系统没有的专项）
老 Element 组件库**没有现成拖拽**（如排播计划拖动排序需引第三方）。这一类要提前列出来让用户拍板（允许引 sortablejs 等），不要自作主张引入或硬套。
其他需申报：资源卡片网格、统计大屏、横竖版详情/编辑布局（尺寸不一易留白）、视图切换。这些用 Element 基础组件组合，不算造轮子但要点明。

## 踩坑
- **Element CSS 路径**：CSS 内 @font-face 写的是 `fonts/element-icons.woff`，若你把字体放别处图标全不显示。必须 css 平级建 fonts/。
- **Element 官方是 Vue 组件**，但"不迁移 Vue、样式重构"场景下只引它的 CSS + icon 字体即可（纯静态 HTML 用官方类名），不必引入 Vue 运行时——用户明确选了这个方向（"导入官方CSS+图标，页面套对齐，逻辑不动"）。