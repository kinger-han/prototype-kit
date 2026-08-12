# 原型 JS 交互陷阱与验证方法

踩坑集合（2026-08-07 主题管理 V4.9 会话），原型页新增/迭代时必查。

## 1. id 数字/字符串严格比较 bug（最高频，交互全失效）

**症状**：卡片上的按钮点击无反应（上架开关、勾选、单卡复制/删除、时长编辑、分组全选全部失效）。DOM 里元素存在、onclick 也有，但就是不动。

**根因**：模拟数据里资源 id 是**数字**（`{ id: 1, ... }`），而 HTML 渲染 onclick 时把 id 包成**字符串**：
```js
onclick="...splToggleShelf('1')"   // 字符串
```
函数内 `SPL_ADDED[i].id === id` 是严格比较 → `1 === '1'` 永远 false → 找不到资源 → 点击无效。

**为什么初验会漏**：直接调函数传数字参数（`splToggleShelf(1)`）能工作，真实点击走 onclick 字符串才暴露。**必须用真实 DOM 点击验证**（`document.querySelector('.spl-switch').click()`），不能只调函数。

**修复**：统一 String 比较辅助函数，替换所有 `indexOf(id)` / `=== id`：
```js
function idIn(arr, id) {
  var s = String(id);
  for (var i = 0; i < arr.length; i++) { if (String(arr[i]) === s) return i; }
  return -1;
}
```
排查命令：`grep -n "\.id === id\|\.id !== id\|indexOf(.*\.id" prototype/pages/<页>.html`

## 2. 菜单改名 4 处联动（不止 2 处）

改菜单显示名要同步 4 处，漏一处就路由失败或菜单不变：
1. `proto-config.json` 菜单 items title
2. **02 页 `renderAppSidebar()` 里的硬编码菜单数组**（`{ id:'xx', title:'xx' }`，JS 渲染，改 proto-config 不影响它）
3. 页面第 1 行 `PAGE_META: {"title": "..."}`（菜单用标题查 `_pageTitleToId` 路由）
4. 页面内 `renderAppBreadcrumb('组', '页名')`

新增页面同理：4 处都要加（proto-config + 02 菜单 + PAGE_META + breadcrumb）。

验证：构建后 grep dist 里 `_pageTitleToId`，确认每个菜单标题都有映射。

## 3. 分组块在 grid 容器横排变形

**症状**：分组视图里分组块并排（左右排列）而不是上下排列，视觉变形。

**根因**：分组块直接放进 `display:grid; grid-template-columns: repeat(4,1fr)` 容器，每个 block 只占一个 grid cell。

**修复**：分组块加 `grid-column: 1 / -1;` 占满整行；组内卡片单独一个 grid 容器。

## 4. browser_vision 视口裁剪误报

**症状**：browser_vision 报告"卡片缺字段/按钮不在"，但 DOM 实测（browser_console 查 innerText/querySelector）字段全在。

**根因**：browser_vision 截图受视口宽度影响，窄视口下卡片内容被裁切，视觉模型把裁剪误判为缺失。

**规则**：视觉截图只做"布局/整体是否变形"确认；**字段存在性一律用 DOM 实测**（console 查 `querySelectorAll` 数量 + `innerText` 样本），两者矛盾时以 DOM 为准。

## 6. 新增同名函数覆盖旧函数（点击静默失效）

**症状**：页面某个旧按钮（如卡片"更多"）点击没反应，但 DOM 元素、onclick、函数定义都存在。新加的另一个按钮（如工具栏下拉）反而正常。

**根因**：JS 函数**后定义覆盖先定义**。给页面新增按钮/下拉时，新函数名与旧函数重名（如新工具栏下拉 `toggleResMgmtMore(btn)` 撞上旧卡片更多 `toggleResMgmtMore(id, btn)`），文件里后写的那个定义覆盖先写的 → 所有 `onclick="toggleResMgmtMore(...)"` 都调用新函数（参数签名不匹配、操作错菜单）→ 旧交互静默失效。

**排查**：`grep -n "function <函数名>" pages/*.html` 看到**两个同名定义**（不同行号）就是被覆盖。

**修复**：新函数独立命名（如工具栏版改 `toggleXxxBatchMore`），同文件内函数名全局唯一；HTML onclick 同步改。

**教训**：给已有页面加新交互前先 `grep -n "function 新函数名"` 确认无冲突；页面合并构建后所有函数在同一作用域，命名必须全局唯一（不同页面之间也会互相覆盖）。

## 7. HTML div 不平衡 → build 静默产出空页面（页面白屏排查）

**症状**：构建成功、页面数正常，但某个页面整页空白（菜单能进，`getElementById` 全 null）。

**根因**：源文件 HTML div 开闭不平衡（如 patch 删除提示条时误删 `</div>` 闭合）。build.py 用 `tag.startswith('<div')` 深度匹配提取页面，div 不平衡时**永远等不到闭合** → 该页在 dist 中内容为空（`data-page-id="xxx">\n\n</div>` 约 60 字符），且**不报任何错**。

**排查**：
```bash
# ① dist 里看该页内容长度（len≈2 即空）
python -c "import io,re; s=io.open('dist/xxx.html',encoding='utf-8').read(); m=re.search(r'data-page-id=\"<页id>\"[^>]*>(.*?)</div>', s, re.S); print(len(m.group(1)) if m else 'NOT FOUND')"
# ② 源文件 div 平衡（模拟 build.py 逻辑，注意跨行 <div\n 也算）
# 去 style/script 后逐 tag 数 <div 与 </div>
```

**修复**：补回缺失的 `</div>` 或删掉多余的开标签，重建后确认 dist 该页内容恢复（正常页约 10-13KB）。

**教训**：删除 HTML 块用 patch 删**整块**（开标签+内容+闭标签），不要只删内容留空壳；改完 HTML 结构先跑 div 平衡检查再构建。

## 5. 原型新页面验证清单（浏览器 console 快速自测）

```
① protoShowPage('<page-id>') 是否抛错（语法/引用错误会在这暴露）
② 关键容器 innerHTML.length > 0（树/卡片/表格）
③ 交互链：模拟勾选 → 添加 → 切 TAB → 读状态变化
④ 真实 DOM click（不是调函数）触发一次交互，确认状态翻转
⑤ 菜单路由：grep dist `_pageTitleToId` 每个标题有映射
```
