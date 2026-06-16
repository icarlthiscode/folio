import { beforeEach, afterAll, describe, it, expect, vi } from 'vitest';
import { render, within } from '@testing-library/svelte';

import { wrapOriginal } from '$lib/tests/component';
import Text from '$lib/materials/text.svelte';
import Dateline from './dateline.svelte';

vi.mock('$lib/materials/text.svelte', async (original) => {
  return { default : await wrapOriginal(original, { testId : 'text' }) };
});

beforeEach(() => { vi.clearAllMocks(); });
afterAll(() => { vi.restoreAllMocks(); });

describe('Contact', () => {
  it('renders dateline', () => {
    const expectedDate = new Date(0);
    const expectedContent = expectedDate.toLocaleDateString('en-CA', {
      day : 'numeric',
      month : 'long',
      year : 'numeric',
    });

    const { container } = render(Dateline, { date : expectedDate });

    const text = within(container).queryByTestId('text');
    expect(text).toBeInTheDocument();
    expect(text).toHaveTextContent(expectedContent);

    expect(Text).toHaveBeenCalledOnce();
    expect(Text).toHaveBeenCalledWithProps(expect.objectContaining({
      typography : 'detail',
      as : 'p',
    }));
  });

  it('does not render empty dateline', () => {
    const { container } = render(Dateline);
    expect(container.children.length).toBe(0);
  });
});
