# Token 费用计算器：设计与开发总结

本文档总结 `token.html`（Token 费用计算器）的设计思路、核心逻辑、数据结构、交互设计以及开发过程中的关键决策，作为项目的技术参考。

## 1. 工具概述

**Token 费用计算器** 帮助开发者估算使用各类 LLM API 时每日 / 每月的 Token 费用，核心能力：

- 预设多款主流模型价格，支持**手动编辑**（普通输入价、缓存输入价、输出价）
- 支持 **CNY / USD** 双币种计价与显示
- 在只知道「每日输入量」时，按比例**自动估算**缓存命中量与输出量
- 输出「每日 / 每月」费用，以及「普通输入 / 缓存命中 / 输出」三项明细

### 基本概念

- **M Tokens** = 100 万 tokens，所有用量与价格均以「每 M Tokens」为单位
- **缓存命中（cached input）**：命中缓存的那部分输入，价格通常远低于普通输入
- **普通输入（normal input）**：总输入中未命中缓存的部分，`普通输入 = 总输入 - 缓存命中`

## 2. 设计目标

1. **纯前端、零依赖、零构建**：静态托管于 GitHub Pages，保证加载快、SEO 友好
2. **计算与 UI 分离**：核心算法是纯函数（`token-calc-core.js`），可独立单元测试
3. **数据与代码分离**：模型价格独立存于 `token_models.json`，改价不动代码
4. **双语 + 主题**：中英 i18n 与明暗主题，与主站 xugtek.com 视觉一致
5. **兼顾精确与易读**：换算价格采用自适应小数精度，避免冗长小数

## 3. 代码架构

```
token-calc-core.js  计算核心（纯函数，无 DOM）
        ▲
        │ import
        │
token-calc-app.js   UI 逻辑（DOM 操作、事件、渲染）
        │
        ├── token_models.json  模型价格数据（fetch 加载）
        ├── i18n.js            文案 / 语言
        └── site.js            主题 / 初始化
```

- `token-calc-core.js`：`estimateDailyUsage`、`calculateMonthlyCost`、`convertCurrency`、`formatMoney`、`formatTokens`、`normalizeRate`、`toNonNegativeNumber`
- `token-calc-app.js`：模型选择、价格同步、用量估算、费用渲染、事件绑定

### 核心纯函数

**`estimateDailyUsage(input, { cacheHitRate, outputRatio })`**

当只知道每日输入总量时，按比例估算缓存命中量与输出量：

```
缓存命中 = 输入 × cacheHitRate%
输出     = 输入 × outputRatio%
```

默认值针对 **AI 编程（AI Coding）场景**：`cacheHitRate = 90%`、`outputRatio = 5%`。

**`calculateMonthlyCost(usage, model, { days = 30 })`**

按每日用量计算费用：

```
普通输入量 = 总输入 − 缓存命中量（clamp 到 [0, 总输入]）
普通输入费 = 普通输入 × 普通输入单价
缓存输入费 = 缓存命中 × 缓存单价
输出费     = 输出     × 输出单价
每日费用   = 普通输入费 + 缓存输入费 + 输出费
每月费用   = 每日费用 × days（默认 30 天）
```

**`normalizeRate(value)`**

把「百分比数值」归一化为小数：`value / 100`。

> 关键坑：曾把 `1` 误当成 100%，导致 1% 输出比例算成 100%。现固定 `÷100`，并加了回归测试 `1% ≠ 100%`。

**`roundAdaptive(value)`**（app 层）

换算币种后的单价按数量级自适应舍入，避免 `0.416666…` 这类冗长小数：

| 数值 | 保留小数位 |
|------|-----------|
| ≥ 100 | 0 位 |
| ≥ 10 | 1 位 |
| ≥ 1 | 2 位 |
| ≥ 0.1 | 3 位 |
| < 0.1 | 4 位 |

## 4. 数据模型（token_models.json）

### 结构

每个模型把「各币种价格」放在 `prices` 对象中：

```json
{
  "id": "kimi-k3",
  "name": "Kimi K3",
  "provider": "Moonshot",
  "prices": {
    "CNY": { "input": 20, "cachedInput": 2, "output": 100 },
    "USD": { "input": 3, "cachedInput": 0.3, "output": 15 }
  }
}
```

- 价格为「每 M Tokens」单价
- 有官方 USD 价的模型同时含 `CNY` 与 `USD`；无官方 USD 价的模型（如 DeepSeek）仅含 `CNY`
- 顶层保留 `updated` 与 `note` 元信息

### 4.2 币种与「语言原生币种」

- 模型的原生（base）币种由**界面语言**决定：中文 → `CNY`，英文 → `USD`
- 取价策略 `getModelPriceInCurrency`：
  1. 目标币种在 `prices` 中存在 → 直接取官方价
  2. 不存在 → 从「语言原生币种」（有则用，否则用 `prices` 首个币种）按汇率换算，并做自适应舍入
- 结果展示的 USD 费用优先使用官方 USD 价，其次按汇率换算

### 4.3 当前内置模型（2026-08-17 公开数据）

| 模型 | 币种 | 普通输入 | 缓存输入 | 输出 |
|------|------|---------|---------|------|
| Kimi K3 | CNY / USD | 20 / 3 | 2 / 0.3 | 100 / 15 |
| Qwen3.8 Max | CNY / USD | 12 / 2 | 1.5 / 0.25 | 36 / 6 |
| GLM-5.2 / GLM-5.3 | CNY / USD | 8 / 1.4 | 2 / 0.26 | 28 / 4.4 |
| DeepSeek V4 Flash（高峰） | CNY | 3 | 0.1 | 9 |
| DeepSeek V4 Flash（空闲） | CNY | 1.5 | 0.05 | 4.5 |
| DeepSeek V4 Pro（高峰） | CNY | 9 | 0.3 | 27 |
| DeepSeek V4 Pro（空闲） | CNY | 4.5 | 0.15 | 13.5 |

> 数据来自 2026-08-17 公开渠道，DeepSeek 高峰/空闲以独立条目表示（数据模型无档位选择器），上线前应核验官方最新价格。

## 5. 交互与 UI 设计

### 5.1 表单流程

1. 选择模型（或「自定义模型」）
2. 查看 / 编辑价格（每 M Tokens，普通输入 / 缓存输入 / 输出）
3. 选择计价币种（CNY / USD），切换时自动换算并同步价格输入
4. 填写每日用量（M Tokens）
5. 若缓存命中 / 输出留空，自动按比例估算（滑块可调）
6. 查看每日 / 每月费用与明细

### 5.2 估算的交互细节

- 缓存命中、输出**留空或为 0** 时才出现对应「估算设置」滑块
- 输入框 placeholder 实时显示估算出的数值（如 `≈ 0.9 M`）
- 缓存命中率滑块 `0–100%`，输出比例滑块 `0–100`（数值输入上限 1000，兼容输出大于输入的情形）
- 输出比例曾尝试非线性滑块以在小数值时更精细，最终按用户要求回退为 `0–100` 线性滑块

### 5.3 费用展示的演化与取舍

结果展示经历多轮迭代，最终形态：

- **每日 / 每月卡片**：单行显示 `¥12.34 / $1.71`（人民币与美元符号并列），替代早期的「大号人民币 + 小字美元」
- **费用明细**：合并「费用构成」与「用量明细」为一张表，每行两端对齐：
  - 左：标签（普通输入 / 缓存命中 / 输出）
  - 右：`0.7 M` 用量 + `¥2.34 / $0.35` 费用（仅符号区分币种）

明细曾尝试：

- 固定 flex `gap`：内容宽度不同导致行内不对齐
- 括号包裹费用：视觉仍显拥挤
- 最终改用 **`<table>` 布局**（`table-layout: auto`），标签列吃满剩余宽度，用量列、费用列按内容自适应且右对齐——既让 `M` 竖线对齐，又让费用与用量紧贴、长费用不溢出

### 5.4 语言与主题

- i18n：`data-i18n` 系列属性 + `i18n.js`，前端切换中英，无需多套 HTML
- 主题：`data-theme` 与 CSS 变量，`theme.js` 持久化到 localStorage
- 视觉：导航、卡片、表单、滑块、结果卡片均与 xugtek.com 对齐

## 6. 测试

`tests/token-calc.test.js` 使用 Node 内置测试运行器（`node --test`），覆盖：

1. 费用计算（普通 / 缓存 / 输出、每日 / 每月）
2. 缓存输入为空按 0 处理
3. 缓存输入上限 clamp 到总输入
4. 百分比估算（缓存 / 输出）
5. 百分比归一化（`1% → 0.01`）
6. 默认 AI 编程估算（90% / 5%）
7. 1% 与 5% 输出比例区分
8. 货币双向换算
9. 金额 / Token 格式化
10. 非法输入归零

```bash
npm test
```

> 注：当前测试针对**计算核心**（纯函数），HTML/CSS 由人工验证。

## 7. SEO / GEO 考量

- 页面使用语义化标签（`nav` / `main` / `section` / `h1`…）
- `robots.txt` 显式允许 AI 爬虫（GPTBot、PerplexityBot、ClaudeBot、Google-Extended 等）
- `sitemap.xml`、`canonical`、`hreflang` 齐备
- 单页多语言（前端切换）意味着中英文共用 URL，`hreflang` 指向同一地址

## 8. 后续改进方向

- 增加模型：持续跟进官方价格并更新 `token_models.json`
- 结构化数据：加入 JSON-LD（`WebApplication`、`FAQPage`）提升 AI 搜索摘录质量
- 更多币种 / 汇率自动获取
- 用量单位换算（tokens ↔ M tokens）
- 支持更多模型、batch/off-peak 档位选择器

## 9. 开发约定

- 计算核心改动须补充单元测试
- 数据改动只需更新 `token_models.json`
- HTML / CSS 改动需人工在浏览器验证
- 提交前缀统一 `[token_calc]`