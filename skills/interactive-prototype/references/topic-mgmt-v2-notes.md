# 主题管理 V2 原型 — 结构速查（2026-08-24 实测）

> 会话级细节存档。页面结构以 README.md 为准，本文件记录 grep 耗时的关键落点和本次 V4.20 系列改动的实现方式，供后续同类改动直接定位。

## 关键落点（省 grep 时间）

| 要改什么 | 在哪 |
|---|---|
| 侧边栏菜单分组 | `pages/02-resource-mgmt-a.html` → `renderAppSidebar()` 的 groups 数组（约 L481） |
| 统计卡样式（6 张卡共享） | `pages/03-resource-mgmt-b.html` 头部 `<style>` 的 `.resb-stats/.resb-stat-*`（全局作用域，07/11 直接复用） |
| 公共资源卡片渲染 | `pages/07-resource-mgmt.html` → `resMgmtCardHtml()`（约 L650-700） |
| 私有资源卡片渲染 | `pages/11-private-resource.html` → `pvtMgmtCardHtml()`（同构函数，前缀 pvtMgmt） |
| 默认落地页 | 字母序第一页 `01-topic-mgmt.html` 尾部的自调用 `protoShowPage('xxx')`（V4.20b 已指向 resource-mgmt） |
| 平台名数据 | MOCK 数据里 `platforms:[{name,status,auditor,time}]`；全站曾统一替换 `福建-广网融科→广网融科` 等 |

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
