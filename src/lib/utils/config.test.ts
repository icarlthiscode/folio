import { describe, it, expect } from 'vitest';

import { defaultConfig, buildConfig } from './config';

const testConfig = {
  likes : null,
  dislikes : null,
};

describe('config', () => {
  it('returns default config', () => {
    const config = buildConfig(undefined);
    expect(config).toEqual(defaultConfig);
  });
});

describe('config likes', () => {
  it('returns config with valid likes', () => {
    const config = buildConfig({
      ...testConfig,
      likes : [
        { icon : 'icon1', text : 'Item 1' },
      ],
    });
    expect(config).toEqual(expect.objectContaining({
      likes : [
        { icon : 'icon1', text : 'Item 1' },
      ],
    }));
  });

  it('filters out invalid likes', () => {
    const config = buildConfig({
      ...testConfig,
      likes : [
        { icon : 'icon1', text : 'Item 1' },
        { icon : 123, text : 'Item 2' },
        { icon : 'icon3', text : null },
      ],
    });
    expect(config).toEqual(expect.objectContaining({
      likes : [{ icon : 'icon1', text : 'Item 1' }],
    }));
  });

  it('drops invalid likes property', () => {
    const config = buildConfig({
      ...testConfig,
      likes : 'invalid',
    });
    expect(config).toEqual(expect.objectContaining({
      likes : null,
    }));
  });
});

describe('config dislikes', () => {
  it('returns config with valid dislikes', () => {
    const config = buildConfig({
      ...testConfig,
      dislikes : [
        { icon : 'icon1', text : 'Item 1' },
      ],
    });
    expect(config).toEqual(expect.objectContaining({
      dislikes : [
        { icon : 'icon1', text : 'Item 1' },
      ],
    }));
  });

  it('filters out invalid dislikes', () => {
    const config = buildConfig({
      ...testConfig,
      dislikes : [
        { icon : 'icon1', text : 'Item 1' },
        { icon : 123, text : 'Item 2' },
        { icon : 'icon3', text : null },
      ],
    });
    expect(config).toEqual(expect.objectContaining({
      dislikes : [{ icon : 'icon1', text : 'Item 1' }],
    }));
  });

  it('drops invalid dislikes property', () => {
    const config = buildConfig({
      ...testConfig,
      dislikes : 'invalid',
    });
    expect(config).toEqual(expect.objectContaining({
      dislikes : null,
    }));
  });
});

describe('config highlights', () => {
  it('returns config with valid highlights', () => {
    const config = buildConfig({
      ...testConfig,
      highlights : [
        { id : 'tag1', type : 'tag', key : 'tag1', section : 'Section 1' },
        { id : 'tag2', type : 'tag', key : 'tag2' },
      ],
    });
    expect(config).toEqual(expect.objectContaining({
      highlights : [
        expect.objectContaining(
          { id : 'tag1', type : 'tag', key : 'tag1', section : 'Section 1' },
        ),
        expect.objectContaining(
          { id : 'tag2', type : 'tag', key : 'tag2' },
        ),
      ],
    }));
  });

  it('filters out invalid highlights', () => {
    const config = buildConfig({
      ...testConfig,
      highlights : [
        { id : 'art1', type : 'article', key : 'art1', section : 'Section 1' },
        {
          id : 'tag1',
          type : 'tag',
          key : 'tag1',
          count : 42,
          section : 'Section 1',
        },
        { id : 'tag2', key : 'tag2', section : 'Section 1' },
        { type : 'tag', key : 'tag1', section : 'Section 1' },
        { id : 'cat1', type : 'category', key : 'cat1' },
        { id : 'tag3', type : 'tag' },
        { id : 'tag4', type : 'tag', key : 123 },
      ],
    });
    expect(config).toEqual(expect.objectContaining({ highlights : [
      expect.objectContaining({
        id : 'art1',
        type : 'article',
        key : 'art1',
        section : 'Section 1',
      }),
      expect.objectContaining({
        id : 'tag1',
        type : 'tag',
        key : 'tag1',
        count : 42,
        section : 'Section 1',
      }),
    ] }));
  });

  it('filters out duplicate highlight IDs', () => {
    const config = buildConfig({
      ...testConfig,
      highlights : [
        { id : 'tag1', type : 'tag', key : 'tag1' },
        { id : 'tag1', type : 'tag', key : 'tag1-duplicate' },
        { id : 'tag2', type : 'tag', key : 'tag2' },
        { id : 'tag2', type : 'tag', key : 'tag2-duplicate' },
      ],
    });
    expect(config).toEqual(expect.objectContaining({
      highlights : [
        expect.objectContaining({ id : 'tag1', key : 'tag1' }),
        expect.objectContaining({ id : 'tag2', key : 'tag2' }),
      ],
    }));
  });

  it('drops invalid highlight count', () => {
    const config = buildConfig({
      ...testConfig,
      highlights : [{ id : 'tag1', type : 'tag', key : 'tag1', count : '42' }],
    });
    expect(config).toEqual(expect.objectContaining({
      highlights : [
        expect.objectContaining({ id : 'tag1', key : 'tag1', count : null }),
      ],
    }));
  });

  it('drops invalid highlight count', () => {
    const config = buildConfig({
      ...testConfig,
      highlights : [{ id : 'tag1', type : 'tag', key : 'tag1', count : '42' }],
    });
    expect(config).toEqual(expect.objectContaining({
      highlights : [
        expect.objectContaining({ id : 'tag1', key : 'tag1', count : null }),
      ],
    }));
  });

  it('replaces invalid highlight title', () => {
    const config = buildConfig({
      ...testConfig,
      highlights : [
        { id : 'art1', type : 'article', key : 'art1', title : 'Test Title' },
        { id : 'art2', type : 'article', key : 'art2', title : 42 },
      ],
    });
    expect(config).toEqual(expect.objectContaining({
      highlights : [
        expect.objectContaining({ id : 'art1', title : 'Test Title' }),
        expect.objectContaining({ id : 'art2', title : '' }),
      ],
    }));
  });

  it('replaces invalid highlight intro', () => {
    const config = buildConfig({
      ...testConfig,
      highlights : [
        {
          id : 'art1',
          type : 'article',
          key : 'art1',
          intro : 'Test introduction.',
        },
        { id : 'art2', type : 'article', key : 'art2', intro : 42 },
      ],
    });
    expect(config).toEqual(expect.objectContaining({
      highlights : [
        expect.objectContaining({ id : 'art1', intro : 'Test introduction.' }),
        expect.objectContaining({ id : 'art2', intro : '' }),
      ],
    }));
  });

  it('replaces invalid highlight outro', () => {
    const config = buildConfig({
      ...testConfig,
      highlights : [
        {
          id : 'art1',
          type : 'article',
          key : 'art1',
          outro : 'Test conclusion.',
        },
        { id : 'art2', type : 'article', key : 'art2', intro : 42 },
      ],
    });
    expect(config).toEqual(expect.objectContaining({
      highlights : [
        expect.objectContaining({ id : 'art1', outro : 'Test conclusion.' }),
        expect.objectContaining({ id : 'art2', outro : '' }),
      ],
    }));
  });

  it('replaces invalid highlight section', () => {
    const config = buildConfig({
      ...testConfig,
      highlights : [
        { id : 'art1', type : 'article', key : 'art1', section : 'Section 1' },
        { id : 'art2', type : 'article', key : 'art2', section : 42 },
      ],
    });
    expect(config).toEqual(expect.objectContaining({
      highlights : [
        expect.objectContaining({ id : 'art1', section : 'Section 1' }),
        expect.objectContaining({ id : 'art2', section : '' }),
      ],
    }));
  });

  it('replaces invalid links', () => {
    const config = buildConfig({
      ...testConfig,
      highlights : [
        { id : 'art1', type : 'article', key : 'art1', links : [
          { text : 'Link 1', href : '/link1' },
        ] },
        { id : 'art2', type : 'article', key : 'art2', links : {} },
      ],
    });
    expect(config).toEqual(expect.objectContaining({
      highlights : [
        expect.objectContaining({ id : 'art1', links : [
          expect.objectContaining({ text : 'Link 1', href : '/link1' }),
        ] }),
        expect.objectContaining({ id : 'art2', links : [] }),
      ],
    }));
  });

  it('drops invalid link', () => {
    const config = buildConfig({
      ...testConfig,
      highlights : [
        { id : 'art1', type : 'article', key : 'art1', links : [
          { text : 'Link 1', href : '/link1' },
          { text : 'Link 2', href : 42 },
          { text : 42, href : '/link3' },
        ] },
      ],
    });
    expect(config).toEqual(expect.objectContaining({
      highlights : [
        expect.objectContaining({ id : 'art1', links : [
          expect.objectContaining({ text : 'Link 1', href : '/link1' }),
        ] }),
      ],
    }));
  });

  it('drops invalid highlights property', () => {
    const config = buildConfig({
      ...testConfig,
      highlights : 'invalid',
    });
    expect(config).toEqual(expect.objectContaining({
      highlights : null,
    }));
  });
});

describe('config contact', () => {
  it('returns config with valid contact', () => {
    const config = buildConfig({
      ...testConfig,
      contact : [
        {
          icon : 'icon1',
          link : 'Link 1',
          href : 'https://example1.com',
        },
        {
          icon : 'icon2',
          text : 'Text 2',
          link : 'Link 2',
          href : 'https://example2.com',
        },
      ],
    });
    expect(config).toEqual(expect.objectContaining({
      contact : [
        {
          icon : 'icon1',
          link : 'Link 1',
          href : 'https://example1.com',
        },
        {
          icon : 'icon2',
          text : 'Text 2',
          link : 'Link 2',
          href : 'https://example2.com',
        },
      ],
    }));
  });

  it('filters out invalid contact', () => {
    const config = buildConfig({
      ...testConfig,
      contact : [
        {
          icon : 'icon1',
          link : 'Link 1',
          href : 'https://example1.com',
        },
        { icon : 123, link : 'Link 2', href : 'https://example2.com' },
        { link : 'Link 3', href : 'https://example3.com' },
        { icon : 'icon4', link : 456, href : 'https://example4.com' },
        { icon : 'icon4', href : 'https://example5.com' },
        { icon : 'icon5', link : 'Link 5', href : 789 },
        { icon : 'icon5', link : 'Link 5' },
      ],
    });
    expect(config).toEqual(expect.objectContaining({
      contact : [
        { icon : 'icon1', link : 'Link 1', href : 'https://example1.com' },
      ],
    }));
  });

  it('drops invalid contact property', () => {
    const config = buildConfig({
      ...testConfig,
      contact : 'invalid',
    });
    expect(config).toEqual(expect.objectContaining({
      contact : null,
    }));
  });
});

describe('config profile links', () => {
  it('returns config with valid profile links', () => {
    const config = buildConfig({
      ...testConfig,
      profileLinks : [
        { text : 'Link 1', href : 'https://example1.com' },
        { text : 'Link 2', href : 'https://example2.com' },
      ],
    });
    expect(config).toEqual(expect.objectContaining({
      profileLinks : [
        { text : 'Link 1', href : 'https://example1.com' },
        { text : 'Link 2', href : 'https://example2.com' },
      ],
    }));
  });

  it('filters out invalid profile links', () => {
    const config = buildConfig({
      ...testConfig,
      profileLinks : [
        { text : 'Link 1', href : 'https://example1.com' },
        { text : 123, href : 'https://example2.com' },
        { href : 'https://example3.com' },
        { text : 'Link 4', href : 456 },
        { text : 'Link 5' },
      ],
    });
    expect(config).toEqual(expect.objectContaining({
      profileLinks : [
        { text : 'Link 1', href : 'https://example1.com' },
      ],
    }));
  });

  it('drops invalid profile links property', () => {
    const config = buildConfig({
      ...testConfig,
      profileLinks : 'invalid',
    });
    expect(config).toEqual(expect.objectContaining({
      profileLinks : null,
    }));
  });
});

describe('config weblog', () => {
  it('returns weblog with valid url', () => {
    const config = buildConfig({
      ...testConfig,
      weblog : { url : 'https://example.com/weblog' },
    });
    expect(config).toEqual(expect.objectContaining({
      weblog : expect.objectContaining({ url : 'https://example.com/weblog' }),
    }));
  });

  it('drops invalid weblog url', () => {
    const config = buildConfig({
      ...testConfig,
      weblog : { url : 123 },
    });
    expect(config).toEqual(expect.objectContaining({
      weblog : expect.objectContaining({ url : '' }),
    }));
  });

  it('returns weblog with valid top credits', () => {
    const config = buildConfig({
      ...testConfig,
      weblog : { topCredits : ['testA', 'testB'] },
    });
    expect(config).toEqual(expect.objectContaining({
      weblog : expect.objectContaining({ topCredits : ['testA', 'testB'] }),
    }));
  });

  it('drops invalid top credits', () => {
    const config = buildConfig({
      ...testConfig,
      weblog : { topCredits : ['testA', 2, {}] },
    });
    expect(config).toEqual(expect.objectContaining({
      weblog : expect.objectContaining({ topCredits : ['testA'] }),
    }));
  });

  it('returns weblog with empty top credits if invalid', () => {
    const config = buildConfig({
      ...testConfig,
      weblog : { topCredits : { test : 'A' } },
    });
    expect(config).toEqual(expect.objectContaining({
      weblog : expect.objectContaining({ topCredits : [] }),
    }));
  });

  it('returns weblog with valid bottom credits', () => {
    const config = buildConfig({
      ...testConfig,
      weblog : { bottomCredits : ['testA', 'testB'] },
    });
    expect(config).toEqual(expect.objectContaining({
      weblog : expect.objectContaining({ bottomCredits : ['testA', 'testB'] }),
    }));
  });

  it('drops invalid top credits', () => {
    const config = buildConfig({
      ...testConfig,
      weblog : { bottomCredits : ['testA', 2, {}] },
    });
    expect(config).toEqual(expect.objectContaining({
      weblog : expect.objectContaining({ bottomCredits : ['testA'] }),
    }));
  });

  it('returns weblog with empty top credits if invalid', () => {
    const config = buildConfig({
      ...testConfig,
      weblog : { bottomCredits : { test : 'A' } },
    });
    expect(config).toEqual(expect.objectContaining({
      weblog : expect.objectContaining({ bottomCredits : [] }),
    }));
  });

  it('returns default weblog config if not provided', () => {
    const config = buildConfig({
      ...testConfig,
    });
    expect(config).toEqual(expect.objectContaining({
      weblog : defaultConfig.weblog,
    }));
  });

  it('returns default weblog config if invalid', () => {
    const config = buildConfig({
      ...testConfig,
      weblog : 'invalid',
    });
    expect(config).toEqual(expect.objectContaining({
      weblog : defaultConfig.weblog,
    }));
  });
});
