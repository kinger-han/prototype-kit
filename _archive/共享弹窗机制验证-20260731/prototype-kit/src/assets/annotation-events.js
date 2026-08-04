  function closeTip(){if(openTip){openTip.remove();openTip=null}}
  function updateCount(){var btn=document.getElementById('anno-count');if(!btn)return;
  var total=Object.keys(items).length,cur=0;
  document.querySelectorAll('.anno-badge').forEach(function(b){if(b.style.display!=='none')cur++});
  btn.textContent='\u6807\u6ce8 ('+cur+'/'+total+')'}

  document.addEventListener('mouseover',function(e){var b=e.target.closest('.anno-badge');if(b)showTip(b.dataset.annoKey)});
  document.addEventListener('click',function(e){
  var b=e.target.closest('.anno-badge');if(b){e.stopPropagation();showTip(b.dataset.annoKey);return}
  if(openTip&&!e.target.closest('.anno-tooltip'))closeTip()});
  window.addEventListener('scroll',function(){document.querySelectorAll('.anno-badge').forEach(function(b){
  var t=document.querySelector('[data-anno="'+b.dataset.annoKey+'"]');if(t)posBadge(b,t)})});
  document.addEventListener('page-changed',function(){setTimeout(function(){renderBadges();updateCount()},100)});

  window.addEventListener('load',function(){
  autoConnect().then(function(){
  setTimeout(renderBadges,100);
  setTimeout(function(){
  var bar=document.createElement('div');bar.className='anno-toolbar';
  bar.innerHTML='<span class="anno-mode-tag '+(fileHandle?'':'readonly')+'">'+(fileHandle?'\u5df2\u8fde\u63a5':'\u672a\u8fde\u63a5')+'</span>'
  +(fileHandle?'<button id="anno-edit-toggle">\u7f16\u8f91\u6a21\u5f0f</button>':'<button id="anno-connect">\u8fde\u63a5\u76ee\u5f55</button>')
  +'<button id="anno-add">\u65b0\u589e</button>'
  +'<button id="anno-pick">\u9009\u62e9\u5143\u7d20</button>'
  +'<button id="anno-toggle">\u9690\u85cf\u6807\u6ce8</button>'
  +'<button id="anno-count">\u6807\u6ce8 (0/0)</button>';
  document.documentElement.appendChild(bar);var vis=true;
  document.getElementById('anno-toggle').onclick=function(e){vis=!vis;
  document.querySelectorAll('.anno-badge').forEach(function(b){b.style.display=vis?'flex':'none'});
  if(!vis)closeTip();e.target.textContent=vis?'\u9690\u85cf\u6807\u6ce8':'\u663e\u793a\u6807\u6ce8'};
  var ebtn=document.getElementById('anno-edit-toggle');
  if(ebtn)ebtn.onclick=function(){editing=!editing;ebtn.textContent=editing?'\u9000\u51fa\u7f16\u8f91':'\u7f16\u8f91\u6a21\u5f0f'};
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
})();
