# Phase 5: 增量修改已有原型（Patch 模式）

> 从 interactive-prototype skill 提取。当用户要求"对着改"/"在现有原型上加功能"时的完整方法论。

---

## ⚠️ 先出方案，再动手

用户说"改一下XX"→ 不应该直接动手改5个版本。应该先问："你想改哪些？一次到位还是分步？" 用户只关心**最终可用的完成版**，不需要中间版本。

## ⚠️ 不要把大任务扔给子agent

子agent适合"读代码→分析→给建议"，不适合"从零生成100K+代码"。子agent写巨大生成脚本→超时600秒，生成的代码有转义bug、缺函数，还要手动修。

**正确做法**：Hermes自己用Python脚本分步patch，每步验证。

---

## 三阶段工作流（最小化Token消耗）

**原则：读一次，想清楚，改一轮。**

### Phase 1: 侦查（一次扫描，输出摘要）

用Python脚本一次性提取所有关键位置，输出坐标摘要（几百字），不是全文：

```python
SRC = r"path/to/file.html"
with open(SRC, 'r', encoding='utf-8') as f:
    html = f.read()
# 提取区域边界
style_end = html.find('</style>')    # ⚠️ 用 find，不用 rfind！
script_start = html.find('<script>')
script_end = html.rfind('</script>')
# 提取所有关键锚点坐标 + 检查唯一性
for a in anchors:
    count = html.count(a)
    if count > 1: print(f'WARNING: "{a}" appears {count}x')
```

### Phase 2: 读局部（不读全文）

用 `read_file(offset, limit)` 或 `search_files` 定位后读20-30行，不要全文read。

### Phase 3: 一轮执行（一个脚本搞定所有修改）

把所有修改写进一个Python脚本，按区域分组（CSS/HTML/JS），一次执行。

**Token消耗对比**：
- ❌ 边做边想（8-12次全文read）≈ 1M+ token
- ✅ 三阶段流程（1次侦查+3-5次局部）≈ 200K token

### ⚠️ dist 文件的批量修改

当改动涉及弹窗、共享 CSS、共享 JS 时，必须改 dist 文件。dist 文件通常 150K+，逐个 patch 效率低。

**推荐方式**：写一个 Python 脚本到 `prototype/fix_dist.py`，用 `str.replace()` 一次做完所有替换，通过 `terminal()` 执行。完成后删除临时脚本。

```python
# fix_dist.py 模板
with open(dist_path, "r", encoding="utf-8") as f:
    d = f.read()
# 按顺序替换（注意：后面的替换不要影响前面已替换的内容）
d = d.replace(old1, new1)
d = d.replace(old2, new2)
# 验证
assert "old1" not in d, "替换1未生效"
with open(dist_path, "w", encoding="utf-8") as f:
    f.write(d)
```

**同时改 source + dist**：page 文件的改动（筛选、表格、JS函数）和 dist 的改动（弹窗、CSS）要在一个脚本里同时完成，避免不同步。

---

## 修改方法

### 方法A（首选）：Hermes patch 工具

```
patch(mode='patch', patch='''
*** Begin Patch
*** Update File: path/to/file.html
@@ CSS区域修改 @@
 .old-style { color: red; }
+.new-style { color: blue; }
@@ HTML区域修改 @@
-<div class="old">old content</div>
+<div class="new">new content</div>
@@ JS区域修改 @@
 function oldFunc() { ... }
+function newFunc() { ... }
*** End Patch
''')
```

**patch 工具优势**：
- 自动处理行尾差异（CRLF/LF）
- 模糊匹配（9种策略），缩进微调不会break
- 一个 patch 调用可以同时修改 CSS、HTML、JS 多处

**用法**：对每个改动点写一个 `@@ 标题 @@` hunk，包含足够的上下文行确保唯一匹配。
- 上下文行用空格前缀（不变的行）
- `-` 前缀 = 删除行
- `+` 前缀 = 新增行
- 每个 hunk 的 old_string 必须在文件中唯一，否则加更多上下文

**当 patch 报 "Found N matches" 时**：给 old_string 加更多前后行上下文（如包含具体数据内容而非仅结构标签）。

**实战经验**：HTML表格中多个 `<tr>` 结构相似（如未命中问题列表的6行数据），每行的 `<td>知识库无相关内容</td>` 会出现4次匹配。解决方案：
- 用该行独有的数据内容作为上下文，如 `<td>有没有停车场，怎么收费</td>` 这行的问题原文是唯一的
- 或者用该行前后的独有内容，如上一行的 `</tr>` + 当前行第一个 `<td>` 组合
- 每个 hunk 的 old_string 至少包含一个该位置独有的文本值

### 方法B：Python str.replace()

用 Python 脚本做定向 patch：
1. `read()` 读取原文件全文
2. 用 `str.replace()` 定位 CSS/HTML/JS 中的特定代码块，替换为新版本
3. 在 `</style>` 前插入新 CSS，在 `</script>` 前插入新 JS，对应 `<!-- 注释 -->` 位置插入新 HTML
4. `write()` 输出到 `xxx_v2.html`，不覆盖原文件

**优势**：最小化改动、不影响已有功能、改动可 diff 对比。

**Python 脚本模板**：

```python
with open(SRC, 'r', encoding='utf-8') as f:
    html = f.read()
# CSS: 在 </style> 前插入
html = html.replace('</style>', new_css + '</style>', 1)
# HTML: 在目标注释/标签位置插入
html = html.replace('<!-- TARGET -->', new_html + '<!-- TARGET -->', 1)
# JS: 在 </script> 前插入
html = html.replace('</script>', new_js + '\n</script>', 1)
# 函数替换：精确匹配旧函数体，替换为新版本
html = html.replace(old_function_code, new_function_code, 1)
with open(DST, 'w', encoding='utf-8') as f:
    f.write(html)
```

### 方法B增强：大规模升级的一次性脚本

当升级涉及 3+ 个改动点（新增页面 + 更新多个现有页面 + 弹窗 + CSS + JS + 清理），**写一个完整的 Python 脚本一次性做完所有改动**，不要分 10 次单独 patch。

> **Token优化**：大规模改动时参考三阶段流程（侦查→局部读→一轮执行），避免反复全文read。

---

## 区域分割法

**选择标准**：
- 改动 ≤3 处，锚点足够唯一 → 全文 str.replace() 即可
- 改动 4+ 处，或涉及删除大段代码 → **必须用区域分割法**，否则 `replace()` 会跨 CSS/HTML/JS 边界匹配，把 JS 函数插到 CSS 区域（反之亦然），导致所有交互失效

**脚本结构（区域分割法）**：

```python
SRC = "原文件.html"
DST = "新文件.html"  # 永远输出到新文件
with open(SRC, 'r', encoding='utf-8') as f:
    html = f.read()

# Step 0: 按区域分割（避免跨区域误匹配）
style_end = html.find('</style>')      # ⚠️ 用 find，不用 rfind！
script_start = html.find('<script>')
script_end = html.rfind('</script>')
css = html[:style_end]
body = html[style_end:script_start]
js = html[script_start:script_end]

# 在各自区域内修改，最后重组
html = css + '</style>\n' + body + js + '</script>' + tail
```

**临时方案（仅适用于单处修改）**：限定搜索范围到目标区域内

```python
script_start = html.find('<script>')
script_end = html.rfind('</script>')
target = html.find('/* Toast */', script_start, script_end)
```

**关键原则**：
- **先验证锚点，再做替换** — 锚点不存在 = 文件结构和预期不符，必须停下来检查
- **按依赖顺序** — 先加新内容，再改旧内容，最后删死代码
- **每步 print 进度** — 方便调试定位哪步出了问题
- **输出到新文件** — 永远不覆盖原文件
- **删除功能时同步清理 JS** — 删除 HTML 元素后，引用该元素的 JS 函数（getElementById）必须一并移除，否则 JS 报错导致后续所有代码失效

---

## 文件锁定处理

⚠️ 文件被占用时的处理流程：
1. 先尝试直接保存，如果 PermissionError → 保存到新文件名（如 `xxx_v3.xlsx`）
2. 告诉用户关闭占用的程序（如 Excel）
3. 用户关闭后，用 Python `load_workbook` 读取新文件 → 写回原文件 → 删除临时文件
4. 不要让用户手动操作文件替换

⚠️ Windows 文件锁定：如果原文件被 Excel/浏览器占用，`save()` 会 PermissionError。解决：输出到新路径（`_v2.html`），不原地覆盖。

### execute_code 中 str.replace() 的 \r\n 陷阱（Windows 致命陷阱）

在 `execute_code` 中用 `read_file` + `str.replace()` 批量修改 HTML 文件时，**Windows 文件的 `\r\n` 换行会导致替换静默失败**。

**根因**：`read_file` 返回 `"NNN|content"` 格式，用 `split('\n')` 拆行后，每行末尾残留 `\r`。你的 `str.replace()` 用 `\n` 拼接多行字符串，但文件实际是 `\r\n`，所以永远匹配不上——不报错，只是 0 次替换。

**修复模板**（每次 execute_code 做批量替换时必须加）：

```python
from hermes_tools import read_file, write_file

result = read_file("path/to/file.html", limit=2000)
raw = result['content']

# 关键：strip 行号 + 去掉 \r
lines = []
for line in raw.split('\n'):
    line = line.rstrip('\r')  # ← 这行不能省
    if '|' in line:
        parts = line.split('|', 1)
        if parts[0].strip().isdigit():
            lines.append(parts[1])
        else:
            lines.append(line)
    else:
        lines.append(line)
content = '\n'.join(lines)

# 现在 str.replace() 可以正常工作
content = content.replace('old string\nwith newline', 'new string\nwith newline')
```

**诊断信号**：`str.replace()` 后 `content.count('新增内容')` 为 0，但不报错。加 `print(repr(content[idx:idx+100]))` 检查是否有 `\r`。

**替代方案**：如果只有 1-3 处改动，直接用 Hermes `patch` 工具（mode='replace'），它自动处理 CRLF。批量 4+ 处改动才需要 execute_code + str.replace()。

---

## 迁移已有原型到引用模式（完整6步流程）

当用户要把已有单文件原型迁移到引用模式时，**必须按以下步骤**，不能跳步：

### Step 1：分析原文件结构

- grep 找页面标记、函数名、数据数组
- 确认页面数量、弹窗归属、JS 结构

### Step 2：制作 Shell 模板（由用户确认，不是 AI 自动提取）

- AI 从原文件分析出 Shell 结构（CSS + 菜单 + 弹窗 + 共享 JS 边界）
- AI 输出一份 Shell 提取方案给用户确认
- 确认后 AI 执行提取，写入 `src/shells/shell-pc-xxx.html`
- 用户确认 Shell 文件正确后，后续 AI 不再修改它
- **如果原文件本身就是定稿模板**，直接复制为 Shell，不做任何修改

**为什么不让 AI 自动提取 Shell？**

Shell 是框架层基准，AI 自动提取容易出现偏差（菜单丢失、CSS 不全、弹窗遗漏）。用户手动确认一次，能确保框架层边界正确，后续维护更清晰。

**Shell 提取 Python 脚本框架**：

```python
SRC = r"原文件.html"
SHELL_OUT = r"prototype-kit/src/shells/shell-pc.html"

with open(SRC, "r", encoding="utf-8") as f:
    lines = f.read().split('\n')

# 定位边界（用 grep -n 找行号）
# - CSS 结束：</style> 所在行
# - content-area 开口：<div class="content-area"> 所在行
# - content-area 关闭：<!-- /content-area --> 所在行
# - 弹窗开始：第一个 <!-- ====== XXX弹窗 所在行
# - <script> 所在行
# - </script> 所在行

# 组装 shell = CSS+布局+菜单+顶栏 + 注入标记 + 关闭标签 + 弹窗 + 共享JS
shell = '\n'.join(lines[0:content_area_line+1])  # 到 content-area 开口
shell += '\n      <!-- build.py 注入页面 -->\n'
shell += '\n'.join(lines[content_area_close:layout_close+1])  # 关闭标签
shell += '\n'.join(lines[modal_start:script_line])  # 弹窗
shell += '<script>\n'
shell += '\n'.join(lines[data_start:switchPage_end+1])  # 数据+共享JS
shell += '\n</script>\n</body>\n</html>'

with open(SHELL_OUT, 'w', encoding='utf-8') as f:
    f.write(shell)
```

### Step 3：统一 switchPage 为标题式

- shell 的 switchPage 必须改为 `function switchPage(pageTitle, element)` 形式
- 菜单 onclick 改为 `switchPage('页面标题', this)`
- switchPage 内部只做：菜单高亮 + 面包屑更新（不再直接操作 page-section 显隐）
- 页面显隐由 build.py 的 protoShowPage 包装处理

**shell 的 switchPage 约定**：

```js
function switchPage(pageTitle, element) {
  // 1. 清除所有菜单高亮
  document.querySelectorAll('.sub-menu .menu-item').forEach(m => m.classList.remove('active'));
  // 2. 高亮当前菜单项
  if (element) element.classList.add('active');
  // 3. 更新面包屑
  updateBreadcrumb(pageTitle);
  // ❌ 不要在这里操作 page-section 显隐
  // ❌ 不要在这里调 renderVenueTable() 等渲染函数
}
```

页面显隐和数据渲染由 build.py 的 protoShowPage + init_xxx() 处理。

**switchPage 转换**：如果原文件用 `switchPage('pageId')`（ID式），需改为 `switchPage('标题', this)`（标题式），否则 build.py 的 wrapper 无法映射 title→pageId。菜单 onclick 同步修改。

### Step 4：提取页面组件

AI 在一次执行中，按页面标记从原文件提取 page HTML、页面弹窗、页面数据和页面函数，并分别写入各页面组件文件；必要时可临时使用代码辅助拆分，但不要求额外沉淀固定工具脚本。每个组件需补齐 `init_xxx()`。

**提取脚本模板**：

```python
import re, os

SRC = r"原文件路径.html"
OUT_DIR = r"项目/prototype/pages"

with open(SRC, "r", encoding="utf-8") as f:
    html = f.read()

# 1. 定义页面标记（顺序=页面在文件中的出现顺序）
page_markers = [
    ("pageId1", "页面标题1", "<!-- ====== 页面：页面标题1 ====== -->"),
    ("pageId2", "页面标题2", "<!-- ====== 页面：页面标题2 ====== -->"),
]

# 2. 弹窗归属映射：弹窗名关键词 → 页面 ID
modal_map = {
    "用户详情弹窗": "pageId1",
    "导出弹窗": "pageId1",
    "场馆详情弹窗": "pageId2",
}

# 3. JS 函数归属映射：页面 ID → [函数名列表]
# ⚠️ 用 grep -o "function [a-zA-Z_]*" 原文件.html | sort -u 获取实际函数名
func_map = {
    "pageId1": ["openUserDetail", "closeUserDetail", "doExport"],
    "pageId2": ["openVenueDetail", "closeVenueDetail", "renderVenueTable"],
}

# 4. 辅助函数：花括号匹配提取完整函数体
def extract_function(js_code, func_name):
    pattern = re.compile(r'(function\s+' + re.escape(func_name) + r'\s*\([^)]*\)\s*\{)', re.MULTILINE)
    match = pattern.search(js_code)
    if not match:
        return None
    start = match.start()
    brace_count = 0
    in_string = False
    string_char = None
    i = match.end() - 1
    while i < len(js_code):
        c = js_code[i]
        if in_string:
            if c == string_char and (i == 0 or js_code[i-1] != '\\'):
                in_string = False
        else:
            if c in ('"', "'", '`'):
                in_string = True
                string_char = c
            elif c == '{':
                brace_count += 1
            elif c == '}':
                brace_count -= 1
                if brace_count == 0:
                    return js_code[start:i+1].strip()
        i += 1
    return None

# 5. 输出组件文件
for pid, (filename, title) in file_map.items():
    meta = f'<!-- PAGE_META: {{"id": "{pid}", "title": "{title}"}} -->'
    content = f"{meta}\n\n{page_html}\n\n<!-- 页面弹窗 -->\n{modals}\n\n<script>\n{js_code}\n</script>"
    with open(os.path.join(OUT_DIR, filename), "w", encoding="utf-8") as f:
        f.write(content)
```

**⚠️ 函数/数据提取必须逐个确认，不能靠猜名字**

**错误做法**：
1. grep 出 v5 的函数名
2. 手动分类到各页面（凭印象，有歧义的跳过）
3. 按分类列表提取
→ 结果：漏掉函数、漏掉数据数组

**正确做法**：
1. grep 出原文件的**所有** `function xxx` 和 `const/let xxx =` 名称
2. 逐个用 `grep -n "functionName|varName"` 确认它在哪个页面区域被引用
3. 有歧义的看上下文（不是看名字猜）
4. 提取后跑对比：v5 函数数 vs 构建产物函数数，差一个都要查

**验证清单**：
- 构建后对比原文件和产物的函数数量（`grep -o "function \w+" | wc -l`）
- 对比数据变量数量（`grep -o "(const|let) \w+" | wc -l`）
- 差值应该只包含 build.py 包装函数（`protoShowPage`、`_origSwitchPage`、`init_xxx`），其他差值 = 漏提取

### Step 5：每个组件必须有 init_xxx()

- 页面组件必须有 `function init_xxx()` 在 `<script>` 块中
- init 函数调用该页面的渲染逻辑（如 `renderVenueTable()`、`renderSessionLogs()`）
- build.py 切换页面时会自动调用 `init_xxx()`
- xxx = 页面 ID 的连字符替换为下划线

```html
<script>
// 数据
const venueData = [...];
// 函数
function renderVenueTable() { ... }
// 初始化（必须有！）
function init_venue_mgmt() {
  renderVenueTable();
}
</script>
```

没有 init 函数的页面，切换到该页面时内容为空白。

### Step 6：构建后必须验证 JS 语法 + 功能验收

- 在项目根目录运行 `build.bat`
- 如果报 `Identifier 'xxx' has already been declared` → 有重复声明，必须删除
- 如果报其他语法错误 → 有代码结构被破坏，必须修复
- **绝对不要用裸正则做 JS 去重**——必须识别完整的声明语句（到分号/闭括号）

**功能验收清单**：
- [ ] 菜单数量和原文件一致
- [ ] 每个页面可以正常切换
- [ ] 核心交互（弹窗、表单、数据展示）正常工作
- [ ] Console 无红色错误
- [ ] 产物大小接近原文件（参考项，差距 <20%）

---

## 迁移后产物大小验证

用户明确说过："V5版本完整的是141KB，你现在搞一个78KB的跟我说，搞完了？"

迁移后产物大小应接近原文件（差距 <20%）。如果差距大，按以下顺序排查：
1. **shell 缺 CSS** — 通用模板的 CSS 远不如原文件丰富。必须从原文件提取 shell。
2. **shell 缺弹窗** — 弹窗在 body 级别，不在 page-section 内。提取 shell 时必须保留全部弹窗。
3. **shell 缺共享 JS** — 数据对象、showToast、toggleMenu 等共享函数必须在 shell 中。
4. **页面组件缺内容** — parse_component 的嵌套 div 截断问题。

**绝对不要把"文件能打开"等同于"迁移成功"。** 必须验证：菜单正确、页面可切换、按钮可点击、样式与原文件一致。

---

## 大规模升级后的结构验证

做完 3+ 个改动点的批量升级后，**必须跑结构验证脚本**，不要只看文件大小。

```python
import re
# 1. HTML 标签平衡
for tag in ['div', 'table', 'tr', 'td', 'th']:
    opens = len(re.findall(f'<{tag}[\\s>]', html))
    closes = html.count(f'</{tag}>')
    assert opens == closes, f"<{tag}> {opens} vs {closes}"

# 2. JS 花括号平衡
js = re.search(r'<script>(.*?)</script>', html, re.DOTALL).group(1)
assert js.count('{') == js.count('}'), "JS braces unbalanced"

# 3. 必需元素存在
required = ['pageXxx', 'pageYyy', 'modalZzz']
for r in required:
    assert f'id="{r}"' in html, f"Missing: {r}"

# 4. 无残留旧代码
stale = ['?cid=', 'id="pageOld"']
for s in stale:
    assert s not in html, f"Stale: {s}"

# 5. 文件完整性
assert html.strip().endswith('</html>')
assert '<!DOCTYPE html>' in html[:100]
```

⚠️ 不要在 bash/terminal 里用 `sed` 编辑 HTML 文件——中文编码和特殊字符会导致乱码。

---

## 文件损坏恢复策略

当修改导致文件损坏（内容截断、只剩CSS、结构破坏）时：
1. **不要在损坏文件上反复修补**——可能越改越乱
2. **从最后一个已知完好的版本恢复**（v2/v3/v4...），用一个完整脚本重建
3. **把所有改动合并到一个Python脚本中一次执行**，避免分步操作引入新问题
4. 恢复后先验证基础结构（`</html>` 存在、`<script>` 存在、JS语法OK），再加新功能

---

## 跨文件功能删除清单

删除一个功能时，必须按以下清单逐项检查，不能只改一个文件就认为完成：

| 位置 | 检查项 |
|------|--------|
| pages/*.html | JS 函数中的逻辑分支、innerHTML 模板、数据数组字段 |
| dist/*.html | 弹窗 HTML、弹窗 JS、共享 CSS 中的样式 |
| SPEC-EXAMPLE.md | 示例 JSON 中的 done/spec 字段 |
| 智能导游-功能清单.md | 功能表格中的描述文字 |
| annotations.json | 标注的 done 数组、spec 字段 |

典型遗漏：改了 pages 源文件但忘了改 dist 弹窗（弹窗在 shell 层），或改了功能清单但忘了改 SPEC-EXAMPLE。

---

## 相关陷阱速查

| 陷阱 | 症状 | 解决 |
|------|------|------|
| 区域边界误匹配 | JS函数插入到CSS区域 | 用区域分割法 |
| Windows \r\n | str.replace() 静默失败(0次替换) | strip \r |
| 删除HTML不清JS | Cannot read properties of null | grep 找 getElementById 引用 |
| 重复声明 | has already been declared | 逐个确认数据归属 |
| 锚点跨版本不匹配 | 替换找不到目标 | 用 find('部分关键词') |
| 模板字符串引号冲突 | SyntaxError: Unexpected identifier | 用 &apos; 或反引号 |
| HTML标签闭合 | 属性文字作为可见文本显示 | old_string 止于标签属性区域前 |
| Python嵌入JS的unicode转义 | SyntaxError: (unicodeerror) | 含 `\uXXXX` 的JS字符串用 raw string `r"""..."""` 或在Python中用 `\\uXXXX` 双转义 |
| 视觉验证太慢 | 用户等不及 | 改完原型不要自己开浏览器验证，告诉用户改完了让他自己看 |
