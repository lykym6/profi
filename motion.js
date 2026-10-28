(async () => {
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  // карточки проектов берутся из works.json (его редактирует admin.html); если файл не открылся, остаются карточки из HTML
  try {
    const grid = document.getElementById('dgrid');
    const list = (await (await fetch('works.json', { cache: 'no-cache' })).json()).works.filter((w) => w.visible !== false);
    if (grid && Array.isArray(list) && list.length) {
      grid.innerHTML = list.map((w) => {
        const real = /^https?:\/\//.test(w.link || '');
        const dom = w.domain || (real ? w.link.replace(/^https?:\/\//, '').split('/')[0] : 'концепт');
        const act = real ? `<a class="go" href="${esc(w.link)}" target="_blank" rel="noopener">Открыть сайт ↗</a>` : '<a class="go" href="#contact" data-s="template">Хочу такой →</a>';
        return `<article class="card reveal2"><div class="chrome"><i></i><i></i><i></i><span>${esc(dom)}</span></div><div class="shot"><img src="${esc(w.image)}" alt="${esc(w.title)}" loading="lazy"></div><div class="t"><small>${esc((w.type + ' · ' + w.category).toUpperCase())}</small><h3>${esc(w.title)}</h3><p class="d">${esc(w.text)}</p>${act}</div></article>`;
      }).join('');
    }
  } catch (e) { /* остаются карточки из HTML */ }
  // услуги и цены берутся из services.json (его редактирует admin.html); скрытые услуги не показываются
  try {
    const box = document.getElementById('price-list');
    const sel = document.getElementById('service-select');
    const all = (await (await fetch('services.json', { cache: 'no-cache' })).json()).services;
    const sv = Array.isArray(all) ? all.filter((s) => s.visible !== false) : null;
    if (box && sv) {
      const arrow = '<svg class="price-arrow" viewBox="0 0 16 16" aria-hidden="true"><path d="M4 12 12 4M5 4h7v7" /></svg>';
      box.innerHTML = sv.map((s, i) => `<a class="price-row reveal is-visible" href="#contact" data-service="${esc(s.id)}"><span class="price-num">${String(i + 1).padStart(2, '0')}</span><span class="price-name"><strong>${esc(s.title)}</strong><span>${esc(s.sub)}</span><span class="price-description">${esc(s.desc)}</span></span><span class="price-value">${esc(s.price)}</span>${arrow}</a>`).join('');
      if (sel) sel.innerHTML = '<option value="">Пока не выбрал</option>' + sv.map((s) => `<option value="${esc(s.id)}">${esc(s.title)}</option>`).join('');
      const chip = document.getElementById('min-price');
      const nums = sv.map((s) => parseInt(String(s.price).replace(/\D/g, ''), 10)).filter((n) => n > 0);
      if (chip) { if (nums.length) chip.textContent = 'от ' + Math.min(...nums).toLocaleString('ru-RU').replace(/\u00a0/g, ' ') + ' ₽'; else chip.parentElement.hidden = true; }
    }
  } catch (e) { /* остаётся список из HTML */ }
  document.documentElement.classList.add('mjs');

  const rm = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // появление блоков при прокрутке
  const io = new IntersectionObserver((es) => es.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }), { threshold: 0.12 });
  document.querySelectorAll('.reveal2').forEach((el, i) => {
    el.style.transitionDelay = (i % 3) * 0.08 + 's';
    if (rm) el.classList.add('in'); else io.observe(el);
  });

  // кейс: два экрана друг за другом, нажатие меняет их местами
  const deck = document.getElementById('deck');
  if (deck) {
    const hint = document.getElementById('deck-hint');
    let busy = false;
    const sheets = [...deck.querySelectorAll('.sheet')];
    deck.tabIndex = 0; deck.setAttribute('role', 'button'); deck.setAttribute('aria-label', 'Переключить: до и после');
    const refresh = () => {
      const beforeFront = deck.querySelector('[data-pos=front]').dataset.w === 'before';
      hint.textContent = beforeFront ? 'Нажмите на экран, чтобы увидеть, как стало' : 'Нажмите на экран, чтобы вернуться к старой версии';
    };
    const swap = () => {
      if (busy) return;
      const front = deck.querySelector('[data-pos=front]'), back = deck.querySelector('[data-pos=back]');
      busy = true;
      const done = () => { front.dataset.pos = 'back'; back.dataset.pos = 'front'; front.classList.remove('fly'); refresh(); setTimeout(() => { busy = false; }, 700); };
      if (rm) return done();
      front.classList.add('fly');
      setTimeout(done, 380);
    };
    deck.addEventListener('click', swap);
    deck.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); swap(); } });
    ['home', 'menu', 'section', 'form'].forEach((k) => ['before', 'after'].forEach((t) => { new Image().src = `assets/case/${k}-${t}.jpg`; }));
    document.querySelectorAll('.tabs button').forEach((b) => b.addEventListener('click', () => {
      document.querySelectorAll('.tabs button').forEach((x) => x.classList.toggle('on', x === b));
      sheets.forEach((s) => { s.querySelector('img').src = `assets/case/${b.dataset.k}-${s.dataset.w}.jpg`; });
    }));
    refresh();
  }

  // «Хочу такой» подставляет формат в форму
  document.addEventListener('click', (e) => {
    const a = e.target.closest('.go[data-s]');
    const s = document.querySelector('#service-select');
    if (a && s) s.value = a.dataset.s;
  });

  // полоса прогресса прокрутки
  const bar = document.createElement('div');
  bar.className = 'bar';
  document.body.append(bar);
  addEventListener('scroll', () => {
    const max = document.documentElement.scrollHeight - innerHeight || 1;
    bar.style.transform = `scaleX(${scrollY / max})`;
  }, { passive: true });
})();
