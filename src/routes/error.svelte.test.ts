import { beforeEach, afterAll, describe, it, expect, vi } from 'vitest';
import { render, within } from '@testing-library/svelte';

import { wrapOriginal } from '$lib/tests/component';
import Content from '$lib/materials/content.svelte';
import Nav from '$lib/components/nav.svelte';
import HttpError from '$lib/components/httpError.svelte';

import ErrorPage from './+error.svelte';

let isBrowser = vi.hoisted(() => true);
let status = vi.hoisted(() => 500);
let message = vi.hoisted(() => 'Test error');

vi.mock('$app/environment', () => ({ get browser() { return isBrowser; } }));
vi.mock('$app/state', async () => ({
  page : {
    get status() { return status; },
    get error() { return { message }; },
  },
}));

vi.mock('$lib/materials/content.svelte', async (original) => {
  return { default : await wrapOriginal(original, { testId : 'content' }) };
});
vi.mock('$lib/components/nav.svelte', async (original) => {
  return { default : await wrapOriginal(original, { testId : 'nav' }) };
});
vi.mock('$lib/components/httpError.svelte', async (original) => {
  return { default : await wrapOriginal(original, { testId : 'httpError' }) };
});

beforeEach(() => {
  vi.clearAllMocks();
  isBrowser = true;
  status = 500;
  message = 'Test error';
});

afterAll(() => { vi.restoreAllMocks(); });

describe('/+error.svelte', () => {
  it('set error theme section', () => {
    const { container } = render(ErrorPage);

    const content = within(container).queryByTestId('content') as HTMLElement;
    expect(content).toBeInTheDocument();
    const httpError =
      within(content).queryByTestId('httpError') as HTMLElement;
    expect(httpError).toBeInTheDocument();

    expect(Content).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ section : 'error' }),
    );
  });

  it('vertically centres content', () => {
    const { container } = render(ErrorPage);

    const content = within(container).queryByTestId('content') as HTMLElement;
    expect(content).toBeInTheDocument();
    const httpError =
      within(content).queryByTestId('httpError') as HTMLElement;
    expect(httpError).toBeInTheDocument();

    expect(Content).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        alignment : 'centre',
        justification : 'centre',
      }),
    );
  });

  it('hides content background server-side', () => {
    isBrowser = false;
    render(ErrorPage);

    expect(Content).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ showBackground : false }),
    );
  });

  it('displays home navigation', () => {
    const { container } = render(ErrorPage);

    const content = within(container).queryByTestId('content') as HTMLElement;
    expect(content).toBeInTheDocument();
    const nav = within(content).queryByTestId('nav') as HTMLElement;
    expect(nav).toBeInTheDocument();
    const error = within(content).queryByTestId('httpError') as HTMLElement;
    expect(error).toBeInTheDocument();
    expect(nav.compareDocumentPosition(error))
      .toBe(Node.DOCUMENT_POSITION_FOLLOWING);

    expect(Nav).toHaveBeenCalledOnce();
    expect(Nav).toHaveBeenCalledWithProps(expect.objectContaining({
      targets : ['home'],
    }));
  });

  it('displays error message in title card', () => {
    status = 418;
    message = `I'm a teapot`;
    render(ErrorPage);
    expect(HttpError).toHaveBeenCalledOnce();
    expect(HttpError).toHaveBeenCalledWithProps(expect.objectContaining({
      status,
      message,
    }));
  });
});
