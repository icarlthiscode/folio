import { beforeEach, afterAll, describe, it, expect, vi } from 'vitest';

import {
  type Article,
  type WeblogIndex,
  extractArticle,
  resolveWeblogIndex,
} from '$lib/utils/weblog';
import { fetchJsonResource, fetchResource } from './http';
import { loadIndex, loadAbstract, loadArticle, loadArticles } from './weblog';

vi.mock('$lib/utils/weblog', () => ({
  extractArticle : vi.fn(() => ({})),
  resolveWeblogIndex : vi.fn(() => ({})),
}));
vi.mock('./http', () => ({
  fetchResource : vi.fn(() => ''),
  fetchJsonResource : vi.fn(() => ({})),
}));

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(extractArticle).mockResolvedValue({ title : '', body : '' });
  vi.mocked(resolveWeblogIndex).mockResolvedValue({} as WeblogIndex);
  vi.mocked(fetchResource).mockResolvedValue('');
  vi.mocked(fetchJsonResource).mockResolvedValue({});
});

afterAll(() => { vi.restoreAllMocks(); });

describe('loadIndex', () => {
  it('fetches index.json', async () => {
    const fetch = vi.fn();
    const basePath = '/base';

    await loadIndex(basePath, { fetch });

    expect(fetchJsonResource).toHaveBeenCalledExactlyOnceWith(
      `${basePath}/index.json`,
      { fetch },
    );
  });

  it('resolves base paths with trailing slashes', async () => {
    const fetch = vi.fn();
    const basePath = '/base';

    await loadIndex(basePath + '/', { fetch });
    expect(fetchJsonResource).toHaveBeenCalledWith(
      `${basePath}/index.json`,
      { fetch },
    );
  });

  it('resolves fetched weblog index', async () => {
    const fetch = vi.fn();
    const basePath = '/base';
    const fetched = {
      articles : {
        'article-1' : {
          slug : 'article-1',
          title : 'Article 1',
          abstract : 'This is article 1.',
        } as Article,
      },
    };
    const expected = { ...fetched, tags : {} };
    vi.mocked(fetchJsonResource).mockResolvedValue(fetched);
    vi.mocked(resolveWeblogIndex).mockReturnValue(expected);

    const actual = await loadIndex(basePath, { fetch });

    expect(resolveWeblogIndex).toHaveBeenCalledExactlyOnceWith(fetched);
    expect(actual).toEqual(expected);
  });

  it('resolves default weblog index if no path', async () => {
    const fetch = vi.fn();
    const basePath = '';
    const expected = {
      articles : {
        'article-1' : {
          slug : 'article-1',
          title : 'Article 1',
          abstract : 'This is article 1.',
        } as Article,
      },
      tags : {},
    };
    vi.mocked(resolveWeblogIndex).mockReturnValue(expected);

    const actual = await loadIndex(basePath, { fetch });

    expect(fetchJsonResource).not.toHaveBeenCalled();
    expect(resolveWeblogIndex).toHaveBeenCalledExactlyOnceWith({});
    expect(actual).toEqual(expected);
  });

  it('resolves default weblog index if fetch fails', async () => {
    const fetch = vi.fn();
    const basePath = '/base';
    const expected = {
      articles : {
        'article-1' : {
          slug : 'article-1',
          title : 'Article 1',
          abstract : 'This is article 1.',
        } as Article,
      },
      tags : {},
    };
    vi.mocked(fetchJsonResource).mockResolvedValue(null);
    vi.mocked(resolveWeblogIndex).mockReturnValue(expected);

    const actual = await loadIndex(basePath, { fetch });

    expect(resolveWeblogIndex).toHaveBeenCalledExactlyOnceWith({});
    expect(actual).toEqual(expected);
  });
});

describe('loadAbstract', () => {
  it('fetches article abstract content', async () => {
    const fetch = vi.fn();
    const basePath = '/base';
    const path = 'test-article';

    await loadAbstract(basePath, path, { fetch });

    expect(fetchResource).toHaveBeenCalledExactlyOnceWith(
      `${basePath}/abstracts/${path}.md`,
      { fetch },
    );
  });

  it('resolves abstract base paths with trailing slashes', async () => {
    const fetch = vi.fn();
    const basePath = '/base';
    const path = 'test-article';

    await loadAbstract(basePath + '/', path, { fetch });
    expect(fetchResource).toHaveBeenCalledExactlyOnceWith(
      `${basePath}/abstracts/${path}.md`,
      { fetch },
    );
  });

  it('extracts article abstract title and body', async () => {
    const fetch = vi.fn();
    const basePath = '/base';
    const path = 'test-article';
    const markdown = '# Title\n\nThis is the abstract.';
    const expected = { title : 'Title', body : 'This is the abstract.' };
    vi.mocked(fetchResource).mockResolvedValue(markdown);
    vi.mocked(extractArticle).mockResolvedValue(expected);

    const actual = await loadAbstract(basePath, path, { fetch });

    expect(actual).toEqual(expected);
    expect(extractArticle).toHaveBeenCalledExactlyOnceWith(markdown);
  });

  it('returns empty title and body if fetch fails', async () => {
    vi.mocked(fetchResource).mockResolvedValue(null);
    const result = await loadAbstract('/base', 'article', { fetch : vi.fn() });
    expect(result).toEqual({ title : '', body : '' });
  });
});

describe('loadArticle', () => {
  it('fetches article markdown', async () => {
    const fetch = vi.fn();
    const basePath = '/base';
    const path = 'test-article';
    const expected = 'content';
    vi.mocked(fetchResource).mockResolvedValue(expected);

    const actual = await loadArticle(basePath, path, { fetch });

    expect(actual).toEqual(expected);
    expect(fetchResource).toHaveBeenCalledTimes(1);
    expect(fetchResource).toHaveBeenCalledWith(
      `${basePath}/articles/${path}.md`,
      { fetch },
    );
  });

  it('resolves article base paths with trailing slashes', async () => {
    const fetch = vi.fn();
    const basePath = '/base';
    const path = 'test-article';

    await loadArticle(basePath + '/', path, { fetch });
    expect(fetchResource).toHaveBeenCalledWith(
      `${basePath}/articles/${path}.md`,
      { fetch },
    );
  });

  it('returns empty string if fetch fails', async () => {
    vi.mocked(fetchResource).mockResolvedValue(null);
    const result = await loadArticle('/base', 'article', { fetch : vi.fn() });
    expect(result).toEqual('');
  });

  it('removes .md extensions from inline links', async () => {
    const markdown = '[Link](./other-article.md)';
    const expected = '[Link](./other-article)';
    vi.mocked(fetchResource).mockResolvedValue(markdown);

    const actual = await loadArticle('/base', 'article', { fetch : vi.fn() });

    expect(actual).toEqual(expected);
  });

  it('removes .md extensions from inline links with anchors', async () => {
    const markdown = '[Link](./other-article.md#section)';
    const expected = '[Link](./other-article#section)';
    vi.mocked(fetchResource).mockResolvedValue(markdown);

    const actual = await loadArticle('/base', 'article', { fetch : vi.fn() });

    expect(actual).toEqual(expected);
  });

  it('removes .md extensions from inline links with query', async () => {
    const markdown = '[Link](./other-article.md?param=value)';
    const expected = '[Link](./other-article?param=value)';
    vi.mocked(fetchResource).mockResolvedValue(markdown);

    const actual = await loadArticle('/base', 'article', { fetch : vi.fn() });
    expect(actual).toEqual(expected);
  });

  it('does not alter absolute links', async () => {
    const markdown = '[Link](https://example.com/other-article.md)';
    const expected = '[Link](https://example.com/other-article.md)';
    vi.mocked(fetchResource).mockResolvedValue(markdown);

    const actual = await loadArticle('/base', 'article', { fetch : vi.fn() });

    expect(actual).toEqual(expected);
  });

  it('removes .md extensions from implied links', async () => {
    const markdown = '[Link]: ./other-article.md\n';
    const expected = '[Link]: ./other-article\n';
    vi.mocked(fetchResource).mockResolvedValue(markdown);

    const actual = await loadArticle('/base', 'article', { fetch : vi.fn() });

    expect(actual).toEqual(expected);
  });

  it('removes .md extensions from implied links with anchors', async () => {
    const markdown = '[Link]: ./other-article.md#section';
    const expected = '[Link]: ./other-article#section';
    vi.mocked(fetchResource).mockResolvedValue(markdown);

    const actual = await loadArticle('/base', 'article', { fetch : vi.fn() });

    expect(actual).toEqual(expected);
  });

  it('removes .md extensions from implied links with query', async () => {
    const markdown = '[Link]: ./other-article.md?param=value';
    const expected = '[Link]: ./other-article?param=value';
    vi.mocked(fetchResource).mockResolvedValue(markdown);

    const actual = await loadArticle('/base', 'article', { fetch : vi.fn() });

    expect(actual).toEqual(expected);
  });

  it('does not alter absolute implied links', async () => {
    const markdown = '[Link]: https://example.com/other-article.md';
    const expected = '[Link]: https://example.com/other-article.md';
    vi.mocked(fetchResource).mockResolvedValue(markdown);

    const actual = await loadArticle('/base', 'article', { fetch : vi.fn() });

    expect(actual).toEqual(expected);
  });
});

describe('loadArticles', () => {
  it('fetches article markdown', async () => {
    const fetch = vi.fn();
    const basePath = '/base';
    const keys = [
      'test-article-1',
      'test-article-2',
    ];
    vi.mocked(fetchResource).mockImplementation(async (u, _) => `Article ${u}`);
    const expected = Object.fromEntries(
      keys.map(k => [k, `Article ${basePath}/articles/${k}.md`]),
    );

    const actual = await loadArticles(basePath, keys, { fetch });

    expect(actual).toEqual(expected);
    expect(fetchResource).toHaveBeenCalledTimes(keys.length);
    for (const key of keys) {
      expect(fetchResource).toHaveBeenCalledWith(
        `${basePath}/articles/${key}.md`,
        { fetch },
      );
    }
  });

  it('resolves article base paths with trailing slashes', async () => {
    const fetch = vi.fn();
    const basePath = '/base';
    const keys = ['test-article-1'];

    await loadArticles(basePath + '/', keys, { fetch });
    expect(fetchResource).toHaveBeenCalledWith(
      `${basePath}/articles/${keys[0]}.md`,
      { fetch },
    );
  });

  it('returns empty string if fetch fails', async () => {
    const key = 'test-article-1';
    vi.mocked(fetchResource).mockResolvedValue(null);
    const result = await loadArticles(
      '/base',
      [key],
      { fetch : vi.fn() },
    );
    expect(result).toEqual({ [key] : '' });
  });

  it('removes .md extensions from inline links', async () => {
    const markdown = '[Link](./other-article.md)';
    const expectedKey = 'article';
    const expected = { [expectedKey] : '[Link](./other-article)' };
    vi.mocked(fetchResource).mockResolvedValue(markdown);

    const actual = await loadArticles(
      '/base',
      [expectedKey],
      { fetch : vi.fn() },
    );

    expect(actual).toEqual(expected);
  });

  it('removes .md extensions from inline links with anchors', async () => {
    const markdown = '[Link](./other-article.md#section)';
    const expectedKey = 'article';
    const expected = { [expectedKey] : '[Link](./other-article#section)' };
    vi.mocked(fetchResource).mockResolvedValue(markdown);

    const actual = await loadArticles(
      '/base',
      [expectedKey],
      { fetch : vi.fn() },
    );

    expect(actual).toEqual(expected);
  });

  it('removes .md extensions from inline links with query', async () => {
    const markdown = '[Link](./other-article.md?param=value)';
    const expectedKey = 'article';
    const expected = { [expectedKey] : '[Link](./other-article?param=value)' };
    vi.mocked(fetchResource).mockResolvedValue(markdown);

    const actual = await loadArticles(
      '/base',
      [expectedKey],
      { fetch : vi.fn() },
    );

    expect(actual).toEqual(expected);
  });

  it('does not alter absolute links', async () => {
    const markdown = '[Link](https://example.com/other-article.md)';
    const expectedKey = 'article';
    const expected = {
      [expectedKey] : '[Link](https://example.com/other-article.md)',
    };
    vi.mocked(fetchResource).mockResolvedValue(markdown);

    const actual = await loadArticles(
      '/base',
      [expectedKey],
      { fetch : vi.fn() },
    );

    expect(actual).toEqual(expected);
  });

  it('removes .md extensions from implied links', async () => {
    const markdown = '[Link]: ./other-article.md\n';
    const expectedKey = 'article';
    const expected = { [expectedKey] : '[Link]: ./other-article\n' };
    vi.mocked(fetchResource).mockResolvedValue(markdown);

    const actual = await loadArticles(
      '/base',
      [expectedKey],
      { fetch : vi.fn() },
    );

    expect(actual).toEqual(expected);
  });

  it('removes .md extensions from implied links with anchors', async () => {
    const markdown = '[Link]: ./other-article.md#section';
    const expectedKey = 'article';
    const expected = { [expectedKey] : '[Link]: ./other-article#section' };
    vi.mocked(fetchResource).mockResolvedValue(markdown);

    const actual = await loadArticles(
      '/base',
      [expectedKey],
      { fetch : vi.fn() },
    );

    expect(actual).toEqual(expected);
  });

  it('removes .md extensions from implied links with query', async () => {
    const markdown = '[Link]: ./other-article.md?param=value';
    const expectedKey = 'article';
    const expected = { [expectedKey] : '[Link]: ./other-article?param=value' };
    vi.mocked(fetchResource).mockResolvedValue(markdown);

    const actual = await loadArticles(
      '/base',
      [expectedKey],
      { fetch : vi.fn() },
    );

    expect(actual).toEqual(expected);
  });

  it('does not alter absolute implied links', async () => {
    const markdown = '[Link]: https://example.com/other-article.md';
    const expectedKey = 'article';
    const expected = {
      [expectedKey] : '[Link]: https://example.com/other-article.md',
    };
    vi.mocked(fetchResource).mockResolvedValue(markdown);

    const actual = await loadArticles(
      '/base',
      [expectedKey],
      { fetch : vi.fn() },
    );

    expect(actual).toEqual(expected);
  });
});
