---
title: '把博客改成铅笔手绘风：Sketch Style 规范落地记'
description: '一份可以抄作业的 Sketch Style 实践记录：CSS 变量令牌、铅笔涂黑交互，以及规范里两处自相矛盾的解法'
pubDate: '2026-09-06'
tags: ['Design', 'CSS', 'Astro']
draft: true
---

这个站本来就是手绘风——但"看起来像"和"按规范做"是两回事。上周我拿到一份完整的 Sketch Style（铅笔手绘风）设计规范，索性把全站按它重做了一遍。这篇是实践记录：怎么落地、怎么取舍，以及规范自己打架时我怎么办。

## 规范说了什么

Sketch Style 的核心就四件事：

- **手工感**：线条不求完美对齐，元素保留轻微倾斜
- **纸张质感**：暖米色背景，禁止纯白
- **铅笔线条**：虚线或不规则边框，禁止光滑大圆角
- **素描阴影**：偏移的硬阴影，禁止发散的软阴影

硬规则也很明确：禁渐变、禁玻璃模糊、禁过于饱和的颜色、禁 uppercase 小字眉标、动效要短促直接。

## 第一步：把规范翻译成令牌

规范是用 Tailwind class 写的，但我的博客是 Astro + 原生 CSS 变量。引入 Tailwind 意味着重写全部页面，不值得。规范的灵魂其实是那些**值**——颜色、阴影、圆角——class 名只是载体。于是我把值抽出来，翻译进已有的变量体系：

```css
:root {
	--pencil: #2c2c2c; /* 铅笔灰主色 */
	--paper: #f5f0e8; /* 纸张米色 */
	--paper-dark: #e8e2d8; /* 深一号纸 */
	--border: rgba(44, 44, 44, 0.55);
	/* 铅笔偏移阴影，代替发散阴影 */
	--shadow-sketch: 2px 2px 0 rgba(44, 44, 44, 0.3);
	--shadow-sketch-hover: 2px 2px 0 rgba(44, 44, 44, 0.5);
	--radius: 4px; /* 手绘小圆角 */
}
```

所有页面只改变量引用，视觉一次切换。纸张纹理也不用图片，一段内联 SVG 噪点就够了：

```css
body {
	background-color: var(--bg-page);
	background-image: url("data:image/svg+xml,…feTurbulence 噪点，opacity 0.035…");
}
```

## 三类典型替换

**渐变 → 纸张**。首页原本有两条渐变光带，关于页时间线是渐变线，全部删掉：纸纹理由 body 全局提供，时间线改成虚线边框。

**扩散阴影 → 偏移阴影**。`0 8px 24px rgba(0,0,0,0.06)` 这类软阴影是"屏幕风"的标志，换成硬偏移之后立刻有了纸上投影的感觉。

**眉标 → 手写标注**。规范禁用 uppercase 小字眉标（tracked eyebrow），而我每个页面标题上方都有一个。改成衬线斜体加手绘波浪下划线，波浪线就是一段 SVG：

```css
.kicker::after {
	content: '';
	display: block;
	width: 76px;
	height: 7px;
	background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 76 7'%3E%3Cpath d='M2 3.5 Q 7 1, 12 3.5 T 22 3.5 …' fill='none' stroke='%23e74c3c' stroke-width='1.6'/%3E%3C/svg%3E")
		no-repeat center / contain;
}
```

## 交互：涂黑与压纸

规范要求 hover 短促直接，可以模拟铅笔涂黑；active 表现笔尖压纸的阻尼：

```css
.btn-ghost:hover {
	background: var(--pencil); /* 迅速涂黑 */
	color: var(--paper); /* 反白 */
	transform: rotate(-0.8deg); /* 轻微抖动 */
	transition: 150ms ease;
}
.btn:active {
	transform: translateY(1px) rotate(0.8deg);
}
```

150ms 是关键——超过 300ms 的平滑过渡会立刻让页面变回"后台管理系统"。

## 两处规范自相矛盾，和我的解法

**冲突一：规范用 Tailwind 写。**前面说了，值是灵魂，class 只是载体。用 CSS 变量承接这些值，规范照样落地，还保住了现有架构。反过来，如果项目本来就是 Tailwind 的，直接照抄 class 更省事。

**冲突二：规范要求 WCAG AA，但它的强调色不达标。**`#3498db` 在纸面上只有约 3:1 的对比度，`#e74c3c` 也只有 3.4:1，做正文链接和小说明文字都过不了 4.5:1 这关。我的解法是双轨制——**装饰用原色，文字用加深变体**：

```css
--accent: #3498db; /* 边框、波浪线、色块 */
--accent-text: #21618c; /* 链接、说明文字，约 5.9:1 */
--marker: #e74c3c; /* 红色装饰 */
--marker-text: #c0392b; /* 红色文字，约 4.8:1 */
```

这样既保住了规范的视觉气质，又满足它自己提出的无障碍要求。暗色模式同理，把强调色换成更亮的变体。

## 顺手抓到一个隐蔽的坑

Astro 的 scoped style 不会作用到子组件。我在 Header 里写的 `nav a { … }` 其实从来没有命中过导航链接——它们是 HeaderLink 子组件渲染的元素，样式必须写在组件自己身上。这次全站排查时才现形，顺手修掉了。如果你也在 Astro 里给子组件元素写"父组件样式"，大概率它没生效。

## 发版前自检

规范给了很长的清单，我把它压缩成四条 grep，机器能查的交给机器：

```bash
grep -rn "linear-gradient" src/             # 无渐变
grep -rn "border-radius: 999px" src/        # 无胶囊
grep -rn "box-shadow: 0 8px" src/           # 无扩散阴影
grep -rn "text-transform: uppercase" src/   # 无眉标
```

人眼只负责最后一个问题：**它看起来还像一本素描本吗？**

全站的色彩、按钮、字体现在汇总在[风格指南](/styleguide/)页面，改样式时先看那一页。
