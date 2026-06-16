<script lang="ts">
  import type { NavTarget } from '$lib/utils/config';
  import useConfig from '$lib/hooks/useConfig';
  import useLocale from '$lib/hooks/useLocale';
  import NavLinks from '$lib/materials/navLinks.svelte';

  const { targets = [] } : { targets : NavTarget[]; } = $props();

  const { config } = useConfig();
  const { locale } = useLocale();

  const links = $derived.by(() => {
    const ln : { text : string; href : string; }[] = [];
    if (targets.includes('highlights')) {
      for (const highlight of ($config.highlights ?? [])) {
        const text = $locale.nav.highlights[highlight.id] || '';
        if (!text) continue;
        ln.push({ text, href : `/#${highlight.id}` });
      }
    }
    if (targets.includes('allArticles')) {
      ln.push({ text : $locale.nav.allArticles, href : '/collections' });
    }
    if (targets.includes('home')) {
      ln.push({ text : $locale.nav.home, href : '/' });
    }
    if (targets.includes('contact')) {
      ln.push({ text : $locale.nav.contact, href : '/#contact' });
    }
    return ln;
  });
</script>

<NavLinks links={links} justify="end" />
