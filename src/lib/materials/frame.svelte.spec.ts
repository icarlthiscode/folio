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
import Frame from './frame.svelte';

const defaultGraphic = vi.hoisted(() => ({
  src : 'frame.png',
  colourMap : {},
}));
let setGraphic : ((value : unknown) => void) = vi.hoisted(() => () => {});

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

vi.mock('./graphic.svelte', async original => ({
  default : await wrapOriginal(original, { testId : 'graphic' }),
}));

function calculateRotation(element : Element) : number {
  const transform = getComputedStyle(element).transform;
  if (transform === 'none') return 0;

  const values = transform?.match(/matrix\((.+)\)/)?.[1]?.split(', ')
    .map(Number);

  if (!values) return 0;
  const [a, b] = values;
  if (!a || !b) return 0;

  return Math.atan2(b, a) * (180 / Math.PI);
}

const TestContent = makeComponent({ testId : 'content' });

beforeAll(async () => await loadStyles());

beforeEach(() => {
  vi.clearAllMocks();
  cleanup();
  setGraphic(defaultGraphic);
});

afterAll(() => { vi.restoreAllMocks(); });

describe('Frame', () => {
  it('renders frame without rotation', async () => {
    await page.viewport(768, 1024);

    const { container } = render(Frame, { children : TestContent });

    const frame = container.children[0] as HTMLElement;
    await expect.element(frame).toBeInTheDocument();
    const graphicWrapper = page.elementLocator(frame).getByTestId('graphic');
    const graphic = graphicWrapper.element().children[0] as HTMLElement;
    await expect.element(graphic).toBeInTheDocument();
    const overlay = graphicWrapper.element().parentElement as HTMLElement;
    await expect.element(overlay).toBeInTheDocument();
    const content = page.elementLocator(frame).getByTestId('content');
    await expect.element(content).toBeInTheDocument();

    expect(Graphic).toHaveBeenCalledOnce();
    expect(Graphic).toHaveBeenCalledWithProps(expect.objectContaining({
      graphic : 'frame',
    }));

    const frameBounds = frame.getBoundingClientRect();
    const graphicBounds = graphic.getBoundingClientRect();
    const contentBounds = content.element().getBoundingClientRect();

    const frameRotation = calculateRotation(frame);
    const graphicRotation = calculateRotation(graphic);
    const contentRotation = calculateRotation(content.element());

    const topElement = document.elementFromPoint(
      frameBounds.left + (frameBounds.width / 2),
      frameBounds.top + (frameBounds.height / 2),
    ) as HTMLElement;

    expect(frameBounds.width).toEqual(16 * 16);
    expect(frameBounds.height).toEqual(16 * 16);
    expect(graphicBounds).toEqual(frameBounds);
    expect(contentBounds).toEqual(frameBounds);

    expect(frameRotation).toEqual(0);
    expect(graphicRotation).toEqual(0);
    expect(contentRotation).toEqual(0);

    expect(topElement).toBe(overlay);
  });

  it('renders mobile frame without rotation', async () => {
    await page.viewport(767, 1024);

    const { container } = render(Frame, { children : TestContent });

    const frame = container.children[0] as HTMLElement;
    await expect.element(frame).toBeInTheDocument();
    const graphicWrapper = page.elementLocator(frame).getByTestId('graphic');
    const graphic = graphicWrapper.element().children[0] as HTMLElement;
    await expect.element(graphic).toBeInTheDocument();
    const overlay = graphicWrapper.element().parentElement as HTMLElement;
    await expect.element(overlay).toBeInTheDocument();
    const content = page.elementLocator(frame).getByTestId('content');
    await expect.element(content).toBeInTheDocument();

    expect(Graphic).toHaveBeenCalledOnce();
    expect(Graphic).toHaveBeenCalledWithProps(expect.objectContaining({
      graphic : 'frame',
    }));

    const frameBounds = frame.getBoundingClientRect();
    const graphicBounds = graphic.getBoundingClientRect();
    const contentBounds = content.element().getBoundingClientRect();

    const frameRotation = calculateRotation(frame);
    const graphicRotation = calculateRotation(graphic);
    const contentRotation = calculateRotation(content.element());

    const topElement = document.elementFromPoint(
      frameBounds.left + (frameBounds.width / 2),
      frameBounds.top + (frameBounds.height / 2),
    ) as HTMLElement;

    expect(frameBounds.width).toEqual(12 * 16);
    expect(frameBounds.height).toEqual(12 * 16);
    expect(graphicBounds).toEqual(frameBounds);
    expect(contentBounds).toEqual(frameBounds);

    expect(frameRotation).toEqual(0);
    expect(graphicRotation).toEqual(0);
    expect(contentRotation).toEqual(0);

    expect(topElement).toBe(overlay);
  });

  it('renders frame with 45 degree rotation', async () => {
    await page.viewport(768, 1024);

    const { container } = render(Frame, {
      rotation : 45,
      children : TestContent,
    });

    const frame = container.children[0] as HTMLElement;
    await expect.element(frame).toBeInTheDocument();
    const graphicWrapper = page.elementLocator(frame).getByTestId('graphic');
    const graphic = graphicWrapper.element().children[0] as HTMLElement;
    await expect.element(graphic).toBeInTheDocument();
    const content = page.elementLocator(frame).getByTestId('content');
    await expect.element(content).toBeInTheDocument();

    expect(Graphic).toHaveBeenCalledOnce();
    expect(Graphic).toHaveBeenCalledWithProps(expect.objectContaining({
      graphic : 'frame',
    }));

    const frameBounds = frame.getBoundingClientRect();
    const graphicBounds = graphic.getBoundingClientRect();
    const contentBounds = content.element().getBoundingClientRect();

    const frameRotation = calculateRotation(frame);
    const graphicRotation = calculateRotation(graphic);
    const contentRotation = calculateRotation(content.element());

    expect(frameBounds.width).toBeCloseTo(16 * 16 * Math.SQRT2 ** 2, 0.1);
    expect(frameBounds.height).toBeCloseTo(16 * 16 * Math.SQRT2 ** 2, 0.1);
    expect(graphicBounds).toEqual(frameBounds);
    expect(contentBounds).toEqual(frameBounds);

    expect(frameRotation).toEqual(45);
    expect(graphicRotation).toEqual(0);
    expect(contentRotation).toEqual(-45);
  });

  it('renders mobile frame with 45 degree rotation', async () => {
    await page.viewport(767, 1024);

    const { container } = render(Frame, {
      rotation : 45,
      children : TestContent,
    });

    const frame = container.children[0] as HTMLElement;
    await expect.element(frame).toBeInTheDocument();
    const graphicWrapper = page.elementLocator(frame).getByTestId('graphic');
    const graphic = graphicWrapper.element().children[0] as HTMLElement;
    await expect.element(graphic).toBeInTheDocument();
    const content = page.elementLocator(frame).getByTestId('content');
    await expect.element(content).toBeInTheDocument();

    expect(Graphic).toHaveBeenCalledOnce();
    expect(Graphic).toHaveBeenCalledWithProps(expect.objectContaining({
      graphic : 'frame',
    }));

    const frameBounds = frame.getBoundingClientRect();
    const graphicBounds = graphic.getBoundingClientRect();
    const contentBounds = content.element().getBoundingClientRect();

    const frameRotation = calculateRotation(frame);
    const graphicRotation = calculateRotation(graphic);
    const contentRotation = calculateRotation(content.element());

    expect(frameBounds.width).toBeCloseTo(12 * 16 * Math.SQRT2 ** 2, 0.1);
    expect(frameBounds.height).toBeCloseTo(12 * 16 * Math.SQRT2 ** 2, 0.1);
    expect(graphicBounds).toEqual(frameBounds);
    expect(contentBounds).toEqual(frameBounds);

    expect(frameRotation).toEqual(45);
    expect(graphicRotation).toEqual(0);
    expect(contentRotation).toEqual(-45);
  });

  it('hides content overflow', async () => {
    const { container } = render(Frame, { children : TestContent });

    const content = page.elementLocator(container).getByTestId('content');
    await expect.element(content).toBeInTheDocument();
    const contentParent = content.element().parentElement as HTMLElement;
    expect(contentParent).toBeInTheDocument();

    const contentParentStyles = getComputedStyle(contentParent);
    expect(contentParentStyles.overflow).toBe('hidden');
  });

  it('does not render frame if no theme graphic', async () => {
    setGraphic(undefined);

    const { container } = render(Frame, { children : TestContent });

    const content = page.elementLocator(container).getByTestId('content');
    await expect.element(content).toBeInTheDocument();
    const contentParent = content.element().parentElement as HTMLElement;
    expect(contentParent).toBeInTheDocument();

    expect(Graphic).not.toHaveBeenCalled();

    const contentParentStyles = getComputedStyle(contentParent);
    expect(contentParentStyles.overflow).toBe('visible');
  });

  it('hides graphic when show is false', () => {
    const { container } = render(Frame, {
      show : false,
      children : TestContent,
    });

    const frame = container.children[0] as HTMLElement;
    expect(frame).toBeInTheDocument();

    expect(Graphic).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        show : false,
      }),
    );
  });
});
