<script lang="ts">
  import { onMount } from 'svelte';
  import { resolveUrl } from '$lib/utils/http';
  import useConfig from '$lib/hooks/useConfig';
  import useLocale from '$lib/hooks/useLocale';
  import useThemes from '$lib/hooks/useThemes';
  import useGraphics from '$lib/hooks/useGraphics';
  import useArticles from '$lib/hooks/useArticles';
  import Page from '$lib/materials/page.svelte';
  import { env } from '$env/dynamic/public';

  const { data, children } = $props();

  const { config } = useConfig();
  const { locale } = useLocale();
  const { themes, subscribeLocalTheme } = useThemes();
  const { graphics } = useGraphics();
  const { index } = useArticles();

  const init = () => {
    config.set((() => data.config)());
    locale.set((() => data.locale)());
    themes.set((() => data.themes)());
    graphics.set((() => data.graphics)());
    index.set((() => data.articleIndex)());
  };
  init();

  onMount(() => subscribeLocalTheme());
</script>

<Page>
  {@render children()}
</Page>

<svelte:head>
  {#if env.PUBLIC_FAVICON}
    <link rel="icon" href="{resolveUrl(env.PUBLIC_FAVICON).toString()}" />
  {/if}
</svelte:head>
