# HANDOFF — Prototype Kit 环境交接文档

> 写给任何 AI 工具（Codex、Claude Code、trae 等）的交接说明。
> 读完这个文件，你就能直接使用 prototype-kit 做原型 + 标注，
> 不需要再自己摸索路径或踩重复的坑。
>
> 工作流相关（怎么写页面、怎么避免坑）见 `interactive-prototype` 技能的
> `references/pitfalls-complete.md`，本文档专攻**环境配置**和**约定**。

---

## 1. 系统环境

### Python

| 信息 | 值 |
|------|-----|
| 系统 Python | `python` = 3.11.15（Windows 环境变量已配） |
| Hermes venv Python（备用） | `D:/HermesData/hermes-agent/venv/Scripts/python.exe` |
| uv（预装） | 路径 `~/.local/bin/uv`，可用 `uv pip install` |

**⚠️ WSL 里没有系统 Python**，Claude Code / Codex 在 WSL 中执行时必须用绝对路径：
```
D:/HermesData/hermes-agent/venv/Scripts/python.exe
```
或者进 Windows 环境（不在 WSL 里）执行。

**build.py 依赖 PyYAML**，Hermes venv 里已有。如果用系统 Python：
```bash
pip install pyyaml
# 或用 uv
uv pip install pyyaml
```

### Node / npm

| 信息 | 值 |
|------|-----|
| 中国大陆镜像 | 必须配置，否则 npm install 极慢或失败 |
| npm registry | `npm config set registry https://registry.npmmirror.com` |
| Electron 镜像 | 构建 Electron 时设置 `ELECTRON_MIRROR=https://npmmirror.com/mirrors/electron/` |

---

## 2. 物理路径

### Prototype Kit 本体

```
D:/hpy/文档/ObsidianVault/06-资源/模板/prototype-kit/
├── build.py          # 构建脚本（绝对路径调它）
├── src/
│   ├── shells/       # 外壳模板（shell-pc.html / shell-mobile.html）
│   ├── assets/       # base.css / base.js / mock-data.js
│   └── platforms/    # 内嵌模式项目（兼容旧用法）
├── dist/             # 内嵌模式构建产物
├── docs/             # 旧版规范
└── references/       # 参考文档（interactive-prototype 技能的同名文件）
```

### 项目产出物（引用模式）

```
D:/hpy/桌面/数熙相关文档/<项目名>/
├── README.md
├── docs/
└── prototype/
    ├── proto-config.json
    ├── pages/         # 页面组件（读写这里）
    └── dist/          # 构建产物（只读，不直接改结构）
```

### 其他路径

| 内容 | 路径 |
|------|------|
| Obsidian Vault（知识库） | `D:/hpy/文档/ObsidianVault/` |
| 项目索引 | `D:/hpy/文档/ObsidianVault/项目索引.md` |
| Hermes Memory | `D:/HermesData/memory/` |
| Hermes Skills | `D:/HermesData/skills/` |

---

## 3. Git 仓库状态

| 仓库 | 位置 | 远程 | 说明 |
|------|------|------|------|
| prototype-kit | Obsidian vault 内 | ❌ 仅本地 | 未推 GitHub，只有本地 commit |
| smart-tour-guide | 另有路径 | ✅ 有远程 | 可 commit + push |
| Hermes skills | `D:/HermesData/skills/` | ❌ 仅本地 | 用户待创建 GitHub 仓库 |

**工作流要求**（羡阳明确要求）：
- 改代码前先 `git commit` 备份
- 改完后再 `git commit`（+ push，如果有远程）
- prototype-kit 只用 `git commit`，不用 `git push`

---

## 4. 工具链集成

### Hermes（当前搭档）

Hermes 负责：理解需求 → 策划方案 → 协调执行 → 验证验收。
他有所有技能和记忆，是"大脑"角色。他可能把执行交给 Codex / Claude Code。

### Codex

Codex 通过项目目录下的 `README.md` 交接。
Hermes 会更新 README.md 让 Codex 知道当前进度。

**⚠️ Codex 在 WSL 中无 Python**：必须用绝对路径调 Windows 的 Python：
```
D:/HermesData/hermes-agent/venv/Scripts/python.exe
```

### Claude Code

Claude Code 通过项目目录下的 `CLAUDE.md` 或 `CLAUDE.txt` 读取上下文。
**Claude Code 不会自动加载 Hermes skills**——如果 Claude Code 参与了项目，
需要在项目目录放 `CLAUDE.md` 显式告诉它读哪些 skill 文件。

**检测方式**：项目目录有 `CLAUDE.md` = Claude Code 参与了。

### trae / qcaw / CC Switch

这些工具目前没有固定交接机制，HANDOFF.md 就是给它们看的。
**每个工具在开始工作前应先读这个文件。**

---

## 5. 羡阳的 PC 原型约定

### 视觉约定（必须遵守）

1. **不要页面标题/副标题**：PC 页面顶部不放 `V2主题管理` 或 `XX系统 - 说明性副标题` 这类 page-header。删掉即可，不影响路由。
2. **不要"共X条"统计**：列表页 toolbar 中不显示"共 8 条"这种统计。
3. **类别筛选**：用弹窗（宽度 ≥ 520px），不用下拉。
4. **工具栏/浮窗：点击展开**，不要用 hover 自动展开（用户认为 hover 烦人）。

### 交互约定

- 页面切换通过 `switchPage(pageId)`，所有页面在同一个标签页内完成
- 按钮统一用 `.action-btn`（蓝色文字链接），表单内按钮用 `.filter-btn`
- 弹窗结构控制：`.modal-overlay → .modal`，通过 `.show` 类控制显隐

### 修改流程约定

```mermaid
git commit（备份） → 只改 pages/*.html → build.py 构建 → 用户自验 → git commit
```

- **禁止直接改 dist 文件的 HTML 结构**（会导致标签嵌套破坏）
- **禁止用 patch 反复修改 annotation.js**（极易损坏，从 dist 捞原版重写）
- 影响其他功能要先说清楚，让用户决策

---

## 6. 标注系统（V4.2）关键规则

### 文件位置

| 文件 | 作用 | 大小 |
|------|------|------|
| `annotation.js` | 标注引擎（渲染角标、打标交互） | ~13KB |
| `inspector.js` | 标注编辑器（创建/编辑/删除标注） | ~3.4KB |
| 两者都在本次构建的 dist 产物中 | 构建时静态注入 | — |

### 构建注入链路

1. build.py 读取 `pages/*.html` 提取 `data-anno` 属性
2. 从 `annotations.json`（或等效数据）生成快照 JSON
3. 在 `</head>` 前注入标注 CSS
4. 在 `</body>` 前注入 `__ANNOTATIONS_SNAPSHOT__` + annotation.js + inspector.js
5. 生成 `xxx-标注版.html`

### 关键约束

| 规则 | 原因 |
|------|------|
| ⚠️ **不要用 patch 反复修改 annotation.js** | 极易损坏文件；从 dist 捞原版重写更可靠 |
| ⚠️ **YAML 必须有 `items:` 包装层** | 标注系统依赖的标准格式 |
| ⚠️ **data-anno 加在可见交互元素上** | 不要加在 modal-overlay 等不可见元素上 |
| ⚠️ **构建后 dist 被覆盖** | 弹窗等 shell 层修改需重新应用 |
| ⚠️ **annotation.js 不要手动编辑** | Hermes 记忆里有明确教训，改了就坏 |

### Inspector API

Inspector 通过 `__annoCreate(callback)` API 打标建壳（不重建表单）。
`capture` 阶段 + `stopPropagation` 阻断旧 `pickHandler`。
工具栏贴边收起：纯 CSS（`max-width` + `overflow:hidden` + `:hover` 展开）。

---

## 7. 构建命令速查

所有命令都在 `prototype-kit/` 根目录执行。

```bash
# 引用模式（推荐）——构建当前项目
python build.py --project-path="D:/hpy/桌面/数熙相关文档/<项目名>"

# 只构建 PC 端
python build.py pc --project-path="..."

# 只构建移动端
python build.py mobile --project-path="..."

# 构建带标注版
python build.py pc --project-path="..." --with-annotations

# 带 --scope 过滤标注范围
python build.py pc --project-path="..." --scope=page-1,page-2

# 带 --review 生成审核清单
python build.py pc --project-path="..." --review
```

**构建后验证**（自动）：
- JS 语法检查：提取 `<script>` → `node --check`
- 结构验证：`</html>` 闭合、必需元素存在
- 功能验收：菜单数量、页面切换、核心交互

---

## 8. 常见陷阱速查

见 `interactive-prototype` 技能的 `references/pitfalls-complete.md`（50+ 条全面陷阱），
以下是最容易导致"方向错误"的几条：

| 陷阱 | 症状 | 正确做法 |
|------|------|----------|
| 找不到 Python | "command not found" | 用绝对路径调 Hermes venv 的 Python |
| 直接改 dist HTML | 页面空白/标签嵌套破坏 | 改 pages/ 源文件，rebuild |
| patch annotation.js | 文件损坏，标注不工作 | 从 dist 捞原版重写 |
| 改代码前没备份 | 改坏了无法回滚 | 先 `git commit` |
| WSL 里没 PyYAML | build.py 报 ModuleNotFoundError | `uv pip install pyyaml` 或用 venv Python |

---

## 附：快速检查清单

新工具接入时，按顺序确认：

- [ ] 能找到 Python（`python --version` 或绝对路径）
- [ ] 安装了 PyYAML（`python -c "import yaml"`）
- [ ] kit 路径可访问（`D:/hpy/文档/ObsidianVault/06-资源/模板/prototype-kit/build.py`）
- [ ] 项目产出物路径可访问（`D:/hpy/桌面/数熙相关文档/`）
- [ ] 读了 `interactive-prototype` 技能的 pitfalls（50+ 条）
- [ ] 知道 git 工作流：先 commit 再改，改完再 commit
- [ ] 知道 PC 原型约定：无标题、无统计、点击不 hover
- [ ] 知道标注系统铁律：不要 patch annotation.js
