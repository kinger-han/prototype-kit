# Pattern: media-editor（媒体编辑页）

> 适用：编辑海报、编辑图片、编辑视频素材、替换封面、素材属性编辑…
> 核心：**预览区（所见即所得）+ 编辑表单（Inspector）**的空间编排。
> 对应组件：page-header（返回/标题/保存）+ layout-media（预览）+ card + input + select + date-picker + switch + button
> 配套：`layout/planner.md`、`layout/layout.css`、`layout/layout-tokens.css`

---

## 0. Layout Planner 必须先行

```jsonc
{
  "page_type": "media-editor",
  "media": { "type": "image|video|poster", "aspect_ratio": "16:9|9:16|1:1|4:3|3:4|wide", "available": true },
  "metadata": { "size": "small|medium|large" },   // 编辑字段数
  "title": "short|long",
  "priority": { "preview": 0.5, "form": 0.5 },     // 编辑场景预览与表单权重相近
  "density_intent": "comfortable"
}
```

编辑页与详情页的关键差异：**表单（Inspector）是核心任务区，不能压缩**；预览区用于所见即所得反馈，可以更灵活。

---

## 1. 页面结构（自上而下）

```
Page Header（返回 + 标题 + 右侧：取消 / 保存）
  ↓
Split 双栏（比例由 Aspect Ratio + 字段数决定）
  ├─ Preview 区（layout-media 实时预览 + 替换/裁剪入口）
  └─ Inspector 区（layout-panel：编辑表单）
      ├─ 基本信息（标题/描述/标签）
      ├─ 属性设置（尺寸/时长/分类/状态）
      └─ 发布设置（时间/渠道/权限）
  ↓
底部操作条（取消 + 保存，可省略如果 Header 已有）
```

## 2. Layout Variant 决策（Aspect Ratio + 字段数 → 布局变体）

| 媒体 Aspect Ratio | 字段数 | Variant | 比例 | 策略 |
|---|---|---|---|---|
| landscape | ≤8 | `editor-landscape-inspector` | `layout-split-55`（55/45） | 预览略宽，Inspector 正常宽 |
| landscape | >8 | `editor-landscape-form` | `layout-split-45`（45/55） | 表单优先，预览让位 |
| portrait | 任意 | `editor-portrait` | `layout-split-38`（38/62） | 预览窄高，表单宽（字段两列） |
| square | 任意 | `editor-square` | `layout-split-50`（50/50） | 平衡 |
| 替换媒体（编辑已有素材） | 任意 | `editor-replace` | `layout-split-50` | 预览区含「替换」按钮 + 上传占位 |

**规则：**
- 编辑场景**表单（Inspector）优先于预览**，与详情页（预览优先）相反。
- 竖版媒体在编辑页依然用窄高预览（`layout-split-38`），表单区加宽两列排字段，**不能压窄表单**。
- Preview 的实时更新：表单字段（标题/描述/状态）修改 → JS 同步更新预览区对应元素（toast 反馈）。
- 预览区高度策略同 media-detail：`max-height: 66vh`，竖版时允许窄高，但表单区永远是内容优先。

## 3. 区域规则

| 事项 | 规定 |
|---|---|
| Preview 区 | `class="layout-media layout-media-{ratio}"`，内含实时预览元素 + 底部「替换媒体」文字按钮 |
| 替换入口 | 文字链接（icon: upload），点击打开上传 Modal（原型模拟：选择文件 → 预览占位更新） |
| Inspector | `layout-panel`，字段 ≤6 单卡片；>6 用 section-title 分区（基本信息/属性设置/发布设置） |
| 字段布局 | 每行 2 列（grid `repeat(2,1fr)`，gap 16px）；描述/备注占整行 |
| 必填 | label 前红色 `*`；提交校验必填，空则显示 `ui-form-error` |
| 布尔字段 | 用 Switch（上架/下架、公开/私有），不用「点击切换」标签 |
| 日期/枚举 | date input / select，不用自绘控件 |
| 取消/保存 | Header 右侧：取消（default）+ 保存（primary）；保存 → toast「保存成功」→ 返回详情/列表（原型模拟） |
| 保存校验 | 模拟校验：必填为空显示错误文案，不完整校验 |

## 4. 密度策略

- 默认 `comfortable`；字段多（>12）→ `compact` 提高表单密度。
- 编辑页不使用 spacious（浪费操作空间）。

## 5. 行为

- 预览同步：标题/状态修改 → 预览区更新（JS 监听 input/change）
- 替换媒体：打开上传 Modal → 选择后更新预览占位 + 提示「替换成功（原型模拟）」
- 保存：校验 → toast「保存成功」→ 返回（history.back 或路由）
- 取消：不校验直接返回

## 6. 默认方案（不确定时用这个）

Page Header（返回 + 标题 + 取消/保存）→ `layout-split-55`（landscape）双栏：
Preview（layout-media-landscape + 替换按钮）+ Inspector（基本信息 2 列 6 字段 + 属性设置 2 列 4 字段 + 发布设置 2 列 2 字段）→
保存 toast 后返回。

## 7. 验证清单（对应 critic.md）

- [ ] 表单区没有被预览区压窄（字段保持 2 列可读）
- [ ] 竖版媒体没有导致表单变窄到 1 列
- [ ] 预览与表单不是强制等高
- [ ] 替换入口可见且不遮挡预览内容
- [ ] 字段分区用 section-title 而非重复卡片
- [ ] 无 Emoji 图标、无裸几何、颜色全部来自 token
