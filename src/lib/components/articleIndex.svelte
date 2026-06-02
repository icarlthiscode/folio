<script lang="ts">
  import useArticles from '$lib/hooks/useArticles';
  import Grid from '$lib/materials/grid.svelte';
  import Card from '$lib/materials/card.svelte';
  import Abstract from '$lib/components/abstract.svelte';

  const { tag, headingLevel } : {
    tag ?: string;
    headingLevel ?: 2 | 3;
  } = $props();

  const { index } = useArticles();

  const articles = $derived(
    tag
      ? ($index.tags[tag]?.articles ?? [])
      : Object.values($index.articles),
  );
</script>

<Grid>
  {#each articles as article (article.slug)}
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
