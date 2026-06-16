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
import { makeHtml, wrapOriginal } from '$lib/tests/component';

import Icon from './icon.svelte';
import ListItem from './listItem.svelte';

vi.mock('$lib/materials/icon.svelte', async original => ({
  default : await wrapOriginal(original, { testId : 'icon' }),
}));

beforeAll(async () => await loadStyles());

beforeEach(() => {
  vi.clearAllMocks();
  cleanup();
});

afterAll(() => { vi.restoreAllMocks(); });

describe('ListItem', () => {
  it('renders list item with icon and text', async () => {
    const { container } = render(ListItem, {
      icon : 'test-icon',
      children : makeHtml('<span>List Item Text</span>'),
    });

    container.style.setProperty('--padding-inset', '32px');

    const listItem = page.elementLocator(container).getByRole('listitem');
    const icon = listItem.getByTestId('icon')
      .element()?.children[0] as HTMLElement;
    const content = listItem.getByText('List Item Text');
    await expect.element(listItem).toBeInTheDocument();
    await expect.element(icon).toBeInTheDocument();
    await expect.element(content).toBeInTheDocument();

    const listItemStyle = getComputedStyle(listItem.element());
    const iconStyle = getComputedStyle(icon);

    const iconBounds = icon.getBoundingClientRect();
    const contentBounds = content.element().getBoundingClientRect();

    expect(Icon).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ graphic : 'test-icon' }),
    );

    expect(parseFloat(listItemStyle.height))
      .toEqual(parseFloat(iconStyle.height) + (32 / 2));
    expect(iconBounds.right).toEqual(contentBounds.left - (32 / 2));
    expect((iconBounds.top + iconBounds.bottom) / 2)
      .toEqual((contentBounds.top + contentBounds.bottom) / 2);
  });

  it('hides icon if showIcon is false', () => {
    const { container } = render(ListItem, {
      icon : 'test-icon',
      showIcon : false,
      children : makeHtml('<span>List Item Text</span>'),
    });

    const listItem = container.children[0] as HTMLElement;
    expect(listItem).toBeInTheDocument();

    expect(Icon).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ show : false }),
    );
  });
});
