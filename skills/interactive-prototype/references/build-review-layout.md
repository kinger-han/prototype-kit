# 评审一体化布局 - build.py 关键代码

移动端 `build_mobile()` 函数的核心逻辑：提取文档块、生成文档面板。

## 提取文档块

```python
def extract_doc_content(content):
    """从组件中提取 <template class="doc"> 文档块"""
    m = re.search(r'<template class="doc">(.*?)</template>', content, re.DOTALL)
    return m.group(1).strip() if m else None
```

## 遍历组件收集元数据

```python
for fpath in sorted(glob.glob(os.path.join(page_dir, "*.html"))):
    content = read_file(fpath)
    pid = extract_page_id(content)        # id="page-xxx"
    title = extract_page_title(content)   # data-title="xxx"
    doc = extract_doc_content(content)    # <template class="doc">...</template>
    pages_html.append(content)
    doc_cards.append((pid, title, doc))
```

## 生成右侧文档面板

```python
doc_html = ""
for pid, title, doc in doc_cards:
    highlight = " highlight" if pid == default_page else ""
    doc_html += f'<div class="doc-card{highlight}" data-page="{pid}" id="doc-{pid}">\n'
    doc_html += f'  <div class="doc-card-title"><span class="page-tag">{pid}</span> {title}</div>\n'
    if doc:
        doc_html += f'  {doc}\n'
    else:
        doc_html += f'  <div class="doc-feature"><div class="doc-feature-desc">暂无页面说明</div></div>\n'
    doc_html += f'</div>\n'
```

## HTML 拼装

```html
<div class="review-shell">
  <!-- 左侧：手机原型 -->
  <div class="review-phone-area">
    <div>
      <div class="mobile-frame">
        <div class="mobile-page-container">
          {pages_str}
        </div>
      </div>
      <div class="page-nav">
        {nav_buttons}  <!-- 每个页面一个按钮 -->
      </div>
    </div>
  </div>

  <!-- 右侧：功能说明文档 -->
  <div class="review-doc-area">
    <div class="doc-title">页面功能说明</div>
    <div class="doc-subtitle">点击左侧页面或下方按钮切换，右侧同步高亮</div>
    {doc_cards_html}
  </div>
</div>
```

## base.js 同步逻辑

```javascript
function highlightDoc(pageId) {
  document.querySelectorAll('.doc-card').forEach(c => c.classList.remove('highlight'));
  var doc = document.querySelector('.doc-card[data-page="' + pageId + '"]');
  if (doc) {
    doc.classList.add('highlight');
    doc.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  document.querySelectorAll('.page-nav-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-page') === pageId);
  });
}
```

## 组件中写文档块的格式

```html
<!-- page: m-chat  data-title="AI对话" -->
<template class="doc">
  <div class="doc-feature">
    <div class="doc-feature-name"><span class="doc-feature-tag ui">UI</span>对话气泡布局</div>
    <div class="doc-feature-desc">左侧灰色气泡为AI回复，右侧蓝色气泡为用户消息。</div>
  </div>
  <div class="doc-feature">
    <div class="doc-feature-name"><span class="doc-feature-tag logic">逻辑</span>AI回复流程</div>
    <div class="doc-feature-desc">用户发送消息 → 调用 Dify API → 流式返回。</div>
  </div>
  <div class="doc-feature">
    <div class="doc-feature-name"><span class="doc-feature-tag data">数据</span>消息持久化</div>
    <div class="doc-feature-desc">消息存储到 conversation_messages 表。</div>
  </div>
</template>

<div class="page" id="page-m-chat">
  ...页面内容...
</div>
```

`<template class="doc">` 不会被浏览器渲染，build.py 会提取它并放到右侧文档面板。
