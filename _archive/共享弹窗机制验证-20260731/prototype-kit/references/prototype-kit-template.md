# Prototype Kit 模板

组件化原型开发工具包，解决单文件 HTML 原型的 token 浪费问题。

## 位置
`D:\hpy\文档\ObsidianVault\06-资源\模板\prototype-kit\`

## 两种使用模式

### 引用模式（推荐）
项目文件在外部（如 `D:\hpy\桌面\数熙相关文档\<项目名>\`），只存业务文件，引用全局 kit 构建。

**项目结构：**
```
<项目名>/
├── README.md              # 项目进展与汇总（AI 主动维护）
├── docs/                  # PRD 及业务资料（只读）
└── prototype/
    ├── proto-config.json  # 项目配置（含 template 字段）
    ├── pages/             # 页面组件源码（AI 读写这里）
    └── dist/              # 构建产物（只读，不修改）
```

**构建命令：**
```bash
python D:/hpy/文档/ObsidianVault/06-资源/模板/prototype-kit/build.py --project-path="D:/hpy/桌面/数熙相关文档/客户审核"
python D:/hpy/文档/ObsidianVault/06-资源/模板/prototype-kit/build.py pc --project-path="..."
python D:/hpy/文档/ObsidianVault/06-资源/模板/prototype-kit/build.py mobile --project-path="..."
```

### 内嵌模式（兼容旧用法）
项目直接放在 kit 的 `src/platforms/<name>/` 下。构建时指定 `--platform=<name>`。

```bash
python build.py pc --platform=zhirong
python build.py mobile
python build.py all
```

输出到 `dist/pc-<platform>.html` 和 `dist/mobile.html`。

---

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

### template 字段说明
| template 值 | 对应 shell 文件 | 用途 |
|-------------|----------------|------|
| `pc` | `src/shells/shell-pc.html` | 智融平台等 PC 端后台 |
| `mobile` | `src/shells/shell-mobile.html` | 移动端（手机壳+文档区） |
| `pc-sys2` | `src/shells/shell-pc-sys2.html` | 其他 PC 系统（按需新增） |

新增 shell：在 `src/shells/` 下放入 `shell-{template}.html`，config.json 的 `template` 字段填对应名称即可。

---

## 核心文件

| 文件 | 用途 | 修改频率 |
|------|------|----------|
| `build.py` | 构建脚本，拼装组件为单 HTML | 极少 |
| `src/assets/base.css` | 全局样式（按钮、卡片、表格、弹窗、布局） | 极少 |
| `src/assets/base.js` | hash 路由 + 工具函数 | 极少 |
| `src/assets/mock-data.js` | MOCK 对象，所有演示数据 | 按项目 |
| `src/shells/` | 系统外壳模板（各系统 UI 框架） | 按需新增 |
| `src/platforms/*/pages/` | 内嵌模式的页面组件 | 频繁 |
| `<项目>/prototype/pages/` | 引用模式的页面组件 | 频繁 |

## base.js 提供的工具函数

| 函数 | 用途 |
|------|------|
| `navigateTo(pageId)` | hash 路由切换页面 |
| `renderList(containerId, items, renderItem)` | 列表渲染 |
| `renderTable(containerId, columns, rows)` | 表格渲染 |
| `showModal(title, bodyHtml, onConfirm)` | 弹窗 |
| `showToast(msg, duration)` | Toast 提示 |
| `mockRequest(data, delay)` | 模拟异步请求 |
| `initTabBar()` | 移动端 Tab 栏初始化 |

## 页面激活回调

路由切换到页面时自动调用 `init_xxx()` 函数（xxx = 页面 ID，连字符替换为下划线）。
例如页面 ID 为 `page-dashboard`，激活时调用 `init_dashboard()`。
