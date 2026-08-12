# Layout Planner（布局决策规则）

> Layout Planner 是「Requirement → Intent/Page Model → **Layout Directive**」的决策层。
> 职责：把 AI 的**布局意图**（页面类型、媒体类型、内容优先级、密度）翻译成**几何决策**（比例、尺寸、对齐、滚动）。
> AI 禁止跳过本层直接写裸几何；Planner 输出 Directive 后，Renderer（AI 组装）照做。

---

## 1. 输入：Page Model（AI 产出，半结构化）

```jsonc
{
  "page_type": "media-detail | media-editor | list-detail | form-detail | dashboard | preview-metadata | split-view | master-detail | full-preview | content-inspector",
  "media": {
    "type": "image | video | poster | document | none",
    "aspect_ratio": "16:9 | 9:16 | 1:1 | 4:3 | 3:4 | 21:9 | custom:<w>:<h>",
    "available": true | false
  },
  "metadata": { "size": "small | medium | large" },   // <6 / 6-12 / >12 字段（或表单字段数）
  "title": "short | long",                            // >24 字为 long
  "priority": { "<region_id>": 0.0~1.0 },              // 区域视觉权重（可选，默认按 pattern 表）
  "density_intent": "compact | comfortable | spacious",
  "context": { "viewport": "desktop | mobile", "max_width": 1440 }
}
```

## 2. 决策规则（Layout Policy，可配置表，不是 if/else 写死）

### 2.1 页面类型 → 布局骨架

| page_type | 骨架 | 默认 Split | 区域 |
|---|---|---|---|
| media-detail | Split 双栏 + 可选关联区 | 见 2.2（Aspect Ratio 驱动） | preview / metadata / actions / related |
| media-editor | Split 双栏 | 见 2.3（Aspect Ratio + 字段数驱动） | preview / inspector / bottom-actions |
| list-detail | 列表区 + 详情区（Master Detail） | `layout-split-45` | list / detail |
| form-detail | 单列分区表单 + 固定底部操作 | 无 split | form-sections / bottom-actions |
| dashboard | 顶部 KPI + 主图 + 次级图 + 明细表 | 无 split（纵向 stack） | kpi / main-chart / breakdown / detail-table |
| preview-metadata | Split 双栏（内容 + 侧栏） | `layout-split-64` | content / metadata |
| full-preview | 全宽单栏媒体 | 无 split | media（全宽） |
| content-inspector | Split 双栏（内容 + 检查器） | `layout-split-70` | content / inspector |

### 2.2 media-detail：Aspect Ratio → Layout Variant（Layout Policy）

| aspect_ratio | variant | split | preview | metadata |
|---|---|---|---|---|
| landscape（16:9 / 21:9 / 4:3） | `landscape-preview-wide` | `layout-split-64` | 宽，max-height 66vh | 固定宽面板 |
| portrait（9:16 / 3:4） | `portrait-preview-narrow` | `layout-split-38` | 窄高，max-height 66vh | 宽面板（两列） |
| square（1:1） | `square-balanced` | `layout-split-50` | 平衡 | 平衡 |
| unavailable | `metadata-only` | 单列 | placeholder | 全宽 |

**修正项（在基础 variant 之上叠加）：**
- `metadata.size == large` → metadata 区加 `layout-panel-scroll`
- `metadata.size == small` → 保持顶部对齐，不拉伸不补装饰
- `title == long` → preview 列加宽一档（landscape 64→70），避免长标题挤压
- `priority.preview < 0.5`（如纯信息场景）→ 改 `layout-split-50`

### 2.3 media-editor：Aspect Ratio + 字段数 → Layout Variant

| aspect_ratio | 字段数 | variant | split | 策略 |
|---|---|---|---|---|
| landscape | ≤8 | `editor-landscape-inspector` | `layout-split-55` | 预览略宽 |
| landscape | >8 | `editor-landscape-form` | `layout-split-45` | 表单优先 |
| portrait | 任意 | `editor-portrait` | `layout-split-38` | 预览窄高，表单宽 |
| square | 任意 | `editor-square` | `layout-split-50` | 平衡 |

**修正项：**
- 字段数 >12 → density 降为 `compact`
- `priority.form > 0.6` → 表单侧至少 `layout-split-45`
- 表单字段两列布局（`repeat(2,1fr)`），描述/备注整行

### 2.4 密度档 → gap / padding / 字号

| density_intent | gap | padding | 字号 | 适用 |
|---|---|---|---|---|
| compact | 12px（spacing-md） | 12px | 13px（font-size-sm） | 后台列表、字段 >12 的编辑页 |
| comfortable（默认） | 24px（spacing-xl） | 24px | 14px（font-size-md） | 详情页、编辑页、大部分页面 |
| spacious | 32px（spacing-xxl） | 32px | 16px（font-size-lg） | 展示型/评审页/Landing |

## 3. 输出：Layout Directive（Renderer 只读，AI 组装时照做）

```jsonc
{
  "pattern": "media-detail",
  "variant": "landscape-preview-wide",
  "split": "layout-split-64",
  "regions": [
    { "id": "preview",  "class": "layout-region layout-media layout-media-landscape",
      "constraints": { "max_height": "66vh", "align": "start" } },
    { "id": "metadata", "class": "layout-region layout-panel",
      "constraints": { "min_width": "320px", "max_width": "480px", "scroll": "auto" } }
  ],
  "density": "comfortable",
  "gap": "var(--layout-density-comfortable-gap)",
  "stretch": false,
  "responsive": { "breakpoint": "1100px", "fallback": "single-column" }
}
```

**Directive 铁律：**
1. AI 组装时只使用 Directive 给出的 split 类、region 类、density 类；**禁止改比例**。
2. 区域内组件仍走 Component Registry（ui-* 组件），布局与组件互不越界。
3. `stretch: false` 时禁止给区域加等高（flex/grid 默认 stretch 会被覆盖为 start）。
4. 响应式回退由 layout.css 媒体查询处理，AI 不写媒体查询。

## 4. 禁止项（Planner 层）

- 禁止输出任意百分比（如 58.5%）；只允许档位（70/64/55/50/45/38/30）。
- 禁止输出任意 px 间距；只允许 token 引用（var(--spacing-*)/var(--layout-*)）。
- 禁止输出 `position: absolute` 布局；浮动/绝对定位只在组件内部用。
- 禁止为「填空」强制等高或拉伸背景。
- 禁止用 if/else 临场设计布局——一切走 Policy 表。
