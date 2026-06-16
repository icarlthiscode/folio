<script lang="ts">
  import type { Snippet } from 'svelte';
  import useThemes from '$lib/hooks/useThemes';

  import Graphic from './graphic.svelte';

  const { rotation = 0, show = true, children } : {
    rotation ?: number;
    show ?: boolean;
    children : Snippet<[]>;
  } = $props();

  const { graphic } = (() => useThemes({ graphicKey : 'frame' }))();
  let hasGraphic = $derived(!!$graphic?.src);
  let frameContentClass = $derived(
    'frame-content' + ($graphic ? ' has-frame' : ''),
  );
</script>

<div class="frame" style="--frame-rotation: {rotation}deg;">
  {#if hasGraphic}
    <div class="overlay">
      <Graphic graphic="frame" show={show}/>
    </div>
  {/if}
  <div class={frameContentClass}>
    {@render children()}
  </div>
</div>
