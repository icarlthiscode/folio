import { beforeEach, afterAll, describe, it, expect, vi } from 'vitest';

import { loadAbstract, loadArticle } from '$lib/server/weblog';
import type { PageServerLoadEvent, PageServerParentData } from './$types';
import { load } from './+page.server';

const parentData = {
  config : { weblog : { url : 'test-weblog' } },
  articleIndex : { articles : {} },
};
const event = {
  request : new Request('http://localhost/articles/test/path', {
    method : 'GET',
    headers : { 'Content-Type' : 'application/json' },
  }),
  params : { path : 'test/path' },
  parent : () => parentData,
  url : new URL('http://localhost/articles/test/path'),
  fetch : vi.fn(),
} as unknown as PageServerLoadEvent;

vi.mock('$lib/stores/config', async (original) => {
  const originalDefault =
    ((await original()) as { default : () => object; }).default;
  const writable = (await import('svelte/store')).writable;
  return {
    ...originalDefault,
    config : writable({ weblog : { url : 'test-weblog' } }),
  };
});
vi.mock('$lib/server/weblog', async original => ({
  ...(await original()),
  loadAbstract : vi.fn(() => {}),
  loadArticle : vi.fn(() => {}),
}));

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(loadAbstract).mockResolvedValue({ title : '', body : '' });
  vi.mocked(loadArticle).mockResolvedValue('Test Content');
});
afterAll(() => { vi.restoreAllMocks(); });

describe('load', () => {
  it('retrieves article title and abstract', async () => {
    vi.mocked(loadAbstract).mockResolvedValue({
      title : 'Test Article',
      body : 'This is a test abstract.',
    });

    const result = await load(event);

    expect(result).toEqual(expect.objectContaining({
      title : 'Test Article',
      abstract : 'This is a test abstract.',
    }));
    expect(loadAbstract).toHaveBeenCalledWith(
      'test-weblog',
      'test/path',
      { fetch : event.fetch },
    );
  });

  it('retrieves article contents', async () => {
    vi.mocked(loadArticle).mockResolvedValue('Article Content');

    const result = await load(event);

    expect(result).toEqual(expect.objectContaining({
      markdown : 'Article Content',
    }));
    expect(loadArticle).toHaveBeenCalledWith(
      'test-weblog',
      'test/path',
      { fetch : event.fetch },
    );
  });

  it('retrieves article metadata', async () => {
    const expectedMetadata = { title : 'Test Article' };

    const result = await load({
      ...event,
      params : { path : 'test/path' },
      parent : async () => ({
        ...parentData,
        articleIndex : {
          articles : { [event.params.path] : expectedMetadata },
        },
      } as PageServerParentData),
    });

    expect(result).toEqual(expect.objectContaining({
      metadata : expectedMetadata,
    }));
  });

  it('raises 404 error when article not found', async () => {
    vi.mocked(loadArticle).mockResolvedValue('');

    await expect(load(event)).rejects
      .toMatchObject(expect.objectContaining({ status : 404 }));
  });
});
