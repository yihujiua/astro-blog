// 站点级常量：改这里即可全站生效（标题、作者、链接、调色板）。
// 可在任何页面 / 组件里通过 import 直接引用。

export const SITE_TITLE = '我的技术博客';
export const SITE_DESCRIPTION = '记录 ESP32、智能家居与全栈开发';

export const AUTHOR = 'yihujiua';
/** 人机合作署名：AI 参与者名称与展示文案 */
export const AI_PARTNER = 'AI';
export const CO_AUTHOR_LABEL = `${AUTHOR} × ${AI_PARTNER}`;
export const EMAIL = 'hi@yihujiua.com';
export const GITHUB_URL = 'https://github.com/yihujiua';

/** 手绘风调色板（风格指南色卡与 Footer 色点共用），对齐 Sketch Style 规范 */
export const PALETTE = [
	{ name: 'Pencil', hex: '#2C2C2C' },
	{ name: 'Paper', hex: '#F5F0E8' },
	{ name: 'Marker', hex: '#E74C3C' },
	{ name: 'Sky', hex: '#3498DB' },
	{ name: 'Leaf', hex: '#27AE60' },
	{ name: 'Sun', hex: '#F39C12' },
] as const;
