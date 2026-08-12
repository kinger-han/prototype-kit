# Pattern: media-detail（媒体资源详情页）

> 适用：海报详情、图片详情、视频详情、封面详情、素材详情、广告素材查看…
> 核心：**预览区 + 元数据区 + 操作区**的空间编排，由媒体 Aspect Ratio 驱动布局变体。
> 对应组件：page-header（返回/标题/操作）+ layout-media（媒体容器）+ descriptions + status-tag + table（关联记录）+ modal/drawer
> 配套：`layout/planner.md`（决策规则）、`layout/layout.css`（原语类）、`layout/layout-tokens.css`（token）

---

## 0. Layout Planner 必须先行

生成本页面时，AI 必须先产出 Page Model 并交给 Layout Planner 决策，**禁止直接开始写 HTML**：

```jsonc
{
  "page_type": "media-detail",
  "media": { "type": "image|video|poster", "aspect_ratio": "16:9|9:16|1:1|4:3|3:4|wide", "available": true },
  "metadata": { "size": "small|medium|large" },   // <6 / 6-12 / >12 字段
  "title": "short|long",                            // >24 字为 long
  "priority": { "preview": 0.8, "metadata": 0.2 },  // 视觉权重
  "density_intent": "comfortable"
}
```

Planner 依据 `planner.md` 决策表输出 Layout Directive（variant / 比例 / 密度），本页 HTML 按 Directive 组装。

---

## 1. 页面结构（自上而下）

```
Page Header（返回 + 标题 + 右侧操作：编辑/下载/删除）
  ↓
Split 双栏（比例由 Aspect Ratio 决定，见下节）
  ├─ Preview 区（layout-media + caption）
  └─ Metadata 区（layout-panel）
      ├─ 关键信息摘要（状态 Tag + 尺寸/时长 + 创建时间）
      ├─ 详细信息（descriptions 双列）
      └─ 操作区（Action：编辑/替换/下载/分享）
  ↓
Related Records（关联记录卡片：使用位置/投放记录/版本历史，可选）
```

## 2. Layout Variant 决策（Aspect Ratio → 布局变体，Layout Policy）

| 媒体 Aspect Ratio | Variant | 比例 | Preview 区策略 | Metadata 区策略 |
|---|---|---|---|---|
| landscape（16:9 / 21:9 / 4:3） | `landscape-preview-wide` | `layout-split-64`（62/38） | 宽、最大高 66vh | 固定宽度面板 |
| portrait（9:16 / 3:4） | `portrait-preview-narrow` | `layout-split-38`（38/62） | 窄、高、最大高 66vh | 宽面板（信息可两列） |
| square（1:1） | `square-balanced` | `layout-split-50`（50/50） | 平衡、正方形 | 平衡面板 |
| media 不可用 | `metadata-only` | 单列（无 split） | 占位符（placeholder） | 全宽面板 |

**规则：**
- 禁止所有媒体类型使用同一固定 50/50 布局。
- 比例选择是"Layout Policy 决策"，不是 AI 临场写 if/else；Planner 输出 Directive 后 AI 照做。
- 媒体区永远 `max-height: 66vh`，防止超高竖版撑爆页面；内容 `object-fit: contain` 完整展示不裁切。
- 两区域默认 `align-items: start`（顶部对齐），**不强制等高**；Metadata 短时右侧留白是正常结果，不要用背景填充假装等高。

## 3. 区域规则

| 事项 | 规定 |
|---|---|
| Preview 容器 | `class="layout-media layout-media-{ratio}"`；img/video 用 `object-fit: contain`；背景 `--color-bg-fill` |
| Preview 叠加 | 名称/时长/尺寸放 `.layout-media-caption`（底部渐变条）；播放按钮放容器中心 |
| 关键信息摘要 | 状态 Tag + 关键字段（尺寸/时长/大小/创建人），3~5 项，用 descriptions 或 info-grid |
| 详细信息 | descriptions 双列，label 灰字右对齐；字段过多时用 section-title 分组，不用重复卡片 |
| 操作区 | 文字链接或按钮组：编辑/替换/下载/分享/删除；危险操作（删除）必须 Modal 二次确认 |
| 关联记录 | 内嵌小表格（使用位置/投放记录），放卡片内 flush 模式 |
| Metadata 很多 | `layout-panel-scroll`（内部滚动），页面本身不拉长 |
| Metadata 很少 | 面板顶部对齐，下方留白正常；不拉伸、不补装饰 |

## 4. 密度策略

- 默认 `comfortable`（gap 24px）。
- 后台密集场景（素材库列表跳详情）→ `compact`。
- 展示型场景（对外预览/评审）→ `spacious`。

## 5. 行为

- 返回：左上角「← 返回」文字链接（icon: arrow-left），回来源列表
- 播放：视频点击中心播放按钮 → 替换为 video 播放（原型模拟）
- 编辑/替换：打开 Modal/Drawer（走 media-editor 或表单）
- 下载/分享：toast「已加入下载队列」/「链接已复制」（原型模拟，不真实执行）
- 删除：Modal 确认 → toast「删除成功」→ 返回列表
- 关联记录：点击跳转对应页面（原型可仅 toast）

## 6. 默认方案（不确定时用这个）

Page Header（返回 + 标题 + 编辑/下载）→ `layout-split-64`（landscape）双栏：
Preview（layout-media-landscape + caption）+ Metadata（关键信息摘要 + descriptions + 操作区）→
关联记录表格。Metadata 6~10 个字段，Mock 数据符合业务上下文。

## 7. 验证清单（生成后自检，对应 critic.md）

- [ ] 两个区域不是强制等高（右侧短时留白正常）
- [ ] Preview 没有超出 66vh / 没有被裁切
- [ ] 区域 gap 用的是密度档，不是随意 margin
- [ ] 竖版海报没有硬套 50/50 横版比例
- [ ] Metadata 超长可滚动，页面不无限拉长
- [ ] 无 Emoji 图标、无裸几何（width: 65% 等）、颜色全部来自 token
