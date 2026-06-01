<script lang="ts">
  import type { Highlight } from '$lib/utils/config';
  import type { Article } from '$lib/utils/weblog';

  import useLocale from '$lib/hooks/useLocale';
  import Heading from '$lib/materials/heading.svelte';
  import NavLinks from '$lib/materials/navLinks.svelte';

  import ArticleIndex from './articleIndex.svelte';
  import Post from './post.svelte';

  const {
    highlight,
    article,
    metadata,
  } : {
    highlight : Highlight;
    article ?: string;
    metadata ?: Article;
  } = $props();

  const { locale } = useLocale();

  const title = $derived(highlight.title || $locale.highlights.defaultHeading);
</script>

<Heading id={highlight.id} level={2} scrim>{title}</Heading>
{#if highlight.type === 'tag'}
  <ArticleIndex tag={highlight.key} />
{/if}
{#if highlight.type === 'article'}
  <Post
    content={article}
    datePublished={metadata?.datePublished ?? null}
    contributions={metadata?.contributions ?? []}
  />
{/if}
{#if highlight.links.length}
  <NavLinks links={highlight.links} />
{/if}
