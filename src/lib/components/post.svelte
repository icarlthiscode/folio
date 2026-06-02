<script lang="ts">
  import {
    type Contribution,
    extractArticle,
    renderArticle,
  } from '$lib/utils/weblog';
  import useConfig from '$lib/hooks/useConfig';
  import Stack from '$lib/materials/stack.svelte';
  import Heading from '$lib/materials/heading.svelte';
  import Link from '$lib/materials/link.svelte';
  import NavLinks from '$lib/materials/navLinks.svelte';
  import Article from '$lib/materials/article.svelte';
  import Dateline from './dateline.svelte';
  import Byline from './byline.svelte';

  const {
    content,
    heading,
    datePublished = null,
    topLinks = [],
    bottomLinks = [],
    contributions = [],
    compact = false,
  } : {
    content ?: string;
    heading ?: { text : string; href ?: string; level ?: 1 | 2 | 3; };
    topLinks ?: { text : string; href : string; }[];
    bottomLinks ?: { text : string; href : string; }[];
    datePublished ?: Date | null;
    contributions ?: Contribution[];
    compact ?: boolean;
  } = $props();

  const { config } = useConfig();

  const { title = '', body } = $derived.by(() => {
    const { title, body } = extractArticle(content || '');
    if (heading || !title) return { body : renderArticle(content || '') };
    const sections = renderArticle([`# ${title}\n\n`, body]);
    return {
      title : sections[0] ?? '',
      body : sections[1] ?? '',
    };
  });

  const topCredits = $derived(
    contributions.filter(c => $config.weblog?.topCredits.includes(c.slug)),
  );
  const bottomCredits = $derived(
    contributions.filter(c => $config.weblog?.bottomCredits.includes(c.slug)),
  );
</script>

<Article>
  {#if heading}
    <Heading level={heading.level ?? 1}>
      {#if heading.href}
        <Link href={heading.href}>{ heading.text }</Link>
      {:else}
        { heading.text }
      {/if}
    </Heading>
  {:else}
    {@html title}
  {/if}
  <Dateline date={datePublished} />
  {#if topLinks.length}
    <NavLinks links={topLinks} compact />
  {/if}
  {#if topCredits.length}
    <Byline contributions={topCredits} />
  {/if}
  {#if !compact}
    <Stack>{@html body}</Stack>
  {:else}
    {@html body}
  {/if}
  {#if bottomLinks.length}
    <NavLinks links={bottomLinks} compact />
  {/if}
  {#if bottomCredits.length}
    <Byline contributions={bottomCredits} />
  {/if}
</Article>
