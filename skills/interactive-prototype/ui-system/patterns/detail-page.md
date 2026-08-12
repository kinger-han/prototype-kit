# Pattern: detail-page（详情页）

> 适用：订单详情、用户详情、商品详情、单据详情、对象查看…
> 对应组件：page-header（摘要条）+ card + descriptions + table + tabs + status-tag

## 页面结构（自上而下）

```
Page Header（返回 + 标题 + 右侧操作按钮）
  ↓
Summary 摘要条（实体编号 + 状态 + 2~3 个关键字段 + 主操作）
  ↓
Main Information（基本信息卡片，descriptions 双列）
  ↓
Related Information（关联信息卡片：分类、归属、时间等）
  ↓
Related Records（关联记录：明细表格 / 操作日志）
```

## 规则

| 事项 | 规定 |
|---|---|
| 返回 | 左上角「← 返回」文字链接（icon: arrow-left），回到来源列表 |
| 摘要条 | ui-page-summary：编号、状态（Tag）、金额/关键字段；右侧主操作（通过/驳回、编辑、删除） |
| 基本信息 | descriptions 双列布局，label 灰字右对齐、value 黑字；金额右对齐加粗 |
| 状态 | 摘要条用 Tag（醒目）；正文用圆点状态 |
| 关联信息 | 用 section-title 分区，不用重复卡片 |
| 关联记录 | 用内嵌表格（小表格：表头浅底、行 hover），放卡片内 flush 模式 |
| 长详情 | 内容多时用 Tabs 分块（如「基本信息 / 关联记录 / 操作日志」） |
| 操作日志 | 用表格（时间 + 操作人 + 动作 + 结果）或 timeline，优先表格（结构简单） |

## 行为

- 返回链接：`onclick="history.back()"` 或回列表页路由
- 摘要条主操作：进入对应 Modal/Drawer 或触发确认
- 页面数据：Mock 数据要符合业务上下文（时间倒序、编号规范）

## 默认方案（不确定时用这个）

Page Header（返回 + 标题 + 编辑按钮）→ Summary 摘要条（编号 + 状态 + 创建时间 + 操作）→
基本信息卡片（descriptions 双列 8~12 个字段）→ 关联记录表格。详情信息放 Modal 或独立页。
