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

beforeAll(async () => await loadStyles());

beforeEach(() => {
  vi.clearAllMocks();
  cleanup();
});

afterAll(() => { vi.restoreAllMocks(); });

describe('Text', () => {
  it('renders content within semantic element', async () => {
    const { container } = render(Text, {
      as : 'p',
      children : makeHtml('<span>Test Text</span>'),
    });

    const content = container.querySelector('p');
    expect(content).toBeInTheDocument();
    expect(content).toHaveTextContent('Test Text');
  });

  it('renders text with id', async () => {
    const { container } = render(Text, {
      id : 'test-id',
      children : makeHtml('<span>Test Text</span>'),
    });

    const content = container.querySelector('#test-id');
    expect(content).toBeInTheDocument();
    expect(content).toHaveTextContent('Test Text');
  });

  it('applies typography', async () => {
    const { container } = render(Text, {
      typography : 'body',
      children : makeHtml('<span>Test Text</span>'),
    });

    const content = container.querySelector('.typography-body');
    expect(content).toBeInTheDocument();
    expect(content).toHaveTextContent('Test Text');
  });

  it('centres text', async () => {
    await page.viewport(769, 1024);
    const { container } = render(Text, {
      centred : true,
      children : makeHtml('<span>Test Text</span>'),
    });

    const text = container.children[0] as HTMLElement;
    const contentStyle = getComputedStyle(text);
    expect(contentStyle.textAlign).toBe('center');
  });

  it('does not centre text on mobile viewport', async () => {
    await page.viewport(767, 1024);
    const { container } = render(Text, {
      centred : true,
      children : makeHtml('<span>Test Text</span>'),
    });

    const text = container.children[0] as HTMLElement;
    const contentStyle = getComputedStyle(text);
    expect(contentStyle.textAlign).toBe('left');
  });

  it('collapses flex text', async () => {
    await page.viewport(767, 1024);
    const { container } = render(Text, {
      flex : true,
      children : makeHtml('<span>Test Text</span>'),
    });

    container.style.setProperty('width', 'min-content');

    const text = container.children[0] as HTMLElement;
    const contentStyle = getComputedStyle(text);
    expect(contentStyle.width).toBe('min-content');
  });

  it('does not collapse flex text on table viewport', async () => {
    await page.viewport(768, 1024);
    const { container } = render(Text, {
      flex : true,
      children : makeHtml('<span>Test Text</span>'),
    });

    container.style.setProperty('width', 'min-content');

    const text = container.children[0] as HTMLElement;
    const contentStyle = getComputedStyle(text);
    expect(contentStyle.width).not.toBe('min-content');
  });

  it('insets content', async () => {
    const expectedInset = 16;
    const { container } = render(Text, {
      inset : true,
      children : makeHtml('<span>Test Text</span>'),
    });

    container.style.setProperty('--padding-inset', `${expectedInset}px`);

    const text = container.children[0] as HTMLElement;
    const content = page.elementLocator(container).getByText('Test Text');

    const textBounds = text.getBoundingClientRect();
    const contentBounds = content.element().getBoundingClientRect();

    expect(contentBounds.left).toBe(textBounds.left + expectedInset);
    expect(contentBounds.right).toBe(textBounds.right - expectedInset);
  });

  it('renders content scrim', async () => {
    const expectedScrim = 8;
    const { container } = render(Text, {
      scrim : true,
      children : makeHtml('<span>Test Text</span>'),
    });

    container.style.setProperty('padding', '32px');
    container.style.setProperty('background-color', '#000');
    container.style.setProperty('--font-size', `${expectedScrim * 2}px`);
    container.style.setProperty(
      '--scrim-colour',
      'color-mix(in srgb, rgba(255, 255, 255, 0.9) 66%, transparent 33%)',
    );

    const text = page
      .elementLocator(container.firstElementChild as HTMLElement);
    const textStyle = getComputedStyle(text.element());
    const backgroundAlpha = parseFloat(textStyle.backgroundColor
      .match(/\/\s*([0-9.]+)/)?.[1] ?? '');
    const boxShadowBlur = textStyle.boxShadow
      .match(/([0-9]+[a-z]+) [0-9]+[a-z]+$/)?.[1] ?? '';
    const boxShadowSpread = textStyle.boxShadow
      .match(/([a-z0-9]+)$/)?.[1] ?? '';
    const boxShadowAlpha = parseFloat(textStyle.boxShadow
      .match(/\/\s*([0-9.]+)/)?.[1] ?? '');
    expect(backgroundAlpha).toBeCloseTo(0.6, 2);
    expect(boxShadowAlpha).toBeCloseTo(0.6, 2);
    expect(boxShadowBlur).toBe('8px');
    expect(boxShadowSpread).toBe('8px');
  });

  it('renders content without scrim by default', async () => {
    const { container } = render(Text, {
      children : makeHtml('<span>Test Text</span>'),
    });

    container.style.setProperty('padding', '32px');
    container.style.setProperty('background-color', '#000');
    container.style.setProperty('--font-size', `16px`);
    container.style.setProperty(
      '--scrim-colour',
      'color-mix(in srgb, rgba(255, 255, 255, 0.9) 66%, transparent 33%)',
    );

    const article = page
      .elementLocator(container.firstElementChild as HTMLElement);
    const articleStyle = getComputedStyle(article.element());
    const backgroundColor = articleStyle.backgroundColor;
    const boxShadow = articleStyle.boxShadow;
    expect(backgroundColor).toBe('rgba(0, 0, 0, 0)');
    expect(boxShadow).toBe('none');
  });
});
