# 原型说明规范 V3（Prototype Specification）

## 两条元原则

1. **附着原则**：标注必须附着于视觉元素，解释看不见的东西。
   无法依附于 UI 元素的信息，不进 annotation，应进 systemSpec / API 文档 / 数据字典。

2. **可消费原则**：每个字段都必须有明确的消费者（开发/AI/测试/构建器）。
   不能被消费成代码、用例或校验规则的字段，不进 Spec。

## 判断是否需要标注

① 页面能直接表达吗？ → 能 → 不标
② 存在多种理解吗？ → 不存在 → 不标
③ 开发/AI 猜会出错吗？ → 不会 → 不标

**一句话：看得出来的不写，看不出来的必须写。**

## 核心结构

每条标注由三部分组成：
- **身份与状态**：type / title / page / status / scope
- **跨类型能力**：permission / dependsOn / constraints
- **类型化骨架**：spec（结构随 type 变化）
- **契约**：done（可断言的验收标准）

## status 状态机

```
draft（草稿）── 人工确认 ──→ confirmed（已确认）
                                    │
                          需求变更 / DOM变动
                                    ↓
                              todo（待定义）
```

- **confirmed**：可开发。AI 生成最终代码，done 必须全部满足。
- **draft**：AI 生成代码但加 TODO 注释，不生成测试。
- **todo**：AI 只生成占位，不实现功能。

## scope 范围

- **v1**（一期）/ **v2**（二期）/ **future**（远期）/ **never**（不做）
- 构建时按 scope 过滤，future/never 的功能 AI 不生成。

## 标注 key 命名规则

每个页面独立编号，从 `01` 开始，key 加页面前缀：

| 页面 | key 格式 | 示例 |
|------|----------|------|
| 用户管理 | `user-XX` | user-01, user-02 |
| 场馆管理 | `venue-XX` | venue-01, venue-02 |
| 知识库管理 | `kb-XX` | kb-01, kb-02 |
| 未命中统计 | `miss-XX` | miss-01, miss-02 |
| 会话记录 | `log-XX` | log-01, log-02 |

弹窗/组件级标注用语义命名：`kb-detail`, `merge-modal`, `faqFormModal` 等。

## 与 data-anno 的关系

```
annotations.json 的 key  ←→  HTML 元素的 data-anno 属性
```

构建时校验：每条标注的 key 必须在 HTML 中有对应的 `data-anno` 元素，否则报错。
