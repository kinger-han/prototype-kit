# 台账页面样式设计参考

> 来源：智融平台系统截图分析（2026-07-23）
> 适用场景：PC端企业后台台账/列表管理页面

---

## 整体布局

单栏垂直布局，无侧边栏，信息流从上到下三段式：

```
┌─────────────────────────────────────────┐
│  ① 筛选查询区（浅灰背景卡片）            │
│  筛选条件 + 搜索/重置按钮               │
├─────────────────────────────────────────┤
│  ② 操作按钮栏                           │
│  新建 / 分享 / 删除 等操作按钮           │
├─────────────────────────────────────────┤
│  ③ 数据表格区                           │
│  表头（排序）+ 数据行 + 空状态/分页       │
└─────────────────────────────────────────┘
```

- 筛选区：浅灰色（#F5F7FA）背景卡片，与内容区形成层次
- 操作按钮栏：紧跟筛选区，左对齐，上下各留 16px
- 表格区：白色背景，表头浅灰底色

---

## 配色方案

### 主色
| 用途 | 色值 | 说明 |
|------|------|------|
| 主色（品牌蓝） | #095CEA | 按钮悬浮态、主操作强调 |
| 浅蓝背景（未选中） | #E6EFFD | 按钮非选中/默认态背景 |
| 主色文字 | #333333 | 标签、表头文字 |
| 占位/提示文字 | #999999 | placeholder、空状态提示 |
| 页面背景 | #FFFFFF | 纯白 |
| 区域背景 | #F5F7FA | 筛选区、表头背景 |

### 功能色（按按钮属性区分）
| 功能 | 边框色 | 浅底色 | 文字色 |
|------|--------|--------|--------|
| 新建/新增（蓝色系） | #E6EFFD | #E6EFFD | #095CEA |
| 分享/正向（绿色系） | #E6F7E6 | #E6F7E6 | #52C41A |
| 删除/危险（红色系） | #FFE6E6 | #FFE6E6 | #FF4D4F |
| 重置/默认（灰色系） | #D9D9D9 | #FFFFFF | #999999 |
| 搜索/主操作 | #095CEA（实底） | #095CEA | #FFFFFF |

---

## 按钮设计规范

### 形态
- 圆角：4-6px 统一小圆角
- 高度：32-36px
- 内边距：水平 12px，垂直 8px
- 图标：在文字左侧，16px 大小

### 两种状态颜色（核心参考）

**未选中/默认态（以"新建频道"为例）**：
```css
background: #E6EFFD;
color: #095CEA;
border: 1px solid #E6EFFD;
```

**鼠标悬浮/选中态**：
```css
background: #095CEA;
color: #FFFFFF;
border: 1px solid #095CEA;
```

### 按钮类型速查
| 类型 | 默认态 | 悬浮态 |
|------|--------|--------|
| 主操作（搜索） | 实底蓝 #095CEA + 白字 | 深蓝 #074BD4 |
| 新增类（新建频道） | 浅蓝底 #E6EFFD + 蓝字 | 实底蓝 #095CEA + 白字 |
| 辅助类（分享） | 浅绿底 + 绿字 | 实底绿 + 白字 |
| 危险类（删除） | 浅红底 + 红字 | 实底红 + 白字 |
| 重置类（重置） | 白底灰框 + 灰字 | 浅灰底 + 深灰字 |

---

## 筛选区域

### 布局
- 横向栅格排列，元素间距 16px
- 分两行：第一行筛选条件 + 按钮；第二行补充条件（如时间范围）
- 按钮右对齐（搜索 + 重置）

### 表单元素
- 输入框/下拉框：圆角 4px，灰色边框（#D9D9D9），白色背景
- 标签文字：深灰色 #333333
- 占位符：浅灰色 #999999

### 搜索/重置按钮
```html
<!-- 搜索（主操作，实底蓝） -->
<button class="filter-btn primary">搜索</button>
<!-- 重置（默认态，白底灰框） -->
<button class="filter-btn">重置</button>
```

---

## 数据表格

### 表头
```css
background: #F5F7FA;
color: #333333;
font-weight: bold;
height: 40px;
```
- 支持排序的列：灰色上下箭头图标
- 列宽自适应，文字左对齐

### 数据行
- 白色背景
- 行高 40px
- 无明显外边框，轻量化

### 行内操作
```html
<!-- 文字链接风格，无边框 -->
<button class="action-btn">详情</button>
<button class="action-btn danger">删除</button>
```

---

## 间距规范

| 区域 | 间距 |
|------|------|
| 筛选元素之间 | 16px |
| 筛选区 ↔ 操作栏 | 16px |
| 操作栏 ↔ 表格 | 16px |
| 按钮内边距（水平/垂直） | 12px / 8px |
| 表头行高 | 40px |
| 数据行行高 | 40px |

---

## CSS 变量（可直接复制使用）

```css
:root {
  /* 主色 */
  --primary: #095CEA;
  --primary-light: #E6EFFD;
  --primary-hover: #095CEA;

  /* 功能色 */
  --success: #52C41A;
  --success-light: #E6F7E6;
  --danger: #FF4D4F;
  --danger-light: #FFE6E6;

  /* 中性色 */
  --text-primary: #333333;
  --text-placeholder: #999999;
  --border-color: #D9D9D9;
  --bg-page: #FFFFFF;
  --bg-section: #F5F7FA;

  /* 圆角 */
  --radius-sm: 4px;
  --radius-md: 6px;

  /* 间距 */
  --gap: 16px;
}
```

---

## 快速复用模板

```html
<!-- 筛选区 -->
<div class="filter-bar" style="background:#F5F7FA; padding:16px; border-radius:6px; margin-bottom:16px;">
  <div style="display:flex; gap:16px; align-items:center; flex-wrap:wrap;">
    <div class="filter-item">
      <label class="filter-label">发布状态</label>
      <select class="filter-select" style="border:1px solid #D9D9D9; border-radius:4px; padding:6px 12px;">
        <option>请选择发布状态</option>
      </select>
    </div>
    <div class="filter-item">
      <label class="filter-label">列表名称</label>
      <input class="filter-input" placeholder="请输入列表名称" style="border:1px solid #D9D9D9; border-radius:4px; padding:6px 12px;" />
    </div>
    <div style="flex:1;"></div>
    <button class="filter-btn" style="border:1px solid #D9D9D9; border-radius:4px; padding:6px 16px; background:#fff; color:#999; cursor:pointer;">重置</button>
    <button class="filter-btn primary" style="border:none; border-radius:4px; padding:6px 16px; background:#095CEA; color:#fff; cursor:pointer;">搜索</button>
  </div>
</div>

<!-- 操作按钮栏 -->
<div style="display:flex; gap:12px; margin-bottom:16px;">
  <!-- 新建：默认态 -->
  <button class="toolbar-btn" style="background:#E6EFFD; color:#095CEA; border:1px solid #E6EFFD; border-radius:4px; padding:6px 16px; cursor:pointer; display:flex; align-items:center; gap:6px;"
    onmouseover="this.style.background='#095CEA'; this.style.color='#FFF'; this.style.borderColor='#095CEA';"
    onmouseout="this.style.background='#E6EFFD'; this.style.color='#095CEA'; this.style.borderColor='#E6EFFD';">
    ＋ 新建频道
  </button>
  <!-- 分享 -->
  <button class="toolbar-btn" style="background:#E6F7E6; color:#52C41A; border:1px solid #E6F7E6; border-radius:4px; padding:6px 16px; cursor:pointer;"
    onmouseover="this.style.background='#52C41A'; this.style.color='#FFF'; this.style.borderColor='#52C41A';"
    onmouseout="this.style.background='#E6F7E6'; this.style.color='#52C41A'; this.style.borderColor='#E6F7E6';">
    🔗 分享
  </button>
  <!-- 删除 -->
  <button class="toolbar-btn" style="background:#FFE6E6; color:#FF4D4F; border:1px solid #FFE6E6; border-radius:4px; padding:6px 16px; cursor:pointer;"
    onmouseover="this.style.background='#FF4D4F'; this.style.color='#FFF'; this.style.borderColor='#FF4D4F';"
    onmouseout="this.style.background='#FFE6E6'; this.style.color='#FF4D4F'; this.style.borderColor='#FFE6E6';">
    🗑️ 删除
  </button>
</div>

<!-- 数据表格 -->
<div class="table-card" style="background:#fff; border-radius:6px;">
  <table style="width:100%; border-collapse:collapse;">
    <thead>
      <tr style="background:#F5F7FA; height:40px;">
        <th style="padding:0 16px; text-align:left; font-weight:bold; color:#333;">列表名称</th>
        <th style="padding:0 16px; text-align:left; font-weight:bold; color:#333;">发布状态</th>
        <th style="padding:0 16px; text-align:left; font-weight:bold; color:#333;">更新时间</th>
        <th style="padding:0 16px; text-align:left; font-weight:bold; color:#333;">操作</th>
      </tr>
    </thead>
    <tbody>
      <tr style="height:40px; border-bottom:1px solid #F0F0F0;">
        <td style="padding:0 16px; color:#333;">示例频道</td>
        <td style="padding:0 16px;"><span class="badge-status active">已发布</span></td>
        <td style="padding:0 16px; color:#999;">2026-07-23</td>
        <td style="padding:0 16px;">
          <button class="action-btn">详情</button>
          <button class="action-btn danger">删除</button>
        </td>
      </tr>
    </tbody>
  </table>
</div>
```
