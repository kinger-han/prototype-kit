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
- `references/editable-table-pattern.md` — **可编辑录入表模式**（行内增删改/行首复选框/条件必填列/必填校验与单元格标红/上传列与缩略图点击分流/「一个展示单元两个文件」的建模与合成预览/**行级可编辑性门禁：父记录状态驱动的三态（可编辑 / 整体只读 / 部分可改）**）；做「让用户逐行填写的清单表」必读
- `references/topic-mgmt-v2-notes.md` — 主题管理V2原型结构速查（关键函数落点、**公共/私有双流程状态机**、V4.20样式约定、批量文本替换做法）
- `references/style-derivative-works.md` — **同底片衍生作品（风格化/多版本）合并展示模式**：方案判据（标签合并 vs 独立页）、数据模型（sourceWorkId/styleId 归组）、移动端标签行+合并卡、PC 详情弹窗分组渲染、跨页共享数据覆盖坑（党代会 V2.1 实测）
- `references/antd5-primary-override.md` — 全站 AntD5 主色覆盖；`references/detail-edit-page-layout.md` — **详情/编辑页布局与返回机制**（含查看/编辑字段顺序逐行对齐、字段集合差异时留空对齐、只读字段用只读文本不用 disabled 下拉、可选集合用多选 chip、图下信息横竖版共用一条、同一信息不重复展示、单一保存按钮 + 提交时判定审核的轻方案、操作按钮排序与增删判据、状态类字段不进编辑表单）
- `references/visual-reference.md` — 视觉风格参考（Ant Design Pro 整站 demo 源、配色偏好 #1677ff/#e6f4ff）；**视觉风格类改动先给参考再动手**
- `references/element-ui-legacy-doc-fetch.md` — Element UI 老系统规范核查/UI交接：官网超时的 GitHub raw 抓取法、Dialog/Tree/Cascader/Drawer 能力速查、判断哪些页面可跳过UI设计的复用框架
- `references/element-legacy-style-rebuild.md` — 老版 Element UI 样式重构**执行**规程：独立副本隔离原项目、unpkg 下载官方 CSS+图标字体、build.py shell 不被覆盖机理、复用官方类禁自造、先做最复杂样例页再铺开、需用户拍板的专项（老版无拖拽等）
- `references/ai-design-prompt-template.md` — 用户嫌界面丑、要求写"给 AI 设计工具的设计图提示词"时的六段式模板（场景/入口/字段/交互/风格/输出规格）
- `references/page-js-debugging.md` / `references/js-interaction-traps.md` — JS 排查与交互陷阱
- `references/prd-gap-analysis.md` — PRD 差距分析
- `references/ai-failure-states.md` — **AI 生成功能的失败态设计规范**：用户界面永不出现的技术信息清单、失败分类表（网络/生成故障/内容安全/照片不合规/次数用尽）、行内失败态（**不做模态失败卡**）与各入口表现、前端 fail_code 字典约定；设计或排查任何「生成失败」界面时必读
- `references/demo-asset-sourcing.md` — **真实素材获取与合规筛查**：Wikimedia / 公开报道找图与代理用法、extract→vision 核验→PIL 裁切流水线、命名与 CSS 类约定、许可与署名口径、政治敏感素材排除清单
- `references/ai-chat-streaming-pattern.md` — **AI 问答页的流式输出与结构化回答卡**：三态状态机、逐字渲染不切坏 HTML 标签的做法、来源/延伸/追问/操作条分层、滚动跟随、演示用自动播放、图片与弹层的绑定；做任何「AI 正在生成」的界面必读

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
   ├─ 纯视觉美感探索（"优化页面设计/怎么好看"，无现成原型）→ 不建 HTML，走 skill:ui-design-image-workflow 生图探索路径，让生图模型自行设计（用户嫌 Hermes 自研 HTML 视觉丑，要求原始需求直接交生图模型，不加 Hermes 判断）
   └─ 汇报演示型单文件原型（产物要放进说明页给客户/领导看、客户定制视觉、无 build.py、不读 ui-system）→ 见下「演示型单文件原型」
```
- **进入某一模式后，不得中途混用另一模式的规则**（组件化模式的 pages/dist 规则不适用于单 HTML；单 HTML 的 ui-system 流程不适用于组件化日常修改）
- 3 次以上修改 / 要迭代 → 默认组件化；做完就扔 → 单 HTML；不确定 → 默认组件化
- **⚠️ 用户说"不要用 shell 模板 / 用已有产物样式" ≠ "退出组件化改单文件"（党代会项目）**：移动端"不用 shell 模板/评审布局"指**换壳形态**（全面屏居中壳），不是换构建模式。误判为单文件 → 整轮 V2 单文件作废，用户下轮要求"移动端和 PC 一样分页、脚本拼合"，全部重拆。判据：明确说"分页/拼合/组件"才算模式变更；涉及 shell/模板/页面结构的表达一律出确认卡

### 演示型单文件原型（第 4 种模式）

**判据**：产物是**给客户/领导看的演示页**（左手机 + 右说明栏），不是 build.py 项目、也不读 ui-system —— 客户定制视觉（党建红这类客户主色）+ 单文件手写 + 迭代到好看为止。

- **版式**：左半屏手机居中（`position:sticky; top:0; height:100vh`，滚动右栏时手机不跟着走）+ 右半屏信息区（「原型页面导航」可点直达 + 核心能力 / 功能亮点 / 不做什么 / 竞品差异）。
  - ⚠️ 这与 `references/mobile-custom-shell.md` 里「用户拒绝左手机+右文档 review-shell」**不冲突**：被拒的是**小程序壳本身**（要全面屏居中、无页码导航）；这里是**外层演示页**的版式，两个不同产物，别互相套用
- **缩放**：按设计尺寸 375×812 原样写，外套 `transform:scale(.82); transform-origin:top left`，**再配一个承载缩放后占位的同尺寸 wrapper**（只写 transform 不加 wrapper，父级 flex 会按原尺寸布局 → 留大片空白）；给「适应屏宽 / 100%」两档切换
- **路由**：`.page{display:none}` + `.page.active{display:flex}`，`go('id')` 切页并同步底部 tab 高亮；非 tab 页隐藏 tabbar、靠返回按钮回
- **⛔ 所有可见可点元素必须有反应（用户明确不容忍死按钮）**：要么真跳页、要么弹层、要么 toast，不许有点了毫无反应的按钮。弹层（bottom sheet）+ 轻提示（toast）配套做齐
- **⛔ 演示页不放「修改记录 / 改动说明」**：用户要的是**功能亮点 / 竞争优势 / 竞品差异 / 核心能力**这类汇报素材，不是你的改动日志；也不要大段无关说明
- **⚠️ 「从别处带参跳页 + 替用户执行一步」会撞上目标页的首次进入自动播放 → 出现两条重复内容**（实测：点日历节点跳 AI 问答，聊天里同时冒出自动播放的示例问答和注入的正式提问）。机制：目标页 `go('chat')` 首次进入跑 `initChat()`，里面的 `setTimeout(… ask(示例), 700)` 是给独立演示用的自动播放；注入方又在 220ms 后 `ask(真问题)`，两条叠上。修法：**初始化函数加 `autoPlay` 开关**（`initChat(autoPlay)`，`autoPlay !== false` 才排自动播放），程序化进入时先 `chatInited = true; initChat(false)` 再注入。**不要用「把延迟调大」绕过**——那是竞速不是修复，换个网速/机器就反复。判据：任何「带参数跳进某页并替用户执行一步」的入口（日历→问答、海报→问 AI、列表→预填），先看目标页 init 里有没有自动演示
- **交付前技术自检（三项缺一不可）**：
  1. `node --check`：正则抽出 `<script>` 存临时 .js 再检查
  2. `<div` 与 `</div>` 计数相等（用行区间法改过结构后必查）
  3. **跳转目标 ↔ 页面 id 双向差集为空**：`go('x')` 的每个 x 都要有 `id="p-x"` 的页面，且每个页面都要有入口——两个方向都查（一边防空跳转，一边防「页面做了却进不去」）。弹层同理：每个 `openSheet('k')` 的 k 必须在弹层表里有定义
- **交付前还要跑截图自检**（规程见 skill:headless-web-capture）：截「完成态」+「进行中态」两张，用 vision 逐项评审后再发——本模式的用户反馈几乎全是视觉的，自检能省一轮返工
- **用户要「逐页评审 / 换个模型评审」时的交付形态**：① **先自己把图截好**（批量逐页脚本见 skill:headless-web-capture）再交出去——不要让子 agent 自己跑 Edge，HEADLESS 入参的中文路径编码、临时副本生成很容易把它们卡住；② 拆派份数按 `delegation.max_concurrent_children`（默认 3）均分，每份 5 页左右——单份太大顶到 `delegation.child_timeout_seconds`（默认 600s）会被硬切断，每份太小则视角碎；③ 每份 context 自含产品背景 + 用户画像 + **产品红线**（否则子 agent 会提「加审批流/排行榜/打卡」这类超纲建议）+ 输出格式与严重度分级（🔴阻断/🟡体验/🟢优化）；④ 子 agent 调 `vision_analyze` 走的是辅助视觉模型、返回文字分析，**与它自身是否多模态无关**，所以纯文本模型也能委派做 UI 评审——但必须在 context 里明写「逐张调该工具」，只给图片路径它会凭文件名编内容；⑤ **汇总成一份再交**，不把 N 份原文丢给用户
- **迭代期收到「这里不对」先核实他看到的是不是最新渲染**：预览面板/CDN 缓存会让用户截图落后文件一代，先对文件取证再决定改不改

### 修改原型的正确流程（模式限定，必须遵守）
- **组件化模式**：只改 `pages/*.html` 源文件（弹窗结构改 `pages/_shared.html`，弹窗业务 JS 留在对应页面）→ **build.py 重建 dist**（禁止直接改 dist，历史上反复导致页面损坏）→ 浏览器验证
- **单 HTML 模式**：只修改当前任务生成的 HTML / 工作目录产物，**不套用 pages/dist 规则**
- **提交**：修改完成后检查 `git diff` 确认改动范围；**是否 commit / push 按用户要求或项目既有流程执行，不默认自动 push**

### 只改用户明确要求的内容
- 没提到的逻辑/字段/交互不擅动；影响其他页面先说明让用户决策
- 不简化/重写用户已确认内容；**"同步/对齐"类需求先确认方向**（以哪边为准、几级层级），不自行假设
- **用户给「最终内容 / 定稿文案」清单 = 整页替换语义**：清单即该页的完整内容，清单里没再出现的既有小节属于「被替换掉」，删掉它而不是留成页面尾巴。判据：措辞是「下面是最终内容 / 帮我换一下」且给了成篇完整文案 → 整页替换；只说「改一下 X 段」→ 只改那段。**删除必须可见**：报告里单独列出「清单外被你删掉的既有小节」+ 一句恢复口径（要保留说一声就加回），既不静默保留旧小节、也不静默删完不吭声。交付功能描述类顺带需求（用户要「一句话说明这个功能」）时直接给成品句，不解释你怎么写的

### 原型改动不顺手改 PRD，差异进「待更新清单」

每次改版产生的口径差异一律**追加**到 `<项目>/docs/PRD待更新清单.md`（按批次编号，不改写既有批次），PRD 本体只在用户明确说「更新 PRD」时才批量落地。用户口径：「原型修改之后我会主动说要更新PRD的」。

- 追加内容写「改了什么 + 为什么（业务口径）+ 原口径是什么」，让用户将来能判断要不要落。
- 理由：PRD 是要拿出去评审的文档，提前或零散地改会让评审稿与原型长期不一致，而不一致时没人知道哪个对。
- 例外：用户当场要求同步 PRD 时照做——此时先 `grep` 全库旧口径的数字与措辞一并改净，别只改一处。

### 引用页面一律带人类可读的名字（不要只报序号）
用户不记得 `pages/` 的文件序号。只说「12 页」「07 页」用户无法对应，会直接反问「12/13 页指的啥？说序号我不知道」。
规则：任何提到具体页面的地方一律写「菜单名/功能名（文件序号）」，如「播放列表-选择（12-schedule-select.html）」「资源审核（04-resource-audit.html）」；首次出现给全称，后文可简称但至少带菜单名。同理适用于 PRD 章节号、列号（写「操作记录表第 3 列」而不是「第 3 列」）。

### 历史遗留的技术约束：原型里不暴露，改为「提示带出所需值」
用户交代某条约束是「历史 BUG 留下来的」（如两个文件必须同名才能配对）时，要的是**你理解它为什么存在**，不是让你把它做成校验项。做法：
- **原型不做强制校验**：把技术债摆到用户面前只会显得系统古怪，演示价值为零。
- **用提示消解它**：在触发位置带出合规所需的值（背景图上传框提示「需与视频同名：〈视频文件名〉.jpg」），用户照着填即可，不必读文档。
- **报告里把「约束」与「建议」分开讲**：说明这是历史遗留的匹配机制，更好的做法是系统自动配对（上传视频后背景图自动继承同名），让用户拿去推后端。
判据：约束源自「系统当初怎么实现的」→ 提示级；源自「业务本来就这么规定」→ 才可以做校验。

### 结构 / 入口类需求：先查已定决策，再给判断
用户问「要不要加个入口 / 卡片 / 页面」这类**结构变更**时，不要凭产品直觉直接答，先两步取证：
1. `grep` PRD 与《页面改动交接说明》相关章节，找**已定决策**（PRD 常写死「不做成 X」「不进入 Y 列表」）与**历史回退记录**（交接说明的「相对上版的落地差异（已拍板，不要回退）」小节）。
2. 能引用原文条款时判断有据；引不到就明说「这是新增提议，需你拍板」，不把推测讲成结论。

给判断时把**时机 / 定位 / 代价**三条分开讲，而不是只说「不合适」：
- **时机**：用户此刻有没有做该判断所需的信息（例：在还没拍照的模板页选「AI 风格」，用户无从预期结果）。
- **定位**：新入口与既有路线是平级还是增值？会不会分流用户、让主产物拿不到。
- **代价**：数据模型 / 路由 / 审核链路要不要动（如「无模板作品」会撞上「作品必挂模板」的既有模型）。

用户说「做之前先分析下」= **只出结论 + 依据 + 代价 + 替代方案，不动手改代码**。分析要主动指出方案本身的问题（含文案用词），但给一次判断即可、不反复劝说；用户没采纳就按用户口径执行。

### 状态机 / 审核颗粒度类改版：先定「阶段边界表」再设计

用户说「把审核/管理颗粒度下沉到 X 维度」时，**不要把这条规则套到整条业务流上**——同一条流程常被一个闸门切成两段，两段的审核形态可能正好相反（实测被用户当场纠正：「入库前必须整批全部通过才能入库，入库后才是单条独立、互不影响」）。先画边界再设计：

| 段 | 判定问题 | 形态 |
|----|---------|------|
| 闸门之前 | 产物是否还没定型？ | **批量门禁**（整批通过才放行） |
| 闸门之后 | 产物是否已成为长期资产？ | **单条独立**（一条状态变化不影响其他条） |

做法：① 方案里单独写一行「**A 段 = 批量门禁，B 段 = 单条独立，入库即闸门**」请用户确认，再设计页面交互；② 用户描述的「XX 之后自动流转到 YY」往往是**背景业务流**、不是本轮范围——只在清单里出现过的环节才做，没出现的先问一句是否本轮内；③ 审核颗粒度下沉后，「待审核」类页签要同步拆出「退回」独立页签，退回项必须带**责任人**字段（系统按资源的设计/文案责任人自动带出并显示在列表上），权限判据就一条 `责任人 === 当前用户`——比按需求/角色做多层授权简单得多，也更贴合实际。
- **新增的审核阶段若涉及外部角色（客户/甲方/监管），先判它是「流程节点」还是「外部轨道」**：内部流水线是自动流转（审完自动交给下一个），而外部角色的审核**永远不会自动流转**——触发点是"运营主动挑出来发给对方"。硬做成第 N 个节点，只会得到一个没人能推进的状态。正确形态：① 状态只加「待 X 审核 / X 退回」两个值；② 该状态**由"发起"这个动作推进**（本项目＝分享时勾选「申请客户审核」），不是系统自动流转；③ 引入**「审核单」聚合**——一批内容 = 一个单 = 一张二维码/一个链接，把多种业务场景（资源入库 / 播放列表 / 排播计划）收成同一套机制，场景差异只落在"审核内容"这一个字段上，不要为每种场景各做一套；④ 内部审核页加一级切换（内部审核 | 客户审核），内部页签零改动。
- **⚠️ 同类对象按「归属类型」分叉成两条流程时，共享的状态推进函数必须按类型分支，且改一个状态值要全量同步**：同一系统里公共资源与私有资源的审核链路可以不同（私有经客户审核、**无校对环节**），而推进逻辑常收在一个共享函数里（如 `resNextStatus(s)`）被多页复用。做法：① 函数签名加对象参数（`resNextStatus(s, r)`），用**对象自带的归属字段**判类型（如带 `customer` 字段＝私有），**所有调用点一并传该对象**（审核弹窗 / 批量审核 / 上传后推进 各一处）；② 改一个状态词前先 `grep -rn "<状态词>" pages/` 全量盘点，再逐条判定属于哪条流程——**筛选下拉 option、待办统计的状态数组、状态色板/样式映射、审核日志生成、退回时的目标状态、移动/复制后的初始状态、演示数据**七八处各存一份，漏改表现为「某页还能选到这条状态 / 统计数对不上」且零报错；③ 另一条流程一个字不动，改完专门 grep 确认剩余命中**全是另一类数据**（按 id 逐个核）；④ 回归验证直接打印两条链路（`resNextStatus` 逐阶段走一遍）比读代码可靠
- **审核列表页签按「人」切，不按「单据状态」切**：同一条记录对不同人是不同身份 —— 对当前环节处理人是「待办」，对处理过的人是「已办」。三个页签的过滤依据：待审核＝当前环节处理人是我（需建「环节→角色」映射）；已审核＝该条的操作记录里出现过我的审核类操作（**不是**按终态筛）；被退回＝状态含退回且落在我的客户范围内（运营分客户、文案跨客户、设计/管理员不限）。三条容易漏的配套：①「已审核」里的状态列显示**流程当前状态**（可能是「待复审」而非「已发布」），这是正确表现，别去「修正」它；②「我参与过」类判定要给管理员开特判，否则管理员名下没有操作记录、列表全空；③**演示日志的操作人必须与角色定义表（`ROLE_DEFS`）对齐** —— 演示日志常写死人名，与角色表错位时过滤结果「看着能跑其实全错」（人名串到别人的环节上，条数虚高数倍）。验证方式：逐角色切换后打印同一页签的行数，**数字应各不相同且量级合理**；四角色数字一样、或某角色恒为 0，基本可判过滤没生效（而不是数据少）。

### Demo 范围与产品形态（从 SDD/PRD 起手时先怀疑它的隐含主体）
- **SDD/PRD 的隐含主体 ≠ 产品的正确形态**：以「某平台现有能力清单」为骨架写出的 SDD，会让 demo 被收窄成那一个能力（实测：校史馆 SDD 以「问境现有能力」起手 → 原型做成问答助手，用户退回「跟我想的不一样，里面现在全是问答的」）。动手前先问一句「这个产品类别里，用户进来第一眼该看到什么」——校史馆/展馆 = 可浏览的展陈内容，问答只是服务层。
  - 判据：**首屏主体是「可浏览的内容」还是「需要组织语言的行为」**。把要打字的入口与可浏览入口做成平级大卡 = 把高门槛伪装成低门槛，点进去必有落差。服务层入口（输入框）常驻即可，不占平级大卡位。
  - 分专题/分模块时，给每一个补一句「实体场馆做不到的什么」，答不出来就会做成换个壳的问答。
  - 内容形态必须互相区分：线性叙事（有终点、给完全不了解的人）/ 横向对比（无终点、换维度就有新结论）/ 轻内容卡片流（可传播）。三者底料可同源，交互与终点必须不同。
- **改了前台结构，同步检查后台配置页**：前台模块改了而运营后台的编排项还是旧结构，客户走一遍后台就看出前后台不一致。改完前台在报告里单独点出后台待同步项。**但用户说「先管前端 / PC 不用管」时按用户口径走**：后台页一个字不动，只把「后台待同步」写进报告——不要因为「前后台要一致」就顺手改后台（多端迭代期前台还在变，改了也是白改）。
- **内容都做全了用户仍说"单薄" → 缺的是形式不是内容，别再补内容页**：用户看完"时间轴 + 年代对比 + 故事卡 + 问答"仍反馈"说到底还是只有问答"时，真因是产品只覆盖了「看」和「问」两种。按"人认识一个对象"的方式盘点七种形式，缺哪补哪：**看**（内容）/ **问**（问答）/ **找**（地图、检索）/ **玩**（对比滑块、找不同、闯关）/ **做**（AI 生成、把自己合进历史场景）/ **听**（口述音频）/ **说**（留言、认领）。补形式 ≠ 补内容页
- **形式选型要交付「可点击的样张页」，不是文字方案**：用户在这种"要哪个形式"的问题上评的是手感，文字清单和 clarify 选项都答不出来（实测 clarify 直接超时、零回复）。做法：新建一个「形式样张」页，每种形式做成能上手操作的核心交互（滑块真能拖、地图真能点、生成真走一遍流程），每节固定两段 —— **「解决什么」** 与 **「正式版还需要什么素材」**；后者才是用户拍板的依据（实测四个形式里只有"按年份生成个人时间轴"不需要新素材，另三个分别卡在同机位新老照片 / 校园平面图 / 人脸合成授权）。落位规则：样张页**不进主导航**，入口挂在演示控制菜单下并标「待选」，页内首句明写"这一页不是正式功能"，避免未拍板的东西污染主流程。**样张里的对比滑块用原生控件实现，不手写拖拽**：两层图叠放（底层旧图、上层新图）＋ 一个透明 `input[type=range]` 铺满区域，`oninput` 里设上层 `clip-path: inset(0 0 0 N%)` 与分割线 `left`——触摸拖动由原生控件负责，零手势代码。素材前提（同机位新老照片）见上条
- **推荐顺序按"哪个现在就能做成真的"排，不按"哪个炫"**：素材前提是第一判据，做不出来的一律往后放并写明卡在哪
- **用户说"这版还是只有 X"时先验版本再讨论**：可能是他开的是另一个端（运营后台 ≠ 客户端）、命中了 CDN 缓存（微信/GitHub Pages 预览有 max-age 缓存）、或看的是旧产物。先实测线上/本地产物里有没有新标记，再决定是解释还是返工——不要在错误的版本前提上展开产品讨论。**本机预览面板同样会缓存**：用户贴的截图里样式/配色比文件落后一代（实测：文件里图标已改成红金、他的截图仍是上一版蓝绿）＝ 他看到的是旧渲染，先让他刷新再谈，不要照着旧表现改代码

### 外部方案材料（用户丢来 docx / HTML 说「参考一下，看哪个合适」）
- **先看这份材料自己的出处口径**：末尾注「部分内容可能由 AI 生成」的方案，其品牌体系（主色 / 吉祥物 / 命名）与功能清单都只是**未核实的提议**——不要据此改既有配色、不要写进原型，先让用户找客户确认。
- **逐个核对可证伪的硬信息**（人名 / 头衔 / 职务 / 数字），去权威来源交叉验证（单位官方出版物、官网、官方名录）。最强判据：**同一份材料内部对同一事实的写法互相矛盾**（设计图与实现文件对同一人描述不一致）＝ 这份材料没校对过，其余内容一并降级为待核。
- 发现错误**当面上报**（不要自顾自改掉不提）+ 在项目文档里留「正确口径 + 来源 + 勿沿用错版」；错版进了客户现场就是事故。
- **比的是交付物性质，不是优劣**：外部材料常是「静态展示板」（一屏看全、讲方案用），自己做的是「可交互原型」（能真点、演流程用）——两者不是二选一。报告里说清各自用途，再单独列「值得吸收的具体项」，不要笼统评谁更好。
- 顺手把它带出来的名单 / 素材线索补齐：外部方案常出现自己没查到的校友、荣誉、场地，核验后就是新内容来源（比在空白里硬编强得多）。

### 大屏投屏联动（智融屏 / 三端协同类项目）
- 机制口径：屏幕在**后台登记下发**，只要屏幕联网即可接收——**不要求与手机处于同一局域网**（以用户口径为准，别按同网段配对 / 扫码配对设计）。
- 原型演示形态（缺一不可）：投屏弹层列屏（名称 / 位置 / 规格 / **在线状态** / **当前播放内容**）→ 选屏 → 「正在投送…」→ 成功提示，并**回写该屏的「当前播放」**。状态回写才是「手机发起 → 大屏接收」链路走通的证据，只弹一个 toast 等于没演。
- 放一块**离线屏并置灰**演示真实态；弹层内写明「屏幕由后台登记、联网即可接收」，当场消掉同网段误解。
- 投屏入口挂**内容页**（不是全局悬浮按钮），投送内容名按当前页面 / 当前维度动态拼（如「时间实验室 · 课程」）。

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

**用户一次给多条编号需求（(1)…(8)）时的分流**：先分类再动手，不要一律开改。

| 类 | 判据 | 动作 |
|---|---|---|
| A 类 | 已写明怎么改 | 逐条给出「我的实现方式」，列成表，等确认后一次性改 |
| B 类 | 带「给个建议 / 先出个方案给我确认 / 你定」 | 只出建议与方案，**不动代码** |

- **找耦合项，先定后改**：把互相咬合的条目挑出来（同一页面、同一套逻辑，例：「某状态用什么控件」↔「字段改动触发审核怎么标记」↔「列表卡片加回该状态」本质是一件事），一句话说明为什么先定它们——通常是「先定下来一轮改完，不返工」。明确要求用户**只回 B 类**即可，不要让他重新回答已明确的条目。
- **B 类要给主见**：给明确推荐 + 2-3 条理由，不是罗列选项让用户挑（用户反感捧哏式罗列）。
- **视觉优化类不要只答「我改」**：先说清具体哪里不协调（信息权重、留白、置灰方式、状态行半边空……），再给做法。用户会问「做设计图还是找网上参考」——同类信息结构的现成参考通常对不上，直接出 2-3 个 HTML 对照稿让他在浏览器里切着看，比找参考快且贴合现有设计系统。
- **用户提到「截图N」但消息里没有附件**：开场第一句就说明没收到，并写出你按描述的理解（例「截图1 = 数字输入框带左右增减」），别默默猜。

**大改版（3+ 页 / 涉及状态机或数据模型）的方案交付形态**：写成分层讨论稿 md 放项目 `docs/`，会话里只贴结论与决策点、不贴全文。讨论稿固定五段：① 结论 + 业务流图（改版后先跑一遍流程，确认每个状态名与流转边都对齐用户口径）；② **用户的疑问点逐条编号解答**（用户提的疑问必须逐条回，不要合并成一段）；③ 我发现的、用户方案里没覆盖的问题清单（编号，每条一句影响范围）；④ 逐页修改清单（按菜单名/功能名 + 文件写，不写裸序号）；⑤ **单独一节「需要你拍板的决策点」**，分「必须先定（影响结构，不定没法动手）」与「需你给准确值」两档，每条附我的建议——用户会按编号直接批复。**确认完再动代码**：用户会明确说「我先审阅，没问题再执行」，此时只写讨论稿不碰 pages/。

**用户说「这是旧代码残留吧 / 这个功能删掉」时，第一动作是确认界面现状 + 对齐业务模型，不是深挖代码。** 界面现状 grep 一次就够（页面上到底有没有那个按钮/入口）；真正花时间的是把**业务模型**问清楚——状态怎么流转、一条记录的颗粒度、下一步谁处理。用户原话「想清楚这个逻辑，现在是根据思路来改原型，原型代码怎样不重要」：模型没对齐就动手，删改都要返工。

**用户说「做个示意图给我，我看看最终的」→ 交付可打开的 HTML 示意图，不是 md 讨论稿。** 放项目 `设计对照/` 下、写完用 `desktop_preview` 打开（用户当场能看，不用找文件）。示意图固定包含：区块/页签划分与判定口径、表头字段、**能让用户看出规则的示例数据**（如「同一资源出现两条记录」用来演示记录制）、以及页签/列语义的少量标注。**拿到确认再改原型**——用户在示意图上推翻的成本远低于在原型上推翻。

**用户说「这次只改样式」就严格只动样式**：不改结构、不改字段、不改逻辑、不加页签。动手前先查现状（要加的东西可能已经存在），顺手清掉的残留（死代码/死样式）必须在交付里**单独列一行说明**，让用户知道边界被碰过，不静默带过去。

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

### 演示数据单一来源（用户偏好：不要每个页面都造一份）
用户原话：「有些演示数据可以复用，不要每个页面都造数据，这样没必要」。新增页面/功能需要数据时，**先在项目里找已有共享源，派生而不是另造一份**（共享数据/函数集中在共享数据页，通常是 02 页）：
- **通用素材**（预览图 / 占位图 / 视频底图）→ 在共享页建一处词表 + 取数函数（如 `RES_MEDIA` + `resPreviewImg(r)` / `resVideoAssets(r)`），各页一律调用，**页面里禁止再写 `assets/img` 字面量数组**（历史上 02/04/05/06 四个文件各维护一份，同一逻辑还被写成 `auditResImg`/`detResImg`/`edtResImg` 三个同名异构函数，改一次要改四处）。
- **业务实体**（需求 / 主题 / 资源 / 客户 / 人名）→ 只在共享页定义一次；下游页面用「按实体字段查表 + 从关联实体派生明细」的取数函数（如 `demandResList(demand)` 由主题名回到真实资源列表），**列表行、数量、统计都从派生结果算，不手写行、不手写数字**。
- **小词表**（人名 / 角色名）→ 从已有角色表推导（如 `resWorkerPool()` 取 `ROLE_DEFS`），不另列一份。
- **判据**：这条数据是「业务事实」还是「本页交互状态」？业务事实进共享源；页面自己的交互状态（审核结果、筛选值、展开态）留在页面里。
- **同一事实两个来源必然对不上**：同一实体（需求编码）一处手写、一处按字段 hash 生成，界面上就会出现两个互相矛盾的编号。收口时顺手 grep 同一实体的所有生成点，改成同一源。
- **新建演示实体时，它的引用键要先去池子里点名核对（别凭「看着像有」）**：派生型取数函数按键（主题名这类）回池子里捞，键写错或池里没有 → 下游明细为空或少一截，而最省事的错解是「手写几行凑数」，正好破坏单一来源。做法：动手前先把池子的键全抓出来 `Counter` 一下看分布，再挑键——分布常很不均匀（实测公共主题一个 5 条、私有主题一个只有 1 条），要凑 N 行明细就得列 N 个键。判据：**派生条数 == 期望条数**，不等就改键清单，不去改下游。
- 收口后**同步更新项目 README 的「关键实现约定」**，写一句「改 X 数据只改共享页一处」，防下一个 session 又各页造一遍。
- **真实演示素材优先用本机素材库**：`D:\hpy\桌面\数熙相关文档\测试用资源\`（按主题分目录的图片/视频，约百张，如「雷锋精神」「党校90周年讲话」）——用户说「图片用真实的」时直接从这里取，不找网图、不用占位图。

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
- **⚠️ 用户说「某角色要能看到 X 菜单」时，先查「页面是否已存在」再查「有没有注册」**：常见形态是页面早就做好了、却从未挂进菜单（proto-config 与 shell 里都没有），于是谁都点不到 —— 用户会以「要有这个菜单」的形式提出，实际只差一步注册。排查顺序：`grep -rn 'data-page-id="X"' pages/` 找页面 → `grep -n 'X' proto-config.json` 找注册 → 缺哪环补哪环，别直接新建页面。新业务加**新的菜单 group** 时按业务先后排（需求 → 资源），不要顺手追加到菜单末尾；加完菜单记得同步按角色的菜单可见性函数（如 `roleCanSeeMenu`）——新菜单 id 不进白名单，非管理员角色仍然看不见。
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
- **委派子 agent 做 UI 还原 / 独立产出类任务**（用户点名执行者或模型时**以用户为准**，别自评「我能做」就自己上）：
  - **附件必须用 `images` 参数随任务签发**——子 agent 看不到主会话的对话与附件，只在任务文本里给图片路径 = 它凭文件名编内容；任务书里写明「截图N = 哪个界面」
  - **真实素材写死来源**：需要真图时给出本机素材目录（如 `D:\hpy\桌面\数熙相关文档\测试用资源\`，按主题分目录），写明取图规则；中文/空格路径指定用 `shutil.copy2`
  - **产出先审再集成**：任务书写明「只做这一个页面」，产出先落**独立对照稿**（项目 `设计对照/`，弹窗默认展开、垫暗遮罩）给用户看效果，确认后再由 Hermes 集成进项目；只读化还原要列「要去掉的编辑控件」清单
  - **临时切换 `delegation.model` 前先 `cp config.yaml config.yaml.bak.<时间戳>`**（`hermes config set` 会清掉 config 注释，或改用 Python 精确替换 `delegation:` 段），做完**立即改回**并 `grep -A2 '^delegation:'` 确认
  - **验收不轻信自报**：文件存在 + 内联 `<script>` 过 `node --check` + **按内容全高复截一张**再判——别拿首屏截图判「内容被截断」（固定高弹窗 + `overflow-y:auto` 在 1280×900 下把后段压进滚动区是正常表现），**vision 的视觉抱怨先回源码核对**（实测「遮罩太淡」「按钮被裁」均为误报）

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
5. 元素 id 完整性：`"$PYTHON" "D:/HermesData/skills/product-management/interactive-prototype/scripts/find-missing-element-ids.py" <项目目录>` —— 扫「JS 引用了但源码里没声明的 id」。**改完弹窗/详情页必跑**（丢 id 会让弹窗静默打不开，见第 5 章同名陷阱）
6. 符号完整性：`"$PYTHON" "D:/HermesData/skills/product-management/interactive-prototype/scripts/scan-page-symbols.py" <项目目录>` —— ① 死函数（全站计数含自身文件为 0 才算死）② **断链**（HTML 事件属性 / script 拼串调用了但没定义的函数）③ `--page <文件>` 盘点某页函数还被谁引用。**改完页面结构、删函数、清洗菜单后必跑**（页面重命名/退役的前置门禁也用它，见 `references/dead-code-audit.md`）
7. 运行时探针：`"$PYTHON" "D:/HermesData/skills/product-management/interactive-prototype/scripts/headless-probe.py" <产物.html> --page <路由名> --sel "<容器选择器>" --call <按钮处理函数>` —— Edge headless **真跑一遍产物**，抓前三项抓不到的**运行时异常**（典型：字段名读错 → 渲染函数中途抛错 → 表格空白、按钮看着没反应）。退出码非 0 即有异常。**改过页面 JS 后必跑**，用户报「数据没了 / 点按钮没反应」时**先用它定位再改代码**（详见 `references/prototype-change-verification.md` 第 5 节；判据：`行数 0 且无占位文字` = 代码炸了，`行数 0 但有占位` = 数据没筛到。**表达式里的选择器一律加 `#page-<路由名>` 前缀**——产物是单文档多页合并，全局类选择器会把别页的同类元素一起选进来，读出的文字与计数看着像数据错乱）

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
- **筛选控件「模糊搜索 + 下拉选择」二合一**：一个输入框两种用法（直接打字实时过滤 + 点右侧 ▾ 出全量列表），面板首项放「全部X」兼作清空入口。三个实现要点：① 面板项绑 **`onmousedown`** 而不是 `onclick` —— 焦点在输入框上时点击先触发 blur，`onclick` 收不到（「下拉点了没反应」的头号原因）；② 点面板外收起用 `document` 级 click + `ev.target.closest('.xxx-picker')` 判归属，别在面板上挂 mouseleave；③ **筛选判定不要复用带兜底的取数函数** —— 这类 helper（如按主题反查需求的 `resDemandOf`）找不到时会返回一个默认值，拿它做筛选等于条件恒真、选谁都返回全量；筛选另写一个严格匹配的谓词。
- **下拉/级联选项 hover 用浅蓝底、选中用主色（AntD5 标准）**——用户偏好蓝色高亮，不接受灰色 hover；色值见 `references/visual-reference.md`
- **详情/编辑返回必须回来源视图**：跳转前记 `RES_BACK_PAGE + RES_VIEW_RESTORE`，来源页 init 首次才重置视图；布尔字段（上架/下架）用 Switch 不用"点击切换"标签
- **⚠️ 列表卡片的「状态胶囊」只做展示，切换操作走「更多」菜单（用户纠正）**：给卡片补上架状态时顺手把胶囊做成可点切换，用户回「这个上下架还在"更多"按钮里面来操作，不要点击修改的交互」。规则：**同一状态的操作入口全站只保留一处**（此处＝「更多」菜单），胶囊只显示文字＋配色，`cursor` 保持默认、不挂 onclick、不写 `stopPropagation`；胶囊视觉直接复用同类卡片既有类（如 `.resmg-sw.on/.off`），不新造一套配色。
- **⛔ 只读/无权限的入口直接「不渲染」，不要渲染成禁用态（用户纠正：「很丑，去掉，换个别的」）**：用户看到灰按钮/灰标签的第一反应是「这里本该能用、只是坏了」，不是「这个阶段不该有这个动作」。判据：**这个动作在该阶段是不是根本不存在？** 根本不存在 → 整块不输出（上传按钮、背景图入口、`<input type=file>` 一起不渲染）；只是暂时不可用 → 才用禁用态 + setter 守卫拦（键盘/程序化调用绕得过 UI）。**同理，状态标识用行左侧色条（`box-shadow: inset 3px 0 0 <色>`），不要把胶囊文字标签塞进已有内容的单元格**——标签会和缩略图抢位置、看着挤；整表只读时连标识都不要（只读是默认含义，加了反而喧宾）。写成 `readonly` 属性也是错的：它只挡输入框、挡不住按钮，且「看着能点、点了没反应」比点了有提示更让人困惑。完整三态配方见 `references/editable-table-pattern.md`「行级可编辑性门禁」
- **操作交互优先本页弹窗，不跳转页面（用户偏好）**：跨页函数（openSessionDetail/openFaqFormModal/prefillFaqFromSession 等）+ 弹窗 DOM（_shared.html）+ 全局数据（构建合并作用域）都可直接调用，删掉 switchPage+setTimeout 链即可；"详情/新增"这类操作直接本页开弹窗，用户明确不接受跳转
- **⛔️ PC 端管理页「新增/编辑/详情」一律弹窗，禁止独立 proto-page（党代会项目实测两轮）**：用户两次纠正「点击是空页面，应该是一个弹窗」。独立页面方案（PAGE_META + protoShowPage('xxx') 跳转）在 build.py 合并工程里不可靠——切过去内容空白（init 链/映射未就位）。正确做法：弹窗 DOM + JS 放页面组件内部（参考模板管理 `openTplModal` 模式）或放 shell；**多页共用弹窗时全局函数名必须唯一前缀**（如 `pdShowDetail`/`pdCloseDetail`）——shell 与页面组件同名函数会被后者覆盖（构建后函数声明合并、后定义覆盖先定义），点击变无限递归、弹窗打不开。排查：`grep -n "function 弹窗函数名" pages/*.html shell-*.html` 看有无重名；验证用真实浏览器 `document.querySelector(...).click()` + 查 `getComputedStyle(弹窗).display`，不能只调函数
- **移动端返回栈语义（党代会）**：返回按钮必须 `historyBack()`（pop 栈），禁止写死 `goXxx()` 固定跳转——固定跳转会二次 push 历史栈，导致「模板页↔拍照页对切、永远回不了首页」。配套：①顶层入口函数（goHome/goTemplates/goGallery/goMine/goTerms）进入时重置 PAGE_STACK；②结果页内进入的子页（说明/我的）走 `showPage` 保留栈，返回回结果页；③gallery/mine/terms 返回用 historyBack（从哪来回哪去）。移动端无 tab-bar 时，返回导航可靠性完全依赖栈语义，改任何返回按钮先确认 PAGE_STACK 行为
- **UI 图还原（MIMO 识图 1:1）**：字号对齐项目页面规范（PC 内容 13-14px、按钮 13px），设计稿字号常偏大不盲从；空状态等短内容不塞固定 max-height+overflow 容器（多余滚动条）；**列表/表格类截图复刻：列数与列边界以截图里的表头单元格为准**（旧页常是另一种拆列方式——实测旧页把「类型/名称/创建时间」拆成三列而截图是一列，照旧页改必被退回），单元格内的主/次行结构（主值 + 灰字副值）照做，表头排序箭头这类装饰也照补；完整流程见 skill:mimo-vision-ui-replica
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
- **⚠️ 治本：新写交互不在 onclick 字符串里嵌 id/参数**：DOM 属性 + 事件委托——元素写 `data-id`、`ondragstart="fn(event)"` 不传参，函数内 `ev.currentTarget.getAttribute('data-id')` 取值。零转义零嵌套，天然免疫转义漂移。**任何经脚本写入的 JS 拼串一视同仁（write_file 整页 / Python heredoc 批改 / patch 局部都算）**：把引号参数嵌进 onclick 时，`\'` 经多层转义会被吞成空串 `''`，拼出 `onclick="fn('' + x + '')` 这类非法语法 → **整个合并 script 块解析失败**：headless 探针报 `Uncaught SyntaxError: Unexpected string` 且所有页面函数 undefined（`protoShowPage is not defined`），表现是全部页面空白、切页无反应。改成先定义**零参包装函数**（如 `function ddDemoPreview(){ resToast('预览（演示）'); }` 配 `onclick="ddDemoPreview()"`）或 data-* + 取值函数，一个引号都不用嵌；改完立刻 `node --check` 再构建
- **⚠️ 用 Python 脚本批量写含 `\'` 的 JS 行：反斜杠会在「bash heredoc → Python 字符串 → 文件」多层传递中被静默吞掉**（实测连踩 5 轮：输出行看着像对，实际 `\'` 变成 `'` 或引号个数错位，`node --check` 报 `Unexpected identifier` / `Invalid or unexpected token`）。**对策（按优先级）**：① **优先「只删不加」**——目标行已存在且转义正确时（如同构页 13 的 `previewClick` 与 12 完全一致），只做行删除、不重写该行，天然零风险；② 必须新写时用 `B = chr(92)`、`Q = chr(39)`、`DQ = chr(34)` 做字符拼接，**不在 Python 字符串字面量里写转义**；③ 写完**立即抽出内联 script 跑 `node --check`**（不要攒到最后才验），一处错位就报在具体行；④ 定位漂移后的手修：不要反复重写整行，用 `.replace('\\)', '\\)')` 这类单字符替换（Py 里写 `ln.replace(B + ')', B + Q + ')')`）定点补字符。**判断是否踩坑的信号**：`sed` 输出里该行引号数与预期不符、或 `node --check` 报的列号正好指向某个引号。
- **同一卡片要在两处渲染时，收成一个生成函数而不是各写一份**：列表区与已选弹窗要求「同款卡片」时，正确做法是让弹窗的卡片函数 `return 主卡片函数(c)`（如 `sdlSelCardHtml(c) { return sdlCardHtml(c); }`），**不是**在弹窗里另写一份相似的 HTML——两份必然漂移，用户改一处后另一处不动，会被退回「这个页面的卡片还没改」。配套：弹窗内取消勾选要立即从弹窗消失，需在 `toggleXxxSelect` 末尾判断弹窗是否开着（`m.classList.contains('show')`）再调一次渲染函数。
- **模板字符串数字 id 变字符串**：`openDetail('${s.id}')` → `'1' === 1` false 静默失效。不加引号 `openDetail(${s.id})`
- **onclick 字符串传参 + 数字 id → 交互全失效（高频）**：`onclick="f('1')"` 内 `data.id === id` 永远 false。统一 `String(x) === String(id)` 辅助函数；验证必须真实 DOM click（`document.querySelector(...).click()`），不能只调函数
- **同名函数覆盖（后定义覆盖先定义）**：新函数撞旧函数名 → 旧交互点静默失效。排查 `grep -n "function 函数名" pages/*.html`；新函数独立命名
- **空数组 [] 是 truthy**：判空用 `(val && val.length > 0)`，不能 `val ?`

### 页面组件规范
- **新增功能元素（把手/开关/角标）不得改变原有字段展示**：给已有卡片/容器加辅助控件时，作为独立绝对定位元素挂在外层根，绝不插进已有内容子容器。治本：改前明确"仅新增独立控件、原字段 DOM 零改动"，改后 `git diff` 对比确认字段行未变
- **视图/功能新增先确认"是不是照搬某页既有模式"**："参考 XX 页的按钮/效果"= 样式+位置+交互三样都对齐参照页，动手前定位参照代码按同款照搬；拿不准就先澄清"照搬哪页、按钮放哪"，不自创另一套。**"照搬样式"的实现 = 让本处的 HTML 生成逻辑改吐参照页的类名，并删掉被替换的专属样式**（只留场景修饰类）；**不是抄一份 CSS**——抄了必然两处漂移、改一处漏一处。配方见 `references/prototype-change-verification.md` 第 2 节。**两处必查**：① **先 grep 定位该类定义在哪一页**——build.py 把各页 `<style>` 合并进同一文档，样式类可以定义在任何一页（实测 `.status-tabs`/`.tab-count` 在 01 页、`.res-share-*` 在 07 页、卡片基准 `.sdl-*` 在 12 页），只在使用方页面里找必然找不到，会跑去错的文件改样式；② **只换容器类名 ≠ 照搬完成，要逐个子元素核对字段集**——参照页卡片的「标题 + 副行 + 标签行 + 操作按钮」每一样都要在本处渲染，数据里常已带现成字段（如列表对象早就有 `tags`）却没渲染出来，漏一个用户就会退回「字段不一样，处理一下」；只换外层类名会得到一个长得像、内容缺的同款卡
- **用户没点名参照页时：自己先搜一遍共享层，再决定要不要新写**。合并构建下全站同处一个全局作用域，通用交互几乎都已存在（大图预览 `openResImgView`、一键上屏 `oneClickScreen`、轻提示 `resToast`、编辑页标签弹窗、级联选择弹窗），新写一套的代价是双份行为、双份样式、日后改一处漏一处。动手前先 `grep -rn "function .*[Pp]review\|function .*[Ss]creen\|function .*[Tt]oast" pages/*.html` 扫一遍，命中就直接调；同理，给已有列表/卡片加状态标签时，先找同类卡片已有的标签 CSS 复用（如 `.resmg-sw.on/.off`），不要新造一套配色。
- **"框架在但数据全空" → 先查 init 是否抛 ReferenceError**：用户说没实现 ≠ 真没实现。最常见：init 首次读取未 `var` 声明的变量。排查：browser console 跑 `protoShowPage('页面id')` 看报错 → `grep -rn "var XXX" pages/` 确认声明归属
- **跨页同名变量引用 → 逻辑静默失效**：合并作用域下引用别页变量不会报错，只读到别页初始值（`''`）→ 条件永不成立。引用"像自己的"变量前先 grep 全仓确认归属
- **私有树跨客户串数据**：分类兜底匹配 `themePath.indexOf(分类名)` 须带客户根校验（`themePath` 以客户根开头）
- **工厂函数不透传新增数据字段 → 数据有了但渲染读不到（静默）**：给共享数据加新字段后，只有把字段写进对应工厂函数的构造对象，下游 helper 才能读到；漏了则显示兜底值且无任何报错。加字段后 grep 该数据的生产者函数（XxxCardList/XxxList 类映射函数）确认字段已透传。**反方向同样中招：消费方凭记忆读上游派生函数的输出**（读 `r.title` 而该函数输出的是 `r.name`）→ 字段 undefined → 下游某处 `.replace`/`.slice` 抛 TypeError → **整个渲染函数中断**（症状＝「表格空得连占位文字都没有 + 点新增按钮没反应」，看着像按钮坏了）。写消费代码前先打开生产者函数的 `out.push({...})` 核对字段名，别凭直觉写
- **proto-page 外元素被静默丢弃**（Toast/页脚常见）；**新页面不自动激活**（首页才需自调用 protoShowPage）；**删/改 HTML 后必须清理引用它的 JS**（getElementById null → 异常中断全 JS）；**Tab 结构必须闭合**（数 div 平衡）
- **⚠️ 弹窗「一直打不开」先查 open 函数里有没有 getElementById 取到 null（存量静默 BUG）**：弹窗 DOM 在 `_shared.html`、触发 JS 在业务页，两侧 id 极易对不上。`document.getElementById('X').textContent = ...` 一抛错，函数里**后面那句** `classList.add('show')` 永不执行——症状是「点删除/审核毫无反应，控制台也没有显眼报错」，而且可能是从写下那天起就一直坏的（实测标签管理 + 类别管理两个删除确认弹窗都因此从未打开过，用户以为只是文案要改）。排查配方：把 `pages/*.html` + `shell-*.html` 里所有 `id="X"` 收成一个集合，再扫全部 `getElementById('X')`，差集即候选 → `scripts/find-missing-element-ids.py <项目目录>` 直接跑；`resToast` 这类 JS 动态 createElement 的元素属正常豁免，重点核对 `*Name`/`*Desc`/`*Body` 这类静态弹窗元素。修法：补元素，或删掉那行赋值（值已由另一行写好时）。
  - **反方向同样是静默 BUG：跨文件重复 id → `getElementById` 取到别页那一个（元素存在，只是绑错了）**。build.py 把全部页面合并成一个文档，**id 全局唯一是硬约束**，但各页独立开发时极易撞名（实测：资源编辑页的「类别」字段与主题管理页的主题编辑弹窗都叫 `editCategoryText`，于是本页该字段永远空白、点击无效、控制台零报错，被当成"数据为空"排查了半天）。`scripts/find-missing-element-ids.py` 只查「引用了但不存在」，**查不出重复**——新建/改名字段后额外跑一次重复扫描（收集全部 `id="X"` 按值计数，`count > 1` 即冲突），修法是给冲突方改名并同步该页所有引用（`editCategoryText` → `editCategoryValue`），不是删掉对方的。判据：**字段有 DOM、有样式、就是没内容/点不动 → 先跑重复 id 扫描，再怀疑数据**。
- **⚠️ 共享弹窗的「确定/清除」按钮固定调一个全局函数 → 新页面接入时必须同时补「分派分支」与「本页处理函数」，两样缺一就成了静默半残**（主题管理 V2 实测：标签筛选弹窗 `resMgmtTagModal` 被 07/12/13 三页共用，按钮写死 `confirmResMgmtTags()`/`clearResMgmtTags()`，这两个函数按 `RES_ACTIVE_SCOPE` 分派：有 `schedule`→12、`private`→11，**13 虽已设 `RES_ACTIVE_SCOPE='schedule-plan'` 但分派里没这个分支** → 落回默认分支把筛选值写进了 07 自己的状态 → 13 弹窗内勾选看着正常、点确认后**外面不显示已选胶囊、列表也不刷新**，且**零报错**。与「弹窗 id 对不上」不同，这里元素和函数都在、点击也有反应，只是作用于错误的状态对象。**排查判据**：新页面接入共用弹窗后症状是「弹窗里正常、弹窗外无变化」→ 直接 `grep -n "function confirmXxx\|RES_ACTIVE_SCOPE"` 看分派函数的 if 链里有没有本页的 scope 值。**验证方式**：**必须走真实路径**（`openXxxTagModal()` → `toggleXxxTag('真实标签名')` → `confirmResMgmtTags()`），并同时断言「弹窗外胶囊数 + 列表卡片数」两项；只用 `Xxx_SELECTED.push(...)` 直接塞数据再调渲染函数**测不出这个 bug**（跳过了分派那一跳）。另：断言列表条数要用**过滤函数**（`xxxFilteredList()`），`xxxCardList()` 是不过滤的全量数据，拿它当指标会一直读到基线值。
- **_shared.html 弹窗事件引用的函数名 ≠ 业务页面定义名 → 交互静默失效**：弹窗 HTML 的 onclick/oninput 调 `searchMergeKb()`，业务页实际定义 `searchMergeTarget()`，搜索点击无反应且无报错。弹窗事件函数必须与业务页定义名完全一致；验收时 grep 两侧函数名核对（`grep -n "oninput=\|function 函数名" pages/*.html`）
- **隐藏共享源模式**：共享数据/函数集中在某页（如 02 页 MOCK_RESOURCES/findRes/renderAppSidebar），其他页依赖其合并全局作用域。要"删"该页只能从菜单去入口，**不能直接删文件**（删了会静默打断所有下游页）。页面真要退场时按「页面退役」转成 `_` 前缀共享组件（`_res-core.html` / `_res-upload.html` 这类：不进菜单/路由，`<style>`+`<script>` 全保留，只丢 `.proto-page` 内的 UI 与页面身份）——配方见 `references/dead-code-audit.md`「页面退役」。**删任何页面前先跑符号盘点硬门禁**：提取该页全部函数名 → 全站计数（含该页自身）→ 逐条列出仍被谁引用；「其他页没有引用该页 id」远不足以证明可删
- **共享数据数组不能直接改字段值**：其他页用动态统计驱动 Tab 计数，改了破坏统计。业务页建独立副本（RES_MGMT_TOPICS/PVT_MGMT_TOPICS）
- **⚠️ 改共享字段值前先 grep 全引用；底层语义仍被别页用时新建字段、不改原值**：实例 `ACTIVITY.archiveIndex=328`，首页统计要展示「28 人分享上屏」，但同一字段被结果页/我的页当「第 328 号纪念档案」编号渲染（`'第 ' + ACTIVITY.archiveIndex + ' 号纪念档案'`）——直接改值编号全乱。正确：新增 `shareCount:28` 供首页读，archiveIndex 保持编号用。判据：grep 字段名，若 2 个以上「语义不同」的消费方（展示值 vs 编号/统计）→ 开新字段
- **⚠️ 删除共享集合条目（模板/素材 id）必须先全量替换引用（党代会模板收缩 9→2 实测）**：TEMPLATES 是共享数据，GALLERY（精选墙）、MY_WORKS（我的作品）、state 默认值（selectedTpl）、弹窗/详情都可能引用被删条目 id；漏替换 → `findByTpl(id)` 返回 undefined → 渲染静默崩或空图。PRD 同样会藏引用（能力分层表、模板建议表、大屏轮播版式表、P0/P1 优先级、验收清单）。流程：① `grep -rn "被删id" pages/ shell-*.html` 全量盘点（含展示数据、默认值；shell CSS 死类名可留不删）② 条目删除用正则按 id 锚整行 `re.compile(r"^  \{ id: 'xxx',.*\n", re.M)`（勿依赖整行文本匹配——列对齐空格坑）③ 引用替换用短锚点 `work.replace("'xxx'", "'保留id'")`，**先删行后换引用**（顺序反了会把尚未删除的保留条目也换掉）④ 同步 PRD（grep 全库模板名/能力名）⑤ 构建后 dist 验数据层：grep `id: 'xxx'`（精确到 `id:` 前缀，避免 shell CSS 类名误命中）应归零
- **同页双视图数据源脱节 → 切视图空白 + 统计 0**：列表和卡片用两套不关联数据。修复：重建数据让两视图同源，数字与实际条数一致
- **⚠️ 业务规则要回查承载它的共享判定函数，别信「这个功能已经做了」**：原型里「哪些 X 能进 Y」这类规则通常收在一个共享谓词里（如 `resSelectable(r)` = 播放列表/排播计划选择器的过滤条件），下游多处共用。用户提出或描述一条业务规则时（"下架的资源就不该被选到"），**先打开那个谓词逐条件核对它是否真的实现了这条规则** —— 实测该谓词只判了 `status === '已发布'`、漏了 `visible`，于是这条被当成已交付的需求其实从未生效，而所有下游页面表面都正常。判据：规则涉及「能不能选 / 能不能进 / 能不能带出」时，先定位 `*Selectable` / `canXxx` / `*filter` 函数核对条件，再决定改不改；改一处即全站生效，**不要在调用点各写一遍过滤**。
- **视图/分组枚举错数据词汇表 → 点进去全空**：做"按 X 分组的视图"前先确认枚举来源字段 = 数据对象实际带的分组字段（导航树节点名 ≠ 数据分组字段是两套词汇表）；动手前 grep 确认目标字段真实存在且与被枚举数据同源
- **dist 中共享函数出现 2 次是正常结构**（壳 div + 组件 div + 末尾全局合并大块），勿误判重复注入；grep 计数注意子串误匹配，用 `grep -bo` 看偏移

### 衍生作品与合并展示（同底片多版本/风格化，党代会 V2.1 实测）
- **方案判据（合并展示 vs 独立详情页）**：衍生是"同一张照片/同一对象的变体"（同模板、同底片、同一作品关系）→ 收进原详情页**标签行切换**，不拆独立页。拆页代价：稀释主对象参与感（"第 N 号档案"被同一张脸拆成 N 个档案）、对比切换成本高、要多一个路由+详情页、数据模型反着来（后端本来靠 `sourceWorkId` 归组）。独立页只在"每个变体要作为完全独立的正式作品被高频独立传播/管理"时才值得。完整理由与落地细节见 `references/style-derivative-works.md`
- **数据模型**：派生作品加 `sourceWorkId`（空=原图/主作品）+ `styleId`（空=直出）；归组 = 主作品 + 所有 `sourceWorkId===主作品.no` 的派生。移动端：详情页标签行默认选中进入时的作品；"我的纪念"按组合并卡（主封面 + 派生缩略行 + `✦N` 角标，不折叠）；PC 共用详情弹窗加标签行——**公共字段（模板/微信号/来源）固定展示、作品字段（画风/状态/时间/源自）随标签切换**。派生编号仅后台主键，界面显示"风格名 · 源自 <主编号>"，不显示自身流水号；原型用 CSS filter 表达画风差异，不做真图；enabled 热开关全关时生成入口整体隐藏回主作品直出
- **⚠️ 跨页共享详情数据被覆盖（01 photo vs 02 selection 实测）**：两个页面各自 `buildPhotoDetails()`/`selBuildDetails()` 写**同一个** `window.__PHOTO_DETAILS`，切页后打开详情读的是另一页残留数据（组标签数量不一致）。修法：**每次打开详情前无条件重建自己的数据**（`openPhotoDetail` 里直接 `buildPhotoDetails()`），不要只在为空时构建
- **⚠️ 全局共享列表多脚本兜底初始化用 `window.X = window.X || [...]`**：build 注入页面脚本顺序不确定，任一页面都可能是首个执行者；多页面兜底初始化全局（如 `window.__STYLE_LIST`）时用 `||` 保首个完整定义，后执行页直接赋值会覆盖前页已设完整数据

### 衍生作品方向演化（合并 → 独立行）与异步风格生成模式（党代会 V2.1→V2.6 实测）
- **⚠️ 「合并展示 vs 独立数据行」的取舍会随需求演化反转，别把上一版当最终版写死**：V2.1 拍板合并（标签切换/合并卡/✦角标），用户迭代后嫌合并卡/角标/「源自 xx」不直观，最终反转为**每个风格照片=独立数据行**：PC 照片管理/上屏审核只加一列**单值「成像风格」**（原图行显示"原图"、风格行显示画风名标签），PC 详情弹窗回归单作品只加「成像风格」字段（去掉分组标签行）；移动端同样独立展示、我的纪念每作品一卡（风格卡带画风小标+滤镜）。可复用判据：标签合并适合用户端「同一张脸对比不同画风」；但 B 端台账/上屏按行管理、用户要求一眼区分每张数据时独立行更顺——拍板前给利弊，别预设
- **风格生成 = 异步任务（真实约 90s）的移动端完整模式（党代会 V2.6）**：① 生成入口按钮三态：空闲 / **生成中**（金色光晕呼吸动效；跑马灯流光做过被嫌丑回退）/ **待确认**（右上红点，可带数字）；② 点击「生成」后**弹窗不关、当场把该项按钮刷新成"生成中…"**（完成后自动变「查看」，弹窗开着就实时刷新）——不要点完就关弹窗；③ 结果入**待确认池**（持久化、退出不丢；原型用 `state.pendingStyles` 模拟，刷新重置需向用户说明），**不自动进我的纪念**；④ 提醒多入口同源（红点计数同一数据源）：首页入口按钮红点 + 我的纪念顶部「风格照生成」区（**生成中+待确认全量列出**）+ 详情页入口红点（按底片过滤）；⑤ **查看即已读清红点**（不必等确认）；确认三选一（保存到纪念照/重新生成/放弃）才移出池；⑥ 进详情默认原图，不自动跳已上屏风格；⑦ 前台**不展示作品流水号**（编号仅后台统计/PC 台账用），界面只留访客档案号「第 N 号纪念档案」、风格详情只显示画风名；⑧ 现场风采/墙上风格照标识**写画风名**（如「水墨国风」金字角标），**禁止出现「AI 风格」字样**（对外口径无 AI）；⑨ 生成口径：**以已生成的纪念照成品（含模板框与文字层）为输入做画风迁移**；提示词必须强约束「相框与文字原样保留、不重绘、不改字」（模板文字/边框不被 AI 重绘糊掉，合规稳）；风格照「拍同款」= 用底片模板拍新原图、不继承画风
- ⚠️ 点击类反馈缺失先查弹层归属层级，别猜逻辑：「按钮点击无反应」在移动端高频真因=弹层 DOM 挂在隐藏 .page 或壳外（见上文三层放置坑），先 grep 弹层 id 相对 page/shell 的位置，再查函数
- **演示态优先用数据打标做确定性触发（如画风项 `demoFail:true` → 该画风生成必失败），而非演示菜单注入**：测试者可随时走正常路径触达失败/超时/空态链路验收，不用翻演示菜单找入口，也不依赖特定操作顺序；优于只在演示 FAB 里藏一个触发项

### 弹窗/详情字段
- **选择类弹窗（分享/批量）的勾选只能由复选框触发，卡片与图片点击不许改变勾选态（用户明确纠正）**：用户原话「点击图片是选中/取消的效果，不对，这个只能是选择复选框来勾选」。卡片拆成三类点击区：① **复选框** → `onchange` 切换勾选，`onclick` 只做 `stopPropagation()`（缺它会把点击冒泡到图片区，同时触发大图）；② **图片区** → 开大图预览；③ **文字区/卡片本体** → 不挂 onclick，`cursor` 保持默认（图片区给 `zoom-in` 提示可点）。配套：**「查看」按钮的语义是跳资源详情页**（先关当前弹窗再 `openResDetail`），不是弹窗内看大图——两者别做混。改完用 headless 逐项验：点图不改勾选、点文字区无变化、点复选框不误开大图
- **卡片样式两分法（用户术语，必须沿用）**：**查看样式**＝列表页用的信息全卡；**选择样式**＝「资源分享/审核」弹窗的卡片样式**减掉「查看」按钮**（保留标题 + 所属主题 + 标签）。**选择页页内用查看样式，选中后的弹窗里用选择样式**——选之前要信息全，选之后只需确认。实现＝让本处生成逻辑吐参照页的**同一个卡片类名**（如 `.sdl-card`），不是抄一份 CSS；参照页自身的卡片需同步改时（如去掉「查看」按钮），两边一起改。
- **已选计数的可点范围＝只有数字**：计数短句里仅数字可点开已选弹窗（数字 700 加粗 + 同色下划线作可点提示），整条文字不挂 onclick。弹窗标题「已选资源」、底部「取消 / 确认添加」；卡片网格留足间距（gap 约 18px，卡片不贴边框与相邻卡）。
- **共用弹窗/详情页字段必须覆盖所有入口列表字段**（党代会）：照片管理详情页 = 上屏展示审核详情页，用户明确要求「字段信息注意要完整，比如在照片管理详情页要包括'上屏展示审核'的所有字段」。设计共用详情弹窗前，先枚举各入口列表的表头字段并集，逐项确认弹窗都渲染；构建后 grep dist 确认每个字段字符串出现（列表 + 弹窗各至少一次）
- **PC 端弹窗表单字段遵循「用户给什么就留什么」**：模板管理弹窗用户明确「能力类型、排序权重、字段都去掉」——先做完整字段版本再按用户删减是常态流程；**不要自己反复加回已删字段**（保留在数据层即可，表单不展示）。弹窗字段精简后要同步清理三处引用：DOM 元素、open 回填、save 读取，`grep tpl-cap|tpl-sort|tpl-hot` 残留归零

### 表格渲染
- 动态渲染改 JS 模板/数据源，不能只改 HTML；批量加列后数 `<td>` 数量；tds 索引随列数同步更新；级联筛选三处缺一不可（下级初始空 + 上级 onchange + JS 填充下级），filter 和 export 弹窗都要实现
- **PC 管理页新增字段 = 8 处同步，缺一静默（模板管理加「方向」字段实测）**：① 表头 `<th>` ② 数据数组每项补字段 ③ 渲染行 `<td>` ④ 空状态 colspan +1（列表无数据占位行）⑤ 弹窗表单 DOM ⑥ open 回填 ⑦ save 读取 ⑧ 新增 push 构造。构建前逐项 grep（字段名出现处数 + th/td 计数 + colspan）确认齐全；只改表头不动渲染行 → 整列消失（无报错），只改表单不读写 → 保存后字段丢失
- **静态表格缺列（静默，无报错）**：表头 th 数与数据行 td 数不一致 → 整列数据消失。实例：未命中统计分组视图表头 10 列、7 行静态数据均只有 9 个 td（缺 AI分类 列），浏览器不报错。改静态表格后必须数 th/td 数量对齐；有同源数据数组时对照字段逐一核对
- **源文件正常但 dist 缺列 = dist 是旧构建**：源文件 10 td/行、PC dist 也正常，只有 mobile dist（7月23 旧构建）缺列。排查：先确认源文件每行 td 数（execute_code 提取表格区域统计，别靠肉眼读 sed 输出——缩进异常会误导），源文件对就重建 dist，不要改源文件

### CSS 与视觉
- **⚠️ 全屏预览层（大图/视频）的 z-index 必须高于弹窗遮罩 `1000`（实测，症状=「点了没反应」）**：shell 的 `.modal-overlay` 是 `z-index:1000`，页内自写的全屏浮层常手贱写成 `999`（如 `.res-img-modal`）——**从弹窗内部打开**大图时它被弹窗压住，看起来像点击无效，其实已经打开（`display:flex`）只是看不见。排查：`getComputedStyle(浮层).zIndex` 与最近弹窗的 zIndex 谁大；修法把全屏层提到 `1100`。该样式常在**多个页面各写一份**（如 07/11 各一条），改一处要 grep 全站同步
- **⚠️ 验收判据别只看类名/标记，看实际生效值**：查弹窗是否打开要按它的真实机制判——有的用 `.show` 类、有的用 `style.display`（如全屏大图）；查页面是否切过去要看 `getComputedStyle(page).display` 而不是找 `.active` 类。验证脚本写错判据会得到「功能没生效」的假结论，白排查一轮
- tooltip 只用 `::after`，th 需 `white-space:normal !important` 防竖排
- **⚠️ tooltip 气泡被容器裁切 = 祖先 overflow:hidden**：气泡默认 `bottom: calc(100%+8px)` 向上弹出，一旦触发元素在带 `overflow:hidden` 的容器内（如 `.table-card` 为圆角裁剪设的 hidden、`.content-area` 等），气泡超出容器顶边就被裁掉下半截，z-index 再高也没用。判据：截图气泡某一边被齐平切掉、正好落在容器边界。修法：把定位改成向下弹（`top: calc(100%+8px)` 覆盖下方数据区是标准 tooltip 行为、不再碰容器顶边）。不要靠加大 z-index（对 overflow 裁剪无效），也不要动容器 overflow（会破坏圆角裁剪、影响所有同类表格）。改动落在项目级 `prototype/shell-{template}.html`（build.py 优先用项目 shell，见 3.5）时，需同时重建正常版+标注版 dist 保持一致
- **⚠️ 负 margin 上浮的重叠卡放在滚动容器里会被整段裁掉**：滚动容器（`overflow-y:auto`）会裁掉子元素超出其边界的部分——用 `margin-top:-42px` 做「白卡压住头图」的效果时，上浮段正好落在容器边界外被整段切掉（症状：卡片顶部/图标上半截消失，看起来像被上层图盖住，用户会报「表情/图标被遮住了」）。**修法：把这层从滚动容器里移出去**，改成「头部图 → 上浮卡 → 滚动区」三个平级子元素；父级 flex 容器不设 overflow，负 margin 就只形成覆盖、不产生裁切。判据：任何「A 压住 B」的重叠效果，A 和 B 必须处在同一个**不裁剪**的父级里。**改完立即 grep 同类元素一次扫完**——同一个原型里「上浮压色块」的位置常不止一处（首页入口卡、我的页统计卡各一处，前一处修完后一处仍会在用户下一次打开时报同一个症状），交付前把所有负 margin / 绝对定位上浮的元素逐个确认过父级不裁剪
- grid 容器内块级元素横排变形 → 块加 `grid-column: 1 / -1`
- **状态 Tag「可点但克制」设计模式（B 端标准，用户委托"参考标准B端产品设计"）**：状态本身可点击打开详情时（如未命中问题→已新增/已合并→开知识详情），用 AntD Tag 风格 + `.status-link`，而不是普通 action-btn：`cursor:pointer` + hover 加深（`filter:brightness(1.06)`）+ `box-shadow:0 0 0 1px currentColor inset` 内描边 + 微上浮 + 文字后 `›` 箭头。色语义区分：新增=AntD 成功绿 `#52c41a`（bg `#f6ffed`/border `#b7eb8f`）、合并=AntD 主蓝 `#1677ff`（bg `#e6f4ff`/border `#91caff`）。终态（已忽略）保持普通 badge 不可点。CSS 放 shell `<style>`（页面禁止全局 style）：两个状态类 + `.badge-status.status-link` 通用 hover
- **折叠菜单收纳 + 置灰两层语义**：操作过多收进三点 `.more-btn`（svg 三圆点 + hover 蓝 #1677ff）触发 `.more-menu`，`.more-menu-item.disabled { color:#c0c4cc !important; cursor:not-allowed }` 表终态禁用。**置灰必须分清两种语义**：①功能弱化（可点低调——用户曾明确"忽略按钮不用强调灰色"）②终态禁用（不可点，处理完该行只剩详情可点）——动手前先确认用户要哪种，别混。展开交互：`toggleMissMenu(ev, elm)`（`ev.stopPropagation()` + 先关闭全部再开当前）+ `document click` 外部关闭（`!e.target.closest('.more-menu-wrap')` 时全关）；菜单项动作经统一 `missMenuAction(type, a, b, c)` 转发，新增/合并共享菜单 HTML 模板函数 `missMenuHtml(tr, disabled)` 从行 td 取参数、disabled 时输出无 onclick 的灰项（零转义）
- **局部状态切换不要整页重渲染**（用户纠正）：卡片开关只更新该卡 DOM（classList + 改节点），数据源同步改，不重渲染列表
- **演示优先原则（用户多次）**：原型是 demo，避免"真实系统才需要"的自动化行为；状态变化用视觉表达（置灰蒙层、徽章变色）。
  - **⚠️「演示要原地不重排」与「业务方要求按规则排序」会先后出现，以最新口径为准，且原型只做「看得见的那一个效果」**：同一处先被要求撤销下架沉底（要现场演示开关效果），后续业务方又要求下架资源往后放。正确落法 = 实现**那一条可见的效果**（下架 → 移到同类别的最后、其他卡片顺次前移一位），**不实现完整排序规则**（类别顺序 + 创建时间逆序这类只写进 `docs/PRD待更新清单.md`），**也不按规则重排演示数据**。判据：用户描述的是一个「能一眼看出来的变化」还是一个「排序/计算规则」？前者做效果，后者记文档——按规则重排演示数据必然被退回
- **主操作双按钮并列防沉底（用户偏好）**：分享/提交等传播关键按钮不能沉在页面底部（一屏看不到容易遗漏——用户原话"原来在最下面，一屏看不到"）——与"保存"并成两个并列主按钮，并保持**文案字数对仗**（`保存本地` / `分享上屏` 4字对4字）。设计时先问：这个动作是不是用户容易漏掉的关键动作？是 → 提到主操作区
- **原型效果最小化（用户多次拍板）**：保存等动作点击直接 toast 即可，不做长按弹层效果（"不浪费时间做效果，这个是原型"）；画风/滤镜等视觉示意用简单 CSS（filter）表达，不花精力做真图——**功能与逻辑讲清楚优先**；常驻区块非必要不保留（详情页"更多风格"大片卡区位 → 折叠进标签行 `+ 加个风格` 轻量弹层入口），考虑用户交互优先
- **政务移动端文案禁用内部术语（用户偏好）**：面向现场年纪偏大的用户，界面文案不得出现「模板 / 素材 / 底片 / 原图」这类团队内部词——用户视角是「相框 / 纪念框 / 照片」。写或改文案前先自问「这个词现场用户会不会说」；拿不准就给 2-3 个候选让用户挑，并标注字数（手机一行约 18-20 字 @12px 才不折行）。用户会直接采用你给的候选原句，所以候选要能直接用。
- **示意缩略图不要继承「当前对象」的视觉，也别把区分度改没**：列表/弹层里的风格缩略图若沿用当前模板底图（`.photo-bg` 挂 `data-tpl`），一旦文案写「不带当前模板」就自相矛盾——去掉继承属性即可。但**别顺手把底色统一成中性色**：CSS filter 示意在低饱和底上几乎无差异，几张缩略图会长得一样、演示失效；改为按风格各给一个示意底色，兼顾「不继承」与「可区分」。
- **⚠️ 置灰禁用 opacity/filter，用白色蒙层 ::after（两轮）**：卡片加 `opacity` 或 `filter:grayscale` 会创建**新堆叠上下文**，把卡内绝对定位的「更多」下拉困在本卡图层里，被相邻卡片元素（如 hover 查看大图层）遮挡。正确做法：`.card.off::after { content:''; position:absolute; inset:0; background:rgba(255,255,255,.45); z-index:<盖过卡内悬浮层>; pointer-events:none; }`——白蒙层不建堆叠上下文、视觉轻（用户嫌 opacity+grayscale 太重）、菜单(z100)保持最上层；**不要给信息区再单独加 z-index 层**（会反过来压住菜单）
- **需求边做边追加是常态**：一轮任务常收到 3-10 条增量修正，正常节奏 = todo 清单累积 → 统一实施 → 一次构建统一验证 → 单次完整状态报告；不要每条小改都单独走完整构建+报告循环
- JS 生成的 HTML 用 shell 未定义的 CSS 类 → 下拉平铺无样式。核对可用 CSS 类清单
- **CSS 布局陷阱（aspect-ratio/max-height 冲突、align-self 收缩）→ 详见 `references/layout-intelligence-pitfalls.md`**（2026-08-11 Critic 实测，含修复 CSS；执行时遇媒体比例失真/区域收缩先查该库）

### 构建与编码
- **⚠️ 双端项目（移动端 + PC 后台）`proto-config.json` 的 `template` 必须写 `"pc"`**：`build_pc` 读 config 的 `template` 字段选 shell **和输出文件名**（`build_pc` line ≈186、318），而 `build_mobile` 固定用 `shell-mobile.html`、输出名固定 `<项目名>-mobile-原型.html`。若 config 写 `"mobile"`，跑 `pc` target 会把 PC 页面注入**移动端壳**并输出成 `-mobile-原型.html`，**静默覆盖移动端产物**（症状：dist 只剩一个文件、内容里是 PC 页面 + 移动端壳；构建日志打印「模板: mobile」）。判据：每次构建后核对日志的「模板:」与产物文件名。
- **双端项目结构（一套 config 服务两端）**：`prototype/pages/mobile/` + `pages/pc/`（build 的 `resolve_pages_dir` 按 target 优先读子目录，无子目录回退 `pages/`）、`prototype/shell-mobile.html` + `shell-pc.html`、`publish-config.json` 配两个 slug（`prototype/dist/*mobile*.html` / `*pc*.html`）、`proto-config.json` 的 `template` 写 `"pc"`。
- **图片资源路径用 `../assets/xxx.jpg`**：dist 与 assets 同在 `prototype/` 下，本地打开正常；`publish-preview.sh` 发布时会自动把 `../assets/` 重写为 `assets/` 并复制 assets 目录（>300KB 自动转 WebP 1080px q82），**不要手工写成 `assets/`**（本地会全裂）。
- **同一项目同时构建 PC + Mobile：页面分目录 `pages/pc/` 与 `pages/mobile/`（build.py 新增 `resolve_pages_dir`）**：build_pc/build_mobile 各自优先读对应子目录，无子目录回退 `pages/`（老项目不受影响）。此时 `proto-config.json` 单一文件服务双端（name/primaryColor/tabBar 共用），shell 各自独立（shell-pc.html + shell-mobile.html）。构建命令分别跑 `pc` 与 `mobile` 两个 target
- **默认落地页 = 字母序第一个页面的自调用 protoShowPage，与菜单无关**：隐藏菜单项后打开原型仍落在被隐藏页。机制：build.py 按文件名排序，首个含 `if (typeof protoShowPage === 'function') { protoShowPage('xxx'); }` 自调用的页面成为默认页；菜单只是 renderAppSidebar 的显示层。修法：改那个页面尾部的自调用目标（如 `protoShowPage('topic-mgmt')` → `protoShowPage('resource-mgmt')`），重建即可；不要去动 proto-config 或 shell。改完默认页必须检查该页尾部有无残留的**手动 `init_xxx()` 调用**——它在 protoShowPage 之后执行，会用被隐藏页的 init 覆盖面包屑（实测：打开即显示「首页/内容管理/V2主题管理」，点一下菜单才恢复正确的「首页/资源管理/公共资源」）；init 一律由 protoShowPage 内部按需调用，页面尾部禁止手动调
- **默认落地页变体：全程无任何自调用时（smart-tour-guide 实测）**：首屏 = build 注入的**第一个 proto-page**（按文件名排序，dist 里第一个 `data-page-id` 无 `display:none`），面包屑 current 与菜单 active 都写死在 shell。要让首屏=目标页：在目标页 script 尾部加 `if (typeof protoShowPage === 'function') { protoShowPage('目标pageid'); }`（页面脚本按文件序合并成一个块，**最后一个自调用生效**，仅加这一处即可覆盖默认显示），并同步 shell 的 `<span class="current">` 面包屑文本与 menu-item 的 active class。验证：dist 里 grep `protoShowPage('目标'` 存在 + 面包屑文字已改
- **⚠️ 新标签页直达某页 = hash 路由要自己加（build.py 没有）**：想实现「点一行 → 新标签页打开详情页」（`window.open(location.pathname + '#pageid')`）时，新标签页加载后**不会自动路由**——build.py 只注入 `protoShowPage` + `_pageTitleToId`，不读 `location.hash`。做法：在**项目级 shell**（`prototype/shell-pc.html`）`</body>` 前加一小段脚本，DOMContentLoaded 时读 hash → `_pageTitleToId[h] || h` → `protoShowPage(pid)`（此时页面自己的默认页自调用已执行完，后跑者覆盖前者，正好直达）。验证：直接打开 `xxx.html#demand-detail`，可见页与面包屑都应是目标页；dist 里 grep `location.hash` 应有且仅 1 处（来自 shell）。跨页传参不要靠新标签页的共享全局——两个标签是独立 JS 环境。
- **⚠️ build_mobile 两个缺陷（党代会项目实测，已修复 build.py）**：①`resolve_shell_path("mobile")` 漏传 project_path → 项目级 `prototype/shell-mobile.html` 永远不被读取，永远用模板级 shell（改项目 shell 无效）；②已修复：build.py 现在做 `output.replace("{{DEFAULT_PAGE}}", default_page)`（default_page=首个组件 id），模板/项目 shell 直接写 `ProtoRouter.init('{{DEFAULT_PAGE}}')` 即可；验证：dist grep `DEFAULT_PAGE` 应为 0
- **⚠️ mobile 构建不处理 `_shared.html`**：build_mobile 的 glob 会把 `_shared.html` 当普通组件解析，**没有 PC 那样的共享组件剥离逻辑**；且按文件名排序 `_` 排最前 → 若它无 PAGE_META，默认页取到空 id → 白屏。修法：移动端全局浮层（toast/弹窗）直接放 01 页（DOM 合并后 fixed 定位全局可见），不放 `_shared.html`
- **⚠️ 移动端「验证全绿但浏览器白屏」= 默认页从未激活（党代会项目）**：verify-output.py 全过 + node --check 0 + div 平衡 ≠ 不白屏——这些都不检查路由启动。真实白屏根因链：① 项目级 shell-mobile.html 自定义/重建时**丢掉了模板的启动块**（`DOMContentLoaded → ProtoRouter.init()`），页面 div 全在但无任何 active；或 ② init 写死 `'m-home'` 而页面组件实际 id 是 `home`（无前缀）→ hash 找不到 target、默认页不激活。判据：dist 里 `grep -c "ProtoRouter.init"` 应为 1 且参数 == 首个组件 id（由 build.py 替换 `{{DEFAULT_PAGE}}`）；打开 dist 后 URL hash 应出现 `#/home`、`read_preview` 文本能看见首页内容。修法：模板 shell 写 `ProtoRouter.init('{{DEFAULT_PAGE}}')`（禁止写死带前缀的页 id），项目级 shell 重建时保留启动块。**用户报「打开空白」第一时间 grep init 块与页面 id，别停留在自动验证全绿**
- **⚠️ 移动端默认形态 = 无底部 tab-bar**：扫码直入式 H5 落地页不要底部导航菜单。`proto-config.json` tabBar 留空数组，shell 里删 `<nav class="tab-bar">`（连同 `.tab-bar*` CSS）。首页即入口（大按钮进创作/现场精选/我的），页面内 `back-btn` 返回导航
- **⛔️ 移动端不要模板级 shell 的评审布局（用户明确要求）**：用户要"正中间显示移动端原型、全面屏、无刘海、不要页码导航、仿真状态栏"，拒绝旧 shell-mobile.html 的左手机+右文档 review-shell。**模板级 `src/shells/shell-mobile.html` 即全面屏壳**（body flex 居中 + mobile-shell 固定比例 + 仿真状态栏 SVG + home-indicator 手势条），旧 review 布局模板已删除；新项目首次构建复制到项目后即可用，一般无需再自定壳。真实机型比例（小米17=2656x1220→360x783.6px），低视口用 media query 等比缩放（zoom 0.9/0.82/0.72）。模板壳不注入页码导航（base.js 的 `.page-nav-btn` 查询对缺失容错）
- **⚠️ 移动端全局浮层（toast/演示菜单/公共弹层）必须放 shell，不能放页面组件 div 内**：`.page` 未激活时 `display:none`，放组件内的 fixed 浮层全部不可见——toast 放 08 页组件里、其他页调用 toast() 时元素存在但被父级隐藏。正确做法：toast、演示 FAB/菜单等跨页浮层 DOM 放 `shell-mobile.html` 的 `mobile-screen` 内（页面 div 之外），演示/全局函数也放 shell 独立 `<script>`（在 base.js 之后追加）；与 PC `_shared.html` 弹窗机制不同，mobile 全局浮层没有共享组件容器
- **⛔️ 移动端弹层必须 `absolute` 定位，禁止 `fixed`（党代会项目）**：`position:fixed` 相对**浏览器视口**，弹窗遮罩会覆盖整个浏览器窗口而不是手机框架内（用户报「照片使用说明弹窗跑到手机壳外面」）。修法：所有业务弹层（说明弹窗/save/submit/wall-detail/leave/full-photo/toast）统一 `position:absolute; inset:0`——它们挂在 `.page` 容器（`absolute inset:0`）内，absolute 自然相对手机屏；toast 必须位于 `mobile-screen` 内（shell 里从 mobile-screen 外移进来）。唯一保留 `fixed` 的是浏览器级演示工具（demo-fab/demo-menu），它们本来就该浮在手机壳外。⚠️ 模板库 `src/assets/base.css` 自带 PC 风格 `.toast{position:fixed;top:60px}` 与 `.modal-overlay{position:fixed}`，构建时会拼进 mobile dist——项目 shell 里同级规则在后（CSS 后者胜）即覆盖生效；grep 出多条 `.toast` 规则属正常，按 CSS 顺序判生效值
- **⛔️ 全局弹层（多页打开：确认卡/公共 modal）三层放置坑（党代会 V2.6 实测）**：① 放业务 `.page` 内 → 从别的页面打开时该 `.page` 是 `display:none`，弹层不可见（症状=「点确认无反应」）；② 放 body 层（`.mobile-shell` 外）→ absolute 失去 positioned 祖先（`.mobile-screen`），相对浏览器视口 → **遮罩覆盖整个浏览器窗口**（症状=「弹窗弹到浏览器全屏」）；③ 正确位置 = **`.mobile-screen` 内、`.app-root`/页面注入点之外的全局浮层区**（与 consent-modal/toast/home-indicator 同级；`.mobile-screen{position:relative}` 提供定位上下文）。shell 层级速查：`.mobile-shell`(360px 手机框) > `.mobile-screen`(relative/flex) > `.app-root`(页面注入标记 `<!-- 组件 page div 注入处 -->`) + 全局弹层区；`.st-mask`/`.st-sheet` 业务弹层是 `position:absolute`，必须挂在这个 positioned 容器内。验证：dist 中弹层 id 应位于 page-* 之外、home-indicator 附近、demo-fab 之前
- **移动端底部弹层（bottom sheet）高度 / 滚动 / 隔离四条（党代会 V2.6「更多风格」弹层实测）**：
  ① **封顶高度用 `%` 不用 `vh`**——`vh` 相对**浏览器视口**，会超出手机壳；业务弹层挂在 `.page`（`absolute inset:0`，相对手机框）内，`max-height: 76%` 才对齐手机框。
  ② **头部固定 + 列表内滚**：容器 `max-height` + `display:flex; flex-direction:column`，头部（标题/说明/关闭）`flex-shrink:0`，列表区 `flex:1 1 auto; min-height:0; overflow-y:auto`。**`min-height:0` 必写**——缺了 flex 子项不收缩，内容溢出弹层。
  ③ **共用基类必须用专属修饰类隔离**：同一基类被多个弹层共用时（如 `.st-sheet` 被「更多风格 / 确认风格照 / 生成中 / 生成失败」四个共用），只在其中一个改布局，新规则一律挂修饰类（`.st-sheet.st-style-sheet`），**禁止直接改通用 `.st-sheet`**——直接改会让另外几个一起变 flex 容器、按钮行被压缩。动手前先 `grep -n "<基类名>" shell-*.html pages/**/*.html` 盘点复用方，别假设只有一个弹层。
  ④ **不要在 open 函数里重置列表 `scrollTop`**：若存在「弹层开着时点击某项 → 重渲染列表」的路径（如 `openStyleSheetIfOpen()`），重置会把用户甩回顶部。
- **⚠️ 弹窗语义：提示弹窗 ≠ 同意弹窗**：「照片使用说明」这类告知性弹窗是**提示**不是**授权门槛**——确认按钮用单个「我已了解」，不要做成「暂不使用 / 同意并使用」双按钮同意式。判据：内容是告知信息（照片用途/流程说明）→ 单按钮提示；涉及服务条款/隐私授权/不可逆操作 → 才用双按钮同意式。用户原话：「这个是提示弹窗，不是需要必须点击同意之类的」
- **build.py 吞 `<script src>` CDN 标签**：页面里写 `<script src="...">` 会被静默丢弃（只提取内联 `<script>`）→ CDN 库必须 JS 动态加载（createElement('script')），详见 `references/ui-system-lucide-migration.md`
- **HTML div 不平衡 → build.py 静默产出空页面**（不报错、构建成功、页面空白）。排查：浏览器元素全 MISSING → 查 dist 该页内容长度（len≈2）→ 源文件 div 深度扫描
- **pages 目录禁止 `.bak.*.html`/临时 HTML**：build.py glob("*.html") 扫入当页面 → dist 重复两遍。备份用 git 或改 `.txt`
- **脚本生成 JS 数组元素必须带逗号**：漏逗号 → node --check 报 `Unexpected token '{'`（报错在漏逗号元素的后一行）。**往已有数据数组尾部追加条目时，先看原最后一项有没有尾逗号**——手写数组常写成 `... }` 换行接 `    ];`（无尾逗号），直接插入就成 `} {`，报错行指向你新加的那条，极易误判成自己写的对象字面量有错。判据：先看数组结尾那三行原文（或 grep `];` 定位）再决定要不要补逗号；同类风险也存在于「数组中间插入」——插入点前后的两个元素都要有逗号
- **⚠️ 批改 JS 数据数组先防「列对齐空格」破坏固定空格锚点（模板管理加方向字段）**：数据字面量常按列对齐补空格——同一数组里 `{ id: 'shenghui', name: ... }`（单空格）与 `{ id: 'fenjin',   name: ... }`（多空格对齐）空格数不同；固定单空格锚点 `id: 'xxx', name:` 可能第一行碰巧成功、第二行起 assert count==0 白跑（若没断言则整批静默漏改）。修法：逐行锚点用正则 `id: 'xxx',\s+name:`（\s+ 容忍对齐空白），或先 grep 实际行的原始空白再构造锚点；批量遍历行一律按每行唯一 id 定位，不依赖列对齐
- **正则重写 JS 大数组会吞数组后的声明（最严重）**：`re.sub(r'var X = \[.*?;\])` 锚点不精确会静默删数组后的 var 声明 → 运行时 `X is not defined` → 页面全空。安全规程：替换前 count 锚点唯一；替换后 git diff 审查所有 `-` 删除行
- **正则替换字段后必须 grep 实测**：group 边界不含闭合引号会静默丢引号（替换计数正常但数据已坏）
- build.py 写文件必须 `newline=''`（CRLF 污染 `\n` 正则致 JS 崩溃）；str.replace 注意 `\r\n`、unicode 转义、区域边界
- **修改源文件前先备份（git 或 .bak.txt）**；**不是 git 仓库的独立原型项目要整目录备份**：`cp -r` 连 `assets/` 一起拷，否则备份件图全裂打不开——用户说「先备份」要的是一个能**独立打开**的回退点，不是一串裸 HTML
- **⚠️ patch 的唯一匹配会被「只差一个前导字符的近似行」破坏**：渲染函数里成对的三元分支（表头 `isRej ? '<tr>…' : '<tr>…'`、两种页签各一行表头、空态与正常态两行）常只差行首的 `?` / `:` / 缩进一格，把整行交给 old_string 时模糊匹配认为两行都能中，结果是替换落到错的那一条，或反复「不唯一」改不动。判据：该片段在文件里 `count > 1` 且差异只在行首单个字符。修法：改用 Python 精确串替换并 `assert s.count(old) == 1`，或按行号整行重写；**不要**为了凑唯一去截更长的上下文（截长了又踩缩进/转义漂移）。
- **⚠️ patch 的 old_string 与 new_string 必须换行对称**：old_string 以换行结尾而 new_string 不以换行结尾时，后一行会被并到前一行（实测：数据数组相邻两行被合并成一行，语法仍合法所以不报错，只是格式坏掉、且下次锚点对不上）。改完扫一眼 diff 的上下文行，发现合并用等长换行重写。
- **patch old_string 范围过宽 → 误删相邻弹窗/节点**：插入新弹窗到 _shared.html 时，old_string 若把上一个弹窗整块包含进去、而 new_string 没写回它 → 该弹窗被静默删除、页面功能缺失。防范：patch 只锚定插入点附近 2-3 行（如尾部 `</div>` 容器 + 注释行），不把整块旧弹窗作为 old_string 起点；**new_string 必须原样重述 old_string 中所有要保留的行**——只写了前一两行就等于把后面整段删掉，而残留代码常仍能通过 `node --check`（语法合法所以不报错），只有读 diff 的 `-` 行才发现，恢复要从 git 基线补回；执行后立即 git diff 审查 `-` 删除行。恢复：误删后补回原块（从 git show HEAD:文件 取原文）再验证 div 平衡。**纯删除（new_string 为空）时尤其危险**：HTML 里 `</div>` 大量重复，模糊匹配会漂到相邻锚点，`-` 行里会出现你没打算删的闭合标签；删完必须重读该区域确认标签配对（`<div`/`</div>` 计数相等且闭合落在正确的块上），不能只信 patch 的成功返回——标签位置互换后计数依然平衡，只有读结构才能发现
- **⚠️ patch 对含转义串的整函数块会造成缩进错乱+转义漂移双害**：old_string 缩进不精确匹配时触发。治法：含转义的整函数块不用 patch 单次替换——用 Python 从 git 基线 `git show <commit>:文件` 取原函数按字节重建，只注入改动行；改完 `node --check` + 与基线逐行 diff 确认字段零改动
- **⚠️ patch 的 new_string 同样会二次转义（实测，坑的新变体）**：已知 patch 改含 `\'` 的行会漂移转义；实测即使只改 new_string 里**新写**的 `\', \'copy\')` 拼接，也会被写成 `\\'copy\\'` → SyntaxError。症状：diff 输出里出现 `\\\\'`。修法：写一个 3 行 Python 脚本做精确字符串替换（chr(92) 构造反斜杠避免脚本自身转义），改后立即 node --check。治本不变：新写 onclick 拼接用 data-* + 事件委托，不写 `\'` 嵌套
- **恢复错误实现后 git 状态显示 `MM`（不是单 M），别困惑**：`git checkout <commit> -- 文件` 会把该文件抓进**暂存区**（=干净基线），随后你新增的改动落在**工作区**（MM = 暂存区M + 工作区M）。确认"暂存区=基线、工作区=新实现"用 `git diff`（工作区vs暂存区）看差异、用 `grep -c 新函数 文件` 确认无旧实现残留；commit 前 `git add` 覆盖暂存区即可。原始备份 `.hermes-backup/` 留在项目根不影响 build/git，用处：改坏时对比"当前 vs 原始"确认字段/转义是否被误改
- **⚠️ 用 Python 逐锚点替换前先归一化换行（CRLF 文件用 LF 锚点必败）**：pages/*.html 等多是 CRLF。若 `open(..., newline='')` 读原始文本，你在三引号里写的 `\n` 锚点（LF）对不上文件 CRLF 行尾，`s.count(old)` 静默为 0、assert 直接 SystemExit 白跑（本会话 `markMissSupplemented` 锚点即因此首跑失败）。安全配方：读 `newline=''` → `s = s.replace('\r\n', '\n')` 归一化 → 全部替换串用 LF、每个锚点先 `assert s.count(old)==期望数` → 写回 `open(P,'w',encoding='utf-8',newline=None)`（写入模式自动把 `\n` 转回 `\r\n`，保持原格式，git diff 干净）。注意断言在替换前就抛错、尚未落盘，文件安全——重跑时统一成 LF 锚点即可
- **⚠️ 写回禁止「手动转 CRLF + newline=None」双转换 → \r\r\n 累积（实测，同文件多轮修改必爆）**：若误解旧配方写成 `open(P,'w',...,newline=None)` 且写入前又手动 `s2.replace('\n','\r\n')`，Windows 上 newline=None 会把每个 `\n` **再**转一次 `\r\n` → 首次写回行尾变 `\r\r\n`；同一文件第二轮起 `s.replace('\r\n','\n')` 只剥掉一个 `\r`，锚点明明看着一致却全部 `count==0` assert 白跑（本会话 01-home.html 两轮修改后行尾 `\r\r\r\n`）。修复存量污染：`re.sub(r'\r+','\r',text)` 折叠多余 `\r`。**推荐写回配方（二进制，零翻译）**：`raw=open(P,'rb').read()` → `crlf = b'\r\n' in raw` → `work = raw.decode('utf-8').replace('\r\n','\n')`（LF 操作版）→ 替换（锚点用 LF、先 assert count）→ `out = work.replace('\n','\r\n') if crlf else work` → `open(P,'wb').write(out.encode('utf-8'))`。症状排查：锚点 `count==0` 但文本肉眼相同 → `repr` 行尾看是否连续 `\r`
- **⚠️ 大块删除用「行号区间法」而非文本锚点**：整段删除（TAB 容器/弹窗/函数区，如把某页 TAB 内容搬迁成独立页时）文本锚点 find 可能因换行/缩进/全半角差异静默返回 -1。改用：read_file 拿准确行号 → `split('\n')` 按 1-indexed 行号区间 drop 重建 → 删完 grep 残留引用 + div/tr 平衡检查。**替换一段 HTML 块时锚点不唯一（`count > 1`，如同名注释在 CSS 与 JS 里各出现一次）就用标签配对切块**：写个 `find_block_end(text, start)` 从 `<div` 起累加、遇 `</div>` 递减、归零处即块尾，比字符串锚点和行号都稳——行号会在同一次脚本的多个替换之间整体漂移，字符串锚点则在块被剪掉后再也匹配不上。另：**execute_code 脚本运行在独立临时目录，脚本内文件读写必须绝对路径**（相对路径必 FileNotFoundError，harness 提示易漏）
- **项目里可能有「独立单文件原型」直接放在 dist/（非 build.py 产物；实测：智能导游-小程序.html）**：特征＝pages/ 无对应页面源 + 文件内 `grep -c PAGE_META` 为 0 + proto-config 是另一套模板。此时项目 README 的「dist 只读」规则不适用——该文件本身就是源，直接改它（改前 `cp 原文件 原文件.bak.原因.txt` 备份）。大 HTML 多点改动的安全配方：execute_code 写 Python 脚本逐锚点 str.replace，每个锚点先 `assert content.count(old)==1` 防误替换；写回后校验 `<div` 与 `</div>` 数量平衡；再用正则抽出全部内联 `<script>` 合并成临时 .js 过 `node --check`，三项全绿才算完成。
  **同原型还可能有「手工另存的变体产物」留在 dist/**（实测 `党代会-AI纪念相册-mobile-原型--步骤简化版.html`：更早时间手工另存、页面流程已分叉，build.py 不重建它）：共用文案/数据改完后它会停在旧值，受众点开该文件看到的仍是旧口径。判据＝dist 下同名前缀多个 .html + 其 mtime 明显早于主产物。规则：改共用文案后 `grep` 一遍这些变体，**是否同步由用户拍板，但必须在报告里点明「变体仍是旧文案」**；发布链取哪份见 `references/github-pages-publish.md`

### 素材合规（政务 / 党建 / 学校类项目必查）
- **下载到的历史图片必须逐张过筛，政治敏感素材主动排除并留痕**：给公办学校 / 党政客户做 demo 时，公开图库里混着带特定历史时期政治标语、领袖像的老照片，以及带民国纪年铭文的实物照。**不要因为「是历史照片」就默认能用**——现场大屏一放就是事故。已排除过的样本：含时代标语的校门照、民国纪年 + 当时政界人士署名的奠基铭文照。
  - 顺带校验**素材与叙事对不对得上**：碑是「奠基」物证就不等于「建校」物证，拿它讲建校年份本身不严谨。
  - 排除动作要留痕 + 当面告知：README 里单独列「主动排除的素材 + 原因」并标注勿擅自加回；报告里如实说明，用户可能判断可用，但风险要他知道。
  - 缺图时**明示缺图**（斜纹占位 + 「那个年代没有留下照片」），不配错图、不拿现代图充数。
- 找图、核验、裁切、署名口径全流程 → `references/demo-asset-sourcing.md`

### 演示数据与交付
- **⚠️ 同一屏里的图、文、题必须讲同一个故事（评审一眼就能抓到）**：每日一题卡左边海报是 A 主题、右边题干问 B 主题、底下还写着「答案就在这张海报里」——这是拼出来而不是设计出来的破绽。做法：fixture 定一个主题贯穿（海报 + 题干 + 答案 + 出处 + 答题页首题全对齐），且**答案要能从图上直接读出来**（海报印着「雷锋 1940—1962」，题就问享年），这样「看图就能答」的设计意图才成立。改一处文案后 grep 同主题的其他页是否也要同步
- **⚠️ 过滤型视图要逐项跑空：凡按时间/分类/年份过滤的入口，每个选项都必须有非空结果**：基于精选数据集做过滤（"输入入学年份 → 你在校期间发生了什么"这类个人化视图）时，数据集在早期年份往往有空洞——实测两个年份直接返回空态。交付前**把每个选项逐个跑一遍**并记录条数，空结果要么补数据节点、要么放宽匹配窗口，不允许把空态当正常交付。配套：非数字标签（如"今天"）会被 `parseInt` 判成 NaN 而静默从时间过滤里消失，给它加一个数字 `num` 字段供比较，过滤用 `n.num || parseInt(n.year,10)`
- **⚠️ 演示数据口径必须自洽，用户会追问「数字从哪来」（党代会项目）**：首页统计（人参与/作品数/档案数）不是随便填的装饰数字——用户会问业务来源。口径定义（如「参与人数=扫码即参与=发放编号数=档案数」）要在首次给出数字时就说清三数关系，数字打架（如参与 286 < 档案 328）必然被质疑。改口径时**同步 PRD 文档**（grep 全库旧数字，文档/原型必须一致，否则后来者被文档误导）——**但这是用户当场要求同步时的动作**；默认情况下口径差异先进 `docs/PRD待更新清单.md`，不直改 PRD（见第 1 章「原型改动不顺手改 PRD」）。**功能落地的交接说明同步**：改完一类功能后把「页面改动交接说明」重写为实际落地版，并记录「相对原方案的落地差异（已拍板，不要回退）」小节（如 V2.1→V2.2），防后续接手 AI 被旧文档误导；PRD 声称留在文案定稿里，原型实现以交接说明为准
- **⚠️ 推送前确认全部改动完成（用户纠正「改好之后再推送啊」）**：不要中途/未验证完就 push。push 前 checklist：① 源文件改完 ② build.py 重建 dist ③ dist 残留旧值清零（grep 旧数字/旧字段）④ 文档同步（PRD/README 若涉及）⑤ verify 通过。尤其**数字/口径类改动**：源文件数字改了 ≠ 做完——dist 是构建产物，必须重建后才生效；`git status` 列出的改动清单就是交付清单

### 交接文档与工具路径
- **交接文档只信结构，不信行号/函数名/页面归属**：文档写"上传逻辑在 07 页、openResMgmtCatModal 树形多选可参考"，实际函数在 03 页、该弹窗根本不存在。开工前 `grep -n` 逐一验证每个关键函数/数据源真实位置，再按实际落点改
- **read_file 报 binary 但文件是 UTF-8**：含 BOM/控制符会误报，改用 `python -c "print(open('...',encoding='utf-8').read())"` 读取（交接文档、README 常见）
- **⚠️ 内联 `python -c "..."` 里禁写反引号 / `$`（bash 会先做命令替换与变量展开）**：正文里带反引号（代码注释、Markdown 行内 `` `field` ``）时，反引号内容被 bash 当命令执行，整条命令要么报 `command not found`、要么被替换成空串——**脚本静默只跑一半就退出，跟在后面的构建/commit 步骤一并没执行，而你已以为做完了**（实测改 README 时踩到：脚本没跑、commit 也没发生，是后来看 git log 才发现）。判据：命令输出里出现 `<某中文词>: command not found`，或实际执行步骤数少于预期。**同类触发还有行尾 `#` 注释与内嵌转义引号**——shell 会提前吃掉引号、把续行当命令执行（症状：python 报 `unterminated string literal`，紧跟一串 `},` 之类代码片段被当成命令跑）。修法：**凡含反引号 / `$` / `#` 注释 / 转义引号 / 多行中文的脚本一律先写成 `.py` 文件再 `python file.py`**，不要 `-c` 内联；要给 git 传多行正文用 `git commit -F - <<'EOF'`（单引号 heredoc 不做任何替换，安全）。
- **search_files 对中文路径可能静默返回 0 匹配**（主会话同样踩，非仅子 agent）：改用 terminal `grep -n`
- **patch 替换含 JS 转义串（`\'` 拼接 onclick）报 Escape-drift detected**：不要整块替换含转义的大段，拆成无转义的小锚点（单条语句/单行函数体）分段 patch
- **verify-output.py 不检查 div 平衡**：构建后自查要额外数 `content.count('<div') == content.count('</div>')`
- **dist 目录可能有新旧两个产物**（本案例 127.9KB 旧 / 1143.8KB 新）：验证选注入页面数最多的那个（script blocks 数最多者）
- **跨页共享作用域 + 弹窗模式标记的上下文陷阱**：upload 弹窗复用编辑页标签选择时用 `window.__EDIT_TAG_MODE` 区分模式，但 confirmEditTags 回填后会清空该标记，导致提交二次校验取错上下文。判据改用弹窗可见性（`uploadModal.classList.contains('show')`）而不是会被清空的标记

### 其他
- **浏览器验证作用域（模式限定）**：组件化增量修改默认**不主动**截图验证（改完告知用户查看，用户明确要求才用）；**单 HTML Layout Intelligence Pipeline 必须执行 Step 8 Screenshot + Step 9 Critic**（这是该流程的硬性要求，见第 2 章）
- **⚠️ 多页原型里查 DOM 数量为 0 ≠ 渲染失败**：页面 `init_xxx()` 只在它被激活时才跑，停在别的页面时查目标页的容器子元素必然得 0（实测首页卡片数读到 0，误判成专题没渲染，其实切过去就正常）。**先 `showPage('目标页')` 再查数量**；同理，页面切换后要重新取元素引用（旧快照会误导）。**别拿猜的 class 名下结论**：各页卡片类名前缀不同（`resmg-card` / `sdl-card` / `spl-card` …），选择器猜错照样返回 0，会得出「过滤逻辑把数据全吃掉了」这种完全错误的结论。判「空了/坏了」之前先取 `容器.children.length` + `容器.children[0].className` 拿到真实类名，再谈数量；同理，断言「数据为空」要先直接查数据函数（`xxxCardList().length`）而不是查 DOM
- **真实交互验证用自动化 Chrome 9333（drive_preview 有旧快照局限）**：drive_preview 的 read/elements 在页面重渲染后可能返回**旧快照**（点击后 delta 只有 same、read_preview 读不到弹窗文本），据此判断「弹窗没弹出」会误判——真实 Chrome 里一切正常。需要确凿的交互验证（点击是否生效/弹窗 display）时启动自动化实例：后台进程跑 `"D:/Chrome/Application/chrome.exe" --remote-debugging-port=9333 --user-data-dir="D:/Chrome/User Data_automation" --no-first-run --no-default-browser-check about:blank` → `curl 127.0.0.1:9333/json/version` 确认就绪 → browser_exec 打开 `file://` 原型 → `document.querySelector(...).click()` + `getComputedStyle(m).display` 实测 → 用完 kill 该后台进程。**drive_preview 与 browser_exec 结论矛盾时以真实浏览器为准**。启动方式（git-bash 实测）：直接 `terminal(background=true)` 执行 chrome.exe，**不要用 `start ""`**——bash 下 `start` 会起一个 cmd 窗口而 Chrome 根本没启动；`browser_exec` 报 `BU_CDP_URL ... unreachable` 就是它没起来，按上面方式拉起再重试
- **⚠️ 后台标签页的 `setTimeout` 会被浏览器节流**：非前台 tab 里定时器延后执行，`setTimeout(fn, 950)` 在 1.4s 后仍未跑完是正常现象——据此判「投送 / 生成没生效」会误报，白排查一轮。验证定时器驱动的 UI（投屏回写、生成完成、流式结束）时：等待给到定时器时长的 **3 倍以上**，或让 tab 处于前台；状态仍不明就**再查一次**，不要一次读数就下结论。
- **⚠️ browser_exec 的 js() 参数不能含换行**：`js("(() => { try {\n return ...` —— js() 字符串含字面换行会在 browser-exec harness 的 Python 层报 `SyntaxError: unterminated string literal`（与页面 JS 无关）。JS 一律压成单行；需要多语句时拆多个 `js()` 调用，或用 `import time` 在 Python 层间隔
- **文档锚点含中文引号时先 read_file 确认实际字符（PRD 更新实测）**：文件里是弯引号（“”）时锚点写直引号（""）必然 `assert count==0` 白跑；错写弯直引号、全半角差异、空格差异都会静默 count 为 0。含中文标点的锚点先 read_file 原文段落再构造 old_string，或锚点只取不含引号的子串
  - **同类根因：Python raw string 里的引号转义不是引号**。写 `r'... class=\"resmg-sw'` 时，`\"` 在 raw string 里是**反斜杠 + 引号两个字符**，永远匹配不上源码里的 `"`，症状同样是 `count==0`。锚点一律用普通字符串或三引号，别在 `r'...'` 里写引号转义
- **⚠️ 锚点落在 JS 拼串里时改用「按行筛选」，不要写正则**：页面 HTML 大量由 JS 字符串拼接生成，源码里带 `\'` 这类多层转义，正则要写成一串反斜杠、极易写错且难 debug。可靠做法是按子串判断整行去留，并断言删除条数：
```python
out, removed = [], []
for ln in s.split('\n'):
    if 'class="resmg-sw ' in ln and 'shelfText' in ln: removed.append('上架胶囊'); continue
    if 'res-more-item' in ln and '>移动</div>' in ln: removed.append('菜单项'); continue
    out.append(ln)
assert len(removed) == 3, removed          # 防锚点漂移后静默少删
s = '\n'.join(out)
```
**同一个锚点写两遍都匹配不上时，直接换按行筛选，不要再调正则。** 行内判断用单引号 Python 字符串包双引号，天然不需要任何转义
- **browser_vision 视口裁剪误报字段缺失**：视觉截图只确认布局是否变形，字段存在性用 DOM 实测（两者矛盾以 DOM 为准）
- **预览同步（GitHub Pages）**：完整发布规程见 `references/github-pages-publish.md`；**⚠️ 必须等用户明确说「同步预览」才执行**——源码 push 不会自动更新预览仓。**⚠️ 用户说「传到预览的 GitHub 仓库」= prototype-preview 仓的 GitHub Pages（`https://kinger-han.github.io/prototype-preview/<slug>/`），不是项目自己的源码仓（党代会项目）**：项目源码 push 到自己的 repo 不等于预览更新。判据：用户提到「预览/更新到预览」→ 跑 `bash "D:/hpy/桌面/数熙相关文档/prototype-preview/tools/publish-preview.sh" --project <项目目录>`（脚本在 prototype-preview 仓的 tools/ 下，**不在 prototype-kit 里**；读 publish-config.json，多原型一次发布；推送成功即报链接，不阻塞等部署验证）；只提「改好推送」→ 推项目仓。两动作经常都要做：先推源码仓，再发布预览

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
