import type { RecipeUnit } from '../ingredients/units';

export type ParsedLine = { qty: number | null; unit: RecipeUnit | null; name: string };

const FRACTIONS: Record<string, string> = {
  '½': '1/2', '¼': '1/4', '¾': '3/4', '⅓': '1/3', '⅔': '2/3', '⅛': '1/8', '⅜': '3/8', '⅝': '5/8', '⅞': '7/8',
  '⅕': '1/5', '⅖': '2/5', '⅗': '3/5', '⅘': '4/5', '⅙': '1/6', '⅚': '5/6',
};
const FRACTION_CHARS = new RegExp(`[${Object.keys(FRACTIONS).join('')}]`, 'g');
const THOUSANDS = /^\d{1,3}(?:,\d{3})+(?!\d)/;
const AMBIGUOUS_NAME = /^[x×](?![\p{L}])|\d/u;
const NUM = String.raw`\d+\/\d+|\d+(?:[.,]\d+)?(?:\s+\d+\/\d+)?`;
const QTY = new RegExp(String.raw`^(${NUM})(?:\s*(?:-|–|to|à)\s*(${NUM}))?\s*`, 'i');
const CONTAINER = String.raw`(?:cans?|jars?|packages?|box(?:es)?|bags?|bottles?|tins?|cartons?|boîtes?|bocaux|bocal)`;
const PACK = new RegExp(String.raw`^\(\s*(${NUM})\s*-?\s*([^)]*?)\s*\)\s*(?:${CONTAINER}(?![\p{L}])\s*)?`, 'iu');
const TASTE = String.raw`to taste|as needed|au goût|à volonté|selon (?:votre )?goût|(?:a\s+)?pinch\s+of|(?:une\s+)?pincée\s+(?:de\s+|d['’])?`;
const LINKER = /^(?:de\s+|d['’]\s*|of\s+)/i;

const unitRule = (alias: string, unit: RecipeUnit, flags = 'iu'): [RegExp, RecipeUnit] =>
  [new RegExp(String.raw`^(?:${alias})\.?(?![\p{L}-])\s*`, flags), unit];

const UNIT_RULES = [
  unitRule(String.raw`fl\.?\s*oz|fluid\s+ounces?`, 'fl_oz'),
  unitRule(String.raw`tablespoons?|tbsps?|tbs|c\.?\s*à\.?\s*s(?:oupe)?|cuill[eè]res?\s+à\s+soupe|cs`, 'tbsp'),
  unitRule('T', 'tbsp', 'u'),
  unitRule(String.raw`teaspoons?|tsps?|c\.?\s*à\.?\s*c(?:af[ée])?|cuill[eè]res?\s+à\s+caf[ée]|cc`, 'tsp'),
  unitRule('t', 'tsp', 'u'),
  unitRule('cups?|c', 'cup'),
  unitRule('ounces?|oz', 'oz'),
  unitRule('pounds?|lbs?', 'lb'),
  unitRule('kilogram(?:me)?s?|kilos?|kg', 'kg'),
  unitRule('gram(?:me)?s?|gr|g', 'g'),
  unitRule('millilit(?:re|er)s?|ml', 'ml'),
  unitRule('centilit(?:re|er)s?|cl', 'cl'),
  unitRule('lit(?:re|er)s?|l', 'l'),
  unitRule('gousses?|cloves?', 'piece'),
];

export const isToTaste = (raw: string): boolean => new RegExp(TASTE, 'i').test(raw);

const toNumber = (text: string): number =>
  text.replace(',', '.').split(/\s+/).reduce((sum, part) => {
    const [numerator, denominator] = part.split('/');
    return sum + (denominator === undefined ? Number(numerator) : Number(numerator) / Number(denominator));
  }, 0);

function unitAt(text: string): { unit: RecipeUnit; rest: string } | null {
  for (const [rule, unit] of UNIT_RULES) {
    const match = rule.exec(text);
    if (match) return { unit, rest: text.slice(match[0].length) };
  }
  return null;
}

const cleanName = (text: string): string =>
  text
    .replace(/\([^)]*\)/g, ' ')
    .replace(/,.*$/, '')
    .replace(new RegExp(TASTE, 'gi'), ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\s(?:or|and|ou|et|&)$/i, '')
    .toLowerCase();

function measured(qty: number, text: string): ParsedLine {
  const pack = PACK.exec(text);
  const packUnit = pack ? unitAt(pack[2] ?? '') : null;
  if (pack && packUnit && packUnit.rest === '') {
    return { qty: qty * toNumber(pack[1] ?? ''), unit: packUnit.unit, name: cleanName(text.slice(pack[0].length).replace(LINKER, '')) };
  }
  const found = unitAt(text);
  return { qty, unit: found?.unit ?? 'piece', name: cleanName((found?.rest ?? text).replace(LINKER, '')) };
}

export function parseIngredientLine(raw: string): ParsedLine {
  const line = raw.replace(FRACTION_CHARS, (f) => ` ${FRACTIONS[f]}`).replace(/\s+/g, ' ').trim();
  const quantity = QTY.exec(line);
  if (!quantity) return { qty: null, unit: null, name: cleanName(line) };
  const parsed = measured(toNumber(quantity[2] ?? quantity[1] ?? ''), line.slice(quantity[0].length));
  return THOUSANDS.test(line) || AMBIGUOUS_NAME.test(parsed.name) ? { qty: null, unit: null, name: parsed.name } : parsed;
}
