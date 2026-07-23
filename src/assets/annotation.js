(function () {
  var data = window.ANNO_DATA || {}; items = data.items || {};
  var openTip = null, fileHandle = null, rootDirHandle = null, editing = false;
  var DB = 'protokit-anno', STORE = 'dh';
  var TC = {page:'\u9875\u9762',button:'\u6309\u94ae',input:'\u8f93\u5165\u6846',list:'\u5217\u8868',modal:'\u5f39\u7a97',state:'\u72b6\u6001',linkage:'\u8054\u52a8',computed:'\u8ba1\u7b97'};

  function openDB(){return new Promise(function(r){var q=indexedDB.open(DB,1);q.onupgradeneeded=function(){q.result.createObjectStore(STORE)};q.onsuccess=function(){r(q.result)};q.onerror=function(){r(null)}})}
  function dbGet(k){return openDB().then(function(db){if(!db)return null;return new Promise(function(r){var t=db.transaction(STORE,'readonly');var q=t.objectStore(STORE).get(k);q.onsuccess=function(){r(q.result||null)};q.onerror=function(){r(null)}})})}
  function dbSet(k,v){return openDB().then(function(db){if(!db)return;return new Promise(function(r){var t=db.transaction(STORE,'readwrite');t.objectStore(STORE).put(v,k);t.oncomplete=function(){r()}})})}
  function getPK(){return data.projectKey||(document.title||'default').replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g,'-').substring(0,50)}

  async function autoConnect(){
    if(!('showDirectoryPicker' in window))return;
    var s=await dbGet(getPK());if(!s||!s.dirHandle)return;
    try{var p=await s.dirHandle.queryPermission({mode:'readwrite'});
    if(p==='granted'){rootDirHandle=s.dirHandle;await loadFromFile();return}
    if(p==='prompt'){rootDirHandle=s.dirHandle;return}}catch(e){}}

  async function pickDir(){
    try{var h=await window.showDirectoryPicker({mode:'readwrite'});
    rootDirHandle=h;await dbSet(getPK(),{dirHandle:h});await loadFromFile()}
    catch(e){if(e.name!=='AbortError')toast('\u9009\u62e9\u76ee\u5f55\u5931\u8d25')}}

  async function loadFromFile(){
    if(!rootDirHandle)return;
    try{var proto=await rootDirHandle.getDirectoryHandle('prototype');
    var anno=await proto.getDirectoryHandle('annotations');
    var fh=await anno.getFileHandle('annotations.yaml');fileHandle=fh;
    renderBadges();updateCount();toast('\u5df2\u8fde\u63a5\u6807\u6ce8\u6587\u4ef6')}
    catch(e){toast('\u8bfb\u53d6\u5931\u8d25: '+e.message)}}

  async function saveToFile(){
    if(!fileHandle)return;
    try{var w=await fileHandle.createWritable();
    var ls=["version: '1.0'",'items:'];var keys=Object.keys(items);
    for(var i=0;i<keys.length;i++){var k=keys[i],it=items[k];
    ls.push('  '+k+':');ls.push('    type: "'+(it.type||'')+'"');
    ls.push('    title: "'+(it.title||'')+'"');ls.push('    content: |');
    var cl=(it.content||'').split('\n');for(var j=0;j<cl.length;j++)ls.push('      '+cl[j])}
    await w.write(ls.join('\n'));await w.close();toast('\u5df2\u4fdd\u5b58')}
    catch(e){toast('\u4fdd\u5b58\u5931\u8d25: '+e.message)}}

  function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')}
  function toast(msg){var t=document.createElement('div');t.className='anno-toast';t.textContent=msg;
  document.documentElement.appendChild(t);requestAnimationFrame(function(){t.classList.add('show')});
  setTimeout(function(){t.classList.remove('show');setTimeout(function(){t.remove()},300)},2000)}
  function renderMd(md){var h=esc(md);h=h.replace(/^### (.+)$/gm,'<h3>$1</h3>');
  h=h.replace(/^## (.+)$/gm,'<h2>$1</h2>');h=h.replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>');
  h=h.replace(/^- (.+)$/gm,'<li>$1</li>');h=h.replace(/(<li>.*<\/li>\n?)+/g,function(m){return'<ul>'+m+'</ul>'});
  h=h.split('\n\n').map(function(p){return/^<(h2|h3|ul)/.test(p)?p:'<p>'+p+'</p>'}).join('');return h}

  function renderBadges(){document.querySelectorAll('.anno-badge').forEach(function(b){b.remove()});
  document.querySelectorAll('[data-anno]').forEach(function(el){
  var k=el.getAttribute('data-anno');if(!items[k]||el.offsetParent===null)return;
  var b=document.createElement('div');b.className='anno-badge';b.textContent=k.split('-').pop();
  b.title=items[k].title||k;b.dataset.annoKey=k;document.documentElement.appendChild(b);posBadge(b,el)})}
  function posBadge(b,t){var r=t.getBoundingClientRect();if(!r.width&&!r.height)return;
  b.style.display=(r.right>12&&r.left<innerWidth-12)?'flex':'none';
  b.style.top=(scrollY+r.top-8)+'px';b.style.left=(scrollX+r.right-12)+'px'}
  function showTip(key){closeTip();var it=items[key];if(!it)return;
  var badge=document.querySelector('.anno-badge[data-anno-key="'+key+'"]');if(!badge)return;
  var tip=document.createElement('div');tip.className='anno-tooltip';
  var eb=(fileHandle&&editing)?'<button class="anno-edit-btn">\u7f16\u8f91</button>':'';
  var db=(fileHandle&&editing)?'<button class="anno-delete-btn" style="color:#f56c6c">\u5220\u9664</button>':'';
  tip.innerHTML='<div class="anno-tooltip-header"><span class="anno-id-badge">'+esc(key)+'</span>'
  +'<span class="anno-tooltip-title">'+esc(it.title||key)+'</span>'
  +'<span class="anno-type-badge">'+(TC[it.type]||it.type||'')+'</span>'
  +'<div class="anno-tooltip-actions">'+eb+db+'<button class="anno-tooltip-close">\u2715</button></div></div>'
  +'<div class="anno-tooltip-body">'+renderMd(it.content||'')+'</div>';
  document.documentElement.appendChild(tip);
  var br=badge.getBoundingClientRect();tip.style.top=(scrollY+br.bottom+8)+'px';
  tip.style.left=(scrollX+br.left)+'px';
  if(scrollX+br.left+520>innerWidth)tip.style.left=(innerWidth-530)+'px';
  tip.querySelector('.anno-tooltip-close').onclick=function(e){e.stopPropagation();closeTip()};
  if(eb)tip.querySelector('.anno-edit-btn').onclick=function(){openEditor(key,tip)};
  if(db)tip.querySelector('.anno-delete-btn').onclick=function(){deleteAnn(key)};
  makeDraggable(tip);openTip=tip}
  function makeDraggable(el){var hdr=el.querySelector('.anno-tooltip-header');if(!hdr)return;
  var ox=0,oy=0,dragging=false;
  hdr.style.cursor='move';
  hdr.onmousedown=function(e){if(e.target.tagName==='BUTTON')return;dragging=true;
  ox=e.clientX-el.offsetLeft;oy=e.clientY-el.offsetTop;e.preventDefault()};
  document.onmousemove=function(e){if(!dragging)return;
  el.style.left=(e.clientX-ox)+'px';el.style.top=(e.clientY-oy)+'px';el.style.position='fixed'};
  document.onmouseup=function(){dragging=false}}

  function openEditor(key,tip){var it=items[key];if(!it)return;
  var body=tip.querySelector('.anno-tooltip-body');
  body.innerHTML='<div><label style="font-size:12px;color:#666">\u6807\u9898</label>'
  +'<input id="ed-title" value="'+esc(it.title||'')+'" style="width:100%;margin:4px 0;padding:4px;border:1px solid #ddd;border-radius:3px"></div>'
  +'<div><label style="font-size:12px;color:#666">\u7c7b\u578b</label>'
  +'<select id="ed-type" style="width:100%;margin:4px 0;padding:4px">'
  +['page','button','input','list','modal','state','linkage','computed'].map(function(t){
  return '<option value="'+t+'"'+(it.type===t?' selected':'')+'>'+(TC[t]||t)+' ('+t+')</option>'}).join('')
  +'</select></div>'
  +'<div><label style="font-size:12px;color:#666">\u5185\u5bb9 (Markdown)</label>'
  +'<textarea id="ed-content" style="width:100%;height:250px;margin:4px 0;padding:6px;font-family:monospace;font-size:12px;border:1px solid #ddd;border-radius:3px">'+esc(it.content||'')+'</textarea></div>'
  +'<div style="text-align:right;margin-top:8px">'
  +'<button id="ed-cancel" style="margin-right:8px;padding:4px 12px;border:1px solid #ddd;border-radius:3px;cursor:pointer">\u53d6\u6d88</button>'
  +'<button id="ed-save" style="padding:4px 12px;background:#1890ff;color:#fff;border:none;border-radius:3px;cursor:pointer">\u4fdd\u5b58</button></div>';
  tip.querySelector('#ed-cancel').onclick=function(){showTip(key)};
  tip.querySelector('#ed-save').onclick=async function(){
  items[key].title=tip.querySelector('#ed-title').value;
  items[key].type=tip.querySelector('#ed-type').value;
  items[key].content=tip.querySelector('#ed-content').value;
  await saveToFile();showTip(key);renderBadges()}}

  function deleteAnn(key){if(!confirm('\u786e\u8ba4\u5220\u9664 \u6807\u6ce8 "'+key+'" \uff1f'))return;
  delete items[key];saveToFile();closeTip();renderBadges();updateCount();toast('\u5df2\u5220\u9664 '+key)}

  function addAnn(){var key=prompt('\u6807\u6ce8\u7f16\u53f7\uff08\u5982 venue-new\uff09\uff1a');
  if(!key||items[key]){if(items[key])toast('\u7f16\u53f7\u5df2\u5b58\u5728');return}
  var title=prompt('\u6807\u6ce8\u6807\u9898\uff1a');if(!title)return;
  items[key]={type:'button',title:title,content:'\u5f85\u586b\u5199'};
  saveToFile();renderBadges();updateCount();toast('\u5df2\u65b0\u589e '+key)}

  var pickMode=false,pickCallback=null;
  function startPick(cb){pickMode=true;pickCallback=cb;document.body.style.cursor='crosshair';
  toast('\u70b9\u51fb\u9875\u9762\u4e0a\u7684\u5143\u7d20\u8fdb\u884c\u6807\u6ce8');
  document.addEventListener('click',pickHandler,true)}
  function pickHandler(e){if(!pickMode)return;e.preventDefault();e.stopPropagation();
  var el=e.target;document.removeEventListener('click',pickHandler,true);
  document.body.style.cursor='';pickMode=false;
  if(pickCallback)pickCallback(el)}
  function closeTip(){if(openTip){openTip.remove();openTip=null}}
  function updateCount(){var btn=document.getElementById('anno-count');if(!btn)return;
  var total=0,cur=0;
  document.querySelectorAll('.anno-badge').forEach(function(b){total++;if(b.style.display!=='none')cur++});
  btn.textContent='\u6807\u6ce8 ('+cur+'/'+total+')'}

  document.addEventListener('mouseover',function(e){var b=e.target.closest('.anno-badge');if(b)showTip(b.dataset.annoKey)});
  document.addEventListener('click',function(e){
  var b=e.target.closest('.anno-badge');if(b){e.stopPropagation();showTip(b.dataset.annoKey);return}
  if(openTip&&!e.target.closest('.anno-tooltip'))closeTip()});
  window.addEventListener('scroll',function(){document.querySelectorAll('.anno-badge').forEach(function(b){
  var t=document.querySelector('[data-anno="'+b.dataset.annoKey+'"]');if(t)posBadge(b,t)})});
  document.addEventListener('page-changed',function(){setTimeout(function(){renderBadges();updateCount()},100)});
  document.addEventListener('tab-changed',function(){setTimeout(function(){renderBadges();updateCount()},100)});
  setTimeout(function(){var ca=document.querySelector('.content-area');if(ca)ca.addEventListener('scroll',function(){document.querySelectorAll('.anno-badge').forEach(function(b){var t=document.querySelector('[data-anno="'+b.dataset.annoKey+'"]');if(t)posBadge(b,t)})})},500);

  window.addEventListener('load',function(){
  autoConnect().then(function(){
  setTimeout(renderBadges,100);
  setTimeout(function(){
  if(fileHandle) editing = true;
  var bar=document.createElement('div');bar.className='anno-toolbar';
  bar.innerHTML='<span class="anno-mode-tag '+(fileHandle?'':'readonly')+'">'+(fileHandle?'\u5df2\u8fde\u63a5':'\u672a\u8fde\u63a5')+'</span>'
  +(fileHandle?'':'<button id="anno-connect">\u8fde\u63a5\u76ee\u5f55</button>')
  +'<button id="anno-pick">\u65b0\u589e\u6807\u6ce8</button>'
  +'<button id="anno-toggle">\u9690\u85cf\u6807\u6ce8</button>'
  +'<button id="anno-count">\u6807\u6ce8 (0/0)</button>'
  +'<span class="anno-tab-icon">\u25c0</span>';
  document.documentElement.appendChild(bar);var vis=true;
  document.getElementById('anno-toggle').onclick=function(e){vis=!vis;
  document.querySelectorAll('.anno-badge').forEach(function(b){b.style.display=vis?'flex':'none'});
  if(!vis)closeTip();e.target.textContent=vis?'\u9690\u85cf\u6807\u6ce8':'\u663e\u793a\u6807\u6ce8'};
  var ticon=bar.querySelector('.anno-tab-icon');
  if(ticon)ticon.onclick=function(){bar.classList.toggle('expanded');ticon.textContent=bar.classList.contains('expanded')?'\u25b6':'\u25c0';};
  var cbtn=document.getElementById('anno-connect');
  if(cbtn)cbtn.onclick=function(){pickDir().then(function(){location.reload()})};
  var abtn=document.getElementById('anno-add');
  if(abtn)abtn.onclick=function(){
  var key=prompt('\u6807\u6ce8\u7f16\u53f7\uff08\u5982 venue-new\uff09\uff1a');
  if(!key||items[key]){if(items[key])toast('\u7f16\u53f7\u5df2\u5b58\u5728');return}
  var title=prompt('\u6807\u6ce8\u6807\u9898\uff1a');if(!title)return;
  items[key]={type:'button',title:title,content:'\u5f85\u586b\u5199'};
  saveToFile();renderBadges();updateCount();toast('\u5df2\u65b0\u589e '+key)};
  var pbtn=document.getElementById('anno-pick');
  if(pbtn)pbtn.onclick=function(){
  startPick(function(el){
  var existing=el.getAttribute('data-anno');
  if(existing){showTip(existing);return}
  var key=prompt('\u65b0\u6807\u6ce8\u7f16\u53f7\uff08\u5982 user-new\uff09\uff1a');
  if(!key||items[key]){if(items[key])toast('\u7f16\u53f7\u5df2\u5b58\u5728');return}
  var title=prompt('\u6807\u6ce8\u6807\u9898\uff1a');if(!title)return;
  el.setAttribute('data-anno',key);
  items[key]={type:'button',title:title,content:'\u5f85\u586b\u5199'};
  saveToFile();renderBadges();updateCount();toast('\u5df2\u6807\u6ce8 '+el.tagName+' > '+key)})};
  updateCount();window.refreshAnnotations=function(){renderBadges();updateCount()}},200)})
})

// ===== 巡检模式专用 API 暴露 =====
window.__annoItems = items;
window.__annoCreate = function(el, key, title) {
  if (items[key]) return false;
  el.setAttribute('data-anno', key);
  items[key] = {type:'button', title: title || '\u65b0\u5efa\u6807\u6ce8', content:'\u5f85\u586b\u5199'};
  saveToFile();
  renderBadges();
  updateCount();
  return true;
};
// ================================

})(); 
// === Inspector: 全局事件委托 ===
document.addEventListener('click', function(e) {
  if (e.target && e.target.id === 'anno-pick') {
    e.preventDefault();
    e.stopPropagation();
    if (window.__annoInspector) { window.__annoInspector.start(); } else { alert('\u5de1\u68c0\u6a21\u5757\u672a\u52a0\u8f7d'); }
  }
}, true);