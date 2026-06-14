import { beforeEach, afterAll, describe, it, expect, vi } from 'vitest';
import { render, within } from '@testing-library/svelte';

import { wrapOriginal } from '$lib/tests/component';
import type { Article, WeblogIndex } from '$lib/utils/weblog';
import Heading from '$lib/materials/heading.svelte';
import NavLinks from '$lib/materials/navLinks.svelte';
import ArticleIndex from './articleIndex.svelte';
import Post from './post.svelte';
import Highlight from './highlight.svelte';

const baseHighlight = {
  id : 'test-highlight',
  type : 'tag' as const,
  key : 'test',
  count : null,
  title : 'Test Tag Title',
  intro : '',
  outro : '',
  links : [],
  section : 'highlightTest',
};

const baseArticle : Article = {
  slug : 'test',
  canonicalRef : undefined,
  title : 'Test Article',
  abstract : 'This is a test article.',
  datePublished : null,
  contributions : [],
  tags : [],
};

const defaultLocale = vi.hoisted(() => ({
  highlights : { defaultHeading : 'Test Default Heading' },
  collections : { },
}));

const defaultIndex =
  vi.hoisted(() => ({ articles : {}, tags : {} } as WeblogIndex));
let setIndex : ((value : WeblogIndex) => void) = vi.hoisted(() => () => {});

vi.mock('$lib/hooks/useLocale', async (original) => {
  const originalDefault =
    ((await original()) as { default : () => object; }).default;
  const writable = (await import('svelte/store')).writable;
  return {
    default : () => ({
      ...originalDefault(),
      locale : writable(defaultLocale),
    }),
  };
});

vi.mock('$lib/hooks/useArticles', async (original) => {
  const originalDefault =
    ((await original()) as { default : () => object; }).default;
  const writable = (await import('svelte/store')).writable;
  const index = writable<WeblogIndex>();
  setIndex = (value : WeblogIndex) => index.set(value);
  return {
    default : () => ({
      ...originalDefault(),
      index,
    }),
  };
});

vi.mock('$lib/materials/heading.svelte', async (original) => {
  return { default : await wrapOriginal(original, { testId : 'heading' }) };
});
vi.mock('$lib/materials/navLinks.svelte', async (original) => {
  return { default : await wrapOriginal(original, { testId : 'nav' }) };
});
vi.mock('$lib/components/articleIndex.svelte', async (original) => {
  return { default : await wrapOriginal(original, { testId : 'index' }) };
});
vi.mock('$lib/components/post.svelte', async (original) => {
  return { default : await wrapOriginal(original, { testId : 'post' }) };
});

beforeEach(() => {
  vi.clearAllMocks();
  setIndex({ ...defaultIndex });
});

afterAll(() => { vi.restoreAllMocks(); });

describe('Highlight', () => {
  it('renders tag highlight heading', () => {
    const highlight = {
      ...baseHighlight,
      id : 'test-highlight',
    };
    const { container } = render(Highlight, { highlight });

    const index = within(container)
      .queryByTestId('index') as HTMLElement;
    expect(index).toBeInTheDocument();
    const heading = within(container)
      .queryByTestId('heading') as HTMLElement;
    expect(heading).toBeInTheDocument();

    expect(Heading).toHaveBeenCalledOnce();
    expect(Heading).toHaveBeenCalledWithProps(
      expect.objectContaining({
        id : highlight.id,
        level : 2,
        scrim : true,
      }),
    );
    expect(heading).toHaveTextContent(highlight.title);

    expect(heading.compareDocumentPosition(index))
      .toBe(Node.DOCUMENT_POSITION_FOLLOWING);
  });

  it('renders article highlight heading', () => {
    const highlight = {
      ...baseHighlight,
      id : 'test-highlight',
      type : 'article' as const,
    };
    const { container } = render(Highlight, { highlight });

    const post = within(container)
      .queryByTestId('post') as HTMLElement;
    expect(post).toBeInTheDocument();
    const heading = within(container)
      .queryByTestId('heading') as HTMLElement;
    expect(heading).toBeInTheDocument();

    expect(Heading).toHaveBeenCalledOnce();
    expect(Heading).toHaveBeenCalledWithProps(
      expect.objectContaining({
        id : highlight.id,
        level : 2,
      }),
    );
    expect(heading).toHaveTextContent(highlight.title);

    expect(heading.compareDocumentPosition(post))
      .toBe(Node.DOCUMENT_POSITION_FOLLOWING);
  });

  it('renders default heading', () => {
    const highlight = {
      ...baseHighlight,
      id : 'test-highlight',
      title : '',
    };
    const { container } = render(Highlight, { highlight });

    const heading = within(container)
      .queryByTestId('heading') as HTMLElement;
    expect(heading).toBeInTheDocument();

    expect(Heading).toHaveBeenCalledOnce();
    expect(Heading).toHaveBeenCalledWithProps(
      expect.objectContaining({
        id : highlight.id,
        level : 2,
      }),
    );
    expect(heading).toHaveTextContent(defaultLocale.highlights.defaultHeading);
  });

  it('renders article index with highlight tag', async () => {
    const highlight = {
      ...baseHighlight,
      id : 'test-highlight',
      type : 'tag' as const,
      count : 42,
    };
    const { container } = render(Highlight, { highlight });

    const index = within(container)
      .queryByTestId('index') as HTMLElement;
    expect(index).toBeInTheDocument();

    expect(ArticleIndex).toHaveBeenCalledOnce();
    expect(ArticleIndex).toHaveBeenCalledWithProps(
      expect.objectContaining({
        tag : highlight.key,
        maxCount : highlight.count,
      }),
    );
    expect(Post).not.toHaveBeenCalled();
  });

  it('renders article index introduction', async () => {
    const highlight = {
      ...baseHighlight,
      id : 'test-highlight',
      type : 'tag' as const,
      intro : 'test-intro',
    };
    const expectedContent = 'Test introduction';
    setIndex({
      articles : { [highlight.intro] : {
        ...baseArticle,
        abstract : expectedContent,
      } },
      tags : {},
    });

    const { container } = render(Highlight, { highlight });

    const heading = within(container)
      .queryByTestId('heading') as HTMLElement;
    expect(heading).toBeInTheDocument();
    const intro = within(container).queryByTestId('post') as HTMLElement;
    expect(intro).toBeInTheDocument();
    const index = within(container)
      .queryByTestId('index') as HTMLElement;
    expect(index).toBeInTheDocument();
    expect(intro.compareDocumentPosition(heading))
      .toBe(Node.DOCUMENT_POSITION_PRECEDING);
    expect(intro.compareDocumentPosition(index))
      .toBe(Node.DOCUMENT_POSITION_FOLLOWING);

    expect(ArticleIndex).toHaveBeenCalledOnce();
    expect(ArticleIndex).toHaveBeenCalledWithProps(
      expect.objectContaining({
        tag : highlight.key,
        maxCount : highlight.count,
      }),
    );
    expect(Post).toHaveBeenCalledOnce();
    expect(Post).toHaveBeenCalledWithProps(
      expect.objectContaining({ content : expectedContent }),
    );
  });

  it('renders article index conclusion', async () => {
    const highlight = {
      ...baseHighlight,
      id : 'test-highlight',
      type : 'tag' as const,
      outro : 'test-outro',
      links : [{ text : 'Test Link', href : '#test' }],
    };
    const expectedContent = 'Test introduction';
    setIndex({
      articles : { [highlight.outro] : {
        ...baseArticle,
        abstract : expectedContent,
      } },
      tags : {},
    });

    const { container } = render(Highlight, { highlight });

    const index = within(container)
      .queryByTestId('index') as HTMLElement;
    expect(index).toBeInTheDocument();
    const outro = within(container).queryByTestId('post') as HTMLElement;
    expect(outro).toBeInTheDocument();
    const links = within(container)
      .queryByTestId('nav') as HTMLElement;
    expect(links).toBeInTheDocument();
    expect(outro.compareDocumentPosition(index))
      .toBe(Node.DOCUMENT_POSITION_PRECEDING);
    expect(outro.compareDocumentPosition(links))
      .toBe(Node.DOCUMENT_POSITION_FOLLOWING);

    expect(ArticleIndex).toHaveBeenCalledOnce();
    expect(ArticleIndex).toHaveBeenCalledWithProps(
      expect.objectContaining({
        tag : highlight.key,
        maxCount : highlight.count,
      }),
    );
    expect(Post).toHaveBeenCalledOnce();
    expect(Post).toHaveBeenCalledWithProps(
      expect.objectContaining({ content : expectedContent }),
    );
  });

  it('renders post with highlight article', async () => {
    const expectedContent = 'Test Article Content';
    const highlight = {
      ...baseHighlight,
      id : 'test-highlight',
      type : 'article' as const,
    };
    const expectedMetadata = {
      datePublished : new Date(),
      contributions : [{ byline : 'Tested by ' }],
    } as Article;

    const { container } = render(Highlight, {
      highlight,
      article : expectedContent,
      metadata : expectedMetadata,
    });

    const post = within(container)
      .queryByTestId('post') as HTMLElement;
    expect(post).toBeInTheDocument();

    expect(Post).toHaveBeenCalledOnce();
    expect(Post).toHaveBeenCalledWithProps(expect.objectContaining({
      content : expectedContent,
      datePublished : expectedMetadata.datePublished,
      contributions : expectedMetadata.contributions,
    }));
    expect(ArticleIndex).not.toHaveBeenCalled();
  });

  it('renders article index links', async () => {
    const highlight = {
      ...baseHighlight,
      id : 'test-highlight',
      type : 'tag' as const,
      links : [{ text : 'Test Link', href : '#test' }],
    };
    const { container } = render(Highlight, { highlight });

    const index = within(container)
      .queryByTestId('index') as HTMLElement;
    expect(index).toBeInTheDocument();
    const links = within(container)
      .queryByTestId('nav') as HTMLElement;
    expect(links).toBeInTheDocument();
    expect(links.compareDocumentPosition(index))
      .toBe(Node.DOCUMENT_POSITION_PRECEDING);

    expect(NavLinks).toHaveBeenCalledOnce();
    expect(NavLinks).toHaveBeenCalledWithProps(expect.objectContaining({
      links : highlight.links,
    }));
  });

  it('renders article links', async () => {
    const expectedContent = 'Test Article Content';
    const highlight = {
      ...baseHighlight,
      id : 'test-highlight',
      type : 'article' as const,
      key : 'test',
      links : [{ text : '', href : '' }],
    };
    const expectedMetadata = {
      datePublished : new Date(),
      contributions : [{ byline : 'Tested by ' }],
    } as Article;

    const { container } = render(Highlight, {
      highlight,
      article : expectedContent,
      metadata : expectedMetadata,
    });

    const post = within(container)
      .queryByTestId('post') as HTMLElement;
    expect(post).toBeInTheDocument();
    const links = within(container)
      .queryByTestId('nav') as HTMLElement;
    expect(links).toBeInTheDocument();
    expect(links.compareDocumentPosition(post))
      .toBe(Node.DOCUMENT_POSITION_PRECEDING);

    expect(NavLinks).toHaveBeenCalledOnce();
    expect(NavLinks).toHaveBeenCalledWithProps(expect.objectContaining({
      links : highlight.links,
    }));
  });
});
