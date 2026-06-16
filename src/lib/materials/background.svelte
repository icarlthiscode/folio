<script lang="ts">
  import type { Snippet } from 'svelte';
  import useThemes from '$lib/hooks/useThemes';
  import useGraphics from '$lib/hooks/useGraphics';
  import Graphic from './graphic.svelte';

  const { show = true, children } : {
    show ?: boolean;
    children : Snippet<[]>;
  } = $props();

  const { section } = (() => useThemes())();
  const { isGraphic } = (() => useGraphics())();

  const graphicClass = $derived.by(() => {
    const mode = $section?.background.img?.mode ?? 'cover';
    const base = 'background-graphic';
    if (mode === 'fixed') {
      if ($section?.background.img?.anchor === 'right') {
        return `${base} ${base}-fixed ${base}-anchor-right`;
      } else if ($section?.background.img?.anchor === 'centre') {
        return `${base} ${base}-fixed ${base}-anchor-centre`;
      } else {
        return `${base} ${base}-fixed ${base}-anchor-left`;
      }
    }
    return `${base} ${base}-cover`;
  });

  const hasGraphic = $derived(!!$section?.background.img
    && isGraphic($section?.background.img?.src ?? ''));
  const underClass = $derived(
    'background-underlay' + ((!show || hasGraphic) ? ' bg-disabled' : ''),
  );
</script>

<div class="background">
  {@render children()}
  <div class={underClass}>
    {#if hasGraphic}
      <div class={graphicClass}>
        <Graphic src={$section?.background.img?.src} show={show} />
      </div>
    {/if}
  </div>
</div>

<style>
  .background {
    display: flex;
    position: relative;
    flex-grow: 1;
  }

  .background-underlay {
    position: absolute;
    inset: 0;
    z-index: var(--z-background);
    overflow: hidden;
    background-color: var(--bg-colour);
    background-image: var(--bg-img);
    background-size: var(--bg-size);
    background-repeat: var(--bg-repeat);
    background-position: var(--bg-position);
  }

  .background-underlay.bg-disabled {
    background-image: none;
  }

  .background-graphic {
    position: absolute;
    z-index: var(--z-graphic-overlay);
    opacity: var(--bg-opacity);
    background-size: var(--bg-size);
    background-repeat: var(--bg-repeat);
  }

  .background-graphic-cover {
    inset: -10%;
  }

  .background-graphic-anchor-left {
    top: 0;
    left: 0;
  }

  .background-graphic-anchor-centre {
    top: 0;
    left: 50%;
    transform: translateX(-50%);
  }

  .background-graphic-anchor-right {
    top: 0;
    right: 0;
  }
</style>
