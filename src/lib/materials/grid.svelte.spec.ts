import { beforeAll, beforeEach, describe, it, expect, vi } from 'vitest';
import { page } from 'vitest/browser';
import { cleanup, render } from '@testing-library/svelte';

import { loadStyles } from '$lib/tests/browser';
import { makeComponent, addChildComponent } from '$lib/tests/component';

import Grid from './grid.svelte';

const defaultSection = vi.hoisted(() => ({ grid : true }));
let setSection : ((value : unknown) => void) = vi.hoisted(() => () => {});

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

const TestComponent = makeComponent({
  testId : 'child',
  style : {
    display : 'inline-flex',
    width : '',
  },
});

beforeAll(async () => await loadStyles());

beforeEach(() => {
  vi.clearAllMocks();
  cleanup();
  setSection(defaultSection);
});

describe('Grid', () => {
  it('renders children on mobile', async () => {
    const expectedSpacing = 16;
    await page.viewport(767, 1024);

    const { container } = render(Grid, { children : TestComponent });

    container.style.setProperty('--layout-spacing', `${expectedSpacing}px`);

    const index = page.elementLocator(container).getByTestId('child');
    await expect.element(index).toBeInTheDocument();

    const children = page.elementLocator(container).getByTestId('child');
    await expect.element(children).toBeInTheDocument();

    const gridElement = children.element().parentElement as HTMLElement;

    addChildComponent(gridElement, TestComponent);
    addChildComponent(gridElement, TestComponent);
    addChildComponent(gridElement, TestComponent);

    await expect.poll(() => children.elements().length).toBe(4);
    const child1 = children.elements()[0] as HTMLElement;
    const child2 = children.elements()[1] as HTMLElement;
    const child3 = children.elements()[2] as HTMLElement;
    const child4 = children.elements()[3] as HTMLElement;

    const gridBounds = gridElement.getBoundingClientRect();
    const bounds1 = child1.getBoundingClientRect();
    const bounds2 = child2.getBoundingClientRect();
    const bounds3 = child3.getBoundingClientRect();
    const bounds4 = child4.getBoundingClientRect();

    expect(bounds1.left).toEqual(gridBounds.left);
    expect(bounds1.right).toEqual(gridBounds.right);
    expect(bounds1.top).toEqual(gridBounds.top);
    expect(bounds2.left).toEqual(gridBounds.left);
    expect(bounds2.right).toEqual(gridBounds.right);
    expect(bounds2.top).toEqual(bounds1.bottom + expectedSpacing);
    expect(bounds3.left).toEqual(gridBounds.left);
    expect(bounds3.right).toEqual(gridBounds.right);
    expect(bounds3.top).toEqual(bounds2.bottom + expectedSpacing);
    expect(bounds4.left).toEqual(gridBounds.left);
    expect(bounds4.right).toEqual(gridBounds.right);
    expect(bounds4.top).toEqual(bounds3.bottom + expectedSpacing);
    expect(bounds4.bottom).toEqual(gridBounds.bottom);
  });

  it('renders children on tablet and desktop', async () => {
    const expectedSpacing = 16;
    await page.viewport(768, 1024);

    const { container } = render(Grid, { children : TestComponent });

    container.style.setProperty('--layout-spacing', `${expectedSpacing}px`);

    const index = page.elementLocator(container).getByTestId('child');
    await expect.element(index).toBeInTheDocument();

    const children = page.elementLocator(container).getByTestId('child');
    await expect.element(children).toBeInTheDocument();

    const gridElement = children.element().parentElement as HTMLElement;

    addChildComponent(gridElement, TestComponent);
    addChildComponent(gridElement, TestComponent);
    addChildComponent(gridElement, TestComponent);

    await expect.poll(() => children.elements().length).toBe(4);
    const child1 = children.elements()[0] as HTMLElement;
    const child2 = children.elements()[1] as HTMLElement;
    const child3 = children.elements()[2] as HTMLElement;
    const child4 = children.elements()[3] as HTMLElement;

    const gridBounds = gridElement.getBoundingClientRect();
    const bounds1 = child1.getBoundingClientRect();
    const bounds2 = child2.getBoundingClientRect();
    const bounds3 = child3.getBoundingClientRect();
    const bounds4 = child4.getBoundingClientRect();

    expect(bounds1.left).toEqual(gridBounds.left);
    expect(bounds1.top).toEqual(gridBounds.top);
    expect(bounds2.left).toEqual(bounds1.right + expectedSpacing);
    expect(bounds2.right).toEqual(gridBounds.right);
    expect(bounds2.top).toEqual(gridBounds.top);
    expect(bounds3.left).toEqual(gridBounds.left);
    expect(bounds3.top).toEqual(bounds2.bottom + expectedSpacing);
    expect(bounds4.left).toEqual(bounds3.right + expectedSpacing);
    expect(bounds4.right).toEqual(gridBounds.right);
    expect(bounds4.top).toEqual(bounds2.bottom + expectedSpacing);
    expect(bounds4.bottom).toEqual(gridBounds.bottom);
  });

  it('renders children on wide', async () => {
    const expectedSpacing = 16;
    await page.viewport(1440, 768);

    const { container } = render(Grid, { children : TestComponent });

    container.style.setProperty('--layout-spacing', `${expectedSpacing}px`);

    const index = page.elementLocator(container).getByTestId('child');
    await expect.element(index).toBeInTheDocument();

    const children = page.elementLocator(container).getByTestId('child');
    await expect.element(children).toBeInTheDocument();

    const gridElement = children.element().parentElement as HTMLElement;

    addChildComponent(gridElement, TestComponent);
    addChildComponent(gridElement, TestComponent);
    addChildComponent(gridElement, TestComponent);

    await expect.poll(() => children.elements().length).toBe(4);
    const child1 = children.elements()[0] as HTMLElement;
    const child2 = children.elements()[1] as HTMLElement;
    const child3 = children.elements()[2] as HTMLElement;
    const child4 = children.elements()[3] as HTMLElement;

    const gridBounds = gridElement.getBoundingClientRect();
    const bounds1 = child1.getBoundingClientRect();
    const bounds2 = child2.getBoundingClientRect();
    const bounds3 = child3.getBoundingClientRect();
    const bounds4 = child4.getBoundingClientRect();

    expect(bounds1.left).toEqual(gridBounds.left);
    expect(bounds1.top).toEqual(gridBounds.top);
    expect(bounds2.left).toEqual(bounds1.right + expectedSpacing);
    expect(bounds2.top).toEqual(gridBounds.top);
    expect(bounds3.left).toEqual(bounds2.right + expectedSpacing);
    expect(bounds3.right).toEqual(gridBounds.right);
    expect(bounds3.top).toEqual(gridBounds.top);
    expect(bounds4.left).toEqual(gridBounds.left);
    expect(bounds4.right).toEqual(bounds1.right);
    expect(bounds4.top).toEqual(bounds3.bottom + expectedSpacing);
    expect(bounds4.bottom).toEqual(gridBounds.bottom);
  });

  it('renders children in grid', async () => {
    const expectedSpacing = 16;
    await page.viewport(768, 1024);

    const { container } = render(Grid, { children : TestComponent });

    container.style.setProperty('--layout-spacing', `${expectedSpacing}px`);

    const index = page.elementLocator(container).getByTestId('child');
    await expect.element(index).toBeInTheDocument();

    const children = page.elementLocator(container).getByTestId('child');
    await expect.element(children).toBeInTheDocument();

    const gridElement = children.element().parentElement as HTMLElement;

    addChildComponent(gridElement, TestComponent);
    addChildComponent(gridElement, TestComponent);

    await expect.poll(() => children.elements().length).toBe(3);
    const child1 = children.elements()[0] as HTMLElement;
    const child2 = children.elements()[1] as HTMLElement;
    const child3 = children.elements()[2] as HTMLElement;

    const gridBounds = gridElement.getBoundingClientRect();
    const bounds1 = child1.getBoundingClientRect();
    const bounds2 = child2.getBoundingClientRect();
    const bounds3 = child3.getBoundingClientRect();

    expect(bounds1.left).toEqual(gridBounds.left);
    expect(bounds1.top).toEqual(gridBounds.top);
    expect(bounds2.left).toEqual(bounds1.right + expectedSpacing);
    expect(bounds2.right).toEqual(gridBounds.right);
    expect(bounds2.top).toEqual(gridBounds.top);
    expect(bounds3.left).toEqual(gridBounds.left);
    expect(bounds3.top).toEqual(bounds2.bottom + expectedSpacing);
    expect(bounds3.width).toEqual(bounds1.width);
  });

  it('renders children in grid', async () => {
    setSection({ grid : false });
    const expectedSpacing = 16;
    await page.viewport(768, 1024);

    const { container } = render(Grid, { children : TestComponent });

    container.style.setProperty('--layout-spacing', `${expectedSpacing}px`);

    const index = page.elementLocator(container).getByTestId('child');
    await expect.element(index).toBeInTheDocument();

    const children = page.elementLocator(container).getByTestId('child');
    await expect.element(children).toBeInTheDocument();

    const gridElement = children.element().parentElement as HTMLElement;

    addChildComponent(gridElement, TestComponent);
    addChildComponent(gridElement, TestComponent);

    await expect.poll(() => children.elements().length).toBe(3);
    const child1 = children.elements()[0] as HTMLElement;
    const child2 = children.elements()[1] as HTMLElement;
    const child3 = children.elements()[2] as HTMLElement;

    const gridBounds = gridElement.getBoundingClientRect();
    const bounds1 = child1.getBoundingClientRect();
    const bounds2 = child2.getBoundingClientRect();
    const bounds3 = child3.getBoundingClientRect();

    expect(bounds1.left).toEqual(gridBounds.left);
    expect(bounds1.top).toEqual(gridBounds.top);
    expect(bounds2.left).toEqual(bounds1.right + expectedSpacing);
    expect(bounds2.right).toEqual(gridBounds.right);
    expect(bounds2.top).toEqual(gridBounds.top);
    expect(bounds3.left).toEqual(gridBounds.left);
    expect(bounds3.top).toEqual(bounds2.bottom + expectedSpacing);
    expect(bounds3.right).toEqual(gridBounds.right);
  });
});
