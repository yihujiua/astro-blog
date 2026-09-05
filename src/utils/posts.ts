import { getCollection } from 'astro:content';
import type { CollectionEntry } from 'astro:content';

export type Post = CollectionEntry<'blog'>;

/** All non-draft posts (drafts stay visible in dev), newest first. */
export async function getSortedPosts(): Promise<Post[]> {
	return (
		await getCollection('blog', ({ data }) => (import.meta.env.PROD ? !data.draft : true))
	).sort((a, b) => +b.data.pubDate - +a.data.pubDate);
}

/** Rough reading time from raw markdown body (strip code/links/markup first). */
export function readingMinutes(body: string | undefined): number {
	const stripped = (body ?? '')
		.replace(/```[\s\S]*?```/g, ' ')
		.replace(/`[^`]*`/g, ' ')
		.replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
		.replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
		.replace(/[#>*_\-]/g, ' ');
	const words = stripped.trim().split(/\s+/).filter(Boolean).length;
	return Math.max(1, Math.round(words / 280));
}

/** Up to `count` posts sharing the most tags; falls back to newest others. */
export function relatedPosts(current: Post, all: Post[], count = 3): Post[] {
	const others = all
		.filter((p) => p.id !== current.id)
		.map((p) => ({
			entry: p,
			score: p.data.tags.filter((t) => current.data.tags.includes(t)).length,
		}));
	const pool = others.some((o) => o.score > 0) ? others.filter((o) => o.score > 0) : others;
	return pool
		.sort((a, b) => b.score - a.score || +b.entry.data.pubDate - +a.entry.data.pubDate)
		.slice(0, count)
		.map((o) => o.entry);
}

/** Unique tags across posts, most-used first. */
export function allTags(posts: Post[]): { tag: string; count: number }[] {
	const counts = new Map<string, number>();
	for (const p of posts) {
		for (const t of p.data.tags) counts.set(t, (counts.get(t) ?? 0) + 1);
	}
	return [...counts.entries()]
		.map(([tag, count]) => ({ tag, count }))
		.sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}
