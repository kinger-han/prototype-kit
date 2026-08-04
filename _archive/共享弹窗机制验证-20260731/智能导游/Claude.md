# 智能导游 — Claude Code 工作指引

> 最后更新：2026-07-23

## 必读文件（按顺序）

1. **`README.md`** — 项目全貌、架构、路径、修改流程、踩坑记录（交接文档）
2. **`prototype/proto-config.json`** — 项目配置（菜单、模板）
3. **具体页面** — 改哪个读哪个，不全读：
   - `prototype/pages/01-user-mgmt.html` — 用户管理
   - `prototype/pages/02-venue-mgmt.html` — 场馆管理
   - `prototype/pages/03-miss-stats.html` — 未命中问题统计
   - `prototype/pages/04-kb-management.html` — 知识库管理
   - `prototype/pages/04-session-logs.html` — 会话记录

## 必读 Skills（用 skill_view 加载）

1. `skill_view(name='interactive-prototype')` — 原型构建规范、修改流程、陷阱集合
2. `skill_view(name='annotation-system')` — 标注系统规范（V4.2）

**读完这两个 skill 再动手，不要凭经验猜。**

## 构建命令

```bash
# Python 路径（固定）
PYTHON="D:/HermesData/hermes-agent/venv/Scripts/python.exe"
BUILD="D:/hpy/文档/ObsidianVault/06-资源/模板/prototype-kit/build.py"
PROJECT="D:/hpy/桌面/数熙相关文档/智能导游"

# 构建正常版
$PYTHON $BUILD pc --project-path="$PROJECT"

# 构建标注版
$PYTHON $BUILD pc --project-path="$PROJECT" --with-annotations
```

## 修改原则

1. **只改 pages/*.html**（页面 HTML + JS）
2. **弹窗改 shell 模板**（`prototype-kit/src/shells/shell-pc.html`）
3. **改完必须 build.py 重建**
4. **JS 语法检查**：`node --check` 验证
5. **Git commit + push**：改完主动推，不用等提醒

## 关键路径速查

| 路径 | 说明 |
|------|------|
| `prototype/pages/` | 页面源文件（改这里） |
| `prototype/dist/` | 构建产物（不要直接改） |
| `prototype-kit/src/shells/shell-pc.html` | Shell 模板（弹窗/CSS） |
| `prototype/annotations/annotations.yaml` | 标注数据 |
