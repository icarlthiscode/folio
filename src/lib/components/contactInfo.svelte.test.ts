import { beforeEach, afterAll, describe, it, expect, vi } from 'vitest';
import { render, within } from '@testing-library/svelte';

import { tryGet } from '$lib/utils/typing';
import { wrapOriginal } from '$lib/tests/component';
import Text from '$lib/materials/text.svelte';
import Link from '$lib/materials/link.svelte';
import ListItem from '$lib/materials/listItem.svelte';
import ContactInfo from './contactInfo.svelte';

let isBrowser = vi.hoisted(() => true);

const defaultConfig = vi.hoisted(() => ({
  contact : [
    { icon : 'icon1', link : 'link1', href : 'href1' },
    { icon : 'icon2', text : 'text2', link : 'link2', href : 'href2' },
  ],
}));
let setConfig : ((value : unknown) => void) = vi.hoisted(() => () => {});

const locale = vi.hoisted(() => ({
  contact : { infoHeader : 'Contact Info Header' },
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
vi.mock('$lib/materials/link.svelte', async (original) => {
  return { default : await wrapOriginal(original, { testId : 'link' }) };
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
  isBrowser = false;
  setConfig(defaultConfig);
});

afterAll(() => { vi.restoreAllMocks(); });

describe('ContactInfo', () => {
  it('does not render when no contact info configured', () => {
    setConfig({ contact : [] });

    const { container } = render(ContactInfo);

    const child = container.children[0];
    expect(child).toBeUndefined();

    expect(Text).not.toHaveBeenCalled();
    expect(Link).not.toHaveBeenCalled();
    expect(ListItem).not.toHaveBeenCalled();
  });

  it('renders contact info header', () => {
    const { container } = render(ContactInfo, { headingElement : 'h3' });

    const heading = within(container).queryByRole('heading', { level : 3 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent(locale.contact.infoHeader);
  });

  it('renders contact info items', () => {
    const { container } = render(ContactInfo);

    const list = within(container).queryByRole('list') as HTMLElement;
    expect(list).toBeInTheDocument();

    const items = within(list).queryAllByRole('listitem');
    expect(items).toHaveLength(defaultConfig.contact.length);
    for (const item of items) expect(item).toBeInTheDocument();

    for (const info of defaultConfig.contact) {
      const item = within(list)
        .queryByTestId(`item-${info.icon}`) as HTMLElement;
      expect(item).toBeInTheDocument();

      if (info.text) expect(item).toHaveTextContent(info.text);

      const link = within(item).queryByTestId('link')
        ?.querySelector('a') as HTMLElement;
      expect(link).toBeInTheDocument();

      expect(link).toHaveTextContent(info.link);
      expect(link).toHaveAttribute('href', info.href);

      expect(Link).toHaveBeenCalledWithProps(expect.objectContaining({
        href : info.href,
      }));
      expect(ListItem).toHaveBeenCalledWithProps(expect.objectContaining({
        icon : info.icon,
      }));
    }
  });

  it('hides icon server-side', () => {
    isBrowser = false;
    render(ContactInfo);

    expect(ListItem).toHaveBeenCalled();
    vi.mocked(ListItem).mock.calls.forEach((args) => {
      expect(args[1])
        .toEqual(expect.objectContaining({ showIcon : false }));
    });
  });
});
