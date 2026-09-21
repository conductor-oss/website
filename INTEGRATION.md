# Conductor use-case directory: site and documentation changes

## Implemented in this website clone

- Add `/use-cases/`, with a four-column desktop card grid, prominent company logos, industry labels and concise descriptions. Each company links to its own static page containing all its use cases.
- Add **Use Cases** to desktop and mobile navigation.
- Point the homepage resource card to the new directory.
- Provide industry and use-case category filters, search, links with saved filters, mobile layouts and the existing light/dark theme. All companies are visible by default and all content remains readable without JavaScript.
- Generate page metadata, canonical URLs, structured data and a sitemap; make complete descriptions readable as HTML without JavaScript. Preserve the existing HTML/CSS/JavaScript website architecture.
- Link company details to a relevant Conductor recipe. The link describes a related implementation pattern, not the company's actual architecture.

The directory contains 249 company pages and 404 use cases across 21 industries and 19 cross-industry use-case categories. Airtel, IBM, Oracle and Foxtel each have one directory card, with their teams and brands identified beside the relevant use cases. Former company URLs redirect permanently to the consolidated page. Search recognizes former company names, and industry filters retain every industry represented by a merged company.

Each company page has a descriptive title, unique description, canonical URL, social metadata, breadcrumb and use-case structured data, category links and a contents list. All descriptions are present in the initial HTML. Only canonical company pages appear in the sitemap. The public site has no downloadable JSON, Markdown or AI text exports; build-time data stays in the source repository. Builds reject duplicate names, aliases and routes and remove stale generated pages.

## Recommended companion changes in conductor-oss/conductor

The documentation lives in a separate repository from this website. These changes are recommendations; this preview does not modify that repository.

1. In `mkdocs.yml`, add a top-level **Use Cases** link to `https://conductor-oss.org/use-cases/`.
2. In `docs/index.md`, replace the generic **Index** heading with **Conductor Documentation**. Add a **See Conductor in use** card linking to the directory, alongside the existing technical starting points.
3. Cross-link these existing recipes to useful filtered directory views:

| Documentation topic | Directory filter |
| --- | --- |
| Microservice orchestration | Process Automation |
| Saga compensation | Orders and Fulfillment; Payments and Financial Operations |
| Event-driven workflows | Customer Communications |
| AI cookbook | AI and Machine Learning |

The website already links in the other direction, from a company to a related recipe. Keep the recipes as technical guides and the company directory as the application-oriented entry point.

4. Expand the contribution guidance beside `USERS.md` to request: company, industry, use-case title, a short workflow description, a public reference, an official logo URL and a contributor contact for maintainer follow-up. Publish the company description; keep personal contact information out of the directory.
5. Use the same directory data as the canonical source rather than maintaining separate company descriptions in the documentation and website.

## Content conventions

Lead with what the workflow does: intake, decisions, service calls, human review and completion. Group distinct applications as separate use cases under one company. Use reusable categories such as Data Integration, Orders and Fulfillment, and Customer Communications.

The public cards contain no profile names, source badges or implementation-maturity labels. The descriptions preserve the scope supported by the underlying research. Concrete engineering implementations are included; a comparison of tools or an unimplemented plan alone is not converted into a company-use claim. The research ledger is maintained separately from hosted assets.

## Upstream handoff

This change targets `conductor-oss/website`. Committed static HTML fits the existing root-based publishing setup. Build-time source folders are excluded from GitHub Pages, and hosts with a build step can publish `dist/` directly. Companion documentation changes belong in a separate pull request to `conductor-oss/conductor`.
