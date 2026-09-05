# 我的技术博客

基于 **Astro** 的个人博客，自动部署到 **GitHub Pages**。

## 本地开发

```bash
npm install
npm run dev        # http://localhost:4321/astro-blog/
npm run build      # 构建静态站点到 dist/，并用 Pagefind 生成搜索索引
npm run preview    # 本地预览构建产物
```

> 搜索索引只在 `npm run build` 后存在；dev 模式下搜索页会显示提示。

## 写新文章

在 `src/content/blog/` 新建 `.md` 或 `.mdx` 文件（frontmatter 由 `src/content.config.ts` 的 zod schema 校验，写错字段构建时会报错）：

```markdown
---
title: '文章标题'
description: '简介'
pubDate: '2026-08-24'
updatedDate: '2026-09-01'   # 可选：显示“更新于”
tags: ['ESP32', 'AI']       # 可选：自动生成 /tags/<tag>/ 页面
heroImage: '../assets/xx.jpg' # 可选：首图 + OG 分享图
draft: true                 # 可选：草稿，生产构建中隐藏
featured: true              # 可选：置顶到博客列表顶部
---

正文内容（支持 Markdown / MDX）
```

## 站点结构

| 路由 | 说明 |
| --- | --- |
| `/` | 手绘风首页 |
| `/blog/` | 文章列表（`featured` 置顶 + 卡片悬停展开） |
| `/blog/<slug>/` | 文章页（TOC 目录、阅读进度条、相关推荐、JSON-LD） |
| `/tags/`、`/tags/<tag>/` | 标签聚合（页脚“主题”列自动取热门标签） |
| `/archive/` | 按年份归档 |
| `/search/` | Pagefind 全文搜索（纯静态，无后端） |
| `/links/` | 友链 |
| `/about/` | 关于（时间线） |
| `/rss.xml` | RSS（含标签分类、中文语言标记） |
| `/404` | 手绘风 404 |

## 架构要点

- **内容管道**：Content Collections（`src/content.config.ts`）+ `src/utils/posts.ts` 共享工具（排序/阅读时长/相关文章/标签统计），全部页面走 `getCollection()`。
- **布局**：`src/layouts/BaseLayout.astro` 统一 `<head>`/Header/Footer，页面只填内容。
- **中文字体**：Atkinson（拉丁）+ PingFang SC / Microsoft YaHei 回退栈，配置在 `astro.config.mjs`。
- **部署**：`.github/workflows/deploy.yml`，push 到 main 自动构建发布。

## 部署到 GitHub Pages

### 1. 创建 GitHub 仓库

在 GitHub 新建仓库（如 `astro-blog`），然后：

```bash
git init
git add .
git commit -m "init blog"
git branch -M main
git remote add origin https://github.com/<你的用户名>/<仓库名>.git
git push -u origin main
```

### 2. 修改站点地址（重要）

编辑 `astro.config.mjs`：

```js
site: 'https://<你的用户名>.github.io',
base: '/<仓库名>/',
```

同时更新 `public/robots.txt` 里的 Sitemap 地址。

### 3. 开启 GitHub Pages

仓库 → **Settings → Pages** → Source 选 **GitHub Actions**。

之后每次 `git push`，GitHub Actions 自动构建并发布，地址：
`https://<你的用户名>.github.io/<仓库名>/`

## 目录

```
src/content/blog/    # 文章（Markdown/MDX，schema 校验）
src/content.config.ts # 集合定义（zod schema）
src/utils/posts.ts   # 文章共享工具（排序/阅读时长/相关/标签）
src/layouts/         # BaseLayout（页面骨架）
src/components/      # Header / Footer / BaseHead 等
src/pages/           # 路由（blog/tags/archive/search/links/about/404）
public/              # 静态资源（robots.txt、favicon）
.github/workflows/   # GitHub Actions 部署
```
