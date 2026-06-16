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

import Optional from './optional.svelte';

const TestContent = makeComponent({ testId : 'content' });

beforeAll(async () => await loadStyles());

beforeEach(() => {
  vi.clearAllMocks();
  cleanup();
});

afterAll(() => { vi.restoreAllMocks(); });

describe('Optional', () => {
  it.each([
    ['mobile', 280],
    ['tablet', 768],
    ['desktop', 1024],
    ['wide', 1440],
  ])(
    'displays content on %s view (min-width: %spx)',
    async (view, viewWidth) => {
      await page.viewport(viewWidth, 1024);

      const { container } = render(Optional, {
        display : [view] as ('mobile' | 'tablet' | 'desktop' | 'wide')[],
        children : TestContent,
      });

      const optional = page
        .elementLocator(container.children[0] as HTMLElement);
      await expect.element(optional).toBeInTheDocument();
      const content = optional.getByTestId('content');
      await expect.element(content).toBeInTheDocument();

      const optionalStyles = getComputedStyle(optional.element());
      expect(optionalStyles.display).not.toEqual('none');
    },
  );

  it.each([
    ['mobile', 280, ['tablet', 'desktop', 'wide']],
    ['tablet', 768, ['mobile', 'desktop', 'wide']],
    ['desktop', 1024, ['mobile', 'tablet', 'wide']],
    ['wide', 1440, ['mobile', 'tablet', 'desktop']],
  ])(
    'hides content on %s view (min-width: %spx)',
    async (view, viewWidth, display) => {
      await page.viewport(viewWidth, 1024);

      const { container } = render(Optional, {
        display : display as ('mobile' | 'tablet' | 'desktop' | 'wide')[],
        children : TestContent,
      });

      const optional = page
        .elementLocator(container.children[0] as HTMLElement);
      await expect.element(optional).toBeInTheDocument();
      const content = optional.getByTestId('content');
      await expect.element(content).toBeInTheDocument();

      const optionalStyles = getComputedStyle(optional.element());
      expect(optionalStyles.display).toEqual('none');
    },
  );
});
