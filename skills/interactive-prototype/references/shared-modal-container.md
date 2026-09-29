# 共享弹窗容器机制（pages/_shared.html）— 2026-07-31 已全量落地

## 要解决的问题
弹窗 HTML 硬编码在 shell-pc.html（kit 共享模板）里，pages/*.html 无法注入弹窗内容。
改弹窗只能：改 shell（影响所有项目）或 patch dist（rebuild 被冲掉 → _patch_dist.py 流程）。
**共享容器机制解决**：弹窗 HTML 归 pages/_shared.html，随构建注入，rebuild 不冲掉，_patch_dist.py 废弃。

## 验证进度（用户 5 步计划，全部完成）
- ✅ 第 1 步打通验证（单确认弹窗 disableVenueConfirm）：通过
- ✅ 第 2 步多弹窗组合验证（4 弹窗兄弟节点 + 跨页引用 + 复杂表单）：通过
- ✅ 第 3 步标注兼容验证（--with-annotations + test-01/test-02）：通过
- ✅ 第 4 步批量迁移（批次A 3确认 + 批次B 8详情 + 批次C 8表单 + batchQrModal 废弃）+ 全量回归：通过
- ✅ 第 5 步已应用到原件：build.py 合入 prototype-kit + 智能导游原件 _shared.html + shell 清零 + _patch_dist.py 废弃（SKILL.md 大整理已由用户最终校准版完成：interactive-prototype/SKILL.md 429 行，含环境配置区块/弹窗管理重写/陷阱精简）
- 原件状态：智能导游已 git push；prototype-kit 仅本地 git（无 remote，等用户建 GitHub 仓库）
- **`_patch_dist.py` 确认从未实际创建过文件**（全局搜索无任何文件）——属于历史设计层面的预案，文档提及它只是历史记录，不是被删除的真实脚本

## 第三轮标注兼容验证要点（2026-07-31 全 PASS）
弹窗迁移到 _shared.html 后与标注系统完全兼容，**旧 _patch_dist.py 重注入弹窗标注的机制可废弃**。
- 触发弹窗按钮的 data-anno 在标注版 dist 各出现 1 次；ANNO_DATA 注入正常
  （grep `"test-01"` 应见 2 次：data-anno 属性 + ANNO_DATA key）
- 工具栏角标计数按实际可见 badge（共享弹窗内不可见标注不计入）
- **page-changed 不误伤共享容器**：切换页面后已打开弹窗保持打开（不被 protoShowPage 强制隐藏），
  只由 modal 自身 open/close 控制显隐——这是正确行为不是 bug
- 已有标注的弹窗触发按钮（如 kb-01）不要重复加验证标注，直接用它验证"已有标注 + 共享弹窗"组合
- 构建 warning「标注 key 在 HTML 中无对应元素」= 弹窗级/页面级标注在 pages 无元素，属预期行为

测试环境（已完成使命，已转存存档）：~~`D:\hpy\桌面\共享弹窗机制验证\`~~ → **`D:\hpy\文档\ObsidianVault\06-资源\模板\prototype-kit\_archive\共享弹窗机制验证-20260731\`**（智能导游 + prototype-kit 副本 + backward-compare 对比产物，80 文件校验一致；排查该机制问题或迁移移动端时查阅）。
1. 项目 pages/ 下新增 `_shared.html`（`_` 开头 = 共享组件，不进菜单/路由）
2. build.py 识别 `_` 开头文件 → 提取其 proto-page **内部 DOM** → 追加到内容区末尾（不包可切换的 proto-page 容器）
3. 其 `<script>` 照常合并进总 script 块（与普通页面一致）
4. 弹窗显隐完全由 JS open/close（.show 类）控制，build.py 不额外处理

## build.py 实现（副本位于 D:\hpy\桌面\共享弹窗机制验证\prototype-kit\build.py）
关键修改三处（原件在 ObsidianVault/06-资源/模板/prototype-kit/build.py，勿动）：
1. 新增 `strip_outer_div(html)`：去掉最外层 `<div class="proto-page|page">` 外壳返回内部
2. 页面扫描分流：`os.path.basename(fpath).startswith("_")` → shared_components，否则 components
3. 注入：普通页面照旧包 proto-page 容器；shared 组件 strip 后 append 到 pages_html_parts 末尾

## ⚠️ strip_outer_div 的 bug（真实踩坑）
第一版返回 `html[gt+1:i]`，其中 `i` 是闭合 `</div>` 的 `>` 位置 → 返回内容尾部残缺 `</div`（缺 `>`），
注入后 HTML 损坏。**修复：返回 `html[gt+1:tag_start]`**（截到闭合标签的 `<` 之前）。
调试手法：`python -c "import build; comp=build.parse_component(...); print(repr(build.strip_outer_div(comp['page_html'])[-40:]))"` 直接看尾部。

## parse_component 的 depth 计数怪癖（理解才能调对）
`page_start` 正则匹配到 `<div class="proto-page"` 的 class 属性就结束（mid-tag），
循环从匹配末尾开始，外层 div 的 `<` 永远不会被算进 depth（in_tag 是 False，`>` 直接跳过）。
结果：depth 从 0 起，第一个被计数的是**内层**子 div → 外层 div 的 `</div>` 会让 depth 变 -1 → break。
对 _shared.html 恰好"碰巧正确"（page_html 包含整个 proto-page 外壳）。strip 依赖同一行为。

## 验证清单（ad-hoc 脚本跑过全 PASS，浏览器项待用户）
1. dist 中弹窗 id 出现次数 = 1
2. 无残缺 `</div` 标签（`re.findall(r"</div(?!>)", html)` == 0）
3. `data-page-id` 容器数量 = 普通页面数，不含 `_shared`
4. `var _pageTitleToId = {...}` 不含 _shared（不进 switchPage 映射）
5. 弹窗位置在最后一个普通页面之后（内容区末尾）
6. 提取全部 `<script>` 拼接 → `node --check` 通过

## 环境备注
- 任务书说注入到 `#main-content`，实际 shell 的容器类名是 `.content-area`（页面容器语义相同）
- 本机 search_files 对含中文的 pattern 返回 0 结果，改用 `grep -n` 侦查（build.py / shell 模板定位）
- build.py 用 `BASE_DIR=__file__` 定位，复制 kit 后副本自包含，可安全在副本上改

## 验证方式偏好（用户明确）
浏览器验证由用户手动做（给步骤+预期效果，等反馈）；Hermes 不自己开 browser 截图验证。

## 第二轮验证要点（多弹窗组合，2026-07-31 全 PASS）
试点弹窗：userDetailModal（跨页面详情）、faqFormModal（复杂表单+联动）、qrcodePreviewModal（补足兄弟节点），
加上第一轮的 disableVenueConfirm 共 4 个作为**兄弟节点**放同一 proto-page 容器（不嵌套）。

- **跨页面引用的本质**：弹窗 JS（open/close/do 函数）都在各页面文件里，build.py 合并进**同一个全局 script 块** →
  任意页面都能调用；弹窗 DOM 在共享容器（不进页面互斥）→ 数据靠函数参数（idx）传入，不会串页。
  所以 `_shared.html` **不需要也不应该重复放 JS**（会重复声明，后覆盖前）。
- **函数重名检查**：提取 script 后查 `function 名` 声明次数=1。局部变量（tbody/tr/v 等模板回调）重名无害；
  顶层 let/const 若重名 node --check 会直接报 SyntaxError。
- **验证手法**：4 弹窗 id 各 1 次；`<div` 开闭平衡（573/573）；`data-page-id` 容器=普通页面数；
  弹窗都在最后一个页面之后；13 个关键函数各声明 1 次。
- **shell 删除弹窗后必须 grep 确认 id=0**，且删除后弹窗定义只在 `_shared.html` 出现 1 次。

## 第四轮：批次迁移（Phase 2，2026-07-31 批次A 完成）

### 用户明确的「DOM 与 JS 分离」规则修订（必须遵守）
1. `pages/_shared.html` **只放弹窗 HTML DOM**，不放业务 JS。
2. 业务 JS **默认留在各自页面文件** pages/xx.html（build.py 合并为全局函数，跨页可用），不迁入 _shared.html。
3. 仅当弹窗相关 JS **当前确实写在 shell-pc.html 中**且**不是框架通用逻辑**时，才需要迁移；迁移目标优先是对应业务页面 pages/xx.html，**不是** _shared.html。
4. **不要为了弹窗归属强行搬运 open/close/submit 函数**——这些函数常混着页面业务逻辑（如 toggleVenueStatus 同时改状态+渲染表格、openUserDetail 依赖 users 数据），硬搬会破坏页面数据作用域。

### 隔离测试环境工作流（用户主导的验证模式）
- 复制**整个项目** + **prototype-kit** 到桌面测试目录（如 `D:\hpy\桌面\共享弹窗机制验证\`），**去掉 .git**（防 git 操作污染原仓库），原件零改动。
- build.py 用 `BASE_DIR=__file__`，复制 kit 后副本自包含，可在副本上改 build.py/shell。
- 分批迁移：批次A（简单确认类）→ B（详情展示类）→ C（表单类），**每批验证通过、用户确认后才进下一批**。

### 批次迁移每批的标准动作
1. **迁移前 grep 复查**：弹窗 id 在 shell/pages/_shared/dist 四处出现次数。目标状态：shell 有旧 HTML 副本、_shared 无、pages 有 JS 引用（**正常保留，不要删**）、dist 是旧产物。
2. HTML 追加进 _shared.html 容器内（兄弟节点，不嵌套）；追加时 old_string 用 faqFormModal 结尾等**唯一锚点**（`</div>` 太泛会 42 个匹配）。
3. 从 shell 删除旧 HTML 后 grep 确认：shell=0、_shared=1。
4. 构建 + 验证（id 唯一、div 平衡、node --check、切页、console）。
5. **patch 删除 shell 弹窗时 diff 可能"看似多删了相邻弹窗闭合标签"**——实际文件通常正常，必须 read_file 检查删除点前后结构确认，不要被 diff 展示误导。

### ⚠️ 删死代码前必须全局搜同名变量（跨文件陷阱）
04-session-logs.html 的 `detailBtn` 是死代码（顶层 `const detailBtn = ...${s.time}...`，s 未定义且从未使用），
但**同名变量在 01-user-mgmt.html 的 `map(s => ...)` 回调内是合法局部变量**（s 是参数，detailBtn 被使用）。
- 诊断"死代码"：grep 确认变量只在**该文件**声明 1 次且无使用，但**先全局搜同名**排除其他文件的合法使用。
- dist 中同名出现 2 次（1 声明 + 1 使用）不代表冲突——不同文件不同作用域，node --check 过了就没顶层冲突。
- 删除源文件死代码后重新构建，`grep -c` 确认源文件=0；dist 中残留的 2 次若来自其他文件则正常。

## ⚠️ console 空 message 异常 ≠ 机制问题（重要排查结论）
第一轮就发现 console 有 1 个空 message 异常，第二轮查实：**`Uncaught ReferenceError: s is not defined`**，
来源是 04-session-logs.html L204 顶层死代码 `const detailBtn = ...${s.time}...`（s 是函数内局部变量，
detailBtn 从未被使用）——**源文件原有 bug，与共享弹窗机制无关**。教训：排查 console 异常先确认与本次改动相关，
不要因为弹窗迁移就怀疑机制。

排查手法（dist 加载期异常）：
1. `python -m http.server` 打开对比：file:// 和 http:// 都出现 → 页面代码问题，排除协议因素
2. 在 `<head>` 最前面注入 `window.addEventListener('error', e => __errLog2.push({msg,file,line,col,stack}), true)`
   捕获器 → 重新加载 → 读 `__errLog2` 拿到真实 stack（CDP 空 message 的 exception 没有 stack 可读）
3. `grep -n -E "^(const|let|var) "` 查顶层声明 + `^[a-zA-Z_].*\(\)` 查顶层调用，
   找"顶层模板字符串引用未定义变量"这类死代码
4. performance.getEntriesByType('resource') 在 file:// 下返回空，不能用来查资源失败

## ⚠️⚠️ 迁移脚本容器闭合 bug（批次B最大教训，2026-07-31）

**现象**：用脚本把 8 个弹窗追加进 _shared.html 后，构建产物里这 8 个弹窗**全部消失**
（div 总数反而从 573 降到 473），只有容器内原有 7 个弹窗。console 无报错，node --check 通过。

**根因**：追加脚本的容器闭合处理错误：
```python
# ❌ 错误：rstrip() 保留了原文件末尾的容器闭合 </div>，又额外加了一个
shared = shared.rstrip() + '\n' + insert + '</div>\n'
# 结果：原容器闭合被插在 8 个新弹窗【之前】→ 新弹窗落在 proto-page 容器【外面】
#      → parse_component 在容器闭合处就停 → 容器外的新弹窗被构建丢弃
```
**正确写法**：先剥离原容器闭合，再插入，最后补回一个：
```python
assert shared.rstrip().endswith('</div>')
base = shared.rstrip()[:-6].rstrip()   # 去掉容器闭合 </div>
shared = base + '\n' + insert + '</div>\n'
```

**诊断手法**（脚本写完后立即做）：
```python
# 1) _shared.html 自身 div 平衡检查（发现 163/164 差=-1 → 文件本身已坏）
# 2) 逐行深度扫描定位变负位置
# 3) 检查"deleteKbConfirm 块结束后的内容"：若紧跟 </div> 再跟新弹窗注释 = 容器闭合被误插
```
修复操作：删除 deleteKbConfirm 块后那个误插的 `</div>`（深度匹配定位块结束位置，跳过空白，删 `</div>` 保留一个换行）。

**防再犯**：任何"向容器追加内容"的脚本，写完后**先验证文件自身 div 平衡**（`len(re.findall('<div[\\s>]'))` == `len(re.findall('</div>'))`），再构建；构建后**验证弹窗数**（grep id 次数），不要只信构建成功日志。

## 批次B/C 迁移完成态（2026-07-31）
- _shared.html 最终 **23 个弹窗兄弟节点**（无嵌套），div 开闭平衡（565/565）
- shell-pc.html 弹窗清零（modal-overlay=0 + confirm-overlay=0）
- batchQrModal 废弃：全局 grep 确认 pages 无引用后**直接从 shell 删除，不迁入**（含 `style="display:none !important"` 的隐藏占位弹窗）
- 迁移后 `data-anno` 保留验证：`sessionExportModal` 的 `data-anno="log-export"` 必须在 _shared.html 和 dist 中各保留（dist 中 2 次 = 页面按钮 1 + 弹窗 1，均原有）
- 表单联动迁移后正常：`onDocKbTypeChange` 等联动函数在页面文件，构建合并为全局，弹窗 DOM 在共享容器 → 联动照常触发

## 合入原件的工作流（用户主导，2026-07-31 完成）
1. **git 先备份**：两个仓库各自 `git add -A && git commit` 作为应用前备份点
2. **全局安全检查**：搜所有现有项目 pages 是否有 `_` 开头文件（防被新逻辑误判为共享组件）——无冲突才继续
3. **build.py 合入**：用 diff 对比测试副本与原件，把 3 处改动逐一 patch 到原件；`py_compile` 通过 + diff 确认与测试副本**字节一致**
4. **向后兼容回归**：用改动前 build.py.bak 和改动后 build.py 各构建一个**无 _shared.html 的真实项目**（如主题管理），diff 两个产物**必须完全一致**（241007 字节 0 差异）
5. **正向回归**：用与原件一致的测试副本 build.py 重建测试副本项目，23 弹窗各 1 次 + node --check + 浏览器抽查
6. **shell 清理原件**：基于**原件当前内容**用脚本删除 24 个弹窗块（深度匹配），**不能直接复制副本 shell 覆盖原件**（会丢失原件自己的 CSS 等未提交改动）——删完确认 tooltip 等 CSS 仍在
7. **验证标注不应用**：test-01/test-02 是验证数据，**不要**复制到原件 annotations.yaml/pages
8. 构建原件验证 → commit + push（智能导游有 remote 已 push；prototype-kit 无 remote 仅 commit）

**⚠️ 注意**：build.py 用 `BASE_DIR=__file__` 定位 shell——用**原件** build.py 构建**测试副本**项目时，会读**原件 shell**（弹窗未清）+ 副本 _shared.html → 弹窗 id 出现 2 次（shell 旧 + shared 新）。这不是 bug，是"原件 shell 未清理"的预期状态；验证正向功能必须用**与原件字节一致的副本 build.py**（副本 shell 已清）。

## 跨页复用的通用确认弹窗：一个 DOM + 一个参数化函数

新增「多页都会用」的确认类弹窗时（保存触发审核、重新上架、删除前的二次确认），不要每场景加一个弹窗：
- **HTML**：进 `_shared.html`，与其他弹窗作兄弟节点。一个 `resConfirmModal` 承载所有场景，内部 id 固定为 `rcTitle` / `rcDesc` / `rcNote` / `rcOkBtn`；`rcNote` 用 `style="display:none"` 做可选行，不传就不显示
- **函数**：`openResConfirm(title, desc, note, okText, cb)` 放**共享数据页**（通常是 02 页，即 `findRes` / `resToast` / `resPlatformsOf` 的所在地）——所有页面都依赖该页的合并作用域，跨页调用安全。**不要**写进 `_shared.html`（保持本文件「DOM 与 JS 分离」的既有约定），也不要挂在触发方页面让别的页面跨页调
- **回调存模块级变量，取用后即清**（`RES_CONFIRM_CB = null`）——否则上一次的回调残留到下一次，弹窗点了会执行错的逻辑
- 描述支持 HTML（命中字段名需要加粗时直接传 `<b>`）；关闭/取消路径同样要清回调
- 验证：dist 里 `id="resConfirmModal"` 应恰好 1 次（多页共用不重复注入）
