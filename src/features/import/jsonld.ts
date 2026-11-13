export type RawRecipe = {
  title?: string;
  servings?: number;
  totalMinutes?: number;
  ingredients: string[];
  steps: string[];
  imageUrl?: string;
  sourceUrl: string;
};

type JsonObject = Record<string, unknown>;

const LD_SCRIPT = /<script\b[^>]*\btype\s*=\s*["']?application\/ld\+json["']?[^>]*>([\s\S]*?)<\/script\s*>/gi;
const DURATION = /^P(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:[\d.]+S)?)?$/i;
const ENTITIES: Record<string, string> = {
  amp: '&', quot: '"', apos: "'", lt: '<', gt: '>', nbsp: ' ', deg: '°',
  frac12: '½', frac14: '¼', frac34: '¾', frac13: '⅓', frac23: '⅔', frac18: '⅛',
  eacute: 'é', egrave: 'è', ecirc: 'ê', agrave: 'à', acirc: 'â', ccedil: 'ç', ocirc: 'ô', icirc: 'î', ucirc: 'û', oelig: 'œ',
};

const isObject = (v: unknown): v is JsonObject => typeof v === 'object' && v !== null && !Array.isArray(v);

function decodeEntity(match: string, entity: string): string {
  if (!entity.startsWith('#')) return ENTITIES[entity.toLowerCase()] ?? match;
  const code = entity[1] === 'x' || entity[1] === 'X' ? parseInt(entity.slice(2), 16) : Number(entity.slice(1));
  return code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : match;
}

const text = (v: unknown): string =>
  typeof v === 'string' ? v.replace(/&(#x[0-9a-f]+|#\d+|[a-z0-9]+);/gi, decodeEntity).trim() : '';

function parseJson(source: string): unknown {
  try {
    return JSON.parse(source);
  } catch {
    return null;
  }
}

function findRecipe(data: unknown): JsonObject | null {
  if (Array.isArray(data)) {
    for (const item of data) {
      const found = findRecipe(item);
      if (found) return found;
    }
    return null;
  }
  if (!isObject(data)) return null;
  const type = data['@type'];
  if (type === 'Recipe' || (Array.isArray(type) && type.includes('Recipe'))) return data;
  return findRecipe(data['@graph']);
}

function servings(recipeYield: unknown): number | undefined {
  const first: unknown = Array.isArray(recipeYield) ? recipeYield[0] : recipeYield;
  const count = typeof first === 'number' ? first : Number(/\d+/.exec(String(first))?.[0]);
  return count > 0 ? count : undefined;
}

function minutes(duration: unknown): number | undefined {
  const match = typeof duration === 'string' ? DURATION.exec(duration.trim()) : null;
  if (!match) return undefined;
  const [, days = '0', hours = '0', mins = '0'] = match;
  const total = Number(days) * 1440 + Number(hours) * 60 + Number(mins);
  return total > 0 ? total : undefined;
}

function totalMinutes(recipe: JsonObject): number | undefined {
  const parts = [minutes(recipe.prepTime), minutes(recipe.cookTime)].filter((m) => m !== undefined);
  return minutes(recipe.totalTime) ?? (parts.length ? parts.reduce((a, b) => a + b) : undefined);
}

function steps(instructions: unknown): string[] {
  if (typeof instructions === 'string') return instructions.split(/\n+/).map(text).filter(Boolean);
  if (Array.isArray(instructions)) return instructions.flatMap(steps);
  if (!isObject(instructions)) return [];
  if (instructions.itemListElement !== undefined) return steps(instructions.itemListElement);
  return steps(instructions.text ?? instructions.name);
}

function imageUrl(image: unknown): string | undefined {
  const first: unknown = Array.isArray(image) ? image[0] : image;
  const url = text(isObject(first) ? first.url : first);
  return /^https?:\/\//i.test(url) ? url : undefined;
}

export function extractRecipe(html: string, sourceUrl: string): RawRecipe | null {
  for (const [, body = ''] of html.matchAll(LD_SCRIPT)) {
    const recipe = findRecipe(parseJson(body));
    if (!recipe) continue;
    const ingredients = recipe.recipeIngredient;
    return {
      title: text(recipe.name) || undefined,
      servings: servings(recipe.recipeYield),
      totalMinutes: totalMinutes(recipe),
      ingredients: Array.isArray(ingredients) ? ingredients.map(text).filter(Boolean) : [],
      steps: steps(recipe.recipeInstructions),
      imageUrl: imageUrl(recipe.image),
      sourceUrl,
    };
  }
  return null;
}
