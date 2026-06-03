import {
  beforeAll,
  beforeEach,
  afterAll,
  describe,
  it,
  expect,
  vi,
} from 'vitest';
import { page } from 'vitest/browser';
import { cleanup, render } from '@testing-library/svelte';

import { loadStyles } from '$lib/tests/browser';
import { wrapOriginal } from '$lib/tests/component';
import Graphic from './graphic.svelte';
import Title from './title.svelte';
import Subtitle from './subtitle.svelte';
import TitleCard from './titleCard.svelte';

vi.mock('$lib/hooks/useThemes', async (original) => {
  const originalDefault =
    ((await original()) as { default : () => object; }).default;
  const writable = (await import('svelte/store')).writable;
  const graphic = writable<unknown>({ src : 'test-graphic.png' });
  return {
    default : () => ({
      ...originalDefault(),
      graphic,
    }),
  };
});

vi.mock('$lib/materials/graphic.svelte', async original => ({
  default : await wrapOriginal(original, { testId : 'graphic' }),
}));
vi.mock('$lib/materials/title.svelte', async original => ({
  default : await wrapOriginal(original, { testId : 'title' }),
}));
vi.mock('$lib/materials/subtitle.svelte', async original => ({
  default : await wrapOriginal(original, { testId : 'subtitle' }),
}));

beforeAll(async () => await loadStyles());

beforeEach(() => {
  vi.clearAllMocks();
  cleanup();
});

afterAll(() => { vi.restoreAllMocks(); });

describe('TitleCard', () => {
  it('renders title, subtitle, and graphic', async () => {
    await page.viewport(1024, 1024);

    const { container } = render(TitleCard, {
      title : 'Title Text',
      subtitle : 'Subtitle Text',
    });

    container.style.setProperty('--layout-spacing', '64px');

    const card = container.children[0] as HTMLElement;
    await expect.element(card).toBeInTheDocument();

    const title = page.elementLocator(container)
      .getByTestId('title')
      .getByText('Title Text');
    const subtitle = page.elementLocator(container)
      .getByTestId('subtitle')
      .getByText('Subtitle Text');
    await expect.element(title).toBeInTheDocument();
    await expect.element(subtitle).toBeInTheDocument();

    const graphic = page.elementLocator(container)
      .getByTestId('graphic')
      .element()
      .querySelector('img') as HTMLImageElement;
    await expect.element(graphic).toBeInTheDocument();

    expect(Title).toHaveBeenCalledOnce();
    expect(Title).toHaveBeenCalledWithProps(expect.objectContaining({
      flex : true,
    }));
    expect(Subtitle).toHaveBeenCalledOnce();
    expect(Subtitle).toHaveBeenCalledWithProps(expect.objectContaining({
      flex : true,
    }));
    expect(Graphic).toHaveBeenCalledOnce();
    expect(Graphic).toHaveBeenCalledWithProps(expect.objectContaining({
      graphic : 'titleAccent',
    }));

    const cardStyle = getComputedStyle(card);

    const cardBounds = card.getBoundingClientRect();
    const titleBounds = title.element().getBoundingClientRect();
    const subtitleBounds = subtitle.element().getBoundingClientRect();
    const graphicBounds = graphic.getBoundingClientRect();

    expect(cardStyle.paddingRight).toBe('0px');

    expect(cardBounds.width).toEqual(200);
    expect(subtitleBounds.top).toBeGreaterThanOrEqual(titleBounds.bottom);
    expect(subtitleBounds.left).toEqual(titleBounds.left);
    expect(graphicBounds.top).toBeGreaterThan(subtitleBounds.top);
  });

  it('renders with padding in wide view', async () => {
    await page.viewport(1440, 1024);

    const { container } = render(TitleCard, {
      title : 'Title Text',
      subtitle : 'Subtitle Text',
    });

    container.style.setProperty('--layout-spacing', '64px');

    const card = container.children[0] as HTMLElement;
    await expect.element(card).toBeInTheDocument();

    const cardStyle = getComputedStyle(card);

    expect(cardStyle.paddingRight).toBe('64px');
  });

  it('renders with margin in narrow views', async () => {
    await page.viewport(1023, 1024);

    const { container } = render(TitleCard, {
      title : 'Title Text',
      subtitle : 'Subtitle Text',
    });

    container.style.setProperty('--layout-spacing', '64px');

    const card = container.children[0] as HTMLElement;
    await expect.element(card).toBeInTheDocument();

    const cardStyle = getComputedStyle(card);

    expect(cardStyle.marginTop).toBe('64px');
  });
});
