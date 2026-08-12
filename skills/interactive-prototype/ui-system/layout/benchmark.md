# Layout Benchmark（布局回归测试）

> 每次 Layout Engine / Pattern / Critic 修改后运行。
> 每个 Case 生成页面 → Critic 检查 → 记录 Score 与问题。
> 目标：证明系统能"根据内容结构和空间条件自动选择合理布局"，且修改不破坏已有能力。

---

## 1. Case 列表

| # | Case | Page Model 关键参数 | 预期 Layout Variant |
|---|---|---|---|
| 1 | 16:9 海报详情 | media-detail / image / 16:9 / metadata medium / short | landscape-preview-wide（split-64） |
| 2 | 9:16 海报详情 | media-detail / image / 9:16 / metadata medium / short | portrait-preview-narrow（split-38） |
| 3 | 1:1 图片详情 | media-detail / image / 1:1 / metadata small / short | square-balanced（split-50） |
| 4 | 横版视频详情 | media-detail / video / 16:9 / metadata large / short | landscape-preview-wide + panel-scroll |
| 5 | 竖版视频详情 | media-detail / video / 9:16 / metadata medium / long | portrait-preview-narrow + 长标题修正 |
| 6 | Metadata 很少 | media-detail / image / 16:9 / metadata small / short | landscape-preview-wide，右侧留白正常 |
| 7 | Metadata 很多 | media-detail / image / 16:9 / metadata large / short | landscape-preview-wide + panel-scroll |
| 8 | 标题很长 | media-detail / image / 16:9 / metadata medium / long | split-70（preview 加宽） |
| 9 | Preview 很大 | media-detail / image / wide 21:9 / metadata medium / short | landscape-preview-wide（max-height 约束生效） |
| 10 | Preview 不可用 | media-detail / image / unavailable / metadata large / short | metadata-only（单列 placeholder） |

## 2. 每个 Case 的检查项

- [ ] 是否存在大面积无意义空白（excessive_empty_space）
- [ ] 是否存在明显区域失衡（density_imbalance / height_imbalance）
- [ ] 是否存在异常 gap（excessive_gap）
- [ ] 是否保持视觉层级（weak_hierarchy）
- [ ] 是否保持响应式安全（responsive_safety：缩到 1100px 单列不破版）
- [ ] 是否出现组件之间关系断裂（weak_visual_grouping）

## 3. 记录格式

```jsonc
{
  "case": 1,
  "name": "16:9 海报详情",
  "variant_actual": "landscape-preview-wide",
  "issues": [],
  "score": { "total": 0.87, "breakdown": { "space_efficiency": 0.9, "density_balance": 0.85, "alignment": 0.95, "visual_hierarchy": 0.9, "composition": 0.85, "responsive_safety": 0.9 } },
  "passed": true
}
```

## 4. 通过标准

- 10 个 Case 全部 Score ≥ 0.8
- 无 high severity 问题
- 每个问题有证据（数值），不是主观描述
- 修正 ≤ 2 轮

## 5. 回归基线（修改前先记录）

- 首次运行时先记录当前 Layout Engine 的基线 Score（即使有失败项），作为后续回归对比。

## 6. 分层（Phase 3A 起）

- **Structural Benchmark**：验证 Schema / Planner / Renderer 是否正确（layout-planner.py，结构正确性）
- **Visual Content Benchmark**：验证真实内容进入后页面是否仍好看（content-benchmark.py + content/fixtures/*.json，真实内容 + DOM/视觉验证）
- 两者分开跑，不混在一起。

