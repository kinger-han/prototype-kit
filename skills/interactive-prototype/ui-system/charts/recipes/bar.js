/**
 * charts/recipes/bar.js — 柱状图 Recipe（ECharts 5.5.0）
 *
 * 视觉完全固定，模型只传数据：
 *   makeBarOption({ title, labels, series: [{name, data}] })
 *
 * 用法：
 *   var chart = echarts.init(document.getElementById('chart-id'));
 *   chart.setOption(makeBarOption({ title: '月度业绩', labels: [...], series: [{name:'业绩', data:[...]}] }));
 */
var UI_CHART_PALETTE = ['#1677ff','#52c41a','#faad14','#ff4d4f','#722ed1','#13c2c2','#eb2f96','#fa8c16','#a0d911','#2f54eb'];

function makeBarOption(opt) {
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
    grid: { left: 8, right: 16, top: 40, bottom: 8, containLabel: true },
    xAxis: {
      type: 'category',
      data: opt.labels || [],
      axisLine: { lineStyle: { color: '#f0f0f0' } },
      axisTick: { show: false },
      axisLabel: { color: 'rgba(0,0,0,0.45)', fontSize: 12 }
    },
    yAxis: {
      type: 'value',
      splitLine: { lineStyle: { color: '#f0f0f0' } },
      axisLabel: { color: 'rgba(0,0,0,0.45)', fontSize: 12 }
    },
    series: (opt.series || []).map(function (s) {
      return {
        name: s.name,
        type: 'bar',
        data: s.data || [],
        barMaxWidth: 32,
        itemStyle: { borderRadius: [2, 2, 0, 0] },
        emphasis: { focus: 'series' }
      };
    })
  };
}
