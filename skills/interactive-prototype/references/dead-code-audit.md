# 原型死代码审计与清理（可复用）

触发：用户说"看看有没有死代码/冗余代码，可以精简一下"。流程：**先只读审计出报告 → 用户确认（A/B/C）→ 再清理**，不要直接动手删。

## 一、审计（全站只读扫描，execute_code + Python）

```python
import re, os, glob
from collections import defaultdict

base = r"<项目>/prototype/pages"
files = sorted(glob.glob(os.path.join(base, "*.html")))
texts = {os.path.basename(f): open(f, encoding='utf-8').read() for f in files}
joined = '\n'.join(texts.values())

# 1) 函数定义: name -> [(file, line)]
defs = defaultdict(list)
for fn, txt in texts.items():
    for m in re.finditer(r'function\s+([A-Za-z_$][\w$]*)\s*\(', txt):
        defs[m.group(1)].append((fn, txt[:m.start()].count('\n') + 1))

# 2) 引用计数: 出现次数 == 1 → 只有定义无调用 → 候选死函数
unused = [(n, d) for n, d in defs.items() if len(re.findall(r'\b' + re.escape(n) + r'\b', joined)) == 1]

# 3) 跨文件重名（构建按文件名顺序合并，后定义覆盖先定义）→ 高危，单独输出
dup = {n: d for n, d in defs.items() if len({f for f, _ in d}) > 1}
```

注意：
- `init_xxx` 系列是框架调用的（protoShowPage 触发），**不算死函数**，审计结果里排除。
- onclick="name(...)" 会被 `\bname\b` 计入 → 有 HTML 引用就不是死函数。
- 子串误匹配：`\bname\b` 已挡掉大部分，但 `function init_resource_mgmt` 会命中 `init_resource_mgmt_a/b/2`（`_` 是 \w），需人工甄别或按 `\bfunction\s+name\s*\(` 精确提取定义。
- 隐藏页（无菜单入口）的函数：统计其函数被别页引用数——全部无外部引用 → 整页死代码（可删文件）；部分被引用（如 03 页 upload/import/batch 弹窗逻辑被 07 复用）→ 隐藏共享源，保留，只删页内死函数。
- `_shared.html` 弹窗：统计弹窗 id 在全站出现次数，除 _shared 自身外为 0 且其 open 函数无引用 → 死弹窗簇（DOM + 业务函数一起删）。

## 二、判断注意（防误删）

1. **被活函数间接调用的不算死**：先查候选死函数被哪些函数调用（引用它的行在哪个函数体内），被活函数调用的保留（实例：03 页 `renderBatchAuditList` 被活函数 `openBatchAuditModal` 调用）。
2. **渲染循环里调的 trigger 函数是活的**：`updateResMgmtCatTrigger` 被 `renderResMgmtCards()` 调用 → 保留；簇内其余函数（open/modal/render tree 等）才删。看起来属于"死簇"但被渲染路径引用的函数要留下，否则渲染时 ReferenceError。
3. **删函数前 grep 全部引用点**：`grep -rn "函数名" *.html`——HTML 按钮 onclick、_shared.html 弹窗 DOM 按钮 onclick 都会把"已删函数名"留在 dist。连引用点一起清（按钮删掉、弹窗 DOM 整块删掉）。
4. **删除整页文件前必须过「符号盘点」硬门禁**（只看页面 id 引用远远不够）：① 提取该页定义的**全部**函数名；② 每个名字统计**全站出现次数（含该页自身文件）**，定义处之外为 0 才算真死；③ 逐个列出仍被引用的函数及其引用方文件，据此刻画该页是「纯死」还是「隐藏共享源」。实测教训：某页零菜单入口、零页面 id 引用，看似可删，实际承载 17 个被 `_shared.html` + 4 个业务页引用的弹窗函数（上传/导入/批量审核/轮播时长）——删文件后**构建照常成功、node --check 全绿、dist 检查也过**，直到用户点「上传」才炸。→ 跑 `scripts/scan-page-symbols.py <项目目录> --page <文件名>`
5. **判死的口径只有一个：全站计数（含定义文件自身）**。不要用「其他文件有没有引用」的简化版——函数自己 script 里拼出的 `onclick="fn(...)"` 字符串是合法调用点。实测：`removeUploadTag` 被这条简化口径误判为死函数删掉，而它的调用点就在同文件的 HTML 拼串里，删完无任何报错。

## 二·补、页面退役：废弃页 → 共享组件（首选，优于删文件）

页面已无菜单/路由入口、但仍承载共享函数时，标准动作是**退役为共享组件**，不是删文件：

1. **先 commit**：退役是破坏性操作，靠 git 兜底（出事用 `git show <commit>:<原路径>` 取回原文，别指望手工重建）
2. 改文件头 `PAGE_META` 为 `{"id": "_新名", "shared": true}`
3. **保留外层 `.proto-page` 容器**但改名 + 加隐藏：`<div class="proto-page" id="page-新名" style="display:none;">`——build.py 的 `parse_component` 靠 `class="proto-page"` 提取内容，去掉容器反而解析不到
4. **只删 UI**：`</style>` 之后到 `<script>` 之前的页面 DOM 整段丢弃；`<style>` 与 `<script>` **原样保留**（共享 CSS 与全部函数都在这两段里）
5. 清理页面身份残留：`RES_CURRENT_PAGE` / `RES_BACK_PAGE` 默认值、返回按钮兜底、`renderAppSidebar` 的 backId 映射里指向旧 id 的分支，全部改到现役页面
6. **shell 静态占位菜单一并清**：菜单若由 `renderAppSidebar` 动态渲染，shell `.sub-menu` 里那些 `menu-item`（onclick 指向已不存在页面的标题）就是死 HTML；每个页面的 `init_xxx` 都会重渲染菜单，删静态项安全（删前 grep 确认 `renderAppSidebar` 在全部页面 init 里都调了）
7. 验证：断链扫描为空 + node --check + 构建注入页数 = 剩余页面数 + dist 内旧页面容器 id 计数为 0

命名按**职责**而非原页面序号：`_res-core.html`（数据 + 通用函数）、`_res-upload.html`（弹窗业务函数）。

## 二·补2、页面/菜单重构后必跑：断链扫描

页面重命名、函数删除、菜单清洗之后，做一次**双向符号核对**（`scripts/scan-page-symbols.py`）：收集**全部** `onclick/oninput/onchange/...` HTML 属性里的调用名，**加上** script 拼串里出现的 `onclick="fn(...)"`，减去已定义函数集合，差集必须为空。白名单只在明确知道来源时加（`protoShowPage` 由 build 注入；`getElementById`/`preventDefault` 这类成员调用属误匹配，脚本已按「先剥 `obj.method(` 再取裸调用」处理）。

价值实测：这条扫描揪出一个**早就存在**的断链——01 页编辑弹窗的类别搜索框 `oninput="onEditCasSearch()"`，而该函数从未定义，一输入就报错，长期无人发现（因为没人点过那个框）。补齐时照同类入口（筛选 / 批量搜索）同构实现即可。

## 三、清理执行（防踩坑）

1. 删大段（整簇）用脚本按行号删：`for s, e in sorted(ranges, reverse=True): del lines[s-1:e]` —— **必须从后往前删**，否则前面的行号失效。
2. 删除后**立即 node --check**（提取 `<script>` 到临时 .js）。常见错误与修复：
   - `Unexpected token '}'` → 删除范围末尾多算/少算一行，残留孤立 `}` 或把下一函数声明行删了 → 看报错行上下文删残留 `}` / 补回 `function` 行。
   - 单行函数（`function x() { ... }` 一行内 `{`/`}` 平衡）用朴素深度计数会误判结束行（depth 恒 0）→ 只删了开头几行。改用 grep 精确定位整行边界，或 patch 上下文匹配整个函数块。
   - 数组/多行结构：删完数 `{`/`}` 平衡，或直接 node --check 验证。
3. 同一区域多次修复越修越乱时，从生成器/旧版整段重写，别在坏结构上打补丁。
4. 删文件用 `git rm`（保留历史）；用户确认过方案才删。

## 四、最终验证

0. **断链扫描为空**（`scripts/scan-page-symbols.py <项目目录>`）：HTML 事件属性与 script 拼串调用的名字减去已定义函数，差集必须为空。有残留就在交付前修掉，不要留给用户点的时候才发现。
1. 全页 node --check（12+ 文件逐个提取 script 检查）。
2. build.py 重建 → 注入页数应减 1（删整页时）；dist script node --check。
3. **残留检查**：grep dist 每个被删函数名，出现次数应为 0（排除应保留的同名函数，如 02 页 openDeleteConfirm 资源删除版）。
4. 关键功能抽查：浏览器 protoShowPage 各页 + 核心交互（如修复过命名冲突的删除按钮、主题资源模式）正常。
5. `git diff` 审查删除行清单，确认无意外删除（尤其脚本删行后）。
6. git commit + push（改前工作区 clean 即备份）。

## 实测案例（2026-08-10 主题管理 V4.12）

- 审计发现 13 个零引用死函数 + 4 组跨文件重名（其中 openDeleteConfirm 逻辑不同 = 隐藏 bug）+ 07/11 类别筛选弹窗死簇 + 03 visibility 弹窗死簇 + 08 整页死代码。
- 修复：01 页删除函数改名 openTopicDeleteConfirm（恢复主题删除）；删 11 页重复 openResImgView；删 13 死函数 + 2 个死簇（含 _shared 死弹窗 DOM + HTML onclick 引用）；git rm 08 页。
- 结果：dist 1203KB → 1048KB（-13%），构建注入 13→12 页，全站 node --check 通过，浏览器抽查功能正常。
