/**
 * charts/recipes/horizontal-bar.js — 横向柱状图 Recipe（排名）
 *
 * 视觉完全固定，模型只传数据：
 *   makeHorizontalBarOption({ title, labels, series: [{name, data}] })
 *   labels 从上到下 = 排名 1→N
 *
 * 用法：
 *   var chart = echarts.init(document.getElementById('chart-id'));
 *   chart.setOption(makeHorizontalBarOption({ title: '销量排名', labels: ['商品A',...], series: [{name:'销量', data:[...]}] }));
 */
var UI_CHART_PALETTE = ['#1677ff','#52c41a','#faad14','#ff4d4f','#722ed1','#13c2c2','#eb2f96','#fa8c16','#a0d911','#2f54eb'];

function makeHorizontalBarOption(opt) {
  return {
    color: UI_CHART_PALETTE,
    title: opt.title ? {
      text: opt.title,
      left: 0, top: 0,
      textStyle: { fontSize: 14, fontWeight: 600, color: 'rgba(0,0,0,0.88)' }
    } : undefined,
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow', shadowStyle: { color: 'rgba(0,0,0,0.04)' } },
      backgroundColor: '#ffffff',
      borderColor: '#f0f0f0',
      borderWidth: 1,
      textStyle: { color: 'rgba(0,0,0,0.88)', fontSize: 12 }
    },
    legend: {
      top: 4, right: 0,
      icon: 'roundRect', itemWidth: 10, itemHeight: 10,
      textStyle: { color: 'rgba(0,0,0,0.65)', fontSize: 12 }
    },
    grid: { left: 8, right: 24, top: 40, bottom: 8, containLabel: true },
    xAxis: {
      type: 'value',
      splitLine: { lineStyle: { color: '#f0f0f0' } },
      axisLabel: { color: 'rgba(0,0,0,0.45)', fontSize: 12 }
    },
    yAxis: {
      type: 'category',
      data: (opt.labels || []).slice().reverse(),   // 排名 1 在顶部
      axisLine: { lineStyle: { color: '#f0f0f0' } },
      axisTick: { show: false },
      axisLabel: { color: 'rgba(0,0,0,0.65)', fontSize: 12 },
      inverse: true
    },
    series: (opt.series || []).map(function (s) {
      return {
        name: s.name,
        type: 'bar',
        data: (s.data || []).slice().reverse(),
        barMaxWidth: 18,
        label: {
          show: true,
          position: 'right',
          color: 'rgba(0,0,0,0.65)',
          fontSize: 12
        },
        itemStyle: { borderRadius: [0, 2, 2, 0] }
      };
    })
  };
}
