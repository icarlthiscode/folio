<script lang="ts">
  import useLocale from '$lib/hooks/useLocale';
  import Post from './post.svelte';

  const {
    title = '',
    abstract = '',
    link = '#',
    datePublished = null,
    tags = [],
    headingLevel = 3,
  } : {
    title ?: string;
    abstract ?: string;
    link ?: string;
    datePublished ?: Date | null;
    tags ?: { slug : string; name : string; }[];
    headingLevel ?: 2 | 3;
  } = $props();

  const { locale } = useLocale();

  const tagLinks = $derived(tags.map(t => ({
    text : $locale.collections.tagPrefix + t.name,
    href : `/collections/${t.slug}`,
  })));
</script>

<Post
  content={abstract}
  heading={{ text : title, href : link, level : headingLevel }}
  bottomLinks={tagLinks}
  datePublished={datePublished}
  compact
/>
