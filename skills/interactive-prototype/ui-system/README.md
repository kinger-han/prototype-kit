# UI System（原型 UI 设计系统）

> 生成单 HTML 原型时的视觉规范与资产库。
> 目标：让普通模型「选择和组合」，而不是「自由设计」。
> 配套规则先读：`rules.md`（UI Constitution）。

---

## 何时使用

- 新生成单 HTML 原型（一次性小原型）
- 为已有原型新增页面，需要视觉决策时
- 需要图标 / 图表时

**不使用**：`build.py` 组件化项目的日常修改（页面继续使用 shell 已有类名，
UI System 仅作视觉参考，不混用类名）。

## 使用流程（生成页面时）

```
收到用户需求
  ↓
现有需求分析流程（需求理解部分不变）
  ↓
识别页面类型（列表/详情/表单/审批/看板…）
  ↓
读取 patterns/ 选择 Page Pattern
  ↓
通过 registry.json 判断需要哪些组件
  ↓
按需读取对应 Pattern / Component（不全量读取）
  ↓
图标从 icons/registry.json 选择（Lucide）
  ↓
图表从 charts/registry.json + recipes/ 选择（ECharts）
  ↓
填入真实业务内容和合理 Mock Data
  ↓
组装成单 HTML（见下方「单 HTML 组装清单」）
```

⚠️ **不要默认全量读取整个 ui-system**。按需读取：先 README → registry → 需要的 Pattern/Component。

## 文件索引

| 路径 | 内容 |
|---|---|
| `tokens.css` | 唯一 Design Tokens（颜色/字体/间距/圆角/阴影） |
| `rules.md` | UI Constitution：模型能做什么、不能做什么 |
| `registry.json` | 资产注册表：按业务语义查 Pattern / Component |
| `patterns/` | 5 种页面模式：list / detail / form / approval / dashboard |
| `components/` | 14 个高频组件：button / input / select / search-form / status-tag / card / descriptions / table / pagination / tabs / modal / drawer / empty / page-header |
| `icons/registry.json` | 业务语义 → Lucide 图标映射表 |
| `charts/rules.md` | 图表选择规则 + 固定视觉契约 |
| `charts/registry.json` | 图表 Recipe 注册表 |
| `charts/recipes/` | 4 种图表 Recipe：line / bar / horizontal-bar / donut |

## 单 HTML 组装清单

最终交付：**一个 HTML 文件，双击直接打开即可查看**。

组装顺序：

1. `<style>` 内联 `tokens.css` 全文（放最前）
2. `<style>` 内联所用组件的 `<style>` 块（每个组件文件自带，去重合并）
3. 页面结构 HTML（用组件模板填充业务内容）
4. 图标：`<head>` 引入 Lucide CDN（固定版本），页面底部执行 `lucide.createIcons();`
5. 图表（如需）：`<script>` 引入 ECharts CDN（固定版本）+ 拷贝对应 Recipe 函数 + `echarts.init(...).setOption(...)`
6. 业务 JS（交互逻辑）
7. 无构建步骤，直接可打开

### 固定 CDN（版本统一，勿换）

```html
<!-- 图标：Lucide -->
<script src="https://cdn.jsdelivr.net/npm/lucide@0.454.0/dist/umd/lucide.min.js"></script>

<!-- 图表：ECharts -->
<script src="https://cdn.jsdelivr.net/npm/echarts@5.5.0/dist/echarts.min.js"></script>
```

CDN 不可用时的降级：图标不显示（页面仍可用）；图表区显示 `"图表数据加载失败"` 占位文本。

## 命名约定

- UI System 组件类名统一前缀 `ui-`（`.ui-btn`、`.ui-table`、`.ui-tag`…），与 shell/旧项目类名隔离。
- 所有颜色/圆角/间距/阴影只允许引用 `var(--token)`。

## 维护规则

- 新增组件/图标/图表前先查 registry，能复用就不新增。
- 修改视觉一律改 Token（tokens.css），不允许在单个组件里改色值绕过 Token。
