# Pattern: dashboard-page（数据看板 / 分析页）

> 适用：销售分析、经营报表、数据总览、监控大屏（PC 简化版）…
> 对应组件：card + descriptions + table + charts/recipes + page-header

## 页面结构（自上而下）

```
Page Header（标题 + 时间范围筛选）
  ↓
KPI 指标行（4 个 Metric Card：数值 + 同比/环比）
  ↓
Main Trend（主趋势图：Line 折线，占整行，或 2/3 宽）
  ↓
Breakdown / Ranking（占比 Donut + 排名 Horizontal Bar，左右分栏）
  ↓
Detail Table（明细表格：可下钻的数据）
```

## 规则

| 事项 | 规定 |
|---|---|
| KPI 卡 | 一行 4 个：标签（灰小字）+ 大数字（20-24px 加粗）+ 涨跌提示（↑绿 / ↓红，± 与上期比） |
| KPI 图标 | 可选：卡片左上角放语义图标（trending-up/wallet/package…），从 icons registry 选 |
| 主趋势 | Line Recipe；时间轴 x 轴；数据点 7~12 个 |
| 占比 | Donut Recipe（类别 ≤6）；下方可配图例列表（名称 + 数值 + 百分比） |
| 排名 | Horizontal Bar Recipe（Top 5~10，类别名长） |
| 图表数据 | 真实业务语义的 Mock 数据，数值合理（总和、趋势一致） |
| 配色 | 一律用 Chart Recipe 固定 palette，禁止自定义颜色 |
| 明细表 | 底部表格可滚动（5~10 行），与图表数据同源（口径一致） |
| 时间筛选 | 右上角：近 7 天/近 30 天/自定义（select），切换只 toast 不真实重算 |

## KPI 涨跌显示

```
↑ 12.5%   ← 用 trending-up 图标 + success 色（正增长）
↓ 3.2%    ← 用 trending-down 图标 + error 色（负增长）
```

## 布局骨架

```html
<div style="display:grid; grid-template-columns:repeat(4,1fr); gap:var(--spacing-lg); margin-bottom:var(--spacing-xl);">
  <!-- KPI 卡 ×4 -->
</div>
<div style="display:grid; grid-template-columns:2fr 1fr; gap:var(--spacing-lg); margin-bottom:var(--spacing-xl);">
  <div class="ui-card"><div class="ui-card-header">…趋势</div><div class="ui-card-body"><div id="chart-trend" style="height:300px;"></div></div></div>
  <div class="ui-card"><div class="ui-card-header">…占比</div><div class="ui-card-body"><div id="chart-donut" style="height:300px;"></div></div></div>
</div>
```

## 默认方案（不确定时用这个）

Page Header（含时间筛选）→ 4 个 KPI 卡 → 全宽 Line 趋势图 → 左 Donut 右 Horizontal Bar →
底部明细表格。
