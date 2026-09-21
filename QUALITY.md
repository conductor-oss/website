# Directory quality checks

Earlier preview measured September 20, 2026 using Lighthouse 13.5.0 against the local static preview. The preview serves compressed HTML/CSS/JavaScript with asset caching. Mobile uses Lighthouse's standard mobile simulation; desktop uses its desktop preset. These are lab measurements from one run per page before the company consolidation and download-link removal, not public PageSpeed Insights or field Core Web Vitals results.

| Page | Performance | Accessibility | Best practices | SEO |
| --- | ---: | ---: | ---: | ---: |
| Directory, mobile | 99 | 100 | 100 | 100 |
| Directory, desktop | 100 | 100 | 100 | 100 |
| Tesla, mobile | 100 | 100 | 100 | 100 |

## Content and navigation

- All 249 company cards are present and visible in the unfiltered initial HTML. No load-more control or infinite-scroll request is needed to discover a company.
- All 404 descriptions are readable HTML on 249 independently linked company pages. The static content check verifies every description against the source catalog without executing JavaScript.
- Every company page has one H1, unique metadata, a canonical URL, structured data. The sitemap contains the homepage, directory and all 249 company URLs.
- No JSON, Markdown or AI text export is included in the public build. Source data is used only at build time. Complete descriptions and structured data remain in the HTML.
- The directory has been checked at 320px, 390px and 1440px widths. Desktop displays four columns and mobile uses a single column with full-width selectors. No horizontal page overflow was observed.
- Browser checks verified search, combined industry/category filtering, resetting filters, and navigation to Tesla's complete use-case page.

## Deployment checks still required on the public domain

The default canonical origin is `https://conductor-oss.org`. After publication, run PageSpeed Insights on the deployed public directory and representative company pages. Confirm compression, caching, sitemap access, canonical URLs and crawl access there. Field performance depends on actual visitors and hosting conditions.

The main site's static HTML/CSS/JavaScript approach is retained; no client framework or database was added. The separate MkDocs documentation repository has not been modified.

Implementation follows [Google's guidance on crawlable content](https://developers.google.com/search/docs/crawling-indexing/javascript/lazy-loading) and [web.dev guidance on reserving image dimensions](https://web.dev/articles/optimize-cls).
