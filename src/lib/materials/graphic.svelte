<script lang="ts">
  import useGraphics from '$lib/hooks/useGraphics';
  import useThemes from '$lib/hooks/useThemes';

  const { src, graphic : graphicKey, alt, show = true } : {
    src ?: string;
    graphic ?: string;
    alt ?: string;
    show ?: boolean;
  } = $props();

  const { isGraphic, renderGraphic } = (() => useGraphics())();
  const { graphic, providerClasses } = (() => useThemes({ graphicKey }))();

  const graphicClass = $derived(
    ($providerClasses ? ($providerClasses + ' ') : '') + 'graphic',
  );

  const content = $derived(
    show ? renderGraphic(src ?? $graphic?.src ?? '') : '',
  );
</script>

{#if show && (src || !!$graphic?.src)}
  {#if content}
    <div class={graphicClass} aria-hidden="true">
      {@html content}
    </div>
  {:else if (!isGraphic(src ?? $graphic?.src ?? ''))}
    <img
      class="graphic"
      src={src ?? $graphic?.src ?? ''}
      alt={alt ?? $graphic?.alt ?? ''}
    />
  {/if}
{/if}
