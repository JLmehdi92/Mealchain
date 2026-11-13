const status = () => `<div class="status"><span>9:41</span><span class="icons"><svg width="18" height="12" viewBox="0 0 18 12" fill="currentColor"><rect x="0" y="8" width="3" height="4" rx="1"/><rect x="5" y="5.5" width="3" height="6.5" rx="1"/><rect x="10" y="3" width="3" height="9" rx="1"/><rect x="15" y="0" width="3" height="12" rx="1"/></svg><svg width="26" height="12" viewBox="0 0 26 12" fill="none"><rect x=".5" y=".5" width="22" height="11" rx="3.5" stroke="currentColor" opacity=".4"/><rect x="2" y="2" width="17" height="8" rx="2" fill="currentColor"/><rect x="24" y="4" width="1.5" height="4" rx=".75" fill="currentColor" opacity=".4"/></svg></span></div>`;

const tabbar = (L, on) => `<nav class="tabbar">${[
  ['week', L('Week', 'Semaine')], ['recipes', L('Recipes', 'Recettes')], ['list', L('List', 'Courses')],
].map(([k, t]) => `<a class="${k === on ? 'on' : ''}">${icon(k, 24)}<span>${t}</span></a>`).join('')}</nav>`;

const phone = (inner, opts = {}) => `<div class="phone ${opts.dark ? 'dark' : ''}" ${opts.id ? `id="${opts.id}"` : ''}>${status()}<div class="screen">${inner}</div><div class="home-ind"></div></div>`;

const DAYS = { en: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], fr: ['lun.', 'mar.', 'mer.', 'jeu.', 'ven.'] };

const PLAN = {
  en: [
    { d: 16, name: 'Creamy mushroom orzo', min: 30, uses: [['carton', 'Heavy cream 4 fl oz', 'carry', 'to Wed']] },
    { d: 17, name: 'Coconut red lentil dal', min: 35, uses: [['can', 'Coconut milk ½ can', 'carry', 'to Thu']] },
    { d: 18, name: 'Chicken and leek gratin', min: 45, uses: [['carton', 'Finishes the cream', 'end']] },
    { d: 19, name: 'Green curry with tofu', min: 25, uses: [['can', 'Finishes the coconut milk', 'end'], ['bag', 'Spinach ½ bag', 'carry', 'to Fri']] },
    { d: 20, name: 'Shakshuka with feta', min: 30, uses: [['bag', 'Finishes the spinach', 'end'], ['eggs', '4 eggs of 6']] },
  ],
  fr: [
    { d: 16, name: 'Orzo crémeux aux champignons', min: 30, uses: [['carton', 'Crème 10 cl', 'carry', 'vers mer.']] },
    { d: 17, name: 'Dal de lentilles corail au coco', min: 35, uses: [['can', 'Lait de coco 200 ml', 'carry', 'vers jeu.']] },
    { d: 18, name: 'Gratin poulet-poireaux', min: 45, uses: [['carton', 'Finit la crème', 'end']] },
    { d: 19, name: 'Curry vert au tofu', min: 25, uses: [['can', 'Finit le lait de coco', 'end'], ['bag', 'Épinards ½ sachet', 'carry', 'vers ven.']] },
    { d: 20, name: 'Chakchouka à la feta', min: 30, uses: [['bag', 'Finit les épinards', 'end'], ['eggs', '4 œufs sur 6']] },
  ],
};

const CARRIES = [[0, 2], [1, 3], [3, 4]];

const SCREENS = {
  welcome: (L) => `
    <div style="flex:1;display:grid;align-content:center;padding:0 28px 180px">
      <svg class="hero-strand" viewBox="0 0 337 230" width="337" height="230" aria-hidden="true">
        <g fill="none" stroke="var(--ink)" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round">
          <path d="M40 70l9-16h18l9 16v86a3 3 0 0 1-3 3H43a3 3 0 0 1-3-3z" fill="var(--sheet)"/><path d="M40 70h36M50 92h16"/>
        </g>
        <path class="s1" d="M76 118 C 150 118 150 70 214 70" fill="none" stroke="var(--strand)" stroke-width="3" stroke-linecap="round"/>
        <path class="s2" d="M76 132 C 150 132 160 176 214 176" fill="none" stroke="var(--strand)" stroke-width="3" stroke-linecap="round"/>
        <g font-family="Urbanist" font-weight="500">
          <rect x="214" y="44" width="104" height="52" rx="14" fill="var(--sheet)" stroke="var(--rule)"/><text x="230" y="66" font-size="12" fill="var(--ink-2)" font-family="var(--sf)">${L('Mon', 'lun.')}</text><text x="230" y="84" font-size="15" fill="var(--ink)">${L('Orzo', 'Orzo')}</text>
          <rect x="214" y="150" width="104" height="52" rx="14" fill="var(--sheet)" stroke="var(--rule)"/><text x="230" y="172" font-size="12" fill="var(--ink-2)" font-family="var(--sf)">${L('Wed', 'mer.')}</text><text x="230" y="190" font-size="15" fill="var(--ink)">${L('Gratin', 'Gratin')}</text>
        </g>
        <circle cx="214" cy="70" r="4" fill="var(--strand)"/><circle cx="214" cy="176" r="4" fill="var(--strand)"/>
        <text x="58" y="186" text-anchor="middle" font-size="13" fill="var(--ink-2)" font-family="var(--sf)">${L('8 fl oz', '20 cl')}</text>
      </svg>
      <h1 class="title" style="margin-top:36px">${L('Your recipes, planned so every pack gets finished', 'Vos recettes, organisées pour finir chaque paquet')}</h1>
      <p class="subtitle" style="margin-top:12px;font-size:17px">${L("The cream you open for Monday's orzo goes into Wednesday's gratin. Nextover plans the week around what you'll actually buy.", "La crème ouverte pour l'orzo de lundi finit dans le gratin de mercredi. Nextover compose la semaine autour de ce que vous achetez vraiment.")}</p>
    </div>
    <div class="bottom"><button class="btn primary">${L('Set up my household', 'Configurer mon foyer')}</button><button class="btn quiet">${L('I already have an account', "J'ai déjà un compte")}</button></div>`,

  how: (L) => `
    <div class="nav"><button class="btn-icon">${icon('chevL')}</button><span></span></div>
    <div class="scroll">
      <h1 class="title">${L('How Nextover works', 'Comment marche Nextover')}</h1>
      <ol style="list-style:none;margin-top:28px;display:grid;gap:28px">
        ${[
          ['recipes', L('Bring the recipes you already save', 'Apportez les recettes que vous gardez déjà'), L('A link, a caption you copied, a screenshot. Every word stays as written; anything unclear is flagged for you to check.', "Un lien, une légende copiée, une capture. Chaque mot reste tel quel ; ce qui n'est pas clair vous est signalé.")],
          ['people', L("Tell us who's eating", 'Dites-nous qui mange'), L('Allergies, diets and the equipment you have are hard rules. A recipe that breaks one never reaches your plan.', "Allergies, régimes et équipement sont des règles strictes. Une recette qui en enfreint une n'entre jamais dans le plan.")],
          ['list', L('Get the week and a list in real packs', 'Recevez la semaine et une liste en vrais paquets'), L('One carton of cream, one can of coconut milk. Each one is used up across the week.', 'Une brique de crème, une boîte de lait de coco. Chacune est finie dans la semaine.')],
        ].map(([ic, h, p], i) => `<li style="display:grid;grid-template-columns:44px 1fr;gap:16px"><span style="width:44px;height:44px;border-radius:12px;background:var(--surface);display:grid;place-items:center">${icon(ic)}</span><div><div class="h2" style="font-size:20px">${h}</div><p class="muted" style="font-size:15px;margin-top:6px">${p}</p></div></li>`).join('')}
      </ol>
      <div class="banner" style="margin-top:32px">${icon('info', 20)}<span>${L('Free for 15 recipes and your first full week, with the shopping list. No card needed.', 'Gratuit pour 15 recettes et votre première semaine complète, liste de courses comprise. Sans carte bancaire.')}</span></div>
    </div>
    <div class="bottom"><button class="btn primary">${L('Continue', 'Continuer')}</button></div>`,

  household: (L) => `
    <div class="nav"><button class="btn-icon">${icon('chevL')}</button><span class="small muted">1 / 3</span><span style="width:44px"></span></div>
    <div class="scroll">
      <h1 class="title">${L("Who's eating", 'Qui mange')}</h1>
      <p class="subtitle">${L('Quantities and packs are worked out for this many people.', 'Les quantités et les paquets sont calculés pour ce nombre de personnes.')}</p>
      <div class="section-label">${L('Household', 'Foyer')}</div>
      <div class="group">
        <div class="row"><span class="grow label">${L('People', 'Personnes')}</span><div class="stepper"><button>–</button><span>5</span><button>+</button></div></div>
      </div>
      <div class="section-label">${L('Meals to plan', 'Repas à planifier')}</div>
      <div class="group">
        <div class="row"><span class="grow label">${L('Dinners', 'Dîners')}</span><div class="stepper"><button>–</button><span>5</span><button>+</button></div></div>
        <div class="row"><span class="grow label">${L('Lunches', 'Déjeuners')}</span><div class="stepper"><button>–</button><span>0</span><button>+</button></div></div>
      </div>
      <div class="section-label">${L('Longest prep on a weeknight', 'Préparation maximum en semaine')}</div>
      <div class="seg">${['20', '30', '45', '60+'].map((m) => `<button class="${m === '45' ? 'on' : ''}">${m} min</button>`).join('')}</div>
      <div class="section-label">${L('Units', 'Unités')}</div>
      <div class="seg"><button class="${L('', 'on')}">${L('Metric', 'Métrique')}</button><button class="${L('on', '')}">${L('US', 'US')}</button></div>
    </div>
    <div class="bottom"><button class="btn primary">${L('Next', 'Suivant')}</button></div>`,

  allergies: (L) => {
    const all = L(
      ['Peanuts', 'Tree nuts', 'Milk', 'Eggs', 'Gluten', 'Fish', 'Shellfish', 'Molluscs', 'Soy', 'Sesame', 'Mustard', 'Celery', 'Sulphites', 'Lupin'],
      ['Arachides', 'Fruits à coque', 'Lait', 'Œufs', 'Gluten', 'Poisson', 'Crustacés', 'Mollusques', 'Soja', 'Sésame', 'Moutarde', 'Céleri', 'Sulfites', 'Lupin']);
    return `
    <div class="nav"><button class="btn-icon">${icon('chevL')}</button><span class="small muted">2 / 3</span><span style="width:44px"></span></div>
    <div class="scroll">
      <h1 class="title">${L('Allergies', 'Allergies')}</h1>
      <p class="subtitle">${L('A recipe containing any of these never appears in your plan.', "Une recette qui en contient une n'apparaît jamais dans votre plan.")}</p>
      <div class="chips" style="margin-top:24px">${all.map((a, i) => `<span class="chip ${i < 2 ? 'on' : ''}">${i < 2 ? icon('check', 16, 2) : ''}${a}</span>`).join('')}</div>
      <div class="banner allergy" style="margin-top:24px">${icon('alert', 20)}<span><b style="font-weight:600">${L('Peanuts and tree nuts', 'Arachides et fruits à coque')}</b> ${L('include cashews, almonds, hazelnuts, walnuts, pecans, pistachios and their oils and butters.', "incluent noix de cajou, amandes, noisettes, noix, noix de pécan, pistaches, ainsi que leurs huiles et purées.")}</span></div>
      <p class="small muted" style="margin-top:16px">${L('Filter based on the ingredients you enter. It does not replace medical advice.', "Filtre basé sur les ingrédients saisis. Il ne remplace pas un avis médical.")}</p>
    </div>
    <div class="bottom"><button class="btn primary">${L('Next', 'Suivant')}</button></div>`;
  },

  diets: (L) => `
    <div class="nav"><button class="btn-icon">${icon('chevL')}</button><span class="small muted">3 / 3</span><span style="width:44px"></span></div>
    <div class="scroll">
      <h1 class="title">${L('Diet and kitchen', 'Régimes et cuisine')}</h1>
      <p class="subtitle">${L('Choose as many as apply. They all hold at once.', "Cochez tout ce qui s'applique. Tout est respecté en même temps.")}</p>
      <div class="section-label">${L('Diets', 'Régimes')}</div>
      <div class="chips">${L(['Vegetarian', 'Vegan', 'Pescatarian', 'Gluten-free', 'Lactose-free', 'Halal', 'No pork'], ['Végétarien', 'Végan', 'Pescetarien', 'Sans gluten', 'Sans lactose', 'Halal', 'Sans porc']).map((d, i) => `<span class="chip ${i === 6 ? 'on' : ''}">${i === 6 ? icon('check', 16, 2) : ''}${d}</span>`).join('')}</div>
      <div class="section-label">${L('Equipment you have', 'Équipement disponible')}</div>
      <div class="group">${L(['Oven', 'Stovetop', 'Microwave', 'Blender', 'Air fryer', 'Slow cooker'], ['Four', 'Plaques de cuisson', 'Micro-ondes', 'Mixeur', 'Friteuse à air', 'Mijoteuse']).map((e, i) => `<div class="row"><span class="grow label">${e}</span><span class="toggle ${i < 3 || i === 4 ? 'on' : ''}"></span></div>`).join('')}</div>
    </div>
    <div class="bottom"><button class="btn primary">${L('Save household', 'Enregistrer le foyer')}</button></div>`,

  boxEmpty: (L) => `
    <div class="nav"><span></span><button class="btn-icon glass">${icon('gear')}</button></div>
    <div class="scroll">
      <h1 class="title">${L('Recipes', 'Recettes')}</h1>
      <div class="empty">
        <svg width="132" height="104" viewBox="0 0 132 104" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="16" y="22" width="64" height="76" rx="8" transform="rotate(-6 16 22)"/><rect x="36" y="10" width="64" height="80" rx="8" fill="var(--paper)"/><path d="M48 30h40M48 40h28M48 50h34"/><path d="M100 64 C 116 64 118 84 126 90" stroke="var(--strand)" stroke-width="2.4"/></svg>
        <h2 class="h2">${L('Your recipes, in one place', 'Toutes vos recettes, au même endroit')}</h2>
        <p>${L('Paste a link, a caption or a screenshot. Nextover keeps every word as written.', 'Collez un lien, une légende ou une capture. Nextover garde chaque mot tel quel.')}</p>
        <button class="btn primary" style="width:auto;padding:0 24px;margin-top:8px">${icon('plus', 20)}${L('Import a recipe', 'Importer une recette')}</button>
      </div>
    </div>${tabbar(L, 'recipes')}`,

  box: (L) => {
    const items = L(
      [['jar', 'Gochujang noodles', 'Caption', '', 'review'], ['tray', 'Cashew chicken stir-fry', 'Web page', '', 'excluded'], ['carton', 'Chicken and leek gratin', 'Web page', 'Wed', ''], ['bunch', 'Creamy mushroom orzo', 'Web page', 'Mon', ''], ['can', 'Coconut red lentil dal', 'Caption', 'Tue', ''], ['bag', 'Green curry with tofu', 'Screenshot', 'Thu', ''], ['eggs', 'Shakshuka with feta', 'Web page', 'Fri', ''], ['block', 'Lemon ricotta pasta', 'Web page', '', '']],
      [['jar', 'Nouilles au gochujang', 'Légende', '', 'review'], ['tray', 'Poulet sauté aux noix de cajou', 'Page web', '', 'excluded'], ['carton', 'Gratin poulet-poireaux', 'Page web', 'mer.', ''], ['bunch', 'Orzo crémeux aux champignons', 'Page web', 'lun.', ''], ['can', 'Dal de lentilles corail au coco', 'Légende', 'mar.', ''], ['bag', 'Curry vert au tofu', 'Capture', 'jeu.', ''], ['eggs', 'Chakchouka à la feta', 'Page web', 'ven.', ''], ['block', 'Pâtes citron-ricotta', 'Page web', '', '']]);
    return `
    <div class="nav"><span></span><div style="display:flex;gap:8px"><button class="btn-icon glass">${icon('gear')}</button><button class="btn-icon glass">${icon('plus')}</button></div></div>
    <div class="scroll">
      <h1 class="title">${L('Recipes', 'Recettes')}</h1>
      <p class="subtitle num">${L('12 of 15 free recipes', '12 recettes sur 15 gratuites')}</p>
      <div class="field" style="display:flex;gap:8px;align-items:center;margin:16px 0 20px;color:var(--ink-2);background:var(--surface);box-shadow:none;min-height:40px;padding:8px 12px">${icon('search', 18)}${L('Search', 'Rechercher')}</div>
      <div class="group">${items.map(([ic, n, src, day, flag]) => `<div class="recipe-card"><div class="thumb">${icon(ic, 28)}</div><div><div class="recipe-name">${n}</div><div class="recipe-meta"><span>${src}</span>${day ? `<span>·</span><span>${L('This week', 'Cette semaine')}, ${day}</span>` : ''}${flag === 'review' ? `<span class="tag review">${L('2 to check', '2 à vérifier')}</span>` : ''}${flag === 'excluded' ? `<span class="tag excluded">${icon('alert', 13, 2)}${L('Left out: tree nuts', 'Écartée : fruits à coque')}</span>` : ''}</div></div></div>`).join('')}</div>
    </div>${tabbar(L, 'recipes')}`;
  },

  importSheet: (L) => `${SCREENS.box(L)}<div class="scrim"></div>
    <div class="sheet"><div class="grabber"></div>
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px"><h2 class="h2">${L('Import a recipe', 'Importer une recette')}</h2><button class="btn-icon" style="width:32px;height:32px;border-radius:16px;background:var(--surface);display:grid;place-items:center">${icon('x', 16, 2)}</button></div>
      <div class="option"><span class="ic">${icon('link')}</span><div><div class="label">${L('Paste a link', 'Coller un lien')}</div><div class="small muted">${L('Recipe sites and blogs', 'Sites et blogs de recettes')}</div></div>${icon('chevR', 18)}</div>
      <div class="option"><span class="ic">${icon('text')}</span><div><div class="label">${L('Paste a caption or notes', 'Coller une légende ou des notes')}</div><div class="small muted">${L('Instagram, TikTok, a message', 'Instagram, TikTok, un message')}</div></div>${icon('chevR', 18)}</div>
      <div class="option"><span class="ic">${icon('camera')}</span><div><div class="label">${L('Choose a screenshot', 'Choisir une capture')}</div><div class="small muted">${L('Text is read on your iPhone', 'Le texte est lu sur votre iPhone')}</div></div>${icon('chevR', 18)}</div>
      <p class="small muted" style="margin-top:16px">${L('Captions and screenshot text are sent to an AI service that only sorts them into ingredients and steps. It never rewrites or adds anything.', "Les légendes et le texte des captures sont envoyés à un service d'IA qui les range seulement en ingrédients et en étapes. Il ne réécrit et n'ajoute rien.")}</p>
    </div>`,

  importLoading: (L) => `
    <div class="nav"><button class="text-btn">${L('Cancel', 'Annuler')}</button><span></span><span style="width:60px"></span></div>
    <div class="scroll">
      <p class="small muted" style="display:flex;gap:6px;align-items:center">${icon('link', 14)}${L('Link from a recipe blog', "Lien d\'un blog de cuisine")}</p>
      <h1 class="title" style="margin-top:8px">${L('Reading the page', 'Lecture de la page')}</h1>
      <div style="margin-top:28px;display:grid;gap:14px">
        ${[[L('Found recipe data on the page', 'Données de recette trouvées sur la page'), 'done'], [L('12 ingredients', '12 ingrédients'), 'done'], [L('Matching ingredients to packs', 'Association aux paquets'), 'now'], [L('Checking your allergies', 'Contrôle de vos allergies'), '']].map(([t, s]) => `<div style="display:flex;gap:12px;align-items:center;${s ? '' : 'color:var(--ink-2)'}"><span class="check ${s === 'done' ? 'on' : ''}" style="${s === 'now' ? 'box-shadow:inset 0 0 0 2px var(--strand)' : ''}">${s === 'done' ? icon('check', 14, 2.4) : ''}</span>${t}</div>`).join('')}
      </div>
      <div class="group" style="margin-top:32px;padding:16px;display:grid;gap:10px">
        <div class="skeleton" style="width:70%;height:20px"></div>
        <div class="skeleton" style="width:40%"></div>
        <div style="height:8px"></div>
        ${[86, 64, 72, 58, 80].map((w) => `<div class="skeleton" style="width:${w}%"></div>`).join('')}
      </div>
    </div>`,

  importReview: (L) => `
    <div class="nav"><button class="text-btn">${L('Cancel', 'Annuler')}</button><span class="small muted">${L('From a caption', "D'une légende")}</span><button class="text-btn strong">${L('Save', 'Enregistrer')}</button></div>
    <div class="scroll">
      <h1 class="title">${L('Check before saving', 'À vérifier avant de garder')}</h1>
      <div class="banner review" style="margin-top:12px">${icon('info', 20)}<span>${L('2 things need a look. We kept them as written.', '2 points à vérifier. Nous les avons laissés tels quels.')}</span></div>
      <div class="field-label">${L('Name', 'Nom')}</div><div class="field">${L('Gochujang noodles', 'Nouilles au gochujang')}</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
        <div><div class="field-label">${L('Serves', 'Personnes')}</div><div class="field num">2</div></div>
        <div><div class="field-label"><span>${L('Time', 'Temps')}</span><span class="strand-ink">${L('Not in caption', 'Absent')}</span></div><div class="field flag muted">${L('Add time', 'Ajouter')}</div></div>
      </div>
      <div class="field-label">${L('Ingredients · 7', 'Ingrédients · 7')}</div>
      <div class="group">${L(
        [['200 g wheat noodles', 'Wheat noodles', ''], ['2 tbsp gochujang', 'Gochujang', ''], ['1 tbsp soy sauce', 'Soy sauce', ''], ['2 spring onions', 'Spring onions', ''], ['1 knob of "secret butter"', '', 'unmatched']],
        [['200 g de nouilles de blé', 'Nouilles de blé', ''], ['2 c. à s. de gochujang', 'Gochujang', ''], ['1 c. à s. de sauce soja', 'Sauce soja', ''], ['2 oignons nouveaux', 'Oignons nouveaux', ''], ['1 noix de « beurre secret »', '', 'unmatched']]
      ).map(([raw, m, f]) => `<div class="row" style="align-items:flex-start"><div class="grow"><div class="label" style="font-size:16px">${raw}</div><div class="small ${f ? 'strand-ink' : 'muted'}">${f ? L('Not in our ingredient list · tap to choose', 'Inconnu de notre liste · touchez pour choisir') : '→ ' + m}</div></div>${f ? `<span class="tag review">${L('Check', 'Vérifier')}</span>` : ''}</div>`).join('')}</div>
      <p class="small muted" style="margin-top:12px">${L('Allergens found: wheat (gluten), soy.', 'Allergènes repérés : blé (gluten), soja.')}</p>
    </div>`,

  importError: (L) => `
    <div class="nav"><button class="text-btn">${L('Close', 'Fermer')}</button><span></span><span style="width:60px"></span></div>
    <div class="scroll">
      <div class="empty" style="padding-top:96px">
        <svg width="96" height="96" viewBox="0 0 96 96" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><rect x="18" y="14" width="60" height="72" rx="8"/><path d="M30 34h36M30 44h24"/><path d="M34 62 C 46 56 56 70 70 62" stroke="var(--strand)" stroke-width="2.4" stroke-dasharray="2 6"/></svg>
        <h2 class="h2">${L('No recipe on this page', 'Pas de recette sur cette page')}</h2>
        <p>${L("This page doesn't share its recipe in a form we can read. Copy the ingredients and steps, then paste them as text.", "Cette page ne partage pas sa recette dans un format lisible. Copiez les ingrédients et les étapes, puis collez-les en texte.")}</p>
      </div>
    </div>
    <div class="bottom"><button class="btn primary">${L('Paste as text', 'Coller en texte')}</button><button class="btn quiet">${L('Try another link', 'Essayer un autre lien')}</button></div>`,

  planLoading: (L, lang) => `
    <div class="nav"><span></span><button class="btn-icon glass">${icon('gear')}</button></div>
    <div class="scroll">
      <h1 class="title">${L('Planning 5 dinners', 'Composition de 5 dîners')}</h1>
      <p class="subtitle">${L('Matching packs across the week', 'Paquets assortis sur la semaine')}</p>
      <div style="margin-top:16px">${DAYS[lang].map((d, i) => `<div class="day"><div class="day-name">${d}<b class="num">${16 + i}</b></div>${i < 2 ? `<div class="meal"><div class="recipe-name">${PLAN[lang][i].name}</div><div class="uses"><span class="pill carry">${icon(PLAN[lang][i].uses[0][0], 16)}${PLAN[lang][i].uses[0][1]}</span></div></div>` : `<div class="meal" style="opacity:${1 - i * 0.18}"><div class="skeleton" style="width:${[70, 60, 75][i - 2]}%;height:18px"></div><div class="skeleton" style="width:40%;margin-top:12px"></div></div>`}</div>`).join('')}</div>
    </div>${tabbar(L, 'week')}`,

  plan: (L, lang) => `
    <div class="nav"><span></span><div style="display:flex;gap:8px"><button class="btn-icon glass">${icon('gear')}</button></div></div>
    <div class="scroll">
      <h1 class="title">${L('This week', 'Cette semaine')}</h1>
      <p class="subtitle num">${L('Nov 16–20 · 5 dinners · 3 packs finished', '16–20 nov. · 5 dîners · 3 paquets finis')}</p>
      <div class="plan-body" style="position:relative;margin-top:12px">${PLAN[lang].map((m, i) => `
        <div class="day"><div class="day-name">${DAYS[lang][i]}<b class="num">${m.d}</b></div>
          <div class="meal" data-i="${i}"><div class="recipe-name">${m.name}</div><div class="recipe-meta">${icon('clock', 14)}<span class="num">${m.min} min</span></div>
            <div class="uses">${m.uses.map(([ic, t, k, to]) => `<span class="pill ${k === 'carry' ? 'carry' : ''}" ${k === 'carry' ? 'data-carry' : ''}>${icon(ic, 16)}${t}${to ? ` <span style="font-weight:400">· ${to}</span>` : ''}</span>`).join('')}</div>
          </div></div>`).join('')}
        <svg class="strands"></svg>
      </div>
    </div>${tabbar(L, 'week')}`,

  swap: (L, lang) => `${SCREENS.plan(L, lang)}<div class="scrim"></div>
    <div class="sheet"><div class="grabber"></div>
      <h2 class="h2">${L('Swap Wednesday', 'Changer mercredi')}</h2>
      <p class="small muted" style="margin:4px 0 16px">${L('Ranked by what they reuse. The list updates when you pick one.', "Classés selon ce qu'ils réutilisent. La liste se met à jour dès votre choix.")}</p>
      ${[
        [L('Leek and potato soup', 'Soupe poireaux-pommes de terre'), L('Finishes the cream', 'Finit la crème'), L('Nothing extra to buy', 'Rien de plus à acheter'), true],
        [L('Mushroom risotto', 'Risotto aux champignons'), L('Finishes the cream', 'Finit la crème'), L('+1 pack: arborio rice', '+1 paquet : riz arborio'), false],
        [L('Sheet-pan sausages', 'Saucisses au four'), L('Leaves 4 fl oz of cream', 'Laisse 10 cl de crème'), L('+2 packs', '+2 paquets'), false],
      ].map(([n, a, b, best]) => `<div class="option" style="grid-template-columns:1fr auto"><div><div class="label">${n}</div><div class="small ${best ? 'strand-ink' : 'muted'}">${a} · ${b}</div></div>${icon('chevR', 18)}</div>`).join('')}
      <button class="btn quiet" style="margin-top:8px">${L('Choose from all recipes', 'Choisir parmi toutes les recettes')}</button>
    </div>`,

  recipe: (L) => `
    <div class="nav"><button class="btn-icon glass">${icon('chevL')}</button><div style="display:flex;gap:8px"><button class="btn-icon glass">${icon('swap')}</button><button class="btn-icon glass">${icon('share')}</button></div></div>
    <div class="scroll">
      <p class="small muted">${L('Wednesday · from a web page', 'Mercredi · depuis une page web')}</p>
      <h1 class="title" style="margin-top:4px">${L('Chicken and leek gratin', 'Gratin poulet-poireaux')}</h1>
      <div class="recipe-meta" style="font-size:15px;gap:16px;margin-top:8px"><span style="display:flex;gap:4px;align-items:center">${icon('clock', 16)}45 min</span><span style="display:flex;gap:4px;align-items:center">${icon('people', 16)}${L('Serves 5 · scaled from 4', '5 pers. · adapté de 4')}</span><span style="display:flex;gap:4px;align-items:center">${icon('oven', 16)}${L('Oven', 'Four')}</span></div>
      <div class="group" style="margin-top:20px;padding:14px 16px">
        <div style="display:flex;gap:8px;align-items:center" class="strand-ink">${icon('carton', 18)}<b style="font-weight:500">${L("Uses the rest of Monday's cream", 'Utilise le reste de la crème de lundi')}</b></div>
        <div class="gauge"><i style="flex:1"></i><i class="b" style="flex:1"></i></div>
        <div class="gauge-legend num"><span>${L('Mon · orzo 4 fl oz', 'lun. · orzo 10 cl')}</span><span>${L('Wed · here 4 fl oz', 'mer. · ici 10 cl')}</span></div>
      </div>
      <div class="section-label" style="margin-top:24px">${L('Ingredients', 'Ingrédients')}</div>
      <ul class="ingredients">${L(
        [['Chicken thighs, boneless', '1¼ lb'], ['Leeks', '3'], ['Heavy cream (<b>milk</b>)', '4 fl oz'], ['Gruyère (<b>milk</b>)', '3 oz'], ['Breadcrumbs (<b>wheat</b>)', '⅓ cup'], ['Dijon mustard (<b>mustard</b>)', '1 tbsp']],
        [['Hauts de cuisse de poulet', '600 g'], ['Poireaux', '3'], ['Crème fraîche épaisse (<b>lait</b>)', '10 cl'], ['Gruyère râpé (<b>lait</b>)', '90 g'], ['Chapelure (<b>blé</b>)', '40 g'], ['Moutarde de Dijon (<b>moutarde</b>)', '1 c. à s.']]
      ).map(([n, q]) => `<li><span>${n}</span><span class="num muted">${q}</span></li>`).join('')}</ul>
      <p class="small muted" style="margin-top:12px">${L('Allergens are in bold, as on food labels. Filter based on the ingredients entered; not medical advice.', "Les allergènes sont en gras, comme sur les emballages. Filtre basé sur les ingrédients saisis ; ne remplace pas un avis médical.")}</p>
    </div>
    <div class="bottom"><button class="btn secondary">${L('Open original recipe', "Ouvrir la recette d'origine")}</button></div>`,

  list: (L) => {
    const aisles = L(
      [['Dairy and eggs', [['carton', 'Heavy cream', '1 half-pint', 'All used · Mon orzo, Wed gratin', 'used'], ['eggs', 'Eggs', '1 box of 6', '4 for Fri · 2 left over', 'rest'], ['block', 'Feta', '1 block (8 oz)', 'All used · Fri', 'used']]], ['Produce', [['bunch', 'Leeks', '1 bunch (3)', 'Wed gratin', ''], ['bag', 'Baby spinach', '1 bag (5 oz)', 'All used · Thu, Fri', 'used', true], ['tray', 'Cremini mushrooms', '1 pack (8 oz)', 'Mon orzo', '', true]]], ['Pantry', [['can', 'Coconut milk', '1 can (13.5 oz)', 'All used · Tue dal, Thu curry', 'used']]]],
      [['Crèmerie et œufs', [['carton', 'Crème fraîche épaisse', '1 pot 20 cl', 'Tout utilisé · lun. orzo, mer. gratin', 'used'], ['eggs', 'Œufs', '1 boîte de 6', '4 pour ven. · reste 2', 'rest'], ['block', 'Feta', '1 bloc 200 g', 'Tout utilisé · ven.', 'used']]], ['Fruits et légumes', [['bunch', 'Poireaux', '1 botte (3)', 'mer. gratin', ''], ['bag', "Pousses d'épinard", '1 sachet 125 g', 'Tout utilisé · jeu., ven.', 'used', true], ['tray', 'Champignons de Paris', '1 barquette 250 g', 'lun. orzo', '', true]]], ['Épicerie', [['can', 'Lait de coco', '1 boîte 400 ml', 'Tout utilisé · mar. dal, jeu. curry', 'used']]]]);
    return `
    <div class="nav"><span></span><div style="display:flex;gap:8px"><button class="btn-icon glass">${icon('share')}</button></div></div>
    <div class="scroll">
      <h1 class="title">${L('Shopping list', 'Courses')}</h1>
      <p class="subtitle" style="display:flex;align-items:center;gap:8px"><span style="display:inline-flex"><span style="width:22px;height:22px;border-radius:11px;background:var(--ink);color:var(--on-ink);font-size:11px;display:grid;place-items:center;font-weight:600">J</span><span style="width:22px;height:22px;border-radius:11px;background:var(--strand);color:#1E1A16;font-size:11px;display:grid;place-items:center;font-weight:600;margin-left:-6px;box-shadow:0 0 0 2px var(--paper)">S</span></span>${L('Shared with Sam · 7 packs', 'Partagée avec Sam · 7 paquets')}</p>
      ${aisles.map(([a, rows]) => `<div class="section-label">${a}</div><div class="group">${rows.map(([ic, n, q, why, k, done]) => `<div class="list-row ${done ? 'done' : ''}"><span class="check ${done ? 'on' : ''}">${done ? icon('check', 14, 2.4) : ''}</span><div><div class="item">${n}</div><div class="why ${k === 'used' ? 'used' : ''}">${k === 'used' ? `<svg width="14" height="8" viewBox="0 0 14 8" style="margin-right:4px"><path d="M1 4 C 5 0 9 8 13 4" fill="none" stroke="var(--strand)" stroke-width="2" stroke-linecap="round"/></svg>` : ''}${why}</div>${k === 'rest' ? `<div class="gauge" style="width:120px;height:6px"><i style="flex:4"></i><i class="rest" style="flex:2"></i></div>` : ''}</div><span class="qty">${q}</span></div>`).join('')}</div>`).join('')}
    </div>${tabbar(L, 'list')}`;
  },

  listEmpty: (L) => `
    <div class="nav"><span></span><span></span></div>
    <div class="scroll">
      <h1 class="title">${L('Shopping list', 'Courses')}</h1>
      <div class="empty">
        <svg width="120" height="104" viewBox="0 0 120 104" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M22 34h76l-6 58H28z"/><path d="M44 34v-6a16 16 0 0 1 32 0v6"/><path d="M40 56h40M40 70h26" stroke-dasharray="3 6"/></svg>
        <h2 class="h2">${L('Nothing to buy yet', 'Rien à acheter pour le moment')}</h2>
        <p>${L('Your list fills itself once the week is planned, in packs you can find on the shelf.', 'La liste se remplit dès que la semaine est composée, en paquets que vous trouverez en rayon.')}</p>
        <button class="btn secondary" style="width:auto;padding:0 24px;margin-top:8px">${L('Plan my week', 'Composer ma semaine')}</button>
      </div>
    </div>${tabbar(L, 'list')}`,

  paywall: (L) => `
    <div class="nav"><button class="btn-icon" style="background:var(--surface);width:32px;height:32px;border-radius:16px;margin-left:6px">${icon('x', 16, 2)}</button><button class="text-btn small" style="font-size:15px;color:var(--ink-2)">${L('Restore', 'Restaurer')}</button></div>
    <div class="scroll" style="padding-bottom:0">
      <h1 class="title">${L('Keep planning after this week', 'Continuez après cette semaine')}</h1>
      <p class="subtitle" style="font-size:16px;margin-top:8px">${L('Your first plan and list stay yours. Nextover Pro plans every week from here.', 'Votre premier plan et sa liste restent à vous. Nextover Pro compose toutes les semaines suivantes.')}</p>
      <ul style="list-style:none;margin:20px 0;display:grid;gap:12px;font-size:16px">${L(
        ['Unlimited recipes (free: 15)', 'A new plan and list every week', 'One shared list for the household', 'Family Sharing: up to 6 people, one subscription'],
        ['Recettes illimitées (gratuit : 15)', 'Un nouveau plan et sa liste chaque semaine', 'Une liste partagée pour tout le foyer', "Partage familial : jusqu'à 6 personnes, un seul abonnement"]
      ).map((b) => `<li style="display:grid;grid-template-columns:22px 1fr;gap:10px"><span>${icon('check', 20, 2)}</span>${b}</li>`).join('')}</ul>
      <div style="display:grid;gap:10px">
        <div class="plan-card on"><div><div class="label" style="font-weight:500">${L('Yearly', 'Annuel')}</div><div class="small muted num">${L('7 days free · $2.92 a month', '7 jours gratuits · 2,50 € par mois')}</div></div><div class="price">${L('$34.99', '29,99 €')}<div class="small muted" style="font:400 13px var(--sf)">${L('per year', 'par an')}</div></div></div>
        <div class="plan-card"><div><div class="label" style="font-weight:500">${L('Monthly', 'Mensuel')}</div><div class="small muted">${L('No trial', "Sans essai")}</div></div><div class="price">${L('$6.99', '5,99 €')}<div class="small muted" style="font:400 13px var(--sf)">${L('per month', 'par mois')}</div></div></div>
      </div>
    </div>
    <div class="bottom" style="background:var(--paper)">
      <button class="btn primary">${L('Start 7-day free trial', "Démarrer l'essai de 7 jours")}</button>
      <p class="small muted" style="text-align:center">${L("We'll remind you 2 days before the trial ends.", "Nous vous prévenons 2 jours avant la fin de l'essai.")}</p>
      <p class="legal" style="text-align:center">${L('$34.99 billed yearly after the free trial. Renews automatically unless cancelled at least 24 hours before the period ends. Manage or cancel in Settings › Apple Account.', "29,99 € facturés chaque année après l'essai. Renouvellement automatique sauf résiliation au moins 24 h avant la fin de la période. Gérez ou résiliez dans Réglages › Compte Apple.")} <a>${L('Terms', 'CGU')}</a> · <a>${L('Privacy', 'Confidentialité')}</a></p>
    </div>`,

  settings: (L) => `
    <div class="nav"><button class="btn-icon glass">${icon('chevL')}</button><span></span><span style="width:44px"></span></div>
    <div class="scroll">
      <h1 class="title">${L('Settings', 'Réglages')}</h1>
      <div class="section-label">${L('Household', 'Foyer')}</div>
      <div class="group">
        <div class="row"><span class="grow label">${L('People and meals', 'Personnes et repas')}</span><span class="detail">${L('5 · 5 dinners', '5 · 5 dîners')}</span><span class="chev">${icon('chevR', 18)}</span></div>
        <div class="row"><span class="grow label">${L('Allergies', 'Allergies')}</span><span class="detail">${L('Peanuts, tree nuts', 'Arachides, fruits à coque')}</span><span class="chev">${icon('chevR', 18)}</span></div>
        <div class="row"><span class="grow label">${L('Diets and equipment', 'Régimes et équipement')}</span><span class="chev">${icon('chevR', 18)}</span></div>
        <div class="row"><span class="grow label">${L('Shared with', 'Partagé avec')}</span><span class="detail">Sam</span><span class="chev">${icon('chevR', 18)}</span></div>
      </div>
      <div class="section-label">${L('Subscription', 'Abonnement')}</div>
      <div class="group">
        <div class="row"><div class="grow"><div class="label">Nextover Pro</div><div class="detail num">${L('Yearly · renews Nov 21, 2027', 'Annuel · renouvelé le 21 nov. 2027')}</div></div><span class="chev">${icon('chevR', 18)}</span></div>
        <div class="row"><span class="grow label">${L('Restore purchases', 'Restaurer les achats')}</span></div>
      </div>
      <div class="section-label">${L('Privacy', 'Confidentialité')}</div>
      <div class="group">
        <div class="row"><div class="grow"><div class="label">${L('Ask before using the AI reader', "Demander avant d'utiliser le lecteur IA")}</div><div class="detail small">${L('For captions and screenshots', 'Pour les légendes et les captures')}</div></div><span class="toggle on"></span></div>
        <div class="row"><span class="grow label">${L('Terms of use', "Conditions d'utilisation")}</span><span class="chev">${icon('chevR', 18)}</span></div>
        <div class="row"><span class="grow label">${L('Privacy policy', 'Politique de confidentialité')}</span><span class="chev">${icon('chevR', 18)}</span></div>
      </div>
      <div class="group" style="margin-top:28px"><div class="row"><span class="grow label" style="color:var(--chili)">${L('Delete account', 'Supprimer le compte')}</span></div></div>
      <p class="small muted" style="margin-top:8px">${L('Deletes your recipes, household and list from our servers. Your subscription is managed by Apple.', "Supprime vos recettes, votre foyer et votre liste de nos serveurs. L'abonnement est géré par Apple.")}</p>
    </div>`,

  offline: (L) => SCREENS.list(L).replace('<div class="scroll">', `<div class="scroll"><div class="banner" style="margin-bottom:8px">${icon('wifiOff', 20)}<span>${L("You're offline. The list still works; ticks sync when you're back.", 'Hors ligne. La liste fonctionne ; les coches se synchronisent au retour du réseau.')}</span></div>`),

  limit: (L) => `${SCREENS.box(L)}<div class="scrim"></div>
    <div class="sheet"><div class="grabber"></div>
      <div style="display:grid;grid-template-columns:44px 1fr;gap:12px;align-items:start;margin-top:4px"><span class="ic" style="width:44px;height:44px;border-radius:12px;background:var(--surface);display:grid;place-items:center">${icon('clock')}</span><div><h2 class="h2">${L("That's 50 imports today", "50 imports aujourd'hui")}</h2><p class="muted" style="font-size:15px;margin-top:4px">${L("It's the daily limit. Links you paste now are kept and imported tomorrow morning.", "C'est la limite quotidienne. Les liens collés maintenant sont gardés et importés demain matin.")}</p></div></div>
      <button class="btn primary" style="margin-top:20px">${L('Keep for tomorrow', 'Garder pour demain')}</button>
    </div>`,
};

const FLOWS = [
  { id: 'onboarding', title: { en: 'Onboarding', fr: 'Accueil' }, note: "Le mécanisme du produit dès le premier écran (guideline 4.3), et ce qui est gratuit dit avant toute demande.", screens: [['welcome', 'Premier lancement'], ['how', 'Comment ça marche']] },
  { id: 'household', title: { en: 'Household', fr: 'Foyer' }, note: "Allergies et régimes sont des règles. Les 14 allergènes réglementaires UE (le sésame en fait partie, il couvre aussi la liste US).", screens: [['household', 'Personnes et repas'], ['allergies', 'Allergies'], ['diets', 'Régimes et équipement']] },
  { id: 'recipes', title: { en: 'Recipes and import', fr: 'Recettes et import' }, note: "Rien n'est réécrit. Ce qui manque est marqué « à vérifier », l'inconnu reste tel quel. Une recette exclue est visible, avec son motif.", screens: [['boxEmpty', 'Boîte vide'], ['box', 'Boîte à recettes'], ['importSheet', "Choisir l'import"], ['importLoading', 'Lecture en cours'], ['importReview', 'Revue avant ajout'], ['recipe', 'Détail de recette']] },
  { id: 'week', title: { en: 'Week plan', fr: 'Semaine' }, note: "Le brin relie le paquet entamé au repas qui le finit. Changer un repas classe les remplaçants selon ce qu'ils réutilisent.", screens: [['planLoading', 'Composition'], ['plan', 'Plan de la semaine'], ['swap', 'Changer un repas']] },
  { id: 'list', title: { en: 'Shopping list', fr: 'Courses' }, note: "Des paquets réels, groupés par rayon, avec le repas qui les finit. Un reste est montré, pas caché.", screens: [['list', 'Liste partagée'], ['listEmpty', 'Liste vide']] },
  { id: 'paywall', title: { en: 'Subscription and settings', fr: 'Abonnement et réglages' }, note: "Le paywall n'apparaît qu'après le premier plan et sa liste. Prix, durée, renouvellement et restauration visibles (3.1.2). Suppression du compte dans l'app (5.1.1).", screens: [['paywall', 'Paywall'], ['settings', 'Réglages']] },
  { id: 'states', title: { en: 'Errors and limits', fr: 'Erreurs et limites' }, note: "Chaque erreur dit quoi faire ensuite.", screens: [['importError', 'Page sans recette'], ['offline', 'Hors ligne'], ['limit', 'Limite de 50 imports']] },
];

const L_FOR = (lang) => (en, fr) => (lang === 'fr' ? fr : en);
