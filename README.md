# xugtek Tools

面向开发者和普通用户的轻量在线工具站，托管于 GitHub Pages，公开仓库。

当前包含：

- **Token 费用计算器**（`token.html`）——估算每日/每月 Token API 调用费用，支持人民币/美元、缓存命中、输出比例估算与自定义模型。

## 特性

- 纯静态站点，无构建步骤，原生 HTML/CSS/JavaScript（ES Modules）
- 中英双语（i18n），前端切换语言，无需多套 HTML
- 明暗主题切换，视觉风格与 [xugtek.com](https://xugtek.com) 对齐
- 模型价格数据独立于代码，存放于 `token_models.json`，便于维护
- 核心计算逻辑与 UI 分离，便于单元测试
- 内置 SEO / GEO 基础优化（`robots.txt`、`sitemap.xml`、canonical、hreflang）

## 技术栈

- 原生 HTML5 / CSS3（CSS 变量 + Grid/Flex）
- 原生 JavaScript ES Modules（无框架、无构建工具）
- Node.js 内置测试运行器（`node --test`）
- GitHub Pages 静态托管

## 目录结构

```text
.
├── index.html                 # 工具导航首页
├── token.html                 # Token 费用计算器页面
├── token_models.json          # 模型价格数据（每 M Tokens）
├── robots.txt                 # 搜索引擎 / AI 爬虫策略
├── sitemap.xml                # 站点地图
├── AGENT.md                   # 项目原则与开发准则
├── doc/
│   └── token_calc.md          # Token 计算器设计与开发总结
├── assets/
│   ├── css/style.css          # 全局样式（主题变量）
│   ├── icons/brand.svg        # 品牌图标
│   └── js/
│       ├── i18n.js            # 中英文翻译与语言切换
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
- 百分比归一化（1% 不等于 100%）
- 默认 AI 编程场景估算（缓存命中 90%、输出比例 5%）
- 货币换算
- 金额 / Token 格式化

## 开发指南

开发流程遵循 [AGENT.md](./AGENT.md)：

- 功能或修复基于 `main` 新建 `feature/*` 分支
- 提交信息使用对应工具前缀（如 `[token_calc]`）
- JS 改动必须有测试
- HTML / CSS 改动由人工验证

## 部署

项目面向 GitHub Pages：

1. 在 GitHub 创建公开仓库，并将代码推送至 `main` 分支
2. 在仓库 Settings → Pages 中选择 `Deploy from a branch`，分支选 `main`，目录选 `/（root）`
3. 如使用自定义域名 `tool.xugtek.com`，在仓库 Settings → Pages 中填写 Custom domain，并在 DNS 添加对应记录

部署后建议：

- 在 GitHub Pages 设置中开启 HTTPS
- 根据实际域名更新 `sitemap.xml`、canonical 与 hreflang 中的 URL（当前为 `https://tool.xugtek.com`）

## SEO / GEO

项目已包含基础技术 SEO：

- `robots.txt`：允许主流搜索引擎与 AI 爬虫（GPTBot、PerplexityBot、ClaudeBot、Google-Extended 等）
- `sitemap.xml`：列出首页与计算器页面
- 每个页面包含 `canonical` 与 `hreflang`（zh-CN / en / x-default）

> 注意：站点语言由前端 JS 切换，中英文共用同一 URL，因此 hreflang 指向同一地址。

## 许可

项目采用 **GNU Affero General Public License v3.0（AGPL-3.0）**，版权人：`xugtek`。

> 说明：LICENSE 文件应包含 AGPL-3.0 官方完整文本。建议在 GitHub 创建仓库时通过 "Add a license" 选择 AGPL-3.0 自动生成官方文本，或从 <https://www.gnu.org/licenses/agpl-3.0.txt> 获取后放入仓库根目录。
