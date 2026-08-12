# Charts 规则（ECharts 固定视觉契约）

> 单 HTML 原型图表统一采用 **ECharts 5.5.0**（CDN 固定版本）。
> 模型不决定图表视觉，只从 `recipes/` 选择 Recipe 并填入数据。

## 一、图表选择规则（Semantic Decision Rules）

| 场景 | 选择 |
|---|---|
| 单个关键指标 | Metric Card（KPI 数字卡片，不用图表） |
| 随时间变化 | Line（`recipes/line.js`） |
| 多个离散类别比较 | Bar（`recipes/bar.js`） |
| 排名（类别名长） | Horizontal Bar（`recipes/horizontal-bar.js`） |
| 少量类别占比（≤6 类） | Donut（`recipes/donut.js`） |
| 无法判断 | 优先用 Table，不创造特殊图表 |

## 二、模型只负责传

每个 Recipe 是一个 `makeXxxOption(opt)` 函数，模型只填：

```
title    — 图表标题
labels   — x 轴/类别名
series   — [{name, data}] 
```

**模型不得自行决定**：color / gradient / shadow / axis style / tooltip style / legend style / line style / symbol / splitLine / bar style / donut style。

## 三、固定视觉（Recipe 已内置，改动需授权）

- **颜色**：10 色 palette 定义在 `recipes/` 各文件顶部 `UI_CHART_PALETTE` 常量（图表视觉的单一来源，勿在别处复制色值）
- 字体：`12px`，颜色 `rgba(0,0,0,0.45)`（axis）/ `rgba(0,0,0,0.65)`（legend）
- 分割线：`#f0f0f0` 实线 1px
- 折线：线宽 2，圆点 symbol，不平滑（smooth=false）
- 柱：最大柱宽 32，顶部 2px 圆角
- Donut：内径 45% / 外径 70%，扇区间隔白边 2px
- 背景透明（容器卡片自带白底）；Tooltip 白底 + 边框 #f0f0f0
- 同一页面多个图表共用 palette，数据系列按序取色

## 四、接入方式（单 HTML）

```html
<!-- 1. CDN（固定版本，放 </body> 前） -->
<script src="https://cdn.jsdelivr.net/npm/echarts@5.5.0/dist/echarts.min.js"></script>

<!-- 2. 拷贝 recipe 函数（line.js / bar.js / … 全文）到页面 script -->

<!-- 3. 容器：必须指定高度 -->
<div id="chart-trend" style="width:100%; height:300px;"></div>

<!-- 4. 初始化（页面加载后执行） -->
<script>
var chart1 = echarts.init(document.getElementById('chart-trend'));
chart1.setOption(makeLineOption({
  title: '近 30 天销售额趋势',
  labels: ['1日','2日', ...],
  series: [{ name: '销售额', data: [...] }]
}));
</script>
```

## 五、降级

- CDN 不可用（离线打开）：图表区显示「图表数据加载失败」占位文本。
  实现：初始化前检查 `typeof echarts === 'undefined'`，失败则把容器替换为占位 div。
- 容器宽度变化（窗口缩放）：`window.addEventListener('resize', function(){ chart1.resize(); })`

## 六、禁用

- 禁止自定义 palette / gradient / shadow / 3D / 特殊 symbol
- 禁止混用多种图表风格
- 禁止饼图显示过多类别（>6 改用 Bar）
