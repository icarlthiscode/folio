import { browser } from '$app/environment';
import { getContext, setContext } from 'svelte';
import type { Writable } from 'svelte/store';
import { get, writable } from 'svelte/store';

import { log } from '$lib/utils/log';
import type { Section, Typography, Graphic } from '$lib/utils/theme';
import { defaultTheme, getSection } from '$lib/utils/theme';
import { kebabCase } from '$lib/utils/styles';
import { themes, theme } from '$lib/stores/theme';

const ck = {
  section : Symbol('useThemesSection'),
  typography : Symbol('useThemesTypography'),
  graphic : Symbol('useThemesGraphic'),
};

const handleStorageEvent = (event : StorageEvent) => {
  if (event.key !== 'theme') return;
  theme.set(event.newValue ?? 'default', false);
  window.dispatchEvent(new CustomEvent(
    'themeUpdated',
    { detail : event.newValue ?? 'default' },
  ));
};

let subscribed = false;
function subscribeLocalTheme() {
  if (!browser) return () => {};
  if (!subscribed) {
    subscribed = true;
    theme.set(localStorage.getItem('theme') ?? 'default', false);
    window.addEventListener('storage', handleStorageEvent);
  }
  return () => {
    if (subscribed) window.removeEventListener('storage', handleStorageEvent);
    subscribed = false;
  };
}

function makeSectionStore(sectionKey : string) {
  const allThemes = get(themes);
  const currentTheme = allThemes[get(theme)]
    ?? allThemes.default
    ?? defaultTheme;
  const initSection = getSection(currentTheme, { key : sectionKey });
  return writable(initSection, (set) => {
    const unsubscribe = theme.subscribe((t) => {
      const theme = allThemes[t] ?? allThemes.default ?? defaultTheme;
      set(getSection(theme, { key : sectionKey }));
    });
    return () => { unsubscribe(); };
  });
}

function makeTypographyStore(
  typographyKey : string,
  sectionStore : Writable<Section>,
) {
  const section = get(sectionStore);
  const initTypography = section.typography[typographyKey]
    ?? section.typography.body;
  return writable(initTypography, (set) => {
    const unsubscribe = sectionStore.subscribe((s) => {
      set(s.typography[typographyKey] ?? s.typography.body);
    });
    return () => { unsubscribe(); };
  });
}

function makeGraphicStore(
  graphicKey : string | undefined,
  sectionStore : Writable<Section>,
) {
  const section = get(sectionStore);
  const initGraphic = graphicKey !== undefined
    ? section.graphics?.[graphicKey]
    : undefined;
  return writable<Graphic | undefined>(initGraphic, (set) => {
    if (graphicKey === undefined) return () => {};
    const unsubscribe = sectionStore.subscribe((s) => {
      set(s.graphics?.[graphicKey]);
    });
    return () => { unsubscribe(); };
  });
}

function makeClasses(
  sectionKey ?: string,
  typographyKey ?: string,
  graphicKey ?: string,
) {
  const classes = [];
  if (sectionKey) classes.push(`section-${kebabCase(sectionKey)}`);
  if (typographyKey) classes.push(`typography-${kebabCase(typographyKey)}`);
  if (graphicKey) classes.push(`graphic-${kebabCase(graphicKey)}`);
  return classes.join(' ');
}

function logSetWithoutContext(context : string, key ?: string) {
  log({
    message : `Attempted to set ${context} key to '${key}'`
      + ' without initializing context.',
  }, { level : 'warn' });
}

function useThemes({ sectionKey, typographyKey, graphicKey } : {
  sectionKey ?: string;
  typographyKey ?: string;
  graphicKey ?: string;
} = {}) {
  const section = sectionKey
    ? setContext(ck.section, makeSectionStore(sectionKey))
    : (getContext<Writable<Section>>(ck.section)
      ?? makeSectionStore('default'));

  const typography = typographyKey
    ? setContext(ck.typography, makeTypographyStore(typographyKey, section))
    : getContext<Writable<Typography>>(ck.typography)
      ?? makeTypographyStore('body', section);

  const graphic = graphicKey
    ? setContext(ck.graphic, makeGraphicStore(graphicKey, section))
    : getContext<Writable<Graphic | undefined>>(ck.graphic)
      ?? makeGraphicStore(undefined, section);

  const providerClasses = (sectionKey || typographyKey || graphicKey)
    ? writable(makeClasses(sectionKey, typographyKey, graphicKey))
    : undefined;

  let currentSectionKey = sectionKey;
  let currentTypographyKey = typographyKey;
  let currentGraphicKey = graphicKey;

  function updateProviderClasses(
    sectionKey ?: string,
    typographyKey ?: string,
    graphicKey ?: string,
  ) {
    currentSectionKey = sectionKey;
    currentTypographyKey = typographyKey;
    currentGraphicKey = graphicKey;
    if (providerClasses) {
      providerClasses.set(
        makeClasses(sectionKey, typographyKey, graphicKey),
      );
    }
  }

  function setSection(key : string) {
    if (sectionKey === undefined) {
      logSetWithoutContext('section', key);
      return;
    }
    const allThemes = get(themes);
    const currentTheme = allThemes[get(theme)]
      ?? allThemes.default
      ?? defaultTheme;
    section.set(getSection(currentTheme, { key }));
    updateProviderClasses(key, currentTypographyKey, currentGraphicKey);
  }

  function updateSection(
    callback : (prevKey : string) => string,
  ) {
    setSection(callback(currentSectionKey ?? 'default'));
  }

  function setTypography(key : string) {
    if (typographyKey === undefined) {
      logSetWithoutContext('typography', key);
      return;
    }
    typography.set(get(section).typography[key]
      ?? get(section).typography.body);
    updateProviderClasses(currentSectionKey, key, currentGraphicKey);
  }

  function updateTypography(
    callback : (prevKey : string) => string,
  ) {
    setTypography(callback(currentTypographyKey ?? 'body'));
  }

  function setGraphic(key ?: string) {
    if (graphicKey === undefined) {
      logSetWithoutContext('graphic', key);
      return;
    }
    graphic.set((key !== undefined) ? get(section).graphics?.[key] : undefined);
    updateProviderClasses(currentSectionKey, currentTypographyKey, key);
  }

  function updateGraphic(
    callback : (prevKey : string | undefined) => string | undefined,
  ) {
    setGraphic(callback(currentGraphicKey));
  }

  return {
    themes,
    theme,
    section : {
      ...section,
      set : setSection,
      update : updateSection,
    },
    typography : {
      ...typography,
      set : setTypography,
      update : updateTypography,
    },
    graphic : {
      ...graphic,
      set : setGraphic,
      update : updateGraphic,
    },
    providerClasses,
    subscribeLocalTheme,
  };
}

export default useThemes;
