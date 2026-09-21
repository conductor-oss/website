// Every card and company link is already present in the initial HTML.
const cards = [...document.querySelectorAll('.company-card')].map(element => ({
  element, industries: JSON.parse(element.dataset.industries),
  categories: JSON.parse(element.dataset.categories),
  text: element.dataset.search.toLocaleLowerCase()
}));
const search = document.getElementById('company-search');
const category = document.getElementById('use-case-category');
const more = document.getElementById('more-industries');
const tabs = [...document.querySelectorAll('.industry-tab')];
const count = document.getElementById('result-count');
const clear = document.getElementById('clear-filters');
const empty = document.getElementById('empty-results');
let industry = '';
function filter(updateUrl = true) {
  const query = search.value.trim().toLocaleLowerCase();
  let matched = 0;
  cards.forEach(card => {
    const matches = (!industry || card.industries.includes(industry)) &&
      (!category.value || card.categories.includes(category.value)) &&
      (!query || card.text.includes(query));
    card.element.hidden = !matches;
    if (matches) matched++;
  });
  tabs.forEach(tab => tab.setAttribute('aria-pressed', String(tab.dataset.industry === industry)));
  more.value = industry;
  count.textContent = `${matched} ${matched === 1 ? 'company' : 'companies'}`;
  clear.hidden = !(industry || category.value || query);
  empty.hidden = matched > 0;
  if (updateUrl) {
    const params = new URLSearchParams();
    if (industry) params.set('industry', industry);
    if (category.value) params.set('category', category.value);
    if (search.value.trim()) params.set('q', search.value.trim());
    history.replaceState(null, '', location.pathname + (params.size ? '?' + params : ''));
  }
}
function restore() {
  const params = new URLSearchParams(location.search);
  search.value = params.get('q') || '';
  category.value = params.get('category') || '';
  industry = cards.some(c => c.industries.includes(params.get('industry'))) ? params.get('industry') : '';
  filter(false);
}
function reset() { industry = ''; search.value = ''; category.value = ''; filter(); }
tabs.forEach(tab => tab.addEventListener('click', () => { industry = tab.dataset.industry; filter(); }));
more.addEventListener('change', () => { industry = more.value; filter(); });
search.addEventListener('input', () => filter());
category.addEventListener('change', () => filter());
clear.addEventListener('click', reset);
document.getElementById('empty-clear').addEventListener('click', reset);
window.addEventListener('popstate', restore);
restore();
