import { beforeEach, afterAll, describe, it, expect, vi } from 'vitest';
import { within } from '@testing-library/dom';

import { resolveWeblogIndex, extractArticle, renderArticle } from './weblog';

beforeEach(() => { vi.clearAllMocks(); });
afterAll(() => { vi.restoreAllMocks(); });

describe('resolveWeblogIndex', () => {
  it('resolves undefined data', () => {
    const index = resolveWeblogIndex(undefined);
    expect(index).toEqual({ articles : {}, tags : {} });
  });

  it('resolves null data', () => {
    const index = resolveWeblogIndex(null);
    expect(index).toEqual({ articles : {}, tags : {} });
  });

  it('resolves empty object', () => {
    const index = resolveWeblogIndex({});
    expect(index).toEqual({ articles : {}, tags : {} });
  });

  it('resolves invalid article title', () => {
    const index = resolveWeblogIndex({
      articles : { 'article-1' : { title : 1 } },
      tags : {},
    });
    expect(index.articles).toEqual(expect.objectContaining({
      ['article-1'] : expect.objectContaining({ title : '1' }),
    }));
  });

  it('resolves invalid article abstract', () => {
    const index = resolveWeblogIndex({
      articles : { 'article-1' : { abstract : 1 } },
      tags : {},
    });
    expect(index.articles).toEqual(expect.objectContaining({
      ['article-1'] : expect.objectContaining({ abstract : '1' }),
    }));
  });

  it('resolves article contributions', () => {
    const testA = { name : 'Test Contributor A', href : '#test-contributor-a' };
    const testB = { name : 'Test Contributor B', href : '#test-contributor-b' };
    const index = {
      contributors : { testA, testB },
      contributions : {
        tester : { byline : 'Tested by' },
        auditor : { byline : 'Audited by' },
      },
      articles : {
        'article-1' : {
          title : 'Article 1',
          abstract : 'Article 1',
          contributions : {
            tester : ['testA'],
            auditor : ['testA', 'testB'],
          },
        },
        'article-2' : {
          title : 'Article 2',
          abstract : 'Article 2',
          contributions : {
            tester : ['testB'],
          },
        },
      },
    };
    const expected = {
      'article-1' : expect.objectContaining({
        title : 'Article 1',
        abstract : 'Article 1',
        contributions : [
          {
            slug : 'tester',
            byline : 'Tested by',
            members : [testA],
          },
          {
            slug : 'auditor',
            byline : 'Audited by',
            members : [testA, testB],
          },
        ],
      }),
      'article-2' : expect.objectContaining({
        title : 'Article 2',
        abstract : 'Article 2',
        contributions : [
          {
            slug : 'tester',
            byline : 'Tested by',
            members : [testB],
          },
        ],
      }),
    };
    expect(resolveWeblogIndex(index)).toEqual(expect.objectContaining({
      articles : expected,
      tags : {},
    }));
  });

  it('drops unresolvable article contributions', () => {
    const testA = { name : 'Test Contributor A', href : '#test-contributor-a' };
    const testB = { name : 'Test Contributor B', href : '#test-contributor-b' };
    const index = {
      contributors : { testA, testB },
      contributions : {
        tester : { byline : 'Tested by' },
        auditor : {},
      },
      articles : {
        'article-1' : {
          title : 'Article 1',
          abstract : 'Article 1',
          contributions : {
            tester : ['testA'],
            auditor : ['testA', 'testB'],
          },
        },
      },
    };
    const expected = {
      'article-1' : expect.objectContaining({
        title : 'Article 1',
        abstract : 'Article 1',
        contributions : [
          {
            slug : 'tester',
            byline : 'Tested by',
            members : [testA],
          },
        ],
      }),
    };
    expect(resolveWeblogIndex(index)).toEqual(expect.objectContaining({
      articles : expected,
    }));
  });

  it('drops unresolvable article contributors', () => {
    const testA = { name : 'Test Contributor A', href : '#test-contributor-a' };
    const testB = { href : '#test-contributor-b' };
    const index = {
      contributors : { testA, testB },
      contributions : { tester : { byline : 'Tested by' } },
      articles : {
        'article-1' : {
          title : 'Article 1',
          abstract : 'Article 1',
          contributions : {
            tester : ['testA', 'testB'],
          },
        },
      },
    };
    const expected = {
      'article-1' : expect.objectContaining({
        slug : 'article-1',
        title : 'Article 1',
        abstract : 'Article 1',
        datePublished : null,
        contributions : [
          {
            slug : 'tester',
            byline : 'Tested by',
            members : [testA],
          },
        ],
      }),
    };
    expect(resolveWeblogIndex(index)).toEqual({
      articles : expected,
      tags : {},
    });
  });

  it('resolves article tags', () => {
    const data = {
      articles : {
        'article-1' : {
          title : 'Article 1',
          abstract : 'This is a test article',
        },
        'article-2' : {
          title : 'Article 2',
          abstract : 'This is another test article',
        },
      },
      tags : {
        'tag-1' : {
          name : 'Tag 1',
          description : 'Tag 1 Description',
          articles : ['article-1', 'article-2'],
        },
        'tag-2' : {
          name : 'Tag 2',
          description : 'Tag 2 Description',
          articles : ['article-1'],
        },
      },
    };
    const expected = {
      articles : {
        'article-1' : expect.objectContaining({
          slug : 'article-1',
          title : 'Article 1',
          abstract : 'This is a test article',
          tags : [
            { slug : 'tag-1', name : 'Tag 1' },
            { slug : 'tag-2', name : 'Tag 2' },
          ],
        }),
        'article-2' : expect.objectContaining({
          slug : 'article-2',
          title : 'Article 2',
          abstract : 'This is another test article',
          tags : [
            { slug : 'tag-1', name : 'Tag 1' },
          ],
        }),
      },
    };
    const actual = resolveWeblogIndex(data);
    expect(actual).toEqual(expect.objectContaining(expected));
  });

  it('resolves invalid tag name', () => {
    const index = resolveWeblogIndex({
      articles : {},
      tags : { 'tag-1' : { name : 1 } },
    });
    expect(index.tags).toEqual(expect.objectContaining({
      ['tag-1'] : expect.objectContaining({ name : '1' }),
    }));
  });

  it('resolves invalid tag description', () => {
    const index = resolveWeblogIndex({
      articles : {},
      tags : { 'tag-1' : { description : 1 } },
    });
    expect(index.tags).toEqual(expect.objectContaining({
      ['tag-1'] : expect.objectContaining({ description : '1' }),
    }));
  });

  it('resolves tag articles', () => {
    const data = {
      articles : {
        'article-1' : {
          title : 'Article 1',
          abstract : 'This is a test article',
        },
        'article-2' : {
          title : 'Article 2',
          abstract : 'This is another test article',
        },
      },
      tags : {
        'tag-1' : {
          name : 'Tag 1',
          description : 'Tag 1 Description',
          articles : ['article-1', 'article-2'],
        },
        'tag-2' : {
          name : 'Tag 2',
          description : 'Tag 2 Description',
          articles : ['article-1'],
        },
      },
    };
    const expected = {
      articles : {
        'article-1' : expect.objectContaining({
          slug : 'article-1',
          title : 'Article 1',
          abstract : 'This is a test article',
        }),
        'article-2' : expect.objectContaining({
          slug : 'article-2',
          title : 'Article 2',
          abstract : 'This is another test article',
        }),
      },
      tags : {
        'tag-1' : {
          slug : 'tag-1',
          name : 'Tag 1',
          description : 'Tag 1 Description',
          articles : [
            expect.objectContaining({
              slug : 'article-1',
              title : 'Article 1',
              abstract : 'This is a test article',
            }),
            expect.objectContaining({
              slug : 'article-2',
              title : 'Article 2',
              abstract : 'This is another test article',
            }),
          ],
        },
        'tag-2' : {
          slug : 'tag-2',
          name : 'Tag 2',
          description : 'Tag 2 Description',
          articles : [
            expect.objectContaining({
              slug : 'article-1',
              title : 'Article 1',
              abstract : 'This is a test article',
            }),
          ],
        },
      },
    };
    const actual = resolveWeblogIndex(data);
    expect(actual).toEqual(expected);
  });

  it('ignores invalid tag articles', () => {
    const data = {
      articles : {
        'article-1' : {
          title : 'Article 1',
          abstract : 'This is a test article',
        },
      },
      tags : {
        'tag-1' : {
          name : 'Tag 1',
          description : 'Tag 1 Description',
          articles : ['article-1', 'article-2'],
        },
      },
    };
    const expected = {
      articles : {
        'article-1' : expect.objectContaining({
          slug : 'article-1',
          title : 'Article 1',
          abstract : 'This is a test article',
        }),
      },
      tags : {
        'tag-1' : {
          slug : 'tag-1',
          name : 'Tag 1',
          description : 'Tag 1 Description',
          articles : [
            expect.objectContaining({
              slug : 'article-1',
              title : 'Article 1',
              abstract : 'This is a test article',
            }),
          ],
        },
      },
    };
    const actual = resolveWeblogIndex(data);
    expect(actual).toEqual(expected);
  });
});

describe('extractArticle', () => {
  it('separates content title and body', () => {
    const text = `# Hello, world!\n\nThis is a test article.`;
    const { title, body } = extractArticle(text);
    expect(title).toBe('Hello, world!');
    expect(body).toBe('This is a test article.');
  });

  it('return empty title if no top-level heading', () => {
    const text = `## Hello, world!\n\nThis is a test article.`;
    const { title, body } = extractArticle(text);
    expect(title).toBe('');
    expect(body).toBe('## Hello, world!\n\nThis is a test article.');
  });
});

describe('renderArticle', () => {
  it('renders plain text', () => {
    const text = 'Hello, world!';
    document.body.innerHTML = renderArticle(text);
    const { getByText } = within(document.body);
    const paragraph = getByText('Hello, world!');
    expect(paragraph.tagName).toBe('P');
  });

  it('renders bold text', () => {
    const text = 'This is **bold** text.';
    document.body.innerHTML = renderArticle(text);
    const { getByText } = within(document.body);
    const bold = getByText('bold');
    expect(bold.tagName).toBe('STRONG');
  });

  it('renders italic text', () => {
    const text = 'This is *italic* text.';
    document.body.innerHTML = renderArticle(text);
    const { getByText } = within(document.body);
    const italic = getByText('italic');
    expect(italic.tagName).toBe('EM');
  });

  it.each([1, 2, 3, 4, 5, 6])('renders heading level %i', (level) => {
    const text = `${'#'.repeat(level)} Heading ${level}\nHello, heading!`;
    document.body.innerHTML = renderArticle(text);
    const { getByText } = within(document.body);
    const heading = getByText(`Heading ${level}`);
    const paragraph = getByText('Hello, heading!');
    expect(heading.tagName).toBe(`H${level}`);
    expect(heading).toHaveClass('text');
    expect(heading).toHaveClass(`typography-heading-${level}`);
    expect(paragraph.tagName).toBe('P');
  });

  it('renders headers with slug IDs', () => {
    const text = '# My Header Title';
    document.body.innerHTML = renderArticle(text);
    const { getByText } = within(document.body);
    const header = getByText('My Header Title');
    expect(header.tagName).toBe('H1');
    expect(header).toHaveAttribute('id', 'my-header-title');
  });

  it('renders implicit links', () => {
    const text = 'This is a [link].\n\n[link]: https://example.com';
    document.body.innerHTML = renderArticle(text);
    const { getByText } = within(document.body);
    const link = getByText('link');
    expect(link.tagName).toBe('A');
    expect(link).toHaveClass('text');
    expect(link).toHaveClass('typography-link');
    expect(link).toHaveAttribute('href', 'https://example.com');
  });

  it('renders lists', () => {
    const text = '- Item 1\n- Item 2\n- Item 3';
    document.body.innerHTML = renderArticle(text);
    const { getByText } = within(document.body);
    const list = document.body.querySelector('ul');
    expect(list?.children).toHaveLength(3);
    expect(getByText('Item 1').tagName).toBe('LI');
    expect(getByText('Item 2').tagName).toBe('LI');
    expect(getByText('Item 3').tagName).toBe('LI');
  });

  it('renders blockquote', () => {
    const text = '> This is a blockquote.';
    document.body.innerHTML = renderArticle(text);
    const { getByText } = within(document.body);
    const content = getByText('This is a blockquote.');
    const wrapper = content.parentElement;
    expect(content.tagName).toBe('P');
    expect(content).toHaveClass('text');
    expect(content).toHaveClass('typography-note');
    expect(wrapper?.tagName).toBe('BLOCKQUOTE');
    expect(wrapper).toHaveClass('text');
    expect(wrapper).toHaveClass('typography-note');
  });

  it.each(['INFO', 'WARNING', 'ERROR', 'TIP']) ('renders %s alert', (alert) => {
    const text = `> [!${alert}]\nThis is an alert.`;
    document.body.innerHTML = renderArticle(text);
    const { getByText } = within(document.body);
    const content = getByText('This is an alert.');
    const wrapper = content.parentElement;
    const label = getByText(alert);
    expect(content.tagName).toBe('P');
    expect(content).toHaveClass('text');
    expect(content).toHaveClass('typography-note');
    expect(wrapper?.tagName).toBe('BLOCKQUOTE');
    expect(wrapper).toHaveClass('text');
    expect(wrapper).toHaveClass('typography-note');
    expect(wrapper).toHaveClass(`typography-alert-${alert.toLowerCase()}`);
    expect(label.tagName).toBe('P');
    expect(label).toHaveClass('text');
    expect(label).toHaveClass('typography-alert');
  });

  it('renders multiple alerts', () => {
    const text = 'This is normal text.\n\n'
      + '> [!TIP]\nThis is a tip alert.\n\n'
      + 'More normal text.\n\n'
      + '> [!WARNING]\nThis is a warning alert.';
    document.body.innerHTML = renderArticle(text);
    const { getByText } = within(document.body);

    for (const alert of ['TIP', 'WARNING']) {
      const content = getByText(`This is a ${alert.toLowerCase()} alert.`);
      const wrapper = content.parentElement;
      const label = getByText(alert);
      expect(content.tagName).toBe('P');
      expect(content).toHaveClass('text');
      expect(content).toHaveClass('typography-note');
      expect(wrapper?.tagName).toBe('BLOCKQUOTE');
      expect(wrapper).toHaveClass('text');
      expect(wrapper).toHaveClass('typography-note');
      expect(wrapper).toHaveClass(`typography-alert-${alert.toLowerCase()}`);
      expect(label.tagName).toBe('P');
      expect(label).toHaveClass('text');
      expect(label).toHaveClass('typography-alert');
    }
  });

  it('renders inline code', () => {
    const text = 'This is `inline code`.';
    document.body.innerHTML = renderArticle(text);
    const { getByText } = within(document.body);
    const code = getByText('inline code');
    expect(code.tagName).toBe('CODE');
    expect(code).toHaveClass('text');
    expect(code).toHaveClass('code');
    expect(code).toHaveClass('typography-code');
  });

  it('renders code blocks', () => {
    const text = 'This is a code block:\n\n\tconst x = 10;\n\tconsole.log(x);';
    document.body.innerHTML = renderArticle(text);
    const { getByText } = within(document.body);
    const code = getByText(
      'const x = 10; console.log(x);',
      { collapseWhitespace : true },
    );
    expect(code.tagName).toBe('CODE');
    expect(code.parentElement?.tagName).toBe('PRE');
    expect(code.parentElement).toHaveClass('text');
    expect(code.parentElement).toHaveClass('code-block');
    expect(code.parentElement).toHaveClass('typography-code');
  });

  it('renders fenced code blocks', () => {
    const text = '```js\nconst y = 20;\nconsole.log(y);\n```';
    document.body.innerHTML = renderArticle(text);
    const { getAllByText } = within(document.body);
    const container = getAllByText((content, element) => {
      return !!(element?.textContent?.includes('const y = 20;')
        && element?.textContent?.includes('console.log(y);'));
    });
    expect(container.some(el => el.tagName === 'PRE')).toBe(true);
    expect(container.some(el => el.tagName === 'CODE')).toBe(true);

    const code = container.find(el => el.tagName === 'CODE')!;
    expect(code.tagName).toBe('CODE');
    expect(code).toHaveClass('text');
    expect(code).toHaveClass('code-block');
    expect(code).toHaveClass('typography-code');
  });

  it('renders fenced code blocks with keyword syntax highlighting', () => {
    const text = '```js\nconst x = 10;\n```';
    document.body.innerHTML = renderArticle(text);
    const { getByText } = within(document.body);
    const keyword = getByText('const');
    expect(keyword.tagName).toBe('SPAN');
    expect(keyword).toHaveClass('text');
    expect(keyword).toHaveClass('typography-code-keyword');
  });

  it('renders fenced code blocks with name syntax highlighting', () => {
    const text = '```html\n<span>Hello</span>\n```';
    document.body.innerHTML = renderArticle(text);
    const { getAllByText } = within(document.body);
    const names = getAllByText('span');
    expect(names).toHaveLength(2);
    names.forEach((name) => {
      expect(name.tagName).toBe('SPAN');
      expect(name).toHaveClass('text');
      expect(name).toHaveClass('typography-code-name');
    });
  });

  it('renders fenced code blocks with title syntax highlighting', () => {
    const text = '```js\nfunction myFunction() {}\n```';
    document.body.innerHTML = renderArticle(text);
    const { getByText } = within(document.body);
    const title = getByText('myFunction');
    expect(title.tagName).toBe('SPAN');
    expect(title).toHaveClass('text');
    expect(title).toHaveClass('typography-code-title');
  });

  it('renders fenced code blocks with tag syntax highlighting', () => {
    const text = '```html\n<div />\n```';
    document.body.innerHTML = renderArticle(text);
    const { getByText } = within(document.body);
    const opening = getByText((content, element) => {
      return !!(element?.textContent === '<div />');
    });
    expect(opening.tagName).toBe('SPAN');
    expect(opening).toHaveClass('text');
    expect(opening).toHaveClass('typography-code-tag');
  });

  it('renders fenced code blocks with selector syntax highlighting', () => {
    const text = '```css\n.container { display: flex; }\n```';
    document.body.innerHTML = renderArticle(text);
    const { getByText } = within(document.body);
    const selector = getByText('.container');
    expect(selector.tagName).toBe('SPAN');
    expect(selector).toHaveClass('text');
    expect(selector).toHaveClass('typography-code-selector-class');
  });

  it('renders fenced code blocks with attribute syntax highlighting', () => {
    const text = '```html\n<span class="example">Hello</span>\n```';
    document.body.innerHTML = renderArticle(text);
    const { getByText } = within(document.body);
    const attribute = getByText('class');
    expect(attribute.tagName).toBe('SPAN');
    expect(attribute).toHaveClass('text');
    expect(attribute).toHaveClass('typography-code-attr');
  });

  it('renders fenced code blocks with property syntax highlighting', () => {
    const text = '```js\nobject.property = "value";\n```';
    document.body.innerHTML = renderArticle(text);
    const { getByText } = within(document.body);
    const property = getByText('property');
    expect(property.tagName).toBe('SPAN');
    expect(property).toHaveClass('text');
    expect(property).toHaveClass('typography-code-property');
  });

  it('renders fenced code blocks with string syntax highlighting', () => {
    const text = '```js\nconst message = "Hello, world!";\n```';
    document.body.innerHTML = renderArticle(text);
    const { getByText } = within(document.body);
    const string = getByText('"Hello, world!"');
    expect(string.tagName).toBe('SPAN');
    expect(string).toHaveClass('text');
    expect(string).toHaveClass('typography-code-string');
  });

  it('renders fenced code blocks with comment syntax highlighting', () => {
    const text = '```js\n// This is a comment\n```';
    document.body.innerHTML = renderArticle(text);
    const { getByText } = within(document.body);
    const comment = getByText('// This is a comment');
    expect(comment.tagName).toBe('SPAN');
    expect(comment).toHaveClass('text');
    expect(comment).toHaveClass('typography-code-comment');
  });

  it('renders footnotes', () => {
    const text = 'Here is a footnote.[^1]\n\n[^1]: This is the footnote.';
    document.body.innerHTML = renderArticle(text);
    const { getByText } = within(document.body);
    const footnoteSup = document.body.querySelector('sup');
    const footnoteRef = getByText('[1]');
    const href = footnoteRef.getAttribute('href') ?? '';
    const footnotes = document.body.querySelector('ol');
    const footnoteId = footnotes?.querySelector('li')?.getAttribute('id') ?? '';
    const footnote = getByText('This is the footnote.');

    expect(footnoteSup).toHaveClass('footnote-ref');
    expect(footnoteSup).toHaveClass('text');
    expect(footnoteSup).toHaveClass('typography-link');
    expect(footnoteSup).toHaveClass('typography-ref');
    expect(footnoteRef.tagName).toBe('A');
    expect(footnotes?.children).toHaveLength(1);
    expect(footnoteId).toBe(href.replace('#', ''));
    expect(footnote.tagName).toBe('P');
  });

  it('renders multiple footnote references without indices', () => {
    const text =
      'First footnote.[^1] Second footnote.[^1]\n\n[^1]: Footnote content.';
    document.body.innerHTML = renderArticle(text);
    const { getAllByText } = within(document.body);
    const footnoteRefs = getAllByText('[1]');
    expect(footnoteRefs).toHaveLength(2);
  });

  it('renders segmented markdown', () => {
    const text = ['# Hello, World!', '\n\nThis is a test Article'];
    const rendered = renderArticle(text);
    const { getByText } = within(document.body);

    document.body.innerHTML = rendered[0] ?? '';
    expect(getByText('Hello, World!')).toBeInTheDocument();
    expect(getByText('Hello, World!').tagName).toBe('H1');

    document.body.innerHTML = rendered[1] ?? '';
    expect(getByText('This is a test Article')).toBeInTheDocument();
    expect(getByText('This is a test Article').tagName).toBe('P');
  });

  it('renders footnotes across multiple segments', () => {
    const text = ['Here is a footnote.[^1]', '\n\n[^1]: This is the footnote.'];
    document.body.innerHTML = renderArticle(text).join('');
    const { getByText } = within(document.body);
    const footnoteSup = document.body.querySelector('sup');
    const footnoteRef = getByText('[1]');
    const href = footnoteRef.getAttribute('href') ?? '';
    const footnotes = document.body.querySelector('ol');
    const footnoteId = footnotes?.querySelector('li')?.getAttribute('id') ?? '';
    const footnote = getByText('This is the footnote.');

    expect(footnoteSup).toHaveClass('footnote-ref');
    expect(footnoteSup).toHaveClass('text');
    expect(footnoteSup).toHaveClass('typography-link');
    expect(footnoteSup).toHaveClass('typography-ref');
    expect(footnoteRef.tagName).toBe('A');
    expect(footnotes?.children).toHaveLength(1);
    expect(footnoteId).toBe(href.replace('#', ''));
    expect(footnote.tagName).toBe('P');
  });
});
