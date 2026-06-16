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

import { tryGet } from '$lib/utils/typing';
import { loadStyles } from '$lib/tests/browser';
import { wrapOriginal } from '$lib/tests/component';
import Text from './text.svelte';
import Link from './link.svelte';
import navLinks from './navLinks.svelte';

vi.mock('$lib/materials/text.svelte', async original => ({
  default : await wrapOriginal(original, {
    testId : p =>
      `text-${tryGet(p, 'typography', s => typeof s === 'string') ?? 'none'}`,
  }),
}));
vi.mock('$lib/materials/link.svelte', async original => ({
  default : await wrapOriginal(original, { testId : 'link' }),
}));

beforeAll(async () => await loadStyles());

beforeEach(() => {
  vi.clearAllMocks();
  cleanup();
});

afterAll(() => { vi.restoreAllMocks(); });

describe('NavLinks', () => {
  it('does not render when no links provided', async () => {
    const { container } = render(navLinks);

    const child = container.children[0];
    expect(child).toBeUndefined();

    expect(Link).not.toHaveBeenCalled();
  });

  it('renders links', async () => {
    const links = [
      { text : 'Link 1', href : '#link1' },
      { text : 'Link 2', href : '#link2' },
    ];

    const { container } = render(navLinks, { links });

    const nav = page.elementLocator(container).getByRole('navigation');
    await expect.element(nav).toBeInTheDocument();

    const list = nav.getByRole('list');
    await expect.element(list).toBeInTheDocument();

    const items = list.getByRole('listitem');
    expect(items.elements()).toHaveLength(links.length);

    for (let i = 0; i < links.length; i++) {
      const item = items.elements()[i] as HTMLElement;
      const link = links[i];

      const text = page.elementLocator(item).getByTestId('text-nav');
      await expect.element(text).toBeInTheDocument();

      const anchor = text.getByRole('link');
      await expect.element(anchor).toBeInTheDocument();

      await expect.element(anchor).toHaveAttribute('href', link?.href);
      await expect.element(anchor).toHaveTextContent(link?.text ?? '');

      expect(Link).toHaveBeenCalledWithProps(expect.objectContaining({
        href : link?.href,
        scrim : true,
      }));
    }

    expect(Link).toHaveBeenCalledTimes(links.length);
    expect(Text).toHaveBeenCalledTimes(2 * links.length);
    let textCalls = 0;
    for (const [, args] of vi.mocked(Text).mock.calls) {
      if (args.typography !== 'nav') continue;
      expect(args).toEqual(expect.objectContaining({ as : 'span' }));
      textCalls += 1;
    }
    expect(textCalls).toEqual(2);
  });

  it('justifies links to left', async () => {
    const expectedGap = 32;
    const expectedMargin = expectedGap / 4;
    await page.viewport(768, 1024);

    const links = [
      { text : 'Link 1', href : '#link1' },
      { text : 'Link 2', href : '#link2' },
    ];

    const { container } = render(navLinks, { links, justify : 'start' });

    container.style.setProperty('width', '400px');
    container.style.setProperty('--padding-inset', `${expectedGap}px`);

    const nav = container.children[0] as HTMLElement;
    expect(nav).toBeInTheDocument();

    const anchors = page.elementLocator(container).getByRole('link').elements();
    expect(anchors.length).toBe(links.length);

    const first = anchors[0] as HTMLElement;
    const second = anchors[1] as HTMLElement;

    const containerBounds = container.getBoundingClientRect();
    const navBounds = nav.getBoundingClientRect();
    const firstBounds = first.getBoundingClientRect();
    const secondBounds = second.getBoundingClientRect();

    expect(navBounds.left).toEqual(containerBounds.left);
    expect(navBounds.right).toEqual(containerBounds.right);
    expect(firstBounds.top).toEqual(containerBounds.top + expectedMargin);
    expect(firstBounds.left).toEqual(containerBounds.left);
    expect(firstBounds.top).toEqual(secondBounds.top);
    expect(firstBounds.right).toEqual(secondBounds.left - expectedGap);
  });

  it('justifies links to right', async () => {
    const expectedGap = 32;
    const expectedMargin = expectedGap / 4;
    await page.viewport(768, 1024);

    const links = [
      { text : 'Link 1', href : '#link1' },
      { text : 'Link 2', href : '#link2' },
    ];

    const { container } = render(navLinks, { links, justify : 'end' });

    container.style.setProperty('width', '400px');
    container.style.setProperty('--padding-inset', `${expectedGap}px`);

    const nav = container.children[0] as HTMLElement;
    expect(nav).toBeInTheDocument();

    const anchors = page.elementLocator(container).getByRole('link').elements();
    expect(anchors.length).toBe(links.length);

    const first = anchors[0] as HTMLElement;
    const second = anchors[1] as HTMLElement;

    const containerBounds = container.getBoundingClientRect();
    const navBounds = nav.getBoundingClientRect();
    const firstBounds = first.getBoundingClientRect();
    const secondBounds = second.getBoundingClientRect();

    expect(navBounds.left).toEqual(containerBounds.left);
    expect(navBounds.right).toEqual(containerBounds.right);
    expect(firstBounds.top).toEqual(containerBounds.top + expectedMargin);
    expect(secondBounds.right).toEqual(containerBounds.right);
    expect(firstBounds.top).toEqual(secondBounds.top);
    expect(firstBounds.right).toEqual(secondBounds.left - expectedGap);
  });

  it('justifies links to top', async () => {
    const expectedGap = 16;
    const expectedMargin = expectedGap / 2;
    await page.viewport(768, 1024);

    const links = [
      { text : 'Link 1', href : '#link1' },
      { text : 'Link 2', href : '#link2' },
    ];

    const { container } = render(navLinks, {
      links,
      direction : 'column',
      justify : 'start',
    });

    container.style.setProperty('height', '200px');
    container.style.setProperty('--padding-inset', `${expectedGap * 2}px`);

    const nav = container.children[0] as HTMLElement;
    expect(nav).toBeInTheDocument();

    const anchors = page.elementLocator(container).getByRole('link').elements();
    expect(anchors.length).toBe(links.length);

    const first = anchors[0] as HTMLElement;
    const second = anchors[1] as HTMLElement;

    const containerBounds = container.getBoundingClientRect();
    const navBounds = nav.getBoundingClientRect();
    const firstBounds = first.getBoundingClientRect();
    const secondBounds = second.getBoundingClientRect();

    expect(navBounds.top).toEqual(containerBounds.top + expectedMargin);
    expect(firstBounds.left).toEqual(containerBounds.left);
    expect(firstBounds.top).toEqual(containerBounds.top + expectedMargin);
    expect(firstBounds.left).toEqual(secondBounds.left);
    expect(firstBounds.bottom + 1).toEqual(secondBounds.top - expectedGap);
  });

  it('stacks left aligned links on mobile', async () => {
    const expectedGap = 16;
    const expectedMargin = expectedGap / 2;
    await page.viewport(767, 1024);

    const links = [
      { text : 'Link 1', href : '#link1' },
      { text : 'Link 2', href : '#link2' },
    ];

    const { container } = render(navLinks, { links, justify : 'start' });

    container.style.setProperty('width', '400px');
    container.style.setProperty('--padding-inset', `${expectedGap * 2}px`);

    const nav = container.children[0] as HTMLElement;
    expect(nav).toBeInTheDocument();

    const anchors = page.elementLocator(container).getByRole('link').elements();
    expect(anchors.length).toBe(links.length);

    const first = anchors[0] as HTMLElement;
    const second = anchors[1] as HTMLElement;

    const containerBounds = container.getBoundingClientRect();
    const navBounds = nav.getBoundingClientRect();
    const firstBounds = first.getBoundingClientRect();
    const secondBounds = second.getBoundingClientRect();

    expect(navBounds.top).toEqual(containerBounds.top + expectedMargin);
    expect(firstBounds.left).toEqual(containerBounds.left);
    expect(firstBounds.top).toEqual(containerBounds.top + expectedMargin);
    expect(firstBounds.left).toEqual(secondBounds.left);
    expect(firstBounds.bottom + 1).toEqual(secondBounds.top - expectedGap);
  });

  it('stacks right aligned links on mobile', async () => {
    const expectedGap = 16;
    const expectedMargin = expectedGap / 2;
    await page.viewport(767, 1024);

    const links = [
      { text : 'Link 1', href : '#link1' },
      { text : 'Link 2', href : '#link2' },
    ];

    const { container } = render(navLinks, { links, justify : 'end' });

    container.style.setProperty('width', '400px');
    container.style.setProperty('--padding-inset', `${expectedGap * 2}px`);

    const nav = container.children[0] as HTMLElement;
    expect(nav).toBeInTheDocument();

    const anchors = page.elementLocator(container).getByRole('link').elements();
    expect(anchors.length).toBe(links.length);

    const first = anchors[0] as HTMLElement;
    const second = anchors[1] as HTMLElement;

    const containerBounds = container.getBoundingClientRect();
    const navBounds = nav.getBoundingClientRect();
    const firstBounds = first.getBoundingClientRect();
    const secondBounds = second.getBoundingClientRect();

    expect(navBounds.top).toEqual(containerBounds.top + expectedMargin);
    expect(firstBounds.right).toEqual(containerBounds.right);
    expect(firstBounds.top).toEqual(containerBounds.top + expectedMargin);
    expect(firstBounds.right).toEqual(secondBounds.right);
    expect(firstBounds.bottom + 1).toEqual(secondBounds.top - expectedGap);
  });

  it('renders compact links', async () => {
    const links = [
      { text : 'Link 1', href : '#link1' },
      { text : 'Link 2', href : '#link2' },
    ];

    const { container } = render(navLinks, { links, compact : true });

    const nav = page.elementLocator(container).getByRole('navigation');
    await expect.element(nav).toBeInTheDocument();

    const list = nav.getByRole('list');
    await expect.element(list).toBeInTheDocument();

    const items = list.getByRole('listitem');
    expect(items.elements()).toHaveLength(links.length);

    for (let i = 0; i < links.length; i++) {
      const item = items.elements()[i] as HTMLElement;
      const link = links[i];

      const text = page.elementLocator(item).getByTestId('text-detail');
      await expect.element(text).toBeInTheDocument();

      const anchor = text.getByRole('link');
      await expect.element(anchor).toBeInTheDocument();

      await expect.element(anchor).toHaveAttribute('href', link?.href);
      await expect.element(anchor).toHaveTextContent(link?.text ?? '');

      expect(Link).toHaveBeenCalledWithProps(expect.objectContaining({
        href : link?.href,
      }));
    }

    expect(Link).toHaveBeenCalledTimes(links.length);
    expect(Text).toHaveBeenCalledTimes(2 * links.length);
    let textCalls = 0;
    for (const [, args] of vi.mocked(Text).mock.calls) {
      if (args.typography !== 'detail') continue;
      expect(args).toEqual(expect.objectContaining({ as : 'span' }));
      textCalls += 1;
    }
    expect(textCalls).toEqual(2);
  });

  it('justifies compact links to left', async () => {
    const expectedGap = 16;
    const expectedMargin = expectedGap / 2;
    await page.viewport(768, 1024);

    const links = [
      { text : 'Link 1', href : '#link1' },
      { text : 'Link 2', href : '#link2' },
    ];

    const { container } = render(navLinks, {
      links,
      justify : 'start',
      compact : true,
    });

    container.style.setProperty('width', '400px');
    container.style.setProperty('--font-size', `${expectedGap}px`);
    container.style.setProperty('--padding-inset', `${expectedGap * 2}px`);

    const nav = container.children[0] as HTMLElement;
    expect(nav).toBeInTheDocument();

    const anchors = page.elementLocator(container).getByRole('link').elements();
    expect(anchors.length).toBe(links.length);

    const first = anchors[0] as HTMLElement;
    const second = anchors[1] as HTMLElement;

    const containerBounds = container.getBoundingClientRect();
    const navBounds = nav.getBoundingClientRect();
    const firstBounds = first.getBoundingClientRect();
    const secondBounds = second.getBoundingClientRect();

    expect(navBounds.left).toEqual(containerBounds.left);
    expect(navBounds.right).toEqual(containerBounds.right);
    expect(firstBounds.top).toEqual(containerBounds.top + expectedMargin);
    expect(firstBounds.left).toEqual(containerBounds.left);
    expect(firstBounds.top).toEqual(secondBounds.top);
    expect(firstBounds.right).toEqual(secondBounds.left - expectedGap);
  });

  it('justifies compact links to right', async () => {
    const expectedGap = 16;
    const expectedMargin = expectedGap / 2;
    await page.viewport(768, 1024);

    const links = [
      { text : 'Link 1', href : '#link1' },
      { text : 'Link 2', href : '#link2' },
    ];

    const { container } = render(navLinks, {
      links,
      justify : 'end',
      compact : true,
    });

    container.style.setProperty('width', '400px');
    container.style.setProperty('--font-size', `${expectedGap}px`);
    container.style.setProperty('--padding-inset', `${expectedGap * 2}px`);

    const nav = container.children[0] as HTMLElement;
    expect(nav).toBeInTheDocument();

    const anchors = page.elementLocator(container).getByRole('link').elements();
    expect(anchors.length).toBe(links.length);

    const first = anchors[0] as HTMLElement;
    const second = anchors[1] as HTMLElement;

    const containerBounds = container.getBoundingClientRect();
    const navBounds = nav.getBoundingClientRect();
    const firstBounds = first.getBoundingClientRect();
    const secondBounds = second.getBoundingClientRect();

    expect(navBounds.left).toEqual(containerBounds.left);
    expect(navBounds.right).toEqual(containerBounds.right);
    expect(firstBounds.top).toEqual(containerBounds.top + expectedMargin);
    expect(secondBounds.right).toEqual(containerBounds.right);
    expect(firstBounds.top).toEqual(secondBounds.top);
    expect(firstBounds.right).toEqual(secondBounds.left - expectedGap);
  });

  it('justifies compact links to top', async () => {
    const expectedGap = 8;
    const expectedMargin = expectedGap / 2;
    await page.viewport(768, 1024);

    const links = [
      { text : 'Link 1', href : '#link1' },
      { text : 'Link 2', href : '#link2' },
    ];

    const { container } = render(navLinks, {
      links,
      justify : 'start',
      direction : 'column',
      compact : true,
    });

    container.style.setProperty('width', '400px');
    container.style.setProperty('--font-size', `${expectedGap * 2}px`);
    container.style.setProperty('--padding-inset', `${expectedGap * 2}px`);

    const nav = container.children[0] as HTMLElement;
    expect(nav).toBeInTheDocument();

    const anchors = page.elementLocator(container).getByRole('link').elements();
    expect(anchors.length).toBe(links.length);

    const first = anchors[0] as HTMLElement;
    const second = anchors[1] as HTMLElement;

    const containerBounds = container.getBoundingClientRect();
    const navBounds = nav.getBoundingClientRect();
    const firstBounds = first.getBoundingClientRect();
    const secondBounds = second.getBoundingClientRect();

    expect(navBounds.top).toEqual(containerBounds.top + expectedMargin);
    expect(firstBounds.left).toEqual(containerBounds.left);
    expect(firstBounds.top).toEqual(containerBounds.top + expectedMargin);
    expect(firstBounds.left).toEqual(secondBounds.left);
    expect(firstBounds.bottom + 1).toEqual(secondBounds.top - expectedGap);
  });

  it('does not force stacked compact links on mobile', async () => {
    const expectedGap = 16;
    const expectedMargin = expectedGap / 2;
    await page.viewport(767, 1024);

    const links = [
      { text : 'Link 1', href : '#link1' },
      { text : 'Link 2', href : '#link2' },
    ];

    const { container } = render(navLinks, {
      links,
      justify : 'start',
      compact : true,
    });

    container.style.setProperty('width', '400px');
    container.style.setProperty('--font-size', `${expectedGap}px`);
    container.style.setProperty('--padding-inset', `${expectedGap * 2}px`);

    const nav = container.children[0] as HTMLElement;
    expect(nav).toBeInTheDocument();

    const anchors = page.elementLocator(container).getByRole('link').elements();
    expect(anchors.length).toBe(links.length);

    const first = anchors[0] as HTMLElement;
    const second = anchors[1] as HTMLElement;

    const containerBounds = container.getBoundingClientRect();
    const navBounds = nav.getBoundingClientRect();
    const firstBounds = first.getBoundingClientRect();
    const secondBounds = second.getBoundingClientRect();

    expect(navBounds.left).toEqual(containerBounds.left);
    expect(navBounds.right).toEqual(containerBounds.right);
    expect(firstBounds.top).toEqual(containerBounds.top + expectedMargin);
    expect(firstBounds.left).toEqual(containerBounds.left);
    expect(firstBounds.top).toEqual(secondBounds.top);
    expect(firstBounds.right).toEqual(secondBounds.left - expectedGap);
  });
});
