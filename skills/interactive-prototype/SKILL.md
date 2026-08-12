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
- `references/patch-workflow.md` — 增量修改方法论；`references/dead-code-audit.md` — 死代码审计
- `references/antd5-primary-override.md` — 全站 AntD5 主色覆盖；`references/detail-edit-page-layout.md` — 详情/编辑页布局
- `references/visual-reference.md` — 视觉风格参考（Ant Design Pro 整站 demo 源、配色偏好 #1677ff/#e6f4ff）；**视觉风格类改动先给参考再动手**
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
   └─ 持续迭代/多页/业务项目 → 组件化 Pipeline（第 3 章）
```
- **进入某一模式后，不得中途混用另一模式的规则**（组件化模式的 pages/dist 规则不适用于单 HTML；单 HTML 的 ui-system 流程不适用于组件化日常修改）
- 3 次以上修改 / 要迭代 → 默认组件化；做完就扔 → 单 HTML；不确定 → 默认组件化

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
- 判断：PC 视口默认；Mobile 需 375/390/430 三档（用 iframe 模拟器，`window.resizeTo` 无效——2026-08-11 实测）
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
- 先 `grep -rn "renderAppSidebar" pages/*.html`：有自定义菜单渲染 → 改 02 页 `renderAppSidebar()` 的 groups 数组；无 → 才改 proto-config.json 的 menu
- **菜单改名/新增必须同步 4 处**：① proto-config.json ② renderAppSidebar groups ③ 页面第 1 行 `PAGE_META.title`（switchPage 用标题查路由）④ `renderAppBreadcrumb('组','页名')`
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

### 3.6 工作流程
- **新建原型**：确认平台/模板/交互范围/数据量 → 创建 proto-config.json + pages/（含 _shared.html）→ 编写 → 构建 → 验证
- **增量修改**：用户说"改一下XX" → 先列 todo，逐个完成，做完自检，构建验证。改动落点：页面 HTML/交互 → pages/xxx.html；弹窗结构 → _shared.html；弹窗逻辑 → 业务页面；框架层 → 先说明等授权

### 3.7 Token 高效三阶段（读一次，想清楚，改一轮）
1. **侦查**：execute_code + Python 一次提取锚点坐标，输出摘要不读全文
2. **读局部**：search_files 定位 → read_file(offset,limit) 只读改的 20-30 行；不读 Shell 模板全量
3. **一轮执行**：所有修改写进一个 Python 脚本按区域一次执行

### 3.8 验证（每次构建后必做）
> ⚠️ **verify-output.py 作用域**：`scripts/verify-output.py` 是 **build.py 组件化 Pipeline** 的验证工具，仅适用于组件化构建产物（dist/）。它检查 proto-page / 侧边栏 / 无外部 JS 依赖 / JS 语法等组件化 Shell 契约。**单 HTML Pipeline（第 2 章）不调用 verify-output.py**——单 HTML 按 2.5 组装清单允许 Lucide/ECharts CDN，且无 proto-page/sidebar 类名，运行该脚本会产生误报。
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
- 表格状态流转：操作后实时更新该行，**列数变化时同步更新所有 `tds[N]` 索引**
- 条件字段显隐：onchange 切换 `style.display`，提交时同步校验必填

---

## 5. 高频陷阱清单（完整库见 pitfalls-complete.md）

### JS 语法与执行
- **花括号不匹配 → 整个 script 块失效**：所有页面脚本合并进一个 `<script>`，任一页缺 `{`/`}` → 全部函数 undefined、页面无法切换。修改后必数 `{}` 平衡
- **onclick 引号嵌套冲突**：单引号与外层冲突 → SyntaxError。用 `&apos;` 或反引号
- **IIFE 内函数对 onclick 不可见**：`(function(){})()` 内函数需 `window.xxx = xxx` 暴露
- **模板字符串数字 id 变字符串**：`openDetail('${s.id}')` → `'1' === 1` false 静默失效。不加引号 `openDetail(${s.id})`
- **onclick 字符串传参 + 数字 id → 交互全失效（高频）**：`onclick="f('1')"` 内 `data.id === id` 永远 false。统一 `String(x) === String(id)` 辅助函数；验证必须真实 DOM click（`document.querySelector(...).click()`），不能只调函数
- **同名函数覆盖（后定义覆盖先定义）**：新函数撞旧函数名 → 旧交互点静默失效。排查 `grep -n "function 函数名" pages/*.html`；新函数独立命名
- **空数组 [] 是 truthy**：判空用 `(val && val.length > 0)`，不能 `val ?`

### 页面组件规范
- **"框架在但数据全空" → 先查 init 是否抛 ReferenceError**：用户说没实现 ≠ 真没实现。最常见：init 首次读取未 `var` 声明的变量。排查：browser console 跑 `protoShowPage('页面id')` 看报错 → `grep -rn "var XXX" pages/` 确认声明归属
- **跨页同名变量引用 → 逻辑静默失效**：合并作用域下引用别页变量不会报错，只读到别页初始值（`''`）→ 条件永不成立。引用"像自己的"变量前先 grep 全仓确认归属
- **私有树跨客户串数据**：分类兜底匹配 `themePath.indexOf(分类名)` 须带客户根校验（`themePath` 以客户根开头）
- **proto-page 外元素被静默丢弃**（Toast/页脚常见）；**新页面不自动激活**（首页才需自调用 protoShowPage）；**删/改 HTML 后必须清理引用它的 JS**（getElementById null → 异常中断全 JS）；**Tab 结构必须闭合**（数 div 平衡）
- **隐藏共享源模式**：共享数据/函数集中在某页（如 02 页 MOCK_RESOURCES/findRes/renderAppSidebar），其他页依赖其合并全局作用域。要"删"该页只能从菜单去入口，**不能删文件**；交接文档必须告知执行 agent 文件保留
- **共享数据数组不能直接改字段值**：其他页用动态统计驱动 Tab 计数，改了破坏统计。业务页建独立副本（RES_MGMT_TOPICS/PVT_MGMT_TOPICS）
- **同页双视图数据源脱节 → 切视图空白 + 统计 0**：列表和卡片用两套不关联数据。修复：重建数据让两视图同源，数字与实际条数一致
- **dist 中共享函数出现 2 次是正常结构**（壳 div + 组件 div + 末尾全局合并大块），勿误判重复注入；grep 计数注意子串误匹配，用 `grep -bo` 看偏移

### 表格渲染
- 动态渲染改 JS 模板/数据源，不能只改 HTML；批量加列后数 `<td>` 数量；tds 索引随列数同步更新；级联筛选三处缺一不可（下级初始空 + 上级 onchange + JS 填充下级），filter 和 export 弹窗都要实现

### CSS 与视觉
- tooltip 只用 `::after`，th 需 `white-space:normal !important` 防竖排
- grid 容器内块级元素横排变形 → 块加 `grid-column: 1 / -1`
- **局部状态切换不要整页重渲染**（用户纠正）：卡片开关只更新该卡 DOM（classList + 改节点），数据源同步改，不重渲染列表
- JS 生成的 HTML 用 shell 未定义的 CSS 类 → 下拉平铺无样式。核对可用 CSS 类清单
- **CSS 布局陷阱（aspect-ratio/max-height 冲突、align-self 收缩）→ 详见 `references/layout-intelligence-pitfalls.md`**（2026-08-11 Critic 实测，含修复 CSS；执行时遇媒体比例失真/区域收缩先查该库）

### 构建与编码
- **build.py 吞 `<script src>` CDN 标签**：页面里写 `<script src="...">` 会被静默丢弃（只提取内联 `<script>`）→ CDN 库必须 JS 动态加载（createElement('script')），详见 `references/ui-system-lucide-migration.md`
- **HTML div 不平衡 → build.py 静默产出空页面**（不报错、构建成功、页面空白）。排查：浏览器元素全 MISSING → 查 dist 该页内容长度（len≈2）→ 源文件 div 深度扫描
- **pages 目录禁止 `.bak.*.html`/临时 HTML**：build.py glob("*.html") 扫入当页面 → dist 重复两遍。备份用 git 或改 `.txt`
- **脚本生成 JS 数组元素必须带逗号**：漏逗号 → node --check 报 `Unexpected token '{'`（报错在漏逗号元素的后一行）
- **正则重写 JS 大数组会吞数组后的声明（最严重）**：`re.sub(r'var X = \[.*?;\])` 锚点不精确会静默删数组后的 var 声明 → 运行时 `X is not defined` → 页面全空。安全规程：替换前 count 锚点唯一；替换后 git diff 审查所有 `-` 删除行
- **正则替换字段后必须 grep 实测**：group 边界不含闭合引号会静默丢引号（替换计数正常但数据已坏）
- build.py 写文件必须 `newline=''`（CRLF 污染 `\n` 正则致 JS 崩溃）；str.replace 注意 `\r\n`、unicode 转义、区域边界
- 修改源文件前先备份（git 或 .bak.txt）

### 其他
- **浏览器验证作用域（模式限定）**：组件化增量修改默认**不主动**截图验证（改完告知用户查看，用户明确要求才用）；**单 HTML Layout Intelligence Pipeline 必须执行 Step 8 Screenshot + Step 9 Critic**（这是该流程的硬性要求，见第 2 章）
- **browser_vision 视口裁剪误报字段缺失**：视觉截图只确认布局是否变形，字段存在性用 DOM 实测（两者矛盾以 DOM 为准）
- **预览同步（GitHub Pages）**：完整发布规程见 `references/github-pages-publish.md`；**⚠️ 必须等用户明确说「同步预览」才执行（2026-08-10 用户纠正）**——源码 push 不会自动更新预览仓

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
