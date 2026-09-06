// 关于页的项目时间线：想加事件就在 timelineEvents 里追加一条，
// category 取 categoryMeta 里定义的四种之一，side 控制卡片在时间线左/右。

export type TimelineCategory = 'milestone' | 'feature' | 'design' | 'launch';

export interface TimelineEvent {
	category: TimelineCategory;
	title: string;
	date: string;
	description?: string;
	highlight?: boolean;
	side: 'left' | 'right';
}

export const categoryMeta: Record<TimelineCategory, { label: string; color: string }> = {
	milestone: { label: 'Milestone', color: '#C0392B' },
	feature: { label: 'Feature', color: '#21618C' },
	design: { label: 'Design', color: '#9C640C' },
	launch: { label: 'Launch', color: '#1E8449' },
};

export const timelineEvents: TimelineEvent[] = [
	{
		category: 'milestone',
		title: '博客上线',
		date: 'Aug 2026',
		description: '用 Astro 搭建个人博客，部署到 GitHub Pages。',
		highlight: true,
		side: 'left',
	},
	{
		category: 'launch',
		title: 'AI 管家',
		date: 'Aug 2026',
		description: '本地 Docker 跑通 Ollama + Home Assistant，语音控全屋。',
		side: 'right',
	},
	{
		category: 'design',
		title: '智能家居架构',
		date: 'Jul 2026',
		description: '规划 ESP32-S3 网关 + ESP32-C3 终端的分布式家庭自动化方案。',
		side: 'left',
	},
	{
		category: 'feature',
		title: '深入嵌入式',
		date: 'May 2026',
		description: '从 Arduino 进阶到 ESP-IDF，玩转 FreeRTOS、低功耗与无线协议。',
		side: 'right',
	},
	{
		category: 'milestone',
		title: 'Hello, World',
		date: '很久以前',
		description: '在编辑器里敲下第一行代码，从此入坑。',
		side: 'left',
	},
];
