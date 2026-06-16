import type { PageServerLoad } from './$types';
import { loadArticles } from '$lib/server/weblog';

export const load : PageServerLoad = async ({ parent, fetch }) => {
  const { config } = await parent();
  const articleHighlights =
    config.highlights?.filter(h => h.type === 'article');
  const articles = articleHighlights?.length
    ? (await loadArticles(
        config.weblog?.url ?? '',
        articleHighlights.map(h => h.key),
        { fetch },
      ))
    : {};

  return { articles };
};
