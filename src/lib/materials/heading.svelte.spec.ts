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
import { makeHtml } from '$lib/tests/component';
import Text from './text.svelte';
import Heading from './heading.svelte';

vi.mock('$lib/materials/text.svelte', { spy : true });

beforeAll(async () => await loadStyles());

beforeEach(() => {
  vi.clearAllMocks();
  cleanup();
});

afterAll(() => { vi.restoreAllMocks(); });

describe('Heading', () => {
  it('renders heading text', async () => {
    const { container } = render(Heading, {
      level : 1,
      children : makeHtml('<span>Heading Text</span>'),
    });

    expect(Text).toHaveBeenCalledOnce();

    const content = page.elementLocator(container).getByText('Heading Text');
    await expect.element(content).toBeInTheDocument();
  });

  it.each([1, 2, 3, 4, 5, 6])('renders heading level %d', async (level) => {
    render(Heading, {
      level : level as 1 | 2 | 3 | 4 | 5 | 6,
      children : makeHtml('<span>Heading Text</span>'),
    });

    expect(Text).toHaveBeenCalledOnce();
    expect(Text).toHaveBeenCalledWithProps(expect.objectContaining({
      as : `h${level}`,
      typography : `heading-${level}`,
    }));
  });

  it('renders heading with id', async () => {
    render(Heading, {
      id : 'test-id',
      level : 1,
      children : makeHtml('<span>Heading Text</span>'),
    });

    expect(Text).toHaveBeenCalledOnce();
    expect(Text).toHaveBeenCalledWithProps(expect.objectContaining({
      id : 'test-id',
    }));
  });

  it('renders heading with scrim', async () => {
    render(Heading, {
      level : 1,
      scrim : true,
      children : makeHtml('<span>Heading Text</span>'),
    });

    expect(Text).toHaveBeenCalledOnce();
    expect(Text).toHaveBeenCalledWithProps(expect.objectContaining({
      scrim : true,
    }));
  });
});
