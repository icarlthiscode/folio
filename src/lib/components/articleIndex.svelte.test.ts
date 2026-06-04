import { beforeEach, afterAll, describe, it, expect, vi } from 'vitest';
import { render, within } from '@testing-library/svelte';

import { tryGet } from '$lib/utils/typing';
import { wrapOriginal } from '$lib/tests/component';
import type { WeblogIndex } from '$lib/utils/weblog';
import Grid from '$lib/materials/grid.svelte';
import Card from '$lib/materials/card.svelte';
import Abstract from './abstract.svelte';
import ArticleIndex from './articleIndex.svelte';

const defaultIndex =
  vi.hoisted(() => ({ articles : {}, tags : {} } as WeblogIndex));
let setIndex : ((value : WeblogIndex) => void) = vi.hoisted(() => () => {});

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

vi.mock('$lib/materials/grid.svelte', async (original) => {
  return { default : await wrapOriginal(original, { testId : 'grid' }) };
});
vi.mock('$lib/materials/card.svelte', async (original) => {
  return { default : await wrapOriginal(original, { testId : 'card' }) };
});
vi.mock('$lib/materials/heading.svelte', async (original) => {
  return { default : await wrapOriginal(original, { testId : 'heading' }) };
});
vi.mock('$lib/components/abstract.svelte', async (original) => {
  return { default : await wrapOriginal(original, {
    testId : p =>
      `abstract-${tryGet(p, 'link', s => (typeof s === 'string')) ?? 'none'}`,
  }) };
});

beforeEach(() => {
  vi.clearAllMocks();
  setIndex({ ...defaultIndex });
});

afterAll(() => { vi.restoreAllMocks(); });

describe('ArticleIndex', () => {
  it('renders articles as abstracts', async () => {
    const index = {
      articles : {},
      tags : {
        test : {
          slug : 'test',
          name : 'Test',
          description : 'Test description.',
          articles : [
            {
              slug : 'article-1',
              title : 'Article 1',
              abstract : 'This is article 1.',
              datePublished : null,
              contributions : [],
              tags : [
                { name : 'Test Tag', slug : 'test' },
                { name : 'Alt Tag', slug : 'alt' },
              ],
            },
            {
              slug : 'article-2',
              title : 'Article 2',
              abstract : 'This is article 2.',
              datePublished : null,
              contributions : [],
              tags : [
                { name : 'Test Tag', slug : 'test' },
              ],
            },
          ],
        },
      },
    };
    setIndex(index);

    const { container } = render(ArticleIndex, { tag : 'test' });

    for (const article of index.tags.test?.articles || []) {
      const abstract = within(container)
        .queryByTestId(`abstract-/articles/${article.slug}`) as HTMLElement;
      expect(abstract).toBeInTheDocument();

      expect(Abstract).toHaveBeenCalledWithProps(
        expect.objectContaining({
          title : article.title,
          abstract : article.abstract,
          link : `/articles/${article.slug}`,
          datePublished : article.datePublished,
        }),
      );
    }
    expect(Abstract).toHaveBeenCalledTimes(2);
  });

  it('does not render more articles than max count', async () => {
    const expectedCount = 1;
    const index = {
      articles : {},
      tags : {
        test : {
          slug : 'test',
          name : 'Test',
          description : 'Test description.',
          articles : [
            {
              slug : 'article-1',
              title : 'Article 1',
              abstract : 'This is article 1.',
              datePublished : null,
              contributions : [],
              tags : [
                { name : 'Test Tag', slug : 'test' },
                { name : 'Alt Tag', slug : 'alt' },
              ],
            },
            {
              slug : 'article-2',
              title : 'Article 2',
              abstract : 'This is article 2.',
              datePublished : null,
              contributions : [],
              tags : [
                { name : 'Test Tag', slug : 'test' },
              ],
            },
          ],
        },
      },
    };
    setIndex(index);

    render(ArticleIndex, { tag : 'test', maxCount : expectedCount });

    expect(Abstract).toHaveBeenCalledTimes(expectedCount);
  });

  it('renders articles abstract with additional tags', async () => {
    const index = {
      articles : {},
      tags : {
        test : {
          slug : 'test',
          name : 'Test',
          description : 'Test description.',
          articles : [
            {
              slug : 'article-1',
              title : 'Article 1',
              abstract : 'This is article 1.',
              datePublished : null,
              contributions : [],
              tags : [
                { name : 'Test Tag', slug : 'test' },
                { name : 'Alt Tag', slug : 'alt' },
              ],
            },
            {
              slug : 'article-2',
              title : 'Article 2',
              abstract : 'This is article 2.',
              datePublished : null,
              contributions : [],
              tags : [
                { name : 'Test Tag', slug : 'test' },
              ],
            },
          ],
        },
      },
    };
    setIndex(index);

    render(ArticleIndex, { tag : 'test' });

    expect(Abstract).toHaveBeenCalledWithProps(expect.objectContaining({
      title : index.tags.test?.articles[0]?.title,
      tags : [index.tags.test?.articles[0]?.tags[1]],
    }));
    expect(Abstract).toHaveBeenCalledWithProps(expect.objectContaining({
      title : index.tags.test?.articles[1]?.title,
      tags : [],
    }));
  });

  it('renders article abstracts with specified heading level', async () => {
    const index = {
      articles : {},
      tags : {
        test : {
          slug : 'test',
          name : 'Test',
          description : 'Test description.',
          articles : [
            {
              slug : 'article-1',
              title : 'Article 1',
              abstract : 'This is article 1.',
              datePublished : null,
              contributions : [],
              tags : [],
            },
          ],
        },
      },
    };
    setIndex(index);

    render(ArticleIndex, { tag : 'test', headingLevel : 2 });

    expect(Abstract).toHaveBeenCalledWithProps(
      expect.objectContaining({ headingLevel : 2 }),
    );
  });

  it('renders article in card', async () => {
    const index = {
      articles : {},
      tags : {
        test : {
          slug : 'test',
          name : 'Test',
          description : 'Test description.',
          articles : [
            {
              slug : 'article-1',
              title : 'Article 1',
              abstract : 'This is article 1.',
              datePublished : null,
              contributions : [],
              tags : [],
            },
            {
              slug : 'article-2',
              title : 'Article 2',
              abstract : 'This is article 2.',
              datePublished : null,
              contributions : [],
              tags : [],
            },
          ],
        },
      },
    };
    setIndex(index);

    const { container } = render(ArticleIndex, { tag : 'test' });

    const cards = within(container).getAllByTestId('card') as HTMLElement[];
    expect(cards).toHaveLength(2);

    for (const article of index.tags.test?.articles || []) {
      const abstract = within(container)
        .queryByTestId(`abstract-/articles/${article.slug}`) as HTMLElement;
      expect(abstract).toBeInTheDocument();
      expect(cards.filter(c => c.contains(abstract)).length).toBe(1);
    }

    expect(Card).toHaveBeenCalledTimes(2);
  });

  it('renders article cards in grid', async () => {
    setIndex({
      articles : {},
      tags : {
        test : {
          slug : 'test',
          name : 'Test',
          description : 'Test description.',
          articles : [
            {
              slug : 'article-1',
              title : 'Article 1',
              abstract : 'This is article 1.',
              datePublished : null,
              contributions : [],
              tags : [],
            },
            {
              slug : 'article-2',
              title : 'Article 2',
              abstract : 'This is article 2.',
              datePublished : null,
              contributions : [],
              tags : [],
            },
          ],
        },
      },
    });
    const { container } = render(ArticleIndex, { tag : 'test' });

    const grid = within(container).queryByTestId('grid') as HTMLElement;
    expect(grid).toBeInTheDocument();
    const cards = within(grid).queryAllByTestId('card') as HTMLElement[];
    expect(cards).toHaveLength(2);

    expect(Grid).toHaveBeenCalledTimes(1);
  });
});
