import { writeFileSync } from 'node:fs';

const roots = {
  whole: ['tot', 'tout', 'fin', 'fini', 'omni', 'plen', 'enti', 'tota', 'tut'],
  next: ['seq', 'suiv', 'nex', 'link', 'lien', 'rela', 'tand', 'domi', 'mail', 'rico', 'sui', 'relé'],
  kitchen: ['mijo', 'pot', 'pan', 'plat', 'cui', 'louch', 'zest', 'grat', 'tabl', 'boca', 'cocott', 'mi', 'miam', 'sauc', 'pinc'],
  pack: ['pak', 'paq', 'brik', 'tin', 'box', 'boc'],
  rest: ['rest', 'rem', 'miet'],
  loop: ['loo', 'boucl', 'roul', 'tour', 'rond', 'orb', 'cycl'],
  play: ['jongl', 'dom', 'trico', 'coda', 'repri', 'encor', 'relay', 'piste', 'hop', 'ricoch'],
};

const endings = ['a', 'o', 'i', 'e', 'é', 'ée', 'ette', 'et', 'ola', 'ino', 'ina', 'ita', 'ito', 'on', 'el', 'elle', 'oo', 'ou', 'ra', 'ro', 'va', 'ova', 'um', 'ix', 'ka', 'ko', 'ta', 'to', 'mi', 'po', 'lo', 'la', 'ly'];
const banned = /(ify|ly$|io$|ai$|smart|chef|genie|wise|meal|plan|recipe)/;
const clusters = /[bcdfghjklmnpqrstvwxz]{3,}|(.)\1\1|[aeiouéy]{3,}|ii|uu|q[^u]/;

const seen = new Set();
const out = [];
for (const [field, list] of Object.entries(roots)) {
  for (const root of list) {
    for (const end of endings) {
      const joined = root.endsWith(end[0]) && /[aeiouéy]/.test(end[0]) ? root + end.slice(1) : root + end;
      const name = joined.charAt(0).toUpperCase() + joined.slice(1);
      const plain = joined.normalize('NFD').replace(/[̀-ͯ]/g, '');
      if (plain.length < 4 || plain.length > 8 || banned.test(plain) || clusters.test(plain) || seen.has(plain)) continue;
      seen.add(plain);
      out.push({ name, field, root, end });
    }
  }
}
writeFileSync(new URL('candidates.json', import.meta.url), JSON.stringify(out, null, 1));
console.log(`${out.length} candidats générés depuis ${Object.values(roots).flat().length} racines × ${endings.length} terminaisons`);
