/* ============================
   base.js - ProtoKit 运行时引擎
   ProtoRouter + ProtoAnno + ProtoDoc
   ============================ */

// ---- 路由引擎 ----
var ProtoRouter = {
  currentPage: null,
  defaultPage: null,

  init: function(defaultPage) {
    this.defaultPage = defaultPage || '';
    window.addEventListener('hashchange', this.render.bind(this));
    this.render();
  },

  render: function() {
    var hash = window.location.hash || '#/' + this.defaultPage;
    var pageId = hash.replace('#/', '').replace('#', '');

    // 销毁旧页面
    if (this.currentPage && typeof window['destroy_' + this.currentPage.replace(/-/g, '_')] === 'function') {
      window['destroy_' + this.currentPage.replace(/-/g, '_')]();
    }

    // 隐藏所有页面
    document.querySelectorAll('.page').forEach(function(p) { p.classList.remove('active'); });

    // 显示目标页面
    var target = document.getElementById('page-' + pageId);
    if (target) {
      target.classList.add('active');
      this.currentPage = pageId;

      // 调用初始化
      var fnName = 'init_' + pageId.replace(/-/g, '_');
      if (typeof window[fnName] === 'function') {
        window[fnName]();
      }

      // 更新菜单高亮
      document.querySelectorAll('.pc-menu-item').forEach(function(item) {
        item.classList.toggle('active', item.getAttribute('data-page') === pageId);
      });

      // 更新移动端 Tab
      document.querySelectorAll('.tab-bar-item').forEach(function(tab) {
        tab.classList.toggle('active', tab.getAttribute('data-page') === pageId);
      });

      // 更新面包屑
      var bc = document.getElementById('breadcrumb-current');
      if (bc) bc.textContent = pageId;

      // 更新页码导航
      document.querySelectorAll('.page-nav-btn').forEach(function(btn) {
        btn.classList.toggle('active', btn.getAttribute('data-page') === pageId);
      });

      // 文档联动
      ProtoDoc.trigger('page-load', pageId);

      // 渲染标注
      ProtoAnno.render();

      // 更新 hash
      if (location.hash !== '#/' + pageId) {
        history.replaceState(null, '', '#/' + pageId);
      }
    }
  },

  go: function(pageId) {
    window.location.hash = '#/' + pageId;
  }
};

// ---- 标注引擎 ----
var ProtoAnno = {
  visible: true,

  render: function() {
    if (!this.visible) return;
    document.querySelectorAll('[data-anno-id]').forEach(function(el) {
      if (el.querySelector('.anno-badge')) return;
      var id = el.getAttribute('data-anno-id');
      var badge = document.createElement('span');
      badge.className = 'anno-badge';
      badge.textContent = id;
      badge.onclick = function(e) {
        e.stopPropagation();
        if (window.PLATFORM === 'mobile') {
          ProtoDoc.trigger('anno:' + id, ProtoRouter.currentPage);
        } else {
          ProtoAnno.showPopover(el, id);
        }
      };
      el.appendChild(badge);
    });
  },

  toggle: function() {
    this.visible = !this.visible;
    document.querySelectorAll('.anno-badge').forEach(function(b) {
      b.style.display = ProtoAnno.visible ? 'flex' : 'none';
    });
  },

  showPopover: function(el, id) {
    var title = el.getAttribute('data-anno-title') || id;
    var desc = el.getAttribute('data-anno-desc') || '暂无说明';
    var container = document.getElementById('anno-popover-container');
    if (!container) return;

    var rect = el.getBoundingClientRect();
    container.innerHTML =
      '<div style="position:fixed;top:' + (rect.bottom + 8) + 'px;left:' + rect.left +
      'px;background:#fff;border-radius:8px;padding:16px;box-shadow:0 4px 16px rgba(0,0,0,0.15);' +
      'z-index:10001;min-width:240px;max-width:360px;">' +
      '<div style="font-weight:600;margin-bottom:8px;">' + title + '</div>' +
      '<div style="font-size:13px;color:#666;line-height:1.6;">' + desc + '</div>' +
      '<div style="text-align:right;margin-top:12px;">' +
      '<button class="btn btn-sm btn-default" onclick="document.getElementById(\'anno-popover-container\').innerHTML=\'\'">关闭</button>' +
      '</div></div>';

    setTimeout(function() {
      document.addEventListener('click', function handler() {
        container.innerHTML = '';
        document.removeEventListener('click', handler);
      });
    }, 100);
  }
};

// ---- 文档联动引擎 ----
var ProtoDoc = {
  storagePrefix: 'proto_doc_',

  trigger: function(eventId, pageId) {
    var panel = document.getElementById('doc-panel');
    if (!panel) return;

    // 查找对应 doc-section
    var sections = document.querySelectorAll('.doc-section[data-trigger]');
    var matched = null;
    sections.forEach(function(s) {
      if (s.getAttribute('data-trigger') === eventId) matched = s;
    });

    // 移动端：高亮对应 doc-card
    if (pageId) {
      document.querySelectorAll('.doc-card').forEach(function(card) {
        card.classList.toggle('highlight', card.getAttribute('data-page') === pageId);
      });
      var docCard = document.querySelector('.doc-card[data-page="' + pageId + '"]');
      if (docCard) {
        panel.innerHTML = docCard.innerHTML;
        return;
      }
    }

    if (matched) {
      var saved = localStorage.getItem(this.storagePrefix + eventId);
      panel.innerHTML = saved || matched.innerHTML;
      panel.setAttribute('data-current-trigger', eventId);
    }
  },

  save: function() {
    var panel = document.getElementById('doc-panel');
    var eventId = panel.getAttribute('data-current-trigger');
    if (eventId) {
      localStorage.setItem(this.storagePrefix + eventId, panel.innerHTML);
      showToast('保存成功');
    }
  },

  reset: function() {
    var panel = document.getElementById('doc-panel');
    var eventId = panel.getAttribute('data-current-trigger');
    if (eventId) {
      localStorage.removeItem(this.storagePrefix + eventId);
      this.trigger(eventId);
      showToast('已重置');
    }
  }
};

// ---- 工具函数 ----
function renderList(containerId, items, renderItem) {
  var container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = items.map(renderItem).join('');
}

function renderTable(containerId, columns, rows) {
  var container = document.getElementById(containerId);
  if (!container) return;
  var html = '<table class="table"><thead><tr>';
  columns.forEach(function(col) { html += '<th>' + col.label + '</th>'; });
  html += '</tr></thead><tbody>';
  rows.forEach(function(row) {
    html += '<tr>';
    columns.forEach(function(col) { html += '<td>' + (row[col.key] !== undefined ? row[col.key] : '') + '</td>'; });
    html += '</tr>';
  });
  html += '</tbody></table>';
  container.innerHTML = html;
}

function showModal(title, bodyHtml, onConfirm) {
  var overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML =
    '<div class="modal"><div class="modal-title">' + title + '</div>' +
    '<div class="modal-body">' + bodyHtml + '</div>' +
    '<div class="modal-footer"><button class="btn btn-default" onclick="this.closest(\'.modal-overlay\').remove()">取消</button>' +
    '<button class="btn btn-primary" id="modal-confirm-btn">确定</button></div></div>';
  document.body.appendChild(overlay);
  overlay.querySelector('#modal-confirm-btn').onclick = function() {
    document.body.removeChild(overlay);
    if (typeof onConfirm === 'function') onConfirm();
  };
}

function showToast(msg, duration) {
  duration = duration || 2000;
  var toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = msg;
  document.body.appendChild(toast);
  setTimeout(function() {
    toast.style.opacity = '0';
    setTimeout(function() { document.body.removeChild(toast); }, 300);
  }, duration);
}

function mockRequest(data, delay) {
  delay = delay || 300;
  return new Promise(function(resolve) { setTimeout(function() { resolve(data); }, delay); });
}
