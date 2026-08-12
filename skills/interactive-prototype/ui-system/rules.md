# UI Constitution（UI 宪法）

本文件约束模型在生成页面时的 UI 自由发挥空间。
**目标是「选择与组合」，不是「自由设计」。**

> Never invent when you can select.

---

## 一、模型拥有的权利

| 权利 | 说明 |
|---|---|
| 内容决定权 | 页面文案、字段、Mock 数据由模型根据业务需求决定 |
| 信息架构决定权 | 页面里放哪些区块、顺序如何，由模型决定 |
| 页面 Pattern 选择权 | 从 `patterns/` 选择最匹配的页面模式 |
| Component 选择权 | 从 `components/` 选择组件，从 `registry.json` 查询 |
| Component 内容填充权 | 组件内部文案/数据由模型填充 |

## 二、模型原则上不拥有的权利

| 事项 | 原因 |
|---|---|
| 自由创造颜色 | 颜色只能来自 `tokens.css` 变量 |
| 自由创造字体 | 字体只允许 `--font-family` / `--font-size-*` |
| 自由创造 spacing | 间距只允许 `--spacing-*` 与 4px 基准 |
| 自由创造 border radius | 圆角只允许 `--radius-*` |
| 自由创造 shadow | 阴影只允许 `--shadow-*` |
| 自由设计 icon | 图标只能从 `icons/registry.json` 选择 |
| 自由绘制 SVG | 禁止现场画任何 SVG 图标 |
| 自由设计 chart 风格 | 图表只能使用 `charts/recipes/` 固定 Recipe |

## 三、明确禁止

1. **禁止使用 Emoji 作为 UI 图标**（`🔴` `📊` `👍` 等一律不许出现在界面元素中）。
2. **禁止使用文本字符模拟图标**：`+`、`-`、`>>`、`▼`、`→`、`✓`、`✕`、`×` 等代替应使用图标的位置。
3. **禁止为了「高级感」加入装饰**：
   - gradient（渐变背景）
   - glassmorphism（毛玻璃）
   - 大面积彩色背景
   - 发光效果（box-shadow 外发光、text-shadow 光晕）
   - 夸张阴影（超出 `--shadow-lg` 的程度）
   - 无意义装饰元素（纯装饰线条/色块/动效）
4. **禁止模型现场绘制 SVG 图标**。
5. **禁止模型现场发明 Icon Name**——所有图标必须来自 `icons/registry.json`。
6. **禁止模型现场创造新的 Chart 视觉体系**——图表必须使用 `charts/recipes/` 提供的 Recipe。
7. **禁止同一种语义在不同位置使用不同颜色**——一切颜色引用 Token。

## 四、无法确定时的默认选择

当模型不确定某个设计决策时，**优先使用更简单、保守、标准的 Ant Design B 端方案**：

- 不确定配色 → 用 Token 默认值
- 不确定布局 → 用 Pattern 的标准区块顺序
- 不确定组件 → 用最常用的那一个（按钮、表格、卡片）
- 不确定图表 → 用 Table，而不是创造特殊图表
- 不确定图标 → 宁可不显示图标，不用 Emoji / Unicode / 文本符号 / 自绘 SVG

## 五、选择优先级（Fallback 顺序）

```
1. 已有 Page Pattern          （patterns/ 5 种）
2. 已有复合 Pattern           （search-form 等复合组件）
3. 已有 Component             （components/ 14 种）
4. 用已有基础组件做新组合      （允许）
5. 最后才允许生成缺失结构      （必须遵守本 rules + tokens + icon registry）
```

- **允许创造新的「组合」**：用现有组件拼出新结构（如 Popover + List + Checkbox 代替 TreeSelect）。
- **尽量禁止创造新的「视觉原子」**：新颜色、新阴影、新图标、新图表风格。
- 任何临时生成的结构仍必须：使用 tokens、使用 icon registry、遵守本文件。

## 六、唯一视觉来源

- 整个 UI System 只有一套视觉 Source of Truth：**`tokens.css`**。
- 组件之间不得互相发明视觉语言，全部引用 Token。
- 禁止使用 Tailwind blue-600、Material blue 等近似色替代 Token。
