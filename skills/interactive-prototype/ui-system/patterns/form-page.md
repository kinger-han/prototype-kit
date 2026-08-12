# Pattern: form-page（表单页 / 新建编辑页）

> 适用：新建/编辑对象、配置填写、资料录入…
> 对应组件：page-header + card + input + select + button + modal/drawer

## 页面结构（自上而下）

```
Page Header（标题 + 说明 + 右侧取消/保存按钮）
  ↓
Form Sections（分区卡片，每区一个主题）
  ├─ Section 1：基本信息（2~3 列字段）
  ├─ Section 2：扩展信息
  └─ Section 3：备注
  ↓
Actions（底部操作条：取消 + 保存）
```

## 规则

| 事项 | 规定 |
|---|---|
| 分区 | 字段多（>8）时用卡片分区，每区给标题；字段少直接一个卡片 |
| 字段布局 | 每行 2~3 列（grid `repeat(2, 1fr)` 或 `repeat(3, 1fr)`，gap 16px）；描述文本域占整行 |
| 必填 | label 前红色 `*`（ui-required），提交时校验必填，空则下方显示 ui-form-error |
| Label | 左对齐，灰字（text-secondary），不右对齐 |
| 控件宽度 | 跟随列宽（width 100%），不用固定宽度 |
| 日期/枚举 | date input / select，不用自绘控件 |
| 说明 | 字段下方 ui-form-hint 灰字小字 |
| 取消/保存 | 底部右侧：「取消」default 按钮 + 「保存」primary 按钮；新建页通常不放删除 |
| 保存行为 | 点击保存 → toast「保存成功」→ 关闭/返回（原型模拟，不真实提交） |
| 校验 | 模拟校验即可：必填为空时显示错误文案，无需完整表单校验 |

## 布局代码骨架

```html
<div class="ui-card">
  <div class="ui-card-header"><div class="ui-card-title">基本信息</div></div>
  <div class="ui-card-body">
    <div style="display:grid; grid-template-columns:repeat(2,1fr); gap:var(--spacing-lg);">
      <div class="ui-form-item">…</div>
      <div class="ui-form-item">…</div>
    </div>
  </div>
</div>
```

## 表单用 Modal 还是独立页？

- 字段 ≤ 6、无分区 → Modal（宽 520）
- 字段多、需分区、需大编辑区 → 独立页面或 Drawer（宽 640）

## 默认方案（不确定时用这个）

独立页面：Page Header（标题+保存按钮）→ 基本信息卡片（2 列，8~10 个字段）→
底部操作条（取消 + 保存）。
