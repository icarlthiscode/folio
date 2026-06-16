<script lang="ts">
  import Graphic from './graphic.svelte';
  const { graphic, show = true } : {
    graphic : string;
    show ?: boolean;
  } = $props();
</script>

<div class="icon">
  <Graphic graphic={graphic} show={show} />
</div>
