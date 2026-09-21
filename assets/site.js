// Enhance the existing static website shell; content remains available without JS.
const themeButton = document.getElementById('theme-toggle');
try { document.documentElement.dataset.theme = localStorage.getItem('theme') || 'light'; } catch {}
themeButton?.addEventListener('click', () => {
  const theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  document.documentElement.dataset.theme = theme;
  try { localStorage.setItem('theme', theme); } catch {}
});
const burger = document.getElementById('burger');
const drawer = document.getElementById('nav-drawer');
burger?.addEventListener('click', () => {
  const open = drawer.classList.toggle('open');
  burger.setAttribute('aria-expanded', String(open));
});
const modal = document.getElementById('modal-bg');
const open = document.getElementById('open-modal');
const close = document.getElementById('modal-x');
function closeModal() {
  modal?.classList.remove('open');
  document.body.style.overflow = '';
  open?.focus();
}
open?.addEventListener('click', () => {
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
  close?.focus();
});
close?.addEventListener('click', closeModal);
modal?.addEventListener('click', e => { if (e.target === modal) closeModal(); });
document.addEventListener('keydown', e => {
  if (!modal?.classList.contains('open')) return;
  if (e.key === 'Escape') closeModal();
  if (e.key === 'Tab') {
    const focusable = [...modal.querySelectorAll('button,a[href]')];
    const first = focusable[0], last = focusable.at(-1);
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
});
