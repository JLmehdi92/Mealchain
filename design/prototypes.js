gsap.registerPlugin(MotionPathPlugin);

const EASE = { out: 'power3.out', inOut: 'power2.inOut', land: 'back.out(1.6)' };
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
let protoLang = 'fr';

const PROTOS = [
  {
    id: 'welcome', title: { fr: "Accueil : la brique se partage", en: 'Welcome: the carton splits' },
    note: "La moitié verte de la brique se détache et se pose sur le gratin de mercredi, comme le logo. Puis les deux plats arrivent.",
    build: (L, lang) => single(SCREENS.welcome(L, lang)),
    play(p, haptic) {
      const half = p.querySelector('.carton-r-wrap');
      const foods = p.querySelectorAll('.plate-mon, .dish-wed');
      const trails = p.querySelectorAll('.trail');
      const labels = p.querySelectorAll('.welcome-scene text:not(.carton-l text):not(.carton-r text)');
      const copy = p.querySelectorAll('.title, .subtitle, .bottom');
      return gsap.timeline()
        .set(half, { x: 0, y: 0 }).set([foods, trails, labels, copy], { opacity: 0 })
        .fromTo(foods, { scale: 0.86, transformOrigin: '50% 50%' }, { opacity: 1, scale: 1, duration: 0.5, ease: EASE.out, stagger: 0.08 }, 0.2)
        .to(half, { x: 10, y: -6, duration: 0.55, ease: EASE.land }, 0.7)
        .call(() => haptic('light'), null, 0.8)
        .to(trails, { opacity: 1, duration: 0.35, stagger: 0.15 }, 1.0)
        .to(labels, { opacity: 1, duration: 0.3 }, 1.2)
        .fromTo(copy, { y: 10 }, { y: 0, opacity: 1, duration: 0.45, ease: EASE.out, stagger: 0.06 }, 1.3);
    },
  },
  {
    id: 'box', title: { fr: 'Boîte vide : vos sources arrivent', en: 'Empty box: your sources arrive' },
    note: 'Un lien, une légende, une capture : les trois façons d\'importer apparaissent tour à tour, puis les fiches sortent de la boîte.',
    build: (L, lang) => single(SCREENS.boxEmpty(L, lang)),
    play(p) {
      const srcs = p.querySelectorAll('.src');
      const cards = p.querySelectorAll('.rcard');
      return gsap.timeline()
        .fromTo(srcs, { y: -14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.45, ease: EASE.out, stagger: 0.12 }, 0.3)
        .fromTo(cards, { y: 34 }, { y: 0, duration: 0.5, ease: EASE.out, stagger: 0.08 }, 0.8);
    },
  },
  {
    id: 'push', title: { fr: "Passage d'un écran à l'autre", en: 'Screen to screen' },
    note: "Le nouvel écran arrive de la droite, l'ancien recule de 30 % : le retour suit le même chemin.",
    build: (L, lang) => layered(SCREENS.welcome(L, lang), SCREENS.household(L, lang)),
    play(p) {
      const [a, b] = p.querySelectorAll('.layer');
      const btn = a.querySelector('.btn.primary');
      return gsap.timeline()
        .set(b, { xPercent: 100 }).set(a, { xPercent: 0, filter: 'brightness(1)' })
        .to(btn, { scale: 0.97, duration: 0.1 }, 0.4).to(btn, { scale: 1, duration: 0.3, ease: EASE.out })
        .to(b, { xPercent: 0, duration: 0.5, ease: EASE.out }, 0.55)
        .to(a, { xPercent: -30, filter: 'brightness(.92)', duration: 0.5, ease: EASE.out }, 0.55)
        .to(b, { xPercent: 100, duration: 0.45, ease: EASE.inOut }, 2.2)
        .to(a, { xPercent: 0, filter: 'brightness(1)', duration: 0.45, ease: EASE.inOut }, 2.2);
    },
  },
  {
    id: 'import', title: { fr: 'La recette importée rejoint la boîte', en: 'Imported recipe joins the box' },
    note: "« Enregistrer » ferme la revue vers le bas ; la carte prend sa place en tête et pousse les autres.",
    build: (L, lang) => layered(SCREENS.box(L, lang), SCREENS.importReview(L, lang)),
    play(p, haptic) {
      const [box, review] = p.querySelectorAll('.layer');
      const group = box.querySelector('.group');
      const first = group.querySelector('.recipe-card');
      const save = review.querySelector('.text-btn.strong');
      return gsap.timeline()
        .set(review, { yPercent: 0 }).set(first, { height: 0, opacity: 0, scale: 0.96, paddingTop: 0, paddingBottom: 0 })
        .to(save, { opacity: 0.4, duration: 0.08 }, 0.5).to(save, { opacity: 1, duration: 0.2 })
        .to(review, { yPercent: 100, duration: 0.45, ease: EASE.inOut }, 0.7)
        .to(first, { height: 84, paddingTop: 10, paddingBottom: 10, duration: 0.4, ease: EASE.out }, 1.0)
        .to(first, { opacity: 1, scale: 1, duration: 0.35, ease: EASE.out }, 1.15)
        .call(() => haptic('success'), null, 1.15);
    },
  },
  {
    id: 'compose', title: { fr: 'Le plan se compose', en: 'The week composes itself' },
    note: 'Les jours entrent avec 40 ms d\'écart, puis chaque brin se dessine du paquet vers le repas qui le finit.',
    build: (L, lang) => single(SCREENS.plan(L, lang)),
    play(p, haptic) {
      const days = p.querySelectorAll('.day');
      const strands = p.querySelectorAll('.strand');
      const knots = p.querySelectorAll('.knot');
      strands.forEach((s) => { const len = s.getTotalLength(); gsap.set(s, { strokeDasharray: len, strokeDashoffset: len }); });
      return gsap.timeline()
        .set(knots, { scale: 0, transformOrigin: '50% 50%' })
        .fromTo(days, { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.45, ease: EASE.out, stagger: 0.04 }, 0.3)
        .to(strands, { strokeDashoffset: 0, duration: 0.45, ease: EASE.inOut, stagger: 0.25 }, 0.9)
        .to(knots, { scale: 1, opacity: 1, duration: 0.3, ease: EASE.land, stagger: 0.12 }, 0.95)
        .call(() => haptic('success'), null, 1.9);
    },
  },
  {
    id: 'carry', title: { fr: 'Le reste voyage vers son repas', en: 'The leftover travels to its meal' },
    note: 'Seul geste avec un léger dépassement : la crème de lundi se pose sur le gratin de mercredi.',
    build: (L, lang) => single(SCREENS.plan(L, lang)),
    play(p, haptic) {
      const path = p.querySelector('.strand');
      const body = p.querySelector('.plan-body');
      const pill = p.querySelector('[data-carry]');
      const target = p.querySelectorAll('.meal')[2];
      const end = target.querySelector('.pill');
      p.querySelectorAll('.strand, .knot').forEach((el, i) => gsap.set(el, { opacity: i < 3 ? 1 : 0.15 }));
      let token = body.querySelector('.token');
      if (!token) { token = document.createElement('div'); token.className = 'token'; token.innerHTML = icon('carton', 16, 1.8); body.appendChild(token); }
      const len = path.getTotalLength();
      return gsap.timeline()
        .set(path, { strokeDasharray: len, strokeDashoffset: len })
        .set(token, { opacity: 0, scale: 0.6 })
        .to(pill, { backgroundColor: 'color-mix(in srgb, var(--strand) 18%, transparent)', duration: 0.2 }, 0.4)
        .to(token, { opacity: 1, scale: 1, duration: 0.2 }, 0.5)
        .to(path, { strokeDashoffset: 0, duration: 0.9, ease: EASE.inOut }, 0.6)
        .to(token, { duration: 0.9, ease: EASE.inOut, motionPath: { path, align: path, alignOrigin: [0.5, 0.5] } }, 0.6)
        .to(token, { opacity: 0, scale: 0.4, duration: 0.15 }, 1.5)
        .fromTo(end, { scale: 1 }, { scale: 1.08, duration: 0.14, ease: 'power2.out', transformOrigin: 'left center' }, 1.5)
        .to(end, { scale: 1, duration: 0.5, ease: EASE.land })
        .call(() => haptic('light'), null, 1.5)
        .to(pill, { backgroundColor: 'transparent', duration: 0.4 }, 2.2);
    },
  },
  {
    id: 'check', title: { fr: 'Cocher un article', en: 'Ticking an item' },
    note: 'La coche se remplit sous le doigt, un trait barre le nom, puis la ligne rejoint « Dans le panier ».',
    build: (L, lang) => single(SCREENS.list(L, lang)),
    play(p, haptic) {
      const row = p.querySelector('.list-row');
      const box = row.querySelector('.check');
      const name = row.querySelector('.item');
      name.style.backgroundImage = 'linear-gradient(currentColor, currentColor)';
      name.style.backgroundRepeat = 'no-repeat';
      name.style.backgroundPosition = '0 55%';
      return gsap.timeline()
        .set(name, { backgroundSize: '0% 1.5px', color: 'var(--ink)' }).set(row, { height: 'auto', opacity: 1 })
        .set(box, { backgroundColor: 'transparent', boxShadow: 'inset 0 0 0 1.5px color-mix(in srgb, var(--ink) 35%, transparent)' })
        .to(box, { scale: 0.85, duration: 0.1 }, 0.5)
        .to(box, { scale: 1, backgroundColor: 'var(--ink)', boxShadow: 'inset 0 0 0 0px transparent', duration: 0.35, ease: EASE.land })
        .call(() => { box.innerHTML = icon('check', 14, 2.4); box.style.color = 'var(--on-ink)'; haptic('light'); }, null, 0.6)
        .to(name, { backgroundSize: '100% 1.5px', color: 'var(--ink-2)', duration: 0.3, ease: EASE.out }, 0.65)
        .to(row, { height: 0, opacity: 0, paddingTop: 0, paddingBottom: 0, duration: 0.4, ease: EASE.inOut }, 1.4);
    },
    reset(p) { const box = p.querySelector('.list-row .check'); box.innerHTML = ''; },
  },
  {
    id: 'paywall', title: { fr: 'Ouverture du paywall', en: 'Paywall opens' },
    note: "Après le premier plan seulement. La feuille monte, l'écran dessous recule et s'assombrit ; la croix la renvoie par le même chemin.",
    build: (L, lang) => layered(SCREENS.list(L, lang), SCREENS.paywall(L, lang), true),
    play(p) {
      const [under, sheet] = p.querySelectorAll('.layer');
      const scrim = p.querySelector('.proto-scrim');
      return gsap.timeline()
        .set(sheet, { yPercent: 100 }).set(under, { scale: 1, borderRadius: 0 }).set(scrim, { opacity: 0 })
        .to(sheet, { yPercent: 6, duration: 0.55, ease: EASE.out }, 0.5)
        .to(under, { scale: 0.92, borderRadius: 24, duration: 0.55, ease: EASE.out }, 0.5)
        .to(scrim, { opacity: 1, duration: 0.55 }, 0.5)
        .to(sheet, { yPercent: 100, duration: 0.45, ease: EASE.inOut }, 2.8)
        .to(under, { scale: 1, borderRadius: 0, duration: 0.45, ease: EASE.inOut }, 2.8)
        .to(scrim, { opacity: 0, duration: 0.45 }, 2.8);
    },
  },
];

function single(inner) { return `<div class="layer" style="position:absolute;inset:0">${inner}</div>`; }
function layered(a, b, sheet) {
  return `<div class="layer" style="position:absolute;inset:0;background:var(--paper);transform-origin:50% 0;overflow:hidden">${a}</div>`
    + (sheet ? '<div class="proto-scrim" style="position:absolute;inset:0;background:var(--scrim);z-index:46"></div>' : '')
    + `<div class="layer" style="position:absolute;inset:0;background:var(--paper);z-index:47;${sheet ? 'border-radius:24px 24px 0 0;overflow:hidden' : ''}">${b}</div>`;
}

function protoFrame(proto) {
  const L = L_FOR(protoLang);
  return `<figure class="frame" id="proto-${proto.id}">
    <div class="phone">${status()}<div class="screen" style="padding-top:0">${proto.build(L, protoLang).replace(/class="layer" style="/g, 'class="layer" style="padding-top:54px;display:flex;flex-direction:column;')}</div><div class="home-ind"></div></div>
    <figcaption><b>${proto.title.fr}</b><br>${proto.note}</figcaption>
    <div style="display:flex;gap:8px;align-items:center"><button class="replay" data-proto="${proto.id}">Rejouer</button><span class="haptic" aria-live="polite"></span></div>
  </figure>`;
}

const timelines = {};

function hapticFor(fig) {
  const tag = fig.querySelector('.haptic');
  return (kind) => {
    tag.textContent = `Haptique : ${kind}`;
    gsap.fromTo(tag, { opacity: 1 }, { opacity: 0, delay: 0.9, duration: 0.4 });
  };
}

function play(proto) {
  const fig = document.getElementById(`proto-${proto.id}`);
  const p = fig.querySelector('.phone');
  timelines[proto.id]?.progress(0).kill();
  proto.reset?.(p);
  if (reduced.matches) {
    timelines[proto.id] = gsap.timeline().fromTo(p.querySelector('.screen'), { opacity: 0.4 }, { opacity: 1, duration: 0.15 });
    return;
  }
  timelines[proto.id] = proto.play(p, hapticFor(fig));
}

function renderProtos() {
  const lane = document.getElementById('proto-lane');
  lane.innerHTML = PROTOS.map(protoFrame).join('');
  drawStrands(lane);
  lane.querySelectorAll('.replay').forEach((b) => b.addEventListener('click', () => play(PROTOS.find((x) => x.id === b.dataset.proto))));
  const seen = new IntersectionObserver((entries) => entries.forEach((e) => {
    if (!e.isIntersecting) return;
    seen.unobserve(e.target);
    play(PROTOS.find((x) => `proto-${x.id}` === e.target.id));
  }), { threshold: 0.5 });
  lane.querySelectorAll('.frame').forEach((f) => seen.observe(f));
}

function langSwitch() {
  const head = document.querySelector('#prototypes > p');
  head.insertAdjacentHTML('afterend', '<div class="seg" style="width:180px;margin:-8px 0 16px;background:rgba(43,37,31,.08)"><button data-lang="fr" class="on">Français</button><button data-lang="en">English</button></div>');
  document.querySelectorAll('[data-lang]').forEach((b) => b.addEventListener('click', () => {
    protoLang = b.dataset.lang;
    document.querySelectorAll('[data-lang]').forEach((x) => x.classList.toggle('on', x === b));
    renderProtos();
  }));
}

langSwitch();
document.fonts.ready.then(renderProtos);
