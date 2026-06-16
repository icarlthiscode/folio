import { describe, it, expect, vi } from 'vitest';

import type { PageServerLoadEvent } from './$types';
import { load } from './+page.server';

const event = {
  request : new Request('http://localhost/test', {
    method : 'GET',
    headers : { 'Content-Type' : 'application/json' },
  }),
  url : new URL('http://localhost/'),
  fetch : vi.fn(),
} as unknown as PageServerLoadEvent;

describe('load', () => {
  it('returns no tag for root path', async () => {
    const parent = async () => ({ articleIndex : {} });
    const result = await load({
      ...event,
      params : { path : '' },
      parent,
    } as PageServerLoadEvent);

    expect(result?.tag).toBeUndefined();
  });

  it('returns tag pre-loaded article index', async () => {
    const expectedSlug = 'test-tag';
    const expectedTag = { slug : expectedSlug };
    const parent = async () => ({ articleIndex : {
      articles : {},
      tags : { [expectedSlug] : expectedTag },
    } } as unknown);
    const result = await load({
      ...event,
      params : { path : expectedSlug },
      parent,
    } as PageServerLoadEvent);

    expect(result?.tag).toBe(expectedTag);
  });

  it('raises 404 error when tag not found', async () => {
    const expectedSlug = 'test-tag';
    const parent = async () => ({ articleIndex : {
      articles : {},
      tags : {},
    } } as unknown);

    await expect(load({
      ...event,
      params : { path : expectedSlug },
      parent,
    } as PageServerLoadEvent))
      .rejects.toMatchObject(expect.objectContaining({ status : 404 }));
  });
});
