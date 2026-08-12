# HTML原型引号转义速查

## 场景1: onclick属性内的函数调用（HTML中）
```html
<!-- HTML属性用双引号，onclick内的函数调用用单引号 -->
<button onclick="showToast('成功','success')">点击</button>
```
正常工作，因为属性值用双引号包裹，函数参数用单引号。

## 场景2: JS字符串中拼接含onclick的HTML
```js
// 外层用单引号，onclick内的单引号会冲突！
const html = '<button onclick="showToast(\'text\')">';  // ❌ SyntaxError

// 修复：用 &apos; 转义
const html = '<button onclick="showToast(&apos;text&apos;)">';  // ✅

// 或者：外层用模板字面量
const html = `<button onclick="showToast('text')">`;  // ✅
```

## 场景3: onclick属性中设置innerHTML（含HTML标签）
```html
<!-- ❌ 内部双引号和onclick双引号冲突 -->
<button onclick="document.getElementById('x').innerHTML='<option value=\"\">text</option>'">

<!-- ✅ 提取为命名函数 -->
<button onclick="resetFilter()">
```

## 场景4: Python str.replace 中的转义
```python
# 替换字符串中的单引号
html = html.replace("old_text", "new_text_with_'quotes'")
# Python单引号字符串中不能直接写单引号，用双引号包裹字符串

# 替换字符串中的反斜杠
html = html.replace("\\n", "\n")  # 替换字面\n为实际换行
```

## 通用规则
1. HTML属性值用双引号 `""`
2. JS字符串优先用模板字面量 `` ` ``
3. onclick内联只放简单函数调用，复杂逻辑提取为命名函数
4. 需要在属性值中放HTML时，用 `&apos;` `&quot;` `&lt;` `&gt;` 转义
