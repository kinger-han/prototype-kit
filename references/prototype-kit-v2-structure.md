# ProtoKit v2 目录结构速查

## 全局工具包结构
```
prototype-kit/                          # 全局核心库（不复制，只引用）
├── build.py                            # 构建引擎（支持 --project-path）
├── src/
│   ├── shells/                         # 系统外壳模板库
│   │   ├── shell-pc.html               # PC端外壳（用户定稿模板，不可改）
│   │   ├── shell-mobile.html           # 移动端外壳（含手机壳+文档区）
│   │   └── shell-pc-sys2.html          # 其他系统外壳（按需新增）
│   ├── assets/                         # 全局资产（定稿后极少改）
│   │   ├── base.css                    # 全局样式
│   │   ├── base.js                     # ProtoRouter + ProtoAnno + ProtoDoc
│   │   └── mock-data.js                # MOCK 数据
│   ├── platforms/                      # 内嵌模式的项目（兼容旧用法）
│   │   ├── zhirong/                    # 智融平台
│   │   └── doyou-guide/               # 智能导游（预留）
│   └── mobile/                         # 内嵌模式的移动端
│       ├── config.json
│       └── pages/
├── dist/                               # 内嵌模式的构建产物
└── docs/
```

**引用模式的项目目录**（推荐）：
```
D:\hpy\桌面\数熙相关文档\<项目名>\
├── build.bat                       # 一键构建（调 kit 的 build.py）
├── README.md                         # AI 主动维护的项目控制台
├── docs/                             # PRD 及业务资料（只读）
└── prototype/
    ├── proto-config.json             # {"name":"...","template":"pc",...}
    ├── pages/                        # 页面组件（AI 读写这里）
    │   ├── 01-login.html
    │   └── 02-user-list.html
    └── dist/                         # 构建产物（只读，不修改）
```

## proto-config.json 格式
```json
{
  "name": "客户审核",
  "template": "pc",
  "logo": "客",
  "theme": {
    "primaryColor": "#1890ff",
    "layout": "side-top"
  },
  "menu": [
    {
      "group": "审核管理",
      "icon": "📋",
      "items": [
        {"id": "login", "title": "登录"},
        {"id": "audit-list", "title": "审核列表"}
      ]
    }
  ]
}
```

**template 字段** → 映射到 `src/shells/shell-{template}.html`

## 构建命令（引用模式）
```bash
# 推荐：项目根目录双击 build.bat
# 备用：直接调 kit
python <kit>/build.py --project-path="<项目根目录>"
python <kit>/build.py pc --project-path="<项目根目录>"
python <kit>/build.py mobile --project-path="<项目根目录>"
```

## 构建命令（内嵌模式，兼容）
```bash
python build.py pc --platform=zhirong
python build.py mobile
python build.py all
```

## PC 端 shell 模板规则
- shell-pc.html 是用户的**定稿模板**，严禁修改结构/样式/JS
- 新页面注入到模板的 `content-area` 区域
- 页面组件的 CSS 类名必须匹配模板已有类名（.filter-btn, .table-card, .badge-status, .action-btn 等）
- 菜单由 shell 模板自带，config.json 的 menu 字段供参考

## PC 端构建流程（build.py 内部步骤）
1. 读取 shell-pc.html（用户原封不动的模板）
2. 扫描 pages/*.html → 解析 PAGE_META + page HTML + script
3. 在 content-area 的 `<!-- build.py 注入页面 -->` 注释处注入 proto-page divs
4. **包装原模板的 switchPage 函数**：
   - 保存原函数：`var _origSwitchPage = switchPage;`
   - 新函数：先调用原函数（保留面包屑），再调用 protoShowPage()（切换页面显隐）
   - 生成 title→pageId 映射表（从 PAGE_META 提取），让 switchPage 能找到对应的 proto-page
5. 注入页面组件脚本
6. 输出 dist/ 产物

## 移动端构建流程
1. 读取 shell-mobile.html
2. 替换 `{{PRIMARY_COLOR}}` 从 config.json
3. 注入 base.css / base.js / mock-data.js
4. 扫描 pages/*.html → 注入页面 + Tab + 文档卡片 + 页码导航
5. 输出 dist/ 产物

## 组件解析规则
1. `PAGE_META: {...}` → 页面元数据（id, title）
2. `<template class="doc">` → 文档卡片内容
3. `<div class="page">` → 页面容器
4. `<script>` → 脚本（init_xxx 函数）

## shell-pc.html 可用的 CSS 类名速查
- 布局: `.layout`, `.sidebar`, `.main-area`, `.content-area`
- 导航: `.top-nav`, `.breadcrumb`, `.menu-item`, `.menu-group-title`, `.sub-menu`
- 筛选: `.filter-bar`, `.filter-item`, `.filter-label`, `.filter-select`, `.filter-input`, `.filter-btn`, `.filter-btn.primary`
- 表格: `.table-card`, `.table-toolbar`, `.toolbar-btn`, `.toolbar-search`
- 数据: `.badge-status.active`, `.badge-status.disabled`
- 分页: `.pagination`, `.page-info`, `.page-btns`, `.page-btn`
- 操作: `.action-btn`, `.action-btn.danger`
- 弹窗: `.modal-overlay`, `.modal`, `.modal-header`, `.modal-body`, `.modal-close`
- 页面标题: `.page-header`, `.page-title`, `.page-title .sub`
