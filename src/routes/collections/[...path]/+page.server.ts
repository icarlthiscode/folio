import { error } from '@sveltejs/kit';

import type { PageServerLoad } from './$types';

export const load : PageServerLoad = async ({ params, parent }) => {
  const articleIndex = (await parent()).articleIndex;
  const tag = params.path
    ? articleIndex.tags[params.path]
    : undefined;

  if (params.path && !tag) { error(404, 'Collection Not Found'); }

  return { tag };
};
