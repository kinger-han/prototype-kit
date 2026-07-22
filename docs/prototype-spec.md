# 原型开发规范

## 目录结构

```
prototype-kit/
├── build.py           # 构建脚本：python build.py pc / mobile / all
├── src/
│   ├── base.css       # 全局样式（定稿后不改）
│   ├── base.js        # 全局路由+工具函数（定稿后不改）
│   ├── mock-data.js   # 演示数据（按需修改）
│   ├── pc/            # PC端页面组件
│   │   ├── 01-login.html
│   │   ├── 02-dashboard.html
│   │   └── 03-list.html
│   └── mobile/        # 移动端页面组件
│       ├── 01-home.html
│       ├── 02-chat.html
│       └── 03-mine.html
├── dist/              # 构建产物（自动生成）
│   ├── pc.html
│   └── mobile.html
└── docs/
    └── prototype-spec.md  # 本文件
```

## 核心原则

1. **编辑时拆开，演示时合并**
   - 修改只动单个组件文件，不碰其他
   - `build.py` 自动拼装成完整页面

2. **页面切换不跳标签页**
   - 通过 hash 路由（`#login`、`#dashboard`）切换
   - 全部在同一个浏览器标签页内完成

3. **演示数据集中管理**
   - 所有 mock 数据在 `src/mock-data.js`
   - 页面组件通过 `MOCK.xxx` 引用

## AI 交互规则

| 场景 | AI 只需读写 |
|------|------------|
| 改某个页面 | 对应的单个组件文件（100-200行） |
| 改演示数据 | `src/mock-data.js` |
| 改全局样式 | `src/base.css`（极少） |
| 新增页面 | 新建组件文件 + 编号 |

**禁止**：一次性读写整个工程、传完整 HTML、跨文件修改。

## 使用方式

```bash
# 构建 PC 端
python build.py pc

# 构建移动端
python build.py mobile

# 构建全部
python build.py all
```

构建后在 `dist/` 目录打开对应 HTML 即可演示。

## 组件文件规范

每个页面组件文件包含：
1. `<!-- page: xxx -->` 注释标记（build.py 用它识别页面 ID）
2. `<style>` 页面专属样式
3. `<div class="page" id="page-xxx">` 页面容器
4. `<script>` 页面专属交互逻辑

文件名用数字前缀排序：`01-xxx.html`、`02-xxx.html`。
