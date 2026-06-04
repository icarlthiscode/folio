<script lang="ts">
  import useArticles from '$lib/hooks/useArticles';
  import Grid from '$lib/materials/grid.svelte';
  import Card from '$lib/materials/card.svelte';
  import Abstract from '$lib/components/abstract.svelte';

  const { tag, maxCount = null, headingLevel } : {
    tag ?: string;
    maxCount ?: number | null;
    headingLevel ?: 2 | 3;
  } = $props();

  const { index } = useArticles();

  const articles = $derived(
    tag
      ? ($index.tags[tag]?.articles ?? [])
      : Object.values($index.articles),
  );
  const displayed = $derived(
    maxCount
      ? articles.toReversed().slice(0, maxCount)
      : articles.toReversed());
</script>

<Grid>
  {#each displayed as article (article.slug)}
    <Card>
      <Abstract
        title={article.title}
        abstract={article.abstract}
        link={`/articles/${article.slug}`}
        datePublished={article.datePublished}
        tags={article.tags.filter(t => (t.slug !== tag))}
        {headingLevel}
      />
    </Card>
  {/each}
</Grid>
