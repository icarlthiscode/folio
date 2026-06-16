<script lang="ts">
  import type { Snippet } from 'svelte';
  import { onDestroy, onMount } from 'svelte';
  import { get } from 'svelte/store';
  import type { Section, Typography, Graphic } from '$lib/utils/theme';
  import useThemes from './useThemes';

  interface Props {
    sectionKey ?: string;
    typographyKey ?: string;
    graphicKey ?: string;
    setThemes ?: (() => Record<string, unknown>);
    getThemes ?: ((themes : Record<string, unknown>) => void);
    setTheme ?: (() => string | undefined);
    getTheme ?: ((theme : string) => void);
    setSection ?: (() => string);
    setTypography ?: (() => string);
    setGraphic ?: (() => string);
    getSection ?: ((section : Section) => void);
    getTypography ?: ((typography : Typography) => void);
    getGraphic ?: ((graphic ?: Graphic) => void);
    onSectionChange ?: ((section : Section) => void);
    onTypographyChange ?: ((typography : Typography) => void);
    onGraphicChange ?: ((graphic ?: Graphic) => void);
    getProviderClasses ?: ((classes ?: string) => void);
    children ?: Snippet<[]>;
  }

  const props : Props = $props();

  const {
    themes,
    theme,
    section,
    typography,
    graphic,
    subscribeLocalTheme,
    providerClasses,
  } = (() => useThemes({
    sectionKey : props.sectionKey,
    typographyKey : props.typographyKey,
    graphicKey : props.graphicKey,
  }))();

  onMount(() => {
    if (props.onSectionChange) section.subscribe(props.onSectionChange);
    if (props.onTypographyChange) {
      typography.subscribe(props.onTypographyChange);
    }
    if (props.onGraphicChange) graphic.subscribe(props.onGraphicChange);
  });

  $effect(() => {
    if (props.setSection) section.set(props.setSection());
    if (props.setTypography) typography.set(props.setTypography());
    if (props.setGraphic) graphic.set(props.setGraphic());
    if (props.getProviderClasses) props.getProviderClasses($providerClasses);
  });

  $effect.pre(() => {
    if (props.setThemes) themes.set(props.setThemes());
    if (props.getThemes) props.getThemes(get(themes));
    if (props.setTheme) theme.set(props.setTheme());
    if (props.getTheme) props.getTheme(get(theme));
    if (props.getSection) props.getSection(get(section));
    if (props.getTypography) props.getTypography(get(typography));
    if (props.getGraphic) props.getGraphic(get(graphic));
  });

  const unsubscribe = subscribeLocalTheme();

  onDestroy(() => { unsubscribe(); });
</script>

{@render props.children?.()}
