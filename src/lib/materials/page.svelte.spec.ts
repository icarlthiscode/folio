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
import { makeComponent } from '$lib/tests/component';
import Page from './page.svelte';

const TestContent = makeComponent({
  testId : 'content',
  style : {
    'flex-grow' : '1',
    'width' : '100%',
  },
});

beforeAll(async () => await loadStyles());

beforeEach(() => {
  vi.clearAllMocks();
  cleanup();
});

afterAll(() => { vi.restoreAllMocks(); });

describe('Page', () => {
  it('renders content in page layout', async () => {
    await page.viewport(768, 1024);

    const { container } = render(Page, { children : TestContent });

    container.style.setProperty('width', '100%');

    const main = page.elementLocator(container).getByRole('main');
    const content = page.elementLocator(container).getByTestId('content');
    await expect.element(main).toBeInTheDocument();
    await expect.element(content).toBeInTheDocument();

    const mainBounds = main.element().getBoundingClientRect();
    const contentBounds = content.element().getBoundingClientRect();

    expect(mainBounds.left).toEqual(0);
    expect(mainBounds.top).toEqual(0);
    expect(mainBounds.width).toEqual(window.innerWidth);
    expect(mainBounds.height).toEqual(window.innerHeight);
    expect(contentBounds.left).toEqual(mainBounds.left);
    expect(contentBounds.top).toEqual(mainBounds.top);
    expect(contentBounds.right).toEqual(mainBounds.right);
    expect(contentBounds.bottom).toEqual(mainBounds.bottom);
  });

  it('limits min width to 340px', async () => {
    await page.viewport(300, 600);

    const { container } = render(Page, { children : TestContent });

    const main = page.elementLocator(container).getByRole('main');
    const mainBounds = main.element().getBoundingClientRect();

    expect(mainBounds.left).toEqual(mainBounds.right - 340);
    expect(mainBounds.width).toEqual(340);
  });
});
