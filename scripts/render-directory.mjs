export const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const json = value => JSON.stringify(value).replace(/</g, '\\u003c');
const route = c => `/use-cases/${c.slug}/`;
const arrow = '<span aria-hidden="true">→</span>';
const primary = ['','Automotive and Mobility','Media and Entertainment','Telecommunications','Financial Services','Retail and Commerce'];
export const industriesFor = c => c.industries || [c.industry];
const categoriesFor = c => [...new Set(c.cases.map(u => u.category))];
const shortText = (text, limit = 165) => text.length <= limit ? text : text.slice(0, limit - 1).replace(/\s+\S*$/, '').replace(/[.,;:]$/, '') + '…';
export function companyDescription(c) {
  if (c.seoDescription) return c.seoDescription;
  const topics = `Explore ${c.name} Conductor use cases: ${c.cases.map(u => u.title.toLocaleLowerCase()).join('; ')}.`;
  return shortText(c.cases.length > 1 ? topics : `${topics} ${c.summary}`);
}
export function casesWithAnchors(c) {
  const used = new Set();
  return c.cases.map((u, index) => {
    const base = [u.area, u.title].filter(Boolean).join('-').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'') || `workflow-${index+1}`;
    let id = base, suffix = 2;
    while (used.has(id)) id = `${base}-${suffix++}`;
    used.add(id);
    return {...u, id};
  });
}

function logo(company, logos, eager = false) {
  const asset = logos[company.logo];
  if (!asset) return `<span class="brand-text">${escape(company.name)}</span>`;
  return `<img src="/${escape(asset.src)}" alt="${escape(company.name)} logo" width="${asset.width}" height="${asset.height}" loading="${eager ? 'eager' : 'lazy'}" fetchpriority="${eager ? 'high' : 'auto'}" decoding="async" class="${company.squareLogo ? 'brand-square' : 'brand-wide'}">`;
}

function page(shell, {title, description, path, main, schema, origin, revision, directory = false}) {
  const url = origin + path;
  const head = `<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escape(title)}</title><meta name="description" content="${escape(description)}"><meta name="robots" content="index,follow,max-image-preview:large"><link rel="canonical" href="${escape(url)}"><meta property="og:type" content="website"><meta property="og:site_name" content="Conductor"><meta property="og:title" content="${escape(title)}"><meta property="og:description" content="${escape(description)}"><meta property="og:url" content="${escape(url)}"><meta name="twitter:card" content="summary"><meta name="twitter:title" content="${escape(title)}"><meta name="twitter:description" content="${escape(description)}"><link rel="icon" href="/assets/favicon.svg" type="image/svg+xml"><link rel="preload" href="/assets/fonts/inter-latin.woff2" as="font" type="font/woff2" crossorigin><link rel="stylesheet" href="/assets/site.css?v=${revision}"><link rel="stylesheet" href="/use-cases/directory.css?v=${revision}"><script type="application/ld+json">${json(schema)}</script>`;
  return shell.replace('{{HEAD}}', head).replace('{{MAIN}}', main)
    .replaceAll('{{REVISION}}', revision)
    .replace('{{PAGE_SCRIPT}}', directory ? `<script src="/use-cases/directory.js?v=${revision}" defer></script>` : '');
}

export function renderDirectory(shell, companies, options) {
  const {origin, logos} = options;
  const industries = [...new Set(companies.flatMap(industriesFor))].sort();
  const categories = [...new Set(companies.flatMap(categoriesFor))].sort();
  const choices = list => list.map(x => `<option value="${escape(x)}">${escape(x)}</option>`).join('');
  const tabs = primary.map(x => `<button class="industry-tab" type="button" data-industry="${escape(x)}" aria-pressed="${!x}">${escape(x || 'All')}</button>`).join('');
  const cards = companies.map((c, index) => {
    const search = [c.name,...(c.aliases || []),...industriesFor(c),c.summary,...c.cases.flatMap(u => [u.area || '',u.title,u.category,u.description])].join(' ');
    return `<article class="company-card" id="${escape(c.slug)}" data-industries="${escape(json(industriesFor(c)))}" data-categories="${escape(json(categoriesFor(c)))}" data-search="${escape(search)}"><div class="brand-area">${logo(c, logos, index === 0)}</div><h2 class="company-name"><a href="${route(c)}">${escape(c.name)}</a></h2><div class="card-copy"><p class="company-industry">${escape(c.industry)}</p><p class="company-description">${escape(c.summary)}</p></div><a class="case-button" href="${route(c)}" aria-label="Explore ${c.cases.length} use case${c.cases.length === 1 ? '' : 's'} for ${escape(c.name)}"><span>Explore ${c.cases.length} use case${c.cases.length === 1 ? '' : 's'}</span>${arrow}</a></article>`;
  }).join('');
  const main = `<main class="use-cases-page" id="main-content"><div class="directory-wrap"><header class="directory-heading"><h1>Conductor Use Cases</h1><p>Explore how teams build workflows across applications, services and AI.</p></header><div id="directory-filters"><div class="industry-tabs" role="group" aria-label="Filter by industry">${tabs}<label class="sr-only" for="more-industries">Industry</label><select class="more-industries" id="more-industries"><option value="">All industries</option>${choices(industries)}</select></div><div class="directory-toolbar"><label class="search-field"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/></svg><span class="sr-only">Search companies or use cases</span><input id="company-search" type="search" placeholder="Search companies or use cases" autocomplete="off"></label><label class="sr-only" for="use-case-category">Use-case category</label><select class="category-select" id="use-case-category"><option value="">All use-case categories</option>${choices(categories)}</select><button class="clear-filters" id="clear-filters" type="button" hidden>Clear filters</button><p class="result-count" id="result-count" role="status" aria-live="polite">${companies.length} companies</p></div></div><noscript><p class="no-script">All ${companies.length} companies are listed below. Open a company to read its full use cases.</p><style>#directory-filters{display:none}</style></noscript><div class="company-grid">${cards}</div><div class="directory-empty" id="empty-results" hidden><h2>No matching companies</h2><p>Try another company, industry or use case.</p><button class="clear-filters" id="empty-clear" type="button">Clear filters</button></div><div class="directory-support"><p>Building with Conductor? <a href="https://github.com/conductor-oss/conductor/blob/main/USERS.md">Share your use case ↗</a></p></div></div></main>`;
  const schema = {'@context':'https://schema.org','@type':'CollectionPage','@id':origin+'/use-cases/',name:'Conductor Use Cases',url:origin+'/use-cases/',description:'Company workflows and use cases built with Conductor.',inLanguage:'en',mainEntity:{'@type':'ItemList',numberOfItems:companies.length,itemListElement:companies.map((c,index) => ({'@type':'ListItem',position:index+1,name:c.name,url:origin+route(c)}))}};
  return page(shell, {...options,title:'Conductor Use Cases & Workflow Orchestration Examples',description:`Explore Conductor use cases across ${companies.length} companies, including customer communications, payments, fulfillment, data integration and AI workflows.`,path:'/use-cases/',main,schema,directory:true});
}

export function renderCompany(shell, company, options) {
  const c = company, url = options.origin + route(c), cases = casesWithAnchors(c);
  const categories = categoriesFor(c), industries = industriesFor(c);
  const title = `${c.name} Conductor Use Cases | Workflow Orchestration`;
  const description = companyDescription(c);
  const tags = categories.map(category => `<li><a href="/use-cases/?category=${encodeURIComponent(category)}">${escape(category)}</a></li>`).join('');
  const contents = cases.length > 1 ? `<nav class="case-contents" aria-labelledby="contents-title"><h2 id="contents-title">Explore ${cases.length} use cases</h2><ol>${cases.map(u => `<li><a href="#${u.id}">${escape(u.title)}${u.area ? `<span>${escape(u.area)}</span>` : ''}</a></li>`).join('')}</ol></nav>` : '';
  const details = cases.map((u,index) => `<section class="case-detail" id="${u.id}" aria-labelledby="${u.id}-title"><span class="anchor-alias" id="use-case-${index+1}" aria-hidden="true"></span><div class="case-labels"><p class="case-category">${escape(u.category)}</p>${u.area ? `<p class="case-area">${escape(u.area)}</p>` : ''}</div><h2 id="${u.id}-title">${escape(u.title)}</h2><p>${escape(u.description)}</p></section>`).join('');
  const recipes = (c.relatedPatterns || [c.recipe]).map((href,index) => `<a class="related-pattern" href="${escape(href)}">${(c.relatedPatterns || []).length > 1 ? escape(href.includes('/ai/') ? 'AI workflow patterns' : href.includes('saga-') ? 'Transaction recovery patterns' : 'Microservice orchestration patterns') : 'Explore related Conductor patterns'} ${arrow}</a>`).join('');
  const main = `<main class="use-cases-page" id="main-content"><article class="company-page"><nav class="breadcrumbs" aria-label="Breadcrumb"><a href="/use-cases/">All companies</a><span aria-hidden="true">/</span><span aria-current="page">${escape(c.name)}</span></nav><header class="company-hero"><div class="brand-area">${logo(c,options.logos,true)}</div><p class="company-industry">${escape(industries.join(' · '))}</p><h1>${escape(c.name)}<span>Conductor use cases</span></h1><p class="company-intro">${escape(c.summary)}</p><ul class="company-topics" aria-label="Use-case categories">${tags}</ul></header>${contents}<div class="company-cases">${details}</div><aside class="company-next" aria-label="Related resources">${recipes}</aside><a class="back-link" href="/use-cases/">← Explore all companies</a></article></main>`;
  const organization = {'@type':'Organization',name:c.name};
  if (options.logos[c.logo]) organization.logo = options.origin + '/' + options.logos[c.logo].src;
  const schema = {'@context':'https://schema.org','@graph':[{'@type':'CollectionPage','@id':url,url,name:title,description,inLanguage:'en',about:organization,keywords:[...industries,...categories,...(c.aliases || [])],isPartOf:{'@id':options.origin+'/use-cases/'},breadcrumb:{'@id':url+'#breadcrumb'},mainEntity:{'@type':'ItemList',numberOfItems:cases.length,itemListElement:cases.map((u,index) => ({'@type':'ListItem',position:index+1,item:{'@type':'WebPageElement','@id':url+'#'+u.id,url:url+'#'+u.id,name:u.title,description:u.description,keywords:[u.category,...(u.area ? [u.area] : [])]}}))}},{'@type':'BreadcrumbList','@id':url+'#breadcrumb',itemListElement:[{'@type':'ListItem',position:1,name:'Conductor Use Cases',item:options.origin+'/use-cases/'},{'@type':'ListItem',position:2,name:c.name,item:url}]}]};
  return page(shell, {...options,title,description,path:route(c),main,schema});
}

export function redirectPage(destination, origin) {
  const url=origin+destination;
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Company use cases have moved | Conductor</title><link rel="canonical" href="${escape(url)}"><meta http-equiv="refresh" content="0;url=${escape(destination)}"></head><body><main><h1>Company use cases have moved</h1><p><a href="${escape(destination)}">Explore all use cases on the company page</a>.</p></main></body></html>`;
}
