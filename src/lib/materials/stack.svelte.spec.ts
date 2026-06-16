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
import { makeComponent, addChildComponent } from '$lib/tests/component';

import Stack from './stack.svelte';

const TestContent = makeComponent({
  testId : 'content',
  style : {
    width : '100%',
    height : '100px',
  },
});

beforeAll(async () => await loadStyles());

beforeEach(() => {
  vi.clearAllMocks();
  cleanup();
});

afterAll(() => { vi.restoreAllMocks(); });

describe('Content', () => {
  it('renders content with margins', async () => {
    const expectedSpacing = 24;
    const { container } = render(Stack, { children : TestContent });

    container.style
      .setProperty('--layout-spacing', `${expectedSpacing / 1.5}px`);

    const stack = container.children[0] as HTMLElement;
    await expect.element(stack).toBeInTheDocument();
    const content = page.elementLocator(stack).getByTestId('content');
    await expect.element(content).toBeInTheDocument();

    const containerBounds = container.getBoundingClientRect();
    const stackBounds = stack.getBoundingClientRect();
    const contentBounds = content.element().getBoundingClientRect();

    expect(stackBounds.top - containerBounds.top)
      .toEqual(expectedSpacing);
    expect(stackBounds.bottom - containerBounds.bottom)
      .toEqual(-expectedSpacing);
    expect(stackBounds.left).toEqual(stackBounds.left);
    expect(stackBounds.right).toEqual(stackBounds.right);
    expect(contentBounds.top).toEqual(stackBounds.top);
    expect(contentBounds.bottom).toEqual(stackBounds.bottom);
    expect(contentBounds.left).toEqual(stackBounds.left);
    expect(contentBounds.right).toEqual(stackBounds.right);
  });
});
