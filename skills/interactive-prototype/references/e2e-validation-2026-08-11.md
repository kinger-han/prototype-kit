# Skill E2E Validation — 2026-08-11（冷库温控 ColdChain 测试任务）

> 用途：SKILL.md 第 2 章单 HTML Pipeline 全流程（Step 1-12）E2E 验证记录。
> 测试任务为全新虚构业务（冷库温控监测平台），未使用任何已有 fixture/页面作为答案。
> 基线：ui-system 70 文件、content-benchmark.py、layout-planner.py、SKILL.md 全程零修改（md5 一致），新增文件全在 `layout-benchmark/e2e-validation/`。

## 测试范围
- PC + Mobile（375/390/430）双端 × media-detail + list 两个模板 = 4 个渲染产物
- 覆盖项：长标题（29字 > 24）、空字段（责任人/实时温度）、多标签（6个）、媒体区域（16:9）、Mobile Card Mode（list mobile）
- Runtime：`content-benchmark.py build_page()` + `layout-planner.py plan()`（未假设 render.py/benchmark.py 存在）

## 验证结果摘要
| 项 | 结果 |
|---|---|
| Mode Router + Step 1-9/11 | ✅ 完整跑通 |
| Planner 决策 | ✅ 16:9 + long title → split-70 自动升档；list mobile card_mode=true |
| verify-output.py | ⚠️ 6✅ 3❌（契约冲突，见 P1-B） |
| Critic Score | 0.78 < 0.8（visual_hierarchy 0.65 / responsive_safety 0.55 拉低） |
| Mobile Card Mode | ✅ 三档无横滚、无表格压缩（tableCount=0）、层级正确、卡片自适应 312/327/367px |
| 架构越权 | ✅ 零越权（ui-system / Runtime / SKILL.md 全等） |

## 缺陷清单（2026-08-11 更新：P1 已在 SKILL.md 修复，P2 留 backlog）

> 第二轮处理结果：P1-A 与 P1-B 已在 SKILL.md 层面修复（Step 10 加 Layer/根因判断 + STOP&REPORT 分支；verify-output 作用域限定组件化 Pipeline、单 HTML 走 2.5.1 验证链）。P2 两项未修，按用户指示记录不扩大 Skill。修复后回归：Regression A（Runtime Defect Routing）✅、Regression B（verify-output Scope）✅。

### P1-A Fix 闭环无法处理 Runtime 渲染层缺陷
- 现象：Mobile 375/390/430 三档长标题竖排（`.ui-page-header-title` rect 375 下 39×702px，29字一字一行）
- 根因：content-benchmark.py page_header 渲染 `display:flex;align-items:center` 容器内标题 span 无 `flex-shrink:0`/`min-width:0`，窄视口 flex-shrink 压到 min-content=单字宽 → 竖排。PC 无此问题（容器宽足够）
- 影响：Skill Step 10 Fix 只允许改 Directive/Content/渲染参数，禁止改 Template/Theme/Component/Runtime → 该缺陷无合法修正路径，只能停止报告
- 建议：SKILL.md Step 10 增加"Runtime 层缺陷 → 停止并报告，不进入 Fix 循环"分支；planner 增加 Mobile 长标题策略

### P1-B verify-output.py 与单 HTML Pipeline 指令冲突
- verify-output.py 检查"无外部 JS 依赖"，但 SKILL.md 2.5 组装清单明确要求 Lucide/ECharts CDN → 单 HTML 产物必然 3 项❌（无外部JS / 页面容器 proto-page / 侧边栏）
- 根因：verify-output.py 面向 build.py 组件化产物，单 HTML 用 `layout-page`/`ui-*` 类无 proto-page
- 建议：明确 verify-output 适用范围（组件化模式），或为单 HTML 提供独立检查脚本

### P2-A content-schema 声明 status 类型但 Runtime 不渲染
- content-schema.json column type 支持 `status`，但 content-benchmark.py PC table 分支只处理 `tag`/`money`/`action` → `status` 走默认纯文本无 tag 着色
- 证据：list-pc 状态列 td innerHTML=`待处理` 无 ui-tag 包裹
- 建议：补 Runtime table 分支支持 status，或从 schema 移除该类型

### P2-B Mobile stack 布局长标题无专项策略
- planner.md 只有 PC split 的 long-title→split-70 refinement，Mobile stack 布局无对应规则
- 建议：planner 增加 Mobile long-title 处理（max-width + 允许换行 2 行）

## 复现命令
```bash
# 渲染 4 页面（驱动脚本见 layout-benchmark/e2e-validation/run_render.py）
cd D:/hpy/桌面/日常临时会话/layout-benchmark
D:/HermesData/hermes-agent/venv/Scripts/python.exe e2e-validation/run_render.py

# verify-output
D:/HermesData/hermes-agent/venv/Scripts/python.exe \
  D:/HermesData/skills/product-management/interactive-prototype/scripts/verify-output.py \
  e2e-validation/out/coldchain-md-pc.html
```

## 技巧（本会话实测）
- **file:// 下 iframe 跨文件 contentDocument 访问被浏览器拒绝**（`NO_ACCESS`）→ 改用 srcdoc 属性内联目标 HTML（同源继承）即可读取；生成器：read_file 去行号 → html.escape → 塞进 srcdoc
- **iframe 模拟器 CSS 禁写 `iframe{width:100%}`**（覆盖 width 属性使 375/390/430 三档全部变 1202px 失效）
- Mobile 三档验证：iframe width=375/390/430 + srcdoc 内联；PC 直接 browser_navigate
- 长标题/空字段/多标签验证以 DOM 实测为准（scrollWidth/clientWidth、getBoundingClientRect、querySelector 计数），截图仅作视觉确认
- 架构越权检查：测试前 `find . -type f | xargs md5sum` 存基线，测试后 diff；Runtime/SKILL 单独 md5 -c
