# AGENT.md

本项目是一个定位为工具站的 Web 项目，注重 SEO，将来可能接入支付或广告。当前为起步阶段，暂不包含支付和广告。

## 项目原则

- 项目将托管到 GitHub Pages，并且是公开仓库：不要将作者的敏感信息放入 Web 页面源码中。
- 为了页面加载速度和 SEO：页面 UI 元素尽量使用原生 HTML/CSS，避免不必要的重型依赖。
- 需要做好明暗主题切换（light/dark mode）和多国语言（i18n）支持。

## 开发准则

- 每个具体的功能或修复需要创建新的分支。
- 完成一个完整模块的代码后要进行提交。
- 每个工具要有自己的提交前缀，例如 `[token_calc]`。
- JS 代码要有测试用例。
- HTML 和 CSS 由用户验证。

## Token 计算器数据约定（token_models.json）

- 每个模型的定价存于 `prices` 对象，key 为币种（`CNY` / `USD`），value 为 `{ input, cachedInput, output }`（单位：每 M Tokens）。
- 某币种若无官方定价（如 DeepSeek 仅 `CNY`），则缺失时按汇率从「语言原生币种」换算：中文界面原生币种为 `CNY`，英文界面为 `USD`。
- 页面顶部保留 `updated` 与 `note` 元信息。
