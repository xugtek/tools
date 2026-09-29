# xugtek Tools

面向开发者和普通用户的轻量在线工具站，纯静态站点，生产环境为 <https://tools.xugtek.com>。

当前包含：

- **Token 费用计算器**（`token/index.html` 中文 · `token/en.html` 英文）——估算每日/每月 Token API 调用费用，内置 24 款主流大模型官方价格（2026-09-23 更新），支持人民币/美元双币种独立计价、缓存命中计费、用量估算与自定义模型。

## 特性

- 纯静态站点，无构建步骤，原生 HTML/CSS/JavaScript（ES Modules）
- 中英双语为**四套静态页面**（`/`、`/en/`、`/token/`、`/token/en.html`），URL 与语言一一对应；首次访问按浏览器语言做会话级适配，显式切换语言后以所选 URL 为准
- 模型价格独立于代码，存放于 `token_models.json`，缺失币种按汇率补算，官方双币定价各自独立
- 结果区支持人民币/美元双币同时展示、明细拆分与"固定到对比"
- 计算器页含静态价格总表（24 款模型，带行锚点）、底部 FAQ 与 `FAQPage` 结构化数据
- 明暗主题切换，视觉风格与 [xugtek.com](https://xugtek.com) 对齐
- 核心计算逻辑与 UI 分离，便于单元测试
- 基础 SEO：`robots.txt`、`sitemap.xml`、canonical、hreflang、OG/Twitter 标签

## 技术栈

- 原生 HTML5 / CSS3（CSS 变量 + Grid/Flex）
- 原生 JavaScript ES Modules（无框架、无构建工具）
- Node.js 内置测试运行器（`node --test`）
- Netlify 静态托管（`_redirects` 提供旧路径 301）

## 目录结构

```text
.
├── index.html                 # 工具导航首页（zh）
├── en/
│   └── index.html             # 工具导航首页（en）
├── token/
│   ├── index.html             # Token 费用计算器（zh）
│   └── en.html                # Token 费用计算器（en）
├── token_models.json          # 模型价格数据（每 M Tokens）
├── robots.txt                 # 搜索引擎 / AI 爬虫策略
├── sitemap.xml                # 站点地图（4 个 URL，含 hreflang）
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
│       ├── token-calc-core.js # 计算核心（纯函数）
│       └── token-calc-app.js  # 计算器 UI 逻辑
└── tests/
    └── token-calc.test.js     # 核心计算单元测试
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

- 费用计算（普通输入 / 缓存输入 / 输出）
- 双币种官方价格独立解析与仅缺失侧换算
- 价格草稿保留与币种切换（不往返换算）
- 百分比归一化（1% 不等于 100%）
- 默认 AI 编程场景估算（缓存命中 90%、输出比例 5%）
- 货币换算、金额 / Token 格式化

## 开发指南

开发流程遵循 [AGENT.md](./AGENT.md)：

- 功能或修复基于 `main` 新建分支
- 提交信息使用对应工具前缀（如 `[token_calc]`、`[seo]`）
- JS 改动必须有测试
- HTML / CSS 改动由人工验证
- 页面不放敏感信息，UI 保持原生轻量

## 部署

项目托管于 Netlify：

1. 推送 `main` 分支，Netlify 自动构建（无构建步骤，直接发布）
2. 自定义域名 `tools.xugtek.com` 在 Netlify 站点设置中绑定并配置 DNS
3. 旧路径重写/301 规则维护在根目录 `_redirects`
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
