<script lang="ts">
  import type { Snippet } from 'svelte';
  import Text from './text.svelte';

  const { id, level, scrim = false, children } : {
    id ?: string;
    level : 1 | 2 | 3 | 4 | 5 | 6;
    scrim ?: boolean;
    children : Snippet<[]>;
  } = $props();
</script>

<Text id={id} as={`h${level}`} typography={`heading-${level}`} {scrim}>
  {@render children()}
</Text>
