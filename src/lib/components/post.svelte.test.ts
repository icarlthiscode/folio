import { beforeEach, afterAll, describe, it, expect, vi } from 'vitest';
import { render, within } from '@testing-library/svelte';

import { wrapOriginal } from '$lib/tests/component';
import {
  extractArticle,
  renderArticle,
  type Contribution,
} from '$lib/utils/weblog';
import Stack from '$lib/materials/stack.svelte';
import Heading from '$lib/materials/heading.svelte';
import Link from '$lib/materials/link.svelte';
import NavLinks from '$lib/materials/navLinks.svelte';
import Article from '$lib/materials/article.svelte';
import Dateline from './dateline.svelte';
import Byline from './byline.svelte';
import Post from './post.svelte';

const defaultConfig = vi.hoisted(() => ({
  weblog : {
    url : '',
    topCredits : [],
    bottomCredits : [],
  },
}));
let setConfig : ((value : unknown) => void) = vi.hoisted(() => () => {});

vi.mock('$lib/utils/weblog', () => ({
  extractArticle : vi.fn(() => ({})),
  renderArticle : vi.fn(() => ''),
}));

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

vi.mock('$lib/materials/stack.svelte', async (original) => {
  return { default : await wrapOriginal(original, { testId : 'stack' }) };
});
vi.mock('$lib/materials/heading.svelte', async (original) => {
  return { default : await wrapOriginal(original, { testId : 'heading' }) };
});
vi.mock('$lib/materials/link.svelte', async (original) => {
  return { default : await wrapOriginal(original, { testId : 'link' }) };
});
vi.mock('$lib/materials/navLinks.svelte', async (original) => {
  return { default : await wrapOriginal(original, { testId : 'nav' }) };
});
vi.mock('$lib/materials/article.svelte', async (original) => {
  return { default : await wrapOriginal(original, { testId : 'article' }) };
});
vi.mock('./dateline.svelte', async (original) => {
  return { default : await wrapOriginal(original, { testId : 'dateline' }) };
});
vi.mock('./byline.svelte', async (original) => {
  return { default : await wrapOriginal(original, { testId : 'byline' }) };
});

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(extractArticle)
    .mockReturnValue({ title : '', body : 'Test Article' });
  vi.mocked(renderArticle as ((_ : string) => string))
    .mockReturnValue('<p data-testid="article-content">Test Article</p>');
  setConfig(defaultConfig);
});

afterAll(() => { vi.restoreAllMocks(); });

describe('Post', () => {
  it('renders article title', async () => {
    const expectedTitle = 'Test Title';
    const expectedBody = 'Test Content';
    const expectedMarkdown = [`# ${expectedTitle}\n\n`, `${expectedBody}`];
    const expectedContent = expectedMarkdown.join('');
    const expectedRender = [
      `<h1 data-testid="article-title">${expectedTitle}</h1>\n`,
      `<p data-testid="article-content">${expectedBody}</p>`,
    ];
    vi.mocked(extractArticle)
      .mockReturnValue({ title : expectedTitle, body : expectedBody });
    vi.mocked(renderArticle).mockReturnValue(expectedRender);

    const { container } = render(Post, { content : expectedContent });

    const article = within(container).queryByTestId('article') as HTMLElement;
    expect(article).toBeInTheDocument();
    expect(article).toHaveTextContent(expectedTitle);
    const heading = within(article).queryByTestId('article-title');
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent(expectedTitle);

    expect(renderArticle).toHaveBeenCalledExactlyOnceWith(expectedMarkdown);
    expect(Heading).not.toHaveBeenCalled();
    expect(Link).not.toHaveBeenCalled();
    expect(Article).toHaveBeenCalledOnce();
  });

  it('renders heading', async () => {
    const expectedTitle = 'Test Title';
    const expectedArticleTitle = 'Alt Test Title';
    const expectedBody = 'Test Content';
    const expectedMarkdown = [
      `# ${expectedArticleTitle}\n\n`,
      `${expectedBody}`,
    ];
    const expectedContent = expectedMarkdown.join('');
    const expectedRender = [
      `<h1 data-testid="article-title">${expectedArticleTitle}</h1>\n`,
      `<p data-testid="article-content">${expectedBody}</p>`,
    ].join('\n');
    const expectedHeadingLevel = 2;
    vi.mocked(extractArticle)
      .mockReturnValue({ title : expectedTitle, body : expectedBody });
    vi.mocked(renderArticle as ((_ : string) => string))
      .mockReturnValue(expectedRender);

    const { container } = render(Post, {
      content : expectedContent,
      heading : { text : expectedTitle, level : expectedHeadingLevel },
    });

    const article = within(container).queryByTestId('article') as HTMLElement;
    expect(article).toBeInTheDocument();
    expect(article).toHaveTextContent(expectedTitle);
    expect(article).toHaveTextContent(expectedArticleTitle);
    const articleHeading = within(article).queryByTestId('article-title');
    expect(articleHeading).toBeInTheDocument();
    expect(articleHeading).toHaveTextContent(expectedArticleTitle);
    const heading = within(container).queryByTestId('heading');
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent(expectedTitle);

    expect(renderArticle).toHaveBeenCalledExactlyOnceWith(expectedContent);
    expect(Heading).toHaveBeenCalledOnce();
    expect(Heading).toHaveBeenCalledWithProps(expect.objectContaining({
      level : expectedHeadingLevel,
    }));
    expect(Link).not.toHaveBeenCalled();
    expect(Article).toHaveBeenCalledOnce();
  });

  it('renders heading with link', async () => {
    const expectedTitle = 'Test Title';
    const expectedArticleTitle = 'Alt Test Title';
    const expectedLink = '#test';
    const expectedBody = 'Test Content';
    const expectedMarkdown = [
      `# ${expectedArticleTitle}\n\n`,
      `${expectedBody}`,
    ];
    const expectedContent = expectedMarkdown.join('');
    const expectedRender = [
      `<h1 data-testid="article-title">${expectedArticleTitle}</h1>\n`,
      `<p data-testid="article-content">${expectedBody}</p>`,
    ].join('\n');
    const expectedHeadingLevel = 2;
    vi.mocked(extractArticle)
      .mockReturnValue({ title : expectedTitle, body : expectedBody });
    vi.mocked(renderArticle as ((_ : string) => string))
      .mockReturnValue(expectedRender);

    const { container } = render(Post, {
      content : expectedContent,
      heading : {
        text : expectedTitle,
        href : expectedLink,
        level : expectedHeadingLevel,
      },
    });

    const article = within(container).queryByTestId('article') as HTMLElement;
    expect(article).toBeInTheDocument();
    expect(article).toHaveTextContent(expectedTitle);
    expect(article).toHaveTextContent(expectedArticleTitle);
    const articleHeading = within(article).queryByTestId('article-title');
    expect(articleHeading).toBeInTheDocument();
    expect(articleHeading).toHaveTextContent(expectedArticleTitle);
    const heading = within(article).queryByTestId('heading') as HTMLElement;
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent(expectedTitle);
    const link = within(heading).queryByTestId('link');
    expect(link).toBeInTheDocument();
    expect(link).toHaveTextContent(expectedTitle);

    expect(renderArticle).toHaveBeenCalledExactlyOnceWith(expectedContent);
    expect(Heading).toHaveBeenCalledOnce();
    expect(Heading).toHaveBeenCalledWithProps(expect.objectContaining({
      level : expectedHeadingLevel,
    }));
    expect(Link).toHaveBeenCalledOnce();
    expect(Link).toHaveBeenCalledWithProps(expect.objectContaining({
      href : expectedLink,
    }));
    expect(Article).toHaveBeenCalledOnce();
  });

  it('renders content article', async () => {
    const expectedContent = 'Test Article';
    const expectedRender =
      `<p data-testid="article-content">${expectedContent}</p>`;
    vi.mocked(extractArticle)
      .mockReturnValue({ title : '', body : expectedContent });
    vi.mocked(renderArticle as ((_ : string) => string))
      .mockReturnValue(expectedRender);

    const { container } = render(Post, { content : expectedContent });

    const article = within(container).queryByTestId('article') as HTMLElement;
    expect(article).toBeInTheDocument();
    expect(article).toHaveTextContent(expectedContent);
    const heading = within(article).queryByRole('heading');
    expect(heading).not.toBeInTheDocument();
    const stack = within(article).queryByTestId('stack');
    expect(stack).toBeInTheDocument();
    const content = within(stack!).queryByTestId('article-content');
    expect(content).toBeInTheDocument();
    expect(content).toHaveTextContent(expectedContent);

    expect(extractArticle).toHaveBeenCalledExactlyOnceWith(expectedContent);
    expect(renderArticle).toHaveBeenCalledExactlyOnceWith(expectedContent);
    expect(Stack).toHaveBeenCalledOnce();
    expect(Article).toHaveBeenCalledOnce();
  });

  it('renders compact content article', async () => {
    const expectedContent = 'Test Article';
    const expectedRender =
      `<p data-testid="article-content">${expectedContent}</p>`;
    vi.mocked(extractArticle)
      .mockReturnValue({ title : '', body : expectedContent });
    vi.mocked(renderArticle as ((_ : string) => string))
      .mockReturnValue(expectedRender);

    const { container } = render(Post, {
      content : expectedContent,
      compact : true,
    });

    const article = within(container).queryByTestId('article') as HTMLElement;
    expect(article).toBeInTheDocument();
    expect(article).toHaveTextContent(expectedContent);
    const heading = within(article).queryByRole('heading');
    expect(heading).not.toBeInTheDocument();
    const stack = within(article).queryByTestId('stack');
    expect(stack).not.toBeInTheDocument();
    const content = within(article).queryByTestId('article-content');
    expect(content).toBeInTheDocument();
    expect(content).toHaveTextContent(expectedContent);

    expect(extractArticle).toHaveBeenCalledExactlyOnceWith(expectedContent);
    expect(renderArticle).toHaveBeenCalledExactlyOnceWith(expectedContent);
    expect(Stack).not.toHaveBeenCalled();
    expect(Article).toHaveBeenCalledOnce();
  });

  it('renders content title before article', async () => {
    const title = 'Test Title';
    const body = 'Test Content';
    const markdown = `# ${title}\n\n${body}`;
    const rendered = [
      `<h1 data-testid="article-title">${title}</h1>\n`,
      `<p data-testid="article-content">${body}</p>`,
    ];
    vi.mocked(extractArticle)
      .mockReturnValue({ title : title, body : body });
    vi.mocked(renderArticle).mockReturnValue(rendered);

    const { container } = render(Post, { content : markdown });

    const article = within(container).queryByTestId('article') as HTMLElement;
    expect(article).toBeInTheDocument();
    const heading = within(article).queryByRole('heading');
    expect(heading).toBeInTheDocument();
    const content = within(article).queryByTestId('article-content');
    expect(content).toBeInTheDocument();
    expect(heading?.compareDocumentPosition(content!))
      .toBe(Node.DOCUMENT_POSITION_FOLLOWING);

    expect(Article).toHaveBeenCalledTimes(1);
  });

  it('renders published dateline', async () => {
    const title = 'Test Title';
    const body = 'Test Content';
    const markdown = `# ${title}\n\n${body}`;
    const rendered = [
      `<h1 data-testid="article-title">${title}</h1>\n`,
      `<p data-testid="article-content">${body}</p>`,
    ];
    vi.mocked(extractArticle)
      .mockReturnValue({ title : title, body : body });
    vi.mocked(renderArticle).mockReturnValue(rendered);
    const expectedDate = new Date();

    const { container } = render(Post, {
      content : markdown,
      datePublished : expectedDate,
    });

    const article = within(container).queryByTestId('article') as HTMLElement;
    expect(article).toBeInTheDocument();
    const heading = within(article).queryByRole('heading');
    expect(heading).toBeInTheDocument();
    const dateline = within(article).queryByTestId('dateline');
    expect(dateline).toBeInTheDocument();
    const content = within(article).queryByTestId('article-content');
    expect(content).toBeInTheDocument();
    expect(heading?.compareDocumentPosition(dateline!))
      .toBe(Node.DOCUMENT_POSITION_FOLLOWING);
    expect(dateline?.compareDocumentPosition(content!))
      .toBe(Node.DOCUMENT_POSITION_FOLLOWING);

    expect(Dateline).toHaveBeenCalledOnce();
    expect(Dateline).toHaveBeenCalledWithProps(expect.objectContaining({
      date : expectedDate,
    }));
  });

  it('renders top links', async () => {
    const config = {
      ...defaultConfig,
      weblog : {
        ...defaultConfig.weblog,
        topCredits : ['testA'],
      },
    };
    const title = 'Test Title';
    const body = 'Test Content';
    const markdown = `# ${title}\n\n${body}`;
    const rendered = [
      `<h1 data-testid="article-title">${title}</h1>\n`,
      `<p data-testid="article-content">${body}</p>`,
    ];
    const expectedLinks = [{ text : 'Tag 1', href : 'tag-1' }];
    vi.mocked(extractArticle)
      .mockReturnValue({ title : title, body : body });
    vi.mocked(renderArticle).mockReturnValue(rendered);
    setConfig(config);

    const { container } = render(Post, {
      content : markdown,
      datePublished : new Date(),
      topLinks : expectedLinks,
      contributions : [{ slug : 'testA' } as Contribution],
    });

    const article = within(container).queryByTestId('article') as HTMLElement;
    expect(article).toBeInTheDocument();
    const dateline = within(article).queryByTestId('dateline');
    expect(dateline).toBeInTheDocument();
    const topLinks = within(article).queryByTestId('nav');
    expect(topLinks).toBeInTheDocument();
    const byline = within(article).queryByTestId('byline');
    expect(byline).toBeInTheDocument();
    expect(dateline?.compareDocumentPosition(topLinks!))
      .toBe(Node.DOCUMENT_POSITION_FOLLOWING);
    expect(topLinks?.compareDocumentPosition(byline!))
      .toBe(Node.DOCUMENT_POSITION_FOLLOWING);

    expect(NavLinks).toHaveBeenCalledOnce();
    expect(NavLinks).toHaveBeenCalledWithProps(expect.objectContaining({
      links : expectedLinks,
    }));
  });

  it('renders top credits', async () => {
    const config = {
      ...defaultConfig,
      weblog : {
        ...defaultConfig.weblog,
        topCredits : ['testA', 'testB'],
      },
    };
    const title = 'Test Title';
    const body = 'Test Content';
    const markdown = `# ${title}\n\n${body}`;
    const rendered = [
      `<h1 data-testid="article-title">${title}</h1>\n`,
      `<p data-testid="article-content">${body}</p>`,
    ];
    const expectedContribution = { slug : 'testA' } as Contribution;
    vi.mocked(extractArticle)
      .mockReturnValue({ title : title, body : body });
    vi.mocked(renderArticle).mockReturnValue(rendered);
    setConfig(config);

    const { container } = render(Post, {
      content : markdown,
      topLinks : [{ text : 'Test Link', href : '#test' }],
      contributions : [
        expectedContribution,
        { slug : 'testC' } as Contribution,
      ],
    });

    const article = within(container).queryByTestId('article') as HTMLElement;
    expect(article).toBeInTheDocument();
    const topLinks = within(article).queryByTestId('nav');
    expect(topLinks).toBeInTheDocument();
    const byline = within(article).queryByTestId('byline');
    expect(byline).toBeInTheDocument();
    const content = within(article).queryByTestId('article-content');
    expect(content).toBeInTheDocument();
    expect(topLinks?.compareDocumentPosition(byline!))
      .toBe(Node.DOCUMENT_POSITION_FOLLOWING);
    expect(byline?.compareDocumentPosition(content!))
      .toBe(Node.DOCUMENT_POSITION_FOLLOWING);

    expect(Byline).toHaveBeenCalledOnce();
    expect(Byline).toHaveBeenCalledWithProps(expect.objectContaining({
      contributions : [expectedContribution],
    }));
  });

  it('renders bottom links', async () => {
    const config = {
      ...defaultConfig,
      weblog : {
        ...defaultConfig.weblog,
        bottomCredits : ['testA'],
      },
    };
    const title = 'Test Title';
    const body = 'Test Content';
    const markdown = `# ${title}\n\n${body}`;
    const rendered = [
      `<h1 data-testid="article-title">${title}</h1>\n`,
      `<p data-testid="article-content">${body}</p>`,
    ];
    const expectedLinks = [{ text : 'Tag 1', href : 'tag-1' }];
    vi.mocked(extractArticle)
      .mockReturnValue({ title : title, body : body });
    vi.mocked(renderArticle).mockReturnValue(rendered);
    setConfig(config);

    const { container } = render(Post, {
      content : markdown,
      bottomLinks : expectedLinks,
      contributions : [{ slug : 'testA' } as Contribution],
    });

    const article = within(container).queryByTestId('article') as HTMLElement;
    expect(article).toBeInTheDocument();
    const content = within(article).queryByTestId('article-content');
    expect(content).toBeInTheDocument();
    const bottomLinks = within(article).queryByTestId('nav');
    expect(bottomLinks).toBeInTheDocument();
    const byline = within(article).queryByTestId('byline');
    expect(byline).toBeInTheDocument();
    expect(content?.compareDocumentPosition(bottomLinks!))
      .toBe(Node.DOCUMENT_POSITION_FOLLOWING);
    expect(bottomLinks?.compareDocumentPosition(byline!))
      .toBe(Node.DOCUMENT_POSITION_FOLLOWING);

    expect(NavLinks).toHaveBeenCalledOnce();
    expect(NavLinks).toHaveBeenCalledWithProps(expect.objectContaining({
      links : expectedLinks,
    }));
  });

  it('renders bottom credits', async () => {
    const config = {
      ...defaultConfig,
      weblog : {
        ...defaultConfig.weblog,
        bottomCredits : ['testA', 'testB'],
      },
    };
    const title = 'Test Title';
    const body = 'Test Content';
    const markdown = `# ${title}\n\n${body}`;
    const rendered = [
      `<h1 data-testid="article-title">${title}</h1>\n`,
      `<p data-testid="article-content">${body}</p>`,
    ];
    const links = [{ text : 'Tag 1', href : 'tag-1' }];
    const expectedContribution = { slug : 'testA' } as Contribution;
    vi.mocked(extractArticle)
      .mockReturnValue({ title : title, body : body });
    vi.mocked(renderArticle).mockReturnValue(rendered);
    setConfig(config);

    const { container } = render(Post, {
      content : markdown,
      datePublished : new Date(),
      bottomLinks : links,
      contributions : [
        expectedContribution,
        { slug : 'testC' } as Contribution,
      ],
    });

    const article = within(container).queryByTestId('article') as HTMLElement;
    expect(article).toBeInTheDocument();
    const bottomLinks = within(article).queryByTestId('nav');
    expect(bottomLinks).toBeInTheDocument();
    const byline = within(article).queryByTestId('byline');
    expect(byline).toBeInTheDocument();
    expect(bottomLinks?.compareDocumentPosition(byline!))
      .toBe(Node.DOCUMENT_POSITION_FOLLOWING);

    expect(Byline).toHaveBeenCalledOnce();
    expect(Byline).toHaveBeenCalledWithProps(expect.objectContaining({
      contributions : [expectedContribution],
    }));
  });
});
