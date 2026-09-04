---
name: interactive-prototype
description: "从功能清单/截图/PRD 生成可交互 HTML 原型（PC/移动）。含 build.py 组件化构建规范、_shared 弹窗机制、Layout Intelligence 单 HTML 流程、高频陷阱。"
trigger:
  - "原型/prototype + HTML"
  - "可交互原型"
  - "功能清单 → 原型"
  - "PC端后台原型"
  - "给功能清单画原型"
  - "模拟手机界面"
  - "企业后台页面原型"
  - "prototype-kit"
  - "组件化原型"
  - "build.py 原型"
  - "单HTML原型"
  - "Layout Intelligence"
  - "ui-system"
---

从功能清单/截图/PRD 生成可交互 HTML 原型。两种模式：
- **单文件模式**：全部代码一个 HTML，一次性小原型 → 走「单 HTML 生成流程」（第 2 章）
- **组件化模式（推荐）**：多文件 + build.py 拼装，适合迭代频繁 → 走「组件化构建流程」（第 3 章）

> **AI Operating Protocol**：本文件是操作协议，不是 UI System 文档副本。
> 所有视觉/布局/组件知识在 `ui-system/`（Source of Truth），本文件只描述：**何时读什么、判断什么、调用什么、按什么顺序产出**。
> 引用一律写路径，不摘录 ui-system 内容。

参考文件（按需加载，不预读）：
- **`ui-system/` — UI 设计系统（唯一视觉规范）**：tokens.css（Design Tokens）、rules.md（UI Constitution）、registry.json（资产注册表）、templates/（6 个页面模板 JSON）、themes/、devices/、content/、components/（14 个）、icons/registry.json、charts/。**单 HTML 原型视觉必读**
- `ui-system/layout/` — Layout Intelligence 层：layout-tokens.css / layout.css（原语类）、planner.md（决策流程）、critic.md（检查+Score）、policies/（决策规则）、skeletons/（布局模式）、benchmark.md
- `references/layout-intelligence.md` — Layout Intelligence 架构详解（四层关系、policy 决策表、CSS 陷阱修复、Planner MVP）
- `references/layout-intelligence-pitfalls.md` — 渲染工具链实测陷阱（Phase 4/5）
- `references/e2e-validation-2026-08-11.md` — 单 HTML Pipeline E2E 验证记录（ColdChain 测试任务：P1-A Fix 闭环 Runtime 缺陷盲区、P1-B verify-output 契约冲突、P2×2；含 srcdoc 模拟器 + md5 基线技巧）
- `references/pitfalls-complete.md` — 组件化旧陷阱全量库（build.py 项目时代，历史积累）；`references/layout-intelligence-pitfalls.md` — 2026-08-11 Layout/CSS 新陷阱库（渲染工具链实测）。第 5 章陷阱章节是两者的精简执行子集
- `references/annotation-workflow.md` — 标注系统（V4 规范，标注任务必读）
- `references/github-pages-publish.md` — GitHub Pages 发布规程（⚠️ 预览同步必须等用户明确说"同步预览"）
- `references/ui-system-lucide-migration.md` — 组件化项目按 ui-system 落地 Lucide 图标
- `references/mobile-spec.md` — 移动端规范；`references/taizhang-page-style.md` — 台账/列表样式
- `references/mobile-custom-shell.md` — **自定义移动端 shell 完整实现**：全面屏居中、无刘海、仿真状态栏 SVG、真实机型比例、去页码导航（2026-09-01 党代会项目确立）
- `references/patch-workflow.md` — 增量修改方法论；`references/dead-code-audit.md` — 死代码审计
- `references/batch-operations-pattern.md` — **列表页批量操作完整模式**（复选框列/选中操作栏/跨页全选/确认弹窗跳过统计/批量按钮类型敏感判断）；列表页加批量操作必读
- `references/topic-mgmt-v2-notes.md` — 主题管理V2原型结构速查（关键函数落点、V4.20样式约定、批量文本替换做法）
- `references/antd5-primary-override.md` — 全站 AntD5 主色覆盖；`references/detail-edit-page-layout.md` — 详情/编辑页布局
- `references/visual-reference.md` — 视觉风格参考（Ant Design Pro 整站 demo 源、配色偏好 #1677ff/#e6f4ff）；**视觉风格类改动先给参考再动手**
- `references/element-ui-legacy-doc-fetch.md` — Element UI 老系统规范核查/UI交接：官网超时的 GitHub raw 抓取法、Dialog/Tree/Cascader/Drawer 能力速查、判断哪些页面可跳过UI设计的复用框架
- `references/element-legacy-style-rebuild.md` — 老版 Element UI 样式重构**执行**规程：独立副本隔离原项目、unpkg 下载官方 CSS+图标字体、build.py shell 不被覆盖机理、复用官方类禁自造、先做最复杂样例页再铺开、需用户拍板的专项（老版无拖拽等）
- `references/ai-design-prompt-template.md` — 用户嫌界面丑、要求写"给 AI 设计工具的设计图提示词"时的六段式模板（场景/入口/字段/交互/风格/输出规格）
- `references/page-js-debugging.md` / `references/js-interaction-traps.md` — JS 排查与交互陷阱
- `references/prd-gap-analysis.md` — PRD 差距分析

---

## 环境配置（本机）

- 构建 Python：`D:/HermesData/hermes-agent/venv/Scripts/python.exe`（不要用 py/系统 Python）
- 工具包：`D:\hpy\文档\ObsidianVault\06-资源\模板\prototype-kit\`
- Node.js 用于 `node --check` 语法检查

---

## 1. 核心原则（两种模式通用）

### 0. Mode Router（先路由，再干活）
```
Requirement
   ↓
Mode Router
   ├─ 一次性/单页/验证 Layout → 单 HTML Pipeline（第 2 章）
   ├─ 持续迭代/多页/业务项目 → 组件化 Pipeline（第 3 章）
   └─ 纯视觉美感探索（"优化页面设计/怎么好看"，无现成原型）→ 不建 HTML，走 skill:ui-design-image-workflow 生图探索路径，让生图模型自行设计（用户嫌 Hermes 自研 HTML 视觉丑，要求原始需求直接交生图模型，不加 Hermes 判断）
```
- **进入某一模式后，不得中途混用另一模式的规则**（组件化模式的 pages/dist 规则不适用于单 HTML；单 HTML 的 ui-system 流程不适用于组件化日常修改）
- 3 次以上修改 / 要迭代 → 默认组件化；做完就扔 → 单 HTML；不确定 → 默认组件化
- **⚠️ 用户说"不要用 shell 模板 / 用已有产物样式" ≠ "退出组件化改单文件"（党代会项目）**：移动端"不用 shell 模板/评审布局"指**换壳形态**（全面屏居中壳），不是换构建模式。误判为单文件 → 整轮 V2 单文件作废，用户下轮要求"移动端和 PC 一样分页、脚本拼合"，全部重拆。判据：明确说"分页/拼合/组件"才算模式变更；涉及 shell/模板/页面结构的表达一律出确认卡

### 修改原型的正确流程（模式限定，必须遵守）
- **组件化模式**：只改 `pages/*.html` 源文件（弹窗结构改 `pages/_shared.html`，弹窗业务 JS 留在对应页面）→ **build.py 重建 dist**（禁止直接改 dist，历史上反复导致页面损坏）→ 浏览器验证
- **单 HTML 模式**：只修改当前任务生成的 HTML / 工作目录产物，**不套用 pages/dist 规则**
- **提交**：修改完成后检查 `git diff` 确认改动范围；**是否 commit / push 按用户要求或项目既有流程执行，不默认自动 push**

### 只改用户明确要求的内容
- 没提到的逻辑/字段/交互不擅动；影响其他页面先说明让用户决策
- 不简化/重写用户已确认内容；**"同步/对齐"类需求先确认方向**（以哪边为准、几级层级），不自行假设

### 模板铁律（组件化模式）
- Shell 由构建系统注入，AI 一般不改；业务内容三出口：proto-config menu → 菜单、pages/*.html → 页面、_shared.html → 共享弹窗
- 禁止在 pages/ 仿写侧边栏/顶栏、写全局 style、操作 #main-content 以外 DOM；框架层变更先授权

### 项目结构（组件化模式）
```
项目目录/
├── build.bat / README.md / docs/(只读)
└── prototype/
    ├── proto-config.json
    ├── pages/     # AI 读写这里（含 _shared.html）
    └── dist/      # 构建产物（只读）
```
- 禁止 dist/、base.css/base.js 副本；每次修改只读写 pages/ 下 1~2 个组件

### 必须先出方案再执行
Shell 模板、build.py 引擎、菜单分组、路由、3+ 页同时改动、需求模糊 → 先出方案等确认。

**视觉风格类改动（配色/高亮/整体观感）先给在线参考 demo 再动手**：参考源与本机配色偏好见 `references/visual-reference.md`（本机用户偏好，非通用协议；通用项目按该文件引导用户确认方向）

**特殊例外：自定义菜单（需前置授权）**：确实需要完全自定义菜单/面包屑时，先说明影响获取授权，才可在 init_xxx() 中用 DOM 重写侧边栏/面包屑。

### 产物命名
`{项目名}-{系统模板}-原型.html`

### README 维护
新增/删除页面、重大交互、构建完成后主动更新 README.md。

### 单文件 vs 组件化
做完就扔 → 单文件；要迭代 → 组件化（3 次以上修改必须）；不确定 → 默认组件化。

### 原型交互模拟模式
点击立即 toast → setTimeout 1-2s → 改底层数据 + 重渲染 → 完成 toast。不要只弹 toast 不更新数据。

---

## 2. 单 HTML 生成流程（Layout Intelligence Pipeline）

> 适用：一次性小原型（单文件模式）。**必读 ui-system/ 全部相关文件，按流程执行，禁止跳过 Planner 直接写 HTML。**

### 2.1 总流程（12 步，每步的读/判/调/入/出/下一）

```
Step 1  初始化 + Requirement → Page Model
        读 ui-system/README.md + rules.md + registry.json（仅三件套）
        → 产出 {page_type, device, theme, media?, metadata.size, title.length, density_intent}
Step 2  Device + Theme：读 devices/pc.json|mobile.json + themes/default/theme.json
Step 3  Template：读 templates/<page_type>.json（regions/variants）
Step 4  Content Model：读 content/content-schema.json → 用真实业务数据填 regions
Step 5  Layout Planner：读 layout/planner.md + policies/*.json → 产出 Layout Directive
Step 6  Component：按 registry.json + template.content_source → 读对应 components/*.html
Step 7  Renderer：组装单 HTML（内联 tokens/layout/components/recipes）
Step 8  Screenshot：打开 HTML → 截图（真实 viewport；Mobile 375/390/430）
Step 9  Critic：读 layout/critic.md → 18 类检查（DOM 数值证据）+ Score
Step 10 Fix → Re-render：先判根因归属（Layer 判断）；仅可修改层进入 Fix ≤2 轮；Runtime/Architecture Defect → STOP & REPORT
Step 11 交付：HTML 路径 + Machine Score + Human Review Checklist
Step 12 记录：按 work-tracking 规范写工作日志（有产出才写）
```

### 2.2 每步操作协议

**Step 1 初始化 + Requirement → Page Model**
- 读取：**仅** `ui-system/README.md` + `ui-system/rules.md` + `ui-system/registry.json`（三件套，不预读其他文件）+ 用户需求
- 判断：本次任务属于哪种模式（单 HTML / 组件化）；页面类型（dashboard/list/detail/form/media-detail/media-editor）、设备、媒体比例、数据密度
- 输入：用户原始需求
- 输出：Page Model（半结构化 JSON：page_type / device / theme / media(ratio,available) / metadata.size / title.length / density_intent）
- 下一步：Step 2
- ⚠️ **读取纪律**：后续文件严格按 Pipeline 步骤按需读取（Step 2 读 devices/themes、Step 3 读 template…），**禁止一次性加载整个 ui-system**
- 澄清规则：需求模糊时用最小澄清问题（页面类型/端/数据），不反复追问

**Step 2 Device + Theme 选择**
- 读取：`devices/pc.json` 或 `devices/mobile.json`、`themes/default/theme.json`
- 判断：端壳（PC=sidebar+content+inspector；Mobile=header+content+bottom-action）、视觉语言（default）
- **Mobile ≠ PC 缩小版**：Mobile 用不同 Layout Pattern（stack + card-mode），不是 PC 页面缩窄
- 输出：device_id + theme_id
- 下一步：Step 3

**Step 3 Template 选择**
- 读取：`templates/<page_type>.json`（regions / variants）
- 判断：按 page_type 匹配模板；缺省时查 `registry.json` templates 段
- 输出：template JSON（regions 列表 + 当前 device 的 variants）
- 下一步：Step 4

**Step 4 Content Model 填充**
- 读取：`content/content-schema.json`（15 种 region 类型契约）、参考 `content/fixtures/*.json`
- 判断：模板 regions 需要哪些内容；**真实业务数据照实填充**（长标题/空字段/多标签不清洗）
- **Content Model 与 Presentation 解耦**：不为了 Mobile 改数据模型；同一数据 PC/Mobile 共享，只改呈现
- 输出：Content Model 实例（{regions: {id: {type, data}}}）
- 下一步：Step 5

**Step 5 Layout Planner（决策）**
- 读取：`layout/planner.md`、`layout/policies/*.json`（如 media-ratio-policy）
- 判断：aspect_ratio → variant、metadata.size → scroll、title.length → split 档、density
- **AI 决定意图，系统决定几何**：AI 只选意图字段，不写裸几何（禁 width:65%、禁任意 px、禁 absolute 布局）
- 输出：Layout Directive（JSON：pattern / variant / split 档 / preview_class / density / metadata_scroll）
- 下一步：Step 6

**Step 6 Component 选择**
- 读取：`registry.json` components 段 → `components/<name>.html`；`layout/layout.css` 原语类
- 判断：region 需要哪些组件（按 content_source）；布局原语类（layout-split-* / layout-media-* / layout-panel）
- **禁止 AI 临场重新设计 UI**：只选择与组合，不自由设计（新视觉原子一律禁止）
- 输出：组件选择清单 + 布局原语类清单
- 下一步：Step 7

**Step 7 Renderer（组装）**
- 调用：当前 Runtime——`content-benchmark.py` 的 `build_page(page_type, fixture, device, grid_cols?, out_name?)`（在 `D:/hpy/桌面/日常临时会话/layout-benchmark/`，非 Skill 目录）；或手动按「单 HTML 组装清单」组装
- 输入：Page Model + Directive + Content + components + tokens + layout css + charts recipes
- 输出：单 HTML 文件
- 组装清单：① `<style>` 内联 tokens.css → layout-tokens.css → layout.css → 组件样式 ② 页面结构 HTML（ui-* 类）③ Lucide CDN（版本见 lucide-migration ref）+ createIcons ④ 图表 ECharts CDN（版本见 charts/registry.json _meta）+ Recipe 函数 ⑤ 业务 JS
- 下一步：Step 8
- ⚠️ **Future/Planned（当前不存在，勿假装可用）**：正式 `render.py` / `benchmark.py` 尚未落地；当前真实 Runtime 为 `content-benchmark.py`（Renderer + Benchmark 合一）与 `layout-planner.py`（Planner 验证），两者**未合并**，按现状使用

**Step 8 Screenshot**
- 调用：Hermes browser 工具（browser_navigate 打开 file:// 路径 → browser_vision 截图确认）
- 判断：PC 视口默认；Mobile 需 375/390/430 三档（用 iframe 模拟器，`window.resizeTo` 无效）
- 输出：截图 + 视觉观察
- 下一步：Step 9

**Step 9 Critic**
- 读取：`layout/critic.md`（10 基础 + 8 content-aware = 18 类检查）
- 调用：browser_console + `getBoundingClientRect()` 取**数值证据**（region 占比、media ratio、gap、溢出、密度）
- 判断：Layout Score（6 维加权）≥ 0.8 通过；视觉截图只作确认，两者矛盾以 DOM 实测为准
- 输出：Issues[]（每项含 detect + evidence + recommendation）+ Score
- 下一步：Score ≥ 0.8 → Step 11；< 0.8 → Step 10

**Step 10 Fix → Re-render（先判根因归属，再决定是否 Fix）**
- **Fix 前必须先判断每个 Issue 的根因归属**（Layer 判断），不能无条件进入 Fix：
  1. 读取 Step 9 Issues[]
  2. 逐项判断根因属于哪一层：Directive / Content / renderer 参数（**可修改层**）还是 Runtime / Template / Theme / Component / Device / 架构冻结层（**冻结层**）
  3. 只有属于**当前任务允许修改层**的问题才进入自动 Fix
- **根因属于冻结层（Runtime / Template / Theme / Component / Device / Architecture Freeze）**：
  - 标记为 **Runtime / Architecture Defect**
  - **禁止**通过修改 Content（如缩短标题）/ Directive / 渲染参数来规避真实缺陷
  - **禁止**修改冻结层（Runtime / Template / Theme / Component / ui-system / content-schema / layout/*）
  - **停止当前自动 Fix**，输出 defect report（Issue + Evidence + Root Cause + 所属层 + 建议修复层）
  - 下一步：→ Step 11（按缺陷状态交付，注明 Score 未达阈值原因）或直接向用户报告
- **根因属于可修改层（Directive / Content / renderer 参数）**：
  - 按 issue type 路由修正动作（见下）
  - 调用：重跑 Step 7（Renderer）→ Step 8 → Step 9 复检
  - 最多 2 轮自动修正；2 轮后仍 < 0.8 → **停止并报告问题，不无限循环**
- 常见路由：
  - ratio mismatch → 改 preview_class / max-height
  - overfilled → 加 panel-scroll / 降 density
  - underfilled → 顶部对齐（留白正常，禁止拉伸补装饰）
  - action-overflow → 折叠更多（renderer 内建）
  - long-title → 允许换行 / split 升一档（**仅当根因在 Directive 层时**，如 PC split 档位；Mobile stack 无 split 时不是 Directive 可修项）
  - layout-shift → 图表容器固定 min-height
- **禁止**：为了 Score ≥ 0.8 人为绕过问题（删内容、改阈值、隐藏区域）；不把 Runtime defect 变成 Skill 的 workaround
- 下一步：复检通过 → Step 11；失败 → 报告

**Step 11 交付**
- 输出：最终 HTML 路径 + Machine Score + Human Review Checklist（同产品感/AI 生成感/留白/重心/层级/可交付性）
- **真实业务验证优先于 Benchmark**：有真实项目数据时用真实数据验证，不用演示 fixtures 充当主验证
- 下一步：Step 12

**Step 12 记录**
- 调用：work-tracking 规范（02-日记/周文件，有产出才写）

### 2.3 Layout Intelligence 架构（职责边界）

> 完整详解：`references/layout-intelligence.md`。以下是冻结的职责边界（Architecture Freeze 2026-08-11）。
> **具体布局数值（split 档位 / 媒体比例映射 / max-height / 密度档）不在本文件保存**，读取 `ui-system/layout/planner.md` + `layout/policies/*.json`，按其规则生成 Directive。

**五层严格分工**：
| 层 | 决定什么 | 不决定什么 |
|---|---|---|
| Template | 页面结构（regions/variants） | 视觉、空间分配内部 |
| Layout Pattern | 空间骨架（split/grid/stack/master-detail/preview-inspector/sidebar-content） | 页面业务结构 |
| Theme | 视觉语言（颜色/字体/间距/圆角/阴影） | 页面结构、布局、业务 |
| Component | 具体 UI 元素 | 页面组织 |
| Device | 端适配（PC shell / Mobile shell + 布局策略） | 视觉、业务 |

**四层关系**（生成时解析顺序）：
```
Device + Theme（选中）
  → Page Template（regions/variants）
  → Layout Pattern（template.variants[*].layout_pattern）
  → Layout Policy（aspect-ratio/metadata → variant 精化）
  → Layout Directive（split 档/尺寸/对齐/滚动）
  → Component（填充区域）→ Renderer → Critic（≥0.8）
```

**铁律（违反即返工）**：
1. AI 决定意图（page_type/device/media/priority/density），系统决定几何（split 档/尺寸/对齐/滚动）
2. AI 不写裸几何：禁 width:65%、禁任意 px 间距、禁 position:absolute 布局、禁媒体查询
3. 生成后必须跑 Critic 自检（≥0.8 通过；<0.8 按 recommendation 修正 ≤2 轮）
4. 同一 Template 可切 Theme（结构零改动）；同一 Template 有 PC/Mobile 不同 Variant；同一 Layout Pattern 可被多 Template 复用
5. media-ratio-policy 已通用化（16:9/9:16/1:1 → split 档映射在 policy 文件），不写死在页面代码

**扩展规则（Skill 不应随意修改）**：
- 新增 Template：新建 `templates/<name>.json` + registry 登记 → **Skill 无需修改**（除非引入新 region type → content-schema 补充 + renderer 加分支）
- 新增 Theme 02/03：新建 `themes/<id>/theme.json` → **Skill/System 零改动**
- 新增 Device：新建 `devices/<id>.json` + template variants 加条目 → 视 presentation 而定
- **禁止为单个页面改核心 Template/Theme/Component**；发现架构缺口先报告（问题→影响→严重度→方案），不擅自大改

### 2.4 Mobile Card Mode（Phase 5 冻结）
- 触发：模板 mobile variant `region_rules.table.card_mode=true`（list.json 已声明）
- 机制：`Content Model → Table → Device Policy → PC: table / Mobile: card`，**同一数据模型只改 presentation**
- Card 结构：主字段标题（列须标 `type='title'`）→ ID 副信息 → 状态 Tag 右上 → ≤4 次要字段降级网格 → Actions（沿用 overflow）
- CSS 在 `layout.css` 第 10 节（token 复用）；渲染在 Runtime（content-benchmark.py table 分支）
- 9 条实测陷阱见 `references/layout-intelligence-pitfalls.md`

### 2.5 单 HTML 组装清单
1. `<style>` 内联 `tokens.css` 全文（放最前）→ `layout/layout-tokens.css` 全文 → `layout/layout.css` 全文 → 各组件 `<style>` 块（去重）
2. 页面结构 HTML（组件模板填业务内容，类名 `ui-*` 前缀）
3. Lucide CDN（版本固定，见 `references/ui-system-lucide-migration.md`）+ 页面底部 `lucide.createIcons();`
4. 图表：ECharts CDN（版本固定，见 `charts/registry.json` _meta）+ 拷贝 Recipe 函数 + `setOption`
5. 业务 JS；无构建步骤，直接打开

### 2.5.1 单 HTML 验证链（**不调用 verify-output.py**）
> `scripts/verify-output.py` 是 **build.py 组件化 Pipeline** 的验证工具（见 3.8），**单 HTML Pipeline 不调用**——它检查的 `proto-page` / 侧边栏 / 无外部 JS 依赖均属组件化 Shell 契约，而单 HTML 按 2.5 组装清单允许 Lucide/ECharts CDN 且使用 `layout-page`/`ui-*` 类名，运行该脚本必然误报（E2E 2026-08-11 实测 3 项 ❌）。
> 单 HTML 的 CDN 依赖按 2.5 组装清单正常保留，**不要为了适配 verify-output.py 而删除 CDN**。

单 HTML 使用自己的验证链（对应 Step 7→8→9）：
```
standalone HTML
→ HTML structure / self-contained checks（`<html>`闭合、`<style>`/`<script>`内联、JS 语法 node --check）
→ Browser render（真实 viewport：PC 默认；Mobile 375/390/430）
→ Screenshot（视觉确认）
→ DOM Critic（layout/critic.md，DOM 数值证据 + Score）
```

| 检查项 | 组件化（3.8） | 单 HTML（本小节） |
|---|---|---|
| proto-page | ✅ | 不适用 |
| sidebar / menu | ✅ | 不适用 |
| build.py contract | ✅ | 不适用 |
| no external JS | ✅（组件化契约） | 不适用（允许 CDN） |
| standalone HTML structure | 可选 | ✅ |
| JS syntax（node --check） | ✅ | ✅ |
| Browser render | ✅ | ✅ |
| DOM Critic | 按流程 | ✅ |

### 2.6 Fallback 顺序（新增结构时）
```
Page Template → 复合 Pattern（search-form 等）→ Component → 已有组件新组合 → 最后才生成缺失结构
```
- 允许新「组合」，禁止新「视觉原子」（新颜色/阴影/图标/图表风格）
- 临时结构仍必须用 tokens + icon registry + chart recipe

### 2.7 核心禁止项（详见 ui-system/rules.md）
- 禁止 Emoji 当图标、禁止文本符号（+ - >> ▼ →）模拟图标
- 禁止 gradient / glassmorphism / 大面积彩色背景 / 发光 / 夸张阴影
- 禁止现场画 SVG、禁止发明 Icon Name、禁止自定义图表视觉
- 禁止为了单个页面修改核心 Template / Theme / Component

---

## 3. 组件化构建流程（build.py）

### 3.1 proto-config.json
```json
{ "name": "智融平台", "template": "pc", "logo": "智",
  "theme": { "primaryColor": "#1890ff", "layout": "side-top" },
  "menu": [{ "group": "智能导游", "icon": "dashboard", "items": [{"id": "user-mgmt", "title": "用户管理"}] }] }
```
移动端：`"template": "mobile"` + `tabBar` 数组（替代 menu）
- **icon 必须来自 `ui-system/icons/registry.json`（Lucide 名称）**，禁止 Emoji / 自创名称（示例 `dashboard` 为 registry 真实名称，导航类场景首选）

### 3.2 页面组件格式
```html
<!-- PAGE_META: {"id": "user-mgmt", "title": "用户管理"} -->
<div class="proto-page" id="page-user-mgmt">
  <!-- 页面 DOM -->
</div>
<script>
function init_user_mgmt() { /* 渲染逻辑 */ }
</script>
```
- `init_xxx()` 必须有（xxx = 页面ID连字符转下划线），否则切页空白
- HTML 必须放 `.proto-page` div 内（外面被 build.py 静默丢弃）
- 仅首页需在 script 末尾自调用 `if (typeof protoShowPage === 'function') { protoShowPage('xxx'); }` 激活；其他页不要自调用（多处自调用互相覆盖）

### 3.3 自定义菜单渲染（proto-config.json ≠ 菜单 UI）
菜单有三种形态，动手前先 `grep -rn "renderAppSidebar\|menu-item\|proto-config" prototype/pages/*.html prototype/shell-*.html` 判定属于哪种：
1. **renderAppSidebar 自定义渲染**：有该函数 → 改它所在页（通常 02 页）的 groups 数组
2. **proto-config 驱动**（默认模板）：无 renderAppSidebar → 改 proto-config.json 的 menu
3. **⚠️ shell 硬编码菜单（smart-tour-guide 项目实测，前两种都不是）**：菜单是 `<div class="menu-item" onclick="switchPage('<标题>', this)" id="menuXxx">` 写死在 `prototype/shell-{template}.html` 的 `.sub-menu` 里，proto-config 的 menu 只是摆设（不渲染、顺序可与 shell 不同！）。此时**菜单重排=改 shell 内 menu-item 的顺序**，改 proto-config 无效白干
- **菜单改名/新增必须同步 4 处（shell 硬编码形态）**：① shell menu-item 的 onclick 标题＋显示文本 ② 页面第 1 行 `PAGE_META.title`——**build 注入 `_pageTitleToId={标题:pageId}` 路由映射，switchPage(标题) 匹配不到时页面淡默默不切换**（可在 dist 里 grep `_pageTitleToId` 验证映射）③ proto-config.json（一致性，不渲染）④ 面包屑 `<span class="current">`（写死在 shell）
- **菜单新增项 = 新建页面文件（`<div class="page">` 结构，build 自动包 `proto-page`）＋ shell menu-item＋proto-config 三处**；菜单初始 active 写死在 shell HTML
- **菜单占位项（用户要「不做页面，直接菜单」时，党代会项目「设备管理」实测）**：挂菜单项但给一个占位页提示、不做真功能。步骤：① shell `.sub-menu` 加 menu-item，onclick 用**专用函数** `switchDeviceMgmt(this)` 而非 `switchPage('设备管理', this)`——占位页没有 PAGE_META 就不会进 build 的 `_pageTitleToId` 映射，switchPage 包装后 pid 为空**静默不切页**；② shell content-area 内手写占位 `<div class="proto-page" id="page-device-mgmt" data-page-id="device-mgmt" style="display:none">`（手写占位页不进映射，protoShowPage 按 `data-page-id` 匹配，**必须手动加 data-page-id**，仅 id 不够）；③ 专用函数 = `_origSwitchPage('设备管理', el)`（复用原逻辑更新面包屑/active；`_origSwitchPage` 由 build 合并 JS 定义，点击时才调用无时序问题）+ 手动遍历 `.proto-page` 按 data-page-id 显隐。验证：真实浏览器 click → 占位页 `display:block` + 面包屑更新 + 切回其他菜单恢复正常
- 浏览器标签 `<title>` 在 shell 模板里，build.py 不覆盖；改需授权

### 3.4 共享弹窗组件（pages/_shared.html）
文件名以 `_` 开头 → 自动识别为共享组件：不进菜单/路由，内容追加到 `#main-content` 末尾，多个弹窗作兄弟节点。弹窗级 data-anno 随构建自动注入。

**JS 归属原则**：_shared.html **只放弹窗 HTML DOM**，不放业务 JS；open/close/submit 函数留在触发弹窗的业务页面组件里（构建合并为全局函数）。

**改弹窗流程**：结构变化 → 改 _shared.html；业务逻辑变化 → 改对应业务页面；重建自动同步，**不需要 patch dist**。

**新增注意**：新增 `_` 开头文件前先检查 pages/ 有无历史遗留同名文件；容器闭合标签必须在所有共享组件追加后才闭合。

### 3.5 构建命令（按实际修改范围选，不每次都全量）
```bash
PYTHON="D:/HermesData/hermes-agent/venv/Scripts/python.exe"
BUILD="D:/hpy/文档/ObsidianVault/06-资源/模板/prototype-kit/build.py"
"$PYTHON" "$BUILD" pc --project-path="<项目目录>"              # 仅 PC
"$PYTHON" "$BUILD" pc --project-path="<项目目录>" --with-annotations   # 带标注版
```
⚠️ **terminal 工具执行含中文长路径的构建命令可能触发 lifecycle_guard 崩溃**（`open: embedded null character in path`，Hermes terminal 层解析问题，与 build.py 无关；命令带 `2>&1 | tail` 管道时概率更高）。兜底：改用 execute_code 内 subprocess 运行，完全不受影响：
```python
import subprocess
cmd = [r"D:/HermesData/hermes-agent/venv/Scripts/python.exe",
       r"D:/hpy/文档/ObsidianVault/06-资源/模板/prototype-kit/build.py",
       "pc", "--project-path=D:/hpy/桌面/数熙相关文档/<项目目录>"]
r = subprocess.run(cmd, capture_output=True, text=True, timeout=300,
                   cwd=r"D:/hpy/桌面/数熙相关文档/<项目目录>")
print(r.returncode, r.stdout[-2500:], r.stderr[-1500:])
```

### 3.6 工作流程
- **新建原型**：确认平台/模板/交互范围/数据量 → 创建 proto-config.json + pages/（含 _shared.html）→ 编写 → 构建 → 验证
- **增量修改**：用户说"改一下XX" → 先列 todo，逐个完成，做完自检，构建验证。改动落点：页面 HTML/交互 → pages/xxx.html；弹窗结构 → _shared.html；弹窗逻辑 → 业务页面；框架层 → 先说明等授权
- **委派失败后接手前先查工作区**：外部 agent 委派失败（429/断连/超时）后 Hermes 接手时，先 `git status` + 页面 mtime——可能已有完整改动或 dist 已重建。正确动作：`git diff` 审查 → 完整验收 → 补遗漏 → commit + push，不凭"委派失败"就重做。delegate_task 超时的典型形态：600s 硬超时、零文件写入（git 干净）。判定为通道性失败（如 CLI 直连被拒）后不要再赌重试，直接 Hermes 接手
### 3.7 Token 高效三阶段（读一次，想清楚，改一轮）
1. **侦查**：execute_code + Python 一次提取锚点坐标，输出摘要不读全文
2. **读局部**：search_files 定位 → read_file(offset,limit) 只读改的 20-30 行；不读 Shell 模板全量
3. **一轮执行**：所有修改写进一个 Python 脚本按区域一次执行
- **侦查够用即开干（用户纠偏「思考差不多就开干吧，不要内耗」）**：定位到主锚点、确认改动方案可行后立即动手，剩余细节改到哪读到哪；不为"信息完整"反复 grep/read 推迟第一笔修改。批量文本替换（平台名改名等跨文件统一替换）直接写 Python 脚本一次跑完，不逐文件手工 patch

### 3.8 验证（每次构建后必做）
> verify-output.py 仅适用组件化产物；单 HTML 不调用（原因见 2.5.1）。
1. **组件化验证链**：`pages → build.py → dist → verify-output.py → Browser/功能验证`
   ```bash
   PYTHON="D:/HermesData/hermes-agent/venv/Scripts/python.exe"
   "$PYTHON" "D:/HermesData/skills/product-management/interactive-prototype/scripts/verify-output.py" dist/
   ```
2. JS 语法：提取 `<script>` 到临时 .js → `node --check`（verify-output.py 已含此检查，可二选一）
3. 结构：`</html>` 闭合、div 数量平衡、无残留旧代码
4. 功能：菜单数量、页面切换、核心交互

### 3.9 调试速查："页面无法切换"
根因几乎总是 **JS 语法错误**（一个 SyntaxError 让整个合并 script 块解析失败，所有函数变 undefined）。
`browser_console: typeof switchPage` → undefined 则提取 script 到 .js → node --check 定位；常见：onclick 引号嵌套冲突 / 花括号不匹配。

---

## 4. PC 端企业后台规范（build.py 组件化项目）

> 作用域：**build.py 组件化项目**（shell 模板已定义类名与样式，页面必须匹配 shell 已有类名，禁止自定义全局样式）。
> 本条是「shell 类名契约」；视觉细节（颜色/间距/组件/图标/图表）以 `ui-system/` 为准。
> 新建单 HTML 原型 → 走第 2 章，不用本条类名。

### 可用 CSS 类（页面组件必须匹配 shell 已有类名）
- 布局：`.page-header`, `.page-title`, `.page-title .sub`
- 筛选：`.filter-bar`, `.filter-item`, `.filter-label`, `.filter-select`, `.filter-input`, `.filter-btn`, `.filter-btn.primary`
- 表格：`.table-card`, `.table-toolbar`, `.toolbar-btn`, `.toolbar-search`
- 状态：`.badge-status`, `.badge-status.active`, `.badge-status.disabled`
- 操作：`.action-btn`（蓝字链接）, `.action-btn.danger`（红字）
- 分页：`.pagination`, `.page-info`, `.page-btns`, `.page-btn`, `.page-btn.active`
- 弹窗：`.modal-overlay`, `.modal-overlay.show`, `.modal`, `.modal-header`, `.modal-body`, `.modal-close`
- 信息：`.info-grid`, `.info-item`, `.info-label`, `.info-value`；表单：`.venue-form`, `.form-row`, `.form-label`, `.form-control`
- 导出：`.export-modal`, `.export-form`, `.export-row`, `.export-note`, `.export-actions`
- 确认：`.confirm-overlay`, `.confirm-box`, `.confirm-btn`, `.confirm-btn.danger`
- 更多菜单：`.more-menu-wrap`, `.more-menu`, `.more-menu.show`, `.more-menu-item`, `.more-menu-item.danger`（shell 未定义则下拉平铺，需在 shell `<style>` 补充）

### 规则速查
- 行内操作只用文字链接（action-btn），禁止带边框按钮
- 导出弹窗放 _shared.html，打开时同步当前筛选条件
- 面包屑与菜单层级一致；页面切换由 `protoShowPage()` 控制
- **PC 原型约定：不要页面标题/副标题，不要"共X条"统计**；删 page-header 后按钮重排到 filter-bar 行
- 类别筛选触发按钮与 `.filter-select` 视觉统一，浮层面板宽度 340px；树形单选 ○/●，叶子可取消
- **下拉/级联选项 hover 用浅蓝底、选中用主色（AntD5 标准）**——用户偏好蓝色高亮，不接受灰色 hover；色值见 `references/visual-reference.md`
- **详情/编辑返回必须回来源视图**：跳转前记 `RES_BACK_PAGE + RES_VIEW_RESTORE`，来源页 init 首次才重置视图；布尔字段（上架/下架）用 Switch 不用"点击切换"标签
- **操作交互优先本页弹窗，不跳转页面（用户偏好）**：跨页函数（openSessionDetail/openFaqFormModal/prefillFaqFromSession 等）+ 弹窗 DOM（_shared.html）+ 全局数据（构建合并作用域）都可直接调用，删掉 switchPage+setTimeout 链即可；"详情/新增"这类操作直接本页开弹窗，用户明确不接受跳转
- **⛔️ PC 端管理页「新增/编辑/详情」一律弹窗，禁止独立 proto-page（党代会项目实测两轮）**：用户两次纠正「点击是空页面，应该是一个弹窗」。独立页面方案（PAGE_META + protoShowPage('xxx') 跳转）在 build.py 合并工程里不可靠——切过去内容空白（init 链/映射未就位）。正确做法：弹窗 DOM + JS 放页面组件内部（参考模板管理 `openTplModal` 模式）或放 shell；**多页共用弹窗时全局函数名必须唯一前缀**（如 `pdShowDetail`/`pdCloseDetail`）——shell 与页面组件同名函数会被后者覆盖（构建后函数声明合并、后定义覆盖先定义），点击变无限递归、弹窗打不开。排查：`grep -n "function 弹窗函数名" pages/*.html shell-*.html` 看有无重名；验证用真实浏览器 `document.querySelector(...).click()` + 查 `getComputedStyle(弹窗).display`，不能只调函数
- **移动端返回栈语义（党代会）**：返回按钮必须 `historyBack()`（pop 栈），禁止写死 `goXxx()` 固定跳转——固定跳转会二次 push 历史栈，导致「模板页↔拍照页对切、永远回不了首页」。配套：①顶层入口函数（goHome/goTemplates/goGallery/goMine/goTerms）进入时重置 PAGE_STACK；②结果页内进入的子页（说明/我的）走 `showPage` 保留栈，返回回结果页；③gallery/mine/terms 返回用 historyBack（从哪来回哪去）。移动端无 tab-bar 时，返回导航可靠性完全依赖栈语义，改任何返回按钮先确认 PAGE_STACK 行为
- **UI 图还原（MIMO 识图 1:1）**：字号对齐项目页面规范（PC 内容 13-14px、按钮 13px），设计稿字号常偏大不盲从；空状态等短内容不塞固定 max-height+overflow 容器（多余滚动条）；完整流程见 skill:mimo-vision-ui-replica
- 表格状态流转：操作后实时更新该行，**列数变化时同步更新所有 `tds[N]` 索引**
- 条件字段显隐：onchange 切换 `style.display`，提交时同步校验必填
- **⚠️ 用户给定详情/大图字段示例时，逐字保留，即使列表已精简（实测）**：用户对列表说"去掉素材来源"，但对大图给了明确格式 `编号/模板/微信号/来源/提交时间`——列表精简 ≠ 详情精简。数据对象里的字段只能加不能随意删：删 `screen` 这类字段前先 grep 它是否被大图/详情/弹窗引用，否则预览区字段缺失、用户一轮返工。判据：用户说的字段清单按页面逐个核对（列表一份、大图一份，可能不同）
- **模板卡片字段与 PC 管理列表同源、字段一一对应（党代会）**：移动端模板卡片显示 = 模板名称 + 适用建议（guide）+ 人数 · 预计耗时（如「盛会留念框 / 建议多人合照，原图居中，红金边框 / 人数 1-6 人 · 约 3 秒」）——**不要加能力标签**（用户明确：卡片上"经典纪念框"这类能力名标签去掉）。分类（庄重经典/智能海报/AI 国风/AI 创意）是 PC 模板管理的「分类」列和移动端分段控件，不是卡片标签。PC 模板管理列表要有对应列（适用建议、预计耗时、人数支持）且数据同源，否则用户会质疑「移动端卡片有的字段 PC 没地方配」。卡片/列表新增展示字段前先问「这个字段 PC 端配置页有没有」

---

## 5. 高频陷阱清单（完整库见 pitfalls-complete.md）

### JS 语法与执行
- **花括号不匹配 → 整个 script 块失效**：所有页面脚本合并进一个 `<script>`，任一页缺 `{`/`}` → 全部函数 undefined、页面无法切换。修改后必数 `{}` 平衡
- **onclick 引号嵌套冲突**：单引号与外层冲突 → SyntaxError。用 `&apos;` 或反引号
- **⚠️ onclick 内嵌 JS 转义漂移极难手修**：patch 可能把 `onclick="f(\'xx\')"` 的转义层数悄悄改错 → `node --check` 报 Unexpected identifier，手重打转义越修越错。修法：**从已通过检查的兄弟页字节级拷贝同款行**（Python 读写，不手敲）；连续 2 次未收敛 `git checkout` 回滚跳过
- **⚠️ 治本：新写交互不在 onclick 字符串里嵌 id/参数**：DOM 属性 + 事件委托——元素写 `data-id`、`ondragstart="fn(event)"` 不传参，函数内 `ev.currentTarget.getAttribute('data-id')` 取值。零转义零嵌套，天然免疫转义漂移
- **IIFE 内函数对 onclick 不可见**：`(function(){})()` 内函数需 `window.xxx = xxx` 暴露
- **模板字符串数字 id 变字符串**：`openDetail('${s.id}')` → `'1' === 1` false 静默失效。不加引号 `openDetail(${s.id})`
- **onclick 字符串传参 + 数字 id → 交互全失效（高频）**：`onclick="f('1')"` 内 `data.id === id` 永远 false。统一 `String(x) === String(id)` 辅助函数；验证必须真实 DOM click（`document.querySelector(...).click()`），不能只调函数
- **同名函数覆盖（后定义覆盖先定义）**：新函数撞旧函数名 → 旧交互点静默失效。排查 `grep -n "function 函数名" pages/*.html`；新函数独立命名
- **空数组 [] 是 truthy**：判空用 `(val && val.length > 0)`，不能 `val ?`

### 页面组件规范
- **新增功能元素（把手/开关/角标）不得改变原有字段展示**：给已有卡片/容器加辅助控件时，作为独立绝对定位元素挂在外层根，绝不插进已有内容子容器。治本：改前明确"仅新增独立控件、原字段 DOM 零改动"，改后 `git diff` 对比确认字段行未变
- **视图/功能新增先确认"是不是照搬某页既有模式"**："参考 XX 页的按钮/效果"= 样式+位置+交互三样都对齐参照页，动手前定位参照代码按同款照搬；拿不准就先澄清"照搬哪页、按钮放哪"，不自创另一套
- **"框架在但数据全空" → 先查 init 是否抛 ReferenceError**：用户说没实现 ≠ 真没实现。最常见：init 首次读取未 `var` 声明的变量。排查：browser console 跑 `protoShowPage('页面id')` 看报错 → `grep -rn "var XXX" pages/` 确认声明归属
- **跨页同名变量引用 → 逻辑静默失效**：合并作用域下引用别页变量不会报错，只读到别页初始值（`''`）→ 条件永不成立。引用"像自己的"变量前先 grep 全仓确认归属
- **私有树跨客户串数据**：分类兜底匹配 `themePath.indexOf(分类名)` 须带客户根校验（`themePath` 以客户根开头）
- **工厂函数不透传新增数据字段 → 数据有了但渲染读不到（静默）**：给共享数据加新字段后，只有把字段写进对应工厂函数的构造对象，下游 helper 才能读到；漏了则显示兜底值且无任何报错。加字段后 grep 该数据的生产者函数（XxxCardList/XxxList 类映射函数）确认字段已透传
- **proto-page 外元素被静默丢弃**（Toast/页脚常见）；**新页面不自动激活**（首页才需自调用 protoShowPage）；**删/改 HTML 后必须清理引用它的 JS**（getElementById null → 异常中断全 JS）；**Tab 结构必须闭合**（数 div 平衡）
- **_shared.html 弹窗事件引用的函数名 ≠ 业务页面定义名 → 交互静默失效**：弹窗 HTML 的 onclick/oninput 调 `searchMergeKb()`，业务页实际定义 `searchMergeTarget()`，搜索点击无反应且无报错。弹窗事件函数必须与业务页定义名完全一致；验收时 grep 两侧函数名核对（`grep -n "oninput=\|function 函数名" pages/*.html`）
- **隐藏共享源模式**：共享数据/函数集中在某页（如 02 页 MOCK_RESOURCES/findRes/renderAppSidebar），其他页依赖其合并全局作用域。要"删"该页只能从菜单去入口，**不能删文件**；交接文档必须告知执行 agent 文件保留
- **共享数据数组不能直接改字段值**：其他页用动态统计驱动 Tab 计数，改了破坏统计。业务页建独立副本（RES_MGMT_TOPICS/PVT_MGMT_TOPICS）
- **⚠️ 改共享字段值前先 grep 全引用；底层语义仍被别页用时新建字段、不改原值**：实例 `ACTIVITY.archiveIndex=328`，首页统计要展示「28 人分享上屏」，但同一字段被结果页/我的页当「第 328 号纪念档案」编号渲染（`'第 ' + ACTIVITY.archiveIndex + ' 号纪念档案'`）——直接改值编号全乱。正确：新增 `shareCount:28` 供首页读，archiveIndex 保持编号用。判据：grep 字段名，若 2 个以上「语义不同」的消费方（展示值 vs 编号/统计）→ 开新字段
- **⚠️ 删除共享集合条目（模板/素材 id）必须先全量替换引用（党代会模板收缩 9→2 实测）**：TEMPLATES 是共享数据，GALLERY（精选墙）、MY_WORKS（我的作品）、state 默认值（selectedTpl）、弹窗/详情都可能引用被删条目 id；漏替换 → `findByTpl(id)` 返回 undefined → 渲染静默崩或空图。PRD 同样会藏引用（能力分层表、模板建议表、大屏轮播版式表、P0/P1 优先级、验收清单）。流程：① `grep -rn "被删id" pages/ shell-*.html` 全量盘点（含展示数据、默认值；shell CSS 死类名可留不删）② 条目删除用正则按 id 锚整行 `re.compile(r"^  \{ id: 'xxx',.*\n", re.M)`（勿依赖整行文本匹配——列对齐空格坑）③ 引用替换用短锚点 `work.replace("'xxx'", "'保留id'")`，**先删行后换引用**（顺序反了会把尚未删除的保留条目也换掉）④ 同步 PRD（grep 全库模板名/能力名）⑤ 构建后 dist 验数据层：grep `id: 'xxx'`（精确到 `id:` 前缀，避免 shell CSS 类名误命中）应归零
- **同页双视图数据源脱节 → 切视图空白 + 统计 0**：列表和卡片用两套不关联数据。修复：重建数据让两视图同源，数字与实际条数一致
- **视图/分组枚举错数据词汇表 → 点进去全空**：做"按 X 分组的视图"前先确认枚举来源字段 = 数据对象实际带的分组字段（导航树节点名 ≠ 数据分组字段是两套词汇表）；动手前 grep 确认目标字段真实存在且与被枚举数据同源
- **dist 中共享函数出现 2 次是正常结构**（壳 div + 组件 div + 末尾全局合并大块），勿误判重复注入；grep 计数注意子串误匹配，用 `grep -bo` 看偏移

### 弹窗/详情字段
- **共用弹窗/详情页字段必须覆盖所有入口列表字段**（党代会）：照片管理详情页 = 上屏展示审核详情页，用户明确要求「字段信息注意要完整，比如在照片管理详情页要包括'上屏展示审核'的所有字段」。设计共用详情弹窗前，先枚举各入口列表的表头字段并集，逐项确认弹窗都渲染；构建后 grep dist 确认每个字段字符串出现（列表 + 弹窗各至少一次）
- **PC 端弹窗表单字段遵循「用户给什么就留什么」**：模板管理弹窗用户明确「能力类型、排序权重、字段都去掉」——先做完整字段版本再按用户删减是常态流程；**不要自己反复加回已删字段**（保留在数据层即可，表单不展示）。弹窗字段精简后要同步清理三处引用：DOM 元素、open 回填、save 读取，`grep tpl-cap|tpl-sort|tpl-hot` 残留归零

### 表格渲染
- 动态渲染改 JS 模板/数据源，不能只改 HTML；批量加列后数 `<td>` 数量；tds 索引随列数同步更新；级联筛选三处缺一不可（下级初始空 + 上级 onchange + JS 填充下级），filter 和 export 弹窗都要实现
- **PC 管理页新增字段 = 8 处同步，缺一静默（模板管理加「方向」字段实测）**：① 表头 `<th>` ② 数据数组每项补字段 ③ 渲染行 `<td>` ④ 空状态 colspan +1（列表无数据占位行）⑤ 弹窗表单 DOM ⑥ open 回填 ⑦ save 读取 ⑧ 新增 push 构造。构建前逐项 grep（字段名出现处数 + th/td 计数 + colspan）确认齐全；只改表头不动渲染行 → 整列消失（无报错），只改表单不读写 → 保存后字段丢失
- **静态表格缺列（静默，无报错）**：表头 th 数与数据行 td 数不一致 → 整列数据消失。实例：未命中统计分组视图表头 10 列、7 行静态数据均只有 9 个 td（缺 AI分类 列），浏览器不报错。改静态表格后必须数 th/td 数量对齐；有同源数据数组时对照字段逐一核对
- **源文件正常但 dist 缺列 = dist 是旧构建**：源文件 10 td/行、PC dist 也正常，只有 mobile dist（7月23 旧构建）缺列。排查：先确认源文件每行 td 数（execute_code 提取表格区域统计，别靠肉眼读 sed 输出——缩进异常会误导），源文件对就重建 dist，不要改源文件

### CSS 与视觉
- tooltip 只用 `::after`，th 需 `white-space:normal !important` 防竖排
- **⚠️ tooltip 气泡被容器裁切 = 祖先 overflow:hidden**：气泡默认 `bottom: calc(100%+8px)` 向上弹出，一旦触发元素在带 `overflow:hidden` 的容器内（如 `.table-card` 为圆角裁剪设的 hidden、`.content-area` 等），气泡超出容器顶边就被裁掉下半截，z-index 再高也没用。判据：截图气泡某一边被齐平切掉、正好落在容器边界。修法：把定位改成向下弹（`top: calc(100%+8px)` 覆盖下方数据区是标准 tooltip 行为、不再碰容器顶边）。不要靠加大 z-index（对 overflow 裁剪无效），也不要动容器 overflow（会破坏圆角裁剪、影响所有同类表格）。改动落在项目级 `prototype/shell-{template}.html`（build.py 优先用项目 shell，见 3.5）时，需同时重建正常版+标注版 dist 保持一致
- grid 容器内块级元素横排变形 → 块加 `grid-column: 1 / -1`
- **状态 Tag「可点但克制」设计模式（B 端标准，用户委托"参考标准B端产品设计"）**：状态本身可点击打开详情时（如未命中问题→已新增/已合并→开知识详情），用 AntD Tag 风格 + `.status-link`，而不是普通 action-btn：`cursor:pointer` + hover 加深（`filter:brightness(1.06)`）+ `box-shadow:0 0 0 1px currentColor inset` 内描边 + 微上浮 + 文字后 `›` 箭头。色语义区分：新增=AntD 成功绿 `#52c41a`（bg `#f6ffed`/border `#b7eb8f`）、合并=AntD 主蓝 `#1677ff`（bg `#e6f4ff`/border `#91caff`）。终态（已忽略）保持普通 badge 不可点。CSS 放 shell `<style>`（页面禁止全局 style）：两个状态类 + `.badge-status.status-link` 通用 hover
- **折叠菜单收纳 + 置灰两层语义**：操作过多收进三点 `.more-btn`（svg 三圆点 + hover 蓝 #1677ff）触发 `.more-menu`，`.more-menu-item.disabled { color:#c0c4cc !important; cursor:not-allowed }` 表终态禁用。**置灰必须分清两种语义**：①功能弱化（可点低调——用户曾明确"忽略按钮不用强调灰色"）②终态禁用（不可点，处理完该行只剩详情可点）——动手前先确认用户要哪种，别混。展开交互：`toggleMissMenu(ev, elm)`（`ev.stopPropagation()` + 先关闭全部再开当前）+ `document click` 外部关闭（`!e.target.closest('.more-menu-wrap')` 时全关）；菜单项动作经统一 `missMenuAction(type, a, b, c)` 转发，新增/合并共享菜单 HTML 模板函数 `missMenuHtml(tr, disabled)` 从行 td 取参数、disabled 时输出无 onclick 的灰项（零转义）
- **局部状态切换不要整页重渲染**（用户纠正）：卡片开关只更新该卡 DOM（classList + 改节点），数据源同步改，不重渲染列表
- **演示优先原则（用户多次）**：原型是 demo，避免"真实系统才需要"的自动化行为——下架后自动沉底排序被用户要求撤销（"我方便演示开启关闭"）；状态变化用视觉表达（置灰蒙层、徽章变色），不动列表顺序
- **⚠️ 置灰禁用 opacity/filter，用白色蒙层 ::after（两轮）**：卡片加 `opacity` 或 `filter:grayscale` 会创建**新堆叠上下文**，把卡内绝对定位的「更多」下拉困在本卡图层里，被相邻卡片元素（如 hover 查看大图层）遮挡。正确做法：`.card.off::after { content:''; position:absolute; inset:0; background:rgba(255,255,255,.45); z-index:<盖过卡内悬浮层>; pointer-events:none; }`——白蒙层不建堆叠上下文、视觉轻（用户嫌 opacity+grayscale 太重）、菜单(z100)保持最上层；**不要给信息区再单独加 z-index 层**（会反过来压住菜单）
- **需求边做边追加是常态**：一轮任务常收到 3-10 条增量修正，正常节奏 = todo 清单累积 → 统一实施 → 一次构建统一验证 → 单次完整状态报告；不要每条小改都单独走完整构建+报告循环
- JS 生成的 HTML 用 shell 未定义的 CSS 类 → 下拉平铺无样式。核对可用 CSS 类清单
- **CSS 布局陷阱（aspect-ratio/max-height 冲突、align-self 收缩）→ 详见 `references/layout-intelligence-pitfalls.md`**（2026-08-11 Critic 实测，含修复 CSS；执行时遇媒体比例失真/区域收缩先查该库）

### 构建与编码
- **同一项目同时构建 PC + Mobile：页面分目录 `pages/pc/` 与 `pages/mobile/`（build.py 新增 `resolve_pages_dir`）**：build_pc/build_mobile 各自优先读对应子目录，无子目录回退 `pages/`（老项目不受影响）。此时 `proto-config.json` 单一文件服务双端（name/primaryColor/tabBar 共用），shell 各自独立（shell-pc.html + shell-mobile.html）。构建命令分别跑 `pc` 与 `mobile` 两个 target
- **默认落地页 = 字母序第一个页面的自调用 protoShowPage，与菜单无关**：隐藏菜单项后打开原型仍落在被隐藏页。机制：build.py 按文件名排序，首个含 `if (typeof protoShowPage === 'function') { protoShowPage('xxx'); }` 自调用的页面成为默认页；菜单只是 renderAppSidebar 的显示层。修法：改那个页面尾部的自调用目标（如 `protoShowPage('topic-mgmt')` → `protoShowPage('resource-mgmt')`），重建即可；不要去动 proto-config 或 shell。改完默认页必须检查该页尾部有无残留的**手动 `init_xxx()` 调用**——它在 protoShowPage 之后执行，会用被隐藏页的 init 覆盖面包屑（实测：打开即显示「首页/内容管理/V2主题管理」，点一下菜单才恢复正确的「首页/资源管理/公共资源」）；init 一律由 protoShowPage 内部按需调用，页面尾部禁止手动调
- **默认落地页变体：全程无任何自调用时（smart-tour-guide 实测）**：首屏 = build 注入的**第一个 proto-page**（按文件名排序，dist 里第一个 `data-page-id` 无 `display:none`），面包屑 current 与菜单 active 都写死在 shell。要让首屏=目标页：在目标页 script 尾部加 `if (typeof protoShowPage === 'function') { protoShowPage('目标pageid'); }`（页面脚本按文件序合并成一个块，**最后一个自调用生效**，仅加这一处即可覆盖默认显示），并同步 shell 的 `<span class="current">` 面包屑文本与 menu-item 的 active class。验证：dist 里 grep `protoShowPage('目标'` 存在 + 面包屑文字已改
- **⚠️ build_mobile 两个缺陷（党代会项目实测，已修复 build.py）**：①`resolve_shell_path("mobile")` 漏传 project_path → 项目级 `prototype/shell-mobile.html` 永远不被读取，永远用模板级 shell（改项目 shell 无效）；②已修复：build.py 现在做 `output.replace("{{DEFAULT_PAGE}}", default_page)`（default_page=首个组件 id），模板/项目 shell 直接写 `ProtoRouter.init('{{DEFAULT_PAGE}}')` 即可；验证：dist grep `DEFAULT_PAGE` 应为 0
- **⚠️ mobile 构建不处理 `_shared.html`**：build_mobile 的 glob 会把 `_shared.html` 当普通组件解析，**没有 PC 那样的共享组件剥离逻辑**；且按文件名排序 `_` 排最前 → 若它无 PAGE_META，默认页取到空 id → 白屏。修法：移动端全局浮层（toast/弹窗）直接放 01 页（DOM 合并后 fixed 定位全局可见），不放 `_shared.html`
- **⚠️ 移动端「验证全绿但浏览器白屏」= 默认页从未激活（党代会项目）**：verify-output.py 全过 + node --check 0 + div 平衡 ≠ 不白屏——这些都不检查路由启动。真实白屏根因链：① 项目级 shell-mobile.html 自定义/重建时**丢掉了模板的启动块**（`DOMContentLoaded → ProtoRouter.init()`），页面 div 全在但无任何 active；或 ② init 写死 `'m-home'` 而页面组件实际 id 是 `home`（无前缀）→ hash 找不到 target、默认页不激活。判据：dist 里 `grep -c "ProtoRouter.init"` 应为 1 且参数 == 首个组件 id（由 build.py 替换 `{{DEFAULT_PAGE}}`）；打开 dist 后 URL hash 应出现 `#/home`、`read_preview` 文本能看见首页内容。修法：模板 shell 写 `ProtoRouter.init('{{DEFAULT_PAGE}}')`（禁止写死带前缀的页 id），项目级 shell 重建时保留启动块。**用户报「打开空白」第一时间 grep init 块与页面 id，别停留在自动验证全绿**
- **⚠️ 移动端默认形态 = 无底部 tab-bar**：扫码直入式 H5 落地页不要底部导航菜单。`proto-config.json` tabBar 留空数组，shell 里删 `<nav class="tab-bar">`（连同 `.tab-bar*` CSS）。首页即入口（大按钮进创作/现场精选/我的），页面内 `back-btn` 返回导航
- **⛔️ 移动端不要模板级 shell 的评审布局（用户明确要求）**：用户要"正中间显示移动端原型、全面屏、无刘海、不要页码导航、仿真状态栏"，拒绝旧 shell-mobile.html 的左手机+右文档 review-shell。**模板级 `src/shells/shell-mobile.html` 即全面屏壳**（body flex 居中 + mobile-shell 固定比例 + 仿真状态栏 SVG + home-indicator 手势条），旧 review 布局模板已删除；新项目首次构建复制到项目后即可用，一般无需再自定壳。真实机型比例（小米17=2656x1220→360x783.6px），低视口用 media query 等比缩放（zoom 0.9/0.82/0.72）。模板壳不注入页码导航（base.js 的 `.page-nav-btn` 查询对缺失容错）
- **⚠️ 移动端全局浮层（toast/演示菜单/公共弹层）必须放 shell，不能放页面组件 div 内**：`.page` 未激活时 `display:none`，放组件内的 fixed 浮层全部不可见——toast 放 08 页组件里、其他页调用 toast() 时元素存在但被父级隐藏。正确做法：toast、演示 FAB/菜单等跨页浮层 DOM 放 `shell-mobile.html` 的 `mobile-screen` 内（页面 div 之外），演示/全局函数也放 shell 独立 `<script>`（在 base.js 之后追加）；与 PC `_shared.html` 弹窗机制不同，mobile 全局浮层没有共享组件容器
- **⛔️ 移动端弹层必须 `absolute` 定位，禁止 `fixed`（党代会项目）**：`position:fixed` 相对**浏览器视口**，弹窗遮罩会覆盖整个浏览器窗口而不是手机框架内（用户报「照片使用说明弹窗跑到手机壳外面」）。修法：所有业务弹层（说明弹窗/save/submit/wall-detail/leave/full-photo/toast）统一 `position:absolute; inset:0`——它们挂在 `.page` 容器（`absolute inset:0`）内，absolute 自然相对手机屏；toast 必须位于 `mobile-screen` 内（shell 里从 mobile-screen 外移进来）。唯一保留 `fixed` 的是浏览器级演示工具（demo-fab/demo-menu），它们本来就该浮在手机壳外。⚠️ 模板库 `src/assets/base.css` 自带 PC 风格 `.toast{position:fixed;top:60px}` 与 `.modal-overlay{position:fixed}`，构建时会拼进 mobile dist——项目 shell 里同级规则在后（CSS 后者胜）即覆盖生效；grep 出多条 `.toast` 规则属正常，按 CSS 顺序判生效值
- **⚠️ 弹窗语义：提示弹窗 ≠ 同意弹窗**：「照片使用说明」这类告知性弹窗是**提示**不是**授权门槛**——确认按钮用单个「我已了解」，不要做成「暂不使用 / 同意并使用」双按钮同意式。判据：内容是告知信息（照片用途/流程说明）→ 单按钮提示；涉及服务条款/隐私授权/不可逆操作 → 才用双按钮同意式。用户原话：「这个是提示弹窗，不是需要必须点击同意之类的」
- **build.py 吞 `<script src>` CDN 标签**：页面里写 `<script src="...">` 会被静默丢弃（只提取内联 `<script>`）→ CDN 库必须 JS 动态加载（createElement('script')），详见 `references/ui-system-lucide-migration.md`
- **HTML div 不平衡 → build.py 静默产出空页面**（不报错、构建成功、页面空白）。排查：浏览器元素全 MISSING → 查 dist 该页内容长度（len≈2）→ 源文件 div 深度扫描
- **pages 目录禁止 `.bak.*.html`/临时 HTML**：build.py glob("*.html") 扫入当页面 → dist 重复两遍。备份用 git 或改 `.txt`
- **脚本生成 JS 数组元素必须带逗号**：漏逗号 → node --check 报 `Unexpected token '{'`（报错在漏逗号元素的后一行）
- **⚠️ 批改 JS 数据数组先防「列对齐空格」破坏固定空格锚点（模板管理加方向字段）**：数据字面量常按列对齐补空格——同一数组里 `{ id: 'shenghui', name: ... }`（单空格）与 `{ id: 'fenjin',   name: ... }`（多空格对齐）空格数不同；固定单空格锚点 `id: 'xxx', name:` 可能第一行碰巧成功、第二行起 assert count==0 白跑（若没断言则整批静默漏改）。修法：逐行锚点用正则 `id: 'xxx',\s+name:`（\s+ 容忍对齐空白），或先 grep 实际行的原始空白再构造锚点；批量遍历行一律按每行唯一 id 定位，不依赖列对齐
- **正则重写 JS 大数组会吞数组后的声明（最严重）**：`re.sub(r'var X = \[.*?;\])` 锚点不精确会静默删数组后的 var 声明 → 运行时 `X is not defined` → 页面全空。安全规程：替换前 count 锚点唯一；替换后 git diff 审查所有 `-` 删除行
- **正则替换字段后必须 grep 实测**：group 边界不含闭合引号会静默丢引号（替换计数正常但数据已坏）
- build.py 写文件必须 `newline=''`（CRLF 污染 `\n` 正则致 JS 崩溃）；str.replace 注意 `\r\n`、unicode 转义、区域边界
- **修改源文件前先备份（git 或 .bak.txt）**
- **patch old_string 范围过宽 → 误删相邻弹窗/节点**：插入新弹窗到 _shared.html 时，old_string 若把上一个弹窗整块包含进去、而 new_string 没写回它 → 该弹窗被静默删除、页面功能缺失。防范：patch 只锚定插入点附近 2-3 行（如尾部 `</div>` 容器 + 注释行），不把整块旧弹窗作为 old_string 起点；执行后立即 git diff 审查 `-` 删除行。恢复：误删后补回原块（从 git show HEAD:文件 取原文）再验证 div 平衡
- **⚠️ patch 对含转义串的整函数块会造成缩进错乱+转义漂移双害**：old_string 缩进不精确匹配时触发。治法：含转义的整函数块不用 patch 单次替换——用 Python 从 git 基线 `git show <commit>:文件` 取原函数按字节重建，只注入改动行；改完 `node --check` + 与基线逐行 diff 确认字段零改动
- **⚠️ patch 的 new_string 同样会二次转义（实测，坑的新变体）**：已知 patch 改含 `\'` 的行会漂移转义；实测即使只改 new_string 里**新写**的 `\', \'copy\')` 拼接，也会被写成 `\\'copy\\'` → SyntaxError。症状：diff 输出里出现 `\\\\'`。修法：写一个 3 行 Python 脚本做精确字符串替换（chr(92) 构造反斜杠避免脚本自身转义），改后立即 node --check。治本不变：新写 onclick 拼接用 data-* + 事件委托，不写 `\'` 嵌套
- **恢复错误实现后 git 状态显示 `MM`（不是单 M），别困惑**：`git checkout <commit> -- 文件` 会把该文件抓进**暂存区**（=干净基线），随后你新增的改动落在**工作区**（MM = 暂存区M + 工作区M）。确认"暂存区=基线、工作区=新实现"用 `git diff`（工作区vs暂存区）看差异、用 `grep -c 新函数 文件` 确认无旧实现残留；commit 前 `git add` 覆盖暂存区即可。原始备份 `.hermes-backup/` 留在项目根不影响 build/git，用处：改坏时对比"当前 vs 原始"确认字段/转义是否被误改
- **⚠️ 用 Python 逐锚点替换前先归一化换行（CRLF 文件用 LF 锚点必败）**：pages/*.html 等多是 CRLF。若 `open(..., newline='')` 读原始文本，你在三引号里写的 `\n` 锚点（LF）对不上文件 CRLF 行尾，`s.count(old)` 静默为 0、assert 直接 SystemExit 白跑（本会话 `markMissSupplemented` 锚点即因此首跑失败）。安全配方：读 `newline=''` → `s = s.replace('\r\n', '\n')` 归一化 → 全部替换串用 LF、每个锚点先 `assert s.count(old)==期望数` → 写回 `open(P,'w',encoding='utf-8',newline=None)`（写入模式自动把 `\n` 转回 `\r\n`，保持原格式，git diff 干净）。注意断言在替换前就抛错、尚未落盘，文件安全——重跑时统一成 LF 锚点即可
- **⚠️ 写回禁止「手动转 CRLF + newline=None」双转换 → \r\r\n 累积（实测，同文件多轮修改必爆）**：若误解旧配方写成 `open(P,'w',...,newline=None)` 且写入前又手动 `s2.replace('\n','\r\n')`，Windows 上 newline=None 会把每个 `\n` **再**转一次 `\r\n` → 首次写回行尾变 `\r\r\n`；同一文件第二轮起 `s.replace('\r\n','\n')` 只剥掉一个 `\r`，锚点明明看着一致却全部 `count==0` assert 白跑（本会话 01-home.html 两轮修改后行尾 `\r\r\r\n`）。修复存量污染：`re.sub(r'\r+','\r',text)` 折叠多余 `\r`。**推荐写回配方（二进制，零翻译）**：`raw=open(P,'rb').read()` → `crlf = b'\r\n' in raw` → `work = raw.decode('utf-8').replace('\r\n','\n')`（LF 操作版）→ 替换（锚点用 LF、先 assert count）→ `out = work.replace('\n','\r\n') if crlf else work` → `open(P,'wb').write(out.encode('utf-8'))`。症状排查：锚点 `count==0` 但文本肉眼相同 → `repr` 行尾看是否连续 `\r`
- **⚠️ 大块删除用「行号区间法」而非文本锚点**：整段删除（TAB 容器/弹窗/函数区，如把某页 TAB 内容搬迁成独立页时）文本锚点 find 可能因换行/缩进/全半角差异静默返回 -1。改用：read_file 拿准确行号 → `split('\n')` 按 1-indexed 行号区间 drop 重建 → 删完 grep 残留引用 + div/tr 平衡检查。另：**execute_code 脚本运行在独立临时目录，脚本内文件读写必须绝对路径**（相对路径必 FileNotFoundError，harness 提示易漏）
- **项目里可能有「独立单文件原型」直接放在 dist/（非 build.py 产物；实测：智能导游-小程序.html）**：特征＝pages/ 无对应页面源 + 文件内 `grep -c PAGE_META` 为 0 + proto-config 是另一套模板。此时项目 README 的「dist 只读」规则不适用——该文件本身就是源，直接改它（改前 `cp 原文件 原文件.bak.原因.txt` 备份）。大 HTML 多点改动的安全配方：execute_code 写 Python 脚本逐锚点 str.replace，每个锚点先 `assert content.count(old)==1` 防误替换；写回后校验 `<div` 与 `</div>` 数量平衡；再用正则抽出全部内联 `<script>` 合并成临时 .js 过 `node --check`，三项全绿才算完成。

### 演示数据与交付
- **⚠️ 演示数据口径必须自洽，用户会追问「数字从哪来」（党代会项目）**：首页统计（人参与/作品数/档案数）不是随便填的装饰数字——用户会问业务来源。口径定义（如「参与人数=扫码即参与=发放编号数=档案数」）要在首次给出数字时就说清三数关系，数字打架（如参与 286 < 档案 328）必然被质疑。改口径时**同步 PRD 文档**（grep 全库旧数字，文档/原型必须一致，否则后来者被文档误导）
- **⚠️ 推送前确认全部改动完成（用户纠正「改好之后再推送啊」）**：不要中途/未验证完就 push。push 前 checklist：① 源文件改完 ② build.py 重建 dist ③ dist 残留旧值清零（grep 旧数字/旧字段）④ 文档同步（PRD/README 若涉及）⑤ verify 通过。尤其**数字/口径类改动**：源文件数字改了 ≠ 做完——dist 是构建产物，必须重建后才生效；`git status` 列出的改动清单就是交付清单

### 交接文档与工具路径
- **交接文档只信结构，不信行号/函数名/页面归属**：文档写"上传逻辑在 07 页、openResMgmtCatModal 树形多选可参考"，实际函数在 03 页、该弹窗根本不存在。开工前 `grep -n` 逐一验证每个关键函数/数据源真实位置，再按实际落点改
- **read_file 报 binary 但文件是 UTF-8**：含 BOM/控制符会误报，改用 `python -c "print(open('...',encoding='utf-8').read())"` 读取（交接文档、README 常见）
- **search_files 对中文路径可能静默返回 0 匹配**（主会话同样踩，非仅子 agent）：改用 terminal `grep -n`
- **patch 替换含 JS 转义串（`\'` 拼接 onclick）报 Escape-drift detected**：不要整块替换含转义的大段，拆成无转义的小锚点（单条语句/单行函数体）分段 patch
- **verify-output.py 不检查 div 平衡**：构建后自查要额外数 `content.count('<div') == content.count('</div>')`
- **dist 目录可能有新旧两个产物**（本案例 127.9KB 旧 / 1143.8KB 新）：验证选注入页面数最多的那个（script blocks 数最多者）
- **跨页共享作用域 + 弹窗模式标记的上下文陷阱**：upload 弹窗复用编辑页标签选择时用 `window.__EDIT_TAG_MODE` 区分模式，但 confirmEditTags 回填后会清空该标记，导致提交二次校验取错上下文。判据改用弹窗可见性（`uploadModal.classList.contains('show')`）而不是会被清空的标记

### 其他
- **浏览器验证作用域（模式限定）**：组件化增量修改默认**不主动**截图验证（改完告知用户查看，用户明确要求才用）；**单 HTML Layout Intelligence Pipeline 必须执行 Step 8 Screenshot + Step 9 Critic**（这是该流程的硬性要求，见第 2 章）
- **真实交互验证用自动化 Chrome 9333（drive_preview 有旧快照局限）**：drive_preview 的 read/elements 在页面重渲染后可能返回**旧快照**（点击后 delta 只有 same、read_preview 读不到弹窗文本），据此判断「弹窗没弹出」会误判——真实 Chrome 里一切正常。需要确凿的交互验证（点击是否生效/弹窗 display）时启动自动化实例：后台进程跑 `"D:/Chrome/Application/chrome.exe" --remote-debugging-port=9333 --user-data-dir="D:/Chrome/User Data_automation" --no-first-run --no-default-browser-check about:blank` → `curl 127.0.0.1:9333/json/version` 确认就绪 → browser_exec 打开 `file://` 原型 → `document.querySelector(...).click()` + `getComputedStyle(m).display` 实测 → 用完 kill 该后台进程。**drive_preview 与 browser_exec 结论矛盾时以真实浏览器为准**
- **⚠️ browser_exec 的 js() 参数不能含换行**：`js("(() => { try {\n return ...` —— js() 字符串含字面换行会在 browser-exec harness 的 Python 层报 `SyntaxError: unterminated string literal`（与页面 JS 无关）。JS 一律压成单行；需要多语句时拆多个 `js()` 调用，或用 `import time` 在 Python 层间隔
- **文档锚点含中文引号时先 read_file 确认实际字符（PRD 更新实测）**：文件里是弯引号（“”）时锚点写直引号（""）必然 `assert count==0` 白跑；错写弯直引号、全半角差异、空格差异都会静默 count 为 0。含中文标点的锚点先 read_file 原文段落再构造 old_string，或锚点只取不含引号的子串
- **browser_vision 视口裁剪误报字段缺失**：视觉截图只确认布局是否变形，字段存在性用 DOM 实测（两者矛盾以 DOM 为准）
- **预览同步（GitHub Pages）**：完整发布规程见 `references/github-pages-publish.md`；**⚠️ 必须等用户明确说「同步预览」才执行**——源码 push 不会自动更新预览仓。**⚠️ 用户说「传到预览的 GitHub 仓库」= prototype-preview 仓的 GitHub Pages（`https://kinger-han.github.io/prototype-preview/<slug>/`），不是项目自己的源码仓（党代会项目）**：项目源码 push 到自己的 repo 不等于预览更新。判据：用户提到「预览/更新到预览」→ 跑 `publish-preview.sh --project <项目目录>`（读取 publish-config.json，多原型一次发布）；只提「改好推送」→ 推项目仓。两动作经常都要做：先推源码仓，再发布预览

---

## 6. 延伸阅读
- 单 HTML 原型视觉规范 → `ui-system/`（tokens/rules/registry/templates/themes/devices/content/components/icons/charts）
- **页面级布局 → `ui-system/layout/`**（layout-tokens/layout.css/planner/critic/benchmark/policies/skeletons）
- **Layout Intelligence 架构详解 → `references/layout-intelligence.md`**（四层关系、media-ratio-policy 决策表、CSS 陷阱修复、Planner MVP、DOM 测量要点）
- **渲染工具链陷阱 → `references/layout-intelligence-pitfalls.md`**（Python hash() 随机化、recipe 单系列契约、UI_CHART_PALETTE、policy device 隔离、region id 契约、Mobile iframe 模拟器、Card Mode 9 陷阱）
- **架构冻结结论与 Skill 设计文档（桌面临时目录，非 Skill 内）**：`D:/hpy/桌面/日常临时会话/layout-benchmark/ARCHITECTURE-FREEZE-REPORT.md`（九层职责/目录审计/依赖地图/冻结验收问答）与 `SKILL-ARCHITECTURE-DRAFT.md`（产品化设计 12 问）；渲染工具 `content-benchmark.py`（Renderer+Benchmark 合一）与 `layout-planner.py`（Planner 验证）同目录，**未合并**，`render.py`/`benchmark.py` 是 Future 未落地
- 移动端/评审布局 → `references/mobile-spec.md`
- 增量修改/迁移 → `references/patch-workflow.md`
- 完整陷阱库 → `references/pitfalls-complete.md`
- 标注 → `references/annotation-workflow.md`
- PRD 差距分析 → `references/prd-gap-analysis.md`
- 死代码审计 → `references/dead-code-audit.md`
