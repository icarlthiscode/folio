export interface Highlight {
  id : string;
  type : 'article' | 'tag';
  key : string;
  count : number | null;
  links : { href : string; text : string; }[];
  title : string;
  section : string;
}

export interface Config {
  likes : { icon : string; text : string; }[] | null;
  dislikes : { icon : string; text : string; }[] | null;
  profileLinks : { text : string; href : string; }[] | null;
  highlights : Highlight[] | null;
  contact : {
    icon : string;
    text : string;
    link : string;
    href : string;
  }[] | null;
  weblog : {
    url : string;
    topCredits : string[];
    bottomCredits : string[];
  } | null;
}

export const defaultConfig : Config = {
  likes : null,
  dislikes : null,
  highlights : null,
  contact : null,
  profileLinks : null,
  weblog : null,
};

export function buildConfig(config : unknown) : Config {
  if (typeof config !== 'object' || config === null) return defaultConfig;
  const conf = { ...config } as Config;

  if (!Array.isArray((conf.likes))) {
    conf.likes = defaultConfig.likes;
  } else {
    conf.likes = conf.likes.filter((item) => {
      if (typeof item !== 'object' || item === null) return false;
      if (!('icon' in item) || typeof item.icon !== 'string') return false;
      if (!('text' in item) || typeof item.text !== 'string') return false;
      return true;
    });
  }
  if (!Array.isArray((conf.dislikes))) {
    conf.dislikes = defaultConfig.dislikes;
  } else {
    conf.dislikes = conf.dislikes.filter((item) => {
      if (typeof item !== 'object' || item === null) return false;
      if (!('icon' in item) || typeof item.icon !== 'string') return false;
      if (!('text' in item) || typeof item.text !== 'string') return false;
      return true;
    });
  }

  if (!Array.isArray((conf.highlights))) {
    conf.highlights = defaultConfig.highlights;
  } else {
    const highlightIds : string[] = [];
    conf.highlights = conf.highlights.filter((item) => {
      if (typeof item !== 'object' || item === null) return false;
      if (!('id' in item) || typeof item.id !== 'string') return false;
      if (highlightIds.includes(item.id)) return false;
      if (!('type' in item) || !['article', 'tag'].includes(item.type)) {
        return false;
      }
      if (!('key' in item) || typeof item.key !== 'string') return false;
      highlightIds.push(item.id);
      return true;
    }).map((item) => {
      const newItem = { ...item };
      if (!('count' in item) || typeof item.count !== 'number') {
        newItem.count = null;
      }
      if (!('title' in item) || typeof item.title !== 'string') {
        newItem.title = '';
      }
      if (!('section' in item) || typeof item.section !== 'string') {
        newItem.section = '';
      }
      if (!('links' in item) || !Array.isArray(item.links)) {
        newItem.links = [];
      }
      newItem.links = newItem.links.filter((link) => {
        if (typeof link !== 'object' || link === null) return false;
        if (!('href' in link) || typeof link.href !== 'string') return false;
        if (!('text' in link) || typeof link.text !== 'string') return false;
        return true;
      });
      return newItem;
    });
  }

  if (!Array.isArray((conf.contact))) {
    conf.contact = defaultConfig.contact;
  } else {
    conf.contact = conf.contact.filter((item) => {
      if (typeof item !== 'object' || item === null) return false;
      if (!('icon' in item) || typeof item.icon !== 'string') return false;
      if ('text' in item && typeof item.text !== 'string') return false;
      if (!('link' in item) || typeof item.link !== 'string') return false;
      if (!('href' in item) || typeof item.href !== 'string') return false;
      return true;
    });
  }

  if (!Array.isArray((conf.profileLinks))) {
    conf.profileLinks = defaultConfig.profileLinks;
  } else {
    conf.profileLinks = conf.profileLinks.filter((item) => {
      if (typeof item !== 'object' || item === null) return false;
      if (!('text' in item) || typeof item.text !== 'string') return false;
      if (!('href' in item) || typeof item.href !== 'string') return false;
      return true;
    });
  }

  if (!conf.weblog || (typeof conf.weblog !== 'object')) {
    conf.weblog = defaultConfig.weblog;
  } else {
    if (!('url' in conf.weblog) || typeof conf.weblog.url !== 'string') {
      conf.weblog.url = '';
    }
    if (
      (!('topCredits' in conf.weblog)
        || !Array.isArray(conf.weblog.topCredits))
    ) {
      conf.weblog.topCredits = [];
    }
    if (
      (!('bottomCredits' in conf.weblog)
        || !Array.isArray(conf.weblog.bottomCredits))
    ) {
      conf.weblog.bottomCredits = [];
    }
    conf.weblog.topCredits = conf.weblog.topCredits
      .filter(c => typeof c === 'string');
    conf.weblog.bottomCredits = conf.weblog.bottomCredits
      .filter(c => typeof c === 'string');
  }

  return conf;
}
