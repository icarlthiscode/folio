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
import { addChildComponent, makeComponent } from '$lib/tests/component';
import SplitStack from './splitStack.svelte';

beforeAll(async () => await loadStyles());

beforeEach(() => {
  vi.clearAllMocks();
  cleanup();
});

afterAll(() => { vi.restoreAllMocks(); });

describe('SplitStack', () => {
  it.each([
    ['mobile', 280, []],
    ['mobile', 280, ['tablet', 'desktop', 'wide']],
    ['tablet', 768, []],
    ['tablet', 768, ['mobile', 'desktop', 'wide']],
    ['desktop', 1024, []],
    ['desktop', 1024, ['mobile', 'tablet', 'wide']],
    ['wide', 1440, []],
    ['wide', 1440, ['mobile', 'tablet', 'desktop']],
  ])(
    'renders unstacked content in %s view (max-width %spx; stack %s)',
    async (_, viewWidth, stack) => {
      await page.viewport(viewWidth, 1024);

      const { container } = render(SplitStack, {
        stack : stack as ('mobile' | 'tablet' | 'desktop' | 'wide')[],
      });

      container.style.setProperty('--layout-spacing', '16px');

      const splitStack = container.children[0] as HTMLElement;
      await expect.element(splitStack).toBeInTheDocument();
      addChildComponent(splitStack, makeComponent({ testId : 'content-0' }));
      addChildComponent(splitStack, makeComponent({ testId : 'content-1' }));

      const first = page.elementLocator(splitStack).getByTestId('content-0');
      const second = page.elementLocator(splitStack).getByTestId('content-1');
      await expect.element(first).toBeInTheDocument();
      await expect.element(second).toBeInTheDocument();

      const firstBounds = first.element().getBoundingClientRect();
      const secondBounds = second.element().getBoundingClientRect();

      expect(firstBounds.right).toEqual(secondBounds.left - 16);
    },
  );

  it('renders unstacked content with top alignment', async () => {
    await page.viewport(1024, 1024);

    const { container } = render(SplitStack, { alignment : 'start' });

    container.style.setProperty('--layout-spacing', '16px');

    container.style.setProperty('--layout-spacing', '16px');

    const splitStack = container.children[0] as HTMLElement;
    await expect.element(splitStack).toBeInTheDocument();
    addChildComponent(splitStack, makeComponent({
      testId : 'content-0',
      style : { height : '200px' },
    }));
    addChildComponent(splitStack, makeComponent({
      testId : 'content-1',
      style : { height : '100px' },
    }));

    const first = page.elementLocator(splitStack).getByTestId('content-0');
    const second = page.elementLocator(splitStack).getByTestId('content-1');
    await expect.element(first).toBeInTheDocument();
    await expect.element(second).toBeInTheDocument();

    const firstBounds = first.element().getBoundingClientRect();
    const secondBounds = second.element().getBoundingClientRect();

    expect(firstBounds.top).toEqual(secondBounds.top);
    expect(firstBounds.right).toEqual(secondBounds.left - 16);
  });

  it('renders unstacked content with centre alignment', async () => {
    await page.viewport(1024, 1024);

    const { container } = render(SplitStack, { alignment : 'centre' });

    container.style.setProperty('--layout-spacing', '16px');

    container.style.setProperty('--layout-spacing', '16px');

    const splitStack = container.children[0] as HTMLElement;
    await expect.element(splitStack).toBeInTheDocument();
    addChildComponent(splitStack, makeComponent({
      testId : 'content-0',
      style : { height : '200px' },
    }));
    addChildComponent(splitStack, makeComponent({
      testId : 'content-1',
      style : { height : '100px' },
    }));

    const first = page.elementLocator(splitStack).getByTestId('content-0');
    const second = page.elementLocator(splitStack).getByTestId('content-1');
    await expect.element(first).toBeInTheDocument();
    await expect.element(second).toBeInTheDocument();

    const firstBounds = first.element().getBoundingClientRect();
    const secondBounds = second.element().getBoundingClientRect();

    expect((firstBounds.top + firstBounds.bottom) / 2)
      .toEqual(secondBounds.top + (secondBounds.bottom - secondBounds.top) / 2);
    expect(firstBounds.right).toEqual(secondBounds.left - 16);
  });

  it('renders unstacked content with bottom alignment', async () => {
    await page.viewport(1024, 1024);

    const { container } = render(SplitStack, { alignment : 'end' });

    container.style.setProperty('--layout-spacing', '16px');

    container.style.setProperty('--layout-spacing', '16px');

    const splitStack = container.children[0] as HTMLElement;
    await expect.element(splitStack).toBeInTheDocument();
    addChildComponent(splitStack, makeComponent({
      testId : 'content-0',
      style : { height : '200px' },
    }));
    addChildComponent(splitStack, makeComponent({
      testId : 'content-1',
      style : { height : '100px' },
    }));

    const first = page.elementLocator(splitStack).getByTestId('content-0');
    const second = page.elementLocator(splitStack).getByTestId('content-1');
    await expect.element(first).toBeInTheDocument();
    await expect.element(second).toBeInTheDocument();

    const firstBounds = first.element().getBoundingClientRect();
    const secondBounds = second.element().getBoundingClientRect();

    expect(firstBounds.bottom).toEqual(secondBounds.bottom);
    expect(firstBounds.right).toEqual(secondBounds.left - 16);
  });

  it('renders unstacked divided content', async () => {
    await page.viewport(1024, 1024);

    const { container } = render(SplitStack, { divide : true });

    container.style.setProperty('--layout-spacing', '16px');
    container.style.setProperty('--border-colour', 'rgb(0, 0, 0)');
    container.style.setProperty('--border-width', '2px');

    const splitStack = container.children[0] as HTMLElement;
    await expect.element(splitStack).toBeInTheDocument();
    addChildComponent(splitStack, makeComponent({ testId : 'content-0' }));
    addChildComponent(splitStack, makeComponent({ testId : 'content-1' }));

    const first = page.elementLocator(splitStack).getByTestId('content-0');
    const second = page.elementLocator(splitStack).getByTestId('content-1');
    await expect.element(first).toBeInTheDocument();
    await expect.element(second).toBeInTheDocument();

    const firstStyle = getComputedStyle(first.element());
    const secondStyle = getComputedStyle(second.element());

    const firstBounds = first.element().getBoundingClientRect();
    const secondBounds = second.element().getBoundingClientRect();

    expect(firstStyle.borderRightWidth).toBe('2px');
    expect(firstStyle.borderRightColor).toBe('rgb(0, 0, 0)');
    expect(firstStyle.borderRightStyle).toBe('solid');
    expect(firstStyle.paddingLeft).toBe('0px');
    expect(firstStyle.paddingRight).toBe('16px');
    expect(secondStyle.paddingLeft).toBe('16px');
    expect(secondStyle.paddingRight).toBe('0px');

    expect(firstBounds.top).toEqual(secondBounds.top);
    expect(firstBounds.right).toEqual(secondBounds.left);
  });

  it.each([
    ['mobile', 767, ['mobile']],
    ['mobile', 767, ['mobile', 'tablet', 'desktop', 'wide']],
    ['tablet', 1023, ['tablet']],
    ['tablet', 1023, ['mobile', 'tablet', 'desktop', 'wide']],
    ['desktop', 1439, ['desktop']],
    ['desktop', 1439, ['mobile', 'tablet', 'desktop', 'wide']],
    ['wide', 1440, ['wide']],
    ['wide', 1440, ['mobile', 'tablet', 'desktop', 'wide']],
  ])(
    'renders stacked content with %s breakpoint in %s view (max-width %spx)',
    async (_, viewWidth, stack) => {
      await page.viewport(viewWidth, 1024);

      const { container } = render(SplitStack, {
        stack : stack as ('mobile' | 'tablet' | 'desktop' | 'wide')[],
      });

      container.style.setProperty('--layout-spacing', '16px');

      const splitStack = container.children[0] as HTMLElement;
      await expect.element(splitStack).toBeInTheDocument();
      addChildComponent(splitStack, makeComponent({ testId : 'content-0' }));
      addChildComponent(splitStack, makeComponent({ testId : 'content-1' }));

      const first = page.elementLocator(splitStack).getByTestId('content-0');
      const second = page.elementLocator(splitStack).getByTestId('content-1');
      await expect.element(first).toBeInTheDocument();
      await expect.element(second).toBeInTheDocument();

      const firstBounds = first.element().getBoundingClientRect();
      const secondBounds = second.element().getBoundingClientRect();

      expect(firstBounds.bottom).toEqual(secondBounds.top - 16);
    },
  );

  it('renders stacked content with left alignment', async () => {
    await page.viewport(767, 1024);

    const { container } = render(SplitStack, {
      stack : ['mobile', 'tablet', 'desktop', 'wide'],
      alignment : 'start',
    });

    container.style.setProperty('--layout-spacing', '16px');

    const splitStack = container.children[0] as HTMLElement;
    await expect.element(splitStack).toBeInTheDocument();
    addChildComponent(splitStack, makeComponent({
      testId : 'content-0',
      style : { width : '200px' },
    }));
    addChildComponent(splitStack, makeComponent({
      testId : 'content-1',
      style : { width : '100px' },
    }));

    const first = page.elementLocator(splitStack).getByTestId('content-0');
    const second = page.elementLocator(splitStack).getByTestId('content-1');
    await expect.element(first).toBeInTheDocument();
    await expect.element(second).toBeInTheDocument();

    const firstBounds = first.element().getBoundingClientRect();
    const secondBounds = second.element().getBoundingClientRect();

    expect(firstBounds.left).toEqual(secondBounds.left);
    expect(firstBounds.bottom).toEqual(secondBounds.top - 16);
  });

  it('renders stacked content with centre alignment', async () => {
    await page.viewport(767, 1024);

    const { container } = render(SplitStack, {
      stack : ['mobile', 'tablet', 'desktop', 'wide'],
      alignment : 'centre',
    });

    container.style.setProperty('--layout-spacing', '16px');

    const splitStack = container.children[0] as HTMLElement;
    await expect.element(splitStack).toBeInTheDocument();
    addChildComponent(splitStack, makeComponent({
      testId : 'content-0',
      style : { width : '200px' },
    }));
    addChildComponent(splitStack, makeComponent({
      testId : 'content-1',
      style : { width : '100px' },
    }));

    const first = page.elementLocator(splitStack).getByTestId('content-0');
    const second = page.elementLocator(splitStack).getByTestId('content-1');
    await expect.element(first).toBeInTheDocument();
    await expect.element(second).toBeInTheDocument();

    const firstBounds = first.element().getBoundingClientRect();
    const secondBounds = second.element().getBoundingClientRect();

    expect((firstBounds.left + firstBounds.right) / 2)
      .toEqual((secondBounds.left + secondBounds.right) / 2);
    expect(firstBounds.bottom).toEqual(secondBounds.top - 16);
  });

  it('renders stacked content with right alignment', async () => {
    await page.viewport(767, 1024);

    const { container } = render(SplitStack, {
      stack : ['mobile', 'tablet', 'desktop', 'wide'],
      alignment : 'end',
    });

    container.style.setProperty('--layout-spacing', '16px');

    const splitStack = container.children[0] as HTMLElement;
    await expect.element(splitStack).toBeInTheDocument();
    addChildComponent(splitStack, makeComponent({
      testId : 'content-0',
      style : { width : '200px' },
    }));
    addChildComponent(splitStack, makeComponent({
      testId : 'content-1',
      style : { width : '100px' },
    }));

    const first = page.elementLocator(splitStack).getByTestId('content-0');
    const second = page.elementLocator(splitStack).getByTestId('content-1');
    await expect.element(first).toBeInTheDocument();
    await expect.element(second).toBeInTheDocument();

    const firstBounds = first.element().getBoundingClientRect();
    const secondBounds = second.element().getBoundingClientRect();

    expect((firstBounds.right)).toEqual(secondBounds.right);
    expect(firstBounds.bottom).toEqual(secondBounds.top - 16);
  });

  it('renders stacked divided content', async () => {
    await page.viewport(767, 1024);

    const { container } = render(SplitStack, {
      stack : ['mobile', 'tablet', 'desktop', 'wide'],
      divide : true,
    });

    container.style.setProperty('--layout-spacing', '16px');
    container.style.setProperty('--border-colour', 'rgb(0, 0, 0)');
    container.style.setProperty('--border-width', '2px');

    const splitStack = container.children[0] as HTMLElement;
    await expect.element(splitStack).toBeInTheDocument();
    addChildComponent(splitStack, makeComponent({ testId : 'content-0' }));
    addChildComponent(splitStack, makeComponent({ testId : 'content-1' }));

    const first = page.elementLocator(splitStack).getByTestId('content-0');
    const second = page.elementLocator(splitStack).getByTestId('content-1');
    await expect.element(first).toBeInTheDocument();
    await expect.element(second).toBeInTheDocument();

    const firstStyle = getComputedStyle(first.element());
    const secondStyle = getComputedStyle(second.element());

    const firstBounds = first.element().getBoundingClientRect();
    const secondBounds = second.element().getBoundingClientRect();

    expect(firstStyle.borderBottomWidth).toBe('2px');
    expect(firstStyle.borderBottomColor).toBe('rgb(0, 0, 0)');
    expect(firstStyle.borderBottomStyle).toBe('solid');
    expect(firstStyle.paddingTop).toBe('0px');
    expect(firstStyle.paddingBottom).toBe('16px');
    expect(secondStyle.paddingTop).toBe('16px');
    expect(secondStyle.paddingBottom).toBe('0px');

    expect(firstBounds.bottom).toEqual(secondBounds.top);
    expect(firstBounds.left).toEqual(secondBounds.left);
  });

  it('renders reverse stacked content', async () => {
    await page.viewport(767, 1024);

    const { container } = render(SplitStack, {
      stack : ['mobile', 'tablet', 'desktop', 'wide'],
      stackOrder : 'reverse',
    });

    container.style.setProperty('--layout-spacing', '16px');

    const splitStack = container.children[0] as HTMLElement;
    await expect.element(splitStack).toBeInTheDocument();
    addChildComponent(splitStack, makeComponent({ testId : 'content-0' }));
    addChildComponent(splitStack, makeComponent({ testId : 'content-1' }));

    const first = page.elementLocator(splitStack).getByTestId('content-0');
    const second = page.elementLocator(splitStack).getByTestId('content-1');
    await expect.element(first).toBeInTheDocument();
    await expect.element(second).toBeInTheDocument();

    const firstBounds = first.element().getBoundingClientRect();
    const secondBounds = second.element().getBoundingClientRect();

    expect(firstBounds.top).toEqual(secondBounds.bottom + 16);
    expect(firstBounds.left).toEqual(secondBounds.left);
  });

  it('renders reverse stacked divided content', async () => {
    await page.viewport(767, 1024);

    const { container } = render(SplitStack, {
      divide : true,
      stack : ['mobile', 'tablet', 'desktop', 'wide'],
      stackOrder : 'reverse',
    });

    container.style.setProperty('--layout-spacing', '16px');
    container.style.setProperty('--border-colour', 'rgb(0, 0, 0)');
    container.style.setProperty('--border-width', '2px');

    const splitStack = container.children[0] as HTMLElement;
    await expect.element(splitStack).toBeInTheDocument();
    addChildComponent(splitStack, makeComponent({ testId : 'content-0' }));
    addChildComponent(splitStack, makeComponent({ testId : 'content-1' }));

    const first = page.elementLocator(splitStack).getByTestId('content-0');
    const second = page.elementLocator(splitStack).getByTestId('content-1');
    await expect.element(first).toBeInTheDocument();
    await expect.element(second).toBeInTheDocument();

    const firstStyle = getComputedStyle(first.element());
    const secondStyle = getComputedStyle(second.element());

    const firstBounds = first.element().getBoundingClientRect();
    const secondBounds = second.element().getBoundingClientRect();

    expect(secondStyle.borderBottomWidth).toBe('2px');
    expect(secondStyle.borderBottomColor).toBe('rgb(0, 0, 0)');
    expect(secondStyle.borderBottomStyle).toBe('solid');
    expect(firstStyle.paddingTop).toBe('16px');
    expect(firstStyle.paddingBottom).toBe('0px');
    expect(secondStyle.paddingTop).toBe('0px');
    expect(secondStyle.paddingBottom).toBe('16px');

    expect(firstBounds.top).toEqual(secondBounds.bottom);
    expect(firstBounds.left).toEqual(secondBounds.left);
  });
});
