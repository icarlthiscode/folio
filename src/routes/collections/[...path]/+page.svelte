<script>
  import { browser } from '$app/environment';
  import useLocale from '$lib/hooks/useLocale.js';
  import Content from '$lib/materials/content.svelte';
  import Heading from '$lib/materials/heading.svelte';
  import NavLinks from '$lib/materials/navLinks.svelte';
  import Nav from '$lib/components/nav.svelte';
  import Footer from '$lib/components/footer.svelte';
  import ArticleIndex from '$lib/components/articleIndex.svelte';

  const { data } = $props();

  const { locale } = useLocale();

  const id = $derived(data.tag?.slug || 'all-articles');
  const slug = $derived(data.tag?.slug);
  const name = $derived(data.tag?.name ?? $locale.collections.allArticles);
  const description = $derived(data.tag?.description);

  const back = $derived([{
    text : ($locale.collections.backPrefix || $locale.collections.tagPrefix)
      + $locale.collections.allArticles,
    href : '/collections',
  }]);
  const tags = $derived(
    Object.entries(data.articleIndex.tags).map(([s, t]) => ({
      text : $locale.collections.tagPrefix + t.name,
      href : '/collections/' + s,
    })),
  );
  const links = $derived(data.tag ? back : tags);
</script>

<Content section="collection" hasTopNav showBackground={browser}>
  <Nav home allArticles={!!data.tag} contact />
  <Heading level={1} {id} scrim>{name}</Heading>
  <NavLinks {links}/>
  <ArticleIndex tag={slug}/>
</Content>
<Content section="footer" showBackground={browser}>
  <Footer />
</Content>

<svelte:head>
  <title>{name}</title>
  {#if description}
    <meta name="description" content="{description}" />
  {/if}
</svelte:head>
