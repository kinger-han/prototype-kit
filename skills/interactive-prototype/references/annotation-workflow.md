# Prototype Annotation System

PC 原型标注功能，支持双模式（编辑模式 + 分享模式）。

## ⚠️ 修改标注的正确流程（必须遵守）

**核心原则：只修改 pages/*.html 源文件，用 build.py 重新构建 dist。**

正确流程：
1. 修改 pages/*.html（加 data-anno 属性、修改页面内容）
2. 修改 annotations.yaml（标注数据，V4 极简格式）
3. 运行 `build.py pc --project-path="." --with-annotations` 重新构建
4. 在浏览器中验证

**绝对不要**：
- ❌ 直接在 dist 文件上用 str.replace 插入大段 HTML → 破坏标签嵌套 → 页面空白
- ❌ 从备份文件恢复 dist → 丢失之前的修改 → data-anno 格式不匹配
- ❌ 在 dist 文件上同时修改多个位置 → 引入难以追踪的 bug

**备份文件不可靠**：备份是旧版本，每次恢复会丢失所有之前的修改。正确做法：从 pages 源文件重新构建。

## File Structure

```
prototype-kit/                          # 工具包
├── annotate_server.py                  # 本地标注服务脚本
├── build.py                            # [改] 新增 --with-annotations 参数
└── src/assets/
    ├── annotation.css                  # 角标/浮窗/工具栏样式
    └── annotation.js                   # 渲染引擎 + 编辑保存逻辑

项目目录/
├── annotate.bat                        # 双击启动标注服务
└── prototype/
    ├── pages/*.html                    # [改] 加 data-anno 属性（页面级元素）
    ├── annotations/
    │   ├── annotations.yaml        # 标注数据（V4 极简格式）
    │   └── backup/                     # 自动备份（保存时生成）
    └── dist/
        ├── xxx-pc-原型.html             # 正常版（dist层元素如弹窗需在此加 data-anno）
        └── xxx-pc-标注版.html           # [新增] 带标注版本
```

## 文件连接方式（File System Access API）

annotation.js 通过浏览器 File System Access API 直接读写标注文件，无需启动本地服务。

### 三种连接状态

| 状态 | 触发条件 | UI 表现 |
|------|----------|---------| 
| 已连接 | IndexedDB 有句柄且权限 granted | [已连接 ✓] + 保存/编辑模式按钮 |
| 需恢复权限 | 有句柄但权限 prompt | [⚠ 恢复访问权限] 按钮 |
| 首次连接 | 无记录或文件不存在 | [首次连接：选择项目根目录] 按钮 |

首次选择项目根目录后，通过相对路径 `prototype/annotations/annotations.yaml` 自动定位文件（JSON 回退）。目录句柄存入 IndexedDB（数据库名 `protokit-annotations`，表名 `directory-handles`），按项目 key 区分多项目。

### 项目识别
`getProjectKey()` 优先从 `__ANNOTATIONS_SNAPSHOT__` 获取，其次 `document.title`，最后 URL hash。IndexedDB 里按此 key 存储目录句柄，不同项目互不干扰。

### 编辑模式
工具栏「编辑模式」按钮切换：
- 开启后 tooltip 内出现「编辑」按钮
- 编辑后 1.5 秒自动保存到文件
- 切换页面时标注自动刷新

### 权限持久化说明
- `queryPermission` 不需要用户手势，页面 load 时静默调用
- `requestPermission` 必须由用户点击触发（浏览器安全机制）
- 选完一次后权限通常保持 granted，直到用户手动清除浏览器权限

### 浏览器兼容性降级
如果 `window.showDirectoryPicker` 不存在：
- 工具栏显示"当前浏览器不支持自动读写"
- 保留「下载标注 JSON」按钮作为兜底

## 双模式分享

| 模式 | 用途 | 特点 |
|------|------|------|
| 在线模式 | 自己审阅标注 | File System Access API 实时读写 |
| 分享模式 | 发给别人看 | 双击 `xxx-标注版.html`，标注快照内嵌，只读 |

## Build Commands

```bash
# 正常构建（不受影响）
python build.py pc --project-path="<项目>"

# 生成标注版（额外产出 xxx-标注版.html）
python build.py pc --project-path="<项目>" --with-annotations

# V3：按 scope 过滤标注（只打包 confirmed + 匹配 scope 的）
python build.py pc --project-path="<项目>" --with-annotations --scope v1

# V3：输出标注审核清单（不构建，只分析 annotations.yaml）
python build.py --review --project-path="<项目>"
```

### ✅ 标注版构建的 dist 补丁流程（已废弃 2026-07-31，共享弹窗容器替代）

~~`--with-annotations` 会从 shell 模板 + pages 重新构建（不复用已有 dist），所以 dist 层修改（弹窗、自定义 CSS、问候语、data-anno）会被覆盖。正确流程：1. 修改 pages 源文件 → 2. build.py pc 构建 dist → 3. 重新打 dist 补丁（_patch_dist.py）→ 4. 再跑 --with-annotations → 5. 再次打补丁到标注版 → 6. 浏览器验证~~

**新机制（2026-07-31 起）**：弹窗 HTML 迁入 `pages/_shared.html` 后，弹窗及弹窗级 `data-anno` 随构建自动注入普通版和标注版，**不再需要任何 dist 补丁**。流程简化为：
1. 修改 pages 源文件（含 `_shared.html` 弹窗）
2. `build.py pc --with-annotations`（普通版 + 标注版同时生成，弹窗标注已包含）
3. 浏览器验证两个版本

### ⚠️（已废弃）dist 补丁脚本必须存项目目录，禁止存 temp 目录

~~- `C:\Users\hpy\AppData\Local\Temp\` 下的脚本每次会话清理后丢失
- 正确位置：`prototype/_patch_dist.py`（项目目录内，.gitignore 排除）
- 首次创建后，后续每次 build 后只需 `python prototype/_patch_dist.py` 一条命令恢复
- 如果脚本丢了，只能手动重写所有 dist 替换——代价很高
- 同理，annotation 版本的补丁脚本存 `prototype/_patch_ann.py`~~

共享弹窗容器机制上线后该机制废弃，以上仅存历史参考。

标注版在构建完成后注入 annotation 层：
1. `</head>` 前 → `<style>` 包裹的 annotation.css
2. `</body>` 前 → 数据快照 `<script>` + annotation.js `<script>`

> ⚠️ **禁止在 shell 模板中加占位符**：之前用 `<!-- ANNOTATION_INJECT_HEAD/BODY -->` 占位符的方案已被废弃。占位符会破坏 build.py 的 `</script>\\n</body>` 替换模式，导致路由代码和页面组件脚本静默丢失，所有 JS 功能（页面切换、按钮点击）全部失效。

> ⚠️ **禁止直接在已有 dist 文件上注入标注**：必须通过 `build.py --with-annotations` 从 pages 源文件重新构建。直接在已有 dist 上注入会丢失 data-anno 属性（因为 dist 是之前构建的产物，当时 pages 可能还没有 data-anno），导致角标全部消失。诊断命令：`grep -c "data-anno" xxx-标注版.html`

### annotations.yaml 结构（V4 极简格式，当前标准）

> V3 结构化格式已废弃。2026-07-22 全部 64 条标注已重构为 V4 并迁移至 YAML。

```yaml
version: "1.0"
items:
  kb-01:
    type: button
    title: 新增问答
    content: |
      ### 功能
      打开新增问答弹窗，创建一条 FAQ 知识。

      ### 交互与规则
      1. 点击后打开新增问答弹窗，标题为「新增问答」
      2. 弹窗组件与编辑复用（参见 kb-form）
```

每条标注只有 3 个字段：`type`、`title`、`content`。content 使用 YAML `|` 多行块标量。

## 标注内容格式（V4 极简自然语言）

**V4 是当前标准格式**。所有新标注必须用 V4 极简格式（`type` + `title` + `content`）。

详细规范、8 种 type 的 content 编写模板 → 见 `annotation-system` skill 的 SKILL.md。

**存储格式**：YAML（`annotations.yaml`），content 字段用 `|` 块标量确保多行纯文本。build.py 同时兼容 JSON 回退。

**旧格式兼容**：annotation.js 检测 `anno.spec` 存在则用 `renderSpec()` 结构化渲染，否则回退 `renderMarkdown(anno.content)`。V4 只有 content，走 Markdown 渲染路径。

**标注内容来源**：页面 HTML/JS 代码分析（特别是 `init_xxx()` 函数和 `renderXxx()` 函数）+ 用户确认的业务规则。遇到无法从代码判断的业务背景，集中列出「待确认清单」一次性问用户。

## 修改源文件前备份

改 pages/*.html、dist 产物前，在同目录备份：
```
cp <原文件> <原文件>.bak.<原因>.YYYYMMDD
```
用户手动删除备份。不要怕备份文件占空间。

## 编号规则

### 基础规则
**每个页面独立编号，从 `01` 开始**。不同页面的编号互不影响（用户管理有01，场馆管理也有01）。

### Key 命名规则
annotations.json 的 key 需要加页面前缀避免跨页面冲突：
- 用户管理：`user-01`, `user-02`, `user-03`, `user-04`
- 场馆管理：`venue-01`, `venue-02`, ...
- 未命中统计：`miss-01`, `miss-02`, ...
- 会话记录：`log-01`, `log-02`, ...
- 知识库管理：`kb-01`, `kb-02`, ...（与其他页面格式一致，用小写 kb-XX）

### Title 命名规则
title 只写功能模块名称，**不带页面前缀**（因为 key 已经区分了页面）：
- `user-01` → title: "筛选模块"（不是"用户管理-筛选模块"）
- `venue-01` → title: "新增场馆"
- `miss-01` → title: "筛选模块"

同一功能模块在不同页面时，title 可以相同（key 不同即可区分）。

### Badge 显示规则
annotation.js 用 `id.split('-').pop()` 提取序号部分，badge 只显示数字：
- `user-01` → badge 显示 "01"
- `venue-01` → badge 显示 "01"
- hover 时 tooltip 显示完整 title（如"筛选模块"）

### TAB 页编号规则
当一个页面内有 TAB 切换时，**所有 TAB 的标注共享同一组连续编号**：
1. 第一个 TAB 的元素从 01 开始
2. 第二个 TAB 的元素接续编号
3. 切换 TAB 时，只显示当前 TAB 的标注，隐藏其他 TAB 的标注
4. 编号顺序：**从上到下、从左到右**

示例（场馆管理页面）：
```
场馆列表TAB: venue-01(新增场馆)、venue-02(筛选)、venue-03(列表)、venue-04(导出)、venue-05(操作列)
公共知识库TAB: venue-06(列表)、venue-07(新增按钮)、venue-08(操作列)
```

### 实现要点
- 标注 JSON 中 TAB 内容加 `"tab": "tab-id"` 字段
- annotation.js 用 `el.offsetParent === null` 跳过隐藏元素（包括 hidden TAB 内的元素）
- 切换 TAB 的 JS 函数必须分发 `tab-changed` 自定义事件
- annotation.js 监听 `tab-changed` 事件后重新渲染角标

## Pitfalls

### 核心原则
1. **标注内容必须详细**：每条标注应包含三部分——功能说明（做什么）、交互规则（怎么用）、字段说明（有哪些字段）。一句话描述会让标注失去参考价值。内容来源：knowledge.json 业务规则 + 页面 HTML/JS 代码分析 + 用户确认
2. **不要擅自简化或重写标注内容**：用户明确要求"以后这种需求需要我先确认，不要动我没有让你修改的内容"。更新编号/格式时，必须从备份文件恢复原始 content，不能用自己的理解重写
3. **修改标注编号/格式时不要动内容**：只改 key 和编号，不重写 content 字段。标注内容来自用户确认，AI 不得自行简化
4. **修改任何内容前先确认**：用户明确要求"以后这种需求需要我先确认，不要动我没有让你修改的内容"。即使是看似无害的简化或优化，也必须先征求用户同意。这条规则适用于所有修改，不限于标注

### 构建与注入
4. **标注版必须从 pages 源文件重新构建**：不能直接在已有 dist 上注入 annotation。如果直接拿已有 dist 文件注入，data-anno 属性可能已丢失，角标全部消失。诊断：`grep -c "data-anno" xxx-标注版.html`，数量应≈annotations.json条目数
5. **不要依赖备份文件做迭代**：备份文件是旧版本，每次从备份恢复会丢失之前的修改（如弹窗、知识库字段等）。正确做法：从 pages 源文件重新构建 dist，再在新 dist 上加标注
6. **禁止直接修改dist文件的HTML结构**：用str.replace插入大段HTML时，经常破坏标签嵌套（如丢失 layout/sidebar 类）。dist文件只做轻量替换（data-anno属性更新、快照数据更新），不做结构性修改
7. **更新标注版时不要用 regex 替换快照**：`re.sub()` 替换 `__ANNOTATIONS_SNAPSHOT__` 中的 JSON 时，如果 JSON 包含换行或特殊字符，regex 会匹配失败或破坏 HTML 结构。正确做法：用字符串 `find()` + 切片替换

### data-anno 规范
8. **data-anno 必须加在可见交互元素上，不是弹窗/overlay**：导出按钮的 data-anno 加在了导出弹窗（modal-overlay）上而非工具栏按钮上，导致角标不显示。正确做法：data-anno 加在用户直接点击的按钮/元素上
9. **data-anno 不能重复添加在同一个标注的不同元素上**：同一个标注 ID（如 user-03）不能既加在按钮又加在 modal-overlay 上，会导致重复 badge 和计数错误
10. **dist 文件中的弹窗需要单独添加 data-anno**：弹窗（modal-overlay）在 shell 模板中，不在 pages 文件中。生成标注版时需手动给 dist 中的弹窗加 data-anno（如 `id="userDetailModal" data-anno="user-detail"`）

### data-anno 键名必须精确匹配 annotations.yaml
11. **data-anno 值必须与 annotations.yaml 的 key 完全一致**（大小写敏感）：
    - pages 源文件中用 `data-anno="kb-01"` → annotations.yaml 中必须是 `kb-01`（不是 `KB-01`）
    - pages 源文件中用 `data-anno="log-export"` → annotations.yaml 中必须是 `log-export`（不是 `log-export-btn`）
    - **每次新增 data-anno 时，先 grep annotations.yaml 确认 key 格式**
    - 典型错误：用了 `KB-01` 但 annotations.yaml 是 `kb-01`，导致角标不显示

### 表格列数必须一致
12. **表头列数必须等于 render 函数输出的列数**：添加新列时，表头和 render 函数必须同步修改。诊断：数 `<th>` 数量和 `<td>` 数量是否相等。典型案例：表头加了"知识库"列但 renderVenueTable 没加，导致数据错位

### 标注引擎
11. **updateListBtnCount 必须只计算可见 badge**：原始代码用 `Object.keys(badgeElements).length`，但 badgeElements 包含所有已创建的 badge（含 display:none 的弹窗 badge）。必须遍历检查 `b.style.display !== 'none'` 才计入 current 数量
12. **badge 定位必须限制在 viewport 内**：positionBadge 用 `rect.right - 12` 定位在元素右上角，但当元素很宽时（如筛选栏），badge 会超出屏幕。修复：`if (leftPos > window.scrollX + vw - 30) leftPos = window.scrollX + vw - 30;`
13. **TAB 切换时标注不刷新**：switchVenueTab 等 TAB 切换函数必须分发 `tab-changed` 自定义事件，annotation.js 监听后重新渲染。检查：①TAB 函数是否 dispatch 了 tab-changed ②annotation.js 是否监听了 tab-changed
14. **offsetParent 检查比 proto-page 检查更通用**：annotation.js 用 `el.offsetParent === null` 跳过隐藏元素，比 `el.closest('.proto-page').style.display === 'none'` 更通用——前者能同时处理页面隐藏和 TAB 隐藏

### 工作流
15. **修改原型后必须主动推送 GitHub**：用户明确要求修改后同步到 GitHub 方便回滚，不要等用户提醒。推送用 HTTPS+token（Windows SSH 常失败），推送后 remote 改回 SSH
16. **验证不能只查字符串存在**：语法检查（花括号/圆括号平衡）+ 功能检查（工具栏存在、角标数量正确、切换页面角标跟随）+ 边界检查（隐藏时弹窗关闭、越界时角标隐藏）。语法通过≠功能正确
17. **每次修改dist后必须验证**：修改dist文件后，打开浏览器检查：①页面是否正常加载 ②工具栏是否显示 ③角标数量是否正确 ④切换页面角标是否跟随。任何一步失败都要回滚
18. **标注格式：备注用 note 字段**：「一期不做」「二期实现」等信息放在 annotations.json 的 `note` 字段，不要写进 `title` 或 `content` 的正文里
