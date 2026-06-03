<script lang="ts">
  import { browser } from '$app/environment';
  import useConfig from '$lib/hooks/useConfig';
  import useLocale from '$lib/hooks/useLocale';
  import Content from '$lib/materials/content.svelte';
  import Nav from '$lib/components/nav.svelte';
  import Profile from '$lib/components/profile.svelte';
  import Contact from '$lib/components/contact.svelte';
  import Highlight from '$lib/components/highlight.svelte';

  const { data } = $props();

  const { config } = useConfig();
  const { locale } = useLocale();

  const highlights = $config.highlights ?? [];
</script>

<Content
  section="profile"
  hasTopNav
  hasBottomNav={!!$config.profileLinks?.length}
  alignment="centre"
  justification="centre"
  showBackground={browser}
>
  <Nav highlights allArticles contact/>
  <Profile />
</Content>
{#each highlights as highlight (highlight.id)}
  <Content section={highlight.section || 'default'} showBackground={browser}>
    <Highlight
      {highlight}
      article={data.articles?.[highlight.key]}
      metadata={data.articleIndex?.articles?.[highlight.key]}
    />
  </Content>
{/each}
<Content section="contact" showBackground={browser}>
  <Contact id="contact" />
</Content>

<svelte:head>
  {#if $locale.meta.title}
    <title>{$locale.meta.title}</title>
  {/if}
  {#if $locale.meta.description}
    <meta name="description" content="{$locale.meta.description}" />
  {/if}
</svelte:head>
