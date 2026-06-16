import { beforeEach, afterAll, describe, it, expect, vi } from 'vitest';
import { render, within } from '@testing-library/svelte';

import { wrapOriginal } from '$lib/tests/component';
import Post from './post.svelte';
import Abstract from './abstract.svelte';

const locale =
  vi.hoisted(() => ({ collections : { tagPrefix : 'Tag:' } }));

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

vi.mock('$lib/components/post.svelte', async (original) => {
  return { default : await wrapOriginal(original, { testId : 'post' }) };
});

beforeEach(() => { vi.clearAllMocks(); });
afterAll(() => { vi.restoreAllMocks(); });

describe('Abstract', () => {
  it('renders abstract body as article content', async () => {
    const expectedTitle = 'Test Title';
    const expectedContent = 'This is the abstract body.';
    const expectedDate = new Date();
    const expectedLink = '/articles/test-article';
    const expectedLevel = 2;
    const { container } = render(Abstract, {
      title : expectedTitle,
      abstract : expectedContent,
      link : expectedLink,
      datePublished : expectedDate,
      headingLevel : expectedLevel,
    });

    const article = within(container)
      .queryByTestId('post') as HTMLElement;
    expect(article).toBeInTheDocument();

    expect(Post).toHaveBeenCalledTimes(1);
    expect(Post).toHaveBeenCalledWithProps(
      expect.objectContaining({
        content : expectedContent,
        heading : expect.objectContaining({
          text : expectedTitle,
          href : expectedLink,
          level : expectedLevel,
        }),
        datePublished : expectedDate,
        compact : true,
      }),
    );
  });

  it('renders tag links below article content', async () => {
    const expectedTags = [
      { name : 'Tag 1', slug : 'tag1' },
      { name : 'Tag 2', slug : 'tag2' },
    ];
    const expectedLinks = expectedTags.map(t => ({
      text : locale.collections.tagPrefix + t.name,
      href : `/collections/${t.slug}`,
    }));

    render(Abstract, { tags : expectedTags });

    expect(Post).toHaveBeenCalledTimes(1);
    expect(Post).toHaveBeenCalledWithProps(
      expect.objectContaining({ bottomLinks : expectedLinks }),
    );
  });
});
