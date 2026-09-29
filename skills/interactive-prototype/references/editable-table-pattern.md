# 可编辑录入表模式（PC 后台）

适用：用户要**逐行录入**的清单表 —— 需求详情里的资源明细表、批量录入清单、任务明细等。与 `references/batch-operations-pattern.md`（列表页批量操作）互补：那份管「选中已有数据后批量处理」，这份管「用户自己造数据行」。

## 结构

```html
<div class="dd-table-toolbar">
  <button class="dd-tb-btn primary" onclick="ddAddRow()">＋ 添加资源</button>
  <button class="dd-tb-btn danger" onclick="ddDeleteChecked()">删除选中</button>
  <span class="dd-tb-info" id="ddTableInfo"></span>
  <button class="dd-tb-btn save" onclick="ddSaveList()">保存清单</button>
</div>
<table class="dd-table">
  <thead><tr>
    <th class="dd-col-check"><input type="checkbox" id="ddCheckAll" onclick="ddToggleAll(this)"></th>
    <th class="dd-col-file">上传资源</th> … <th class="dd-col-ops">操作</th>
  </tr></thead>
  <tbody id="ddTableBody"></tbody>
</table>
```

- 工具栏三段：**增删（左）→ 计数（中，`margin-left:auto`）→ 保存（右）**。计数用 `共 N 条 · 已选 M 条`，不写「共 X 条」式统计的例外是**这里可以写**（它是录入状态，不是列表统计）。
- 表格用 `table-layout:fixed`，列宽由 `th` 上的 `width` 控制：固定像素列（复选框 36 / 上传 96 / 类型 70 / 背景图 82 / 操作 92…）+ 百分比列（名称/标签/备注），百分比之和与固定列相加后自适应。
- 表头全选要能反映**部分选中**（`n === 总数` 才打勾）。

## 行数据与渲染

```js
var DD_ROWS = [];   /* { key, checked, file, type, poster, name, tags, duration, remark } */
var DD_ERR  = {};   /* 校验失败：{ 行key: ['资源名称','资源标签'] } */
var DD_SEQ  = 0;    /* 行 key 自增，事件绑定用 */
```

- **`key` 是行身份，不是索引**：增删行后索引会漂，事件绑定一律用 `key`（`ddFind(key)`）。
- 增删行：`push(ddBlankRow())` / `filter` 掉勾选行 + 整表重渲染；删除前先判有无勾选，空勾选给 `error` toast 而不是静默。
- 空表占位行 `colspan` 必须随列数同步（加一列忘改 → 占位行错位，无报错）。
- 初始行**从共享数据派生**（数据单一来源），新增行只存演示期内存；派生的行记 `DD_ROW_RES[key] = 资源id`，供「一键上屏」这类需要原资源的动作复用共享函数。

## 行内输入：oninput 只写数据，不重渲染

重渲染会打断输入（焦点丢失、光标跳位），所以：

- `oninput` 只写数据字段（`ddSetName(key, val)`），不调 `renderDemandTable()`。
- 手机号式的数字列：`−/+` 步进按钮 + 可直接输入 + `onblur` 才纠正范围（ininput 里纠正会让人没法输入「10」—— 打到「1」就被改成别的）。
- **就地清错误标记**要传 `this`：`oninput="ddSetName(KEY, this.value, this)"` → 函数里 `el.closest('td').classList.remove('dd-err')`，避免为了消红框整表重渲染。

## 上传列：一个格子两个动作，拆成两个点击目标

```js
'<div class="dd-upload has">'
+  '<div class="dd-upload-thumb" onclick="…看大图…" style="cursor:zoom-in">' + thumb + '</div>'
+  '<div class="dd-upload-name" onclick="ddPickFile(KEY)">重新上传</div>'
+  '</div>'
+  '<input type="file" id="ddFileInput-KEY" style="display:none" onchange="ddOnFile(KEY, this)">'
```

- 无文件时：整块点击 = 上传，虚线框 + hover 变蓝边。
- 有文件时：**缩略图点击 = 看大图，下方「重新上传」文字 = 换文件**（`.has` 类改成实线边框、hover 不高亮，让两种状态一眼可分）。合成一个点击目标必然误触。
- 上传后按文件类型自动带入「资源类型」列（`/^video\//.test(f.type) || /\.(mp4|mov|…)$/i.test(f.name)`），并顺手把「资源名称」填成去扩展名的文件名（用户还要改就让他改）。

## 条件必填列（只有某类行才填）

按另一列取值决定可填性：资源类型＝视频才可填「视频背景图」，其它类型显示 `—` 且不可点。

- 校验写在 `validate()` 里而不是 UI 层：`if (r.type === '视频' && !r.poster) lack.push('视频背景图')`。
- 非适用行不能被误判成「没填」——条件必填必须有前置条件，否则一半行永远校验不过。

## 必填校验与单元格标红

```js
function ddValidate() {                    /* 返回 [{i: 行号, key, lack: ['字段名']}] */ }
function ddSaveList() {
  var miss = ddValidate(); DD_ERR = {};
  if (miss.length) {
    miss.forEach(function (m) { DD_ERR[m.key] = m.lack; });
    renderDemandTable();                   /* 标红靠重渲染，此时不在输入中，安全 */
    resToast('第 ' + miss[0].i + ' 行未填完整：' + miss[0].lack.join('、')
      + (miss.length > 1 ? '　（共 ' + miss.length + ' 行待补）' : ''), 'error');
    return;                                /* toast 只说第一条 + 总数，不逐条罗列 */
  }
  resToast('资源清单已保存（演示）', 'success');
}
```

- 渲染时按 `DD_ERR[key]` 给对应 `<td>` 加 `dd-err`：`- ' dd-err'` 由 `errs.indexOf('字段名') >= 0` 决定，字段名沿用校验里的中文串，两侧共用一个常量来源。
- CSS：`td.dd-err { background:#fff1f0 }` + `td.dd-err .dd-input, td.dd-err .dd-tag-field, td.dd-err .dd-upload, td.dd-err .dd-num { border-color:#ff7875 !important }`。
- 页面 init 里重置 `DD_ERR = {}`，否则切页回来还挂着上一次的红框。
- **保存动作还有一个隐藏用途**：明细表原本没有提交按钮时，用户会漏掉「还没填完就交付」。有必填要求就等于需要一个保存/提交按钮，不要只在行内做即时提示。

## 「一个展示单元两个文件」的建模

业务上一个展示单元由两个文件组成时（竖版海报打底 + 居中横版视频，上下留介绍位）：

- **数据层存两个字段**（`file` + `poster`），不要合成一个对象：两个文件格式/地址不同，合成后内部仍是两值；而且「仅视频时才有背景图」这条校验条件在扁平字段上最好写。
- **UI 层当一个组合呈现**：并排显示 → 缩略图合成（`background-image` 铺海报 + 内部 `<video muted>` 居中）→ 点开合成大图预览 → 一起上屏。
- 判据（怎么回答「要不要合成一个字段」）：**单独替换**是不是常见操作（换视频不换底图）？是 → 分开存；**校验条件**是否依赖另一列？是 → 分开存；两个文件是否**永远同生同死**？才考虑合并。

### 合成预览弹窗（确认「上屏后长什么样」）

用户要看的是**实际展示效果**，不是单看某个文件。做法：弹窗里放一个真实比例的竖版舞台（如 260×462 ≈ 9:16），`background-image` 铺海报，内部居中放可播放的 `<video controls autoplay muted loop playsinline>`，上下各放一条「上屏后此处为其他介绍内容」的占位胶囊 —— 占位文案是让用户理解版式的关键，别省。

- JS：`openResComboView(posterUrl, videoUrl, title)`，挂到共享层弹窗（`_shared.html` 加 DOM，业务 JS 留在页面）。
- 关闭时清空 `innerHTML` 与 `backgroundImage`，否则下次打开残留上一个视频在播。
- 缩略图只有 48px 时合成效果看不清 —— 缩略图负责「看得出是组合」，**合成大图才是验收点**。

## 操作列

每行可挂一个行级动作（如「一键上屏」）。原则优先复用共享函数：已有资源行传 `DD_ROW_RES[key]` 给共享的 `oneClickScreen(id)`，新增行没有原资源就退化成本地 toast —— **不要为录入表另写一套上屏逻辑**。

## 验收清单

- [ ] 加行 / 删行（含空勾选提示）/ 全选 / 部分选中状态
- [ ] 有文件与无文件两种态的点击目标分流（看大图 vs 上传）
- [ ] 条件必填列在非适用行显示 `—` 且不参与校验
- [ ] 保存清单：空表、部分未填、全填三种情形；红框在补填后自动消失
- [ ] 空表占位行 `colspan` == 表头列数
- [ ] 切页再回来没有残留红框/残留预览
