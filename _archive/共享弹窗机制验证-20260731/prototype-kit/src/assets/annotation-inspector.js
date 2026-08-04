/**
 * annotation-inspector.js — 巡检模式（全屏遮罩物理拦截）
 * 事件只挂在遮罩上，移除遮罩=彻底清除拦截
 * 点击元素 → 自动打标建壳 → 退出巡检 → 用户点角标编辑
 */
(function () {
  var mask = null;
  var hoverTarget = null;

  function autoGenKey() {
    var items = window.__annoItems || {};
    var keys = Object.keys(items);
    var prefix = 'anno-';
    var maxNum = 0;
    if (keys.length > 0) {
      var lastKey = keys[keys.length - 1];
      var m = lastKey.match(/^(.+?)(\d+)$/);
      if (m) { prefix = m[1]; }
    }
    for (var i = 0; i < keys.length; i++) {
      var km = keys[i].match(new RegExp('^' + prefix.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + '(\\d+)$'));
      if (km) maxNum = Math.max(maxNum, parseInt(km[1], 10));
    }
    var n = maxNum + 1;
    return prefix + (n < 10 ? '0' + n : '' + n);
  }

  function start() {
    if (mask) return;
    mask = document.createElement('div');
    mask.id = 'anno-inspector-mask';
    mask.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:999999;cursor:crosshair;background:transparent;';
    document.body.appendChild(mask);

    var overlay = document.createElement('div');
    overlay.id = 'anno-inspector-highlight';
    overlay.style.cssText = 'position:fixed;pointer-events:none;z-index:999998;border:2px solid #1890ff;background:rgba(24,144,255,0.08);display:none;';
    document.documentElement.appendChild(overlay);

    mask.addEventListener('mousemove', function (e) {
      mask.style.pointerEvents = 'none';
      var el = document.elementFromPoint(e.clientX, e.clientY);
      mask.style.pointerEvents = 'auto';
      if (!el || el === overlay || el.id === 'anno-inspector-highlight' || el.id === 'anno-inspector-mask') { hoverTarget = null; overlay.style.display = 'none'; return; }
      hoverTarget = el;
      var r = el.getBoundingClientRect();
      overlay.style.display = 'block';
      overlay.style.left = r.left + 'px';
      overlay.style.top = r.top + 'px';
      overlay.style.width = r.width + 'px';
      overlay.style.height = r.height + 'px';
    });

    mask.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      var el = hoverTarget;
      if (!el) return;
      var existing = el.getAttribute('data-anno');
      if (existing) {
        stop();
        alert('\u5df2\u6807\u6ce8: ' + existing + '\uff0c\u8bf7\u70b9\u51fb\u89d2\u6807\u7f16\u8f91');
        return;
      }
      var createFn = window.__annoCreate;
      if (!createFn) {
        stop();
        alert('\u6807\u6ce8\u6a21\u5757\u672a\u52a0\u8f7d');
        return;
      }
      var key = autoGenKey();
      var ok = createFn(el, key, '\u65b0\u5efa\u6807\u6ce8');
      stop();
      if (ok) {
        alert('\u5df2\u6807\u6ce8 ' + key + '\uff0c\u8bf7\u70b9\u51fb\u89d2\u6807\u7f16\u8f91');
      } else {
        alert('\u7f16\u53f7 ' + key + ' \u5df2\u5b58\u5728');
      }
    });

    document.addEventListener('keydown', onEsc);
  }

  function onEsc(e) {
    if (e.key === 'Escape') stop();
  }

  function stop() {
    if (!mask) return;
    mask.remove();
    mask = null;
    hoverTarget = null;
    var overlay = document.getElementById('anno-inspector-highlight');
    if (overlay) overlay.remove();
    document.removeEventListener('keydown', onEsc);
  }

  window.__annoInspector = { start: start, stop: stop };
})();
