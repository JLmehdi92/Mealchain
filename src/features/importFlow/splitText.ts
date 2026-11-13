import type { RawRecipe } from '../import/jsonld';
import { parseIngredientLine } from '../import/parseLine';

type Section = 'none' | 'ingredients' | 'steps';

const INGREDIENTS = /^ingr[ée]dients?\s*:?$/i;
const STEPS = /^(?:steps?|instructions?|directions?|method|pr[ée]paration|[ée]tapes?)\s*:?$/i;
const BULLET = /^[-•*–▪·]\s*/;
const NUMBERED = /^\d+[.)]\s+/;
const MAX_TITLE = 60;

const headerOf = (line: string): Section | null => (INGREDIENTS.test(line) ? 'ingredients' : STEPS.test(line) ? 'steps' : null);
const hasQuantity = (line: string) => parseIngredientLine(line).qty !== null;
const CLOCK = /^\d{1,2}:\d{2}$/;
const isNoise = (line: string) =>
  CLOCK.test(line) || (!/[aeiouyàâäéèêëîïôöùûüœæ]/i.test(line) && /[^\p{L}\p{N}\s]/u.test(line) && !hasQuantity(line));

function titleOf(first: string | undefined): string | undefined {
  if (!first || first.length > MAX_TITLE || headerOf(first) || NUMBERED.test(first) || first.startsWith('#')) return undefined;
  return hasQuantity(first.replace(BULLET, '')) ? undefined : first;
}

export function splitText(text: string): RawRecipe {
  const lines = text.split('\n').map((line) => line.trim()).filter(Boolean);
  const start = lines.findIndex((line) => !isNoise(line));
  if (start > 0) lines.splice(0, start);
  const title = titleOf(lines[0]);
  const ingredients: string[] = [];
  const steps: string[] = [];
  let section: Section = 'none';
  for (const line of title ? lines.slice(1) : lines) {
    const header = headerOf(line);
    if (header) section = header;
    else if (line.startsWith('#')) continue;
    else if (section === 'ingredients') ingredients.push(line.replace(BULLET, ''));
    else if (section === 'steps') steps.push(line.replace(BULLET, '').replace(NUMBERED, ''));
    else if (NUMBERED.test(line)) steps.push(line.replace(NUMBERED, ''));
    else if (hasQuantity(line.replace(BULLET, ''))) ingredients.push(line.replace(BULLET, ''));
  }
  return { title, ingredients, steps, sourceUrl: '' };
}
