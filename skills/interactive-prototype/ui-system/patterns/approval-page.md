# Pattern: approval-page（审批页）

> 适用：退款审批、报销审批、订单审核、入驻审核、内容审核…
> 对应组件：page-header（摘要条）+ card + descriptions + status-tag + table + modal

## 页面结构（自上而下）

```
Page Header（返回 + 标题：审批单号 + 类型）
  ↓
Summary 摘要条（申请人 + 提交时间 + 金额 + 当前状态 Tag）
  ↓
Entity Summary（单据主体详情卡片：descriptions 双列，包含所有审核要素）
  ↓
Important / Risk Information（重要提示卡：金额、期限、风险字段高亮）
  ↓
Approval Actions（审批操作区：通过/驳回按钮 + 审批意见输入）
  ↓
Audit Log（审批记录表格：时间/操作人/动作/意见/结果）
```

## 规则

| 事项 | 规定 |
|---|---|
| 状态优先级 | 摘要条状态 Tag 是最醒目元素，颜色语义固定：待审核=warning、已通过=success、已驳回=error、处理中=processing |
| 关键信息 | 金额用 ui-money（右对齐加粗）；期限/风险字段放醒目位置（摘要条或重要信息卡） |
| 审批操作 | 底部或摘要条右侧：primary「通过」+ default「驳回」；驳回时弹 Modal 填驳回原因（必填） |
| 审批意见 | 通过时可选填写意见（textarea 一行展开）；驳回时必填 |
| 审批记录 | 表格展示：时间 | 操作人 | 动作（通过/驳回/提交） | 意见 | 结果 Tag |
| 不可重复审批 | 当前状态已终态（通过/驳回）时，操作按钮置灰或隐藏 |
| 审批流程模拟 | 点击通过 → toast「已通过」→ 状态 Tag 变 success → 记录追加一行审批日志（原型需真实更新 DOM） |

## 金额/风险提示

- 金额大于阈值（如 ¥10,000）时：摘要条金额显示 warning 色
- 风险提示卡用浅色底（warning-bg）+ warning 边框，不用刺眼红底

## 默认方案（不确定时用这个）

Page Header → 摘要条（申请人/金额/状态 + 通过/驳回按钮）→ 单据详情卡片 →
审批操作区（意见 textarea + 确认按钮）→ 审批记录表格（2~3 行 Mock）。
