import type { LayoutServerLoad } from './$types';
import { loadConfig } from '$lib/server/config';
import { loadLocale } from '$lib/server/locale';
import { loadThemes, loadGraphics } from '$lib/server/theme';
import { loadIndex } from '$lib/server/weblog';

export const load : LayoutServerLoad = async ({ fetch }) => {
  const [locale, config, themes] = await Promise.all([
    loadLocale({ fetch }),
    loadConfig({ fetch }),
    loadThemes({ fetch }),
  ]);
  const [articleIndex, graphics] = await Promise.all([
    loadIndex(config.weblog?.url ?? '', { fetch }),
    loadGraphics(themes, { fetch }),
  ]);

  return {
    config,
    locale,
    themes,
    graphics,
    articleIndex,
  };
};
