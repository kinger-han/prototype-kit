# 原型截图 + 微信交付配方（2026-08-28 实测）

触发：用户明确要求"截图发我/发微信"（组件化增量修改默认不截图，见 SKILL.md「浏览器验证作用域」）。

## 为什么用 headless 而不是交互式浏览器
browser-use harness 首次连接需要用户在 Chrome 手动批准远程调试授权弹窗（且可能连续弹两次）。用户不在电脑前或要快时是纯等待。headless 截图零交互直出图，适合"改完即发"的交付流。

## 步骤

### 1. 生成带引导脚本的临时副本
临时副本的真正用途是**注入自动操作脚本**（点菜单→勾选→开弹窗），不是路径问题。在 `</body>` 前插入：

```html
<script>window.addEventListener('load',function(){setTimeout(function(){
  // 按文本找菜单项并点击（进目标页）
  var hit=null;document.querySelectorAll('[id^="menu"]').forEach(function(el){if(el.textContent.indexOf('未命中问题')>=0)hit=el;});if(hit)hit.click();
  setTimeout(function(){
    // 演示状态操作，按需组合：
    var m=document.getElementById('missCheckAll');if(m){m.checked=true;toggleAllMissChecks(m);}  // 全选
    // openBatchSupplement();  // 开弹窗态
  },600);},400);});</script>
```

每个演示状态出一个副本（列表态/弹窗态/确认态），一次批量出图。

### 2. Edge headless 截图
路径：`C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe`（本机无 Chrome）

```
msedge --headless=new --disable-gpu --window-size=1920,937 --virtual-time-budget=6000 --hide-scrollbars --screenshot=<abs.png> "file:///<abs.html>"
```

- 成功判据：exit 0 且 png > 20KB
- `--virtual-time-budget=6000` 给引导脚本里的 setTimeout 留足时间
- execute_code + subprocess 跑，循环出多张

### 3. 发送前亲眼验收
vision_analyze 逐项核对（勾选状态/按钮/弹窗文案/数字逻辑如"忽略N条跳过X条"），确认无误再发。

### 4. 微信发送（gateway iLink bot 通道）
```bash
export PYTHONPATH="D:/HermesData/hermes-agent;D:/HermesData/hermes-agent/venv/Lib/site-packages"
hermes.exe send -t weixin "文字说明"            # 文字
hermes.exe send -t weixin "MEDIA:C:/abs/path.png"  # 图片走 MEDIA: 协议
```
- **没有 `-m` 参数**，图片必须写进消息文本的 `MEDIA:<绝对路径>`
- 文字和图片分多条发，每条成功输出 `Sent to weixin home channel`
