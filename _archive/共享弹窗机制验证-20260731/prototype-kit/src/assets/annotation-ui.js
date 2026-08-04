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
