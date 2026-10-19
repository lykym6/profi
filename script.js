document.documentElement.classList.add('js');

const siteLoader = document.querySelector('.site-loader');
if (siteLoader && document.documentElement.classList.contains('site-loading')) {
  const pageContent = Array.from(document.body.children).filter((element) => element !== siteLoader && element.tagName !== 'SCRIPT');
  const inertBeforeLoading = pageContent.map((element) => element.inert);
  pageContent.forEach((element) => { element.inert = true; });

  let loaderExited = false;
  let loaderFallback;
  const revealPortfolio = () => {
    if (loaderExited) return;
    loaderExited = true;
    window.clearTimeout(loaderFallback);
    document.documentElement.classList.remove('site-loading');
    siteLoader.classList.add('is-leaving');
    document.documentElement.classList.add('hero-ready');
    window.setTimeout(() => {
      siteLoader.hidden = true;
      siteLoader.classList.remove('is-leaving');
      pageContent.forEach((element, index) => { element.inert = inertBeforeLoading[index]; });
    }, 760);
  };

  loaderFallback = window.setTimeout(revealPortfolio, 2100);
  const startReveal = () => {
    window.clearTimeout(loaderFallback);
    window.setTimeout(revealPortfolio, 360);
  };
  if (document.readyState === 'complete') startReveal();
  else window.addEventListener('load', startReveal, { once: true });
} else {
  document.documentElement.classList.add('hero-ready');
}

const menuButton = document.querySelector('.menu-toggle');
const mobileMenu = document.querySelector('#mobile-menu');

function setMenuOpen(open) {
  if (!menuButton || !mobileMenu) return;
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
  mobileMenu.hidden = !open;
  document.body.classList.toggle('menu-open', open);
}

menuButton?.addEventListener('click', () => {
  setMenuOpen(menuButton.getAttribute('aria-expanded') !== 'true');
});

mobileMenu?.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => setMenuOpen(false));
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && menuButton?.getAttribute('aria-expanded') === 'true') {
    setMenuOpen(false);
    menuButton.focus();
  }
});

const revealItems = document.querySelectorAll('.reveal');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if ('IntersectionObserver' in window && !reduceMotion) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  revealItems.forEach((item) => revealObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add('is-visible'));
}

const contactForm = document.querySelector('#contact-form');
const formNote = document.querySelector('#form-note');
const serviceSelect = document.querySelector('#service-select');

const serviceNames = {
  mobile: 'Taplink — мобильный сайт-визитка',
  landing: 'Одностраничный сайт',
  catalog: 'Многостраничный сайт или каталог',
  template: 'Одностраничный сайт по шаблону',
};

document.querySelectorAll('.price-row[data-service]').forEach((link) => {
  link.addEventListener('click', () => {
    const service = link.dataset.service;
    if (!serviceNames[service] || !serviceSelect) return;
    serviceSelect.value = service;
    if (formNote) formNote.textContent = `Выбрано: ${serviceNames[service]}. Заполните контакты и выберите, куда подготовить сообщение.`;
  });
});

contactForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  if (!contactForm.reportValidity()) return;

  const values = new FormData(contactForm);
  const message = [
    'Здравствуйте! Хочу обсудить разработку сайта.',
    `Имя: ${String(values.get('name') || '').trim()}`,
    `Контакт для ответа: ${String(values.get('reply') || '').trim()}`,
    `Формат сайта: ${serviceNames[String(values.get('service') || '')] || 'Пока не выбран'}`,
    `Задача: ${String(values.get('message') || '').trim()}`,
  ].join('\n');
  const channel = String(values.get('channel') || '');
  const destination = channel === 'email'
    ? `mailto:artm.yelchev@bk.ru?subject=${encodeURIComponent('Обсуждение проекта')}&body=${encodeURIComponent(message)}`
    : `https://t.me/lykym6?text=${encodeURIComponent(message)}`;

  window.open(destination, '_blank', 'noopener,noreferrer');
  if (formNote) {
    formNote.textContent = channel === 'email'
      ? 'Открылся черновик письма. Проверьте его и нажмите «Отправить» в почтовом приложении. Если оно не открылось, напишите на artm.yelchev@bk.ru.'
      : 'Открылся Telegram с подготовленным текстом. Проверьте его и отправьте сообщение вручную. Если Telegram не открылся, напишите напрямую @lykym6.';
  }
});

const cookieNotice = document.querySelector('#cookie-notice');
const cookieAccept = document.querySelector('#cookie-accept');
const cookieKey = 'portfolio_notice=seen';

if (cookieNotice && !document.cookie.split(';').some((item) => item.trim() === cookieKey)) {
  cookieNotice.hidden = false;
}

cookieAccept?.addEventListener('click', () => {
  const secure = window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${cookieKey}; Max-Age=15552000; Path=/; SameSite=Lax${secure}`;
  if (cookieNotice) cookieNotice.hidden = true;
});
