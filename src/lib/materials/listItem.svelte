<script lang="ts">
  import type { Snippet } from 'svelte';
  import Icon from './icon.svelte';

  const { icon, showIcon, children } : {
    icon : string;
    showIcon ?: boolean;
    children : Snippet<[]>;
  } = $props();
</script>

<li class="list-item">
  <Icon graphic={icon} show={showIcon}/>
  {@render children()}
</li>
