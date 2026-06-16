<script lang="ts">
  import type { Snippet } from 'svelte';
  import useThemes from '$lib/hooks/useThemes';
  import Background from './background.svelte';

  const {
    section = 'default',
    hasTopNav = false,
    hasBottomNav = false,
    alignment = 'left',
    justification = 'top',
    showBackground = true,
    children,
  } : {
    section ?: string;
    hasTopNav ?: boolean;
    hasBottomNav ?: boolean;
    alignment ?: 'left' | 'centre';
    justification ?: 'top' | 'centre';
    showBackground ?: boolean;
    children ?: Snippet<[]>;
  } = $props();

  const { providerClasses } = (() => useThemes({ sectionKey : section }))();

  const topOffset = $derived(
    (!hasTopNav && hasBottomNav) && (justification === 'centre'),
  );
  const bottomOffset = $derived(
    (hasTopNav && !hasBottomNav) && (justification === 'centre'),
  );

  const classes = $derived.by(() => {
    const cls = ['layout'];
    if (hasTopNav) cls.push('top-nav');
    if (topOffset) cls.push('top-offset');
    if (bottomOffset) cls.push('bottom-offset');
    return cls;
  });

  const align = $derived(alignment === 'centre' ? 'center' : 'flex-start');
  // shift vertical centred layout to align top nav or bottom links
  const justify = $derived(
    ((hasTopNav || hasBottomNav) && justification === 'centre')
      ? 'space-between'
      : justification === 'centre' ? 'center' : 'flex-start',
  );
</script>

<section class={$providerClasses}>
  <Background show={showBackground}>
    <div
      class={classes.join(' ')}
      style="--content-align: {align}; --content-justify: {justify};"
    >
      <!-- add placeholder to align vertically asymmetrical layout -->
      {#if topOffset}
        <div class="placeholder"></div>
      {/if}
      {@render children?.()}
      {#if bottomOffset}
        <div class="placeholder"></div>
      {/if}
    </div>
  </Background>
</section>

<style>
  section {
    display: flex;
    flex-direction: column;
    width: 100%;
    margin-bottom: calc(-1 * var(--border-width, 0));
    border-style: none;
    border-width: 0;
    border-bottom-style: solid;
    border-bottom-width: var(--border-width, 0);
    border-bottom-color: var(--border-colour);
  }

  section:first-child {
    flex-grow: 1;
  }

  .layout {
    display: flex;
    flex-grow: 1;
    width: 100%;
    max-width:
      calc(var(--max-page-width, 128rem) + (4 * var(--layout-spacing, 0)));
    flex-direction: column;
    justify-content: var(--content-justify);
    align-items: var(--content-align);
    gap: var(--layout-spacing);
    margin: 0 auto;
    padding:
      calc(2 * var(--layout-spacing, 0))
      calc(2 *var(--layout-spacing, 0) * var(--layout-scale, 1));
  }

  .top-nav {
    padding-top: calc((var(--layout-spacing, 0) / 2 ) * var(--layout-scale, 1));
  }

  .top-offset {
    /* offset for extra gap when centring asymmetric layouts*/
    padding-top: calc(var(--layout-spacing, 0));
  }

  .bottom-offset {
    /* offset for extra gap when centring asymmetric layouts*/
    padding-bottom: calc(var(--layout-spacing, 0));
  }

  .placeholder {
    width: 100%;
    height: 0;
  }
</style>
