import { beforeAll, beforeEach, describe, it, expect } from 'vitest';
import { page } from 'vitest/browser';
import { cleanup, render } from '@testing-library/svelte';

import { loadStyles } from '$lib/tests/browser';
import { makeComponent } from '$lib/tests/component';
import Card from './card.svelte';

const TestComponent = makeComponent({ testId : 'child' });

beforeAll(async () => await loadStyles());
beforeEach(() => { cleanup(); });

describe('Card', () => {
  it('renders children', async () => {
    const { container } = render(Card, { children : TestComponent });

    const index = page.elementLocator(container).getByTestId('child');
    await expect.element(index).toBeInTheDocument();
  });
});
