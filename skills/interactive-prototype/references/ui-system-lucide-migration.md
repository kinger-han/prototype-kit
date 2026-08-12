# ui-system 规范落地组件化项目（Lucide 图标方案）

> 场景：build.py 组件化项目（PC 后台），用户明确要求"按 ui-system 规范重写菜单 / XX 页面"。
> 2026-08-10 实测于 主题管理V2：菜单 + 公共主题v2 页 emoji 全换 Lucide，成功。

## 核心结论

- ui-system 的 **tokens/颜色/间距** 在组件化项目中**只作视觉参考**（shell 类名契约优先，不混用 ui-* 类名）
- 真正落地的是 **图标规范**：emoji/文本符号 → Lucide 图标（`<i data-lucide="...">`）
- 主色处理：**默认保留项目现有品牌色**（如 #095CEA），不强制切 AntD5 #1677ff；是否换主色需用户拍板（B 方案=保主色）

## 关键陷阱：build.py 吞 `<script src>` CDN 标签

build.py 用 `re.finditer(r'<script>(.*?)</script>')` 提取页面脚本——**只提取内联 script，带 src 的 `<script src="...">` 标签会被静默丢弃**！

所以不能在页面 HTML 里直接写：
```html
<script src="https://cdn.jsdelivr.net/npm/lucide@0.454.0/dist/umd/lucide.min.js"></script>
```
这样构建后 CDN 引用消失，图标全部不渲染。

**必须用 JS 动态加载**（放共享页 02，全项目可用）。

### 本地优先模式（推荐，离线可用）——2026-08-10 V4.13b 实测

用户明确要求"图标不要依赖 CDN，离线也要显示"。最终方案：

1. **下载 lucide 到项目 assets**（build.py 不复制 assets 到 dist，assets 独立存在于 `prototype/assets/`，与图片同约定）：
```bash
mkdir -p prototype/assets/lucide
curl -sL -o prototype/assets/lucide/lucide.min.js \
  "https://cdn.jsdelivr.net/npm/lucide@0.454.0/dist/umd/lucide.min.js"   # 355KB
```
2. **本地优先 + CDN 兜底**（路径 `../assets/lucide/...` 与图片 `../assets/img/...` 同一约定，pages/ 与 dist/ 解析一致；仅拷走单 HTML 时本地失败 → 自动回退 CDN）：
```js
var _lucideLoading = false;
function ensureLucide(cb) {
  if (window.lucide) { if (cb) cb(); return; }
  if (_lucideLoading) { if (cb) setTimeout(cb, 200); return; }
  _lucideLoading = true;
  function onDone() { if (cb) cb(); }
  function onFail() {
    var s2 = document.createElement('script');
    s2.src = 'https://cdn.jsdelivr.net/npm/lucide@0.454.0/dist/umd/lucide.min.js';
    s2.onload = onDone; s2.onerror = onDone;
    document.head.appendChild(s2);
  }
  var s = document.createElement('script');
  s.src = '../assets/lucide/lucide.min.js';  // 本地优先
  s.onload = onDone; s.onerror = onFail;      // 本地失败才回退 CDN
  document.head.appendChild(s);
}
function refreshLucide() { if (window.lucide) window.lucide.createIcons(); }
```
3. **验证相对路径解析**：`../assets/lucide/lucide.min.js` 从 `prototype/pages/` 和 `prototype/dist/` 两个位置都解析到同一真实文件（用 `os.path.normpath` 实测）。

> 备选：CDN-only 动态加载（早期版本）。缺点：离线/内网无图标，国内访问 jsdelivr 不稳。本地优先是长期方案。

## 图标落地模式

### 静态 HTML 图标
```html
<span class="cas-search-icon"><i data-lucide="search" width="13" height="13"></i></span>
```
- `<i data-lucide="图标名">` + width/height 属性（lucide 会按属性尺寸渲染 SVG）
- 在 init 或页面底部调用一次 `ensureLucide(function(){ refreshLucide(); })` 触发 createIcons

### JS 动态渲染的图标（表格行 / toast / 菜单）
- 模板字符串里拼 `<i data-lucide="...">`，**渲染完成后必须再调 `refreshLucide()`**，否则刚插入的图标不渲染：
```js
tbody.innerHTML = html;
ensureLucide(function() { refreshLucide(); });
```
- toast 等临时 DOM 同样在设置 innerHTML 后调用

### 菜单图标（renderAppSidebar）
- groups 数组存**图标名**（不是 emoji），拼接时包 `<i data-lucide="' + icon + '" width="14" height="14">`
- 组标题箭头 `▾` → `<i data-lucide="chevron-down" width="12" height="12">`
- 菜单渲染完调 `ensureLucide(...)`

## emoji → Lucide 映射表（实测）

| 原 emoji/符号 | Lucide 图标名 | 用途 |
|---|---|---|
| 📋 / 🗂️（菜单组） | grid-3x3 / folder-open | 菜单组图标 |
| 📄 | file-text | 菜单项/资源数 |
| 📁 | database | 公共资源 |
| 🔒 | lock | 私有资源 |
| ✅ | shield-check / circle-check | 审核/通过 |
| 🏷️ | tag | 标签管理 |
| 📂 | folder-tree | 类别管理 |
| 🎬 | play | 播放列表 |
| 📅 | calendar | 排播计划 |
| 🔍 | search | 搜索框 |
| ✕ | x | 弹窗关闭 |
| ▾ / ∨ | chevron-down | 下拉箭头 |
| ‹ / › | chevron-left / chevron-right | 分页 |
| 📷 | image | 图片/上传 |
| 🗑️ | trash-2 | 删除确认 |
| 📋（确认弹窗） | clipboard-list | 批量确认 |
| ✅ ❌ ℹ️（toast） | circle-check / circle-x / info | toast 状态 |
| 📄（资源列） | file-text | 资源数量 |

> 图标名必须是 lucide 0.454.0 真实存在的；拿不准先查 `ui-system/icons/registry.json`，或直接用上面实测过的名称。

## 文本符号清理范围（一次做全）

- `✕` → `x`（modal-close 按钮）
- `▾` `▸` `∨` `▲` `▼` → `chevron-down` / `chevron-right` 等
- `‹` `›` → `chevron-left` / `chevron-right`（分页）
- `●` `○` → 树形单选（**保留**，PC 约定明确用 ○/●，不是图标）
- toast emoji ✅❌ℹ️ → lucide 状态图标
- 内联手写 SVG path（按钮图标）→ 统一换 `<i data-lucide>`
- mock 数据里的 emoji 也要清（如 cover:'📷' → 'image'，渲染判断同步改）

## 验证清单（构建后必做）

1. `node --check`：提取 `<script>` 到 .js 检查（动态加载函数语法）
2. dist 中 **`<i data-lucide="grid-3x3">` 计数为 0 是正常的**——菜单图标在 JS 字符串拼接里，dist 源码看不到 data-lucide 属性，运行时才生成。直接 `grep data-lucide` 会误判
3. 检查 dist 中 `ensureLucide` / `refreshLucide` 函数存在、`lucide@0.454.0` URL 出现
4. 源码 emoji 归零：Python `re.findall(r'[\U0001F300-\U0001FAFF\u2600-\u27BF]', content)`
5. 浏览器人工验证：菜单/搜索/弹窗关闭/分页/toast 图标是否渲染；CDN 断开时页面可用（无图标）

## 用户偏好（本次确认）

- "按 ui-system 规范重写" = 换图标 + 视觉细节对齐，**不**等于换主色/改布局/改交互
- 布局/交互改动仍需先出方案确认卡；图标替换属于可执行范围，但**菜单是全局共享函数**（改 renderAppSidebar 影响所有页面侧边栏），需在确认卡中说明影响范围
