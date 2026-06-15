import { beforeEach, afterAll, describe, it, expect, vi } from 'vitest';

import type { Font, Section } from './theme';
import { defaultTheme } from './theme';
import { compileFonts, compileStyles, kebabCase } from './styles';

let baseUrl : string | undefined = vi.hoisted(() => '/');

const testFonts = {
  test : { family : 'testFont' },
  custom : { family : 'customFont' },
};

const testThemes = { test : {} };

const testSection = vi.hoisted(() => ({
  palette : {
    test : '#111111',
    border : '#222222',
  },
  scale : {
    maxWidth : 'testMaxWidth',
    inset : 'testInset',
    spacing : 'testSpacing',
    fontSize : 'testFontSize',
    borderWidth : 'testBorderWidth',
    borderRadius : 'testBorderRadius',
    test : 'testSize',
  },
  background : {
    fill : '#111111',
    img : {
      src : 'testImage.jpg',
      mode : 'cover' as const,
      opacity : 1,
      colourMap : { first : '#123456', second : '#234567' },
    },
  },
  typography : {
    body : {
      font : 'testFont',
      size : 'testSize',
    },
  },
  graphics : {
    graphic : {
      src : 'testGraphic.svg',
      alt : 'Test Graphic',
      colourMap : { first : '#123456', second : '#234567' },
    },
  },
  scrim : false,
}));

function matchBlock(style : string, {
  theme = 'test',
  section = 'test',
  background,
  typography,
  graphic,
  img,
} : {
  theme ?: string;
  section ?: string;
  background ?: string;
  typography ?: string;
  graphic ?: string;
  img ?: string;
} = {}) {
  let pattern = '';
  if (theme) pattern += `\\.theme-${theme} `;
  if (section) pattern += `\\.section-${section} `;
  if (background) pattern += `\\.${background} `;
  if (typography) pattern += `\\.typography-${typography} `;
  if (graphic) pattern += `\\.graphic-${graphic} `;
  if (img) pattern += `\\.${img} `;
  pattern += '\\s*{[^}]*}';
  return style.match(new RegExp(pattern, 'g'));
}

const getFontsMock = vi.hoisted(
  () => vi.fn(() => (testFonts) as Record<string, Font>),
);
const getAllSectionsMock = vi.hoisted(
  () => vi.fn(() => ({ test : testSection } as Record<string, Section>)),
);

vi.mock('$env/dynamic/public', () => ({
  get env() { return { PUBLIC_BASE_URL : baseUrl }; },
}));
vi.mock('./theme', () => ({
  getFonts : getFontsMock,
  getAllSections : getAllSectionsMock,
  defaultTheme : { key : 'default' },
}));

beforeEach(() => {
  vi.clearAllMocks();
  baseUrl = '/';
});

afterAll(() => { vi.restoreAllMocks(); });

describe('kebabCase', () => {
  it('converts camelCase to kebab-case', () => {
    expect(kebabCase('camelCaseTest')).toBe('camel-case-test');
  });

  it('converts camelCase with acronyms to kebab-case', () => {
    expect(kebabCase('camelCaseACRONYMTest')).toBe('camel-case-acronym-test');
  });

  it('converts camelCase with numbers to kebab-case', () => {
    expect(kebabCase('camelCaseWith123Numbers'))
      .toBe('camel-case-with-123-numbers');
  });
});

describe('compileFonts', () => {
  it('returns local font-face definitions', () => {
    baseUrl = '/';
    const fonts = [
      { ...testFonts.test, fontFace : 'test.ttf' },
      { ...testFonts.custom, fontFace : 'custom.ttf' },
    ];
    const css = compileFonts(fonts);
    const blocks = css.match(/@font-face\s*{[^}]*}/gs);
    expect(blocks).toHaveLength(2);
    expect(blocks?.[0]).contains(`font-family: ${fonts[0]?.family};`);
    expect(blocks?.[0]).contains(`src: url('/${fonts[0]?.fontFace}');`);
    expect(blocks?.[1]).contains(`font-family: ${fonts[1]?.family};`);
    expect(blocks?.[1]).contains(`src: url('/${fonts[1]?.fontFace}');`);
  });

  it('returns relative font-face definitions', () => {
    baseUrl = 'http://example.com/';
    const fonts = [
      { ...testFonts.test, fontFace : 'test.ttf' },
      { ...testFonts.custom, fontFace : 'custom.ttf' },
    ];
    const css = compileFonts(fonts);
    const blocks = css.match(/@font-face\s*{[^}]*}/gs);
    expect(blocks).toHaveLength(2);
    expect(blocks?.[0]).contains(`font-family: ${fonts[0]?.family};`);
    expect(blocks?.[0])
      .contains(`src: url('http://example.com/${fonts[0]?.fontFace}');`);
    expect(blocks?.[1]).contains(`font-family: ${fonts[1]?.family};`);
    expect(blocks?.[1])
      .contains(`src: url('http://example.com/${fonts[1]?.fontFace}');`);
  });

  it('returns absolute font-face definitions', () => {
    baseUrl = 'http://example.com/';
    const fonts = [
      { ...testFonts.test, fontFace : 'http://example.org/test.ttf' },
      { ...testFonts.custom, fontFace : 'http://example.org/custom.ttf' },
    ];
    const css = compileFonts(fonts);
    const blocks = css.match(/@font-face\s*{[^}]*}/gs);
    expect(blocks).toHaveLength(2);
    expect(blocks?.[0]).contains(`font-family: ${fonts[0]?.family};`);
    expect(blocks?.[0])
      .contains(`src: url('${fonts[0]?.fontFace}');`);
    expect(blocks?.[1]).contains(`font-family: ${fonts[1]?.family};`);
    expect(blocks?.[1])
      .contains(`src: url('${fonts[1]?.fontFace}');`);
  });

  it('returns local font import statements', () => {
    baseUrl = '/';
    const fonts = [
      { ...testFonts.test, import : 'test.css' },
      { ...testFonts.custom, import : 'custom.css' },
    ];
    const css = compileFonts(fonts);
    const imports = css.match(/@import\s*url\(['"][^'"]+['"]\);/g);
    expect(imports).toHaveLength(2);
    expect(imports?.[0]).toBe(`@import url('/${fonts[0]?.import}');`);
    expect(imports?.[1]).toBe(`@import url('/${fonts[1]?.import}');`);
  });

  it('returns relative font import statements', () => {
    baseUrl = 'http://example.com/';
    const fonts = [
      { ...testFonts.test, import : 'test.css' },
      { ...testFonts.custom, import : 'custom.css' },
    ];
    const css = compileFonts(fonts);
    const imports = css.match(/@import\s*url\(['"][^'"]+['"]\);/g);
    expect(imports).toHaveLength(2);
    expect(imports?.[0])
      .toBe(`@import url('http://example.com/${fonts[0]?.import}');`);
    expect(imports?.[1])
      .toBe(`@import url('http://example.com/${fonts[1]?.import}');`);
  });

  it('returns absolute font import statements', () => {
    baseUrl = 'http://example.com/';
    const fonts = [
      { ...testFonts.test, import : 'http://example.org/test.css' },
      { ...testFonts.custom, import : 'http://example.org/custom.css' },
    ];
    const css = compileFonts(fonts);
    const imports = css.match(/@import\s*url\(['"][^'"]+['"]\);/g);
    expect(imports).toHaveLength(2);
    expect(imports?.[0]).toBe(`@import url('${fonts[0]?.import}');`);
    expect(imports?.[1]).toBe(`@import url('${fonts[1]?.import}');`);
  });

  it('does not return duplicate font definitions', () => {
    const fonts = [
      { ...testFonts.test, fontFace : 'test.ttf' },
      { ...testFonts.test, fontFace : 'test.ttf' },
      { ...testFonts.custom, import : 'custom.css' },
      { ...testFonts.custom, import : 'custom.css' },
    ];
    const css = compileFonts(fonts);
    const blocks = css.match(/@font-face\s*{[^}]*}/gs);
    const imports = css.match(/@import\s*url\(['"][^'"]+['"]\);/g);
    expect(blocks).toHaveLength(1);
    expect(imports).toHaveLength(1);
  });
});

describe('compileStyles', () => {
  beforeEach(() => {
    getFontsMock.mockReturnValue(testFonts);
    getAllSectionsMock.mockReturnValue({ test : testSection });
  });

  it('returns compiled theme fonts', () => {
    getFontsMock.mockReturnValueOnce({
      test : { ...testFonts.test, fontFace : 'test.ttf' },
    });
    getFontsMock.mockReturnValueOnce({
      custom : { ...testFonts.custom, import : 'custom.ttf' },
    });

    const styles = compileStyles({
      theme1 : { key : 1 },
      theme2 : { key : 2 },
    });

    const blocks = styles.match(/@font-face\s*{[^}]*}/gs);
    const imports = styles.match(/@import\s*url\(['"][^'"]+['"]\);/g);
    expect(blocks).toHaveLength(1);
    expect(imports).toHaveLength(1);
  });

  it('returns compiled theme styles', () => {
    const styles = compileStyles({
      theme1 : { key : 1 },
      theme2 : { key : 2 },
    });

    expect(getAllSectionsMock).toHaveBeenCalledTimes(2);
    expect(getAllSectionsMock).toHaveBeenNthCalledWith(1, { key : 1 });
    expect(getAllSectionsMock).toHaveBeenNthCalledWith(2, { key : 2 });
    const block1 = matchBlock(styles, { theme : 'theme-1' });
    const block2 = matchBlock(styles, { theme : 'theme-2' });
    expect(block1).toHaveLength(1);
    expect(block2).toHaveLength(1);
  });

  it('returns default theme styles if no theme is provided', () => {
    const styles = compileStyles(undefined);
    expect(getAllSectionsMock).toHaveBeenCalledTimes(1);
    expect(getAllSectionsMock).toHaveBeenNthCalledWith(1, defaultTheme);

    const block = matchBlock(styles, { theme : 'default' });
    expect(block).toHaveLength(1);
  });

  it('returns compiled sections styles', () => {
    const section1 = { ...testSection };
    const section2 = { ...section1, background : { fill : 'transparent' } };
    const sections = { section1, section2 };
    getAllSectionsMock.mockReturnValue(sections);

    const styles = compileStyles(testThemes);

    const block1 = matchBlock(styles, { section : 'section-1' });
    const block2 = matchBlock(styles, { section : 'section-2' });
    expect(block1).toHaveLength(1);
    expect(block2).toHaveLength(1);
  });

  it('returns compiled sections styles with kebab case', () => {
    const section1 = { ...testSection };
    const section2 = { ...section1, background : { fill : 'transparent' } };
    const sections = { sectionOne : section1, sectionTwo : section2 };
    getAllSectionsMock.mockReturnValue(sections);

    const styles = compileStyles(testThemes);

    const block1 = matchBlock(styles, { section : 'section-one' });
    const block2 = matchBlock(styles, { section : 'section-two' });
    expect(block1).toHaveLength(1);
    expect(block2).toHaveLength(1);
  });

  it('returns compiled palette colours', () => {
    const styles = compileStyles(testThemes);

    const block = matchBlock(styles);
    const colour = testSection.palette.test;
    expect(block?.[0]).contains(`--colour-test: ${colour};`);
  });

  it('returns compiled pattern colours as train-case', () => {
    const section = { ...testSection, palette : { testColour : '#123456' } };
    getAllSectionsMock.mockReturnValue({ test : section });

    const styles = compileStyles(testThemes);

    const block = matchBlock(styles);
    expect(block?.[0]).contains(`--colour-test-colour: #123456;`);
  });

  it('returns compiled scale values', () => {
    const styles = compileStyles(testThemes);

    const block = matchBlock(styles);
    const size = testSection.scale.test;
    expect(block?.[0]).contains(`--scale-test: ${size};`);
  });

  it('returns compiled scale values as train-case', () => {
    const section = {
      ...testSection,
      scale : { ...testSection.scale, testSize : '123px' },
    };
    getAllSectionsMock.mockReturnValue({ test : section });

    const styles = compileStyles(testThemes);

    const block = matchBlock(styles);
    expect(block?.[0]).contains(`--scale-test-size: 123px;`);
  });

  it('returns compiled page max width', () => {
    const styles = compileStyles(testThemes);

    const block = matchBlock(styles);
    expect(block?.[0])
      .contains(`--max-page-width: ${testSection.scale.maxWidth};`);
  });

  it('returns compiled padding inset', () => {
    const styles = compileStyles(testThemes);

    const block = matchBlock(styles);
    expect(block?.[0]).contains(`--padding-inset: ${testSection.scale.inset};`);
  });

  it('returns compiled layout spacing', () => {
    const styles = compileStyles(testThemes);

    const block = matchBlock(styles);
    expect(block?.[0])
      .contains(`--layout-spacing: ${testSection.scale.spacing};`);
  });

  it('returns compiled border colour', () => {
    const styles = compileStyles(testThemes);

    const block = matchBlock(styles);
    expect(block?.[0])
      .contains(`--border-colour: ${testSection.palette.border};`);
  });

  it('returns transparent border colour', () => {
    const section = { ...testSection, palette : {} };
    getAllSectionsMock.mockReturnValue({ test : section });

    const styles = compileStyles(testThemes);

    const block = matchBlock(styles, { section : 'test' });
    expect(block?.[0]).contains(`--border-colour: transparent;`);
  });

  it('returns compiled border width', () => {
    const styles = compileStyles(testThemes);
    const block = matchBlock(styles);
    expect(block?.[0])
      .contains(`--border-width: ${testSection.scale.borderWidth};`);
  });

  it('returns compiled border radius', () => {
    const styles = compileStyles(testThemes);
    const block = matchBlock(styles);
    expect(block?.[0])
      .contains(`--border-radius: ${testSection.scale.borderRadius};`);
  });

  it('returns compiled background colour', () => {
    const styles = compileStyles(testThemes);

    const block = matchBlock(styles);
    expect(block?.[0]).contains(`--bg-colour: ${testSection.background.fill};`);
  });

  it('returns transparent background colour', () => {
    const section = { ...testSection, background : {} };
    getAllSectionsMock.mockReturnValue({ test : section });

    const styles = compileStyles(testThemes);

    const block = matchBlock(styles, { section : 'test' });
    expect(block?.[0]).contains(`--bg-colour: transparent;`);
  });

  it('returns compiled local background image', () => {
    baseUrl = '/';

    const styles = compileStyles(testThemes);

    const block = matchBlock(styles, { section : 'test' });
    expect(block?.[0])
      .contains(`--bg-img: url('/${testSection.background.img.src}');`);
  });

  it('returns compiled relative background image', () => {
    baseUrl = 'http://example.com';

    const styles = compileStyles(testThemes);

    const block = matchBlock(styles, { section : 'test' });
    expect(block?.[0])
      .contains('--bg-img: '
        + `url('http://example.com/${testSection.background.img.src}');`);
  });

  it('returns compiled absolute background image', () => {
    baseUrl = 'http://example.com';
    const section = {
      ...testSection,
      background : {
        ...testSection.background,
        img : {
          ...testSection.background.img,
          src : 'http://example.org/testImage.jpg',
        },
      },
    };
    getAllSectionsMock.mockReturnValue({ test : section });

    const styles = compileStyles(testThemes);

    const block = matchBlock(styles, { section : 'test' });
    expect(block?.[0])
      .contains(`--bg-img: url('http://example.org/testImage.jpg');`);
  });

  it('returns without background image', () => {
    const section = { ...testSection, background : {} };
    getAllSectionsMock.mockReturnValue({ test : section });

    const styles = compileStyles(testThemes);

    const block = matchBlock(styles, { section : 'test' });
    expect(block?.[0]).not.toContain('--bg-image');
  });

  it('returns compiled background repeat', () => {
    const section = {
      ...testSection,
      background : {
        ...testSection.background,
        img : { ...testSection.background.img, mode : 'tile' as const },
      },
    };
    getAllSectionsMock.mockReturnValue({ test : section });

    const styles = compileStyles(testThemes);

    const block = matchBlock(styles, { section : 'test' });
    expect(block?.[0]).contains(`--bg-repeat: repeat;`);
  });

  it('returns without background repeat', () => {
    const section = {
      ...testSection,
      background : {
        ...testSection.background,
        img : { ...testSection.background.img, mode : 'cover' as const },
      },
    };
    getAllSectionsMock.mockReturnValue({ test : section });

    const styles = compileStyles(testThemes);

    const block = matchBlock(styles, { section : 'test' });
    expect(block?.[0]).contains(`--bg-repeat: no-repeat;`);
  });

  it('returns compiled background image size', () => {
    const section = {
      ...testSection,
      background : {
        ...testSection.background,
        img : { ...testSection.background.img, mode : 'cover' as const },
      },
    };
    getAllSectionsMock.mockReturnValue({ test : section });

    const styles = compileStyles(testThemes);

    const block = matchBlock(styles, { section : 'test' });
    expect(block?.[0]).contains(`--bg-size: cover;`);
  });

  it('returns without background image size', () => {
    const section = {
      ...testSection,
      background : {
        ...testSection.background,
        img : { ...testSection.background.img, mode : 'tile' as const },
      },
    };
    getAllSectionsMock.mockReturnValue({ test : section });

    const styles = compileStyles(testThemes);

    const block = matchBlock(styles, { section : 'test' });
    expect(block?.[0]).contains(`--bg-size: auto;`);
  });

  it('returns compiled background image opacity', () => {
    const section = {
      ...testSection,
      background : {
        ...testSection.background,
        img : { ...testSection.background.img, opacity : 0.5 },
      },
    };
    getAllSectionsMock.mockReturnValue({ test : section });

    const styles = compileStyles(testThemes);

    const block = matchBlock(styles, { section : 'test' });
    expect(block?.[0]).contains(`--bg-opacity: 0.5;`);
  });

  it('returns compiled scrim colour', () => {
    const section = {
      ...testSection,
      scrim : true,
      background : { ...testSection.background, fill : '#042' },
    };
    getAllSectionsMock.mockReturnValue({ test : section });

    const styles = compileStyles(testThemes);

    const block = matchBlock(styles, { section : 'test' });
    expect(block?.[0]).contains(
      'color-mix(in srgb, #042 66%, transparent 33%)',
    );
  });

  it('returns transparent scrim', () => {
    const section = { ...testSection, scrim : false };
    getAllSectionsMock.mockReturnValue({ test : section });

    const styles = compileStyles(testThemes);

    const block = matchBlock(styles, { section : 'test' });
    expect(block?.[0]).contains(`--scrim-colour: transparent;`);
  });

  it('returns transparent scrim if no background colour', () => {
    const { fill : _, ...background } = testSection.background;
    const section = { ...testSection, scrim : true, background };
    getAllSectionsMock.mockReturnValue({ test : section });

    const styles = compileStyles(testThemes);

    const block = matchBlock(styles, { section : 'test' });
    expect(block?.[0]).contains(`--scrim-colour: transparent;`);
  });

  it('returns default background image opacity', () => {
    const { opacity : _, ...backgroundImage } = testSection.background.img;
    const section = {
      ...testSection,
      background : { ...testSection.background, img : backgroundImage },
    };
    getAllSectionsMock.mockReturnValue({ test : section });

    const styles = compileStyles(testThemes);

    const block = matchBlock(styles, { section : 'test' });
    expect(block?.[0]).contains(`--bg-opacity: 1;`);
  });

  it('returns compiled background styles', () => {
    const section = {
      ...testSection,
      background : {
        ...testSection.background,
        img : {
          ...testSection.background.img,
          colourMap : { key1 : '#123456', key2 : '#234567' },
        },
      },
    };
    getAllSectionsMock.mockReturnValue({ test : section });

    const styles = compileStyles(testThemes);

    const block1 = matchBlock(
      styles,
      { section : 'test', background : 'key-1' },
    );
    const block2 = matchBlock(
      styles,
      { section : 'test', background : 'key-2' },
    );
    expect(block1).toHaveLength(1);
    expect(block2).toHaveLength(1);
  });

  it('returns compiled background image fill', () => {
    const section = {
      ...testSection,
      background : {
        ...testSection.background,
        img : {
          ...testSection.background.img,
          colourMap : { key : '#123456' },
        },
      },
    };
    getAllSectionsMock.mockReturnValue({ test : section });

    const styles = compileStyles(testThemes);

    const block = matchBlock(styles, { section : 'test', background : 'key' });
    expect(block).toHaveLength(1);
    expect(block?.[0]).contains(`color: #123456;`);
  });

  it.each([
    'cover' as const,
    'tile' as const,
  ])('returns without initial background image position', (mode) => {
    const section = {
      ...testSection,
      background : {
        ...testSection.background,
        img : { ...testSection.background.img, mode },
      },
    };
    getAllSectionsMock.mockReturnValue({ test : section });

    const styles = compileStyles(testThemes);

    const block = matchBlock(styles, { section : 'test' });
    expect(block?.[0]).contains(`--bg-position: initial;`);
  });

  it('returns top background image position', () => {
    const section = {
      ...testSection,
      background : {
        ...testSection.background,
        img : {
          ...testSection.background.img,
          mode : 'fixed' as const,
          anchor : 'centre' as const,
        },
      },
    };
    getAllSectionsMock.mockReturnValue({ test : section });

    const styles = compileStyles(testThemes);

    const block = matchBlock(styles, { section : 'test' });
    expect(block?.[0]).contains(`--bg-position: top;`);
  });

  it('returns top left background image position', () => {
    const section = {
      ...testSection,
      background : {
        ...testSection.background,
        img : {
          ...testSection.background.img,
          mode : 'fixed' as const,
          anchor : 'left' as const,
        },
      },
    };
    getAllSectionsMock.mockReturnValue({ test : section });

    const styles = compileStyles(testThemes);

    const block = matchBlock(styles, { section : 'test' });
    expect(block?.[0]).contains(`--bg-position: top left;`);
  });

  it('returns top right background image position', () => {
    const section = {
      ...testSection,
      background : {
        ...testSection.background,
        img : {
          ...testSection.background.img,
          mode : 'fixed' as const,
          anchor : 'right' as const,
        },
      },
    };
    getAllSectionsMock.mockReturnValue({ test : section });

    const styles = compileStyles(testThemes);

    const block = matchBlock(styles, { section : 'test' });
    expect(block?.[0]).contains(`--bg-position: top right;`);
  });

  it('returns compiled typography styles', () => {
    const styles = compileStyles(testThemes);

    for (const key of Object.keys(testSection.typography)) {
      const block = matchBlock(styles, { typography : key });
      expect(block).toHaveLength(1);
    }
  });

  it('returns compiled typography styles with kebab case', () => {
    const section = {
      ...testSection,
      typography : {
        ...testSection.typography,
        bodyTest : testSection.typography.body,
      },
    };
    getAllSectionsMock.mockReturnValue({ test : section });

    const styles = compileStyles(testThemes);

    const block = matchBlock(styles, { typography : 'body-test' });
    expect(block).toHaveLength(1);
  });

  it('returns compiled typography font family', () => {
    const section = {
      ...testSection,
      typography : {
        ...testSection.typography,
        body : { ...testSection.typography.body, font : 'custom' },
      },
    };
    getAllSectionsMock.mockReturnValue({ test : section });

    const styles = compileStyles(testThemes);

    const block = matchBlock(styles, { section : 'test', typography : 'body' });
    expect(block?.[0]).contains(`--font-family: custom;`);
  });

  it('returns default typography font family', () => {
    const section = {
      ...testSection,
      typography : {
        ...testSection.typography,
        body : { ...testSection.typography.body, font : undefined },
      },
    };
    getAllSectionsMock.mockReturnValue({ test : section });

    const styles = compileStyles(testThemes);

    const block = matchBlock(styles, { section : 'test', typography : 'body' });
    expect(block?.[0]).contains(`--font-family: inherit;`);
  });

  it('returns compiled typography font size', () => {
    const section = {
      ...testSection,
      typography : {
        ...testSection.typography,
        body : { ...testSection.typography.body, size : '16px' },
      },
    };

    getAllSectionsMock.mockReturnValue({ test : section });

    const styles = compileStyles(testThemes);
    const block = matchBlock(styles, { section : 'test', typography : 'body' });
    expect(block?.[0]).contains(`--font-size: 16px;`);
  });

  it('returns default typography font size', () => {
    const section = {
      ...testSection,
      typography : {
        ...testSection.typography,
        body : { ...testSection.typography.body, size : undefined },
      },
    };
    getAllSectionsMock.mockReturnValue({ test : section });

    const styles = compileStyles(testThemes);

    const block = matchBlock(styles, { section : 'test', typography : 'body' });
    expect(block?.[0]).contains(`--font-size: inherit;`);
  });

  it('returns compiled typography font weight', () => {
    const section = {
      ...testSection,
      typography : {
        ...testSection.typography,
        body : { ...testSection.typography.body, weight : 'bold' },
      },
    };
    getAllSectionsMock.mockReturnValue({ test : section });

    const styles = compileStyles(testThemes);

    const block = matchBlock(styles, { section : 'test', typography : 'body' });
    expect(block?.[0]).contains(`--font-weight: bold;`);
  });

  it('returns default typography font weight', () => {
    const section = {
      ...testSection,
      typography : {
        ...testSection.typography,
        body : { ...testSection.typography.body, weight : undefined },
      },
    };
    getAllSectionsMock.mockReturnValue({ test : section });

    const styles = compileStyles(testThemes);

    const block = matchBlock(styles, { section : 'test', typography : 'body' });
    expect(block?.[0]).contains(`--font-weight: inherit;`);
  });

  it('returns compiled typography font style', () => {
    const section = {
      ...testSection,
      typography : {
        ...testSection.typography,
        body : { ...testSection.typography.body, style : 'italic' },
      },
    };
    getAllSectionsMock.mockReturnValue({ test : section });

    const styles = compileStyles(testThemes);

    const block = matchBlock(styles, { section : 'test', typography : 'body' });
    expect(block?.[0]).contains(`--font-style: italic;`);
  });

  it('returns default typography font style', () => {
    const section = {
      ...testSection,
      typography : {
        ...testSection.typography,
        body : { ...testSection.typography.body, style : undefined },
      },
    };
    getAllSectionsMock.mockReturnValue({ test : section });

    const styles = compileStyles(testThemes);

    const block = matchBlock(styles, { section : 'test', typography : 'body' });
    expect(block?.[0]).contains(`--font-weight: inherit;`);
  });

  it('returns compiled typography line height', () => {
    const section = {
      ...testSection,
      typography : {
        ...testSection.typography,
        body : { ...testSection.typography.body, lineHeight : '1.5' },
      },
    };
    getAllSectionsMock.mockReturnValue({ test : section });

    const styles = compileStyles(testThemes);

    const block = matchBlock(styles, { section : 'test', typography : 'body' });
    expect(block?.[0]).contains(`--line-height: 1.5;`);
  });

  it('returns default typography line height', () => {
    const section = {
      ...testSection,
      typography : {
        ...testSection.typography,
        body : { ...testSection.typography.body, lineHeight : undefined },
      },
    };
    getAllSectionsMock.mockReturnValue({ test : section });

    const styles = compileStyles(testThemes);

    const block = matchBlock(styles, { section : 'test', typography : 'body' });
    expect(block?.[0]).contains(`--line-height: inherit;`);
  });

  it('returns compiled typography letter spacing', () => {
    const section = {
      ...testSection,
      typography : {
        ...testSection.typography,
        body : { ...testSection.typography.body, letterSpacing : '0.1em' },
      },
    };
    getAllSectionsMock.mockReturnValue({ test : section });

    const styles = compileStyles(testThemes);

    const block = matchBlock(styles, { section : 'test', typography : 'body' });
    expect(block?.[0]).contains(`--letter-spacing: 0.1em;`);
  });

  it('returns default typography letter spacing', () => {
    const section = {
      ...testSection,
      typography : {
        ...testSection.typography,
        body : { ...testSection.typography.body, letterSpacing : undefined },
      },
    };
    getAllSectionsMock.mockReturnValue({ test : section });

    const styles = compileStyles(testThemes);

    const block = matchBlock(styles, { section : 'test', typography : 'body' });
    expect(block?.[0]).contains(`--letter-spacing: inherit;`);
  });

  it('returns compiled typography text decoration', () => {
    const section = {
      ...testSection,
      typography : {
        ...testSection.typography,
        body : { ...testSection.typography.body, textDecoration : 'underline' },
      },
    };
    getAllSectionsMock.mockReturnValue({ test : section });

    const styles = compileStyles(testThemes);

    const block = matchBlock(styles, { section : 'test', typography : 'body' });
    expect(block?.[0]).contains(`--text-decoration: underline;`);
  });

  it('returns default typography text decoration', () => {
    const section = {
      ...testSection,
      typography : {
        ...testSection.typography,
        body : { ...testSection.typography.body, textDecoration : undefined },
      },
    };
    getAllSectionsMock.mockReturnValue({ test : section });

    const styles = compileStyles(testThemes);

    const block = matchBlock(styles, { section : 'test', typography : 'body' });
    expect(block?.[0]).contains(`--text-decoration: inherit;`);
  });

  it('returns compiled text colour', () => {
    const section = {
      ...testSection,
      typography : {
        ...testSection.typography,
        body : { ...testSection.typography.body, colour : '#123456' },
      },
    };
    getAllSectionsMock.mockReturnValue({ test : section });

    const styles = compileStyles(testThemes);

    const block = matchBlock(styles, { section : 'test', typography : 'body' });
    expect(block?.[0]).contains(`--text-colour: #123456;`);
  });

  it('returns default text colour', () => {
    const section = {
      ...testSection,
      typography : {
        ...testSection.typography,
        body : { ...testSection.typography.body, colour : undefined },
      },
    };
    getAllSectionsMock.mockReturnValue({ test : section });

    const styles = compileStyles(testThemes);

    const block = matchBlock(styles, { section : 'test', typography : 'body' });
    expect(block?.[0]).contains(`--text-colour: inherit;`);
  });

  it('returns compiled text background colour', () => {
    const section = {
      ...testSection,
      typography : {
        ...testSection.typography,
        body : { ...testSection.typography.body, bgColour : '#123456' },
      },
    };
    getAllSectionsMock.mockReturnValue({ test : section });

    const styles = compileStyles(testThemes);

    const block = matchBlock(styles, { section : 'test', typography : 'body' });
    expect(block?.[0]).contains(`--text-bg-colour: #123456;`);
  });

  it('returns default text background colour', () => {
    const section = {
      ...testSection,
      typography : {
        ...testSection.typography,
        body : { ...testSection.typography.body, bgColour : undefined },
      },
    };
    getAllSectionsMock.mockReturnValue({ test : section });

    const styles = compileStyles(testThemes);

    const block = matchBlock(styles, { section : 'test', typography : 'body' });
    expect(block?.[0]).contains(`--text-bg-colour: inherit;`);
  });

  it('returns compiled text shadow colour', () => {
    const section = {
      ...testSection,
      typography : {
        ...testSection.typography,
        body : { ...testSection.typography.body, shadowColour : '#123456' },
      },
    };
    getAllSectionsMock.mockReturnValue({ test : section });

    const styles = compileStyles(testThemes);

    const block = matchBlock(styles, { section : 'test', typography : 'body' });
    expect(block?.[0]).contains(`--text-shadow: 0.03em 0.06em 0 #123456;`);
  });

  it('returns default text shadow colour', () => {
    const section = {
      ...testSection,
      typography : {
        ...testSection.typography,
        body : { ...testSection.typography.body, shadowColour : undefined },
      },
    };
    getAllSectionsMock.mockReturnValue({ test : section });

    const styles = compileStyles(testThemes);

    const block = matchBlock(styles, { section : 'test', typography : 'body' });
    expect(block?.[0]).contains(`--text-shadow: none;`);
  });

  it('returns compiled graphics styles', () => {
    const styles = compileStyles(testThemes);

    for (const key of Object.keys(testSection.graphics)) {
      const block = matchBlock(styles, { section : 'test', graphic : key });
      expect(block).toHaveLength(1);
    }
  });

  it('returns compiled graphics styles with kebab case', () => {
    const section = {
      ...testSection,
      graphics : {
        ...testSection.graphics,
        testGraphic : testSection.graphics.graphic,
      },
    };
    getAllSectionsMock.mockReturnValue({ test : section });

    const styles = compileStyles(testThemes);

    const block = matchBlock(
      styles,
      { section : 'test', graphic : 'test-graphic' },
    );
    expect(block).toHaveLength(1);
  });

  it('returns compiled local graphic src', () => {
    const section = {
      ...testSection,
      graphics : {
        ...testSection.graphics,
        graphic : { ...testSection.graphics.graphic, src : 'graphic.jpg' },
      },
    };
    getAllSectionsMock.mockReturnValue({ test : section });

    const styles = compileStyles(testThemes);

    const block = matchBlock(styles, { section : 'test', graphic : 'graphic' });
    expect(block?.[0]).contains(`--img-src: url('/graphic.jpg');`);
  });

  it('returns compiled relative graphic src', () => {
    baseUrl = 'http://example.com';
    const section = {
      ...testSection,
      graphics : {
        ...testSection.graphics,
        graphic : { ...testSection.graphics.graphic, src : 'graphic.jpg' },
      },
    };
    getAllSectionsMock.mockReturnValue({ test : section });

    const styles = compileStyles(testThemes);

    const block = matchBlock(styles, { section : 'test', graphic : 'graphic' });
    expect(block?.[0])
      .contains(`--img-src: url('http://example.com/graphic.jpg');`);
  });

  it('returns compiled absolute graphic src', () => {
    baseUrl = 'http://example.com';
    const section = {
      ...testSection,
      graphics : {
        ...testSection.graphics,
        graphic : {
          ...testSection.graphics.graphic,
          src : 'http://example.org/graphic.jpg',
        },
      },
    };
    getAllSectionsMock.mockReturnValue({ test : section });

    const styles = compileStyles(testThemes);

    const block = matchBlock(styles, { section : 'test', graphic : 'graphic' });
    expect(block?.[0])
      .contains(`--img-src: url('http://example.org/graphic.jpg');`);
  });

  it('returns compiled graphic alt text', () => {
    const section = {
      ...testSection,
      graphics : {
        ...testSection.graphics,
        graphic : { ...testSection.graphics.graphic, alt : 'Graphic' },
      },
    };
    getAllSectionsMock.mockReturnValue({ test : section });

    const styles = compileStyles(testThemes);

    const block = matchBlock(styles, { section : 'test', graphic : 'graphic' });
    expect(block?.[0]).contains(`--img-alt: Graphic;`);
  });

  it('returns compiled graphic image styles', () => {
    const section = {
      ...testSection,
      graphics : {
        ...testSection.graphics,
        graphic : {
          ...testSection.graphics.graphic,
          colourMap : { key1 : '#123456', key2 : '#234567' },
        },
      },
    };
    getAllSectionsMock.mockReturnValue({ test : section });

    const styles = compileStyles(testThemes);
    const block1 = matchBlock(
      styles,
      { section : 'test', graphic : 'graphic', img : 'key-1' },
    );
    const block2 = matchBlock(
      styles,
      { section : 'test', graphic : 'graphic', img : 'key-2' },
    );
    expect(block1).toHaveLength(1);
    expect(block2).toHaveLength(1);
  });

  it('returns compiled graphic image fill', () => {
    const section = {
      ...testSection,
      graphics : {
        ...testSection.graphics,
        graphic : {
          ...testSection.graphics.graphic,
          colourMap : { key : '#123456' },
        },
      },
    };
    getAllSectionsMock.mockReturnValue({ test : section });

    const styles = compileStyles(testThemes);

    const block = matchBlock(
      styles,
      { section : 'test', graphic : 'graphic', img : 'key' },
    );
    expect(block).toHaveLength(1);
    expect(block?.[0]).contains(`color: #123456;`);
  });
});
