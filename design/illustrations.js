const ILLU = {
  ceramic: '#D5CBC6', ceramicDark: '#C2B6B0', cream: '#F1E6CF', grain: '#E7D3A8', crust: '#D9A85B',
  crustDark: '#B98238', mushroom: '#9C7B63', leaf: '#3E9A62', leek: '#BFD8A6', can: '#C9C2BE',
};

const halfDisc = (cx, cy, r, side, fill) => side === 'l'
  ? `<path d="M${cx} ${cy - r} A ${r} ${r} 0 0 0 ${cx} ${cy + r} Z" fill="${fill}"/>`
  : `<path d="M${cx} ${cy - r} A ${r} ${r} 0 0 1 ${cx} ${cy + r} Z" fill="${fill}"/>`;

function cartonHalf(side, label) {
  const body = side === 'l'
    ? `<path d="M2 30 L31 30 L31 108 L8 108 Q2 108 2 102 Z" fill="var(--sheet)"/><path d="M2 30 L14 6 L31 6 L31 30 Z" fill="${ILLU.ceramic}"/>`
    : `<path d="M31 30 L60 30 L60 102 Q60 108 54 108 L31 108 Z" fill="var(--sheet)"/><path d="M31 6 L48 6 L60 30 L31 30 Z" fill="${ILLU.ceramicDark}"/><rect x="38" y="0" width="6" height="7" rx="1.5" fill="${ILLU.ceramicDark}"/>`;
  const band = side === 'l'
    ? `<rect x="2" y="52" width="29" height="30" fill="var(--strand)"/>${halfDisc(24, 67, 8, 'l', 'var(--sheet)')}`
    : `<rect x="31" y="52" width="29" height="30" fill="var(--strand)"/>${halfDisc(38, 67, 8, 'r', 'var(--sheet)')}`;
  return `<g class="carton-${side}">${body}${band}<text x="${side === 'l' ? 16 : 46}" y="98" font-size="9" text-anchor="middle" fill="var(--ink-2)" font-family="var(--mono)">${label}</text></g>`;
}

function orzoPlate(cx, cy) {
  const grains = [[-18, -6, 20], [-8, -14, -30], [4, -10, 40], [14, -2, -10], [-14, 6, 60], [-2, 2, 10], [10, 10, -50], [-6, 14, 30], [18, 12, 80], [0, -20, 0], [22, -12, 30], [-22, 14, -40]];
  return `<g class="plate-mon"><circle cx="${cx}" cy="${cy + 4}" r="54" fill="${ILLU.ceramicDark}" opacity=".5"/><circle cx="${cx}" cy="${cy}" r="54" fill="var(--sheet)"/><circle cx="${cx}" cy="${cy}" r="42" fill="${ILLU.cream}"/>
    ${grains.map(([x, y, r]) => `<ellipse cx="${cx + x}" cy="${cy + y}" rx="4.6" ry="2.2" transform="rotate(${r} ${cx + x} ${cy + y})" fill="${ILLU.grain}"/>`).join('')}
    ${[[-10, -2], [12, -14], [6, 16]].map(([x, y]) => `<path d="M${cx + x - 7} ${cy + y} a7 6 0 0 1 14 0 Z" fill="${ILLU.mushroom}"/><rect x="${cx + x - 2}" y="${cy + y}" width="4" height="5" rx="1.5" fill="${ILLU.mushroom}"/>`).join('')}
    ${[[-24, -16], [20, 4], [-4, 24], [26, -22], [-28, 4]].map(([x, y]) => `<circle cx="${cx + x}" cy="${cy + y}" r="2.2" fill="${ILLU.leaf}"/>`).join('')}</g>`;
}

function gratinDish(x, y) {
  return `<g class="dish-wed"><rect x="${x}" y="${y + 6}" width="122" height="80" rx="22" fill="${ILLU.ceramicDark}" opacity=".5"/><rect x="${x}" y="${y}" width="122" height="80" rx="22" fill="var(--sheet)"/>
    <rect x="${x - 8}" y="${y + 30}" width="12" height="20" rx="6" fill="var(--sheet)"/><rect x="${x + 118}" y="${y + 30}" width="12" height="20" rx="6" fill="var(--sheet)"/>
    <rect x="${x + 10}" y="${y + 10}" width="102" height="60" rx="14" fill="${ILLU.crust}"/>
    ${[[24, 22, 7], [52, 18, 5], [84, 26, 8], [36, 50, 6], [70, 48, 7], [96, 54, 5]].map(([dx, dy, r]) => `<circle cx="${x + dx}" cy="${y + dy}" r="${r}" fill="${ILLU.crustDark}" opacity=".55"/>`).join('')}
    ${[[44, 34], [62, 30], [80, 40], [30, 38]].map(([dx, dy]) => `<circle cx="${x + dx}" cy="${y + dy}" r="5.5" fill="none" stroke="${ILLU.leek}" stroke-width="3"/>`).join('')}</g>`;
}

function welcomeScene(L) {
  return `<svg class="illu welcome-scene" viewBox="0 0 337 290" width="337" height="290" aria-hidden="true">
    <path class="trail trail-l" d="M138 150 C 118 162 100 160 88 150" fill="none" stroke="var(--strand)" stroke-width="2.5" stroke-linecap="round" stroke-dasharray="1 7"/>
    <path class="trail trail-r" d="M212 142 C 236 150 250 162 256 182" fill="none" stroke="var(--strand)" stroke-width="2.5" stroke-linecap="round" stroke-dasharray="1 7"/>
    ${orzoPlate(76, 214)}
    ${gratinDish(198, 190)}
    <g transform="translate(128 0) scale(1.3)">${cartonHalf('l', L('4 oz', '10 cl'))}<g class="carton-r-wrap" transform="translate(10 -6)">${cartonHalf('r', L('4 oz', '10 cl'))}</g></g>
    <text x="76" y="284" text-anchor="middle" font-size="13" fill="var(--ink-2)">${L('Monday · orzo', 'lundi · orzo')}</text>
    <text x="259" y="284" text-anchor="middle" font-size="13" fill="var(--ink-2)">${L('Wednesday · gratin', 'mercredi · gratin')}</text>
  </svg>`;
}

function boxScene() {
  const card = (x, y, rot, chip) => `<g class="rcard" transform="rotate(${rot} ${x + 30} ${y + 40})"><rect x="${x}" y="${y}" width="60" height="78" rx="9" fill="var(--sheet)"/><rect x="${x + 9}" y="${y + 12}" width="34" height="5" rx="2.5" fill="var(--ink)" opacity=".75"/><rect x="${x + 9}" y="${y + 23}" width="42" height="4" rx="2" fill="var(--ink-2)" opacity=".35"/><rect x="${x + 9}" y="${y + 32}" width="30" height="4" rx="2" fill="var(--ink-2)" opacity=".35"/>${chip ? halfDisc(x + 42, y + 58, 8, 'l', 'var(--ink)') + halfDisc(x + 47, y + 55, 8, 'r', 'var(--strand)') : ''}</g>`;
  const sideCard = (x, y, rot, band) => `<g class="rcard" transform="rotate(${rot} ${x + 30} ${y + 40})"><rect x="${x}" y="${y}" width="60" height="78" rx="9" fill="var(--sheet)"/><path d="M${x} ${y + 9} a9 9 0 0 1 9-9 h42 a9 9 0 0 1 9 9 v13 h-60z" fill="${band}"/></g>`;
  return `<svg class="illu box-scene" viewBox="0 0 240 180" width="240" height="180" aria-hidden="true">
    <g class="src src-link"><rect x="18" y="20" width="58" height="26" rx="13" fill="var(--sheet)"/><path d="M36 35 l6-6 M33 31 l-3 3 a3.5 3.5 0 0 0 5 5 l3-3 M45 30 l3-3 a3.5 3.5 0 0 0-5-5 l-3 3" stroke="var(--ink)" stroke-width="1.8" fill="none" stroke-linecap="round"/><rect x="52" y="30" width="16" height="4" rx="2" fill="var(--ink-2)" opacity=".4"/></g>
    <g class="src src-caption"><path d="M168 14 h48 a10 10 0 0 1 10 10 v14 a10 10 0 0 1-10 10 h-30 l-8 8 v-8 h-10 a10 10 0 0 1-10-10 v-14 a10 10 0 0 1 10-10z" fill="var(--sheet)"/><rect x="170" y="24" width="40" height="4" rx="2" fill="var(--ink-2)" opacity=".45"/><rect x="170" y="33" width="28" height="4" rx="2" fill="var(--ink-2)" opacity=".45"/></g>
    <g class="src src-shot"><rect x="104" y="4" width="32" height="54" rx="7" fill="var(--ink)"/><rect x="107" y="10" width="26" height="42" rx="4" fill="var(--sheet)"/><rect x="111" y="16" width="18" height="12" rx="2" fill="${ILLU.crust}"/><rect x="111" y="32" width="18" height="3" rx="1.5" fill="var(--ink-2)" opacity=".45"/><rect x="111" y="39" width="12" height="3" rx="1.5" fill="var(--ink-2)" opacity=".45"/></g>
    <rect x="44" y="96" width="152" height="18" rx="6" fill="${ILLU.ceramicDark}"/>
    ${sideCard(62, 64, -9, ILLU.crust)}${sideCard(122, 66, 10, ILLU.leaf)}${card(92, 56, 2, true)}
    <path d="M38 108 h164 l-8 58 a12 12 0 0 1-12 10 h-124 a12 12 0 0 1-12-10z" fill="${ILLU.ceramic}"/>
    <rect x="102" y="128" width="36" height="12" rx="6" fill="var(--sheet)" opacity=".8"/>
  </svg>`;
}

function bagScene() {
  return `<svg class="illu bag-scene" viewBox="0 0 220 180" width="220" height="180" aria-hidden="true">
    <g class="peek peek-leek"><rect x="132" y="22" width="12" height="70" rx="6" fill="${ILLU.leek}" transform="rotate(12 138 60)"/><path d="M140 26 q14-22 26-20 q-6 16-20 28z" fill="${ILLU.leaf}"/><path d="M134 24 q-6-24 4-30 q6 16 2 32z" fill="${ILLU.leaf}"/></g>
    <g class="peek peek-carton"><path d="M66 40 l6-14 h22 l6 14 v50 h-34z" fill="var(--sheet)"/><path d="M66 40 l6-14 h22 l6 14z" fill="${ILLU.ceramicDark}"/><rect x="66" y="52" width="34" height="18" fill="var(--strand)"/>${halfDisc(80, 61, 5, 'l', 'var(--sheet)')}${halfDisc(86, 59, 5, 'r', 'var(--sheet)')}</g>
    <g class="peek peek-can"><rect x="102" y="46" width="30" height="44" rx="4" fill="${ILLU.can}"/><rect x="102" y="56" width="30" height="22" fill="${ILLU.cream}"/><ellipse cx="117" cy="46" rx="15" ry="4" fill="${ILLU.ceramicDark}"/></g>
    <path d="M78 78 c0-34 64-34 64 0" fill="none" stroke="${ILLU.ceramicDark}" stroke-width="7" stroke-linecap="round"/>
    <path d="M40 80 h140 l-12 84 a10 10 0 0 1-10 8 h-96 a10 10 0 0 1-10-8z" fill="${ILLU.ceramic}"/>
    <path d="M40 80 h140 l-2 12 h-136z" fill="${ILLU.ceramicDark}"/>
    ${halfDisc(106, 130, 12, 'l', 'var(--sheet)')}${halfDisc(113, 125, 12, 'r', 'var(--strand)')}
  </svg>`;
}

function pageScene() {
  return `<svg class="illu page-scene" viewBox="0 0 200 180" width="200" height="180" aria-hidden="true">
    <rect x="44" y="18" width="112" height="146" rx="12" fill="var(--sheet)"/>
    <rect x="58" y="32" width="84" height="40" rx="6" fill="${ILLU.ceramic}"/>
    <rect x="58" y="82" width="60" height="6" rx="3" fill="var(--ink)" opacity=".7"/>
    <rect x="58" y="98" width="84" height="44" rx="6" fill="none" stroke="var(--ink-2)" stroke-width="1.5" stroke-dasharray="4 5" opacity=".7"/>
    <g class="lens"><circle cx="128" cy="124" r="22" fill="var(--paper)" opacity=".85"/><circle cx="128" cy="124" r="22" fill="none" stroke="var(--ink)" stroke-width="5"/><path d="M144 140 l16 16" stroke="var(--ink)" stroke-width="7" stroke-linecap="round"/><rect x="118" y="122" width="20" height="4" rx="2" fill="var(--ink-2)" opacity=".4"/></g>
  </svg>`;
}

const PACK_THUMB = {
  carton: `<path d="M20 22 l5-11 h14 l5 11 v30 h-24z" fill="var(--sheet)"/><path d="M20 22 l5-11 h14 l5 11z" fill="${ILLU.ceramicDark}"/><rect x="20" y="30" width="24" height="12" fill="var(--strand)"/>`,
  can: `<rect x="19" y="18" width="26" height="34" rx="4" fill="${ILLU.can}"/><rect x="19" y="26" width="26" height="16" fill="${ILLU.cream}"/><ellipse cx="32" cy="18" rx="13" ry="3.5" fill="${ILLU.ceramicDark}"/>`,
  jar: `<rect x="22" y="12" width="20" height="7" rx="2" fill="${ILLU.mushroom}"/><path d="M21 19 h22 q4 4 4 10 v20 a4 4 0 0 1-4 4 h-22 a4 4 0 0 1-4-4 v-20 q0-6 4-10z" fill="#B8462F"/><rect x="21" y="30" width="22" height="12" rx="2" fill="${ILLU.cream}"/>`,
  eggs: `<ellipse cx="25" cy="30" rx="7" ry="9" fill="${ILLU.cream}"/><ellipse cx="39" cy="30" rx="7" ry="9" fill="${ILLU.cream}"/><path d="M12 34 h40 l-4 16 a4 4 0 0 1-4 3 h-24 a4 4 0 0 1-4-3z" fill="${ILLU.ceramicDark}"/>`,
  bunch: `<rect x="24" y="24" width="7" height="30" rx="3.5" fill="${ILLU.leek}"/><rect x="33" y="22" width="7" height="32" rx="3.5" fill="${ILLU.leek}"/><path d="M27 26 q-8-14 0-18 q4 10 0 18z M36 24 q8-14 14-12 q-4 10-14 12z" fill="${ILLU.leaf}"/>`,
  bag: `<path d="M16 22 h32 l-3 30 h-26z" fill="${ILLU.leaf}"/><path d="M16 22 h32 l-1 6 h-30z" fill="#2F7A4C"/><circle cx="32" cy="38" r="5" fill="${ILLU.leek}"/>`,
  tray: `<path d="M12 36 h40 l-4 14 h-32z" fill="${ILLU.ceramicDark}"/><path d="M20 36 a6 5 0 0 1 12 0z M30 36 a7 6 0 0 1 14 0z" fill="${ILLU.mushroom}"/>`,
  block: `<path d="M14 30 l18-9 l18 9 l-18 9z" fill="${ILLU.cream}"/><path d="M14 30 v10 l18 9 v-10z" fill="${ILLU.grain}"/><path d="M50 30 v10 l-18 9 v-10z" fill="#D8C9A0"/>`,
};
const packThumb = (k) => `<svg width="64" height="64" viewBox="0 0 64 64" aria-hidden="true">${PACK_THUMB[k]}</svg>`;
