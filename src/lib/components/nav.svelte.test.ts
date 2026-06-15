import { beforeEach, afterAll, describe, it, expect, vi } from 'vitest';
import { render, within } from '@testing-library/svelte';

import { wrapOriginal } from '$lib/tests/component';
import NavLinks from '$lib/materials/navLinks.svelte';

import Nav from './nav.svelte';

const defaultConfig = vi.hoisted(() => ({
  highlights : [
    { id : 'highlight1', type : 'tag', key : 'tag1', section : 'section1' },
    { id : 'highlight2', type : 'tag', key : 'tag2', section : 'section2' },
  ],
}));

const locale = vi.hoisted(() => ({
  nav : {
    home : 'Test Home',
    highlights : {
      highlight1 : 'Highlight One',
      highlight2 : 'Highlight Two',
    },
    allArticles : 'Test All Articles',
    contact : 'Test Contact',
  } as Record<string, unknown>,
}));

vi.mock('$lib/hooks/useConfig', async (original) => {
  const originalDefault =
    ((await original()) as { default : () => object; }).default;
  const writable = (await import('svelte/store')).writable;
  return {
    default : () => ({
      ...originalDefault(),
      config : writable(defaultConfig),
    }),
  };
});
vi.mock('$lib/hooks/useLocale', async (original) => {
  const originalDefault =
    ((await original()) as { default : () => object; }).default;
  const writable = (await import('svelte/store')).writable;
  return {
    default : () => ({
      ...originalDefault(),
      locale : writable(locale),
    }),
  };
});

vi.mock('$lib/materials/navLinks.svelte', async (original) => {
  return { default : await wrapOriginal(original, { testId : 'navLinks' }) };
});

beforeEach(() => { vi.clearAllMocks(); });
afterAll(() => { vi.restoreAllMocks(); });

describe('Nav', () => {
  it('renders nav links', () => {
    const { container } = render(Nav);

    const navLinks = within(container).queryByTestId('navLinks') as HTMLElement;
    expect(navLinks).toBeInTheDocument();

    expect(NavLinks).toHaveBeenCalledOnce();
    expect(NavLinks).toHaveBeenCalledWithProps(expect.objectContaining({
      justify : 'end',
      links : [],
    }));
  });

  it('populates nav links with highlights from config', () => {
    const { container } = render(Nav, { targets : ['highlights'] });

    const navLinks = within(container).queryByTestId('navLinks') as HTMLElement;
    expect(navLinks).toBeInTheDocument();

    expect(NavLinks).toHaveBeenCalledOnce();
    expect(NavLinks).toHaveBeenCalledWithProps(expect.objectContaining({
      links : [
        { text : 'Highlight One', href : '/#highlight1' },
        { text : 'Highlight Two', href : '/#highlight2' },
      ],
    }));
  });

  it('populates nav links with all articles locale', () => {
    const { container } = render(Nav, { targets : ['allArticles'] });

    const navLinks = within(container).queryByTestId('navLinks') as HTMLElement;
    expect(navLinks).toBeInTheDocument();

    expect(NavLinks).toHaveBeenCalledOnce();
    expect(NavLinks).toHaveBeenCalledWithProps(expect.objectContaining({
      links : [{ text : 'Test All Articles', href : '/collections' }],
    }));
  });

  it('populates nav links with home locale', () => {
    const { container } = render(Nav, { targets : ['home'] });
    const navLinks = within(container).queryByTestId('navLinks') as HTMLElement;
    expect(navLinks).toBeInTheDocument();

    expect(NavLinks).toHaveBeenCalledOnce();
    expect(NavLinks).toHaveBeenCalledWithProps(expect.objectContaining({
      links : [{ text : 'Test Home', href : '/' }],
    }));
  });

  it('populates nav links with contact locale', () => {
    const { container } = render(Nav, { targets : ['contact'] });

    const navLinks = within(container).queryByTestId('navLinks') as HTMLElement;
    expect(navLinks).toBeInTheDocument();

    expect(NavLinks).toHaveBeenCalledOnce();
    expect(NavLinks).toHaveBeenCalledWithProps(expect.objectContaining({
      links : [{ text : 'Test Contact', href : '/#contact' }],
    }));
  });

  it('lists links in correct order', () => {
    const { container } = render(Nav, { targets : [
      'home',
      'highlights',
      'allArticles',
      'contact',
    ] });

    const navLinks = within(container).queryByTestId('navLinks') as HTMLElement;
    expect(navLinks).toBeInTheDocument();

    expect(NavLinks).toHaveBeenCalledOnce();
    expect(NavLinks).toHaveBeenCalledWithProps(expect.objectContaining({
      links : [
        { text : 'Highlight One', href : '/#highlight1' },
        { text : 'Highlight Two', href : '/#highlight2' },
        { text : 'Test All Articles', href : '/collections' },
        { text : 'Test Home', href : '/' },
        { text : 'Test Contact', href : '/#contact' },
      ],
    }));
  });
});
