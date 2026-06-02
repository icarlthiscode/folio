import { beforeEach, afterAll, describe, it, expect, vi } from 'vitest';
import { render, within } from '@testing-library/svelte';

import { tryGet } from '$lib/utils/typing';
import { wrapOriginal } from '$lib/tests/component';
import { defaultConfig } from '$lib/utils/config';
import { defaultLocale } from '$lib/utils/locale';
import type { Article } from '$lib/utils/weblog';
import Content from '$lib/materials/content.svelte';
import Nav from '$lib/components/nav.svelte';
import Post from '$lib/components/post.svelte';
import Footer from '$lib/components/footer.svelte';

import ArticlePage from './+page.svelte';

let isBrowser = vi.hoisted(() => true);

const locale = vi.hoisted(() => ({
  nav : {
    home : 'Home',
    allArticles : 'All Articles',
    contact : 'Contact',
  },
  collections : { tagPrefix : 'Tag:' },
}));

vi.mock('$app/environment', () => ({ get browser() { return isBrowser; } }));

vi.mock('$lib/hooks/useLocale', async (original) => {
  const originalDefault =
    ((await original()) as { default : () => object; }).default;
  const writable = (await import('svelte/store')).writable;
  return {
    default : () => ({
      ...originalDefault(),
      locale : writable<unknown>(locale),
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
vi.mock('$lib/components/post.svelte', async (original) => {
  return { default : await wrapOriginal(original, { testId : 'post' }) };
});
vi.mock('$lib/components/footer.svelte', async (original) => {
  return { default : await wrapOriginal(original, { testId : 'footer' }) };
});

const data = {
  config : defaultConfig,
  locale : defaultLocale,
  themes : {},
  graphics : {},
  articleIndex : { articles : {}, tags : {} },
  title : 'Test Title',
  abstract : 'Test Abstract',
  markdown : 'Test Content',
  metadata : {
    datePublished : new Date(),
    contributions : [{ byline : 'Tested by', members : [{ name : 'Test' }] }],
  } as Article,
};

beforeEach(() => {
  vi.clearAllMocks();
  isBrowser = true;
});
afterAll(() => { vi.restoreAllMocks(); });

describe('+page.svelte', () => {
  it('sets article theme section', () => {
    render(ArticlePage, { data });
    expect(Content).toHaveBeenCalledWithProps(expect.objectContaining({
      section : 'article',
      hasTopNav : true,
    }));
  });

  it('renders article main navigation', () => {
    const { container } = render(ArticlePage, { data });

    const content = within(container)
      .queryByTestId('content-article') as HTMLElement;
    expect(content).toBeInTheDocument();
    const nav = within(content).queryByTestId('nav') as HTMLElement;
    expect(nav).toBeInTheDocument();

    expect(Nav).toHaveBeenCalledOnce();
    expect(Nav).toHaveBeenCalledWithProps(expect.objectContaining({
      home : true,
      highlights : true,
      contact : true,
    }));
  });

  it('renders article content', () => {
    const { container } = render(ArticlePage, { data });
    const content = within(container)
      .queryByTestId('content-article') as HTMLElement;
    expect(content).toBeInTheDocument();
    const nav = within(content).queryByTestId('nav') as HTMLElement;
    const post = within(content).queryByTestId('post') as HTMLElement;
    expect(post).toBeInTheDocument();
    expect(post.compareDocumentPosition(nav))
      .toBe(Node.DOCUMENT_POSITION_PRECEDING);
    expect(Post).toHaveBeenCalledOnce();
    expect(Post).toHaveBeenCalledWithProps(expect.objectContaining({
      content : data.markdown,
      datePublished : data.metadata.datePublished,
      contributions : data.metadata.contributions,
    }));
  });

  it('renders article content with tag links', () => {
    const tags = [
      { name : 'Tag 1', slug : 'tag-1' },
      { name : 'Tag 2', slug : 'tag-2' },
    ];
    const expectedLinks = tags.map(t => ({
      text : locale.collections.tagPrefix + t.name,
      href : `/collections/${t.slug}`,
    }));

    render(ArticlePage, { data : { ...data, metadata : { tags } as Article } });
    expect(Post).toHaveBeenCalledOnce();
    expect(Post).toHaveBeenCalledWithProps(expect.objectContaining({
      topLinks : expectedLinks,
    }));
  });

  it('sets footer theme section', () => {
    render(ArticlePage, { data });
    expect(Content).toHaveBeenCalledWithProps(expect.objectContaining({
      section : 'footer',
    }));
  });

  it('renders footer', () => {
    const { container } = render(ArticlePage, { data });
    const articleContent = within(container)
      .queryByTestId('content-article') as HTMLElement;
    expect(articleContent).toBeInTheDocument();
    const footerContent = within(container)
      .queryByTestId('content-footer') as HTMLElement;
    expect(footerContent).toBeInTheDocument();
    const footer = within(footerContent).queryByTestId('footer') as HTMLElement;
    expect(footer).toBeInTheDocument();
    expect(Footer).toHaveBeenCalledOnce();
    expect(articleContent.compareDocumentPosition(footerContent))
      .toBe(Node.DOCUMENT_POSITION_FOLLOWING);
  });

  it('hides content background server-side', () => {
    isBrowser = false;

    render(ArticlePage, { data });

    vi.mocked(Content).mock.calls.forEach((args) => {
      expect(args[1])
        .toEqual(expect.objectContaining({ showBackground : false }));
    });
  });

  it('adds article title to head', () => {
    render(ArticlePage, { data : { ...data, title : 'Test Article' } });
    const meta = document.head.querySelector('title');
    expect(meta).not.toBeNull();
    expect(meta?.textContent).toBe('Test Article');
  });

  it('adds placeholder title to head if not found', () => {
    render(ArticlePage, { data : { ...data, title : '' } });
    const meta = document.head.querySelector('title');
    expect(meta).not.toBeNull();
    expect(meta?.textContent).toBe('Article');
  });

  it('adds article abstract to head', () => {
    render(ArticlePage, { data : { ...data, abstract : 'Test abstract.' } });
    const meta = document.head.querySelector('meta[name="description"]');
    expect(meta).not.toBeNull();
    expect(meta?.getAttribute('content')).toBe('Test abstract.');
  });

  it('does not add abstract to head if not found', () => {
    render(ArticlePage, { data : { ...data, abstract : '' } });
    const meta = document.head.querySelector('meta[name="description"]');
    expect(meta).toBeNull();
  });

  it('compresses abstract whitespace', () => {
    render(ArticlePage, { data : { ...data, abstract : 'Test\n  abstract.' } });
    const meta = document.head.querySelector('meta[name="description"]');
    expect(meta).not.toBeNull();
    expect(meta?.getAttribute('content')).toBe('Test abstract.');
  });
});
