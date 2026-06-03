import { beforeEach, afterAll, describe, it, expect, vi } from 'vitest';
import { render, within } from '@testing-library/svelte';

import { tryGet } from '$lib/utils/typing';
import { wrapOriginal } from '$lib/tests/component';
import { defaultConfig } from '$lib/utils/config';
import { defaultLocale } from '$lib/utils/locale';
import type { Tag } from '$lib/utils/weblog';
import Content from '$lib/materials/content.svelte';
import Heading from '$lib/materials/heading.svelte';
import NavLinks from '$lib/materials/navLinks.svelte';
import Nav from '$lib/components/nav.svelte';
import ArticleIndex from '$lib/components/articleIndex.svelte';
import Footer from '$lib/components/footer.svelte';

import CollectionPage from './+page.svelte';

let isBrowser = vi.hoisted(() => true);
let setLocale : ((value : unknown) => void) = vi.hoisted(() => () => {});

vi.mock('$app/environment', () => ({ get browser() { return isBrowser; } }));

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
vi.mock('$lib/materials/heading.svelte', async (original) => {
  return { default : await wrapOriginal(original, { testId : 'heading' }) };
});
vi.mock('$lib/materials/navLinks.svelte', async (original) => {
  return {
    default : await wrapOriginal(original, {
      testId : p => `links-${
        tryGet(p, 'links', Array.isArray)?.some(l => l.href === '/')
          ? 'main'
          : 'collection'
      }`,
    }),
  };
});
vi.mock('$lib/components/nav.svelte', async (original) => {
  return { default : await wrapOriginal(original, { testId : 'nav' }) };
});
vi.mock('$lib/components/articleIndex.svelte', async (original) => {
  return { default : await wrapOriginal(original, { testId : 'index' }) };
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
  tag : undefined,
};

beforeEach(() => {
  vi.clearAllMocks();
  isBrowser = true;
  setLocale(defaultLocale);
});
afterAll(() => { vi.restoreAllMocks(); });

describe('+page.svelte', () => {
  it('sets collection theme section', () => {
    render(CollectionPage, { data });
    expect(Content).toHaveBeenCalledWithProps(expect.objectContaining({
      section : 'collection',
      hasTopNav : true,
    }));
  });

  it('renders all articles main navigation', () => {
    const { container } = render(CollectionPage, { data });

    const content = within(container)
      .queryByTestId('content-collection') as HTMLElement;
    expect(content).toBeInTheDocument();
    const nav = within(content).queryByTestId('nav') as HTMLElement;
    expect(nav).toBeInTheDocument();

    expect(Nav).toHaveBeenCalledOnce();
    expect(Nav).toHaveBeenCalledWithProps(expect.objectContaining({
      home : true,
      contact : true,
    }));
    expect(Nav).not.toHaveBeenCalledWithProps(expect.objectContaining({
      allArticles : true,
      highlights : true,
    }));
  });

  it('renders tag collection main navigation', () => {
    const { container } = render(CollectionPage, { data : {
      ...data,
      tag : { name : 'Test Tag 1' } as Tag,
    } });

    const content = within(container)
      .queryByTestId('content-collection') as HTMLElement;
    expect(content).toBeInTheDocument();
    const nav = within(content).queryByTestId('nav') as HTMLElement;
    expect(nav).toBeInTheDocument();

    expect(Nav).toHaveBeenCalledOnce();
    expect(Nav).toHaveBeenCalledWithProps(expect.objectContaining({
      home : true,
      allArticles : true,
      contact : true,
    }));
    expect(Nav).not.toHaveBeenCalledWithProps(expect.objectContaining({
      highlights : true,
    }));
  });

  it('renders collection heading', () => {
    const expectedTag = {
      slug : 'test-tag',
      name : 'Test Tag',
      description : 'Test Tag Description',
      articles : [],
    };
    const { container } = render(CollectionPage, { data : {
      ...data,
      tag : expectedTag,
    } });

    const content = within(container)
      .queryByTestId('content-collection') as HTMLElement;
    expect(content).toBeInTheDocument();
    const nav = within(content).queryByTestId('nav') as HTMLElement;
    const heading = within(content).queryByTestId('heading') as HTMLElement;
    expect(heading).toBeInTheDocument();
    expect(heading.compareDocumentPosition(nav))
      .toBe(Node.DOCUMENT_POSITION_PRECEDING);
    expect(heading).toHaveTextContent(expectedTag.name);
    expect(Heading).toHaveBeenCalledOnce();
    expect(Heading).toHaveBeenCalledWithProps(expect.objectContaining({
      level : 1,
      scrim : true,
    }));
  });

  it('renders collection heading with default id', () => {
    const expectedTag = {
      slug : 'test-tag',
      name : 'Test Tag',
      description : 'Test Tag Description',
      articles : [],
    };
    render(CollectionPage, { data : { ...data, tag : expectedTag } });

    expect(Heading).toHaveBeenCalledOnce();
    expect(Heading).toHaveBeenCalledWithProps(expect.objectContaining({
      id : expectedTag.slug,
    }));
  });

  it('renders collection heading with tag slug as id', () => {
    render(CollectionPage, { data });

    expect(Heading).toHaveBeenCalledOnce();
    expect(Heading).toHaveBeenCalledWithProps(expect.objectContaining({
      id : 'all-articles',
    }));
  });

  it('renders collection tags', () => {
    const expectedPrefix = 'Test ';
    const expectedTags = {
      'test-tag-1' : { name : 'Test Tag 1' } as Tag,
      'test-tag-2' : { name : 'Test Tag 2' } as Tag,
    };
    const expectedLinks = Object.entries(expectedTags).map(([slug, tag]) => ({
      href : '/collections/' + slug,
      text : expectedPrefix + tag.name,
    }));
    setLocale({
      ...defaultLocale,
      collections : {
        ...defaultLocale.collections,
        tagPrefix : expectedPrefix,
      },
    });

    const { container } = render(CollectionPage, { data : {
      ...data,
      articleIndex : { articles : {}, tags : expectedTags },
    } });

    const content = within(container)
      .queryByTestId('content-collection') as HTMLElement;
    expect(content).toBeInTheDocument();
    const heading = within(content).queryByTestId('heading') as HTMLElement;
    const links = within(content)
      .queryByTestId('links-collection') as HTMLElement;
    expect(links).toBeInTheDocument();
    expect(links.compareDocumentPosition(heading))
      .toBe(Node.DOCUMENT_POSITION_PRECEDING);
    expect(NavLinks).toHaveBeenCalledWithProps(expect.objectContaining({
      links : expectedLinks,
    }));
  });

  it('renders link to all articles with tag prefix', () => {
    const expectedPrefix = 'Test ';
    const expectedTag = {
      slug : 'test-tag-1',
      name : 'Test Tag 1',
    } as Tag;
    const expectedLinks = [{
      href : '/collections',
      text : expectedPrefix + defaultLocale.collections.allArticles,
    }];
    setLocale({
      ...defaultLocale,
      collections : {
        ...defaultLocale.collections,
        tagPrefix : expectedPrefix,
      },
    });

    const { container } = render(CollectionPage, { data : {
      ...data,
      tag : expectedTag,
    } });

    const content = within(container)
      .queryByTestId('content-collection') as HTMLElement;
    expect(content).toBeInTheDocument();
    const heading = within(content).queryByTestId('heading') as HTMLElement;
    const links = within(content)
      .queryByTestId('links-collection') as HTMLElement;
    expect(links).toBeInTheDocument();
    expect(links.compareDocumentPosition(heading))
      .toBe(Node.DOCUMENT_POSITION_PRECEDING);
    expect(NavLinks).toHaveBeenCalledWithProps(expect.objectContaining({
      links : expectedLinks,
    }));
  });

  it('renders link to all articles with back prefix', () => {
    const expectedPrefix = 'Test Back';
    const expectedTag = {
      slug : 'test-tag-1',
      name : 'Test Tag 1',
    } as Tag;
    const expectedLinks = [{
      href : '/collections',
      text : expectedPrefix + defaultLocale.collections.allArticles,
    }];
    setLocale({
      ...defaultLocale,
      collections : {
        ...defaultLocale.collections,
        backPrefix : expectedPrefix,
      },
    });

    const { container } = render(CollectionPage, { data : {
      ...data,
      tag : expectedTag,
    } });

    const content = within(container)
      .queryByTestId('content-collection') as HTMLElement;
    expect(content).toBeInTheDocument();
    const heading = within(content).queryByTestId('heading') as HTMLElement;
    const links = within(content)
      .queryByTestId('links-collection') as HTMLElement;
    expect(links).toBeInTheDocument();
    expect(links.compareDocumentPosition(heading))
      .toBe(Node.DOCUMENT_POSITION_PRECEDING);
    expect(NavLinks).toHaveBeenCalledWithProps(expect.objectContaining({
      links : expectedLinks,
    }));
  });

  it('renders default collection heading', () => {
    const { container } = render(CollectionPage, { data });

    const content = within(container)
      .queryByTestId('content-collection') as HTMLElement;
    expect(content).toBeInTheDocument();
    const nav = within(content).queryByTestId('nav') as HTMLElement;
    const heading = within(content).queryByTestId('heading') as HTMLElement;
    expect(heading).toBeInTheDocument();
    expect(heading.compareDocumentPosition(nav))
      .toBe(Node.DOCUMENT_POSITION_PRECEDING);
    expect(heading).toHaveTextContent(defaultLocale.collections.allArticles);
    expect(Heading).toHaveBeenCalledOnce();
    expect(Heading).toHaveBeenCalledWithProps(expect.objectContaining({
      level : 1,
    }));
  });

  it('renders article collection', () => {
    const expectedTag = {
      slug : 'test-tag',
      name : 'Test Tag',
      description : 'Test Tag Description',
      articles : [],
    };
    const { container } = render(CollectionPage, { data : {
      ...data,
      tag : expectedTag,
    } });

    const content = within(container)
      .queryByTestId('content-collection') as HTMLElement;
    expect(content).toBeInTheDocument();
    const nav = within(content).queryByTestId('nav') as HTMLElement;
    const index = within(content).queryByTestId('index') as HTMLElement;
    expect(index).toBeInTheDocument();
    expect(index.compareDocumentPosition(nav))
      .toBe(Node.DOCUMENT_POSITION_PRECEDING);
    expect(ArticleIndex).toHaveBeenCalledOnce();
    expect(ArticleIndex).toHaveBeenCalledWithProps(expect.objectContaining({
      tag : expectedTag.slug,
    }));
  });

  it('renders all article', () => {
    const { container } = render(CollectionPage, { data });

    const content = within(container)
      .queryByTestId('content-collection') as HTMLElement;
    expect(content).toBeInTheDocument();
    const nav = within(content).queryByTestId('nav') as HTMLElement;
    const index = within(content).queryByTestId('index') as HTMLElement;
    expect(index).toBeInTheDocument();
    expect(index.compareDocumentPosition(nav))
      .toBe(Node.DOCUMENT_POSITION_PRECEDING);
    expect(ArticleIndex).toHaveBeenCalledOnce();
    expect(ArticleIndex).toHaveBeenCalledWithProps(expect.not.objectContaining({
      tag : expect.anything(),
    }));
  });

  it('sets footer theme section', () => {
    render(CollectionPage, { data });
    expect(Content).toHaveBeenCalledWithProps(expect.objectContaining({
      section : 'footer',
    }));
  });

  it('renders footer', () => {
    const { container } = render(CollectionPage, { data });
    const articleContent = within(container)
      .queryByTestId('content-collection') as HTMLElement;
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

    render(CollectionPage, { data });

    vi.mocked(Content).mock.calls.forEach((args) => {
      expect(args[1])
        .toEqual(expect.objectContaining({ showBackground : false }));
    });
  });

  it('adds tag name to head', () => {
    const expectedTag = {
      slug : 'test-tag',
      name : 'Test Tag',
      description : 'Test Tag Description',
      articles : [],
    };
    render(CollectionPage, { data : {
      ...data,
      tag : expectedTag,
    } });

    const meta = document.head.querySelector('title');
    expect(meta).not.toBeNull();
    expect(meta?.textContent).toBe(expectedTag.name);
  });

  it('adds default title to head if not found', () => {
    render(CollectionPage, { data });

    const meta = document.head.querySelector('title');
    expect(meta).not.toBeNull();
    expect(meta?.textContent).toBe(defaultLocale.collections.allArticles);
  });

  it('adds tag description to head', () => {
    const expectedTag = {
      slug : 'test-tag',
      name : 'Test Tag',
      description : 'Test Tag Description',
      articles : [],
    };
    render(CollectionPage, { data : {
      ...data,
      tag : expectedTag,
    } });

    const meta = document.head.querySelector('meta[name="description"]');
    expect(meta).not.toBeNull();
    expect(meta?.getAttribute('content')).toBe(expectedTag.description);
  });

  it('does not add abstract to head if not found', () => {
    render(CollectionPage, { data });

    const meta = document.head.querySelector('meta[name="description"]');
    expect(meta).toBeNull();
  });
});
