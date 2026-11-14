import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { selectSamples } from './selectSamples.ts';

// Each line below was read by a person and its catalog match checked against the source wording.
const REVIEWED = new Set([
  '1 top sirloin steak (also known as a top butt and center cut sirloin steak)',
  '300 ml chicken stock or water',
  '6 medium-sized potatoes',
  '4 (6-ounce) (170 g) center-cut salmon fillets',
  '2 cups raw shelled and skinned peanuts',
  '1 teaspoon ground cayenne pepper',
  '½ teaspoon ground paprika',
  '3 cups freshly grated Parmesan cheese',
  '2 cups low-fat sour cream',
  '5 large egg yolks',
  '7 large egg whites',
  '225–500 g (½–1 pound) guanciale or pancetta',
  '5 egg yolks',
  '178 ml (¾ cup) grated Pecorino Romano cheese',
  '178 ml (¾ cup) grated Parmigiano-Reggiano cheese',
  '½ tablespoon freshly-ground pepper',
  'Freshly-ground black pepper',
  'Freshly ground black pepper',
  'sel et poivre du moulin',
  '250 g de champignons de saisons (cèpes, girolles, chanterelles... ou champignons de Paris)',
  "100 g de fromage frais à l'ail et aux fines herbes (type Boursin)",
  '150 g de Bleu de Gex très persillé',
  '2 blancs d’œufs',
  '1 kg de tomates bien mûres, pelées, épépinées et coupées en morceaux',
  '2 blancs de poireaux taillés en fines lamelles',
]);
const TARGETS = { en: 30, fr: 20 };

const [candidatesDir] = process.argv.slice(2);
if (!candidatesDir) throw new Error('usage: npx tsx scripts/buildSamples.mjs <candidates dir>');
for (const language of ['en', 'fr']) {
  const candidates = JSON.parse(readFileSync(join(candidatesDir, `candidates-${language}.json`), 'utf8'));
  const samples = selectSamples(candidates, REVIEWED, TARGETS[language]).map(
    ({ title, servings, totalMinutes, ingredients, steps, sourceUrl, sourceName, license, author, confirmed }) =>
      ({ title, servings, totalMinutes, ingredients, steps, sourceUrl, sourceName, license, author, confirmed }),
  );
  writeFileSync(join(dirname(fileURLToPath(import.meta.url)), '..', 'data', `samples-${language}.json`), `${JSON.stringify(samples, null, 1)}\n`);
  console.log(language, samples.length, samples.map((s) => s.title).join(' | '));
}
