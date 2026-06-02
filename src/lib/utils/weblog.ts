import type { Options } from 'markdown-it';
import highlight from 'highlight.js';
import markdown from 'markdown-it';
import markdownFootnote from 'markdown-it-footnote';
import { logError } from './log';

export interface Contributor {
  name : string;
  href ?: string;
}

export interface Contribution {
  slug : string;
  byline : string;
  members : Contributor[];
}

export interface Article {
  slug : string;
  title : string;
  datePublished : Date | null;
  contributions : Contribution[];
  tags : { slug : string; name : string; }[];
  abstract : string;
}

export interface Tag {
  slug : string;
  name : string;
  description : string;
  articles : Article[];
}

export interface WeblogIndex {
  articles : Record<string, Article>;
  tags : Record<string, Tag>;
}

export function resolveWeblogIndex(data : unknown) : WeblogIndex {
  const raw = (((typeof data === 'object') && (data !== null))
    ? data
    : {}) as Record<string, unknown>;
  const contributions : Record<string, { byline : string; }> = {};
  const contributors : Record<string, Contributor> = {};
  const articles : Record<string, Article> = {};
  const tags : Record<string, Tag> = {};

  const rawContributions =
    (typeof raw.contributions === 'object') && (raw.contributions !== null)
      ? raw.contributions
      : {};
  for (const [slug, value] of Object.entries(rawContributions)) {
    const contribution = ((typeof value === 'object') && (value !== null))
      ? value
      : {};
    if (!('byline' in contribution)) continue;
    if (!`${contribution.byline}`) continue;
    contributions[slug] = { byline : `${contribution.byline}` };
  }

  const rawContributors =
    (typeof raw.contributors === 'object') && (raw.contributors !== null)
      ? raw.contributors
      : {};
  for (const [slug, value] of Object.entries(rawContributors)) {
    const contributor = ((typeof value === 'object') && (value !== null))
      ? value
      : {};
    if (typeof contributor.name !== 'string' || !contributor.name) continue;
    contributors[slug] = {
      name : contributor.name,
      href : `${contributor.href || ''}`,
    };
  }

  const rawArticles =
    ((typeof raw.articles === 'object') && (raw.articles !== null))
      ? raw.articles
      : {};
  for (const [slug, value] of Object.entries(rawArticles)) {
    const article = ((typeof value === 'object') && (value !== null))
      ? value
      : {};
    const articleContributions : Contribution[] = [];
    if (
      ((typeof article.contributions === 'object')
        && (article.contributions !== null))
    ) {
      for (const c in article.contributions) {
        const contribution = contributions[c];
        const contributorKeys = article.contributions[c];
        if (!contribution) continue;
        if (!Array.isArray(contributorKeys)) continue;
        const matchingContributors = contributorKeys
          .map(k => contributors[k])
          .filter(c => !!c);
        if (!matchingContributors.length) continue;
        articleContributions.push({
          slug : c,
          byline : contribution.byline,
          members : matchingContributors,
        });
      }
    }
    const proposedDate = new Date(article.datePublished);
    const dateValid = !Number.isNaN(proposedDate.getTime());
    articles[slug] = {
      slug,
      title : `${article.title || ''}`,
      datePublished : dateValid ? proposedDate : null,
      contributions : articleContributions,
      abstract : `${article.abstract || ''}`,
      tags : [], // defer tag assignment until validated
    };
  }

  const rawTags = ((typeof raw.tags === 'object') && (raw.tags !== null))
    ? raw.tags
    : {};
  for (const [slug, value] of Object.entries(rawTags)) {
    const tag = ((typeof value === 'object') && (value !== null)) ? value : {};
    const tagArticles : Article[] = [];
    if (Array.isArray(tag.articles)) {
      for (const a of tag.articles) {
        const articleSlug = `${a}`;
        const article = articles[articleSlug];
        if (!article) continue;
        // resolve article tags
        article.tags.push({ slug, name : tag.name });
        tagArticles.push(article);
      }
    }
    tags[slug] = {
      slug,
      name : `${tag.name || ''}`,
      description : `${tag.description || ''}`,
      articles : tagArticles,
    };
  }

  return { articles, tags };
}

highlight.configure({ classPrefix : 'text typography-code-' });

type Tokens = Parameters<Renderer['renderToken']>[0];
type Renderer = typeof md.renderer;

const md = markdown({
  html : true,
  highlight : function (str, lang) {
    if (lang && highlight.getLanguage(lang)) {
      try {
        return highlight.highlight(str, { language : lang }).value;
      } catch (err) { logError(err); }
    }
    return '';
  },
}).use(markdownFootnote);

const defaultInlineCodeRender = md.renderer.rules.code_inline;
const defaultBlockCodeRender = md.renderer.rules.code_block;
const defaultFencedCodeRender = md.renderer.rules.fence;
const defaultFootnoteRender = md.renderer.rules.footnote_ref;

function slug(text : string) {
  return text
    .toLowerCase()
    .replace(/[\s]+/g, '-')
    .replace(/[^\w-]+/g, '');
}

function heading(
  tokens : Tokens,
  idx : number,
  options : Options,
  env : unknown,
  self : Renderer,
) {
  const level = tokens[idx]?.tag.replace('h', '');
  tokens[idx]?.attrPush(['class', `text typography-heading-${level}`]);
  tokens[idx]?.attrPush(['id', slug(tokens[idx + 1]?.content || '')]);
  return self.renderToken(tokens, idx, options);
}

function link(
  tokens : Tokens,
  idx : number,
  options : Options,
  env : unknown,
  self : Renderer,
) {
  tokens[idx]?.attrPush(['class', 'text typography-link']);
  return self.renderToken(tokens, idx, options);
}

function blockquote(
  tokens : Tokens,
  idx : number,
  options : Options,
  env : unknown,
  self : Renderer,
) {
  const classes = ['text', 'typography-note'];
  const level = tokens[idx]?.level || 0;
  for (let i = idx + 1; i < tokens.length; i++) {
    const t = tokens[i];
    if (!t) break;
    if (t.type === 'paragraph_open' && t.level === level + 1) {
      t.attrPush(['class', 'text typography-note']);
    }
    if (t.type === 'blockquote_close' && t.level === level) {
      break;
    }
  }
  const contentToken = tokens[idx + 2];

  const alertMatch = contentToken?.content.match(/^\s*\[!(.+?)\]\s*/);
  if (!alertMatch) {
    tokens[idx]?.attrPush(['class', classes.join(' ')]);
    return self.renderToken(tokens, idx, options);
  }

  const alertType = alertMatch[1];
  const alertToken = contentToken?.children
    ?.find(t => t.content.startsWith('[!'));
  if (alertToken) {
    alertToken.content =
      alertToken.content.replace(/^\s*\[!(.+?)\]\s*/, '');
  }

  if (alertType) classes.push(`typography-alert-${alertType.toLowerCase()}`);
  tokens[idx]?.attrPush(['class', classes.join(' ')]);
  return self.renderToken(tokens, idx, options)
    + (alertType
      ? `<p class="text alert typography-alert">${alertType}</p>`
      : '');
}

function codeInline(
  tokens : Tokens,
  idx : number,
  options : Options,
  env : unknown,
  self : Renderer,
) {
  tokens[idx]?.attrPush(['class', 'text code typography-code']);
  return defaultInlineCodeRender
    ? defaultInlineCodeRender(tokens, idx, options, env, self)
    : '';
}

function codeBlock(
  tokens : Tokens,
  idx : number,
  options : Options,
  env : unknown,
  self : Renderer,
) {
  tokens[idx]?.attrPush(['class', 'text code-block typography-code']);
  return defaultBlockCodeRender
    ? defaultBlockCodeRender(tokens, idx, options, env, self)
    : '';
}

function codeFenced(
  tokens : Tokens,
  idx : number,
  options : Options,
  env : unknown,
  self : Renderer,
) {
  tokens[idx]?.attrPush(['class', 'text code-block typography-code']);
  return defaultFencedCodeRender
    ? defaultFencedCodeRender(tokens, idx, options, env, self)
    : '';
}

function footnote(
  tokens : Tokens,
  idx : number,
  options : Options,
  env : unknown,
  self : Renderer,
) {
  const rendered = defaultFootnoteRender
    ? defaultFootnoteRender(tokens, idx, options, env, self)
    : '';
  return rendered.replace(
    'class="footnote-ref"',
    'class="footnote-ref text typography-link typography-ref"',
  ).replace(/\[(\d+):\d+\]/g, '[$1]');
}

md.renderer.rules.heading_open = heading;
md.renderer.rules.link_open = link;
md.renderer.rules.blockquote_open = blockquote;
md.renderer.rules.code_inline = codeInline;
md.renderer.rules.code_block = codeBlock;
md.renderer.rules.fence = codeFenced;
md.renderer.rules.footnote_ref = footnote;

export function extractArticle(markdown : string) {
  let title = '';
  let body = markdown;
  if (markdown.match(/^\s*# /)) {
    title = (markdown.match(/^\s*(#\s+)(.*)(?=\n)/)?.[2] ?? '')
      .trim();
    body = markdown.replace(/^(#\s+)(.*)(?=\n)/, '').trim();
  }
  return { title, body };
}

export function renderArticle(markdown : string) : string;
export function renderArticle(markdown : string[]) : string[];
export function renderArticle(markdown : string | string[]) {
  if (typeof markdown === 'string') return md.render(markdown);
  const joinMarker = '\n<!-- BREAK -->\n';
  const rendered = md.render(markdown.join(joinMarker));
  return rendered.split(joinMarker).map(s => s.trim());
}
