import { beforeEach, afterAll, describe, it, expect, vi } from 'vitest';
import { loadArticles } from '$lib/server/weblog';

import type { PageServerLoadEvent, PageServerParentData } from './$types';
import { load } from './+page.server';

const event = {
  request : new Request('http://localhost/test', {
    method : 'GET',
    headers : { 'Content-Type' : 'application/json' },
  }),
  url : new URL('http://localhost/'),
  fetch : vi.fn(),
} as unknown as PageServerLoadEvent;

const loadIArticlesMock = vi.hoisted(() => vi.fn());

vi.mock('$lib/server/weblog', async original => ({
  ...(await original()),
  loadArticles : loadIArticlesMock,
}));

beforeEach(() => { vi.clearAllMocks(); });
afterAll(() => { vi.restoreAllMocks(); });

describe('+layout.server.ts', () => {
  it('loads highlight articles', async () => {
    const fetch = vi.fn();
    const expectedWeblogUrl = 'http://weblog.com/path/';
    const expectedKeys = ['article1', 'article2'];

    await load({
      ...event,
      parent : async () => ({ config : {
        weblog : { url : expectedWeblogUrl },
        highlights : expectedKeys.map(k => ({ type : 'article', key : k })),
      } } as PageServerParentData),
      fetch,
    });

    expect(loadArticles).toHaveBeenCalledOnce();
    expect(loadArticles).toHaveBeenCalledWith(
      expectedWeblogUrl,
      expectedKeys,
      { fetch },
    );
  });

  it('does not attempt to load highlight tags', async () => {
    const fetch = vi.fn();
    const expectedWeblogUrl = 'http://weblog.com/path/';
    const expectedHighlights = [{ type : 'tags', key : 'tags1' }];

    await load({
      ...event,
      parent : async () => ({ config : {
        weblog : { url : expectedWeblogUrl },
        highlights : expectedHighlights,
      } } as PageServerParentData),
      fetch,
    });

    expect(loadArticles).not.toHaveBeenCalled();
  });

  it('returns loaded highlight articles', async () => {
    const expected = {
      'test-article1' : 'Test Article 1',
      'test-article2' : 'Test Article 2',
    };
    loadIArticlesMock.mockResolvedValue(expected);

    const actual = await load({
      ...event,
      parent : async () => ({ config : {
        weblog : { url : 'base/' },
        highlights : [
          { type : 'article', key : 'article1' },
          { type : 'article', key : 'article2' },
        ],
      } } as PageServerParentData),
      fetch,
    });

    expect(actual?.articles).toBe(expected);
  });
});
