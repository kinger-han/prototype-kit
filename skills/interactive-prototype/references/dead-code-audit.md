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
4. 删除整页文件前：确认菜单无入口（`grep renderAppSidebar` groups）+ 其他页无页面 id 引用 + rm2 等前缀函数无外部引用。

## 三、清理执行（防踩坑）

1. 删大段（整簇）用脚本按行号删：`for s, e in sorted(ranges, reverse=True): del lines[s-1:e]` —— **必须从后往前删**，否则前面的行号失效。
2. 删除后**立即 node --check**（提取 `<script>` 到临时 .js）。常见错误与修复：
   - `Unexpected token '}'` → 删除范围末尾多算/少算一行，残留孤立 `}` 或把下一函数声明行删了 → 看报错行上下文删残留 `}` / 补回 `function` 行。
   - 单行函数（`function x() { ... }` 一行内 `{`/`}` 平衡）用朴素深度计数会误判结束行（depth 恒 0）→ 只删了开头几行。改用 grep 精确定位整行边界，或 patch 上下文匹配整个函数块。
   - 数组/多行结构：删完数 `{`/`}` 平衡，或直接 node --check 验证。
3. 同一区域多次修复越修越乱时，从生成器/旧版整段重写，别在坏结构上打补丁。
4. 删文件用 `git rm`（保留历史）；用户确认过方案才删。

## 四、最终验证

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
