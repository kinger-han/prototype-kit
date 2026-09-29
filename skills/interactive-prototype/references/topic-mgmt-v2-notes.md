# 主题管理 V2 原型 — 结构速查（2026-08-24 实测）

> 会话级细节存档。页面结构以 README.md 为准，本文件记录 grep 耗时的关键落点和本次 V4.20 系列改动的实现方式，供后续同类改动直接定位。
> ⚠️ 下方的「V4.20 系列样式约定」是当时的快照；后续版本已多处变更（工具栏「上传资源」已去掉、审核页新增「退回」页签、选择类页限「已发布」资源等）。**动手前以 README.md + PRD 的现状段为准**，本文件只用来省 grep。
>
> ⚠️ **页面结构已变（2026-09-28）**：`02-resource-mgmt-a.html` / `03-resource-mgmt-b.html` 已退役为共享组件 —— `pages/_res-core.html`（数据 + 通用函数 + `renderAppSidebar` + 分类选择器）、`pages/_res-upload.html`（上传/导入/批量审核/轮播时长弹窗函数）。`resource-mgmt-a` / `resource-mgmt-b` 两个页面 id 与 shell 静态占位菜单已全部移除。**旧资料里写「02 页 / 03 页」的地方，现在指这两个 `_` 文件**；此外录页默认为公共资源（返回与侧边栏高亮也回落它）。

## 关键落点（省 grep 时间）

| 要改什么 | 在哪 |
|---|---|
| 侧边栏菜单分组 | `pages/_res-core.html` → `renderAppSidebar()` 的 groups 数组 |
| 统计卡样式（6 张卡共享） | `pages/_res-upload.html` 头部 `<style>` 的 `.resb-stats/.resb-stat-*`（全局作用域，07/11 直接复用） |
| 公共资源卡片渲染 | `pages/07-resource-mgmt.html` → `resMgmtCardHtml()`（约 L650-700） |
| 私有资源卡片渲染 | `pages/11-private-resource.html` → `pvtMgmtCardHtml()`（同构函数，前缀 pvtMgmt） |
| 默认落地页 | 字母序第一页 `01-topic-mgmt.html` 尾部的自调用 `protoShowPage('xxx')`（V4.20b 已指向 resource-mgmt） |
| 平台名数据 | MOCK 数据里 `platforms:[{name,status,auditor,time}]`；全站曾统一替换 `福建-广网融科→广网融科` 等 |
| 共享素材（预览图/视频底图） | `_res-core.html` `RES_MEDIA` + `resPreviewImg(r)` / `resVideoAssets(r)`；各页的 `*ResImg()` 只是一行转发 |
| 共享需求数据 | `_res-core.html` `DEMAND_LIST`（`themes` 指向真实主题名）+ `resDemandOf(r)` / `demandResList(demand)`；需求列表、关联需求、需求详情三处共用 |
| 角色/权限演示 | `_res-core.html` `ROLE_DEFS` / `window.CURRENT_ROLE` / `roleCanSeeMenu` / `setRole`；顶栏切换器 DOM+CSS 在 `shell-pc.html` |
| 分类选择器（编辑页分类可改） | `_res-core.html` `catPick*` + `_shared.html` 的 `catPickModal`；公共资源用 `CATEGORY_TREE`（三级）、私有用 `PRIVATE_CATEGORY_TREE`（客户两级），选中值即 `themePath` 路径；只能选叶子 |
| 通用确认弹窗 | `_shared.html` `resConfirmModal` + `_res-core.html` `openResConfirm(title, desc, note, okText, cb)` |
| 新标签页直达路由 | `shell-pc.html` `</body>` 前的 hash 脚本（build.py 本身不读 hash） |

## V4.20 系列已落地的样式约定

- **标签**：灰底胶囊 `#f5f5f5` 黑字、只显叶子名、单行 flex-wrap:nowrap、超 3 个折叠 `+N`（悬浮 title 显完整路径）。用户先要求 #叶子名 后改为灰底胶囊——最终以胶囊为准
- **外部状态改名「同步平台」**：只显平台名不显状态文字，颜色表语义（绿=通过/红=退回/灰=未审核），悬浮 data-tip 显示 平台+状态+审核人+时间
- **上架状态胶囊**：右上角 `.resmg-sw.on`=蓝底蓝字「上架中」、`.off`=灰底灰字「已下架」，与内部状态徽章视觉对齐；下架卡片整体置灰（`.resmg-card.off { opacity:.55; filter:grayscale(.9) }`），**不重排序**（演示优先）
- **更多菜单四件套**：查看/编辑/移动外置，复制到其他/上屏/上架或下架/下载/删除在更多里
- **批量操作**：批量导出(占位 toast)/批量打标签/批量设置时长/批量导入/批量删除；批量审核已全部移除（07/11/04 三页）
- **统计卡紧凑化**：padding 12px 16px、图标 CSS 强制 18px、数字 22px、水平排布、gap 8px、margin-bottom 12px（≈68px 高）
- **筛选区一行化**：标签缩短（类型/状态/同步平台/方向/标签）+ select min-width 84-96px + 页面级 `.resmg-filter` 压缩 padding/gap
- **编辑页「资源替换」字段**：备注上方，file input（accept image/video）+ FileReader 预览，保存后有替换文件则 status='待审核' 并更新 format/size，否则维持原'待校对'逻辑

## 批量文本替换的可靠做法

跨多文件替换平台名/枚举值时：写临时 Python 脚本（`D:/HermesData/cache/*.py`），逐文件 count+replace+回写并打印计数，比多次 patch 快且无转义风险。注意 `_shared.html`、01/03/04/06 也可能藏同名数据，用 `grep -c` 全 pages/ 扫尾确认清零。
