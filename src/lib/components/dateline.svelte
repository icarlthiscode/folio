<script lang="ts">
  import useLocale from '$lib/hooks/useLocale';
  import Text from '$lib/materials/text.svelte';

  const { date = null } : { date ?: Date | null; } = $props();

  const { locale } = useLocale();

  const dateline = $derived(
    date
      ? $locale.collections.published + (date.toLocaleDateString('en-CA', {
        day : 'numeric',
        month : 'long',
        year : 'numeric',
      }))
      : '',
  );
</script>

{#if date}
  <Text typography='detail' as='p'>{ dateline }</Text>
{/if}
