# AntD5 主色覆盖（build.py 组件化项目 · shell 模板主色替换）

> 用途：`build.py` 组件化项目使用 `pc` 模板时，shell 主色硬编码 `#0B5DEA`（或项目自定义色）。
> 当需要全站统一为 AntD5 主色 `#1677ff`（或任何品牌色）时，**不要改 shell 模板**（会影响所有项目），
> 把下面这段覆盖样式塞进 `pages/_shared.html` 的共享容器里，一次写入、全站生效。

## 放置位置

`prototype/pages/_shared.html` 顶部（第一个共享弹窗之前）：

```html
<div class="proto-page" id="page-res-shared-modals" style="display:none;">

  <!-- ====== 全站 AntD5 主色覆盖（shell 默认 #0B5DEA → #1677ff，写一次全站生效） ====== -->
  <style>
  .menu-item:hover, .menu-group-title:hover { color: #1677ff; }
  .menu-item.active { color: #1677ff; font-weight: 500; }
  .breadcrumb a:hover { color: #1677ff; }
  .filter-select:focus, .filter-input:focus { border-color: #1677ff; }
  .filter-btn:hover { border-color: #1677ff; color: #1677ff; }
  .filter-btn.primary { background: #1677ff; color: #fff; border-color: #1677ff; }
  .toolbar-btn:hover { color: #1677ff; border-color: #1677ff; }
  .toolbar-search input:focus { border-color: #1677ff; }
  .page-btn:hover { color: #1677ff; border-color: #1677ff; }
  .page-btn.active { background: #1677ff; color: #fff; border-color: #1677ff; }
  .detail-tab:hover { color: #1677ff; }
  .detail-tab.active { color: #1677ff; border-bottom-color: #1677ff; font-weight: 500; }
  .confirm-btn:hover { border-color: #1677ff; color: #1677ff; }
  .export-btn-confirm { background: #1677ff; color: #fff; border-color: #1677ff; }
  .export-row select:focus, .export-row input:focus { border-color: #1677ff; }
  .venue-form .form-control:focus, .faq-form .form-control:focus { border-color: #1677ff; }
  .action-btn { color: #1677ff; }
  .link-btn { color: #1677ff; }
  </style>
```

> 若项目主色不是 `#1677ff`，批量替换这段里的颜色即可（用 Python 一次替换，勿手改多处）。

## 页面内颜色替换映射（AntD5 tokens，全站批量）

页面 HTML/JS 里旧色 → 新色（Python 批量替换，保持编码 utf-8-sig）：

| 旧值 | 新值 | 说明 |
|---|---|---|
| `#095CEA` / `#0B5DEA` | `#1677ff` | 主色 |
| `#074BD4` | `#0958d9` | 主色 hover/active 深 |
| `#E6EFFD` / `#e8f0fe` / `#f0f5ff` / `#f5f7ff` | `#e6f4ff` | 主色浅底（选中背景） |
| `#d6e4ff` | `#91caff` | 主色浅边框 |
| `rgba(9,92,234,0.85)` | `rgba(22,119,255,0.85)` | 阴影 |
| `rgba(9,92,234,0.1)` / `(0.08)` | `rgba(22,119,255,0.1)` / `(0.08)` | 聚焦光环 |
| `#f5f6f8`（hover 背景） | `#e6f4ff` | 选项 hover 浅蓝 |
| `#f5f6f8`（border 分割线） | `#f0f0f0` | 分割线保持中性 |

⚠️ `#f5f6f8` 分两种语义：`background:` 的 hover 背景 → 浅蓝 `#e6f4ff`；`border-top/bottom:` 的分割线 → 中性 `#f0f0f0`。**必须区分处理，不能一刀切**。

## 验证清单

1. `node --check` 所有页面 JS（提取 `<script>` 后检查）
2. 构建后 dist 检查：`#095CEA` 残留 = 0、`#f5f6f8` 残留 = 0、覆盖块出现 = 1
3. shell 自带 `#0B5DEA` 在 dist 中残留是正常的（被覆盖块压住，视觉已生效）

## 踩坑记录

- **不要改 shell 模板**：`src/shells/shell-pc.html` 主色硬编码 36 处 `#0B5DEA`，改它影响所有用该模板的项目；用 `_shared.html` 覆盖是隔离方案
- **页面内已加的覆盖块要删掉**：旧做法是在每个页面 style 里加覆盖（01/02 页），重复且难维护；统一收敛到 `_shared.html` 写一次
- build.py 不复制 assets 到 dist：本地文件（如 lucide.min.js）放 `prototype/assets/`，页面用 `../assets/xxx` 相对路径，dist 与源文件解析一致
