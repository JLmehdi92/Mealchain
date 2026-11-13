import type { Language } from '@/lib/i18n';

import { ingredientById } from '../ingredients/catalog';
import type { PackItem } from '../ingredients/packs';
import type { Ingredient, Market } from '../ingredients/schema';
import { toBase, type BaseUnit, type RecipeUnit } from '../ingredients/units';
import { dayLabel } from '../week/chains';

type Container = PackItem['pack']['container'];

const CONTAINERS: Record<Language, Record<Container, [string, string]>> = {
  en: {
    carton: ['carton', 'cartons'], can: ['can', 'cans'], jar: ['jar', 'jars'], bottle: ['bottle', 'bottles'],
    bag: ['bag', 'bags'], box: ['box', 'boxes'], bunch: ['bunch', 'bunches'], pack: ['pack', 'packs'],
    tub: ['tub', 'tubs'], block: ['block', 'blocks'], tray: ['tray', 'trays'], loose: ['', ''],
  },
  fr: {
    carton: ['brique', 'briques'], can: ['boîte', 'boîtes'], jar: ['bocal', 'bocaux'], bottle: ['bouteille', 'bouteilles'],
    bag: ['sachet', 'sachets'], box: ['boîte', 'boîtes'], bunch: ['botte', 'bottes'], pack: ['paquet', 'paquets'],
    tub: ['pot', 'pots'], block: ['bloc', 'blocs'], tray: ['barquette', 'barquettes'], loose: ['', ''],
  },
};

const UNIT_LABEL: Partial<Record<RecipeUnit, string>> = { fl_oz: 'fl oz' };
const WHY = {
  en: { used: 'All used · {days}', rest: '{need} for {days} · {left} left over' },
  fr: { used: 'Tout utilisé · {days}', rest: '{need} pour {days} · reste {left}' },
};
const US_UNITS: Record<Exclude<BaseUnit, 'piece'>, { unit: string; per: number }> = {
  g: { unit: 'oz', per: 28.349523125 },
  ml: { unit: 'fl oz', per: 29.5735295625 },
};
const METRIC_BIG: Record<Exclude<BaseUnit, 'piece'>, string> = { g: 'kg', ml: 'l' };

const num = (value: number, lang: Language) => {
  const text = String(Math.round(value * 10) / 10);
  return lang === 'fr' ? text.replace('.', ',') : text;
};
const unitLabel = (unit: RecipeUnit) => UNIT_LABEL[unit] ?? unit;

function measured(value: number, unit: Exclude<BaseUnit, 'piece'>, market: Market, lang: Language) {
  if (market === 'us') {
    const converted = value / US_UNITS[unit].per;
    return `${num(converted >= 10 ? Math.round(converted) : converted, lang)} ${US_UNITS[unit].unit}`;
  }
  return value >= 1000 ? `${num(value / 1000, lang)} ${METRIC_BIG[unit]}` : `${Math.round(value)} ${unit}`;
}

export function amountLabel(amount: number, ingredient: Ingredient, market: Market, lang: Language): string {
  if (ingredient.baseUnit === 'piece') return String(Math.ceil(amount - 1e-9));
  return measured(amount, ingredient.baseUnit, market, lang);
}

function onePack({ pack, count }: PackItem, ingredient: Ingredient, market: Market, lang: Language) {
  const spec = ingredient.packs[market].find(
    (p) => p.container === pack.container && Math.abs((toBase(p.size, p.unit, ingredient) ?? NaN) - pack.amount) < 1e-6,
  );
  if (!spec) return amountLabel(pack.amount * count, ingredient, market, lang);
  if (spec.container === 'loose') {
    const total = num(spec.size * count, lang);
    return spec.unit === 'piece' ? total : `${total} ${unitLabel(spec.unit)}`;
  }
  const name = CONTAINERS[lang][spec.container][count > 1 ? 1 : 0];
  const size = num(spec.size, lang);
  if (spec.unit === 'piece') return `${count} ${name} ${lang === 'fr' ? 'de' : 'of'} ${size}`;
  return lang === 'fr' ? `${count} ${name} ${size} ${unitLabel(spec.unit)}` : `${count} ${name} (${size} ${unitLabel(spec.unit)})`;
}

export function packLabel(items: PackItem[], ingredient: Ingredient, market: Market, lang: Language): string {
  return items.map((item) => onePack(item, ingredient, market, lang)).join(' + ');
}

type WhyInput = { ingredientId: string; need: number; leftover: number; days: number[]; weekStart: string };
export type Why = { text: string; used: boolean; ratio: number };

export function whyLine({ ingredientId, need, leftover, days, weekStart }: WhyInput, market: Market, lang: Language): Why {
  const dayList = [...new Set(days)].sort((a, b) => a - b).map((day) => dayLabel(weekStart, day, lang, 'short')).join(', ');
  const ingredient = ingredientById.get(ingredientId);
  const total = need + leftover;
  const pieces = ingredient?.baseUnit === 'piece';
  const shownNeed = pieces ? Math.ceil(need - 1e-9) : need;
  const shownLeft = pieces ? Math.round(total) - shownNeed : leftover;
  const leftText = ingredient ? amountLabel(shownLeft, ingredient, market, lang) : '';
  if (!ingredient || shownLeft <= 0 || parseFloat(leftText.replace(',', '.')) === 0) {
    return { text: WHY[lang].used.replace('{days}', dayList), used: true, ratio: 1 };
  }
  const text = WHY[lang].rest
    .replace('{need}', amountLabel(shownNeed, ingredient, market, lang))
    .replace('{days}', dayList)
    .replace('{left}', leftText);
  return { text, used: false, ratio: total > 0 ? shownNeed / total : 1 };
}
