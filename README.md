# Conductor website

Source for https://conductor-oss.org/. The site uses static HTML, CSS and JavaScript.

## Use-case directory

`/use-cases/` contains 249 company cards and links to 404 complete use-case descriptions. Company pages group the applications of each company, including its relevant teams and brands. All content is present in the HTML; search and industry/category filters add optional browser interactions.

### Local development

Requires Node.js 22 and Python 3 for the content checker. No npm dependencies are needed.

```sh
npm run build
npm run check
npm run preview
```

Open http://127.0.0.1:8787/use-cases/. The preview serves `dist/` with compression, caching and permanent redirects from older URLs.

### Editing and publishing

- Edit company descriptions in `data/companies.json`. This is build-time content, not a public download.
- Edit the shared page shell in `templates/use-cases.html` and the renderer in `scripts/render-directory.mjs`.
- Edit directory styles and filtering in `use-cases/directory.css` and `use-cases/directory.js`.
- Company logos and their dimensions are maintained under `assets/companies/` and `data/logo-metadata.json`.

After editing, run:

```sh
npm run prepare:static
npm run check
```

Commit the source changes and refreshed generated HTML. The repository currently publishes the root of `main`; the committed HTML supports that existing setup without requiring a server framework or a deployment configuration change. `_config.yml` excludes build sources from GitHub Pages. A host with a build step can instead run `npm run build` and publish only `dist/`. Run `node scripts/sync-static.mjs --check` to verify that committed pages match the current source.

The default canonical origin is `https://conductor-oss.org`. Override `SITE_ORIGIN` for a separate deployment. The site assumes it is served at a domain root, as the existing website does.

Old `/powered-by/` and merged-company URLs have `_redirects` rules for compatible hosts. Static HTML redirect pages provide a canonical destination and immediate browser redirect on hosts without HTTP redirect configuration. GitHub Pages does not turn `_redirects` into HTTP 301 responses; configure those rules at the public host/CDN when permanent HTTP redirects are required.

## Search and agent access

Every company has a complete HTML page with one H1, descriptive metadata, a canonical URL, breadcrumb and use-case structured data. The sitemap contains the homepage, directory and canonical company pages. Search parameters canonicalize to the unfiltered directory.

No JSON catalog, Markdown copy or AI text export is published. Search engines and agents can follow standard HTML links and read the full content without JavaScript. The JSON-LD embedded in each HTML document describes its visible content; it is not a separate downloadable file.

Fonts are hosted locally and company logos use optimized WebP images with reserved dimensions. Configure compression and asset caching on the public host; `_headers` supplies cache rules where supported. Private profile data and research evidence do not belong in this repository.

See [INTEGRATION.md](INTEGRATION.md) for suggested links from the separate Conductor documentation repository.
