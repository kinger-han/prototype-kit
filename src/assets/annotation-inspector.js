/**
 * annotation-inspector.js — 巡检模式（全屏遮罩物理拦截）
 * 事件只挂在遮罩上，移除遮罩=彻底清除拦截
 */
(function () {
  var mask = null;
  var hoverTarget = null;

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
      stop();
      if (!el) return;
      alert('你选中了元素：' + el.tagName + (el.id ? '#' + el.id : '') + (el.className ? '.' + el.className.split(' ')[0] : ''));
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
