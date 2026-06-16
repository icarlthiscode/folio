import { beforeAll, beforeEach, describe, it, expect } from 'vitest';
import { page } from 'vitest/browser';
import { cleanup, render } from '@testing-library/svelte';

import { loadStyles } from '$lib/tests/browser';
import { makeHtml } from '$lib/tests/component';
import Article from './article.svelte';

beforeAll(async () => await loadStyles());
beforeEach(() => { cleanup(); });

describe('Article', () => {
  it('renders content', async () => {
    const { container } = render(Article, {
      children : makeHtml('<p data-testid="article-content">Test Article</p>'),
    });
    const content = page.elementLocator(container)
      .getByTestId('article-content');
    await expect.element(content).toBeInTheDocument();
  });

  it('renders content scrim', async () => {
    const expectedScrim = 8;
    const { container } = render(Article, {
      children : makeHtml('<p data-testid="article-content">Test Article</p>'),
    });

    container.style.setProperty('padding', '32px');
    container.style.setProperty('background-color', '#000');
    container.style.setProperty('--font-size', `${expectedScrim * 2}px`);
    container.style.setProperty(
      '--scrim-colour',
      'color-mix(in srgb, rgba(255, 255, 255, 0.9) 66%, transparent 33%)',
    );

    const article = page
      .elementLocator(container.firstElementChild as HTMLElement);
    const articleStyle = getComputedStyle(article.element());
    const backgroundAlpha = parseFloat(articleStyle.backgroundColor
      .match(/\/\s*([0-9.]+)/)?.[1] ?? '');
    const boxShadowBlur = articleStyle.boxShadow
      .match(/([0-9]+[a-z]+) [0-9]+[a-z]+$/)?.[1] ?? '';
    const boxShadowSpread = articleStyle.boxShadow
      .match(/([a-z0-9]+)$/)?.[1] ?? '';
    const boxShadowAlpha = parseFloat(articleStyle.boxShadow
      .match(/\/\s*([0-9.]+)/)?.[1] ?? '');
    expect(backgroundAlpha).toBeCloseTo(0.6, 2);
    expect(boxShadowAlpha).toBeCloseTo(0.6, 2);
    expect(boxShadowBlur).toBe('8px');
    expect(boxShadowSpread).toBe('8px');
  });

  it('renders alerts', async () => {
    const { container } = render(Article, {
      children : makeHtml('<div display="contents">'
        + '<p>This is a normal paragraph.</p>'
        + '<blockquote data-testid="blockquote" '
        + 'class="text typography-note typography-alert-warning">'
        + '<p class="text alert typography-alert">WARNING!</p>'
        + '<p class="text typography-note">This is a warning alert.</p>'
        + '</blockquote>'
        + '</div>'),
    });

    container.style.setProperty('--font-size', '16px');
    container.style.setProperty('--padding-inset', '24px');
    container.style.setProperty('--text-colour', 'rgb(128, 128, 128)');
    container.style.setProperty('--text-bg-colour', 'rgb(247, 247, 247)');
    container.style.setProperty('--border-width', '4px');
    container.style.setProperty('--border-radius', '4px');

    const article = page
      .elementLocator(container.firstElementChild as HTMLElement);
    const bodyText = article
      .getByText('This is a normal paragraph.').element() as HTMLElement;
    const blockquote =
      article.getByTestId('blockquote').element() as HTMLElement;
    const alertLabel = page.elementLocator(blockquote)
      .getByText('WARNING!').element() as HTMLElement;
    const alertContent = page.elementLocator(blockquote)
      .getByText('This is a warning alert.').element() as HTMLElement;

    const blockquoteStyle = getComputedStyle(blockquote);
    const contentStyle = getComputedStyle(alertContent);

    const bodyBounds = bodyText.getBoundingClientRect();
    const blockquoteBounds = blockquote.getBoundingClientRect();
    const labelBounds = alertLabel.getBoundingClientRect();
    const contentBounds = alertContent.getBoundingClientRect();

    expect(blockquoteStyle.borderLeftWidth).toBe('8px');
    expect(blockquoteStyle.borderRadius).toBe('4px');
    expect(blockquoteStyle.color).toBe('rgb(128, 128, 128)');
    expect(blockquoteStyle.backgroundColor).toBe('rgb(247, 247, 247)');
    expect(blockquoteStyle.whiteSpace).toBe('normal');

    expect(contentStyle.whiteSpace).toBe('normal');

    expect(blockquoteBounds.top).toEqual(bodyBounds.bottom + 16);
    expect(blockquoteBounds.left).toEqual(bodyBounds.left);
    expect(blockquoteBounds.width).toEqual(bodyBounds.width);

    expect(labelBounds.top).toEqual(blockquoteBounds.top + 12);
    expect(labelBounds.left).toEqual(blockquoteBounds.left + 12 + 8);

    expect(contentBounds.top).toEqual(labelBounds.bottom + 16);
    expect(contentBounds.left).toEqual(blockquoteBounds.left + 12 + 8);
    expect(contentBounds.bottom).toEqual(blockquoteBounds.bottom - 12);
  });

  it('renders inline code', async () => {
    const { container } = render(Article, {
      children : makeHtml('<p>This is '
        + '<code class="text code">inline_code</code>.</p>'),
    });

    container.style.setProperty('--border-radius', '2px');

    const article = page
      .elementLocator(container.firstElementChild as HTMLElement);
    const codeElement =
      article.getByText('inline_code').element() as HTMLElement;

    codeElement.style.setProperty('--text-bg-colour', 'rgb(111, 111, 111)');

    const codeStyle = getComputedStyle(codeElement);

    expect(codeStyle.backgroundColor).toBe('rgb(111, 111, 111)');
    expect(codeStyle.borderRadius).toBe('2px');
  });

  it('renders code blocks', async () => {
    const { container } = render(Article, {
      children : makeHtml('<pre><code class="text code-block">'
        + '<span class="text">const</span> x = 10;</code></pre>'),
    });

    container.style.setProperty('--padding-inset', '24px');
    container.style.setProperty('--border-radius', '8px');

    const article = page
      .elementLocator(container.firstElementChild as HTMLElement);
    const codeElement = article.element().querySelector('code') as HTMLElement;

    const keywordElement = page.elementLocator(codeElement)
      .getByText('const');

    codeElement.style.setProperty('background-color', 'rgb(111, 111, 111)');

    const codeStyle = getComputedStyle(codeElement);
    const keywordStyle = getComputedStyle(keywordElement.element());

    const articleBounds = article.element().getBoundingClientRect();
    const codeBounds = codeElement.getBoundingClientRect();

    expect(codeBounds.width).toEqual(articleBounds.width);

    expect(codeStyle.padding).toBe('12px');
    expect(codeStyle.borderRadius).toBe('8px');
    expect(codeStyle.backgroundColor).toBe('rgb(111, 111, 111)');
    expect(codeStyle.overflowX).toBe('auto');
    expect(keywordStyle.whiteSpace).toBe('pre');
  });

  it('limits max width to desktop size', async () => {
    await page.viewport(1040, 800);
    const { container } = render(Article, {
      children : makeHtml('<p data-testid="article-content">Test Article</p>'),
    });

    container.style.setProperty('width', '100%');
    container.style.setProperty('padding', '16px');
    container.style.setProperty('--layout-spacing', '16px');

    const article = page
      .elementLocator(container.firstElementChild as HTMLElement);
    const articleStyle = getComputedStyle(article.element());
    expect(articleStyle.width).toBe('992px');
    expect(articleStyle.marginLeft).toBe('8px');
    expect(articleStyle.marginRight).toBe('8px');
  });
});
