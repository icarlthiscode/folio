import { beforeEach, afterAll, describe, it, expect, vi } from 'vitest';
import { render, within } from '@testing-library/svelte';

import { wrapOriginal } from '$lib/tests/component';
import { tryGet } from '$lib/utils/typing';
import Text from '$lib/materials/text.svelte';
import Link from '$lib/materials/link.svelte';
import Byline from './byline.svelte';

vi.mock('$lib/materials/text.svelte', async (original) => {
  return { default : await wrapOriginal(original, {
    testId : p =>
      `text-${tryGet(p, 'typography', s => typeof s === 'string') ?? 'none'}`,
  }) };
});
vi.mock('$lib/materials/link.svelte', async (original) => {
  return { default : await wrapOriginal(original, {
    testId : p =>
      `link-${tryGet(p, 'href', s => typeof s === 'string') ?? 'none'}`,
  }) };
});

beforeEach(() => { vi.clearAllMocks(); });
afterAll(() => { vi.restoreAllMocks(); });

describe('Contact', () => {
  it('renders byline', () => {
    const expectedContribution = {
      slug : 'test',
      byline : 'Tested by ',
      members : [{ name : 'Tester' }],
    };
    const expectedContent = expectedContribution.byline
      + expectedContribution.members[0]?.name;

    const { container } = render(Byline, {
      contributions : [expectedContribution],
    });

    const text = within(container).queryByTestId('text-detail');
    expect(text).toBeInTheDocument();
    expect(text).toHaveTextContent(expectedContent);
    expect(text).not.toHaveTextContent(';');

    expect(Text).toHaveBeenCalledOnce();
    expect(Text).toHaveBeenCalledWithProps(expect.objectContaining({
      typography : 'detail',
      as : 'p',
    }));
  });

  it('renders byline with link', () => {
    const expectedContribution = {
      slug : 'test',
      byline : 'Tested by ',
      members : [{ name : 'Tester', href : '#test' }],
    };
    const expectedContent = expectedContribution.byline
      + expectedContribution.members[0]?.name;
    const expectedLinkContent = expectedContribution.members[0]?.name ?? '';
    const expectedLink = expectedContribution.members[0]?.href;

    const { container } = render(Byline, {
      contributions : [expectedContribution],
    });

    const text = within(container).queryByTestId('text-detail');
    expect(text).toBeInTheDocument();
    expect(text).toHaveTextContent(expectedContent);
    expect(text).not.toHaveTextContent(';');
    const link = within(text!).queryByTestId(`link-${expectedLink}`);
    expect(link).toBeInTheDocument();
    expect(link).toHaveTextContent(expectedLinkContent);

    expect(Link).toHaveBeenCalledOnce();
    expect(Link).toHaveBeenCalledWithProps(
      expect.objectContaining({ href : expectedLink }),
    );
  });

  it('renders bylines', () => {
    const expectedContributions = [
      {
        slug : 'test-1',
        byline : 'Tested First by ',
        members : [
          { name : 'Tester A' },
          { name : 'Tester B' },
        ],
      },
      {
        slug : 'test-2',
        byline : 'Tested First by ',
        members : [
          { name : 'Tester C' },
          { name : 'Tester D' },
          { name : 'Tester E' },
        ],
      },
    ];
    const expectedContent = (expectedContributions[0]?.byline ?? '')
      + (expectedContributions[0]?.members?.[0]?.name ?? '')
      + ' & '
      + (expectedContributions[0]?.members?.[1]?.name ?? '')
      + '; '
      + (expectedContributions[1]?.byline ?? '')
      + (expectedContributions[1]?.members?.[0]?.name ?? '')
      + ', '
      + (expectedContributions[1]?.members?.[1]?.name ?? '')
      + ' & '
      + (expectedContributions[1]?.members?.[2]?.name ?? '');

    const { container } = render(Byline, {
      contributions : expectedContributions,
    });

    const text = within(container).queryByTestId('text-detail');
    expect(text).toBeInTheDocument();
    expect(text).toHaveTextContent(expectedContent);

    expect(Text).toHaveBeenCalledOnce();
    expect(Text).toHaveBeenCalledWithProps(expect.objectContaining({
      typography : 'detail',
      as : 'p',
    }));
  });

  it('renders bylines with links', () => {
    const expectedContributions = [
      {
        slug : 'test-1',
        byline : 'Tested First by ',
        members : [
          { name : 'Tester A' },
          { name : 'Tester B', href : '#testB' },
        ],
      },
      {
        slug : 'test-2',
        byline : 'Tested First by ',
        members : [
          { name : 'Tester C' },
          { name : 'Tester D', href : '#testD' },
          { name : 'Tester E', href : '#testE' },
        ],
      },
    ];
    const expectedContent = (expectedContributions[0]?.byline ?? '')
      + (expectedContributions[0]?.members?.[0]?.name ?? '')
      + ' & '
      + (expectedContributions[0]?.members?.[1]?.name ?? '')
      + '; '
      + (expectedContributions[1]?.byline ?? '')
      + (expectedContributions[1]?.members?.[0]?.name ?? '')
      + ', '
      + (expectedContributions[1]?.members?.[1]?.name ?? '')
      + ' & '
      + (expectedContributions[1]?.members?.[2]?.name ?? '');

    const { container } = render(Byline, {
      contributions : expectedContributions,
    });

    const text = within(container).queryByTestId('text-detail');
    expect(text).toBeInTheDocument();
    expect(text).toHaveTextContent(expectedContent);

    for (const contributions of expectedContributions) {
      for (const member of (contributions.members)) {
        if (!member.href) continue;
        const expectedLinkContent = member.name;
        const expectedLink = member.href;
        const link = within(text!).queryByTestId(`link-${expectedLink}`);
        expect(link).toBeInTheDocument();
        expect(link).toHaveTextContent(expectedLinkContent);
        expect(Link).toHaveBeenCalledWithProps(
          expect.objectContaining({ href : expectedLink }),
        );
      }
    }
    expect(Link).toHaveBeenCalledTimes(
      expectedContributions
        .flatMap(c => c.members)
        .filter(m => !!m.href)
        .length,
    );
  });

  it('does not render empty dateline', () => {
    const { container } = render(Byline);
    expect(container.children.length).toBe(0);
  });
});
