import { beforeEach, afterAll, describe, it, expect, vi } from 'vitest';
import { render, within } from '@testing-library/svelte';

import { wrapOriginal } from '$lib/tests/component';
import Optional from '$lib/materials/optional.svelte';
import SplitStack from '$lib/materials/splitStack.svelte';
import NavLinks from '$lib/materials/navLinks.svelte';
import Graphic from '$lib/materials/graphic.svelte';

import Footer from './footer.svelte';

const locale = vi.hoisted(() => ({
  alt : { logo : 'Test Logo' },
  nav : {
    home : 'Test Home',
    contact : 'Test Contact',
  } as Record<string, string>,
}));

let isBrowser = vi.hoisted(() => true);

vi.mock('$app/environment', () => ({ get browser() { return isBrowser; } }));

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

vi.mock('$lib/materials/optional.svelte', async (original) => {
  return { default : await wrapOriginal(original, { testId : 'optional' }) };
});
vi.mock('$lib/materials/splitStack.svelte', async (original) => {
  return { default : await wrapOriginal(original, { testId : 'splitStack' }) };
});
vi.mock('$lib/materials/navLinks.svelte', async (original) => {
  return { default : await wrapOriginal(original, { testId : 'navLinks' }) };
});
vi.mock('$lib/materials/graphic.svelte', async (original) => {
  return { default : await wrapOriginal(original, { testId : 'graphic' }) };
});

beforeEach(() => {
  vi.clearAllMocks();
  isBrowser = true;
});
afterAll(() => { vi.restoreAllMocks(); });

describe('Footer', () => {
  it('renders navigation links', () => {
    const { container } = render(Footer);

    const navLinks = within(container).queryByTestId('navLinks') as HTMLElement;
    expect(navLinks).toBeInTheDocument();
    expect(NavLinks).toHaveBeenCalledOnce();
    expect(NavLinks).toHaveBeenCalledWithProps(expect.objectContaining({
      direction : 'column',
      links : [
        { text : locale.nav.home, href : '/' },
        { text : locale.nav.contact, href : '/#contact' },
      ],
    }));
  });

  it('renders logo graphic', () => {
    const { container } = render(Footer);

    const graphic = within(container).queryByTestId('graphic') as HTMLElement;
    expect(graphic).toBeInTheDocument();
    expect(Graphic).toHaveBeenCalledOnce();
    expect(Graphic).toHaveBeenCalledWithProps(expect.objectContaining({
      graphic : 'logo',
      alt : locale.alt.logo,
    }));
  });

  it('does not render logo graphic on mobile', () => {
    const { container } = render(Footer);

    const optional = within(container).queryByTestId('optional') as HTMLElement;
    expect(optional).toBeInTheDocument();

    const graphic = within(optional).queryByTestId('graphic') as HTMLElement;
    expect(graphic).toBeInTheDocument();

    expect(Optional).toHaveBeenCalledOnce();
    expect(Optional).toHaveBeenCalledWithProps(expect.objectContaining({
      display : ['tablet', 'desktop', 'wide'],
    }));
  });

  it('splits logo and links horizontally', () => {
    const { container } = render(Footer);

    const splitStack = within(container)
      .queryByTestId('splitStack') as HTMLElement;
    expect(splitStack).toBeInTheDocument();

    const optional = within(splitStack)
      .queryByTestId('optional') as HTMLElement;
    expect(optional).toBeInTheDocument();
    const navLinks = within(splitStack)
      .queryByTestId('navLinks') as HTMLElement;
    expect(navLinks).toBeInTheDocument();

    expect(optional.compareDocumentPosition(navLinks))
      .toBe(Node.DOCUMENT_POSITION_FOLLOWING);

    expect(SplitStack).toHaveBeenCalledOnce();
    expect(SplitStack).toHaveBeenCalledWithProps(expect.objectContaining({
      alignment : 'start',
    }));
  });

  it('hides logo graphic server-side', () => {
    isBrowser = false;
    render(Footer);

    expect(Graphic).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ show : false }),
    );
  });
});
