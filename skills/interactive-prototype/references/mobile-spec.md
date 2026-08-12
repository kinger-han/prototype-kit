# Mobile Prototype Specification — interactive-prototype skill reference

> Extracted from the `interactive-prototype` SKILL.md to reduce token load.
> All CSS/JS snippets are used as-is during prototype development.

---

## 手机外框

### 刘海屏（默认）

```css
.phone-frame {
  width: 395px;
  height: 850px;
  background: #1c1c1e;
  border-radius: 44px;
  padding: 10px;
}
.phone-screen {
  width: 100%; height: 100%;
  background: #f5f5f3;
  border-radius: 34px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
```

- 刘海区：`position: absolute; width: 126px; height: 30px; background: #1c1c1e; border-radius: 0 0 20px 20px;`
- 底部横条：`width: 134px; height: 5px; background: #1c1c1e; border-radius: 3px;`

### 全面屏（无刘海）

去掉刘海元素，底部指示条改为半透明白色：

- 删除 `.phone-notch` 的 HTML 和 CSS
- 底部横条：`width: 100px; height: 4px; background: rgba(255,255,255,0.3); border-radius: 2px; bottom: 8px;`
- 用户偏好全面屏时使用此方案，更简洁现代

---

## 微信原生导航栏

```css
.wx-nav {
  height: 88px;
  padding-top: 34px;
  background: #f5f5f3;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  flex-shrink: 0;
}
```

- 胶囊按钮在右侧：`position: absolute; right: 14px; bottom: 8px;`
- 胶囊：三点菜单 + 分割线 + 关闭按钮，背景 `rgba(0,0,0,0.05)`，圆角 16px

---

## 聊天界面关键模式

### 打字机效果

逐字输出，每字 25-40ms 随机延迟，带闪烁光标 `.cursor-blink`。完成后移除光标、添加操作条、触发引导追问。

### 思考中动画

三个小圆点，垂直弹跳动画，延迟递增。AI 回复前显示，开始打字后移除。

### 语音输入模拟

麦克风按钮 → 弹出录音面板（圆形脉冲动效 + 声波条动画）→ 2-3秒后模拟识别完成 → 转文字自动发送。

### 26键键盘模拟

键盘作为 **flex 流内元素**（不是绝对定位浮层），弹出时自然推动消息列表和输入框上移。

- 数字行 + 3行字母 + 底部功能行（123/emoji/space/发送）
- 按键点击写入 input，支持大小写切换、退格
- 点击消息区关闭键盘

> ⚠️ **不要用 `position: absolute` 放键盘！** 键盘必须是 flex 流中的普通元素（`flex-shrink: 0`），通过 `display: none/block` 切换。这样消息列表自动压缩、输入框自然上移到键盘正上方，和真实手机行为一致。
>
> 错误做法：`position: absolute; bottom: 0; transform: translateY(100%)` → 会覆盖消息和输入框。

### 卡片式引导提问（2x2网格）

比 chip 按钮更好看的引导方式，适合开场白下方：

```css
.quick-card-grid {
  display: grid; grid-template-columns: 1fr 1fr; gap: 8px;
  margin-top: 8px; padding-left: 38px; /* 避开AI头像宽度 */
}
.quick-card {
  padding: 12px 10px; border-radius: 10px;
  background: #f5f1e8; border: 1px solid #e8e2d4;
  font-size: 13px; color: #6b5a3a; line-height: 1.4;
  transition: background 0.15s, transform 0.15s;
}
.quick-card:active { background: #ece5d3; transform: scale(0.97); }
```

- 点击卡片即发送对应问题，发送后移除整个 grid
- 可根据品牌色调整 background/border/color

---

## 移动端原型评审一体化布局（手机+文档）

用户提出的新模式：**左侧手机原型 + 右侧功能说明文档**，一个页面搞定原型评审，比传统 PRD 更直观。

### 布局结构

```
┌─────────────────────────────────────────────────┐
│ review-shell (flex, 100vh)                      │
│ ┌──────────────┐ ┌────────────────────────────┐ │
│ │ review-phone  │ │ review-doc-area            │ │
│ │ area (420px)  │ │ (flex:1, 可滚动)           │ │
│ │               │ │                            │ │
│ │ ┌──────────┐ │ │ ┌──────────────────────┐  │ │
│ │ │ mobile-  │ │ │ │ doc-card [data-page] │  │ │
│ │ │ frame    │ │ │ │  功能说明卡片         │  │ │
│ │ │ (375px)  │ │ │ │  · UI标注            │  │ │
│ │ │          │ │ │ │  · 逻辑说明          │  │ │
│ │ └──────────┘ │ │ │  · 数据接口          │  │ │
│ │              │ │ └──────────────────────┘  │ │
│ │ [page-nav]   │ │ ┌──────────────────────┐  │ │
│ │ 按钮切换页面  │ │ │ doc-card [data-page] │  │ │
│ └──────────────┘ │ └──────────────────────┘  │ │
│                   └────────────────────────────┘ │
└─────────────────────────────────────────────────┘
```

### 交互逻辑

- 左侧手机壳内页面通过 hash 路由切换
- 右侧文档区每个页面一个 `.doc-card[data-page="xxx"]`
- 切换页面时 `highlightDoc(pageId)` 自动：
  1. 取消所有 `.doc-card` 的 `.highlight`
  2. 给当前页对应卡片加 `.highlight`
  3. `scrollIntoView({ behavior: 'smooth' })` 滚动到可见区
- 左侧手机下方有 `.page-nav` 按钮组，方便快速跳转

### 文档标注分类

用 `.doc-feature-tag` 区分三类标注：

- `<span class="doc-feature-tag ui">UI</span>` — 界面元素说明
- `<span class="doc-feature-tag logic">逻辑</span>` — 交互逻辑/业务规则
- `<span class="doc-feature-tag data">数据</span>` — 数据接口/存储

### 使用场景

- **原型评审**：产品和开发一起看，左侧看效果，右侧看逻辑
- **开发参考**：开发人员点击每个页面，右侧同步展示功能说明和接口
- **替代传统 PRD**：可视化 + 文档合一，比纯文字 PRD 清晰

### 背景色注意

手机壳外区域用淡色背景（`#f5f6fa`），不要用深色（`#1a1a2e`），否则看不清手机边框。

### base.js 同步逻辑

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

### 组件中写文档块的格式

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

---

## Mobile-Specific Pitfalls

### 操作按钮只在最后一条消息显示

用户纠正："只有最后一个回答可以用复制等快捷操作，前面的不需要"。

实现：每次添加新 AI 消息时，先 `document.querySelectorAll('.msg-actions').forEach(el => el.remove())` 清除所有旧操作条，再给新消息添加。

### 欢迎消息不带操作按钮

首条 AI 自我介绍消息不应显示"复制/重新回答/播放"按钮。单独处理，不经过 `addAIMessage()` 的操作条逻辑。

### 引导追问的上下文相关性

每次 AI 回答后推送 3 个追问建议，内容要根据回复类型动态生成：

- 路线类回复 → 追问"某个展厅展品""预计游览时长""附近餐饮"
- 展览类回复 → 追问"特展在几楼""门票价格""能否拍照"
- 设施类回复 → 追问"无障碍通道""母婴室""推荐路线"
- 兜底回复 → 追问"推荐路线""展览介绍""服务台位置"

新回答到来时，清除所有旧的引导追问卡片。

### 手机壳外背景色

移动端评审布局的背景用淡色（`#f5f6fa` 或 `#f0f2f5`），**不要用深色**（`#1a1a2e`）。深色背景会和手机黑色边框融为一体，看不清边界。

### 移动端主题色注入

shell-mobile.html 中用 `{{PRIMARY_COLOR}}` 占位符，build.py 从 config.json 读取 `primaryColor` 后替换。如果 config.json 缺少此字段，默认 `#8b6914`（博物馆金色）。移动端 Tab 栏高亮色和页码按钮高亮色都跟随此主题色。

### 移动端 proto-config.json 格式

```json
{
  "name": "智能导游小程序",
  "template": "mobile",
  "primaryColor": "#8b6914",
  "tabBar": [
    {"pageId": "m-home", "icon": "🏠", "title": "首页"},
    {"pageId": "m-chat", "icon": "💬", "title": "对话"},
    {"pageId": "m-mine", "icon": "👤", "title": "我的"}
  ]
}
```
