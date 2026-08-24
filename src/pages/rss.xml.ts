import rss from '@astrojs/rss';
import { SITE_DESCRIPTION, SITE_TITLE } from '../consts';

const modules = import.meta.glob('/src/content/blog/*.md', { eager: true });

export async function GET(context) {
	const posts = Object.entries(modules).map(([path, mod]: [string, any]) => {
		const rawFm = mod.frontmatter;
		const fm: Record<string, unknown> = typeof rawFm === 'function' ? rawFm() : (rawFm ?? {});
		const slug = path.split('/').pop()!.replace(/\.md$/, '');
		return {
			title: String(fm.title ?? ''),
			description: String(fm.description ?? ''),
			pubDate: new Date(String(fm.pubDate ?? Date.now())),
			link: `${import.meta.env.BASE_URL}blog/${slug}/`,
		};
	});
	return rss({
		title: SITE_TITLE,
		description: SITE_DESCRIPTION,
		site: context.site,
		items: posts,
	});
}
