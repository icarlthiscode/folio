import {
  beforeAll,
  beforeEach,
  afterAll,
  describe,
  it,
  expect,
  vi,
} from 'vitest';
import { tick } from 'svelte';
import { cleanup, render } from '@testing-library/svelte';

import { loadStyles } from '$lib/tests/browser';
import Graphic from './graphic.svelte';

const svgTemplate = (text : string) => `
<svg width="100%" height="100%">
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

const defaultGraphic = vi.hoisted(() => ({
  src : 'default-graphic.svg',
  alt : 'Default Graphic',
}));
let setGraphic : ((value : unknown) => void) = vi.hoisted(() => () => {});

let graphicContent = vi.hoisted(() => '');

vi.mock('$lib/hooks/useThemes', async (original) => {
  const originalDefault =
    ((await original()) as { default : () => object; }).default;
  const writable = (await import('svelte/store')).writable;
  const graphic = writable<unknown>();
  setGraphic = (value : unknown) => graphic.set(value);
  return {
    default : () => ({
      ...originalDefault(),
      graphic,
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

beforeAll(async () => await loadStyles());

beforeEach(() => {
  vi.clearAllMocks();
  cleanup();
  setGraphic(defaultGraphic);
  graphicContent = '';
});

afterAll(() => { vi.restoreAllMocks(); });

describe('Graphic', () => {
  it('renders source image', async () => {
    const { container } = render(
      Graphic,
      { src : 'test-graphic.png', alt : 'Test Graphic' },
    );

    container.style.setProperty('display', 'block');
    container.style.setProperty('width', '200px');
    container.style.setProperty('height', '200px');
    container.style.setProperty('margin', '0 auto');

    const img = container.querySelector('img') as HTMLImageElement;
    await expect.element(img).toBeInTheDocument();
    await expect.element(img).toHaveAttribute('src', 'test-graphic.png');
    await expect.element(img).toHaveAttribute('alt', 'Test Graphic');

    const containerBounds = container.getBoundingClientRect();
    const imgBounds = img.getBoundingClientRect();

    expect(imgBounds.left).toEqual(containerBounds.left);
    expect(imgBounds.top).toEqual(containerBounds.top);
    expect(imgBounds.right).toEqual(containerBounds.right);
    expect(imgBounds.bottom).toEqual(containerBounds.bottom);
  });

  it('renders graphic image', async () => {
    setGraphic({ src : 'test-graphic.png', alt : 'Test Graphic' });

    const { container } = render(Graphic);

    container.style.setProperty('display', 'block');
    container.style.setProperty('width', '200px');
    container.style.setProperty('height', '200px');
    container.style.setProperty('margin', '0 auto');

    const img = container.querySelector('img') as HTMLImageElement;
    await expect.element(img).toBeInTheDocument();
    await expect.element(img).toHaveAttribute('src', 'test-graphic.png');
    await expect.element(img).toHaveAttribute('alt', 'Test Graphic');

    setGraphic({ src : 'alt-graphic.png', alt : 'Alt Graphic' });

    await tick();

    const updatedImg = container.querySelector('img') as HTMLImageElement;
    await expect.element(updatedImg).toBeInTheDocument();
    await expect.element(updatedImg).toHaveAttribute('src', 'alt-graphic.png');
    await expect.element(updatedImg).toHaveAttribute('alt', 'Alt Graphic');

    const containerBounds = container.getBoundingClientRect();
    const imgBounds = updatedImg.getBoundingClientRect();

    expect(imgBounds.left).toEqual(containerBounds.left);
    expect(imgBounds.top).toEqual(containerBounds.top);
    expect(imgBounds.right).toEqual(containerBounds.right);
    expect(imgBounds.bottom).toEqual(containerBounds.bottom);
  });

  it('does not render image if no source', async () => {
    setGraphic({ src : '' });
    const { container } = render(Graphic);
    const img = container.querySelector('img') as HTMLImageElement;
    await expect.element(img).not.toBeInTheDocument();
  });

  it('does not render image if show is false', async () => {
    setGraphic({ src : 'test-graphic.png', alt : 'Test Graphic' });

    const { container } = render(Graphic, { show : false });

    const img = container.querySelector('img') as HTMLImageElement;
    await expect.element(img).not.toBeInTheDocument();
  });

  it('renders source SVG', async () => {
    graphicContent = svgTemplate('Test Graphic');

    const { container } = render(Graphic, {
      src : 'test-graphic.svg',
    });

    container.style.setProperty('display', 'block');
    container.style.setProperty('width', '200px');
    container.style.setProperty('height', '200px');
    container.style.setProperty('margin', '0 auto');

    const svg = container.querySelector('svg') as SVGElement;
    await expect.element(svg).toBeInTheDocument();
    expect(svg.outerHTML).toContain('Test Graphic');

    const containerBounds = container.getBoundingClientRect();
    const svgBounds = svg.getBoundingClientRect();

    expect(svgBounds.left).toEqual(containerBounds.left);
    expect(svgBounds.top).toEqual(containerBounds.top);
    expect(svgBounds.right).toEqual(containerBounds.right);
    expect(svgBounds.bottom).toEqual(containerBounds.bottom);
  });

  it('renders graphic SVG', async () => {
    const graphic = { src : 'test-graphic.svg' };
    setGraphic(graphic);
    graphicContent = svgTemplate('Test Graphic');

    const { container } = render(Graphic);

    container.style.setProperty('display', 'block');
    container.style.setProperty('width', '200px');
    container.style.setProperty('height', '200px');
    container.style.setProperty('margin', '0 auto');

    const svg = container.querySelector('svg') as SVGElement;
    await expect.element(svg).toBeInTheDocument();
    expect(svg.outerHTML).toContain('Test Graphic');

    graphicContent = svgTemplate('Updated Graphic');
    setGraphic(graphic);

    await tick();

    const updatedSvg = container.querySelector('svg') as SVGElement;
    await expect.element(updatedSvg).toBeInTheDocument();
    expect(updatedSvg.outerHTML).toContain('Updated Graphic');

    const containerBounds = container.getBoundingClientRect();
    const svgBounds = updatedSvg.getBoundingClientRect();

    expect(svgBounds.left).toEqual(containerBounds.left);
    expect(svgBounds.top).toEqual(containerBounds.top);
    expect(svgBounds.right).toEqual(containerBounds.right);
    expect(svgBounds.bottom).toEqual(containerBounds.bottom);
  });

  it('does not render SVG if no source', async () => {
    setGraphic({ src : '' });
    const { container } = render(Graphic);
    const svg = container.querySelector('svg') as SVGElement;
    await expect.element(svg).not.toBeInTheDocument();
  });

  it('does not render SVG if show is false', async () => {
    const graphic = { src : 'test-graphic.svg' };
    setGraphic(graphic);
    graphicContent = svgTemplate('Test Graphic');

    const { container } = render(Graphic, { show : false });

    const svg = container.querySelector('svg') as SVGElement;
    await expect.element(svg).not.toBeInTheDocument();
  });
});
