import { beforeEach, afterAll, describe, it, expect, vi } from 'vitest';
import { render, within } from '@testing-library/svelte';

import { tryGet } from '$lib/utils/typing';
import { wrapOriginal } from '$lib/tests/component';
import type { Config } from '$lib/utils/config';
import { defaultLocale } from '$lib/utils/locale';
import type { Article } from '$lib/utils/weblog';
import Content from '$lib/materials/content.svelte';
import Nav from '$lib/components/nav.svelte';
import Profile from '$lib/components/profile.svelte';
import Highlight from '$lib/components/highlight.svelte';
import Contact from '$lib/components/contact.svelte';

import type { PageData } from './$types';
import HomePage from './+page.svelte';

const defaultConfig = vi.hoisted(() => ({} as Config));
const defaultData = {
  articles : {},
} as PageData;

let isBrowser = vi.hoisted(() => true);

let setConfig : ((value : unknown) => void) = vi.hoisted(() => () => {});

let setLocale : ((value : unknown) => void) = vi.hoisted(() => () => {});

vi.mock('$app/environment', () => ({ get browser() { return isBrowser; } }));

vi.mock('$lib/hooks/useConfig', async (original) => {
  const originalDefault =
    ((await original()) as { default : () => object; }).default;
  const writable = (await import('svelte/store')).writable;
  const config = writable<unknown>();
  setConfig = (value : unknown) => config.set(value);
  return {
    default : () => ({
      ...originalDefault(),
      config,
    }),
  };
});
vi.mock('$lib/hooks/useLocale', async (original) => {
  const originalDefault =
    ((await original()) as { default : () => object; }).default;
  const writable = (await import('svelte/store')).writable;
  const locale = writable<unknown>(defaultLocale);
  setLocale = (value : unknown) => locale.set(value);
  return {
    default : () => ({
      ...originalDefault(),
      locale,
    }),
  };
});

vi.mock('$lib/materials/content.svelte', async (original) => {
  return {
    default : await wrapOriginal(original, {
      testId : p =>
        `content-${tryGet(p, 'section', s => typeof s === 'string') ?? 'none'}`,
    }),
  };
});
vi.mock('$lib/components/nav.svelte', async (original) => {
  return { default : await wrapOriginal(original, { testId : 'nav' }) };
});
vi.mock('$lib/components/profile.svelte', async (original) => {
  return { default : await wrapOriginal(original, { testId : 'profile' }) };
});
vi.mock('$lib/components/highlight.svelte', async (original) => {
  return { default : await wrapOriginal(original, { testId : 'highlight' }) };
});
vi.mock('$lib/components/contact.svelte', async (original) => {
  return { default : await wrapOriginal(original, { testId : 'contact' }) };
});

beforeEach(() => {
  vi.clearAllMocks();
  isBrowser = true;
  setConfig(defaultConfig);
  setLocale(defaultLocale);
  document.head.innerHTML = '';
});
afterAll(() => { vi.restoreAllMocks(); });

describe('+page.svelte', () => {
  it('renders profile', () => {
    const { container } = render(HomePage, { data : defaultData });

    const profile = within(container).queryByTestId('profile') as HTMLElement;
    expect(profile).toBeInTheDocument();

    expect(Profile).toHaveBeenCalledOnce();
  });

  it('set profile theme section', () => {
    const { container } = render(HomePage, { data : defaultData });

    const content = within(container)
      .queryByTestId('content-profile') as HTMLElement;
    expect(content).toBeInTheDocument();
    const profile = within(content).queryByTestId('profile') as HTMLElement;
    expect(profile).toBeInTheDocument();

    expect(Content).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ section : 'profile' }),
    );
  });

  it('centers profile content', () => {
    const { container } = render(HomePage, { data : defaultData });

    const content = within(container)
      .queryByTestId('content-profile') as HTMLElement;
    expect(content).toBeInTheDocument();
    const profile = within(content).queryByTestId('profile') as HTMLElement;
    expect(profile).toBeInTheDocument();

    expect(Content).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        alignment : 'centre',
        justification : 'centre',
      }),
    );
  });

  it('adjusts profile content for top profile nav', () => {
    const { container } = render(HomePage, { data : defaultData });

    const content = within(container)
      .queryByTestId('content-profile') as HTMLElement;
    expect(content).toBeInTheDocument();
    const profile = within(content).queryByTestId('profile') as HTMLElement;
    expect(profile).toBeInTheDocument();

    expect(Content).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ hasTopNav : true }),
    );
  });

  it('adjusts profile content for bottom profile nav', () => {
    setConfig({
      ...defaultConfig,
      profileLinks : [{ text : 'Test Link', href : '#test' }],
    });
    const { container } = render(HomePage, { data : defaultData });

    const content = within(container)
      .queryByTestId('content-profile') as HTMLElement;
    expect(content).toBeInTheDocument();
    const profile = within(content).queryByTestId('profile') as HTMLElement;
    expect(profile).toBeInTheDocument();

    expect(Content).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ hasBottomNav : true }),
    );
  });

  it('does not adjust profile content for empty bottom profile nav', () => {
    setConfig({
      ...defaultConfig,
      profileLinks : [],
    });
    const { container } = render(HomePage, { data : defaultData });

    const content = within(container)
      .queryByTestId('content-profile') as HTMLElement;
    expect(content).toBeInTheDocument();
    const profile = within(content).queryByTestId('profile') as HTMLElement;
    expect(profile).toBeInTheDocument();

    expect(Content).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ hasBottomNav : false }),
    );
  });

  it('renders profile main navigation', () => {
    const { container } = render(HomePage, { data : defaultData });

    const content = within(container)
      .queryByTestId('content-profile') as HTMLElement;
    expect(content).toBeInTheDocument();
    const nav = within(content).queryByTestId('nav') as HTMLElement;
    expect(nav).toBeInTheDocument();

    expect(Nav).toHaveBeenCalledOnce();
    expect(Nav).toHaveBeenCalledWithProps(expect.objectContaining({
      highlights : true,
      allArticles : true,
      contact : true,
    }));
    expect(Nav).not.toHaveBeenCalledWithProps(expect.objectContaining({
      home : true,
    }));
  });

  it('does not render highlight without configuration', () => {
    const { container } = render(HomePage, { data : defaultData });

    const highlight = within(container)
      .queryByTestId('highlight') as HTMLElement;
    expect(highlight).not.toBeInTheDocument();

    expect(Highlight).not.toHaveBeenCalled();
  });

  it('renders configured highlights', async () => {
    const expectedHighlights = [
      {
        id : '1',
        type : 'article' as const,
        key : 'example1',
        title : '',
        links : [],
        section : 'exampleSection1',
      },
      {
        id : '2',
        type : 'tag' as const,
        key : 'example2',
        title : '',
        links : [],
        section : 'exampleSection2',
      },
    ];
    const config = {
      ...defaultConfig,
      highlights : expectedHighlights,
    } as Config;
    setConfig(config);

    const { container } = render(HomePage, { data : defaultData });

    for (const highlight of expectedHighlights) {
      const content = within(container)
        .queryByTestId(`content-${highlight.section}`) as HTMLElement;
      expect(content).toBeInTheDocument();
    }

    const highlights = await within(container)
      .findAllByTestId('highlight') as HTMLElement[];
    expect(highlights).toHaveLength(2);
    for (const highlight of highlights) {
      expect(highlight).toBeInTheDocument();
    }

    expect(Highlight).toHaveBeenCalledTimes(highlights.length);
    for (const highlight of expectedHighlights) {
      expect(Highlight).toHaveBeenCalledWithProps(expect.objectContaining({
        highlight,
      }));
    }
  });

  it('renders highlights with pre-loaded articles', () => {
    const expectedKey = 'article1';
    const expectedContent = 'Test Article Content';
    const expectedArticle = { title : 'Test Article' } as Article;
    const config = {
      ...defaultConfig,
      highlights : [
        {
          id : '1',
          type : 'article',
          key : expectedKey,
          title : '',
          links : [],
          section : 'exampleSection',
        },
      ],
    } as Config;
    setConfig(config);

    render(HomePage, { data : {
      ...defaultData,
      articles : { [expectedKey] : expectedContent },
      articleIndex : {
        articles : { [expectedKey] : expectedArticle },
        tags : {},
      },
    } });

    expect(Highlight).toHaveBeenCalledOnce();
    expect(Highlight).toHaveBeenCalledWithProps(expect.objectContaining({
      article : expectedContent,
      metadata : expectedArticle,
    }));
  });

  it('renders contact', () => {
    const { container } = render(HomePage, { data : defaultData });

    const contact = within(container).queryByTestId('contact') as HTMLElement;
    expect(contact).toBeInTheDocument();

    expect(Contact).toHaveBeenCalledOnce();
    expect(Contact).toHaveBeenCalledWithProps(expect.objectContaining({
      id : 'contact',
    }));
  });

  it('set contact theme section', () => {
    const { container } = render(HomePage, { data : defaultData });

    const content = within(container)
      .queryByTestId('content-contact') as HTMLElement;
    expect(content).toBeInTheDocument();
    const contact = within(content).queryByTestId('contact') as HTMLElement;
    expect(contact).toBeInTheDocument();

    expect(Content).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ section : 'contact' }),
    );
  });

  it('adds title to head', async () => {
    setLocale({
      ...defaultLocale,
      meta : { ...defaultLocale.meta, title : 'Test Title' },
    });
    render(HomePage, { data : defaultData });

    const title = document.head.querySelector('title');
    expect(title).not.toBeNull();
    expect(title?.textContent).toBe('Test Title');
  });

  it('hides content background server-side', () => {
    isBrowser = false;
    const config = {
      ...defaultConfig,
      highlights : [
        {
          id : '1',
          type : 'tag',
          key : 'example',
          title : 'Example',
          links : [],
          section : 'exampleSection',
        },
      ],
    } as Config;
    setConfig(config);

    render(HomePage, { data : defaultData });

    vi.mocked(Content).mock.calls.forEach((args) => {
      expect(args[1])
        .toEqual(expect.objectContaining({ showBackground : false }));
    });
  });

  it('does not add title to head if not set', async () => {
    setLocale({
      ...defaultLocale,
      meta : { ...defaultLocale.meta, title : '' },
    });
    render(HomePage, { data : defaultData });

    const title = document.head.querySelector('title');
    expect(title).toBeNull();
  });

  it('adds meta description to head', async () => {
    setLocale({
      ...defaultLocale,
      meta : { ...defaultLocale.meta, description : 'Test Description' },
    });
    render(HomePage, { data : defaultData });

    const meta = document.head
      .querySelector('meta[name="description"]') as HTMLMetaElement;
    expect(meta).not.toBeNull();
    expect(meta.content).toBe('Test Description');
  });

  it('does not add meta description to head if not set', async () => {
    setLocale({
      ...defaultLocale,
      meta : { ...defaultLocale.meta, description : '' },
    });
    render(HomePage, { data : defaultData });

    const meta = document.head
      .querySelector('meta[name="description"]') as HTMLMetaElement;
    expect(meta).toBeNull();
  });
});
