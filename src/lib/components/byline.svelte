<script lang="ts">
  import type { Contribution } from '$lib/utils/weblog';
  import Text from '$lib/materials/text.svelte';
  import Link from '$lib/materials/link.svelte';

  const { contributions } : { contributions ?: Contribution[]; } = $props();

  const separator = $derived((l : number, i : number, j : number) => {
    if (j < (l - 2)) return ', ';
    if (j < (l - 1)) return ' & ';
    if (i < ((contributions?.length || 0) - 1)) return '; ';
    return '';
  });
</script>

{#if contributions?.length}
  <Text typography='detail' as="p">
    {#each contributions as contribution, i (i)}
      { contribution.byline }
      {#each contribution.members as member, j (`${i}-${j}`)}
        {#if member.href}<!--
       --><Link href={member.href}>{ member.name }</Link><!--
     -->{:else}<!--
       -->{ member.name }<!--
     -->{/if}<!--
   --><span>{ separator(contribution.members.length, i, j) }</span>
      {/each}
    {/each}
  </Text>
{/if}
