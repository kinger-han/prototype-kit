# Layout Critic（布局检查与评分）

> Layout Critic 在 Renderer 产出后运行，对页面做**结构化视觉/结构检查**。
> 目标：输出**可验证的问题证据**（数值/位置/对比），不是"看起来不够好"。
> 每次检查输出 Issues 数组 + Layout Score；Score < 0.8 触发 Layout Adjustment（≤2 轮）。

---

## 1. 检查流程

```
Renderer 产出单 HTML
  ↓
1. 打开页面（浏览器/无头截图）
2. 读取结构信息（区域数量、布局类、gap 来源）
3. 测量空间证据（区域占比、密度、对齐、空白）
4. 逐项对照 10 类问题
5. 计算 Layout Score
6. Score < 0.8 → 输出 Recommendation → Layout Adjustment 修正 → 复检
```

测量方式（可用浏览器 console / DOM API）：
- 区域占比：`getBoundingClientRect()` 计算每个区域宽高占容器比例
- 空白：区域内容盒 vs 区域盒的面积差
- 密度：区域内元素数 / 区域面积
- 对齐：区域左上角对齐差、gap 一致性

---

## 2. 检测的 10 类问题（每个必须有 Evidence）

| # | issue type | 定义 | 检测方法 | 示例 Evidence |
|---|---|---|---|---|
| 1 | `excessive_empty_space` | 区域内容远小于容器导致大块空白 | 内容盒高度 < 容器高度 60% 且无语义 | Preview 区 82% 为空 |
| 2 | `density_imbalance` | 相邻区域内容密度差距过大 | 各区域 元素数/面积 比差 > 3x | Preview 密度 82%，Metadata 21% |
| 3 | `height_imbalance` | 两区域因等高强制导致一侧大空白 | 等高容器内内容高度差 > 200px | 左区 900px 右区 320px 等高 |
| 4 | `excessive_gap` | 区域/元素间距远超 token 档位 | 实测 gap vs 密度档 | gap 48px（comfortable 应为 24px） |
| 5 | `alignment_problem` | 区域不对齐、错位、偏移 | 相邻区域 top/left 对齐差 > 4px | Metadata 顶部偏移 12px |
| 6 | `weak_visual_grouping` | 相关元素无分组、无层级分割 | 分组结构缺失（无 section-title/card 边界） | 10 个字段平铺无分组 |
| 7 | `weak_hierarchy` | 主次信息视觉权重与业务不符 | 主区域面积 < 次区域；标题/操作无层级 | Preview 仅 30% 但 metadata 70% |
| 8 | `oversized_container` | 容器超出内容需要 / 超 viewport | 容器宽 > 内容最大宽；高 > 100vh | Metadata 面板 560px（max 480px） |
| 9 | `underfilled_region` | 区域只有少量内容却被分配大面积 | 区域占比 vs 内容量 | 全宽区仅放 2 个字段 |
| 10 | `media_content_ratio_mismatch` | 媒体比例与布局比例不匹配 | 媒体实际 aspect-ratio vs variant 预设 | 竖版海报套 62/38 横版布局 |

## 2.5 Content-aware 检查（Phase 3A 新增，真实内容进入后必查）

在 10 类基础问题之上，真实内容进入 Template 后额外检查以下 8 类。**必须提供 Evidence 数值**：

| # | issue type | 定义 | 检测方法 | 示例 Evidence |
|---|---|---|---|---|
| 11 | `long-title-overflow` | 标题超长导致溢出/换行异常/挤压他区 | 标题元素 scrollWidth > clientWidth + 2；换行后高度 > 2 行且挤压下方 | Title 320px / 容器 280px, overflow=true |
| 12 | `content-density-imbalance` | 真实内容进入后相邻区域密度差（非空区域） | 各区域元素数/面积比 > 3x | Preview 78%, Metadata 18% |
| 13 | `underfilled-region` | 区域内容过少却分配大面积（metadata sparse） | 区域内容盒 < 容器 50% 且无语义 | metadata 4 项占 480px 面板 30% |
| 14 | `overfilled-region` | 区域内容过多溢出/超容器（metadata dense） | 内容盒 > 容器 max-height；overflow 裁剪 | 18 项 metadata 超 100vh 未滚动 |
| 15 | `excessive-metadata-gap` | metadata 项间 gap 远超 token 档位 | 实测 row-gap vs 密度档 | row-gap 32px（comfortable 应 12px） |
| 16 | `action-overflow` | 操作按钮增多（>5）导致换行/溢出容器 | 按钮行换行数 > 2 或超出 panel 宽 | 6 actions 换行 3 行 |
| 17 | `text-wrapping-anomaly` | 长文本断行异常（单词截断/标点悬挂/奇怪断点） | 断行位置检测；word-break 非预期 | "© 数熙科技" 在 © 后断行 |
| 18 | `content-induced-layout-shift` | 内容加载/变化导致布局跳动（如图表未定高） | 内容前后容器高度差 > 20%；无 reserved 空间 | 图表 0→320px 高度跳变 |

**新增检查的 Evidence 采集：**
- 长标题：`title.scrollWidth > title.clientWidth + 2`（允许 2px 舍入差）
- 密度：区域 `content_box_area / bounding_area` + 元素数
- 溢出：`scrollHeight > clientHeight + 2` 且未设滚动 → overfilled；`content < 50%` → underfilled
- 布局移位：`ResizeObserver` 或渲染前后 `getBoundingClientRect()` 对比

**Content-aware 修正方向（不是装饰）：**
- long-title → 标题区允许换行但不超过 2 行（line-clamp），或 Preview 列加宽一档（split-70）
- underfilled → 保持顶部对齐，禁止拉伸/补装饰；确认 metadata 面板 min-width 合理
- overfilled → 面板加 `layout-panel-scroll`；超 12 项 metadata 默认滚动
- action-overflow → 按钮组 `flex-wrap` 保持，超 5 个折叠到「更多」（More）下拉
- layout-shift → 图表容器固定 min-height（如 260px），避免加载后跳动



```jsonc
{
  "issues": [
    {
      "type": "density_imbalance",
      "severity": "high | medium | low",
      "evidence": {
        "preview_density": "82%",
        "metadata_density": "21%",
        "method": "element_count / area"
      },
      "location": { "region": "preview", "selector": ".layout-media" },
      "recommendation": "Reduce preview allocation to layout-split-50 or increase metadata grouping density."
    }
  ],
  "score": {
    "space_efficiency": 0.0~1.0,      // 无大面积无意义空白
    "density_balance": 0.0~1.0,       // 相邻区域密度均衡
    "alignment": 0.0~1.0,             // 对齐、gap 一致
    "visual_hierarchy": 0.0~1.0,      // 权重与业务一致
    "composition": 0.0~1.0,           // 分组、区块关系、流
    "responsive_safety": 0.0~1.0,     // 缩窄不破版、媒体不溢出
    "total": 0.0~1.0                  // 加权总分
  },
  "trigger_adjustment": true          // total < 0.8
}
```

**Score 权重（可配）：**
```
total = space_efficiency*0.2 + density_balance*0.2 + alignment*0.15
      + visual_hierarchy*0.15 + composition*0.2 + responsive_safety*0.1
```

## 4. Adjustment 触发与修正

| 条件 | 动作 |
|---|---|
| total ≥ 0.8 | 通过，结束 |
| 0.6 ≤ total < 0.8 | 按 issues 的 recommendation 修正一轮（通常：换 split 档 / 加滚动 / 改密度 / 移除等高），复检 |
| total < 0.6 | 两轮修正后仍低 → 重新走 Planner（换 variant 或 page_type），并记录 benchmark 失败 |

修正优先级：先改 Layout Directive（比例/密度/滚动），再改组件内间距；**不要通过加装饰填空白**。

## 5. 禁止项

- 禁止输出无证据的主观评价（"不够精致"、"缺乏设计感"）。
- 禁止用截图"目测"代替测量；必须有 DOM/几何证据。
- 禁止为了 Score 好看强制等高、拉伸背景、补装饰。
