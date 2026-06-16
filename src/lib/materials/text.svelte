<script lang="ts">
  import type { Snippet } from 'svelte';
  import useThemes from '$lib/hooks/useThemes';

  const {
    id,
    centred,
    flex,
    inset,
    scrim = false,
    typography = 'body',
    as = 'span',
    children,
  } : {
    id ?: string;
    centred ?: boolean;
    flex ?: boolean;
    inset ?: boolean;
    scrim ?: boolean;
    typography ?: 'body'
      | 'title'
      | 'subtitle'
      | 'heading-1'
      | 'heading-2'
      | 'heading-3'
      | 'heading-4'
      | 'heading-5'
      | 'heading-6'
      | 'link'
      | 'nav'
      | 'tagline'
      | 'list-header'
      | 'list-header-emphasis'
      | 'detail';
    as ?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span';
    children : Snippet<[]>;
  } = $props();

  const { providerClasses } = (() => useThemes({
    typographyKey : typography,
  }))();

  const className = $derived.by(() => {
    const cls = [$providerClasses, 'text'];
    if (centred) cls.push('text-centred');
    if (flex) cls.push('text-flex');
    if (inset) cls.push('text-inset');
    if (scrim) cls.push('scrim');
    return cls.join(' ');
  });
</script>

<svelte:element
  id={id}
  class={className}
  this={as}
>
  {@render children()}
</svelte:element>
