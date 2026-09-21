"""Verify the generated static site, including the experience without JavaScript."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlparse
import json
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parent.parent
DIST = ROOT / 'dist'
companies = json.loads((ROOT / 'data/companies.json').read_text())

class Page(HTMLParser):
    def __init__(self):
        super().__init__()
        self.elements, self.text, self.in_script = [], [], False
    def handle_starttag(self, tag, attrs):
        self.elements.append((tag, dict(attrs)))
        if tag == 'script':
            self.in_script = True
    def handle_endtag(self, tag):
        if tag == 'script':
            self.in_script = False
    def handle_data(self, text):
        if not self.in_script:
            self.text.append(text)

total_cases = 0
descriptions = set()
titles = set()
pages = [('use-cases/index.html', None)] + [(f'use-cases/{c["slug"]}/index.html', c) for c in companies]
for route, company in pages:
    page = Page()
    page.feed((DIST / route).read_text())
    ids = [attrs['id'] for tag, attrs in page.elements if 'id' in attrs]
    assert len(ids) == len(set(ids)), f'Duplicate HTML ID: {route}'
    assert sum(tag == 'h1' for tag, attrs in page.elements) == 1, route
    for tag, attrs in page.elements:
        if tag == 'img':
            assert 'alt' in attrs, f'Missing image alternative: {route}'
            if attrs.get('alt'):
                assert attrs.get('width') and attrs.get('height'), (route, attrs)
        for key in ('src', 'href'):
            url = urlparse(attrs.get(key, ''))
            if not url.path or url.scheme or url.netloc:
                continue
            target = DIST / url.path.lstrip('/') if url.path.startswith('/') else (DIST / route).parent / url.path
            if target.is_dir():
                target = target / 'index.html'
            assert target.exists(), f'Broken internal link: {route} -> {attrs[key]}'
    if company is None:
        cards = [a for t, a in page.elements if a.get('class') == 'company-card']
        assert len(cards) == len(companies), 'Missing directory company'
        assert all('hidden' not in card for card in cards), 'Company hidden in initial HTML'
    else:
        text = ' '.join(page.text)
        meta = {attrs.get('name') or attrs.get('property'): attrs.get('content') for tag, attrs in page.elements if tag == 'meta'}
        assert meta['description'] and meta['description'] not in descriptions, f'Duplicate description: {route}'
        assert meta['og:title'] not in titles and company['name'] in meta['og:title'], route
        assert meta['description'] == meta['og:description'] == meta['twitter:description'], route
        descriptions.add(meta['description'])
        titles.add(meta['og:title'])
        for tag, attrs in page.elements:
            if attrs.get('href', '').startswith('#'):
                assert attrs['href'][1:] in ids, f'Broken section link: {route}'
        for case in company['cases']:
            assert case['description'] in text, f'Missing readable case: {company["name"]} / {case["title"]}'
        total_cases += sum(t == 'section' and a.get('class') == 'case-detail' for t, a in page.elements)

assert total_cases == sum(len(c['cases']) for c in companies)
assert len(ET.parse(DIST / 'sitemap.xml').getroot()) == len(companies) + 2
for file in ('robots.txt',):
    assert (DIST / file).exists(), file
assert not (DIST / 'data').exists(), 'Build-time data must not be published'
assert not list(DIST.rglob('*.json')), 'No downloadable JSON files'
assert not list((DIST / 'use-cases').rglob('*.md')), 'No downloadable Markdown files'
assert not (DIST / 'llms.txt').exists() and not (DIST / 'llms-full.txt').exists()
print(f'PASS: {len(companies)} visible cards; {total_cases} complete descriptions; links, headings, logo dimensions, sitemap; no JSON/Markdown downloads.')
