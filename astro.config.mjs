// @ts-check

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig, fontProviders } from 'astro/config';

// https://astro.build/config
// ⚠️ 部署前必改：
//   site  = https://<你的GitHub用户名>.github.io
//   base  = /<你的仓库名>/   （仓库名就是 GitHub 上那个项目名）
// base 只在构建时生效（GitHub Pages 项目页）；开发服务器直接用根路径，localhost:4321 即首页
export default defineConfig({
	site: 'https://yihujiua.github.io',
	base: import.meta.env.PROD ? '/astro-blog/' : '/',
	integrations: [mdx(), sitemap()],
	fonts: [
		{
			provider: fontProviders.local(),
			name: 'Atkinson',
			cssVariable: '--font-atkinson',
			// Atkinson 只有拉丁字形，中文需要体面的回退栈
			fallbacks: ['PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'sans-serif'],
			options: {
				variants: [
					{
						src: ['./src/assets/fonts/atkinson-regular.woff'],
						weight: 400,
						style: 'normal',
						display: 'swap',
					},
					{
						src: ['./src/assets/fonts/atkinson-bold.woff'],
						weight: 700,
						style: 'normal',
						display: 'swap',
					},
				],
			},
		},
	],
});
