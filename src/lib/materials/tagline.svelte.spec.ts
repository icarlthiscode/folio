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
import Tagline from './tagline.svelte';

vi.mock('$lib/materials/text.svelte', { spy : true });

beforeAll(async () => await loadStyles());

beforeEach(() => {
  vi.clearAllMocks();
  cleanup();
});

afterAll(() => { vi.restoreAllMocks(); });

describe('Tagline', () => {
  it('renders tagline text', async () => {
    const { container } = render(Tagline, {
      children : makeHtml('<span>Tagline Text</span>'),
    });

    expect(Text).toHaveBeenCalledOnce();
    expect(Text).toHaveBeenCalledWithProps(expect.objectContaining({
      centred : true,
      flex : true,
      as : 'p',
      typography : 'tagline',
    }));
    expect(Text)
      .not.toHaveBeenCalledWithProps(expect.objectContaining({ inset : true }));

    const content = page.elementLocator(container).getByText('Tagline Text');
    await expect.element(content).toBeInTheDocument();
  });
});
