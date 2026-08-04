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
