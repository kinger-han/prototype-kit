# 智能导游

## 项目概述

面向数熙客户（博物馆、展览馆等场所）的智能导游功能。游客通过扫码进入微信小程序，手机号登录后，与智能导游 Agent 对话，获取游览路线、展品信息、场地信息等，基于 RAG 由大模型作答。计划 **8月中上线**。

## 背景信息

1. **智能体平台**：基于开源 Dify 私有化部署到云服务器，并做二次开发。
2. **智能客服系统**：原第三方开发的系统，核心是对接第三方向量数据库。现计划将此系统迁移到公司本地自建管理，并对接 Dify 智能体平台。
3. **Agent模式**：采用单一通用 Agent + 动态参数路由（scene参数携带客户ID），不采用一个客户一个Agent。

## 当前状态（2026-07-23 更新）

### ✅ 已完成

| 事项 | 说明 | 日期 |
|------|------|------|
| 功能清单V2定稿 | 一期36项功能 + 后续规划18项，Sheet1+Sheet2 | 07-09 |
| 小程序原型V2 | 卡片式引导+历史会话侧边栏+个人资料页 | 07-09 |
| PC端原型v8 | 场馆管理+用户管理+未命中三层处理+知识库管理+会话记录 | 07-23 |
| 未命中三层架构 | L1自动忽略+L2 AI聚类分组+L3人工处理 | 07-15 |
| 知识库管理页 | 统一FAQ+文档列表、7维度筛选、弹窗交互、选择知识库联动 | 07-23 |
| 标注系统V4.2 | 构建时静态注入ANNO_DATA，annotation.js(13KB)+inspector.js(3.4KB) | 07-22 |
| 标注数据V4 | 64条标注，YAML格式，三字段(type/title/content) | 07-22 |

### ⏳ 待完成

| 事项 | 相关人员 | 状态 |
|------|---------|------|
| Dify平台部署+测试跑通 | 董伦 | 待处理 |
| Dify生产环境服务器采购 | 董伦 | 流程中 |
| LLM选型测试 | 董伦 | 待处理 |
| 智能客服平台迁移 | 董伦 | 本周完成 |
| 小程序前端开发 | 铁发兵 | 7月底前 |
| PC端管理页面开发 | 铁发兵 | 7月底前 |

---

## 原型架构（prototype-kit 框架）

### 核心概念

采用 **组件化模式**：多文件拆分 + build.py 拼装。页面逻辑各自独立，构建时合并为单个 HTML 文件。

```
shell模板（布局骨架 + 弹窗 + 全局CSS/JS）
    ↓ build.py 注入
pages/*.html（页面组件：HTML + JS + 数据）
    ↓ 构建产物
dist/xxx-原型.html（单文件，可直接浏览器打开）
```

### 关键路径

| 路径 | 说明 |
|------|------|
| `D:/hpy/桌面/数熙相关文档/智能导游/` | **项目根目录**（git 仓库） |
| `prototype/pages/` | **页面源文件**（改这里） |
| `prototype/dist/` | **构建产物**（不要直接改） |
| `prototype/proto-config.json` | 项目配置（菜单、模板类型） |
| `prototype/annotations/annotations.yaml` | 标注数据（64条） |
| `D:/hpy/文档/ObsidianVault/06-资源/模板/prototype-kit/` | **prototype-kit 工具包**（build.py + shell模板 + annotation.js） |
| `D:/HermesData/hermes-agent/venv/Scripts/python.exe` | **构建用 Python**（不要用系统 Python） |

### 页面组件一览

| 文件 | 页面 | init 函数 |
|------|------|-----------|
| `01-user-mgmt.html` | 用户管理 | `init_user_mgmt()` |
| `02-venue-mgmt.html` | 场馆管理 | `init_venue_mgmt()` |
| `03-miss-stats.html` | 未命中问题统计 | `init_miss_stats()` |
| `04-kb-management.html` | 知识库管理 | `init_kb_management()` |
| `04-session-logs.html` | 会话记录 | `init_session_logs()` |

---

## 如何构建

```bash
# Python 路径（固定，不要用 py 或系统 python）
PYTHON="D:/HermesData/hermes-agent/venv/Scripts/python.exe"
BUILD="D:/hpy/文档/ObsidianVault/06-资源/模板/prototype-kit/build.py"
PROJECT="D:/hpy/桌面/数熙相关文档/智能导游"

# 构建 PC 端原型
$PYTHON $BUILD pc --project-path="$PROJECT"

# 构建 PC 端 + 标注版
$PYTHON $BUILD pc --project-path="$PROJECT" --with-annotations

# 构建全部（PC + 移动端）
$PYTHON $BUILD --project-path="$PROJECT"
```

### 构建流程（内部）

1. 读取 `shell-pc.html`（布局骨架 + 弹窗 + 全局CSS/JS）
2. 扫描 `pages/*.html` → 解析 `PAGE_META` + 页面 HTML + script
3. 将页面 HTML 注入到 shell 的 `<!-- build.py 注入页面 -->` 位置
4. 将页面 JS 脚本注入到 shell 的 `</script>` 前
5. 输出 `dist/智能导游-pc-原型.html`
6. 如加 `--with-annotations`，额外生成 `dist/智能导游-pc-标注版.html`

---

## 如何修改（最小化查找）

### 修改原则

> **只改 pages 源文件 → build.py 重建 → 验证**
> dist 文件只读，禁止直接修改 HTML 结构。

### 按改动类型定位

| 改什么 | 改哪里 | 说明 |
|--------|--------|------|
| 页面表格/筛选/数据 | `pages/0X-xxx.html` | 找对应页面文件，改 HTML 或 JS 模板字符串 |
| 页面 JS 逻辑 | `pages/0X-xxx.html` | 数据数组、render 函数、事件处理都在 `<script>` 里 |
| 弹窗 HTML 结构 | `src/shells/shell-pc.html` | 弹窗在 shell 模板中，不在 pages 里 |
| 弹窗样式 | `src/shells/shell-pc.html` | CSS 在 shell 的 `<style>` 块中 |
| 全局样式 | `src/shells/shell-pc.html` | `.action-btn`, `.filter-btn` 等基础类 |
| 菜单/导航 | `prototype/proto-config.json` | menu 数组 |
| 标注数据 | `prototype/annotations/annotations.yaml` | V4 格式，type/title/content 三字段 |

### ⚠️ 弹窗在 Shell 中

build.py **只注入 page HTML + page scripts**。弹窗（modal-overlay）、共享 CSS、共享 JS（users 数据等）都在 shell 模板中，page 文件无法注入。

**后果**：修改弹窗内容时，必须直接改 shell 模板。改完后每次 rebuild 会保留（因为改的是 shell 本身）。

**操作规范**：
1. Pages 文件改页面 HTML + 页面 JS（table、filter、render 函数等）
2. Shell 模板改弹窗 HTML + 弹窗 JS + 新增 CSS（如 tooltip）
3. 两者都要改时，保持一致

### 修改流程

```
1. 备份：cp 原文件 原文件.bak.原因.YYYYMMDD
2. 改 pages/0X-xxx.html（页面内容/逻辑）
3. 改 shell-pc.html（弹窗/CSS，如需要）
4. 构建：python build.py pc --project-path=...
5. 验证：node --check JS语法 + 浏览器打开看效果
6. Git：commit + push
```

---

## 页面功能速查

### 用户管理（01-user-mgmt.html）

- 用户列表：手机号、昵称、相关客户、总会话、最近访问、注册时间、状态
- 用户详情弹窗（3个Tab）：基本信息 / 访问记录 / 会话记录
- 操作：详情、禁用/启用

### 场馆管理（02-venue-mgmt.html）

- 两个TAB：场馆列表 / 公共知识库配置
- 场馆列表：所属客户、场馆名称、二维码、扫码次数、智能体、知识库、状态、创建时间
- 弹窗：新增场馆、编辑场馆（含知识库+二维码重新生成）、场馆详情、删除确认、停用确认
- 公共知识库配置：客户ID、客户名称、知识库ID、API Key

### 未命中问题统计（03-miss-stats.html）

- 三层处理架构：L1自动忽略 / L2 AI聚类分组 / L3人工处理
- 未命中问题列表：问题原文、触发次数、来源客户、来源场馆、处理状态

### 知识库管理（04-kb-management.html）

- 知识条目列表：内容类型、标题/问题、内容摘要、相似问法、所属客户、所属场馆、来源、状态、近30天命中
- 操作列：详情 + 更多▾（编辑/重新解析/删除/下载）
- 弹窗：新增问答（含选择知识库联动）、上传文档（含选择知识库联动）、知识详情
- **选择知识库联动**：选"公共知识库"→隐藏场馆字段，选"场馆知识库"→显示场馆字段

### 会话记录（04-session-logs.html）

- 会话列表：会话ID、用户、来源客户、来源场馆、智能体、开始时间、消息轮次、兜底次数、会话质量
- 会话质量"?"tooltip：白底黑字圆角气泡，显示判定规则
- 会话详情弹窗：元信息 + 对话记录

---

## 标注系统（V4.2）

### 文件位置

| 文件 | 说明 |
|------|------|
| `prototype/annotations/annotations.yaml` | 标注数据（64条，YAML格式） |
| `prototype-kit/src/assets/annotation.js` | 渲染引擎（角标+浮窗+工具栏） |
| `prototype-kit/src/assets/annotation-inspector.js` | Inspector 面板（查看/编辑标注） |

### 标注格式（V4 极简版）

```yaml
items:
  kb-01:
    type: "button"          # page/button/list/modal
    title: "新增问答"
    content: |              # 功能说明 + 交互规则
      ### 功能
      打开新增问答弹窗
      ### 交互与规则
      1. 点击后打开弹窗
```

### 标注类型

| type | 说明 |
|------|------|
| page | 整个页面的功能描述 |
| button | 按钮/操作入口 |
| list | 列表/表格 |
| modal | 弹窗 |

### 标注编号规则

- 每个页面独立编号（用户管理有01，场馆管理也有01）
- key 加页面前缀避免冲突（如 `user-01`, `venue-01`, `kb-01`, `log-01`）
- 标注 JSON 中 TAB 内容加 `"tab": "tab-id"` 字段

---

## 相关 Skill

| Skill | 用途 | 加载方式 |
|-------|------|---------|
| `interactive-prototype` | 原型构建规范、修改流程、陷阱集合 | `skill_view(name='interactive-prototype')` |
| `annotation-system` | 标注系统规范（V4.2） | `skill_view(name='annotation-system')` |

**必读**：改原型前先加载这两个 skill，不要凭经验猜。

---

## 踩坑记录（避免重复犯错）

### 构建相关

1. **Python 路径固定**：`D:/HermesData/hermes-agent/venv/Scripts/python.exe`，不要用 `py` 或系统 Python
2. **build.py 必须加 `newline=''`**：Windows 上不加会导致 CRLF 污染正则 `/n/g`，JS 语法错误
3. **dist 文件不要直接改结构**：用 str.replace 插入大段 HTML 会破坏标签嵌套 → 页面空白

### JS 相关

4. **JS 模板字符串引号冲突**：onclick 内单引号和外层冲突 → SyntaxError → 所有交互失效。用 `&apos;` 转义
5. **花括号不匹配整个 script 块失效**：任何一个页面组件有 `{` 或 `}` 数量不等 → 所有函数变 undefined
6. **动态渲染 vs 静态HTML**：改数据前先判断 `function render*`，动态渲染要改 JS 模板或数据源
7. **getElementById id 不匹配**：JS 引用的 id 必须和 HTML 中的 id 完全一致，否则静默失败

### 弹窗相关

8. **弹窗在 shell 模板中**：pages 里的 JS 引用 modal 元素，但 modal HTML 在 shell 模板里 → 按钮点不动
9. **更多菜单 CSS 缺失**：`.more-menu` 等 CSS 类如果没定义 → 下拉菜单直接平铺显示

### 标注相关

10. **标注版必须从 pages 源文件完整构建**：不能直接在已有 dist 上注入 annotation
11. **data-anno 加在可见交互元素上**：不是弹窗/overlay
12. **修改标注格式时不要动内容**：只改 key/编号，不重写 content

### Git 相关

13. **修改后必须 commit + push**：用户明确要求"主动推送，不要等提醒"
14. **备份文件在 .gitignore 中**：`*.bak.*` 已排除

---

## 关键设计决策

| 决策项 | 结论 | 理由 |
|--------|------|------|
| Agent模式 | 单Agent + 参数路由 | 多Agent维护成本高，单Agent加配置即可扩展 |
| 知识库隔离 | 按客户物理/逻辑隔离 | 避免串检，检索速度不随客户数增长变慢 |
| 图文回答 | 一期不做，纯文字+emoji | 降低知识库建设工作量 |
| 语音输入 | 一期做（按住说话） | 参照微信交互，发送识别后文字 |
| 语音条 | 一期不做 | 预录音频为二期功能 |
| 未命中处理 | 三层架构 L1/L2/L3 | 自动过滤+AI聚类+人工兜底 |

---

## 交接方式

| 工具 | 读什么 |
|------|--------|
| Hermes | README.md + MEMORY 中项目指针 |
| Claude Code | README.md + `Claude.md` |
| Codex | README.md + `AGENTS.md` |

## Obsidian 项目记录

项目信息同步记录在：`ObsidianVault/04-项目/智能导游/AAA-项目概览.md`

---

*最后更新：2026-07-23*
