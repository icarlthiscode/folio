# Blank
*Blank* is a simple, open-source, easily-branded blog application, built with
the [*SvelteKit*](https://kit.svelte.dev/docs/kit) framework.

## Customization
Aside from [deployment configuration](#configuration), the application is
customized via static configuration, locale, and theming files. These files
are expected to be served from the root of the internal `BASE_URL` path.

### Config File
To customize application settings, add a `config.json` file to the `/static`
folder. The [default configuration](src/lib/utils/config.ts) defines the
expected configuration object structure and default values. Values not defined
in the `config.json` file will fall back to the default configuration values.

#### Page Navigation
By default, page navigation is populated to intuitively link to other natural
entrypoints. However, navigation targets for `home`, `collection`, and `article`
pages can be specified via the `config.nav` object. Navigation targets can
include `home`, `highlights`, `allArticles`, and `contact`:
```json
{
  "nav" : {
    "home" : ["highlights", "allArticles", "contact"],
    "collection" : ["home", "allArticles", "contact"],
    "article" : ["home", "allArticles", "contact"]
  },
  // additional configuration...
}
```

#### Favourites Lists
A "personal favourites" list can be added to the home page by defining a list
of items in the `config.likes` array, specifying a theme graphic and a text
label for each item. A similar `config.dislikes` array can also be defined.

#### Profile Links
To add links to the main profile section at the top of the landing page, add
entries to the `config.links` array, specifying the `href` target and display
`text`.

#### Highlights
Individual articles and article collections can be added to landing page as an
ordered list of `config.highlights`:
- `id`: The HTML id of the section heading,
- `type`: Determines whether the highlight displays an individual `article` or
    a collection of articles filtered by the specified `tag`,
- `key`: The slug for the target `article` or `tag`,
- `count`: The max number of articles to display (option; applicable to `tag`
    only),
- `links`: An ordered list of links (display `text` and `href`) target to
    display after highlight content (optional),
- `title`: The display text of the highlight heading (optional),
- `intro`: The indexed article abstract to be shown above the article list
    (optional)
- `outro`: The indexed article abstract to be shown below the article list
    (optional)
- `section`: The [theme](#theming-file) section to apply to the highlight
    (optional).

#### Contact Information
Contact information can be added to the landing page footer by adding entries
to the `config.contact`:
- `text`: The display text of the contact information (optional),
- `link`: The display text of the contact link following the `text`,
- `href`: The link target,
- `icon`: The [theme](#theming-file) graphic key to display before the list
    entry.

#### Weblog Configuration
The base configuration for retrieving and displaying article content can be
defined in the `config.weblog` property:
- `url`: The article filesystem root to fetch article content from,
- `topCredits`: The [index](#index) `article.contributions` keys to be displayed
    in the byline above the article (optional).
- `bottomCredits`: The [index](#index) `article.contributions` keys to be
    displayed in the byline below the article (optional).

### Locale File
A locale can be set in `locale.json`, located in the `/static` folder. Values
found in the `locale.json` file will be used to populate application text. The
[default locale](src/lib/utils/locale.ts) defines all expected values.

### Theming File
Adding a custom `theme.json` file to the `/static` folder will populate the
application with the provided theme settings. The theme shown in the client is
determined by the `theme` local storage key. If no theme is set, the default
theme will be used.
```json
{
  "themes": {
    "default": {},
    "custom": {}
  }
}
```

The theme definitions can define colour palettes, scale values, backgrounds,
typography, and other graphics. Fonts are defined per theme; palettes, scales,
backgrounds, typography, and graphics are defined per section. Colour values,
size values, and typography fonts are expected to be keys associated with the
theme applicable palette, scale, or fonts, respectively. If SVG images are
sourced in backgrounds or graphics, SVG element colour can be defined by
mapping element class names to colour palette keys. An example theme definition
can be found in the [theme](src/lib/utils/theme.ts) utility file, along with
expected type definitions.

### Weblog Content
Weblog article markdown content (if applicable) is fetched is fetched live from
the filesystem defined in the [weblog configuration](#weblog-configuration). The
article repository is expected to have the structure:
```
—— [config.weblog.url]/
   ├── abstracts/
   │   ├── subfolder/
   |   |   └── article1.md
   │   ├── article2.md
   │   └── article3.md
   ├── articles/
   │   ├── subfolder/
   |   |   └── article1.md
   │   ├── article2.md
   │   └── article3.md
   └── index.json
```

#### Articles
Article markdown content in `/articles/` and subfolders is rendered to HTML on
the corresponding path without the extension (*e.g*
`/articles/subfolder/article1`).

#### Abstracts
Abstract markdown content in `/abstracts/` and subfolders is used to populate
corresponding article page descriptions. The abstract is expected to be a
level-1 heading and a plain text description.

#### Index
The `index.json` provides metadata for the articles in the repository. The index
defines the information for article abstract/summary to be used when displaying
collection as well as tags, dates and contributors. Relationships are defined
using the relative object keys. Example:
```json
{
  "contributors": {
    "me": { "name": "The Author", "href": "https://example.com" }
  },
  "contributions": {
    "written-by": { "byline": "Written by" }
  },
  "articles": {
    "hello-world": {
      "title": "Hello, World!",
      "canonicalRef": "optional/red/to/full/article",
      "abstract": "Welcome!\n\nThis is my first post.",
      "datePublished": "2026-06-04",
      "contributions": { "written-by": ["me"] }
    }
  },
  "tags": {
    "featured": {
      "name": "Featured",
      "articles": ["hello-world"]
    }
  }
}
```

## Deployment
The built [*SvelteKit*](https://kit.svelte.dev/docs/kit) server-side application
is configured to be deployed to a [*Node.js*](https://nodejs.org/) environment.
Before building and running the application, all necessary development
dependencies must be installed.
```bash
npm install
```

### Configuration
Optional environment variables can be defined in a `.env` file at the root of
the project. A sample `.env` file is provided as [`.env.example`](.env.example).

#### Application
By default, the application will not set a head favicon link. To add a
favicon, set the `PUBLIC_FAVICON` environment variable to the desired favicon
href link.

By default, all local resources are served from the root path (`/`). The base
path used by the client can be set using the `PUBLIC_BASE_URL` environment
variable. To provide a base path for the server data loading, set the private
`BASE_URL` environment variable. This can be useful for including static
resources or customization files after building the application which bundles
the `/static` folder.

#### Authentication
If any resources, [weblog content](#weblog-content) or [theme](#theming-file)
assets, require authorization to access, the `RESOURCE_AUTH_TOKEN` environment
variable can be set to add a `Authorization` header with the value `Bearer
<RESOURCE_AUTH_TOKEN>` to any outgoing HTTPS requests.

#### Logging
Server side events are automatically logged and formatted using
[*Pino*](https://getpino.io/). Events are sent to the application's standard
output to capture logs in the console or environment log files. In development,
[`pino-pretty`](https://github.com/pinojs/pino-pretty) is used to format the log
output.

#### Error Monitoring & Performance Tracking
To enable [*Sentry*](https://docs.sentry.io/platforms/javascript/guides/svelte/)
error tracking and performance monitoring, add the necessary environment
variables:
- `PUBLIC_SENTRY_DSN`: The public DSN for your Sentry project,
- `SENTRY_ORG`: Your Sentry organization slug,
- `SENTRY_PROJECT`: Your Sentry project slug,
- `SENTRY_AUTH_TOKEN`: Your Sentry authentication token.

### Development
The application can be started locally using [*Vite*](https://vitejs.dev/)'s
development server.
```bash
npm run dev
```

### Production
Run the build command to create an optimized production build, which can also
be served locally using [*Vite*](https://vitejs.dev/).
```bash
npm run build
npm run preview
```

### Testing
Unit tests and end-to-end integration test are included. Application and
configuration unit tests can be run using [*Vitest*](https://vitest.dev/);
Integration tests are ran via [*Playwright*](https://playwright.dev/). Both are
included in the package test script:
```bash
npm run test
```

Before running end-to-end tests, *Playwright* browser dependencies must be
installed:
```bash
npx playwright install
```
