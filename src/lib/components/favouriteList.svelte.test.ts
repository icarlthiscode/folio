import { beforeEach, afterAll, describe, it, expect, vi } from 'vitest';
import { render, within } from '@testing-library/svelte';

import { tryGet } from '$lib/utils/typing';
import { wrapOriginal } from '$lib/tests/component';
import Text from '$lib/materials/text.svelte';
import ListItem from '$lib/materials/listItem.svelte';
import FavouriteList from './favouriteList.svelte';

let isBrowser = vi.hoisted(() => true);

const defaultConfig = vi.hoisted(() => ({
  likes : [
    { icon : 'icon1', text : 'like1' },
    { icon : 'icon2', text : 'like2' },
  ],
  dislikes : [
    { icon : 'icon3', text : 'dislike1' },
    { icon : 'icon4', text : 'dislike2' },
  ],
}));
let setConfig : ((value : unknown) => void) = vi.hoisted(() => () => {});

const locale = vi.hoisted(() => ({
  favourites : {
    header : 'Favourites',
    most : 'Most Favourite',
    least : 'Least Favourite',
  },
}));

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
  return {
    default : () => ({
      ...originalDefault(),
      locale : writable(locale),
    }),
  };
});

vi.mock('$lib/materials/text.svelte', async (original) => {
  return { default : await wrapOriginal(original, { testId : 'text' }) };
});
vi.mock('$lib/materials/listItem.svelte', async (original) => {
  return {
    default : await wrapOriginal(original, {
      testId : p =>
        `item-${tryGet(p, 'icon', s => typeof s === 'string') ?? 'none'}`,
    }),
  };
});

beforeEach(() => {
  vi.clearAllMocks();
  isBrowser = true;
  setConfig({ ...defaultConfig });
});

afterAll(() => { vi.restoreAllMocks(); });

describe('FavouriteList', () => {
  it.each([
    ['likes', 'most'],
    ['dislikes', 'least'],
  ])('does not render if no %s configured', (key, rank) => {
    setConfig({ ...defaultConfig, [key] : [] });

    const { container } = render(FavouriteList, {
      rank : rank as 'most' | 'least',
    });

    const child = container.children[0];
    expect(child).toBeUndefined();

    expect(Text).not.toHaveBeenCalled();
    expect(ListItem).not.toHaveBeenCalled();
  });

  it.each(['most', 'least'])('renders %s favourites heading', (rank) => {
    const { container } = render(FavouriteList, {
      rank : rank as 'most' | 'least',
      headingElement : 'h1',
    });

    const heading = within(container).queryByRole('heading', { level : 1 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent(locale.favourites.header);
  });

  it.each(['most', 'least'])('renders %s heading', (rank) => {
    const { container } = render(FavouriteList, {
      rank : rank as 'most' | 'least',
      headingElement : 'h2',
    });

    const heading = within(container).queryByRole('heading', { level : 2 });
    expect(heading).toBeInTheDocument();
    expect(heading)
      .toHaveTextContent(locale.favourites[rank as 'most' | 'least']);
  });

  it.each(['most', 'least'])('renders %s list items', (rank) => {
    const { container } = render(FavouriteList, {
      rank : rank as 'most' | 'least',
    });

    const list = within(container).queryByRole('list') as HTMLElement;
    expect(list).toBeInTheDocument();

    const items = within(list).queryAllByRole('listitem');
    expect(items)
      .toHaveLength(defaultConfig[rank === 'most' ? 'likes' : 'dislikes']
        .length);
    for (const item of items) expect(item).toBeInTheDocument();

    for (const fav of defaultConfig[rank === 'most' ? 'likes' : 'dislikes']) {
      const item = within(list)
        .queryByTestId(`item-${fav.icon}`) as HTMLElement;
      expect(item).toBeInTheDocument();

      expect(item).toHaveTextContent(fav.text);

      expect(ListItem).toHaveBeenCalledWithProps(expect.objectContaining({
        icon : fav.icon,
      }));
    }
  });

  it('hides icon server-side', () => {
    isBrowser = false;
    render(FavouriteList);

    expect(ListItem).toHaveBeenCalled();
    vi.mocked(ListItem).mock.calls.forEach((args) => {
      expect(args[1])
        .toEqual(expect.objectContaining({ showIcon : false }));
    });
  });
});
