const menuToggle = document.querySelector('.menu-toggle');
const mainNav = document.querySelector('.main-nav');

menuToggle?.addEventListener('click', () => {
  const open = mainNav.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', String(open));
});

document.querySelectorAll('.nav-item > button').forEach(button => {
  button.addEventListener('click', event => {
    event.stopPropagation();
    const item = button.parentElement;
    const willOpen = !item.classList.contains('open');

    document.querySelectorAll('.nav-item.open').forEach(openItem => {
      if (openItem !== item) {
        openItem.classList.remove('open');
        openItem.querySelector('button')?.setAttribute('aria-expanded', 'false');
      }
    });

    item.classList.toggle('open', willOpen);
    button.setAttribute('aria-expanded', String(willOpen));
  });
});

document.addEventListener('click', () => {
  document.querySelectorAll('.nav-item.open').forEach(item => {
    item.classList.remove('open');
    item.querySelector('button')?.setAttribute('aria-expanded', 'false');
  });
});

const news = [
  'Global Tender Invited for the Procurement of Dry Guarded Hot Plate Tester',
  'PSG Centenary Celebrations | Products of PSG Products Expo 2026'
];
let newsIndex = 0;
const newsText = document.querySelector('.centenary-news');
document.querySelectorAll('[data-ticker]').forEach(button => {
  button.addEventListener('click', () => {
    newsIndex = button.dataset.ticker === 'next'
      ? (newsIndex + 1) % news.length
      : (newsIndex - 1 + news.length) % news.length;
    newsText.textContent = news[newsIndex];
  });
});

const gallery = document.querySelector('.gallery-grid');
document.querySelector('.gallery-prev').addEventListener('click', () => {
  gallery.prepend(gallery.lastElementChild);
});
document.querySelector('.gallery-next').addEventListener('click', () => {
  gallery.append(gallery.firstElementChild);
});
