import { isObject } from './typing';

export const defaultLocale = {
  title : 'Welcome!',
  subtitle : '',
  tagline : '',
  favourites : {
    header : 'Favourite',
    most : 'Most',
    least : 'Least',
  },
  highlights : {
    defaultHeading : 'Highlights',
  },
  collections : {
    allArticles : 'All Articles',
    tagPrefix : '',
    backPrefix : '',
    published : 'Published ',
  },
  contact : {
    header : 'Contact',
    infoHeader : 'Contact Info:',
  },
  nav : {
    home : 'Home',
    highlights : {} as Record<string, string>,
    allArticles : 'Blog',
    contact : 'Contact',
  },
  alt : {
    logo : 'Logo',
  },
  meta : {
    title : '',
    description : '',
  },
  errors : {
    default : 'Oops.',
    invalid : 'Oops.',
    notAuthenticated : 'Oops.',
    forbidden : 'Oops.',
    notFound : 'Oops.',
    unexpected : 'Oops!',
  },
};

function proxy<T extends Record<string, unknown>>(
  locale : unknown,
  defaults : T,
) : T {
  if (!isObject(locale)) return defaults;
  return new Proxy<T>(defaults, {
    get(_, prop) {
      if (typeof prop !== 'string') return undefined;
      if (typeof defaults[prop] === 'string') {
        if (typeof locale[prop] === 'string') return locale[prop];
        return defaults[prop];
      }

      if (
        ((typeof defaults[prop] === 'object') && (defaults[prop] !== null)
          && Object.keys(defaults[prop]).length === 0)
      ) {
        if ((typeof locale[prop] === 'object') && (locale[prop] !== null)) {
          return locale[prop];
        }
        return defaults[prop];
      }

      return proxy(
        isObject(locale[prop]) ? locale[prop] : {},
        isObject(defaults[prop]) ? defaults[prop] : {},
      );
    },
  });
}

export function buildLocale(locale : unknown) : typeof defaultLocale {
  return proxy(locale, defaultLocale);
}
