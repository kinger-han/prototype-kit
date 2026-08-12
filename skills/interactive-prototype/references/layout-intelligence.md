# Layout Intelligence（ui-system 页面级布局层，2026-08-11 三阶段落地）

Phase 1：Layout Intelligence 核心（planner/critic/benchmark + media patterns + layout.css 原语）
Phase 2：抽象为 Template/Theme/Device 四层架构 + 最小 Planner MVP 验证可机器消费
Phase 3A：Content Model 层（content-schema + fixtures）+ 真实内容渲染 + Content-aware Critic（8 类新检查）+ Grid/Mobile 真实现

## 架构（文件位置，均为 ui-system/ 下）

| 层 | 文件 | 职责 |
|---|---|---|
| Theme | `themes/theme-schema.json` + `themes/default/theme.json` | 只负责视觉语言（color/typography/spacing/radius/shadow/组件视觉）；扩展 Theme 02/03 只需加目录，Template/Layout/Component 零改动 |
| Device | `devices/device-schema.json` + `pc.json` / `mobile.json` | PC=sidebar+content+inspector；Mobile=header+content+bottom-action；共享 Content Model 但 Layout Pattern 可完全不同，不是 media query 换皮 |
| Template | `templates/template-schema.json` + 6 个 JSON | dashboard/list/detail/form/media-detail/media-editor；每个含 regions/variants（PC+Mobile 不同 variant） |
| Layout Pattern | `layout/skeletons/skeletons.json` + schema | 6 个可复用骨架：split/master-detail/grid/stack/preview-inspector/sidebar-content |
| Layout Policy | `layout/policies/media-ratio-policy.json` + schema | aspect-ratio→variant 通用策略，media 系列页面（detail/editor）共享 |
| 原语 | `layout/layout-tokens.css` + `layout.css` | 维度 token + 类（layout-split-*/layout-media-*/layout-panel/layout-region/layout-stack） |
| 决策/检查 | `layout/planner.md` / `critic.md` / `benchmark.md` | 决策规则 / 10 类问题+Score / 回归 Case |
| Content Model | `content/content-schema.json` + `content/fixtures/*.json` | 区域内容契约（15 种 region type）+ 14 个真实 benchmark 数据；设备/主题无关 |

registry.json：7 patterns（说明文档层）+ 6 templates（结构化层）+ 18 components（14 业务 + 3 布局原语 + 1 date-picker）。

## Phase 3A：Content Model + 真实内容渲染（2026-08-11）

### 数据流（真实内容进入后的稳定链路）
```
Template.regions（顺序/角色）
  → fixture.regions[region_id]（Content Model 实例）
  → render_component(type, data) → 真实 ui-*/layout-* 组件 HTML
  → 按 variant 布局骨架组装（split/grid/stack）
```
- `content/content-schema.json` 定义 15 种区域内容类型（kpi/chart/filter/toolbar/table/pagination/page_header/status/metadata/media/caption/tags/actions/form/related），每种带字段契约 + required
- `content/fixtures/*.json`：14 个真实数据（short/normal/long-title/long-description/sparse-metadata/dense-metadata/missing-optional/many-tags/large-preview/unavailable-preview + 4 个标准模板数据），内容长度必须有明显差异
- 渲染器参考：`D:/hpy/桌面/日常临时会话/layout-benchmark/content-benchmark.py`（content-aware，非占位）

### Content-aware 渲染 3 个硬规则（Phase 3A 实测 bug 提炼）

1. **模板 regions 必须声明 page_header**：media-detail/editor 最初缺 title region → 页面无标题。Template regions 数组就是内容消费清单，fixture 有但 template 没列 = 内容被静默丢弃
2. **全宽块（page_header/related）必须放 split 外**：塞进 split 分栏会让标题占一列、预览被挤到右侧。拆 full_top（header）/ full_bottom（related）两个容器，split 只放分栏区域
3. **子内容（caption/tags/actions）归入父 panel，不占独立布局槽**：tags/actions 是 metadata panel 的子内容，顺序在 metadata 之后时用循环结束后 rfind("</div>") 插入最后一个 panel，不能 replace 第一个 `</div>`（会插错位置）

### Grid 真实现（dashboard 不再 fallback stack）
`layout.css` 新增 `layout-grid` + `layout-grid-cols-2/3/4` + `layout-grid-span-*`；viewport 降级 `<1280px: 4列→2列`、`<1100px: 全部→1列`。KPI 卡 `.ui-kpi-card`、图表卡 `.ui-chart-card`（min-height 320px 防 layout-shift）。

### ECharts 内联渲染陷阱
图表 script 若在 ECharts CDN 之前执行会报 `echarts is not defined`（CDN 在 body 末尾加载）。内联图表必须包 `window.addEventListener('load', function(){ ... })`。

### Content-aware Critic（critic.md 2.5 节，+8 类）
long-title-overflow / content-density-imbalance / underfilled-region / overfilled-region / excessive-metadata-gap / action-overflow / text-wrapping-anomaly / content-induced-layout-shift。每类带检测方法（scrollWidth>clientWidth+2 等）+ Evidence 数值格式。

### Benchmark 分层（benchmark.md）
- **Structural Benchmark**：Schema/Planner/Renderer 正确性（layout-planner.py）
- **Visual Content Benchmark**：真实内容进入后页面质量（content-benchmark.py + fixtures），两者分开跑

## 铁律（已写入 SKILL.md Layout Intelligence 章节）

1. AI 决定意图（page_type/device/media/aspect_ratio/priority/density），**系统决定几何**
2. 禁裸几何：`width:65%`、任意 px 间距、`position:absolute` 布局、媒体查询
3. 只允许档位：split 70/64/55/50/45/38/30；密度 compact/comfortable/spacious；媒体 landscape/portrait/square/wide/4x3/3x4
4. 默认不强制等高（align-items:start）；不等高留白正常，禁止拉伸/补装饰填空
5. 媒体区永远 `max-height:66vh` + `object-fit:contain`
6. 生成后跑 Critic 自检（≥0.8；<0.8 按 recommendation 修正 ≤2 轮）

## 关键 CSS 陷阱（都是 DOM 实测抓到的真实 bug，勿重蹈）

### 1. aspect-ratio + max-height 冲突 → 容器比例失真
- 现象：square 容器实测 media_ratio=1.44（应 1.00）；portrait ~1.12（应 0.56），海报上下大片同色空白
- 根因：`max-height:66vh` 把高度钳制但宽度不变 → 比例破坏
- 修复：同时给 `max-width: calc(var(--layout-media-max-height) * 比例)` + `margin-inline:auto`，高度受钳时宽度同步收缩，比例保持、列内居中
- 验证：square=1.00、portrait=0.56、landscape=1.78 全部精确

### 2. .layout-region 的 align-self:start 在 stack（flex column）内收缩成内容宽 → 窄条卡片
- 现象：tmpl-dashboard 首个卡片宽 198px（页面 1241px）
- 根因：`align-self:start` 是为 grid 双栏防等高设计，flex column 下把区域收缩到内容宽度
- 修复：`.layout-stack > .layout-region { align-self: stretch; width: 100%; }`
- 验证：卡片 198→1193px（全宽）

## 验证模式：最小 Planner MVP（证明"抽象可被机器消费"）

写完 Schema 后不要只当文档——写一个最小程序化消费者验证：

1. 读 `templates/*.json` + `layout/skeletons/skeletons.json` + `layout/policies/media-ratio-policy.json`
2. 匹配 policy 规则（aspect_ratio+page_type）→ 输出 Layout Directive（variant/split/preview_class/scroll）
3. 组装单 HTML（内联 tokens+layout-tokens+layout.css+组件 CSS）
4. browser_console DOM 实测（region 占比 / media ratio / gap / 等高性）

MVP 参考脚本：`D:/hpy/桌面/日常临时会话/layout-benchmark/layout-planner.py`（13 个 benchmark 页面全部通过）。
注意：此模式同时是 Critic 闭环的载体——Phase 1 抓到 aspect-ratio bug，Phase 2 抓到 stack 窄条 bug，都靠数值证据而非目测。

## Benchmark DOM 测量要点（browser_console）

- split 占比：`region.width / split.width * 100`
- media ratio：`media.width / media.height toFixed(2)`（对比预期 16/9=1.78、9/16=0.56、1/1=1.00）
- 等高性：两 region 高度差 `< 20px` 视为等高（正常应不等高，右区留白是特性）
- 视觉截图只作确认，两者矛盾以 DOM 实测为准

## Phase 4：Real Product Validation（2026-08-11，真实业务验收）

用真实业务项目（绘境AI平台，功能清单 121 条）验证整套系统在真实脏数据下仍稳定。真实数据不清洗：长标题/空字段/多状态/多标签/混合比例/密集稀疏混合/异常数据。

### 渲染工具链 Pitfalls（都是 Phase 4 实测 bug，勿重蹈）

1. **Python `hash()` 随机化 → 生成的 HTML id 不稳定（最隐蔽）**：`hash("str")` 受 PYTHONHASHSEED 影响，同字符串在不同进程/运行中 hash 值不同。用 `hash()` 生成元素 id（如 `action-more-{hash(...)}`）再在 onclick 里引用同表达式 → **id 与引用不一致，折叠按钮静默失效**。修复：用 `hashlib.md5(...).hexdigest()[:8]` 生成稳定 id。生成脚本里凡是要在 HTML/JS 中引用的 id 一律用 md5，禁用 hash()。

2. **donut recipe 数据格式契约**：`makeDonutOption({title, labels, series:[{name, data:[46,31,17,6]}]})` —— 期望**单系列多值**（labels 与 data 一一对应）。若传成多系列单值（`[{name:'套版',data:[46]},{name:'即梦',data:[31]}]`），recipe 只取 series[0].data → 其余全 NaN%。line/bar recipe 同理，喂数据前先读 recipe 文件头的用法注释。

3. **内联多个 recipe 时 UI_CHART_PALETTE 去重陷阱**：每个 recipe 文件都声明 `var UI_CHART_PALETTE=[...]`，函数体内引用它。内联时若正则把所有 palette 行全删 → 首个函数执行报 `UI_CHART_PALETTE is not defined` → canvas 0 个（页面静默无图）。修复：保留第一份 palette 定义，只删后续重复行。

4. **Layout Policy 只对 PC 媒体页启用**：media-ratio-policy 决策必须加 `device == "pc"` 条件，否则 mobile 媒体页也走 split 布局（应走 template 的 mobile-stack）。Mobile 用 template.variants["mobile"]，不叠加 policy。

5. **Template region id 必须与 Content Model 契约一致**：form.json 曾用 `form-sections` 而 content-schema 契约是 `form` → fixture 有但 template 不消费 → 表单区空白（只有 actions 渲染）。region id 就是消费清单的 key，两边不一致 = 内容被静默丢弃。

6. **Mobile 窄视口验证：window.resizeTo 无效，用 iframe 模拟器**：浏览器工具里 `window.resizeTo(375,812)` 被限制（innerWidth 不变）。正确做法：写一个模拟器页，放 375/390/430 三个固定宽 iframe（内嵌对应 mobile 页面），再用 browser_vision 看整页。注意 file:// 下 iframe 跨域，browser_console 无法读 iframe 内 document（只读主文档），视觉验证靠截图。

### Action overflow 折叠模式（P1）
默认展示 ≤4 个主操作，超出进「更多」折叠（ellipsis 图标 + onclick toggle display none/flex），禁止因 action 数量导致布局换行破坏。折叠容器 id 用 md5（见 pitfall 1）。

### 用户工作流偏好（2026-08-11 纠正）
- **最小化页面验证，不要生成重复的多页面**：真实业务验收阶段只做覆盖每种模板的最小验证集（6 PC + 必要 Mobile），不搞 10+ 变体批量页。fixtures 变体在 Phase 3A 验证用，Phase 4 用真实业务 fixture 直接验收。

## 页面类型 → variant 决策速查（media-ratio-policy 已通用化）

| 输入 | 决策 |
|---|---|
| detail 16:9 | landscape-preview-wide, split-64 |
| detail 9:16 | portrait-preview-narrow, split-38 |
| detail 1:1 | square-balanced, split-50 |
| metadata large | panel-scroll=true |
| title long | split-64→split-70 升档 |
| media unavailable | metadata-only（无 split，单列 placeholder） |
| editor 16:9 | editor-landscape-inspector, split-55 |
| editor 9:16 | editor-portrait, split-38 |
