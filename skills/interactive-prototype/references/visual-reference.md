# 视觉参考（Visual Reference）

> 本文件记录**本机/当前项目**的视觉风格参考偏好。不属于通用 interactive-prototype 协议；
> 通用 Skill 协议如需视觉参考，只写"先给参考再动手"，具体参考源看本文件。
> 适用：用户要求"视觉风格类改动"（配色/高亮/整体观感）时。

## 用户偏好（2026-08-10 确认）

**视觉风格类改动先给在线参考 demo 再动手**，不要直接改：
- 用户说"看看网上做好的页面"时，先给 Ant Design 系在线参考让用户确认方向
- 用户要"完整 UI 风格"时给**整站 demo**，不要只给单组件页（只给组件页会被纠正"我要的是完整的UI那种风格，不只是下拉框"）

## 参考源（国内可访问，实测 200）

| 用途 | 地址 |
|---|---|
| 整站风格（推荐主参考） | `https://preview.pro.ant.design/`（Ant Design Pro 演示站） |
| 组件总览 | `https://ant.design/components/overview-cn/` |
| Select 专项 | `https://ant.design/components/select-cn/` |
| 配色规范 | `https://ant.design/docs/spec/colors-cn` |

## 澄清话术

用户质疑"AntD 是组件库、我做的是 HTML，不一样吧"→ 澄清：参考的是**视觉风格**（颜色/间距/圆角/组件长相），用纯 HTML/CSS 手写即可，不引入任何库；`tokens.css` 本身就是 AntD5 语义色板。

## 配色偏好（用户确认，2026-08-10）

- 主色：`#1677ff`（AntD5 标准蓝）
- 下拉/级联选项 hover：浅蓝 `#e6f4ff`；选中：`#1677ff`
- 不接受灰色 hover（`#f5f6f8`）——用户明确说"不如蓝色好看"
