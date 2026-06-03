<script lang="ts">
  import useConfig from '$lib/hooks/useConfig';
  import useLocale from '$lib/hooks/useLocale';
  import NavLinks from '$lib/materials/navLinks.svelte';

  const {
    home = false,
    highlights = false,
    allArticles = false,
    contact = false,
  } : {
    home ?: boolean;
    highlights ?: boolean;
    allArticles ?: boolean;
    contact ?: boolean;
  } = $props();

  const { config } = useConfig();
  const { locale } = useLocale();

  const links = $derived.by(() => {
    const ln : { text : string; href : string; }[] = [];
    if (highlights) {
      for (const highlight of ($config.highlights ?? [])) {
        const text = $locale.nav.highlights[highlight.id] || '';
        if (!text) continue;
        ln.push({ text, href : `/#${highlight.id}` });
      }
    }
    if (allArticles) {
      ln.push({ text : $locale.nav.allArticles, href : '/collections' });
    }
    if (home) ln.push({ text : $locale.nav.home, href : '/' });
    if (contact) ln.push({ text : $locale.nav.contact, href : '/#contact' });
    return ln;
  });
</script>

<NavLinks links={links} justify="end" />
