// 站点级常量：改这里即可全站生效（标题、作者、链接、调色板）。
// 可在任何页面 / 组件里通过 import 直接引用。

export const SITE_TITLE = '我的技术博客';
export const SITE_DESCRIPTION = '记录 ESP32、智能家居与全栈开发';

export const AUTHOR = 'yihujiua';
export const EMAIL = 'hi@yihujiua.com';
export const GITHUB_URL = 'https://github.com/yihujiua';

/** 手绘风六色调色板（风格指南色卡与 Footer 色点共用） */
export const PALETTE = [
	{ name: 'Pencil', hex: '#2A2A2A' },
	{ name: 'Paper', hex: '#F5EFE1' },
	{ name: 'Marker', hex: '#E63946' },
	{ name: 'Ink', hex: '#2A6F97' },
	{ name: 'Leaf', hex: '#2D8659' },
	{ name: 'Accent', hex: '#2337FF' },
] as const;
