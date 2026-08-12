/**
 * charts/recipes/donut.js — 环形图 Recipe（占比，≤6 类）
 *
 * 视觉完全固定，模型只传数据：
 *   makeDonutOption({ title, labels, series: [{name, data}] })  // 单系列，data=[数值]
 *   labels 与 data 一一对应
 *
 * 用法：
 *   var chart = echarts.init(document.getElementById('chart-id'));
 *   chart.setOption(makeDonutOption({ title: '渠道构成', labels: ['直销',...], series: [{name:'占比', data:[...]}] }));
 */
var UI_CHART_PALETTE = ['#1677ff','#52c41a','#faad14','#ff4d4f','#722ed1','#13c2c2','#eb2f96','#fa8c16','#a0d911','#2f54eb'];

function makeDonutOption(opt) {
  var labels = opt.labels || [];
  var values = (opt.series && opt.series[0] && opt.series[0].data) || [];
  return {
    color: UI_CHART_PALETTE,
    title: opt.title ? {
      text: opt.title,
      left: 0, top: 0,
      textStyle: { fontSize: 14, fontWeight: 600, color: 'rgba(0,0,0,0.88)' }
    } : undefined,
    tooltip: {
      trigger: 'item',
      formatter: function (p) { return p.name + '：' + p.value + '（' + p.percent + '%）'; },
      backgroundColor: '#ffffff',
      borderColor: '#f0f0f0',
      borderWidth: 1,
      textStyle: { color: 'rgba(0,0,0,0.88)', fontSize: 12 }
    },
    legend: {
      orient: 'vertical',
      right: 0, top: 'middle',
      icon: 'circle', itemWidth: 8, itemHeight: 8,
      textStyle: { color: 'rgba(0,0,0,0.65)', fontSize: 12 },
      formatter: function (name) {
        var idx = labels.indexOf(name);
        var v = idx >= 0 ? values[idx] : 0;
        var total = values.reduce(function (a, b) { return a + b; }, 0);
        var pct = total ? Math.round(v / total * 100) : 0;
        return name + '  ' + v + '（' + pct + '%）';
      }
    },
    series: [{
      name: opt.series && opt.series[0] ? opt.series[0].name : '',
      type: 'pie',
      radius: ['45%', '70%'],
      center: ['38%', '55%'],
      avoidLabelOverlap: true,
      itemStyle: { borderRadius: 4, borderColor: '#ffffff', borderWidth: 2 },
      label: { show: false },
      emphasis: {
        label: { show: false },
        itemStyle: { shadowBlur: 0 }
      },
      data: labels.map(function (name, i) {
        return { name: name, value: values[i] || 0 };
      })
    }]
  };
}
