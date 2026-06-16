<script lang="ts">
  import { browser } from '$app/environment';
  import useConfig from '$lib/hooks/useConfig';
  import useLocale from '$lib/hooks/useLocale';
  import Text from '$lib/materials/text.svelte';
  import Link from '$lib/materials/link.svelte';
  import ListItem from '$lib/materials/listItem.svelte';

  const { headingElement = 'p' } : {
    headingElement ?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p';
  } = $props();

  const { config } = useConfig();
  const { locale } = useLocale();
</script>

{#if $config.contact && ($config.contact.length > 0)}
  <div>
    <Text as={headingElement} typography="list-header">
      { $locale.contact.infoHeader }
    </Text>
    <ul>
      {#each $config.contact ?? [] as item (item.text)}
      <ListItem icon={item.icon} showIcon={browser}>
        <Text flex>
          { item.text }
          <Link href={item.href}>{ item.link }</Link>
        </Text>
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
