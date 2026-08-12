# Layout Intelligence 陷阱与模式（Phase 1-5 实战沉淀，2026-08-11）

单 HTML 原型 / AI UI Template System 开发中实测发现的坑与可复用模式。
全部有 DOM 数值证据支撑，不是猜测。

## 1. Python hash() 对 str 有随机化（PYTHONHASHSEED）——不能用于生成 HTML id

- 症状：onclick 里 `getElementById('action-more-xxxx')` 找不到元素，按钮点击无反应
- 根因：Python 内置 `hash('str')` 每次进程随机（hash randomization），同一字符串两次调用生成不同 id → HTML 里的 id 与 onclick 引用的 id 不一致
- 修复：用 `hashlib.md5(content.encode()).hexdigest()[:8]` 生成稳定 id
- 适用：任何动态生成 HTML id/class 的 Python 场景

## 2. aspect-ratio + max-height 冲突 → 媒体容器比例失真

- 症状：square 容器实测 ratio 1.44（应为 1.00）、portrait 1.12（应为 0.56），海报上下大片同色空白
- 根因：`max-height: 66vh` 把高度钳制到 66vh 但宽度不变 → 比例被压扁
- 修复：同时给 `max-width: calc(var(--layout-media-max-height) * 比例)` + `margin-inline: auto`，高度受钳时宽度同步收缩、比例保持、列内居中
- 验证：DOM 实测 `media.getBoundingClientRect().width/height` 必须等于预期比例；**只靠目测发现不了这个 bug**

## 3. `.layout-region { align-self: start }` 在 flex-column 容器里把区域收缩成内容宽度

- 症状：dashboard 卡片只有 198px 宽（页面 1241px），窄条卡片
- 根因：`align-self: start` 是为 grid 双栏防等高设计的，在 flex column（`.layout-stack`）容器里会把区域收缩成内容宽
- 修复：`.layout-stack > .layout-region { align-self: stretch; width: 100%; }`
- 教训：布局原语的"防等高"规则要限定容器类型，不能全局生效

## 4. ECharts Recipe 数据契约（charts/recipes/*.js）

- donut/bar/line 的 series 契约是**单系列多值**：`series:[{name:'占比', data:[46,31,17,6]}]`
- 传成**多系列单值** `[{name:'A',data:[46]},{name:'B',data:[31]}]` → legend 显示 NaN% / undefined
- 内联 recipe 到单 HTML 时，`UI_CHART_PALETTE` 定义**必须保留一份**（函数体依赖它）；正则去掉全部定义 → `ReferenceError: UI_CHART_PALETTE is not defined`，canvas 不渲染
- 正确做法：第一个文件保留 palette 定义，后续文件用正则去重

## 5. Template region id 命名契约（统一下划线）

- Content Model fixture 的 region key 与 template `regions[].id` **必须完全一致**：`page_header`（下划线），不是 `page-header`（连字符）
- 不一致 → region 静默丢失（页面缺 header / 表单 / 图表），不报错
- 实例：dashboard/list/detail/form 的 `page-header` 都要统一为 `page_header`
- 加 Template 时先 grep 所有模板的 region id 是否与 content-schema 一致

## 6. Mobile Table → Card Mode（Presentation 与 Content 分离）

- 数据流：`Content Model → Table → Device Policy → PC: table / Mobile: card list`
- 不修改 Content Model，只改 presentation（同一数据模型，两种呈现）
- Card 结构层级：主字段标题（`type='title'` 列）→ 副信息（ID 列）→ 状态 Tag 右上 → ≤4 个次要字段降级网格（label 灰 value 黑）→ Actions（沿用 action-overflow：≤2 + 更多）
- 列类型标记：标题列必须标 `type='title'` 才能被识别为主字段；`no/id/code/num/sn` 列作副信息并**排除出 meta 网格**（避免重复）
- 空字段：不显示该行；长标题：`word-break: break-all` 换行不截断
- CSS 全部引用现有 token，不新增独立视觉语言

## 7. iframe viewport 模拟（浏览器 resizeTo 被限制时）

- `window.resizeTo()` 在受控/无头浏览器通常不生效（实测 innerWidth 不变）
- 用固定宽度 iframe（375/390/430px）包装页面：iframe 内 CSS media query 按 iframe 宽度生效 → 真实窄视口验证
- 注意：file:// 协议下 iframe 跨域，无法用 console 检查 iframe 内部 DOM，但 `browser_vision` 截图可看渲染效果
- 模板：`layout-benchmark/phase4/out/viewport-sim.html`

## 8. 验证方法：DOM 数值证据 > 视觉目测

- `browser_vision` 可能看错页面（导航后仍描述上一页内容），视觉截图只作确认，**矛盾时以 DOM 实测为准**
- Critic 检查必须数值化：`getBoundingClientRect()`（region 占比、media ratio、gap、高度差）、`scrollWidth > clientWidth + 2`（溢出）、`getComputedStyle().overflowY`（滚动）、`canvas` 数量（图表是否真渲染）
- 这套方法抓到了 aspect-ratio 失真、stack 收缩、ECharts palette 缺失等多个真实 bug——只靠目测全部发现不了

## 9. 用户偏好：最小化验证页面

- 验证时**不要生成大量重复变体页面**；用户会中途打断"最小化页面验证，不要加重复的多页面，没必要"
- 只生成必要页面（6 模板 + 关键内容变体 + 3 个 Mobile 视口）即可证明能力
