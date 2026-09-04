# 移动端 Shell（全面屏居中，2026-09-01 确立为模板级标准）

## 何时用

用户说"不要模板那个左手机右文档的评审视图"、"正中间显示手机原型"、"全面屏无刘海"、"模拟正常手机样子"、"按 XX 机型比例"、"扫码进来的 H5 页面" 时。

**2026-09-01 起模板级 `src/shells/shell-mobile.html` 本身就是全面屏居中壳**（旧 review-shell 左手机+右文档布局已删除）——新项目首次构建自动复制到项目，**无需再自定壳**；只有需要改机型比例/状态栏/壳外观时才动项目副本。业务 CSS 仍全量放项目 shell（组件内 style 被构建丢弃）。

## 完整实现（component 模式，业务 CSS 全量放项目 shell）

### 1. 直接使用模板（或按需拷贝微调）
模板已内置全面屏壳，新项目无需拷贝。如需改机型比例（默认小米17 = 2656x1220 → 360 × 783.6px）或壳外观：
```bash
cp prototype-kit/src/shells/shell-mobile.html 项目/prototype/shell-mobile.html
```
⚠️ 前置：build.py 的 `build_mobile` 曾漏传 project_path 导致项目 shell 永远不被读（已修）。若项目 shell 不生效先验证 build.py 是否带 project_path。

### 2. 替换"移动端专用样式"块（review-shell 全删）
```css
html, body { height: 100%; }
body {
  font-family: -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif;
  background: #EFEAE0;
  display: flex; align-items: center; justify-content: center;
  padding: 12px; min-height: 100vh;
}
/* 严格按真实机型比例：小米17 = 2656x1220 → 360 × 783.6px */
.mobile-shell {
  width: 360px; height: 783.6px;
  background: #1C1C1E; border-radius: 44px; padding: 8px;
  display: flex; flex-direction: column; position: relative;
}
.mobile-screen {
  flex: 1; min-height: 0; background: #fff; border-radius: 36px;
  overflow: hidden; display: flex; flex-direction: column; position: relative;
}
/* 低视口等比缩小保比例（用户 2.5K 175% 缩放一屏显示） */
@media (max-height: 830px) { .mobile-shell { zoom: 0.9; } }
@media (max-height: 750px) { .mobile-shell { zoom: 0.82; } }
@media (max-height: 680px) { .mobile-shell { zoom: 0.72; } }
/* 全面屏底部手势条 */
.home-indicator {
  height: 14px; display: flex; align-items: center; justify-content: center;
}
.home-indicator::after {
  content: ''; width: 110px; height: 4px; border-radius: 4px;
  background: rgba(0,0,0,0.22);
}
```

### 3. 状态栏（仿真信号区，SVG 不依赖图标库）
```html
<div class="status-bar">
  <span class="sb-left">10:24</span>
  <span class="sb-right">
    <!-- 信号：4 根竖条 -->
    <svg width="17" height="11" viewBox="0 0 17 11" fill="none">
      <rect x="0" y="7" width="3" height="4" rx="0.8" fill="#1a1a1a"/>
      <rect x="4.6" y="5" width="3" height="6" rx="0.8" fill="#1a1a1a"/>
      <rect x="9.2" y="2.5" width="3" height="8.5" rx="0.8" fill="#1a1a1a"/>
      <rect x="13.8" y="0" width="3" height="11" rx="0.8" fill="#1a1a1a" opacity="0.25"/>
    </svg>
    <!-- WiFi -->
    <svg width="15" height="11" viewBox="0 0 15 11" fill="none">
      <path d="M1.2 3.4a9.4 9.4 0 0112.6 0" stroke="#1a1a1a" stroke-width="1.6" stroke-linecap="round"/>
      <path d="M3.6 5.9a5.9 5.9 0 017.8 0" stroke="#1a1a1a" stroke-width="1.6" stroke-linecap="round"/>
      <circle cx="7.5" cy="9" r="1.6" fill="#1a1a1a"/>
    </svg>
    <!-- 电池 -->
    <svg width="24" height="12" viewBox="0 0 24 12" fill="none">
      <rect x="0.5" y="0.5" width="20" height="11" rx="3" stroke="#1a1a1a" stroke-width="1"/>
      <rect x="2" y="2" width="14.5" height="8" rx="1.6" fill="#1a1a1a"/>
      <path d="M22.5 4v4a2 2 0 000-4z" fill="#1a1a1a"/>
    </svg>
  </span>
</div>
```
CSS：
```css
.status-bar {
  height: 46px; display: flex; align-items: center; justify-content: space-between;
  padding: 0 28px; flex-shrink: 0; z-index: 5; background: transparent;
}
.status-bar .sb-left { font-size: 15px; font-weight: 600; color: #1a1a1a; }
.status-bar .sb-right { display: flex; align-items: center; gap: 7px; }
.status-bar svg { display: block; }
```

### 4. 页面容器/骨架（删掉 review-doc-area）
```html
<div class="mobile-shell">
  <div class="mobile-screen">
    <div class="status-bar">…上文 SVG…</div>
    <div class="app-root" id="app-root">
      <!-- 组件 page div 注入处 -->
    </div>
    <div class="home-indicator"></div>
  </div>
</div>
```
⚠️ **不要**在 shell 里保留 `<!-- build.py 生成 -->` 占位符 → 页码导航按钮不注入（用户不要底部那排"首页/拍照/…"）。base.js 对 `.page-nav-btn` 的查询是容错的，删了无碍。

⚠️ 底部 tab-bar 由 proto-config `.tabBar` 注入（模板已含 `<nav class="tab-bar" id="tab-bar">` + `<!-- build.py 根据 config.json 生成 -->` 占位符）；流程型 H5 无底部导航时给 `tabBar: []`。模板壳含 home-indicator 手势条。

### 5. 尾部路由初始化
```html
<script>
  document.addEventListener('DOMContentLoaded', function() {
    window.PLATFORM = 'mobile';
    ProtoRouter.init('{{DEFAULT_PAGE}}');   // 2026-09-01 起 build_mobile 会替换该占位符（default_page=首个组件 id）
  });
</script>
```

### 6. 业务 CSS 放哪
组件页内 `<style>` 会被 build 丢弃 → 所有业务样式放项目 shell 的独立 `<style>` 块（在"移动端专用样式"后面加一个 `<style>` 块即可，build 只认它自己的占位符，其余原样保留）。

## 验证清单（构建后）

```bash
grep -c "DEFAULT_PAGE" dist/*.html          # 应为 0（占位符已被替换）
grep -c "review-shell\|dynamic-island" dist/*.html  # 应为 0（旧评审布局/刘海）
grep -c "page-nav-btn\"" dist/*.html        # 应为 0（无页码导航按钮）
node --check <提取的js>                        # JS 语法
```
div 平衡、12 页组件（或实际页数）、`ProtoRouter.init('{{DEFAULT_PAGE}}')` 已替换为真实页 id。

## 同一项目双端共存（2026-09-01）
- 页面分目录：`pages/mobile/` + `pages/pc/`（build.py `resolve_pages_dir` 优先读子目录，无则回退 `pages/`）
- `proto-config.json` 单一文件服务双端：`template: "pc"`（PC 用 shell-pc.html）+ `tabBar`（mobile 用 shell-mobile.html）
- 分别跑 `pc` 与 `mobile` 两个构建 target，dist 产物 `{name}-pc-原型.html` / `{name}-mobile-原型.html`
- **移动端全局浮层（toast/演示按钮/菜单）放 shell 内、页面 div 外**——放组件 div 内会随 `.page` 的 display:none 一起隐藏