<script lang="ts">
  import type { Snippet } from 'svelte';
  import Text from './text.svelte';

  const { href, scrim = false, children } : {
    href : string;
    scrim ?: boolean;
    children : Snippet<[]>;
  } = $props();
</script>

<Text as="span" typography="link" {scrim}>
  <a href={href}>{@render children()}</a>
</Text>
