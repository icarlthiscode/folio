import { error } from '@sveltejs/kit';

import { loadAbstract, loadArticle } from '$lib/server/weblog';
import type { PageServerLoad } from './$types';

export const load : PageServerLoad = async ({ params, parent, fetch }) => {
  const { config, articleIndex } = await parent();

  if (!params.path || !config.weblog?.url) return { markdown : '' };

  const { title, body : abstract } =
    await loadAbstract(config.weblog.url, params.path, { fetch });
  const markdown = await loadArticle(config.weblog.url, params.path, { fetch });

  if (!markdown) { error(404, 'Article Not Found'); }

  const metadata = articleIndex.articles[params.path];

  return { title, abstract, markdown, metadata };
};
