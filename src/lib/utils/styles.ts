import type { Section, Font, Background, Typography, Graphic } from './theme';
import { isObject } from './typing';
import { resolveUrl } from './http';
import { defaultTheme, getFonts, getAllSections } from './theme';

export function kebabCase(str : string) {
  return str
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
    .replace(/([a-zA-Z])([0-9])/g, '$1-$2')
    .replace(/([0-9])([a-zA-Z])/g, '$1-$2')
    .toLowerCase();
}

function compileClasses(classes : string[]) {
  return classes.map(c => `.${kebabCase(c)}`).join(' ');
}

function compileProps(props : Record<string, string | number>) {
  return Object.entries(props)
    .map(([key, value]) => `${key}: ${value};`)
    .join('\n  ');
}

function compileFontFace(fonts : Font) {
  const props = {
    'font-family' : fonts.family,
    'src' : fonts.fontFace ? `url('${resolveUrl(fonts.fontFace)}')` : '',
  };
  return `@font-face {\n  ${compileProps(props)}\n}`;
}

function compileFontImport(fonts : Font) {
  return `@import url('${resolveUrl(fonts.import ?? '')}');`;
}

export function compileFonts(fonts : Font[]) {
  const declarations = fonts.map(font => (font.fontFace
    ? compileFontFace(font)
    : compileFontImport(font)));
  return Array.from(new Set(declarations)).join('\n');
}

function compileSection(classes : string[], section : Section) {
  const props = {
    ...Object.fromEntries(Object.entries(section.scale)
      .map(([key, value]) => [`--scale-${kebabCase(key)}`, value])),
    ...Object.fromEntries(Object.entries(section.palette)
      .map(([key, value]) => [`--colour-${kebabCase(key)}`, value])),
    '--max-page-width' : section.scale.maxWidth,
    '--padding-inset' : section.scale.inset,
    '--layout-spacing' : section.scale.spacing,
    '--border-colour' : section.palette.border ?? 'transparent',
    '--border-width' : section.scale.borderWidth,
    '--border-radius' : section.scale.borderRadius,
    '--bg-colour' : section.background.fill ?? 'transparent',
    '--bg-img' : section.background.img?.src
      ? `url('${resolveUrl(section.background.img.src)}')`
      : 'none',
    '--bg-repeat' : (section.background.img?.mode === 'tile')
      ? 'repeat'
      : 'no-repeat',
    '--bg-size' : (section.background.img?.mode === 'cover')
      ? 'cover'
      : 'auto',
    '--bg-position' : section.background.img?.mode === 'fixed'
      ? ((section.background.img?.anchor === 'left')
          ? 'top left'
          : ((section.background.img?.anchor === 'right')
              ? 'top right'
              : 'top'))
      : 'initial',
    '--bg-opacity' : section.background.img?.opacity ?? 1,
    '--scrim-colour' : (section.scrim && section.background.fill)
      ? (`color-mix(in srgb, ${section.background.fill} 66%, `
        + 'transparent 33%)')
      : 'transparent',
  };
  return `${compileClasses(classes)} {\n  ${compileProps(props)}\n}`;
}

function compileBackground(classes : string[], background : Background) {
  if (!background.img?.colourMap) return '';
  return Object.entries(background.img.colourMap)
    .map(([name, prop]) => (compileClasses(classes.concat(name ?? ''))
      + ` {\n  ${compileProps({ color : prop ?? '' })}\n}`)).join('\n\n');
}

function compileTypography(classes : string[], typography : Typography) {
  const props = {
    '--font-family' : typography.font ?? 'inherit',
    '--font-size' : typography.size ?? 'inherit',
    '--font-weight' : typography.weight ?? 'inherit',
    '--font-style' : typography.style ?? 'inherit',
    '--line-height' : typography.lineHeight ?? 'inherit',
    '--letter-spacing' : typography.letterSpacing ?? 'inherit',
    '--text-decoration' : typography.textDecoration ?? 'inherit',
    '--text-colour' : typography.colour ?? 'inherit',
    '--text-bg-colour' : typography.bgColour ?? 'inherit',
    '--text-shadow' : typography.shadowColour
      ? `0.03em 0.06em 0 ${typography.shadowColour}`
      : 'none',
  };
  return `${compileClasses(classes)} {\n  ${compileProps(props)}\n}`;
}

function compileGraphic(classes : string[], graphic : Graphic) {
  const props = {
    '--img-src' : `url('${resolveUrl(graphic.src)}')`,
    '--img-alt' : graphic.alt ?? '',
  };
  return `${compileClasses(classes)} {\n  ${compileProps(props)}\n}\n`
    + Object.entries(graphic.colourMap ?? {})
      .map(([name, prop]) => (compileClasses(classes.concat(name ?? []))
        + ` {\n  ${compileProps({ color : prop ?? '' })}\n}`)).join('\n\n');
}

function compileSectionStyles(classes : string[], section : Section) {
  return [
    compileSection(classes, section),
    compileBackground(classes, section.background),
    ...(Object.entries(section.typography)
      .map(([key, typography]) =>
        compileTypography(classes.concat(`typography-${key}`), typography))),
    ...(Object.entries(section.graphics)
      .map(([key, graphic]) =>
        compileGraphic(classes.concat(`graphic-${key}`), graphic))),
  ].filter(c => c).join('\n\n');
}

function compileThemeStyles(classes : string[], theme : unknown) {
  const sections = getAllSections(theme);
  return [
    ...Object.entries(sections)
      .map(([key, section]) =>
        compileSectionStyles(classes.concat(`section-${key}`), section)),
  ].filter(c => c).join('\n\n');
}

export function compileStyles(themes : unknown) {
  if (!isObject(themes) || !Object.keys(themes).length)
    return compileThemeStyles(['theme-default'], defaultTheme);

  const fonts : Font[] = [];
  for (const theme of Object.values(themes)) {
    fonts.push(...Object.values(getFonts(theme)));
  }
  return [
    compileFonts(fonts),
    ...Object.entries(themes)
      .map(([key, theme]) => compileThemeStyles([`theme-${key}`], theme)),
  ].filter(c => c).join('\n\n');
}
