import { beforeEach, afterAll, describe, it, expect, vi } from 'vitest';
import type { Snippet } from 'svelte';
import { render, within } from '@testing-library/svelte';

import type { Article, WeblogIndex } from '$lib/utils/weblog';
import { makeComponent, wrapOriginal } from '$lib/tests/component';
import { defaultConfig } from '$lib/utils/config';
import { defaultLocale } from '$lib/utils/locale';
import Page from '$lib/materials/page.svelte';

import Layout from './+layout.svelte';

let favicon = vi.hoisted(() => '/test.svg');

const setConfigMock = vi.hoisted(() => vi.fn());
const setLocaleMock = vi.hoisted(() => vi.fn());
const setThemesMock = vi.hoisted(() => vi.fn());
const setGraphicsMock = vi.hoisted(() => vi.fn());
const setArticleIndexMock = vi.hoisted(() => vi.fn());

vi.mock('$env/dynamic/public', () => ({
  env : { get PUBLIC_FAVICON() { return favicon; } },
}));

vi.mock('$lib/hooks/useConfig', async (original) => {
  const originalDefault =
    ((await original()) as { default : () => object; }).default;
  return {
    default : () => ({
      ...originalDefault(),
      config : { set : setConfigMock },
    }),
  };
});
vi.mock('$lib/hooks/useLocale', async (original) => {
  const originalDefault =
    ((await original()) as { default : () => object; }).default;
  return {
    default : () => ({
      ...originalDefault(),
      locale : { set : setLocaleMock },
    }),
  };
});
vi.mock('$lib/hooks/useThemes', async (original) => {
  const originalDefault =
    ((await original()) as { default : () => object; }).default;
  return {
    default : () => ({
      ...originalDefault(),
      themes : { set : setThemesMock },
    }),
  };
});
vi.mock('$lib/hooks/useGraphics', async (original) => {
  const originalDefault =
    ((await original()) as { default : () => object; }).default;
  return {
    default : () => ({
      ...originalDefault(),
      graphics : { set : setGraphicsMock },
    }),
  };
});
vi.mock('$lib/hooks/useArticles', async (original) => {
  const originalDefault =
    ((await original()) as { default : () => object; }).default;
  return {
    default : () => ({
      ...originalDefault(),
      index : { set : setArticleIndexMock },
    }),
  };
});

vi.mock('$lib/materials/page.svelte', async original => ({
  default : await wrapOriginal(original, { testId : 'page' }),
}));

const data = {
  config : defaultConfig,
  locale : defaultLocale,
  themes : {},
  graphics : { graphic : '<svg></svg>' },
  articleIndex : {} as WeblogIndex,
};

const TestContent = makeComponent({ testId : 'content' });

beforeEach(() => { vi.clearAllMocks(); });
afterAll(() => { vi.restoreAllMocks(); });

describe('/+layout.svelte', () => {
  it('renders', () => {
    render(Layout, { data, children : ((() => {}) as Snippet<[]>) });
  });

  it('stores loaded config', () => {
    const expected = {
      likes : [{ icon : 'icon', text : 'test' }],
    } as typeof defaultConfig;
    render(Layout, {
      data : { ...data, config : expected },
      children : ((() => {}) as Snippet<[]>),
    });
    expect(setConfigMock).toHaveBeenCalledWith(expected);
  });

  it('stores loaded locale', () => {
    const expected = { title : '' } as typeof defaultLocale;
    render(Layout, {
      data : { ...data, locale : expected },
      children : ((() => {}) as Snippet<[]>),
    });
    expect(setLocaleMock).toHaveBeenCalledWith(expected);
  });

  it('stores loaded themes', () => {
    const expected = { test : {} };
    render(Layout, {
      data : { ...data, themes : expected },
      children : ((() => {}) as Snippet<[]>),
    });
    expect(setThemesMock).toHaveBeenCalledWith(expected);
  });

  it('stores loaded graphics', () => {
    const expected = { test : '<svg>Test</svg>' };
    render(Layout, {
      data : { ...data, graphics : expected },
      children : ((() => {}) as Snippet<[]>),
    });
    expect(setGraphicsMock).toHaveBeenCalledWith(expected);
  });

  it('stores loaded article index', () => {
    const expected = {
      articles : {
        'test-article' : {
          slug : 'test-article',
          title : 'Test Article',
          abstract : 'This is a test article.',
        } as Article },
      tags : {},
    } as WeblogIndex;
    render(Layout, {
      data : { ...data, articleIndex : expected },
      children : ((() => {}) as Snippet<[]>),
    });
    expect(setArticleIndexMock).toHaveBeenCalledWith(expected);
  });
});

describe('/+layout.svelte render', () => {
  it('wraps content in page', () => {
    const { container } = render(Layout, { data, children : TestContent });

    const page = within(container).queryByTestId('page') as HTMLElement;
    expect(page).toBeInTheDocument();
    expect(within(page).queryByTestId('content')).toBeInTheDocument();
    expect(Page).toHaveBeenCalledOnce();
  });

  it('adds favicon link to head', async () => {
    favicon = '/test.svg';
    render(Layout, { data, children : ((() => {}) as Snippet<[]>) });

    const link = document.head
      .querySelector('link[rel="icon"]') as HTMLLinkElement;
    expect(link).not.toBeNull();
    expect(link.href).toBe(`${window.location.origin}/test.svg`);
  });

  it('does not add favicon link to head if not set', async () => {
    favicon = '';
    render(Layout, { data, children : ((() => {}) as Snippet<[]>) });

    const link = document.head
      .querySelector('link[rel="icon"]') as HTMLLinkElement;
    expect(link).toBeNull();
  });
});
