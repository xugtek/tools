# xugtek Tools

面向开发者和普通用户的轻量在线工具站，纯静态站点，生产环境为 <https://tools.xugtek.com>（GitHub Pages 托管，Netlify CDN 加速）。

当前包含：

- **Token 费用计算器**（`token/index.html` 中文 · `token/en.html` 英文）——估算每日/每月 Token API 调用费用，内置 26 款主流大模型官方价格（2026-10-01 更新），支持人民币/美元双币种独立计价、缓存命中计费、优惠倍率、用量估算与自定义模型。
- **大模型性价比排行榜**（`llm-rank/index.html` 中文 · `llm-rank/en.html` 英文）——基于 Artificial Analysis 独立实测三基准（Terminal-Bench 4.0 / HLE / AutomationBench）计算 26 款大模型的智能密度与每元智能（含每任务 Token 消耗），双币种排名，静态表格可按列重排。

## 特性

- 纯静态站点，无构建步骤，原生 HTML/CSS/JavaScript（ES Modules）
- 中英双语为**六套静态页面**（`/`、`/en/`、`/token/`、`/token/en.html`、`/llm-rank/`、`/llm-rank/en.html`），URL 与语言一一对应；首次访问按浏览器语言做会话级适配，显式切换语言后以所选 URL 为准
- 模型价格独立于代码，存放于 `token_models.json`，缺失币种按汇率补算，官方双币定价各自独立
- 结果区支持人民币/美元双币同时展示、明细拆分与"固定到对比"
- 计算器页含静态价格总表（26 款模型，带行锚点）、底部 FAQ 与 `FAQPage` 结构化数据
- 排行榜页含静态排名表（智能指数条形图）、方法论与 `WebPage`/`BreadcrumbList`/`FAQPage` 结构化数据
- 明暗主题切换，视觉风格与 [xugtek.com](https://xugtek.com) 对齐
- 核心计算逻辑与 UI 分离，便于单元测试
- 基础 SEO：`robots.txt`、`sitemap.xml`、canonical、hreflang、OG/Twitter 标签

## 技术栈

- 原生 HTML5 / CSS3（CSS 变量 + Grid/Flex）
- 原生 JavaScript ES Modules（无框架、无构建工具）
- Node.js 内置测试运行器（`node --test`）
- GitHub Pages 静态托管，Netlify 作为 CDN 加速（`_redirects` 提供旧路径 301）

## 目录结构

```text
.
├── index.html                 # 工具导航首页（zh）
├── en/
│   └── index.html             # 工具导航首页（en）
├── token/
│   ├── index.html             # Token 费用计算器（zh）
│   └── en.html                # Token 费用计算器（en）
├── llm-rank/
│   ├── index.html             # 大模型性价比排行榜（zh）
│   └── en.html                # 大模型性价比排行榜（en）
├── token_models.json          # 模型价格数据（每 M Tokens）
├── llm_metrics.json           # 排行榜数据（基准分/速度/Token 消耗）
├── robots.txt                 # 搜索引擎 / AI 爬虫策略
├── sitemap.xml                # 站点地图（6 个 URL，含 hreflang）
├── _redirects                 # Netlify 旧路径 301 规则
├── LICENSE                    # AGPL-3.0
├── AGENT.md                   # 项目原则与开发准则
├── doc/
│   └── token_calc.md          # Token 计算器设计与开发总结
├── assets/
│   ├── css/style.css          # 全局样式（主题变量）
│   ├── icons/brand.svg        # 品牌图标
│   └── js/
│       ├── i18n.js            # 双语词典与语言检测/切换
│       ├── theme.js           # 明暗主题
│       ├── site.js            # 站点初始化（主题/i18n/年份）
│       ├── index-app.js       # 首页逻辑
│       ├── token-calc-core.js # 费用计算核心（纯函数）
│       ├── token-calc-app.js  # 计算器 UI 逻辑
│       ├── llm-rank-core.js   # 排行榜计算核心（纯函数）
│       └── llm-rank-app.js    # 排行榜 UI 逻辑（排序/币种切换）
└── tests/
    ├── token-calc.test.js     # 费用计算单元测试
    └── llm-rank.test.js       # 排行榜计算单元测试
```

## 本地运行

项目是纯静态站点，直接用任意静态服务器打开即可：

```bash
# 方式一：Python
python3 -m http.server 8080

# 方式二：Node
npx serve .
```

然后访问 <http://localhost:8080>。

## 测试

```bash
npm test
```

使用 Node.js 内置测试运行器执行 `tests/*.test.js`，覆盖：

- 费用计算（普通输入 / 缓存输入 / 输出 / 优惠倍率）
- 双币种官方价格独立解析与仅缺失侧换算
- 价格草稿保留与币种切换（不往返换算）
- 百分比归一化（1% 不等于 100%）
- 默认 AI 编程场景估算（缓存命中 90%、输出比例 5%）
- 货币换算、金额 / Token 格式化
- 排行榜智能指数均值、智能密度、每任务成本与每元智能
- 排行榜排序稳定性与缺失值下沉、数值自适应格式化

## 开发指南

开发流程遵循 [AGENT.md](./AGENT.md)：

- 功能或修复基于 `main` 新建分支
- 提交信息使用对应工具前缀（如 `[token_calc]`、`[seo]`）
- JS 改动必须有测试
- HTML / CSS 改动由人工验证
- 页面不放敏感信息，UI 保持原生轻量

## 部署

站点源码托管于 GitHub Pages，Netlify 作为 CDN 加速层：

1. 将代码推送至 `main` 分支，在仓库 Settings → Pages 选择 `Deploy from a branch`（`main` / root）
2. 在 Netlify 为同一仓库创建站点（无构建步骤，直接发布），自定义域名 `tools.xugtek.com` 绑定 Netlify 并在 DNS 添加对应记录
3. 旧路径重写/301 规则维护在根目录 `_redirects`（Netlify 读取）
4. 域名变更后同步更新 `sitemap.xml`、canonical、hreflang 与 OG 中的 URL（当前为 `https://tools.xugtek.com`）

## SEO / GEO

已包含基础技术 SEO：

- `robots.txt`：允许主流搜索引擎与 AI 爬虫（GPTBot、PerplexityBot、ClaudeBot、Google-Extended 等），并声明 sitemap
- `sitemap.xml`：4 个 URL，中英互为 `hreflang` alternate（zh-CN / en / x-default）
- 每页含 `canonical`、`hreflang`、描述与 OG/Twitter 标签；计算器页含 `WebApplication` + `BreadcrumbList` + `FAQPage` 结构化数据
- 中英文页各有独立静态正文（价格总表、FAQ），以内容差异而非 URL 区分翻译对页

> 语言适配发生在会话首帧（同 URL 内切换不改变 URL 归属），切换语言为真实链接导航，避免爬虫自动重定向。

## 许可

项目采用 **GNU Affero General Public License v3.0（AGPL-3.0）**，版权人：`xugtek`，完整文本见 [LICENSE](./LICENSE)。
