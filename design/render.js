function frame(screen, lang, caption, opts = {}) {
  const L = L_FOR(lang);
  return `<figure class="frame" data-screen="${screen}">${phone(SCREENS[screen](L, lang), opts)}<figcaption><b>${caption}</b> · ${lang === 'fr' ? 'FR' : 'EN'}</figcaption></figure>`;
}

function drawStrands(root) {
  root.querySelectorAll('.plan-body').forEach((body) => {
    const svg = body.querySelector('.strands');
    const box = body.getBoundingClientRect();
    const scale = box.width / body.offsetWidth || 1;
    const rel = (r) => ({ l: (r.left - box.left) / scale, r: (r.right - box.left) / scale, t: (r.top - box.top) / scale, b: (r.bottom - box.top) / scale });
    const meals = [...body.querySelectorAll('.meal')];
    svg.setAttribute('width', body.offsetWidth);
    svg.setAttribute('height', body.offsetHeight);
    svg.innerHTML = CARRIES.map(([from, to], k) => {
      const pill = meals[from].querySelector('[data-carry]');
      if (!pill) return '';
      const p = rel(pill.getBoundingClientRect());
      const target = rel(meals[to].getBoundingClientRect());
      const card = rel(meals[from].getBoundingClientRect());
      const gutter = card.r + 7 + (k % 2) * 6;
      const y1 = (p.t + p.b) / 2;
      const y2 = target.t + 26;
      return `<path class="strand" d="M${p.r + 6} ${y1} H${card.r - 10} C ${gutter} ${y1} ${gutter} ${y1 + 12} ${gutter} ${y1 + 24} V${y2 - 24} C ${gutter} ${y2 - 12} ${gutter} ${y2} ${card.r - 10} ${y2}"/><circle class="knot" cx="${p.r + 6}" cy="${y1}" r="3"/><circle class="knot end" cx="${card.r - 10}" cy="${y2}" r="3.5"/>`;
    }).join('');
  });
}

function renderCanvas() {
  const nav = document.getElementById('nav');
  document.getElementById('flows').innerHTML = FLOWS.map((f) => `
    <section class="flow" id="${f.id}">
      <h2>${f.title.fr} <span style="color:#8A8073;font-weight:400">/ ${f.title.en}</span></h2>
      <p>${f.note}</p>
      <div class="lane-label">English (US)</div>
      <div class="lane">${f.screens.map(([s, c]) => frame(s, 'en', c)).join('')}</div>
      <div class="lane-label">Français</div>
      <div class="lane">${f.screens.map(([s, c]) => frame(s, 'fr', c)).join('')}</div>
    </section>`).join('');
  nav.innerHTML += FLOWS.map((f) => `<a href="#${f.id}">${f.title.fr}</a>`).join('') + '<a href="#dark">Mode sombre</a>';
  document.getElementById('dark-lane').innerHTML = [['plan', 'Plan', 'en'], ['list', 'Courses', 'fr'], ['recipe', 'Recette', 'fr'], ['paywall', 'Paywall', 'en']]
    .map(([s, c, lang]) => frame(s, lang, c, { dark: true })).join('');
}

renderCanvas();
document.fonts.ready.then(() => drawStrands(document));
