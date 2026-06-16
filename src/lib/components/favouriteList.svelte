<script lang="ts">
  import { browser } from '$app/environment';
  import useConfig from '$lib/hooks/useConfig';
  import useLocale from '$lib/hooks/useLocale';
  import Text from '$lib/materials/text.svelte';
  import ListItem from '$lib/materials/listItem.svelte';

  const { rank, headingElement = 'p' } : {
    rank : 'most' | 'least';
    headingElement ?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p';
  } = $props();

  const { config } = useConfig();
  const { locale } = useLocale();

  const favourites = $derived.by(
    () => (rank === 'most' ? $config.likes : $config.dislikes) ?? [],
  );
</script>

{#if favourites.length > 0}
  <div>
    <svelte:element this={headingElement} class="favourite-heading">
      <Text typography="list-header-emphasis">
        {#if rank === 'most'}
          { $locale.favourites.most }
        {:else}
          { $locale.favourites.least }
        {/if}
      </Text>
      <Text typography="list-header">
        { $locale.favourites.header }
      </Text>
    </svelte:element>

    <ul>
      {#each favourites as item (item.text)}
        <ListItem icon={item.icon} showIcon={browser}>
          <Text>{ item.text }</Text>
        </ListItem>
      {/each}
    </ul>
  </div>
{/if}

<style>
  ul {
    display: contents;
  }
</style>
