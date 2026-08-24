# 我的技术博客

基于 **Astro** 的个人博客，自动部署到 **GitHub Pages**。

## 本地开发

```bash
npm install
npm run dev        # http://localhost:4321
```

## 写新文章

在 `src/content/blog/` 新建 `.md` 文件：

```markdown
---
title: '文章标题'
description: '简介'
pubDate: '2026-08-24'
---

正文内容（支持 Markdown / MDX）
```

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

### 3. 开启 GitHub Pages

仓库 → **Settings → Pages** → Source 选 **GitHub Actions**。

之后每次 `git push`，GitHub Actions 自动构建并发布，地址：
`https://<你的用户名>.github.io/<仓库名>/`

## 目录

```
src/content/blog/    # 文章（Markdown/MDX）
src/layouts/         # 布局
src/components/      # 组件
public/              # 静态资源
.github/workflows/   # GitHub Actions 部署
```
