# 改完原型之后的核对清单：元素搬迁 / 产物 / 文档

适用：改了 `prototype/pages/*.html` 的既有元素、位置、样式或交互后，从“改完了”到“敢说改完了”之间的全部动作。

执行顺序：搬元素前查引用 → 构建 → 产物结构核对 → 文档口径同步。

## 1. 搬迁既有元素前：先查引用方式

- `grep -n "目标id" prototype/pages/*.html`，看几处引用、怎么取的。
- 全部是 `getElementById` / id 取值 → **可以纯 HTML 搬迁，JS 零改动**（不依赖父节点和兄弟顺序），改完仍要 `node --check` 对 <script> 块做一次。
- 出现 `querySelector('.父 .子')`、`nextElementSibling`、`parentNode` 这类结构依赖 → 先把引用改成 id 取值，再搬。
- 顺手确认搬迁带来的副作用：新容器若带 `display:none` 的显隐逻辑（如选择区在某个 TAB 下隐藏），元素搬进去后会自然继承该显隐；原来那段按 TAB 判显隐的 JS 保留作第二层保险，不要顺手删。

## 2. 单文档构建 = 全局作用域（改样式前必读）

- build.py 把所有 `pages/*.html` 注入同一个 HTML，**任一页的 `<style>` / `<script>` 在产物里全局生效**。
- 所以页面常直接用别的页定义的类（如 13 页用 07 页的 `.resmg-btn`）。**改样式前先 `grep -rn "<类名>" pages/` 定位定义在哪一页、有几个页在用，只改定义处**；在目标页再复制一份同名类会互相覆盖，症状是“改了一处、另一处变样”。
- 函数名同理全局：新增共用函数/按钮 id 要带页面唯一前缀，避免同名互相覆盖。

## 3. 构建后：产物结构核对（不是只看 build 成功）

```python
s = open('prototype/dist/<产物>.html', encoding='utf-8').read()
i = s.find('id="目标id"')           # HTML 定义位置
print(repr(s[i-400:i+400]))         # 打印上下文，肉眼确认前后邻居
print(s.count('目标id'))             # JS 引用会多次出现，属正常
print('老容器关键片段' in s)         # 应 False：确认已从原位置移除
```

- **不要用固定宽度的正则窗口判断位置**：锚点跨窗口边界时窗口被截断 → 假阴性，会误判“改动没生效”。取索引 + 打印上下文才准。
- 判定依据是**产物**，不是源文件：源文件改对但没重建 = 线上没变。
- 线上发布后的生效判断见 `references/github-pages-publish.md`（看响应头，不看 size_download）。

## 4. 文档口径同步（最容易漏的收尾）

- 位置/文案/交互类改动落地后，`grep -n` README.md 与 `docs/*PRD*.md` 里的旧措辞（如“右上角”“顶栏”），命中即同步：状态段版本号、页面清单行、页面详情段、修订历史新增一条。**版本号多份文档一起 bump**，否则下次接手按旧口径改回去。
- **同一项目不同文件行尾可能不同**（实测：README 全 LF，PRD 全 CRLF）。脚本替换前先探行尾，用该文件自己的换行拼多行锚点：

```python
raw = open(p, 'rb').read()
crlf = raw.count(b'\r\n')
lf = raw.count(b'\n') - crlf
eol = '\r\n' if crlf > lf else '\n'   # 多行锚点用 eol.join(lines)
t = raw.decode('utf-8')
```

- 写盘前逐个 `assert t.count(old) == 1`，再 `open(p,'wb')` 写回：锚点 0 命中时静默写盘 = 只改了一半，是这类脚本最难查的失败模式。

## 5. 改过 JS 后：用 headless 真跑一遍（静态检查抓不到运行时错）

`node --check` 只证明语法对、函数都定义了；**运行时才炸的错它抓不到**。
用户报的「数据没了」「点按钮没反应」「表格空白」多属这一类：页面结构正常、函数也在，但函数执行到一半抛异常就中断了。

典型成因：字段名读错（`r.title` vs `r.name`）→ 某处 `.replace` / `.slice` 拿到 undefined → 渲染函数整个中断 → 表格空白；点「添加行」走同一个渲染函数 → 也没反应。静态检查全绿，看着像「按钮坏了」，其实断在渲染里。

**判断捷径**：`行数 0 + 无占位文字` ≠ `行数 0 + 有占位文字`。前者是代码炸了（占位那行都没执行到），后者是数据没筛到。分不清就会改错地方。

### 做法：Edge headless + onerror 捕获 + 探针

复制 dist 到临时文件，`</head>` 前注入捕获器、`</body>` 前注入探针，`--dump-dom` 后从 `<title>` 读回结果。

```python
import os, re, subprocess
PROJ = r"<项目绝对路径>"
SRC  = os.path.join(PROJ, "prototype", "dist", "<产物名>.html")
TEST = os.path.join(os.environ.get("TMPDIR", "."), "diag.html")
s = open(SRC, encoding="utf-8").read()

COLLECT = """<script>
window.__ERRS = [];
window.addEventListener('error', function (e) {
  window.__ERRS.push((e.message || '') + ' @' + (e.lineno || ''));
});
</script>"""
PROBE = """<script>
setTimeout(function () {
  var out = {};
  try { protoShowPage('<页面路由名>'); out.afterShow = 'ok'; }
  catch (e) { out.afterShow = String(e); }
  try {
    var tb = document.getElementById('<tbody-id>');
    out.tbodyExists = !!tb;
    out.rows = tb ? tb.querySelectorAll('tr').length : -1;
    out.html = tb ? tb.innerHTML.slice(0, 120) : '';
  } catch (e) { out.tbodyErr = String(e); }
  document.title = 'DIAG' + JSON.stringify(out) + '|ERRS' + JSON.stringify(window.__ERRS);
}, 800);
</script>"""
s = s.replace('</head>', COLLECT + '</head>').replace('</body>', PROBE + '</body>')
open(TEST, 'w', encoding='utf-8').write(s)

EDGE = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
r = subprocess.run([EDGE, '--headless', '--disable-gpu', '--no-sandbox',
                    '--virtual-time-budget=6000', '--dump-dom',
                    'file:///' + TEST.replace('\\', '/')],
                   capture_output=True, text=True, encoding='utf-8', timeout=120)
m = re.search(r'<title>(.*?)</title>', r.stdout, re.S)
print(m.group(1) if m else '未取到 title')
```

### 要点

- **探针必须调用真实的页面函数**（路由切换 + 渲染入口），不能只 dump 静态 DOM —— 默认路由下目标页可能压根没渲染，会得到假阴性。
- **`--virtual-time-budget`** 要大于探针里的延时（800ms），否则 setTimeout 没跑完就 dump 了。
- 结果回传走 **`document.title`**：headless 下 console 读不到，title 是最稳的信道。
- 一次探针查三件事：**断链**（`typeof fn === 'function'`）、**数据量**（渲染出几行）、**异常**（onerror + try/catch）。
- 探针里每个可能抛错的操作都套 `try/catch` 并把错误写进结果 —— 否则探针自己炸了，你会误判成「页面没问题」。
- 改动批量落地后至少对**用户报告的那一页 + 相邻受影响页**各跑一次，比逐条看代码可靠。

