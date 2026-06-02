<script>
  import { browser } from '$app/environment';
  import useLocale from '$lib/hooks/useLocale.js';
  import Content from '$lib/materials/content.svelte';
  import Nav from '$lib/components/nav.svelte';
  import Footer from '$lib/components/footer.svelte';
  import Post from '$lib/components/post.svelte';

  const { data } = $props();

  const { locale } = useLocale();

  const description = $derived((data?.abstract ?? '')
    ?.replace(/\r?\n|\r/g, ' ')
    ?.replace(/\s+/g, ' ')
    ?.trim());
  const tagLinks = $derived((data.metadata?.tags ?? []).map(t => ({
    text : $locale.collections.tagPrefix + t.name,
    href : `/collections/${t.slug}`,
  })));
</script>

<Content section="article" hasTopNav showBackground={browser}>
  <Nav home highlights allArticles contact />
  <Post
    content={data.markdown}
    topLinks={tagLinks}
    datePublished={data.metadata?.datePublished ?? null}
    contributions={data.metadata?.contributions ?? []}
  />
</Content>
<Content section="footer" showBackground={browser}>
  <Footer />
</Content>

<svelte:head>
  <title>{data.title || 'Article'}</title>
  {#if description}
    <meta name="description" content="{description}" />
  {/if}
</svelte:head>
