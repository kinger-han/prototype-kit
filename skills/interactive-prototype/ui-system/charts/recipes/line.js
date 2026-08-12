/**
 * charts/recipes/line.js — 折线图 Recipe（ECharts 5.5.0）
 *
 * 视觉完全固定，模型只传数据：
 *   makeLineOption({ title, labels, series: [{name, data}] })
 *
 * 用法：
 *   var chart = echarts.init(document.getElementById('chart-id'));
 *   chart.setOption(makeLineOption({ title: '销售额趋势', labels: [...], series: [{name:'销售额', data:[...]}] }));
 */
var UI_CHART_PALETTE = ['#1677ff','#52c41a','#faad14','#ff4d4f','#722ed1','#13c2c2','#eb2f96','#fa8c16','#a0d911','#2f54eb'];

function makeLineOption(opt) {
  return {
    color: UI_CHART_PALETTE,
    title: opt.title ? {
      text: opt.title,
      left: 0, top: 0,
      textStyle: { fontSize: 14, fontWeight: 600, color: 'rgba(0,0,0,0.88)' }
    } : undefined,
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#ffffff',
      borderColor: '#f0f0f0',
      borderWidth: 1,
      textStyle: { color: 'rgba(0,0,0,0.88)', fontSize: 12 },
      axisPointer: { type: 'line', lineStyle: { color: 'rgba(0,0,0,0.15)' } }
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
      boundaryGap: false,
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
        type: 'line',
        data: s.data || [],
        smooth: false,
        symbol: 'circle',
        symbolSize: 6,
        lineStyle: { width: 2 },
        itemStyle: { borderWidth: 1, borderColor: '#ffffff' },
        emphasis: { focus: 'series' },
        connectNulls: true
      };
    })
  };
}
