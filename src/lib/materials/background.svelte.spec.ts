import {
  beforeAll,
  beforeEach,
  afterAll,
  describe,
  it,
  expect,
  vi,
} from 'vitest';
import { page } from 'vitest/browser';
import { cleanup, render } from '@testing-library/svelte';

import { loadStyles } from '$lib/tests/browser';
import { makeComponent, wrapOriginal } from '$lib/tests/component';
import Graphic from './graphic.svelte';
import Background from './background.svelte';

const svgTemplate = (text : string, size : string = '100%') => `
<svg width="${size}" height="${size}">
  <text
    x="50%"
    y="50%"
    dominant-baseline="middle"
    text-anchor="middle"
    font-family="sans-serif"
    font-style="italic"
  >
    ${text}
  </text>
</svg>
`;

const defaultSection = vi.hoisted(() => ({ background : { fill : '#FFF' } }));
let setSection : ((value : unknown) => void) = vi.hoisted(() => () => {});

let graphicContent = vi.hoisted(() => '');

vi.mock('$lib/hooks/useThemes', async (original) => {
  const originalDefault =
    ((await original()) as { default : () => object; }).default;
  const writable = (await import('svelte/store')).writable;
  const section = writable<unknown>();
  setSection = (value : unknown) => section.set(value);
  return {
    default : () => ({
      ...originalDefault(),
      section,
    }),
  };
});
vi.mock('$lib/hooks/useGraphics', async (original) => {
  const originalDefault =
    ((await original()) as { default : () => object; }).default;
  return {
    default : () => ({
      ...originalDefault(),
      isGraphic : vi.fn(() => !!graphicContent),
      renderGraphic : vi.fn(() => graphicContent),
    }),
  };
});

vi.mock('./graphic.svelte', async original => ({
  default : await wrapOriginal(original, { testId : 'graphic' }),
}));

const TestContent = makeComponent({
  testId : 'content',
  style : {
    width : '100%',
    height : '100px',
  },
});

beforeAll(async () => { await loadStyles(); });

beforeEach(() => {
  vi.clearAllMocks();
  cleanup();
  setSection(defaultSection);
  graphicContent = '';
});

afterAll(() => { vi.restoreAllMocks(); });

describe('Background', () => {
  it('renders background fill', async () => {
    setSection({ background : { fill : '#FFF' } });

    const { container } = render(Background, { children : TestContent });

    container.style.setProperty('display', 'flex');
    container.style.setProperty('width', '100%');
    container.style.setProperty('height', '200px');
    container.style.setProperty('--bg-colour', 'rgb(220, 220, 220)');

    const background = container.children[0] as HTMLElement;
    await expect.element(background).toBeInTheDocument();
    const content = page.elementLocator(background)
      .getByTestId('content').element().children[0] as HTMLElement;
    await expect.element(content).toBeInTheDocument();

    const underlay = Array.from(background.children)
      .find(c => getComputedStyle(c).position === 'absolute') as HTMLElement;
    await expect.element(underlay).toBeInTheDocument();
    const backgroundGraphic =
      page.elementLocator(background).getByTestId('graphic');
    await expect.element(backgroundGraphic).not.toBeInTheDocument();

    const underlayStyle = getComputedStyle(underlay);

    const containerBounds = container.getBoundingClientRect();
    const underlayBounds = underlay.getBoundingClientRect();
    const contentBounds = content.getBoundingClientRect();

    expect(underlayStyle.backgroundColor).toBe('rgb(220, 220, 220)');

    expect(underlayBounds.left).toBeLessThanOrEqual(containerBounds.left);
    expect(underlayBounds.top).toBeLessThanOrEqual(containerBounds.top);
    expect(underlayBounds.right)
      .toBeGreaterThanOrEqual(containerBounds.right);
    expect(underlayBounds.bottom)
      .toBeGreaterThanOrEqual(containerBounds.bottom);

    expect(document.elementFromPoint(
      (contentBounds.left + contentBounds.right) / 2,
      (contentBounds.top + contentBounds.bottom) / 2,
    )).toBe(content);
  });

  it('renders cover background image', async () => {
    const { container } = render(Background, { children : TestContent });

    container.style.setProperty('display', 'flex');
    container.style.setProperty('width', '100%');
    container.style.setProperty('height', '200px');
    container.style.setProperty('--bg-img', 'url(test-background.png)');
    container.style.setProperty('--bg-size', 'cover');
    container.style.setProperty('--bg-repeat', 'no-repeat');

    const background = container.children[0] as HTMLElement;
    await expect.element(background).toBeInTheDocument();
    const underlay = Array.from(background.children)
      .find(c => getComputedStyle(c).position === 'absolute') as HTMLElement;
    await expect.element(underlay).toBeInTheDocument();

    const backgroundGraphic =
      page.elementLocator(background).getByTestId('graphic');
    await expect.element(backgroundGraphic).not.toBeInTheDocument();

    const underlayStyle = getComputedStyle(underlay);

    expect(underlayStyle.backgroundImage).toContain('/test-background.png');
    expect(underlayStyle.backgroundSize).toBe('cover');
    expect(underlayStyle.backgroundRepeat).toBe('no-repeat');
  });

  it('renders tiled background image', async () => {
    const { container } = render(Background, { children : TestContent });

    container.style.setProperty('display', 'flex');
    container.style.setProperty('width', '100%');
    container.style.setProperty('height', '200px');
    container.style.setProperty('--bg-img', 'url(test-background.png)');
    container.style.setProperty('--bg-size', 'auto');
    container.style.setProperty('--bg-repeat', 'repeat');

    const background = container.children[0] as HTMLElement;
    await expect.element(background).toBeInTheDocument();
    const underlay = Array.from(background.children)
      .find(c => getComputedStyle(c).position === 'absolute') as HTMLElement;
    await expect.element(underlay).toBeInTheDocument();

    const backgroundGraphic =
      page.elementLocator(background).getByTestId('graphic');
    await expect.element(backgroundGraphic).not.toBeInTheDocument();

    const underlayStyle = getComputedStyle(underlay);

    expect(underlayStyle.backgroundImage).toContain('/test-background.png');
    expect(underlayStyle.backgroundSize).toBe('auto');
    expect(underlayStyle.backgroundRepeat).toBe('repeat');
  });

  it('renders fixed background image', async () => {
    const { container } = render(Background, { children : TestContent });

    container.style.setProperty('display', 'flex');
    container.style.setProperty('width', '100%');
    container.style.setProperty('height', '200px');
    container.style.setProperty('--bg-img', 'url(test-background.png)');
    container.style.setProperty('--bg-size', 'auto');
    container.style.setProperty('--bg-position', 'top right');

    const background = container.children[0] as HTMLElement;
    await expect.element(background).toBeInTheDocument();
    const underlay = Array.from(background.children)
      .find(c => getComputedStyle(c).position === 'absolute') as HTMLElement;
    await expect.element(underlay).toBeInTheDocument();

    const backgroundGraphic =
      page.elementLocator(background).getByTestId('graphic');
    await expect.element(backgroundGraphic).not.toBeInTheDocument();

    const underlayStyle = getComputedStyle(underlay);

    expect(underlayStyle.backgroundImage).toContain('/test-background.png');
    expect(underlayStyle.backgroundSize).toBe('auto');
    expect(underlayStyle.backgroundPosition).toBe('100% 0%');
  });

  it('does not render background image if show is false', async () => {
    const { container } = render(Background, {
      show : false,
      children : TestContent,
    });

    container.style.setProperty('display', 'flex');
    container.style.setProperty('width', '100%');
    container.style.setProperty('height', '200px');
    container.style.setProperty('--bg-img', 'url(test-background.png)');

    const background = container.children[0] as HTMLElement;
    await expect.element(background).toBeInTheDocument();
    const underlay = Array.from(background.children)
      .find(c => getComputedStyle(c).position === 'absolute') as HTMLElement;
    await expect.element(underlay).toBeInTheDocument();

    const underlayStyle = getComputedStyle(underlay);

    expect(underlayStyle.backgroundImage).not.toContain('/test-background.png');
  });

  it('renders covering SVG background image', async () => {
    const expectedOutset = 0.1;
    setSection({ background : { img : { src : 'test-background.svg' } } });
    graphicContent = svgTemplate('Background Graphic');

    const { container } = render(Background, { children : TestContent });

    container.style.setProperty('display', 'flex');
    container.style.setProperty('width', '100%');
    container.style.setProperty('height', '200px');
    container.style.setProperty('--bg-img', 'url(test-background.png)');

    const background = container.children[0] as HTMLElement;

    const backgroundGraphic =
      page.elementLocator(background).getByTestId('graphic');
    await expect.element(backgroundGraphic).toBeInTheDocument();

    const svg = backgroundGraphic.element().querySelector('svg') as SVGElement;
    await expect.element(svg).toBeInTheDocument();

    expect(Graphic).toHaveBeenCalledOnce();
    expect(Graphic).toHaveBeenCalledWithProps(expect.objectContaining({
      src : 'test-background.svg',
    }));

    setSection({ background : { img : {
      src : 'updated-background.svg',
    } } });

    expect(Graphic).toHaveBeenCalledWithProps(expect.objectContaining({
      src : 'updated-background.svg',
    }));

    const backgroundStyle = getComputedStyle(background);
    const backgroundBounds = background.getBoundingClientRect();
    const svgBounds = svg.getBoundingClientRect();

    expect(backgroundStyle.backgroundImage).toBe('none');

    expect(svgBounds.top).toBeCloseTo(
      backgroundBounds.top - (backgroundBounds.height * expectedOutset),
      1,
    );
    expect(svgBounds.left).toBeCloseTo(
      backgroundBounds.left - (backgroundBounds.width * expectedOutset),
      1,
    );
    expect(svgBounds.right).toBeCloseTo(
      backgroundBounds.right + (backgroundBounds.width * expectedOutset),
      1,
    );
    expect(svgBounds.bottom).toBeCloseTo(
      backgroundBounds.bottom + (backgroundBounds.height * expectedOutset),
      1,
    );
  });

  it('renders left anchored SVG background image', async () => {
    const expectedSize = 50;
    setSection({ background : { img : {
      src : 'test-background.svg',
      mode : 'fixed',
      anchor : 'left',
    } } });
    graphicContent = svgTemplate('Background Graphic', `${expectedSize}px`);

    const { container } = render(Background, { children : TestContent });

    container.style.setProperty('display', 'flex');
    container.style.setProperty('width', '100%');
    container.style.setProperty('height', '200px');
    container.style.setProperty('--bg-img', 'url(test-background.png)');

    const background = container.children[0] as HTMLElement;

    const backgroundGraphic =
      page.elementLocator(background).getByTestId('graphic');
    await expect.element(backgroundGraphic).toBeInTheDocument();

    const svg = backgroundGraphic.element().querySelector('svg') as SVGElement;
    await expect.element(svg).toBeInTheDocument();

    expect(Graphic).toHaveBeenCalledOnce();
    expect(Graphic).toHaveBeenCalledWithProps(expect.objectContaining({
      src : 'test-background.svg',
    }));

    const backgroundStyle = getComputedStyle(background);
    const backgroundBounds = background.getBoundingClientRect();
    const svgBounds = svg.getBoundingClientRect();

    expect(backgroundStyle.backgroundImage).toBe('none');

    expect(svgBounds.top).toEqual(backgroundBounds.top);
    expect(svgBounds.left).toEqual(backgroundBounds.left);
    expect(svgBounds.height).toEqual(expectedSize);
    expect(svgBounds.width).toEqual(expectedSize);
  });

  it('renders centred anchored SVG background image', async () => {
    const expectedSize = 50;
    setSection({ background : { img : {
      src : 'test-background.svg',
      mode : 'fixed',
      anchor : 'centre',
    } } });
    graphicContent = svgTemplate('Background Graphic', `${expectedSize}px`);

    const { container } = render(Background, { children : TestContent });

    container.style.setProperty('display', 'flex');
    container.style.setProperty('width', '100%');
    container.style.setProperty('height', '200px');
    container.style.setProperty('--bg-img', 'url(test-background.png)');

    const background = container.children[0] as HTMLElement;

    const backgroundGraphic =
      page.elementLocator(background).getByTestId('graphic');
    await expect.element(backgroundGraphic).toBeInTheDocument();

    const svg = backgroundGraphic.element().querySelector('svg') as SVGElement;
    await expect.element(svg).toBeInTheDocument();

    expect(Graphic).toHaveBeenCalledOnce();
    expect(Graphic).toHaveBeenCalledWithProps(expect.objectContaining({
      src : 'test-background.svg',
    }));

    const backgroundStyle = getComputedStyle(background);
    const backgroundBounds = background.getBoundingClientRect();
    const svgBounds = svg.getBoundingClientRect();

    expect(backgroundStyle.backgroundImage).toBe('none');

    expect(svgBounds.top).toEqual(backgroundBounds.top);
    expect(svgBounds.left).toEqual(
      backgroundBounds.left + (backgroundBounds.width / 2) - (expectedSize / 2),
    );
    expect(svgBounds.height).toEqual(expectedSize);
    expect(svgBounds.width).toEqual(expectedSize);
  });

  it('renders right anchored SVG background image', async () => {
    const expectedSize = 50;
    setSection({ background : { img : {
      src : 'test-background.svg',
      mode : 'fixed',
      anchor : 'right',
    } } });
    graphicContent = svgTemplate('Background Graphic', `${expectedSize}px`);

    const { container } = render(Background, { children : TestContent });

    container.style.setProperty('display', 'flex');
    container.style.setProperty('width', '100%');
    container.style.setProperty('height', '200px');
    container.style.setProperty('--bg-img', 'url(test-background.png)');

    const background = container.children[0] as HTMLElement;

    const backgroundGraphic =
      page.elementLocator(background).getByTestId('graphic');
    await expect.element(backgroundGraphic).toBeInTheDocument();

    const svg = backgroundGraphic.element().querySelector('svg') as SVGElement;
    await expect.element(svg).toBeInTheDocument();

    expect(Graphic).toHaveBeenCalledOnce();
    expect(Graphic).toHaveBeenCalledWithProps(expect.objectContaining({
      src : 'test-background.svg',
    }));

    const backgroundStyle = getComputedStyle(background);
    const backgroundBounds = background.getBoundingClientRect();
    const svgBounds = svg.getBoundingClientRect();

    expect(backgroundStyle.backgroundImage).toBe('none');

    expect(svgBounds.top).toEqual(backgroundBounds.top);
    expect(svgBounds.right).toEqual(backgroundBounds.right);
    expect(svgBounds.height).toEqual(expectedSize);
    expect(svgBounds.width).toEqual(expectedSize);
  });

  it('renders SVG background image on first pass', async () => {
    setSection({ background : { img : { src : 'test-background.svg' } } });
    graphicContent = svgTemplate('Background Graphic');

    const { container } = render(Background, { children : TestContent });

    container.style.setProperty('--bg-img', 'url(test-background.png)');

    container.style.setProperty('display', 'flex');
    container.style.setProperty('width', '100%');
    container.style.setProperty('height', '200px');

    const background = container.children[0] as HTMLElement;

    const backgroundGraphic =
      page.elementLocator(background).getByTestId('graphic');
    await expect.element(backgroundGraphic).toBeInTheDocument();

    const svg = backgroundGraphic.element().querySelector('svg') as SVGElement;
    await expect.element(svg).toBeInTheDocument();

    const backgroundStyle = getComputedStyle(background);
    expect(backgroundStyle.backgroundImage).toBe('none');
  });

  it('renders SVG background image updates', async () => {
    setSection({ background : { img : { src : 'test-background.svg' } } });
    graphicContent = svgTemplate('Background Graphic');

    const { container } = render(Background, { children : TestContent });

    container.style.setProperty('display', 'flex');
    container.style.setProperty('width', '100%');
    container.style.setProperty('height', '200px');
    container.style.setProperty('--bg-img', 'url(test-background.png)');

    const background = container.children[0] as HTMLElement;

    const backgroundGraphic =
      page.elementLocator(background).getByTestId('graphic');
    await expect.element(backgroundGraphic).toBeInTheDocument();

    const svg = backgroundGraphic.element().querySelector('svg') as SVGElement;
    await expect.element(svg).toBeInTheDocument();

    expect(Graphic).toHaveBeenCalledOnce();
    expect(Graphic).toHaveBeenCalledWithProps(expect.objectContaining({
      src : 'test-background.svg',
    }));

    setSection({ background : { img : {
      src : 'updated-background.svg',
    } } });

    expect(Graphic).toHaveBeenCalledWithProps(expect.objectContaining({
      src : 'updated-background.svg',
    }));
  });
});
