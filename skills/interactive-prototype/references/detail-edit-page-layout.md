# 详情页/编辑页布局与返回机制（B 端资源类页面）

> 来源：智融平台-主题管理 V4.16-V4.17（2026-08-10/11），用户多轮反馈收敛。
> 适用：资源/内容的「详情页 + 编辑页」类页面，含预览图 + 表单/信息区。

## 一、返回按钮必须回来源视图（用户交互硬要求）

**场景**：列表页有多种视图（主题列表 / 资源卡片 / 主题内资源），点「查看/编辑」进详情/编辑页，
返回按钮应回到**点进来时的那个视图**，不能重置成默认视图。

**失败模式**：来源页 `init_xxx()` 每次进入都强制重置视图状态（如 `RES_MGMT_VIEW='topic'`），
从卡片视图进详情再返回 → 回到主题列表 → 用户反馈"不能全部默认都回到主题列表"。

**正确做法（RES_VIEW_RESTORE 标记模式）**：
1. 跳转函数记录来源 + 置恢复标记：
```js
function openResDetail(id) {
  RES_CURRENT_ID = id;
  RES_BACK_PAGE = RES_CURRENT_PAGE;   // 记录来源页
  RES_VIEW_RESTORE = true;            // 标记：返回时需恢复视图
  protoShowPage('resource-detail');
}
```
2. 来源页 init 里：仅首次进入才重置视图，返回时不重置：
```js
if (!(RES_VIEW_RESTORE && RES_BACK_PAGE === 'resource-mgmt')) {
  RES_MGMT_VIEW = 'topic';            // 只有真正新进入才重置
  RES_MGMT_TOPIC_RES_VIEW = null;
}
RES_VIEW_RESTORE = false;             // 用后即清，避免误恢复
```
3. init 末尾按当前视图状态重渲染显隐（tbl/cards/viewBtn 的 display），
   并覆盖「主题内资源模式」（backBar 显示、viewBtn 隐藏）。

**配套**：详情/编辑页 `renderAppSidebar()` 高亮判断要覆盖所有来源页 id
（`RES_BACK_PAGE === 'resource-mgmt' ? 'resource-mgmt' : ...`），
否则从公共资源进详情侧边栏高亮错位。

## 二、详情页布局：竖版左图右信息连续排布、横版上图下信息

用户痛点：竖版详情「基础信息下方、审核流程/操作记录之间是空的」；横版「有空内容区域」。

**竖版（9:16）**：左预览图（320px）+ 右侧**连续**信息卡（基础信息 → 资源标签 → 审核流程 → 操作记录）。
关键：不要底部三列独立成行（det-bottom 在 det-main 外 → 中间留白）；全部放 det-right 内纵向堆叠。

**横版（16:9）**：预览图全宽限高居中（max-width:640px），文件信息条横排；
下方信息区改 3 列 grid（基础信息整行 + 标签/审核/操作记录三列）：
```css
.det-main.h-mode { flex-direction: column; }
.det-main.h-mode .det-preview-panel { width: 100%; }
.det-main.h-mode .det-thumb-wrap.h { max-width: 640px; margin: 0 auto; }
.det-main.h-mode .det-right { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 14px; }
.det-main.h-mode .det-right > .det-card:first-child { grid-column: 1 / -1; }  /* 基础信息整行 */
```

**状态徽章行**：平台「未同步」不能显示孤立 `/`（"待校对 /"比例失衡），
显示 `平台名 · 未同步`。

## 三、编辑页布局：竖版隐藏文件信息盒、横版上图下表单

- **竖版编辑页**：左侧只留大图（隐藏文件信息盒），与右侧编辑字段上下对齐，视觉整齐：
```css
.edt-main.v-mode .edt-file-info-box { display: none; }
.edt-main.v-mode .edt-thumb-wrap { aspect-ratio: 9 / 16; }
```
- **横版编辑页**：预览图全宽限高 + 文件信息盒横排（flex-wrap），下方表单 2 列栅格。

**JS 切换**：init 里按 `r.direction` 给容器加 class：
```js
edtMain.classList.toggle('h-mode', r.direction === '横版');
edtMain.classList.toggle('v-mode', r.direction !== '横版');
```

## 四、交互控件：布尔字段用 Switch 不用"点击切换"标签

用户反馈"上架状态点击切换太不合理"。布尔状态（上架/下架、启用/停用）用 AntD Switch 样式：
```css
.edt-switch { position: relative; width: 44px; height: 22px; background: rgba(0,0,0,.25);
  border-radius: 22px; cursor: pointer; transition: background .2s; }
.edt-switch::after { content:''; position:absolute; top:2px; left:2px; width:18px; height:18px;
  background:#fff; border-radius:50%; box-shadow:0 2px 4px rgba(0,0,0,.2); transition: left .2s; }
.edt-switch.on { background:#1677ff; }
.edt-switch.on::after { left: 24px; }
```
旁边显示状态文字 label；JS 只切 class + 文案，不重渲染。

## 五、验证清单

- 三个入口各测一次：卡片视图 → 详情/编辑 → 返回（应回卡片）；主题列表 → 返回（应回列表）；主题内资源 → 返回（应回该主题资源）
- 竖版/横版资源各开一次详情+编辑，确认无空区、图片比例正常
- `grep -c "RES_VIEW_RESTORE" dist` 确认机制注入
