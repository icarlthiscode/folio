<script lang="ts">
  import type { Snippet } from 'svelte';
  import useThemes from '$lib/hooks/useThemes';

  const { children } : { children : Snippet<[]>; } = $props();

  const { section } = useThemes();

  const classes = $derived('grid' + ($section.grid ? '' : ' stretch'));
</script>

<div class={classes}>
  {@render children()}
</div>
