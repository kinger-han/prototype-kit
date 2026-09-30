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

> 本文件是操作协议。视觉/布局/组件知识在 `ui-system/`（Source of Truth），引用一律写路径，不摘录内容。

参考文件（按需加载，不预读）：
- `ui-system/` — UI 设计系统（唯一视觉规范）：tokens.css / rules.md / registry.json / templates/ / themes/ / devices/ / content/ / components/ / icons/ / charts/。**单 HTML 原型视觉必读**
- `ui-system/layout/` — Layout Intelligence 层：layout-tokens.css / layout.css / planner.md / critic.md / policies/ / skeletons/ / benchmark.md
- `references/layout-intelligence.md` — LI 架构详解；`references/layout-intelligence-pitfalls.md` — 渲染工具链陷阱库
- `references/e2e-validation-2026-08-11.md` — 单 HTML Pipeline E2E 验证记录（srcdoc 模拟器 + md5 基线技巧）
- `references/pitfalls-complete.md` — 组件化旧陷阱全量库（第 5 章是其精简执行子集）
- `references/annotation-workflow.md` — 标注系统 V4（标注任务必读）
- `references/github-pages-publish.md` — GitHub Pages 发布规程（预览同步必须等用户明确说"同步预览"）
- `references/ui-system-lucide-migration.md` — Lucide 图标落地；`references/mobile-spec.md` — 移动端规范；`references/taizhang-page-style.md` — 台账/列表样式
- `references/mobile-custom-shell.md` — 自定义移动端 shell（全面屏居中、仿真状态栏、真实机型比例）
- `references/patch-workflow.md` — 增量修改方法论；`references/dead-code-audit.md` — 死代码审计
- `references/batch-operations-pattern.md` — 列表页批量操作模式（列表页加批量操作必读）
- `references/editable-table-pattern.md` — 可编辑录入表模式（含行级可编辑性门禁三态；做逐行填写清单表必读）
- `references/topic-mgmt-v2-notes.md` — 主题管理V2结构速查
- `references/style-derivative-works.md` — 同底片衍生作品合并展示模式
- `references/antd5-primary-override.md` — AntD5 主色覆盖；`references/detail-edit-page-layout.md` — 详情/编辑页布局与返回机制
- `references/visual-reference.md` — 视觉风格参考（#1677ff/#e6f4ff）；视觉风格类改动先给参考再动手
- `references/element-ui-legacy-doc-fetch.md` — Element UI 老系统规范核查/UI交接；`references/element-legacy-style-rebuild.md` — 老版 Element UI 样式重构执行规程
- `references/ai-design-prompt-template.md` — AI 设计工具提示词六段式模板
- `references/page-js-debugging.md` / `references/js-interaction-traps.md` — JS 排查与交互陷阱
- `references/prd-gap-analysis.md` — PRD 差距分析
- `references/ai-failure-states.md` — AI 生成功能失败态设计规范（设计/排查「生成失败」界面必读）
- `references/demo-asset-sourcing.md` — 真实素材获取与合规筛查（政务/党建/学校项目必读）
- `references/ai-chat-streaming-pattern.md` — AI 问答页流式输出与结构化回答卡（做「AI 正在生成」界面必读）

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
   ├─ 纯视觉美感探索（无现成原型）→ 不建 HTML，走 skill:ui-design-image-workflow 生图路径
   └─ 汇报演示型单文件原型 → 见下「演示型单文件原型」
```
- 进入某一模式后不得混用另一模式的规则
- 3 次以上修改 / 要迭代 → 默认组件化；做完就扔 → 单 HTML；不确定 → 默认组件化
- **用户说"不要用 shell 模板 / 用已有产物样式" ≠ "退出组件化改单文件"**——指换壳形态（全面屏居中壳），不是换构建模式。判据：明确说"分页/拼合/组件"才算模式变更；涉及 shell/模板/页面结构的表达一律出确认卡

### 演示型单文件原型（第 4 种模式）

**判据**：产物是给客户/领导看的演示页（左手机 + 右说明栏），不读 ui-system，客户定制视觉 + 单文件手写。

- **版式**：左半屏手机 `position:sticky; top:0; height:100vh` + 右半屏信息区（页面导航可点直达 + 核心能力 / 功能亮点 / 竞品差异）。与 mobile-custom-shell 被拒的 review-shell 是两个不同产物，别互相套用
- **缩放**：375×812 原样写，外套 `transform:scale(.82); transform-origin:top left` + 同尺寸占位 wrapper（只写 transform 不加 wrapper，父级 flex 按原尺寸布局留大片空白）；给「适应屏宽 / 100%」两档切换
- **路由**：`.page{display:none}` + `.page.active{display:flex}`，`go('id')` 切页并同步 tab 高亮
- **所有可见可点元素必须有反应**：真跳页、弹层或 toast，不许死按钮
- **演示页不放「修改记录/改动说明」**：只放功能亮点 / 竞品差异 / 核心能力
- **带参跳页 + 替用户执行一步会撞上目标页自动播放**：初始化函数加 `autoPlay` 开关，程序化进入先 `inited=true; init(false)` 再注入；不要用"调大延迟"绕过
- **交付前技术自检**：① 抽出 `<script>` 过 `node --check` ② `<div` 与 `</div>` 计数相等 ③ `go('x')` 与 `id="p-x"` 双向差集为空（弹层同理）
- **交付前截图自检**（skill:headless-web-capture）：完成态 + 进行中态两张，vision 评审后再发
- **逐页评审/换模型评审的交付形态**：① 自己先批量截好图再交（不让子 agent 自己跑 Edge）；② 按并发上限均分，每份 ~5 页（防 child_timeout 硬切断）；③ 每份 context 自含产品背景 + 用户画像 + 产品红线 + 输出格式与严重度分级；④ 子 agent 调 `vision_analyze` 走辅助视觉模型，纯文本模型也能做，但 context 必须明写"逐张调该工具"；⑤ 汇总成一份再交
- **迭代期收到「这里不对」先核实他看到的是不是最新渲染**（预览面板/CDN 缓存会让截图落后文件一代）

### 修改原型的正确流程（模式限定，必须遵守）
- **组件化模式**：只改 `pages/*.html`（弹窗结构改 `_shared.html`，弹窗业务 JS 留在对应页面）→ build.py 重建 dist（禁止直接改 dist）→ 浏览器验证
- **单 HTML 模式**：只改当前任务产物，不套用 pages/dist 规则
- **提交**：改完检查 `git diff`；是否 commit/push 按用户要求或项目既有流程，不默认自动 push

### 只改用户明确要求的内容
- 没提到的逻辑/字段/交互不擅动；影响其他页面先说明；"同步/对齐"类需求先确认方向
- **用户给「最终内容/定稿文案」清单 = 整页替换语义**：清单外既有小节删掉，不留页面尾巴；只说"改一下 X 段"→ 只改那段。删除必须可见：报告里单独列出删掉的小节 + 恢复口径

### 原型改动不顺手改 PRD，差异进「待更新清单」

口径差异一律**追加**到 `<项目>/docs/PRD待更新清单.md`（按批次编号），写「改了什么 + 业务原因 + 原口径」；PRD 本体只在用户明确说「更新 PRD」时才批量落地，此时 grep 全库旧口径一并改净。

### 引用页面一律带人类可读的名字
任何提到页面/章节/列的地方写「菜单名（文件序号）」如「资源审核（04-resource-audit.html）」，不裸报序号。

### 历史遗留的技术约束：原型里不暴露，用提示带出所需值
约束源自"系统当初怎么实现"→ 提示级（如上传框提示「需与视频同名：〈视频文件名〉.jpg」），不做校验；源自"业务本来这么规定"→ 才做校验。报告里把「约束」与「建议」分开讲。

### 结构 / 入口类需求：先查已定决策，再给判断
1. `grep` PRD 与《页面改动交接说明》找已定决策与历史回退记录；引不到原文就明说"这是新增提议，需你拍板"
2. 判断把**时机**（用户此刻有无做判断所需信息）/ **定位**（平级还是增值、会不会分流）/ **代价**（数据模型/路由/审核链路动不动）三条分开讲

用户说「做之前先分析下」= 只出结论 + 依据 + 代价 + 替代方案，不动代码；分析要指出方案本身的问题，给一次判断，用户没采纳就按用户口径执行。

### 状态机 / 审核颗粒度类改版：先定「阶段边界表」再设计
不把审核规则套到整条业务流——同一条流程常被一个闸门切成两段，两段形态可能相反：

| 段 | 判定问题 | 形态 |
|----|---------|------|
| 闸门之前 | 产物还没定型？ | **批量门禁**（整批通过才放行） |
| 闸门之后 | 已成为长期资产？ | **单条独立** |

- 方案里单独写一行「A 段 = 批量门禁，B 段 = 单条独立」请用户确认
- 「XX 之后自动流转到 YY」常是背景业务流、不是本轮范围——没出现在清单里的环节先问
- 退回类页签要独立拆出，退回项带**责任人**字段，权限判据一条 `责任人 === 当前用户`
- **外部角色（客户/甲方）审核 = 外部轨道不是流程节点**：状态由"发起"动作推进，不自动流转；引入「审核单」聚合（一批内容 = 一个单 = 一个链接），内部审核页加一级切换（内部 | 客户）
- **共享状态推进函数按归属类型分支**：函数签名加对象参数判类型，所有调用点一并传；改状态词前 `grep -rn` 全量盘点（筛选 option / 待办统计 / 色板 / 审核日志 / 退回目标 / 初始状态 / 演示数据七八处各存一份），改完 grep 确认剩余命中全是另一类；回归验证直接逐阶段打印两条链路
- **审核列表页签按「人」切不按状态切**：待审核=当前环节处理人是我；已审核=操作记录里出现过我的审核类操作（非按终态筛）；被退回=状态含退回+在我客户范围。「已审核」状态列显示流程当前状态是正确表现别去修正；管理员开特判；演示日志操作人必须与 ROLE_DEFS 对齐。验证：逐角色切换打印各页签行数，数字应各不相同——四角色一样或恒为 0 = 过滤没生效

### Demo 范围与产品形态（SDD/PRD 起手时先怀疑它的隐含主体）
- SDD 的隐含主体 ≠ 产品正确形态。判据：首屏主体是「可浏览的内容」还是「需要组织语言的行为」——展馆类=可浏览内容，问答只是服务层，服务层入口不占平级大卡位
- 分专题时每个补一句「实体场馆做不到的什么」，答不出来就是换个壳的问答；内容形态必须区分：线性叙事 / 横向对比 / 轻内容卡
- **改了前台结构，同步检查后台配置页**，报告里点出后台待同步项；但用户说「先管前端」时后台一个字不动只记录
- **用户说"单薄" → 缺的是形式不是内容**：按「看/问/找/玩/做/听/说」七种形式盘点缺哪补哪
- **形式选型交付「可点击的样张页」不是文字方案**：每种形式做成可上手的核心交互，每节固定「解决什么 + 正式版还需要什么素材」两段；样张页不进主导航、标「待选」。对比滑块用原生 `input[type=range]` + `clip-path: inset(0 0 0 N%)`，不手写拖拽
- **推荐顺序按"哪个现在就能做成真的"排**，素材前提是第一判据
- **用户说"这版还是只有 X"先验版本再讨论**：可能是另一端、CDN 缓存或旧产物；本机预览面板同样会缓存，截图落后文件一代时先让刷新，不要照旧表现改代码

### 外部方案材料（用户丢来 docx/HTML 说「参考一下」）
- 先看材料自己的出处口径：注「部分内容由 AI 生成」的方案，品牌/功能清单都是未核实提议，不据此改原型
- 逐个核对硬信息（人名/职务/数字）；材料内部自相矛盾 = 没校对过，整体降级为待核
- 发现错误当面上报 + 项目文档留「正确口径 + 勿沿用错版」；比的是交付物性质（静态展示板 vs 可交互原型），再单独列「值得吸收的具体项」

### 大屏投屏联动（三端协同类）
- 机制口径：屏幕后台登记下发，联网即可接收，**不要求同局域网**
- 演示形态：投屏弹层列屏（含在线状态/当前播放）→ 选屏 → 投送中 → 成功并**回写该屏当前播放**（只弹 toast 等于没演）；放一块离线屏置灰；入口挂内容页，投送内容名动态拼

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

**用户一次给多条编号需求时的分流**：

| 类 | 判据 | 动作 |
|---|---|---|
| A 类 | 已写明怎么改 | 列「我的实现方式」表，等确认后一次性改 |
| B 类 | 带「给个建议/你定」 | 只出方案不动代码 |

- **找耦合项先定后改**：互相咬合的条目（同页面同逻辑）挑出来先定，明确用户只需回 B 类
- **B 类要给主见**：明确推荐 + 2-3 条理由，不罗列选项
- **视觉优化类不要只答「我改」**：先说清哪里不协调，再直接出 2-3 个 HTML 对照稿
- **用户提到「截图N」但消息无附件**：第一句说明没收到 + 写出你的理解

**大改版方案交付形态**：分层讨论稿 md 放项目 `docs/`，会话只贴结论与决策点。固定五段：① 结论+业务流图 ② 用户疑问逐条编号解答 ③ 我发现的问题清单 ④ 逐页修改清单（带菜单名）⑤ 「需要你拍板的决策点」分两档各附建议。确认完再动代码。

- **用户说「这是旧代码残留吧/这个功能删掉」**：第一动作是确认界面现状 + 对齐业务模型，不是深挖代码
- **用户说「做个示意图给我看看最终的」**：交付可打开的 HTML 示意图放项目 `设计对照/`，用 desktop_preview 打开；含区块划分、表头字段、能看出规则的示例数据；拿到确认再改原型
- **用户说「这次只改样式」就严格只动样式**；顺手清掉的死代码单独列行说明
- **视觉风格类改动先给在线参考 demo 再动手**（见 `references/visual-reference.md`）
- **自定义菜单需前置授权**：说明影响获授权后才可在 init_xxx() 里 DOM 重写侧边栏/面包屑

### 产物命名
`{项目名}-{系统模板}-原型.html`

### README 维护
新增/删除页面、重大交互、构建完成后主动更新 README.md。

### 单文件 vs 组件化
做完就扔 → 单文件；要迭代 → 组件化（3 次以上修改必须）；不确定 → 默认组件化。

### 原型交互模拟模式
点击立即 toast → setTimeout 1-2s → 改底层数据 + 重渲染 → 完成 toast。不要只弹 toast 不更新数据。

### 演示数据单一来源
新增页面/功能需要数据时先找已有共享源派生，不另造一份（共享数据/函数集中在共享数据页）：
- **通用素材**（预览图/占位图/视频底图）→ 共享页一处词表 + 取数函数，页面禁止再写 `assets/img` 字面量数组
- **业务实体** → 只在共享页定义一次，下游用「按实体字段查表 + 派生明细」取数；列表行、数量、统计都从派生结果算
- **小词表**从已有角色表推导，不另列
- **判据**：业务事实进共享源；页面自己的交互状态留在页面里
- **新建演示实体先核对池子的键分布**（`Counter` 一下），派生条数 == 期望条数，不等就改键清单，不手写凑数
- 收口后同步更新项目 README「关键实现约定」
- **真实素材优先本机素材库**：`D:\hpy\桌面\数熙相关文档\测试用资源\`（按主题分目录），用户说"图片用真实的"直接取用

---
## 2. 单 HTML 生成流程（Layout Intelligence Pipeline）

> 适用：一次性小原型。必读 ui-system/ 相关文件，按流程执行，禁止跳过 Planner 直接写 HTML。

### 2.1 总流程（12 步）

```
Step 1  初始化 + Page Model：读 ui-system 三件套（README/rules/registry）→ {page_type, device, theme, media, size, density_intent}
Step 2  Device + Theme：读 devices/pc.json|mobile.json + themes/default/theme.json
Step 3  Template：读 templates/<page_type>.json（regions/variants）
Step 4  Content Model：读 content/content-schema.json，真实业务数据照实填充（长标题/空字段不清洗）；同一数据 PC/Mobile 共享只改呈现
Step 5  Layout Planner：读 layout/planner.md + policies/*.json → Layout Directive
Step 6  Component：按 registry.json → components/*.html + layout.css 原语类
Step 7  Renderer：组装单 HTML（组装清单见 2.5）
Step 8  Screenshot：真实 viewport（Mobile 375/390/430 用 iframe 模拟器）
Step 9  Critic：读 layout/critic.md，18 类检查取 DOM 数值证据 + Score
Step 10 Fix ≤2 轮：先判根因归属层（见下），复检 Step 8→9
Step 11 交付：HTML 路径 + Score + Human Review Checklist；有真实数据用真实数据验证
Step 12 记录：work-tracking 规范写工作日志（有产出才写）
```

- **读取纪律**：按 Pipeline 步骤按需读取，禁止一次性加载整个 ui-system；需求模糊时最小澄清
- **AI 决定意图，系统决定几何**：AI 只选意图字段（禁 width:65%、禁任意 px、禁 absolute 布局、禁媒体查询）
- **禁止临场重新设计 UI**：只选择与组合，不发明新视觉原子
- Step 7 运行时为 `content-benchmark.py`（Renderer+Benchmark 合一）与 `layout-planner.py`，在 `D:/hpy/桌面/日常临时会话/layout-benchmark/`；`render.py`/`benchmark.py` 未落地勿假装可用

### 2.2 Step 10 Fix：先判根因归属层，再决定是否 Fix
- **冻结层**（Runtime/Template/Theme/Component/Device/架构冻结）：不通过改 Content/Directive 规避真实缺陷，输出 defect report（Issue+Evidence+Root Cause+所属层+建议修复层）→ 交付或报告
- **可修改层**（Directive/Content/renderer 参数）：按 issue type 路由——ratio mismatch→改 preview_class/max-height；overfilled→加 panel-scroll/降密度；underfilled→顶部对齐（禁止拉伸补装饰）；action-overflow→折叠更多；long-title→换行/split 升一档（仅 Directive 层）；layout-shift→图表容器固定 min-height
- **禁止**为 Score≥0.8 人为绕过（删内容/改阈值/隐藏区域）；2 轮后仍 <0.8 停止并报告

### 2.3 Layout Intelligence 架构（冻结职责边界）
> 具体布局数值（split 档位/媒体比例映射/max-height/密度档）读 `ui-system/layout/planner.md` + `policies/*.json`，不在本文件保存。

| 层 | 决定什么 | 不决定什么 |
|---|---|---|
| Template | 页面结构（regions/variants） | 视觉、空间分配 |
| Layout Pattern | 空间骨架（split/grid/stack/master-detail/preview-inspector/sidebar-content） | 页面业务结构 |
| Theme | 视觉语言 | 页面结构、布局 |
| Component | 具体 UI 元素 | 页面组织 |
| Device | 端适配 | 视觉、业务 |

生成顺序：Device+Theme → Template → Layout Pattern → Policy → Directive → Component → Renderer → Critic(≥0.8)

铁律：① AI 决定意图系统决定几何 ② AI 不写裸几何 ③ 生成后必跑 Critic 自检（<0.8 修正 ≤2 轮）④ 同一 Template 可切 Theme、有 PC/Mobile Variant ⑤ media-ratio-policy 已通用化，映射在 policy 文件不写死

扩展：新增 Template/Theme 零改动 Skill；禁止为单个页面改核心 Template/Theme/Component；发现架构缺口先报告（问题→影响→严重度→方案）。

### 2.4 Mobile Card Mode（冻结）
- 触发：模板 mobile variant `region_rules.table.card_mode=true`
- 机制：同一数据模型只改 presentation；Card 结构：主字段标题 → ID 副信息 → 状态 Tag → ≤4 次要字段网格 → Actions
- CSS 在 `layout.css` 第 10 节；渲染在 Runtime；陷阱见 `references/layout-intelligence-pitfalls.md`

### 2.5 单 HTML 组装清单
1. `<style>` 内联 tokens.css 全文 → layout-tokens.css → layout.css → 各组件 `<style>`（去重）
2. 页面结构 HTML（`ui-*` 类名）
3. Lucide CDN + 页面底部 `lucide.createIcons();`
4. ECharts CDN + 拷贝 Recipe 函数 + setOption
5. 业务 JS；无构建步骤，直接打开

### 2.5.1 单 HTML 验证链（不调用 verify-output.py）
verify-output.py 是组件化 Pipeline 的验证工具，检查项与单 HTML 契约不符（单 HTML 允许 CDN、用 `ui-*` 类名），运行必误报。单 HTML 用自己的验证链：
```
standalone HTML → 结构/自包含检查 → Browser render → Screenshot → DOM Critic（critic.md，DOM 数值证据 + Score）
```

### 2.6 Fallback 顺序
```
Page Template → 复合 Pattern → Component → 已有组件新组合 → 最后才生成缺失结构
```
允许新「组合」，禁止新「视觉原子」；临时结构仍必须用 tokens + icon registry + chart recipe。

### 2.7 核心禁止项（详见 ui-system/rules.md）
禁止 Emoji/文本符号当图标；禁止 gradient/glassmorphism/大面积彩色背景/发光；禁止现场画 SVG、发明 Icon Name、自定义图表视觉；禁止为单个页面修改核心 Template/Theme/Component。

---

## 3. 组件化构建流程（build.py）

### 3.1 proto-config.json
```json
{ "name": "智融平台", "template": "pc", "logo": "智",
  "theme": { "primaryColor": "#1890ff", "layout": "side-top" },
  "menu": [{ "group": "智能导游", "icon": "dashboard", "items": [{"id": "user-mgmt", "title": "用户管理"}] }] }
```
移动端：`"template": "mobile"` + `tabBar` 数组。icon 必须来自 `ui-system/icons/registry.json`，禁止 Emoji/自创名称。

### 3.2 页面组件格式
```html
<!-- PAGE_META: {"id": "user-mgmt", "title": "用户管理"} -->
<div class="proto-page" id="page-user-mgmt">...</div>
<script>
function init_user_mgmt() { /* 渲染逻辑 */ }
</script>
```
- `init_xxx()` 必须有，否则切页空白；HTML 必须放 `.proto-page` div 内（外面被静默丢弃）
- 仅首页自调用 `protoShowPage('xxx')`；其他页不自调用（多处自调用互相覆盖）

### 3.3 自定义菜单渲染
动手前 `grep -rn "renderAppSidebar\|menu-item\|proto-config" prototype/pages/*.html prototype/shell-*.html` 判定形态：
1. **renderAppSidebar 自定义渲染**：改它所在页（通常 02 页）的 groups 数组
2. **proto-config 驱动**（默认模板）：改 proto-config.json 的 menu
3. **shell 硬编码菜单**：菜单写死在 shell 的 `.sub-menu` 里，proto-config 只是摆设。菜单重排=改 shell 内 menu-item 顺序
- **shell 硬编码形态下菜单改名/新增同步 4 处**：① shell menu-item 的 onclick 标题+显示文本 ② 页面 `PAGE_META.title`（build 注入 `_pageTitleToId={标题:pageId}` 路由映射，匹配不到静默不切页）③ proto-config.json（不渲染但保持一致）④ 面包屑 `<span class="current">`
- **「某角色要能看到 X 菜单」先查页面是否存在再查注册**：页面常早已做好、只是没挂菜单。`grep data-page-id` 找页面 → grep proto-config 找注册，缺哪环补哪环。新菜单 group 按业务先后排；加完同步按角色的菜单可见性函数，否则非管理员看不见
- **菜单占位项**：shell 加 menu-item 用**专用函数**而非 `switchPage('标题', this)`（占位页无 PAGE_META 不进映射，静默不切页）；shell content-area 内手写占位 `<div class="proto-page" data-page-id="...">`（必须手动加 data-page-id）；专用函数 = `_origSwitchPage('标题', el)` + 按 data-page-id 显隐
- 浏览器标签 `<title>` 在 shell 模板里，改需授权

### 3.4 共享弹窗组件（pages/_shared.html）
`_` 开头文件 → 共享组件：不进菜单/路由，内容追加到 `#main-content` 末尾。**只放弹窗 HTML DOM，不放业务 JS**——open/close/submit 函数留在触发弹窗的业务页面（构建合并为全局函数）。结构变化改 _shared.html、逻辑变化改业务页，重建自动同步，不需要 patch dist。新增 `_` 文件前检查历史遗留同名文件；容器闭合标签在所有共享组件追加后才闭合。

### 3.5 构建命令
```bash
PYTHON="D:/HermesData/hermes-agent/venv/Scripts/python.exe"
BUILD="D:/hpy/文档/ObsidianVault/06-资源/模板/prototype-kit/build.py"
"$PYTHON" "$BUILD" pc --project-path="<项目目录>"              # 仅 PC
"$PYTHON" "$BUILD" pc --project-path="<项目目录>" --with-annotations   # 带标注版
```
**terminal 执行含中文长路径的构建命令可能触发 lifecycle_guard 崩溃**（`open: embedded null character`，命令带 `2>&1 | tail` 管道时概率更高）。兜底：execute_code 内 subprocess 运行。

### 3.6 工作流程
- **新建原型**：确认平台/模板/交互范围 → proto-config.json + pages/ → 编写 → 构建 → 验证
- **增量修改**：先列 todo，逐个完成，构建验证。落点：页面 → pages/xxx.html；弹窗结构 → _shared.html；弹窗逻辑 → 业务页；框架层 → 先授权
- **委派失败后接手前先查工作区**：`git status` + 页面 mtime——可能已有完整改动；`git diff` 审查 → 验收 → 补遗漏 → commit，不凭"委派失败"就重做。delegate_task 超时典型形态：600s 硬超时、零文件写入
- **委派子 agent 做 UI 还原**（用户点名执行者时以用户为准）：
  - 附件必须用 `images` 参数随任务签发——只在任务文本给路径，子 agent 凭文件名编内容
  - 真实素材写死来源目录与取图规则；中文/空格路径用 `shutil.copy2`
  - 产出先落独立对照稿给用户确认，再集成进项目
  - 临时切 `delegation.model` 前 `cp config.yaml config.yaml.bak.<时间戳>`，做完改回
  - **验收不轻信自报**：文件存在 + `node --check` + 按内容全高复截一张；vision 的视觉抱怨先回源码核对（多为误报）

### 3.7 Token 高效三阶段
1. 侦查：Python 一次提取锚点坐标，输出摘要不读全文
2. 读局部：search_files 定位 → read_file(offset,limit) 只读 20-30 行
3. 一轮执行：所有修改写进一个 Python 脚本一次跑完
- **侦查够用即开干**：定位到主锚点、方案可行后立即动手；批量文本替换直接写 Python 脚本一次跑完，不逐文件手工 patch

### 3.8 验证（每次构建后必做）
verify-output.py 仅适用组件化产物。
1. `"$PYTHON" .../interactive-prototype/scripts/verify-output.py dist/`
2. JS 语法：抽 `<script>` → `node --check`（verify-output.py 已含，二选一）。**提取必须按 `<script>` 的「属性段」判外部脚本**：`re.findall(r'<script([^>]*)>(.*?)</script>', s, re.S)` 再滤 `'src=' not in 属性`；若改用「脚本体前 N 字符不含 src=」过滤，含 `img.src=` 的文件会被**静默跳过**——漏检不报错，最危险
3. 结构：`</html>` 闭合、div 平衡、无残留旧代码
4. 功能：菜单数量、页面切换、核心交互
5. **元素 id 完整性**：`scripts/find-missing-element-ids.py <项目目录>`——改完弹窗/详情页必跑（丢 id 弹窗静默打不开）
6. **符号完整性**：`scripts/scan-page-symbols.py <项目目录>`——死函数/断链盘点，改完页面结构、删函数、清洗菜单后必跑
7. **运行时探针**：`scripts/headless-probe.py <产物.html> --page <路由名> --sel "<选择器>" --call <处理函数>`——Edge headless 真跑产物抓运行时异常，改过页面 JS 后必跑；用户报「数据没了/点按钮没反应」先用它定位再改代码。**表达式选择器一律加 `#page-<路由名>` 前缀**（产物是多页合并文档，全局类选择器会选进别页元素）

### 3.9 调试速查：「页面无法切换」
根因几乎总是 JS 语法错误（一个 SyntaxError 使整个合并 script 块失效，所有函数 undefined）。`typeof switchPage` → undefined 则抽 script → node --check 定位。

---

## 4. PC 端企业后台规范（build.py 组件化项目）

> 作用域：build.py 组件化项目（页面必须匹配 shell 已有类名，禁止自定义全局样式）。新建单 HTML → 走第 2 章。

### 可用 CSS 类（匹配 shell 已有类名）
- 布局 `.page-header/.page-title(.sub)`；筛选 `.filter-bar/.filter-item/.filter-label/.filter-select/.filter-input/.filter-btn(.primary)`
- 表格 `.table-card/.table-toolbar/.toolbar-btn/.toolbar-search`；状态 `.badge-status(.active/.disabled)`
- 操作 `.action-btn(蓝字链接)/.action-btn.danger`；分页 `.pagination/.page-info/.page-btns/.page-btn(.active)`
- 弹窗 `.modal-overlay(.show)/.modal/.modal-header/.modal-body/.modal-close`
- 信息 `.info-grid/.info-item/.info-label/.info-value`；表单 `.venue-form/.form-row/.form-label/.form-control`
- 导出 `.export-modal/.export-form/.export-row/.export-note/.export-actions`；确认 `.confirm-overlay/.confirm-box/.confirm-btn(.danger)`
- 更多菜单 `.more-menu-wrap/.more-menu(.show)/.more-menu-item(.danger)`（shell 未定义则下拉平铺）

### 规则速查
- 行内操作只用文字链接（action-btn），禁止带边框按钮
- 导出弹窗放 _shared.html，打开时同步当前筛选条件
- **PC 约定：不要页面标题/副标题，不要「共X条」统计**；删 page-header 后按钮重排到 filter-bar 行
- 类别筛选触发按钮与 `.filter-select` 视觉统一，浮层面板 340px；树形单选 ○/●，叶子可取消
- **「模糊搜索+下拉选择」二合一控件**：面板项绑 **`onmousedown`** 不是 onclick（焦点在输入框时 click 收不到——「下拉点了没反应」的头号原因）；面板外收起用 document click + closest 判归属；筛选判定不要复用带兜底的取数函数（等于条件恒真），另写严格匹配谓词
- 下拉 hover 浅蓝底、选中主色（AntD5 标准），色值见 visual-reference
- **详情/编辑返回必须回来源视图**：跳转前记 `*_RESTORE`，恢复代码写在 init 所有默认赋值**之后**（插在前面会被默认赋值覆盖 → 症状「返回没反应」）；多入口统一走一个包装函数存状态。验证断言返回后的状态变量 + 页签高亮
- **列表卡片的「状态胶囊」只做展示**：切换操作走「更多」菜单，同一状态的操作入口全站只保留一处；胶囊不挂 onclick
- **只读/无权限入口直接「不渲染」，不要渲染成禁用态**：动作在该阶段根本不存在 → 整块不输出；只是暂时不可用 → 才用禁用态+setter 守卫。状态标识用行左侧色条 `box-shadow: inset 3px 0 0 <色>`，不把标签塞进已有单元格；整表只读时连标识都不要。三态配方见 editable-table-pattern
- **操作交互优先本页弹窗不跳转**：跨页函数 + _shared 弹窗 + 全局数据可直接调
- **PC 端「新增/编辑/详情」一律弹窗，禁止独立 proto-page**：独立页在 build.py 合并工程里不可靠（切过去内容空白）。弹窗 DOM+JS 放页面组件内部；**多页共用弹窗时全局函数名必须唯一前缀**（shell 与页面同名函数会互相覆盖，点击变无限递归）
- **移动端返回栈语义**：返回按钮必须 `historyBack()`（pop 栈），禁止写死 `goXxx()` 固定跳转（会二次 push 栈，永远回不了首页）；顶层入口函数重置 PAGE_STACK；结果页内的子页走 showPage 保留栈
- **UI 图还原（MIMO 识图）**：字号对齐项目规范（PC 内容 13-14px），设计稿字号偏大不盲从；空状态不塞固定 max-height 容器；**列表类截图复刻以截图表头单元格为准**（旧页拆列方式可能不同，照旧页改必被退回）；完整流程见 skill:mimo-vision-ui-replica
- 表格状态流转：操作后实时更新该行，列数变化同步更新所有 `tds[N]` 索引
- 条件字段显隐：onchange 切 `style.display`，提交时同步校验必填
- **用户给定详情/大图字段示例时逐字保留**：列表精简 ≠ 详情精简；删字段前 grep 是否被大图/详情/弹窗引用
- **模板卡片字段与 PC 管理列表同源一一对应**：卡片/列表新增展示字段前先问「这个字段 PC 端配置页有没有」
## 5. 高频陷阱清单（完整库见 pitfalls-complete.md）

### JS 语法与执行
- **花括号不匹配 → 整个 script 块失效**：所有页面脚本合并进一个 `<script>`，任一页缺 `{}` → 全部函数 undefined。修改后必数平衡
- **onclick 引号嵌套冲突** → SyntaxError，用 `&apos;` 或反引号
- **治本：新写交互不在 onclick 字符串里嵌参数**：元素写 `data-id`、`ondragstart="fn(event)"`，函数内 `ev.currentTarget.getAttribute('data-id')` 取值。`\'` 经多层转义被吞成空串，拼出非法语法 → 整个合并 script 块解析失败、全部页面空白（`Uncaught SyntaxError` + `protoShowPage is not defined`）。改完立刻 node --check
- **Python 批量写含 `\'` 的 JS 行：反斜杠在多层传递中被静默吞掉**。对策按优先级：① 优先"只删不加"——目标行已存在且转义正确时只删行不重写 ② 必须新写用 `chr(92)`/`chr(39)` 拼接，不在字符串字面量里写转义 ③ 写完立即抽 script 跑 node --check ④ 手修用单字符替换定点补，不反复重写整行。信号：该行引号数与预期不符、报错列号指向某个引号
- **Python 里写的 JS 目标行含裸标识符会被求值**：想在 JS 里写 `openResDetail(r.id)`，Python 字符串里直接拼 `r.id` → `NameError: name 'r' is not defined`（脚本在写盘前就炸）。JS 侧标识符必须落在引号里——先定义 `Q = chr(39)` 之类的常量，用 `Q + ' + r.id + ' + Q` 拼接；整行含引号的复杂片段一律走 `chr(39)/chr(92)/chr(34)` 常量，不在字面量里手写引号与转义
- **同一卡片要在两处渲染时收成一个生成函数**：弹窗卡片函数 `return 主卡片函数(c)`，不各写一份（两份必然漂移）。配套：弹窗内取消勾选立即从弹窗消失——`toggleXxxSelect` 末尾判断弹窗开着再调一次渲染
- **模板字符串数字 id 变字符串**：`openDetail('${s.id}')` → `'1' === 1` false。不加引号 `openDetail(${s.id})`
- **onclick 字符串传参 + 数字 id → 交互全失效（高频）**：统一 `String(x) === String(id)` 辅助函数；验证必须真实 DOM click，不能只调函数
- **同名函数覆盖（后定义覆盖先定义）**：排查 `grep -n "function 函数名" pages/*.html`，新函数独立命名
- **空数组 [] 是 truthy**：判空用 `(val && val.length > 0)`

### 页面组件规范
- **新增功能元素不得改变原有字段展示**：辅助控件作为独立绝对定位元素挂外层根，不插进已有内容子容器；改后 git diff 确认字段行未变
- **"参考 XX 页" = 样式+位置+交互三样对齐参照页，让本处吐参照页的类名**，不是抄一份 CSS（抄了必然两处漂移）。两处必查：① 先 grep 定位该类定义在哪一页（build.py 合并各页 `<style>`，样式类可在任何一页定义）② 只换容器类名 ≠ 完成，逐个子元素核对字段集
- **用户没点名参照页时先搜共享层再决定新写**：合并作用域下通用交互几乎都已存在（大图预览/一键上屏/toast/标签弹窗），动手前 grep 扫一遍，命中直接调；状态标签先找同类卡片已有 CSS 复用
- **"框架在但数据全空" → 先查 init 是否抛 ReferenceError**（首次读取未 var 声明的变量）：console 跑 `protoShowPage('页面id')` 看报错 → grep 确认声明归属
- **跨页同名变量引用静默失效**：合并作用域下读到别页初始值、条件永不成立；引用"像自己的"变量前先 grep 全仓确认归属
- **私有树跨客户串数据**：分类兜底 `indexOf(分类名)` 须带客户根校验
- **工厂函数不透传新增字段 → 渲染读不到（静默）**：加字段后 grep 生产者函数确认透传。反方向：消费方凭记忆读字段名（`r.title` vs 实际 `r.name`）→ TypeError 中断整个渲染函数（症状「表格空得连占位都没有+按钮没反应」）；写消费代码前先打开生产者函数核对字段名
- **proto-page 外元素被静默丢弃**；新页面不自动激活（仅首页自调用）；**删/改 HTML 后必须清理引用它的 JS**；Tab 结构必须闭合
- **弹窗「一直打不开」先查 getElementById 取到 null（存量静默 BUG）**：弹窗 DOM 在 _shared、触发 JS 在业务页，id 极易对不上。`getElementById('X').textContent = ...` 一抛错，后面那句 `classList.add('show')` 永不执行——症状「点击毫无反应、控制台无显眼报错」。跑 `scripts/find-missing-element-ids.py` 找差集；`resToast` 这类动态 createElement 豁免
- **反方向：跨文件重复 id → getElementById 取到别页那一个**（元素存在只是绑错，控制台零报错）。id 全局唯一是硬约束；find-missing-element-ids 查不出重复，新建/改名后额外跑重复扫描（全部 `id="X"` 按值计数 >1 即冲突），修法是冲突方改名并同步所有引用。判据：字段有 DOM 有样式就是没内容/点不动 → 先跑重复 id 扫描再怀疑数据
- **共享弹窗「确定/清除」按钮调固定全局函数 → 新页面接入必须补分派分支与本页处理函数**：症状「弹窗里正常、确认后外面无变化、零报错」——元素函数都在、只是作用于错误的状态对象。`grep -n "function confirmXxx\|RES_ACTIVE_SCOPE"` 查分派 if 链有无本页 scope 值。验证走真实路径（open → toggle → confirm）并断言弹窗外胶囊数 + 列表卡片数；直接塞数据再调渲染测不出这个 bug
- **_shared.html 事件引用的函数名 ≠ 业务页定义名 → 静默失效**：grep 两侧函数名核对
- **隐藏共享源模式**：共享数据/函数集中在某页时，删该页只能从菜单去入口，不能直接删文件。页面真要退场按「页面退役」转 `_` 前缀共享组件（`<style>`+`<script>` 全保留，丢 `.proto-page` UI 与页面身份）。**删任何页面前跑符号盘点硬门禁**：提取该页全部函数名 → 全站计数 → 逐条列出仍被谁引用
- **共享数据数组不能直接改字段值**（其他页动态统计会坏）：业务页建独立副本
- **改共享字段值前先 grep 全引用；底层语义仍被别页用时新建字段不改原值**：同一字段被两个「语义不同」的消费方用（展示值 vs 编号）→ 开新字段
- **删除共享集合条目必须先全量替换引用**：`grep -rn "被删id" pages/ shell-*.html` 全量盘点（含展示数据/默认值/PRD）；删除用正则按 id 锚整行（勿依赖整行文本——列对齐空格坑）；引用替换用短锚点，**先删行后换引用**（顺序反了把保留条目也换掉）；构建后 dist 验数据层 grep 归零
- **同页双视图数据源脱节 → 切视图空白 + 统计 0**：重建数据让两视图同源
- **业务规则要回查承载它的共享判定函数，别信「已做了」**：规则涉及「能不能选/进/带出」时先打开 `*Selectable`/`canXxx` 核对条件——实测谓词漏了条件、需求被当成交付但从未生效。改一处即全站生效，不在调用点各写过滤
- **视图/分组枚举错数据词汇表 → 点进去全空**：动手前 grep 确认枚举字段与被枚举数据同源
- dist 中共享函数出现 2 次是正常结构，勿误判重复注入

### 弹窗/详情字段
- **选择类弹窗（分享/批量）的勾选只能由复选框触发**：卡片三类点击区——复选框 `onchange`（onclick 只 stopPropagation）；图片区开大图；文字区/卡片本体不挂 onclick。「查看」按钮语义是跳资源详情页（先关弹窗再 openResDetail），不是弹窗内看大图
- **卡片样式两分法（用户术语）**：**查看样式**=列表页信息全卡；**选择样式**=选择弹窗卡片减掉「查看」按钮。选择页页内用查看样式、选中后的弹窗里用选择样式。实现=吐参照页同一卡片类名
- **已选计数的可点范围＝只有数字**（加粗+同色下划线），整条文字不挂 onclick
- **共用弹窗/详情页字段必须覆盖所有入口列表字段的并集**：设计前枚举各入口表头字段，构建后 grep dist 确认每个字段字符串出现
- **弹窗表单字段「用户给什么就留什么」**：不要自己反复加回已删字段（数据层保留即可）；精简后同步清理 DOM/open 回填/save 读取三处

### 表格渲染
- 动态渲染改 JS 模板/数据源不能只改 HTML；批量加列后数 `<td>`；级联筛选三处缺一不可（下级初始空+上级 onchange+JS 填充），filter 和 export 弹窗都要实现
- **删表内某列前先枚举「所有会渲染该列的行变体」**：同一张表被多个页签/状态复用，只有所有组合都为空才删列头；按页签分叉时表头与行单元格同步分叉（含 colspan）
- **PC 管理页新增字段 = 8 处同步**：表头 th / 数据数组 / 渲染行 td / 空状态 colspan / 弹窗表单 DOM / open 回填 / save 读取 / 新增 push。构建前逐项 grep
- **静态表格缺列（静默）**：th 数与 td 数不一致 → 整列消失。改静态表格后必须数 th/td 对齐
- **源文件正常但 dist 缺列 = dist 是旧构建**：源文件对就重建 dist，不改源文件

### CSS 与视觉
- **全屏预览层（大图/视频）的 z-index 必须高于弹窗遮罩 1000**（如 1100）：低于时从弹窗内部打开大图被压住，看起来像点击无效。该样式常在多个页面各写一份，改一处 grep 全站同步
- **验收判据看实际生效值不只看类名**：查弹窗打开有的用 `.show` 有的用 `style.display`；查页面切换看 `getComputedStyle(page).display` 不找 `.active`
- **表内可点文字统一「默认黑 + hover 蓝下划线」**，不做常亮蓝；多链接合并一条 hover 规则；纯文本改可点时 span 换 a
- tooltip 只用 `::after`，th 需 `white-space:normal !important` 防竖排
- **tooltip 被容器裁切 = 祖先 overflow:hidden**：修法改向下弹（`top: calc(100%+8px)`），不靠加大 z-index、不动容器 overflow。改动落在项目级 shell 时重建正常版+标注版 dist
- **负 margin 上浮的重叠卡放在滚动容器里会被裁掉**：修法把上浮层从滚动容器移出去，改成「头部图 → 上浮卡 → 滚动区」平级三子元素；父级不设 overflow。改完 grep 同类元素一次扫完（同一原型里「上浮压色块」常不止一处）
- grid 内块级元素横排变形 → `grid-column: 1 / -1`
- **状态 Tag「可点但克制」模式**：状态可点开详情时用 AntD Tag 风格 + `.status-link`（pointer + hover 加深 + 内描边 + 微上浮 + `›` 箭头）；新增=绿、合并=主蓝、终态普通 badge 不可点。CSS 放 shell `<style>`
- **折叠菜单收纳 + 置灰两层语义**：三点按钮触发 `.more-menu`，`disabled` 表终态禁用；置灰分清「功能弱化（可点低调）」与「终态禁用（不可点）」，动手前确认用户要哪种
- **局部状态切换不要整页重渲染**：卡片开关只更新该卡 DOM + 数据源，不重渲染列表
- **演示优先原则**：demo 避免真实系统才需要的自动化行为；状态变化用视觉表达。与「业务方要求按规则排序」冲突时以最新口径为准，且原型只做**看得见的那一个效果**，排序规则记进 `docs/PRD待更新清单.md` 不实做
- **主操作双按钮并列防沉底**：分享/提交等关键按钮与「保存」并列主操作区，文案字数对仗
- **原型效果最小化**：动作点击直接 toast 即可；画风/滤镜用简单 CSS filter 表达不做真图；常驻区块非必要不保留
- **政务移动端文案禁用内部术语**：「模板/素材/底片/原图」→ 用户视角「相框/纪念框/照片」；拿不准给 2-3 个候选让用户挑并标注字数（一行约 18-20 字 @12px）
- **示意缩略图不继承当前对象视觉，但也别把区分度改没**：按风格各给一个示意底色
- **置灰禁用 opacity/filter，用白色蒙层 ::after**：opacity/grayscale 创建新堆叠上下文，把卡内「更多」下拉困住被相邻卡遮挡。`.card.off::after { inset:0; background:rgba(255,255,255,.45); pointer-events:none }`，不给信息区单独加 z-index
- 需求边做边追加是常态：todo 清单累积 → 统一实施 → 一次构建统一验证 → 单次完整报告
- JS 生成的 HTML 用 shell 未定义的 CSS 类 → 无样式平铺，核对可用类清单
- CSS 布局陷阱（aspect-ratio/max-height 冲突等）→ `references/layout-intelligence-pitfalls.md`

### 构建与编码
- **双端项目 `proto-config.json` 的 `template` 必须写 `"pc"`**：`build_pc` 读它选 shell 和输出文件名，写 "mobile" 会把 PC 页面注入移动壳并**静默覆盖移动端产物**。构建后核对日志「模板:」与产物文件名
- **双端结构**：`pages/pc/` + `pages/mobile/`（build 按 target 优先读子目录）、双 shell、publish-config 配两个 slug
- **图片资源路径用 `../assets/xxx.jpg`**：发布脚本会自动重写为 `assets/` 并复制目录，手工写 `assets/` 本地会全裂
- **默认落地页 = 字母序第一个页面的自调用 protoShowPage，与菜单无关**：改默认页改那个页面尾部的自调用目标；改完检查该页尾部有无残留手动 `init_xxx()` 调用（会覆盖面包屑）——init 一律由 protoShowPage 内部调用，页面尾部禁止手动调
- **无任何自调用时首屏 = dist 里第一个 proto-page**：让首屏=目标页在目标页 script 尾部加自调用（页面脚本按文件序合并，最后一个自调用生效），并同步 shell 面包屑与 menu active
- **新标签页直达某页 = hash 路由自己加**（build.py 没有）：项目级 shell `</body>` 前加读 hash → protoShowPage 的小段脚本；跨页传参不要靠新标签页共享全局
- **build_mobile 已修复**：项目级 shell-mobile.html 正常读取；shell 写 `ProtoRouter.init('{{DEFAULT_PAGE}}')`（禁止写死页 id）
- **mobile 构建不处理 `_shared.html`**：移动端全局浮层直接放 01 页（DOM 合并后 fixed 定位全局可见）
- **移动端「验证全绿但浏览器白屏」= 默认页从未激活**：verify 全过 ≠ 不白屏。根因链：shell 丢启动块（`DOMContentLoaded → ProtoRouter.init()`）或 init 页 id 写错。dist 里 `grep -c "ProtoRouter.init"` 应为 1 且参数 == 首个组件 id。用户报「打开空白」第一时间 grep init 块与页面 id
- **移动端默认形态 = 无底部 tab-bar**（扫码直入式 H5）：tabBar 留空数组，shell 删 tab-bar；首页即入口
- **移动端不要评审布局**：模板级 shell 即全面屏壳（body flex 居中 + 仿真状态栏 + 手势条），新项目首次构建复制即可用
- **移动端全局浮层（toast/演示菜单/公共弹层）必须放 shell 的 `mobile-screen` 内**：放页面组件 div 内，`.page` 未激活时 `display:none` 全部不可见；演示/全局函数放 shell 独立 `<script>`
- **移动端弹层必须 `absolute` 定位，禁止 `fixed`**：fixed 相对浏览器视口，遮罩会盖满整个浏览器窗口。弹层挂 `.page` 容器（absolute inset:0）内；唯一保留 fixed 的是浏览器级演示工具
- **全局弹层三层放置**：① 业务 .page 内 → 从别页打开时不可见 ② body 层 → 失去 positioned 祖先遮罩盖满窗口 ③ 正确 = `.mobile-screen` 内、页面注入点之外的全局浮层区
- **bottom sheet 四条**：① 封顶高度用 `%` 不用 `vh`（vh 相对浏览器视口）② 头部固定 + 列表内滚，`min-height:0` 必写 ③ 共用基类用专属修饰类隔离改（`.st-sheet.st-style-sheet`），禁止直接改通用基类；动手前 grep 基类名盘点复用方 ④ 不在 open 函数里重置列表 scrollTop
- **提示弹窗 ≠ 同意弹窗**：告知信息用单按钮「我已了解」；条款/隐私/不可逆操作才用双按钮同意式
- **build.py 吞 `<script src>` CDN 标签**：CDN 库必须 JS 动态加载
- **HTML div 不平衡 → build.py 静默产出空页面**：浏览器元素全 MISSING → 查 dist 该页内容长度 → 源文件 div 深度扫描
- **pages 目录禁止 `.bak.*.html`/临时 HTML**：glob 扫入当页面 → dist 重复两遍。备份用 git 或改 `.txt`
- **数组追加条目先看原最后一项有无尾逗号**：漏逗号报错在漏逗号元素的后一行，极易误判；数组中间插入时前后两个元素都要有逗号
- **批改 JS 数组先防「列对齐空格」破坏固定空格锚点**：逐行锚点用 `id: 'xxx',\s+name:`（\s+ 容忍对齐空白），或先 grep 原始空白再构造锚点；批量遍历按每行唯一 id 定位
- **正则重写 JS 大数组会吞数组后的声明（最严重）**：锚点不精确会静默删 var 声明 → 页面全空。替换前 count 锚点唯一；替换后 git diff 审查删除行
- **正则替换字段后必须 grep 实测**：group 边界不含闭合引号会静默丢引号
- build.py 写文件 `newline=''`（CRLF 污染正则致 JS 崩溃）
- **修改源文件前先备份（git 或 .bak.txt）；非 git 仓库的独立原型项目整目录备份**：`cp -r` 连 assets/ 一起拷——用户要的是能独立打开的回退点
- **patch 的唯一匹配会被「只差一个前导字符的近似行」破坏**：成对三元分支常只差行首 `?`/`:`/缩进一格。修法：Python 精确串替换 + `assert s.count(old)==1`，或按行号整行重写；不为凑唯一截更长上下文
- **patch old_string/new_string 必须换行对称**：一边带换行另一边不带会把后一行并上来（语法仍合法不报错，只是格式坏）
- **patch old_string 范围过宽 → 误删相邻节点**：只锚定插入点附近 2-3 行，new_string 原样重述所有要保留的行；执行后 git diff 审查删除行。**纯删除尤其危险**：删完重读区域确认 div 配对，不能只信 patch 成功返回
- **含转义的整函数块不用 patch**：用 Python 从 git 基线取原函数按字节重建，只注入改动行
- **patch 的 new_string 也会二次转义**：含 `\'` 的行用 3 行 Python 脚本精确替换（chr(92) 构造反斜杠），改后立即 node --check
- **恢复错误实现后 git 状态显示 `MM` 属正常**：checkout commit -- 文件 会把文件抓进暂存区。确认用 `git diff`（工作区 vs 暂存区）
- **Python 逐锚点替换前先归一化换行**：CRLF 文件用 LF 锚点必败。安全配方：`open(P,'rb').read()` → decode → `.replace('\r\n','\n')` → LF 锚点逐个 assert count → 写回前 `.replace('\n','\r\n')`（如原是 CRLF）→ 二进制写回。锚点 count==0 但文本肉眼相同时 repr 行尾查连续 `\r`
- **禁止「手动转 CRLF + newline=None」双转换**：`\r\r\n` 累积，第二轮起锚点全部 count==0。修复存量：`re.sub(r'\r+','\r',text)`
- **大块删除用「行号区间法」而非文本锚点**；替换段锚点不唯一时用标签配对切块（从 `<div` 累加遇 `</div>` 递减归零即块尾）——行号会在多次替换间漂移，字符串锚点在块被剪掉后失效。execute_code 脚本运行在独立临时目录，文件读写必须绝对路径
- **按固定行数切片替换会吞掉块收尾符**：`L[i:i+4] = <4 行新内容>`，原切片含函数的 `}` 而新内容没写 → 报 `Unexpected end of input`（ASI 不兜，整个 script 块失效）。替换前数原行数时同步数 `{`/`}`，新内容必须自带收尾；改完立即 node --check。同理，插「恢复/覆盖」逻辑必须放在被覆盖的默认赋值**之后**（插在前面会被静默覆盖，症状同「没生效」）
- **dist 里可能有「独立单文件原型」（非 build.py 产物）**：特征 = pages/ 无对应源 + 无 PAGE_META。此时该文件本身就是源，直接改（先备份）。大 HTML 多点改动：Python 逐锚点 str.replace + assert count==1 → div 平衡 → 抽内联 script 过 node --check
- **dist 里可能有「手工另存的变体产物」**（同名前缀多个 .html + mtime 早于主产物）：改共用文案后会停在旧值，是否同步由用户拍板但必须在报告里点明
- **项目里可能有「独立单文件原型」直接放在 dist/**：见上「独立单文件原型」条

### 素材合规（政务/党建/学校项目必查）
- **历史图片逐张过筛，政治敏感素材主动排除并留痕**：公开图库混着带历史标语、领袖像、民国纪年铭文的照片，不要因为"是历史照片"就默认能用。排除动作 README 留痕 + 报告当面说明；缺图时明示缺图（斜纹占位），不配错图、不拿现代图充数
- 找图/核验/裁切/署名全流程 → `references/demo-asset-sourcing.md`

### 演示数据与交付
- **同一屏里的图、文、题必须讲同一个故事**：fixture 定一个主题贯穿（海报+题干+答案+出处全对齐），答案要能从图上直接读出来
- **过滤型视图逐项跑空**：凡按时间/分类过滤的入口每个选项必须有非空结果，交付前逐个跑一遍记录条数；空结果补数据或放宽匹配，不许空态当正常交付。非数字标签会被 parseInt 判 NaN 静默消失，加数字字段供比较
- **演示数据口径必须自洽**：统计数字的口径定义（三数关系）在首次给出时说清；数字打架必然被质疑。功能落地后把《页面改动交接说明》重写为实际落地版 + 记录「已拍板不要回退」的差异
- **推送前确认全部改动完成**：push 前 checklist——源文件改完 / dist 重建 / 旧值清零 / 文档同步 / verify 通过。数字类改动源文件改了 ≠ 做完，dist 必须重建才生效

### 交接文档与工具路径
- **交接文档只信结构不信行号/函数名**：开工前 `grep -n` 逐一验证关键函数/数据源真实位置
- read_file 报 binary 但文件是 UTF-8：含 BOM/控制符误报，改用 python 读
- **内联 `python -c` 禁写反引号/$/#注释/转义引号**：bash 先做替换，脚本静默跑一半（后续构建/commit 一并没执行）。凡含这些字符的脚本一律写成 .py 文件再跑；git 多行正文用 `git commit -F - <<'EOF'`
- search_files 对中文路径可能静默返回 0：改用 terminal `grep -n`
- **patch 替换含 JS 转义串报 Escape-drift**：拆成无转义的小锚点分段 patch
- verify-output.py 不检查 div 平衡：构建后自查 `count('<div') == count('</div>')`
- dist 可能有新旧两个产物：验证选注入页面数最多的那个
- **跨页共享作用域 + 弹窗模式标记的上下文陷阱**：判据用弹窗可见性（`classList.contains('show')`）而不是会被清空的标记

### 其他
- **浏览器验证作用域**：组件化增量修改默认不主动截图验证（用户明确要求才用）；单 HTML Pipeline 必须 Step 8 Screenshot + Step 9 Critic
- **多页原型里查 DOM 数量为 0 ≠ 渲染失败**：init 只在被激活时跑，先 `showPage('目标页')` 再查数量；切换后重新取元素引用。**别拿猜的 class 名下结论**：判「空了/坏了」前先取 `容器.children.length` + `children[0].className` 拿真实类名；断言数据为空先查数据函数 length 而不是 DOM
- **真实交互验证用自动化 Chrome 9333**（drive_preview 有旧快照局限，结论矛盾以真实浏览器为准）：`"D:/Chrome/Application/chrome.exe" --remote-debugging-port=9333 --user-data-dir="D:/Chrome/User Data_automation" --no-first-run --no-default-browser-check about:blank` 后台启动（不要用 `start ""`——bash 下会起 cmd 窗口而 Chrome 没启动）→ curl 9333/json/version 确认 → browser_exec 打开 file:// → click + getComputedStyle 实测 → 用完 kill
- **后台标签页的 setTimeout 会被节流**：验证定时器驱动的 UI 时等待给到时长 3 倍以上，状态不明再查一次，不一次读数下结论
- **browser_exec 的 js() 参数不能含换行**：JS 压成单行或拆多次调用
- **锚点含中文引号先 read_file 确认实际字符**：弯引号 vs 直引号、全半角、空格差异都静默 count==0；raw string 里 `\"` 是反斜杠+引号两个字符，永远匹配不上 `"`——锚点用普通字符串或三引号
- **锚点落在 JS 拼串里时改用「按行筛选」不写正则**：
```python
out, removed = [], []
for ln in s.split('\n'):
    if 'class="resmg-sw ' in ln and 'shelfText' in ln: removed.append('上架胶囊'); continue
    out.append(ln)
assert len(removed) == 3, removed
s = '\n'.join(out)
```
同一个锚点写两遍都匹配不上时直接换按行筛选
- browser_vision 视口裁剪误报字段缺失：字段存在性用 DOM 实测，与截图矛盾以 DOM 为准
- **预览同步（GitHub Pages）**：必须等用户明确说「同步预览」才执行。「传到预览仓库」= prototype-preview 仓的 GitHub Pages：`bash ".../prototype-preview/tools/publish-preview.sh" --project <项目目录>`（推送成功即报链接不阻塞等部署）；只提「改好推送」→ 推项目源码仓。两动作经常都要做：先推源码仓再发布预览
## 6. 延伸阅读
- 单 HTML 原型视觉规范 → `ui-system/`
- 页面级布局 → `ui-system/layout/`
- LI 架构详解 → `references/layout-intelligence.md`
- 渲染工具链陷阱 → `references/layout-intelligence-pitfalls.md`
- 架构冻结结论与渲染工具（content-benchmark.py / layout-planner.py，未合并）：`D:/hpy/桌面/日常临时会话/layout-benchmark/`
- 移动端/评审布局 → `references/mobile-spec.md`
- 增量修改/迁移 → `references/patch-workflow.md`
- 完整陷阱库 → `references/pitfalls-complete.md`
- 标注 → `references/annotation-workflow.md`
- PRD 差距分析 → `references/prd-gap-analysis.md`
- 死代码审计 → `references/dead-code-audit.md`
