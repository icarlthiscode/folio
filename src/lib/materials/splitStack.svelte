<script lang="ts">
  import type { Snippet } from 'svelte';
  const {
    divide = false,
    stackOrder = 'normal',
    stack = [],
    alignment = 'centre',
    children,
  } : {
    divide ?: boolean;
    stackOrder ?: 'normal' | 'reverse';
    stack ?: ('mobile' | 'tablet' | 'desktop' | 'wide' | 'never')[];
    alignment ?: 'start' | 'centre' | 'end';
    children ?: Snippet<[]>;
  } = $props();

  const classes = $derived.by(() => {
    const cls = ['split-stack'];
    cls.push(`align-${alignment}`);
    if (divide) cls.push('divided');
    if (stackOrder === 'reverse') cls.push('reversed');
    stack.forEach(s => cls.push(`stack-${s}`));
    return cls.join(' ');
  });
</script>

<div class={classes}>
  {@render children?.()}
</div>
