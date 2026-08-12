# 页面 JS 排查与验证（2026-08-07 主题管理私有资源页实战）

## "框架在、数据空" = init 抛 ReferenceError

症状：菜单能进、筛选栏/统计卡/工具栏都在，但左树无节点、统计卡全 0、卡片区空。用户反馈"没实现/没数据"——**用户说没实现 ≠ 真没实现**，先查渲染链路。

最常见根因：`init_xxx()` 首次**读取**一个从未 `var` 声明的全局变量（如私有页 `PVT_TREE_SEARCH`），直接抛 `ReferenceError`，后续渲染全部中断。非严格模式下**赋值不炸、首次读取才炸**（`PVT_TREE_SEARCH = ''` 通过，`if (inp) inp.value = PVT_TREE_SEARCH` 炸）。

排查顺序：
1. 确认用户打开的是**最新 dist**：`prototype/dist/` 可能残留旧版（如 `topic-mgmt-v2-pc-原型.html` 是 7/29 的旧产物，没有私有资源页；新版是 `主题管理V2-pc-原型.html`）。用 `ls -la --time-style=full-iso` + `grep -c` 关键页面 id/函数判断新旧
2. browser console 跑 `protoShowPage('页面id')` 看是否抛错——异常消息即根因
3. `grep -rn "var XXX" pages/` 全仓确认声明。共享状态变量声明统一放共享数据源页（02），从公共页复制改造私有版时最易漏声明（`RES_TREE_SEARCH` 有声明、`PVT_TREE_SEARCH` 漏了）

修复：在共享数据源页补 `var PVT_TREE_SEARCH = '';`（与姊妹变量对齐），一行搞定。

## 私有树按客户隔离：兜底匹配必须带客户根校验

症状：选"福建广电 / 本地频道"，广西广电"本地频道"的资源也被筛出来。

根因：分类匹配兜底逻辑 `c.themePath.indexOf(t.name) >= 0` 用分类名全局匹配，不同客户下同名分类（本地频道/乡村振兴/智慧城市）会跨客户串数据。

修复：
```js
var tRoot = (t.path || '').split(' / ')[0];
if (c.themePath && tRoot && c.themePath.indexOf(tRoot) === 0 && c.themePath.indexOf(t.name) >= 0) { hitTheme = true; break; }
```
公共资源页 07 有同款兜底，但公共分类树无客户维度、同名分类风险低，通常只改私有页即可。

## browser_console 直接调页面 JS 验证交互

用户授权处理/排查时，不靠截图猜，直接执行页面函数断言：
```js
// 触发 init 并捕获异常
(function(){ try { protoShowPage('private-resource-mgmt'); } catch(e) { return 'INIT ERR: '+e.message; } ... })()
// 数按钮序列
document.querySelectorAll('#page-x .toolbar button').map(b=>b.innerText)
// 调筛选函数后断言结果
pvtMgmtToggleTheme('福建广电 / 本地频道', false);
pvtMgmtFilteredList().map(c=>c.title)  // 断言只含福建 2 条
// 新建/取消状态：!!EDITING + 操作按钮数量
```
比 browser_navigate 快且可复现。

## 视觉验证：browser_vision 的\"字段缺失\"判断不可靠，以 DOM 实测为准

用 browser_vision 检查卡片/布局字段时，视觉模型会因**截图视口裁剪**误报\"卡片缺少 XX 字段/按钮\"（本会话两次误报：\"尺寸/格式/标签未显示\"、\"卡片底部没有复制/删除按钮\"，实际 DOM 都有，只是卡片超出截图底部被裁掉）。视觉模型还会把行内小徽标误判为其他颜色。

**验证顺序**：功能/字段检查一律先 `browser_console` 断言 DOM（`querySelector` + `innerText`/`outerHTML`/`getComputedStyle`），结果以 DOM 为准；browser_vision 只用于整体布局观感（变形/错位/对齐），且对它的\"缺字段\"类结论要再用 DOM 复核后才信。

## 工具摩擦

- terminal 超长内联命令（sed/grep 多段拼接、command substitution）会被拦截报 "command parser limit or malformed executable payload"，命令存到 D:\HermesData\cache\blocked-scripts\。改用 read_file 分段读取即可，不要重试原样内联命令
- node --check 不能直接吃 HTML 内联 script：先 python 提取 `<script>...</script>` 到临时 .js 再检查（记得删临时文件）

## 新增页面：复制姊妹页改造（比从零快，但注意四件事）

当新页面与现有页面高度相似（如"排播计划-选择"从"播放列表-选择"复制）：
1. `cp` 姊妹页为 `NN-xxx.html` 后**全局替换前缀**（如 `sdl-` → `spl-`、`SDL_` → `SPL_`），避免新旧函数/变量在同一 dist 作用域里互相覆盖（所有页面 script 合并成一个大作用域，同名前缀必冲突）
2. 复用共享数据源（02 的 `MOCK_RESOURCES`/`PRIVATE_CATEGORY_TREE`/`findRes`）时直接引用即可，构建后同一作用域；**不要**在页面里重定义
3. 菜单双注册：`proto-config.json`（路由/构建）+ 02 页 `renderAppSidebar()` 数组（实际渲染），漏 02 页则菜单无入口
4. 页面初始化函数名 `init_NN_xxx()` 必须与 PAGE_META id 对应，否则切页空白
