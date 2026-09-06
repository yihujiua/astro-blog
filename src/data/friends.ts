// 友链数据：在这里增加 / 修改你喜欢的友链即可。
// 每个分类(category)下是一组圆形卡片链接(links)：
//   - name   站点 / 朋友的名称（必填）
//   - url    跳转链接（必填）
//   - desc   一句话简介，鼠标滑过卡片时展开显示
//   - color  圆形头像底色（可选，默认用分类色）

export interface FriendLink {
	name: string;
	url: string;
	desc: string;
	color?: string;
}

export interface FriendCategory {
	key: string;
	label: string;
	color: string;
	links: FriendLink[];
}

export const friendCategories: FriendCategory[] = [
	{
		key: 'tech',
		label: '技术博客',
		color: '#2A6F97',
		links: [
			{
				name: 'Astro 官方',
				url: 'https://astro.build',
				desc: '内容驱动的 Web 框架，本博客就是用它搭的。',
			},
			{
				name: '阮一峰的网络日志',
				url: 'https://www.ruanyifeng.com/blog/',
				desc: '科技与生活的长期观察者，干货满满。',
			},
			{
				name: 'ESP32 中文社区',
				url: 'https://esp32.com',
				desc: '玩转 ESP32 / ESP-IDF 的第一手资料与问答。',
			},
		],
	},
	{
		key: 'friends',
		label: '朋友们',
		color: '#e63946',
		links: [
			{
				name: '小明の博客',
				url: 'https://example.com',
				desc: '一个爱折腾全栈的同事，Vue 与 Node 写得很溜。',
			},
			{
				name: '阿强的硬件笔记',
				url: 'https://example.com',
				desc: '从 STM32 到树莓派，分享大量电路与焊接经验。',
			},
		],
	},
	{
		key: 'tools',
		label: '工具 / 资源',
		color: '#2D8659',
		links: [
			{
				name: 'MDN Web Docs',
				url: 'https://developer.mozilla.org',
				desc: 'Web 技术的权威参考，前端必备。',
			},
			{
				name: 'Tailwind CSS',
				url: 'https://tailwindcss.com',
				desc: '原子化 CSS 框架，写样式快到飞起。',
			},
			{
				name: 'Ollama',
				url: 'https://ollama.com',
				desc: '一条命令在本地跑大模型，AI 管家的底座。',
			},
		],
	},
];
