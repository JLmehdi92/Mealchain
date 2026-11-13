import type { Language } from '@/lib/i18n';

type Forms = [string, string];
type PieceLabel = Record<Language, Forms>;

const both = (en: Forms, fr: Forms): PieceLabel => ({ en, fr });

export const PIECE_LABELS: Record<string, PieceLabel> = {
  baguette: both(['baguette', 'baguettes'], ['baguette', 'baguettes']),
  burger_bun: both(['bun', 'buns'], ['pain', 'pains']),
  corn_tortilla: both(['tortilla', 'tortillas'], ['tortilla', 'tortillas']),
  flour_tortilla: both(['tortilla', 'tortillas'], ['tortilla', 'tortillas']),
  naan: both(['naan', 'naans'], ['naan', 'naans']),
  pita: both(['pita', 'pitas'], ['pita', 'pitas']),
  sandwich_bread: both(['slice', 'slices'], ['tranche', 'tranches']),
  egg: both(['egg', 'eggs'], ['œuf', 'œufs']),
  beef_stock_cube: both(['cube', 'cubes'], ['cube', 'cubes']),
  chicken_stock_cube: both(['cube', 'cubes'], ['cube', 'cubes']),
  vegetable_stock_cube: both(['cube', 'cubes'], ['cube', 'cubes']),
  apple: both(['apple', 'apples'], ['pomme', 'pommes']),
  avocado: both(['avocado', 'avocados'], ['avocat', 'avocats']),
  banana: both(['banana', 'bananas'], ['banane', 'bananes']),
  corn_on_the_cob: both(['ear', 'ears'], ['épi', 'épis']),
  cucumber: both(['cucumber', 'cucumbers'], ['concombre', 'concombres']),
  eggplant: both(['eggplant', 'eggplants'], ['aubergine', 'aubergines']),
  garlic: both(['clove', 'cloves'], ['gousse', 'gousses']),
  green_bell_pepper: both(['pepper', 'peppers'], ['poivron', 'poivrons']),
  red_bell_pepper: both(['pepper', 'peppers'], ['poivron', 'poivrons']),
  yellow_bell_pepper: both(['pepper', 'peppers'], ['poivron', 'poivrons']),
  jalapeno: both(['jalapeño', 'jalapeños'], ['piment', 'piments']),
  red_chili: both(['chili', 'chilies'], ['piment', 'piments']),
  leek: both(['leek', 'leeks'], ['poireau', 'poireaux']),
  lemon: both(['lemon', 'lemons'], ['citron', 'citrons']),
  lime: both(['lime', 'limes'], ['citron vert', 'citrons verts']),
  lemongrass: both(['stalk', 'stalks'], ['tige', 'tiges']),
  mango: both(['mango', 'mangoes'], ['mangue', 'mangues']),
  orange: both(['orange', 'oranges'], ['orange', 'oranges']),
  pear: both(['pear', 'pears'], ['poire', 'poires']),
  pineapple: both(['pineapple', 'pineapples'], ['ananas', 'ananas']),
  portobello: both(['mushroom', 'mushrooms'], ['champignon', 'champignons']),
  red_onion: both(['onion', 'onions'], ['oignon', 'oignons']),
  sweet_onion: both(['onion', 'onions'], ['oignon', 'oignons']),
  white_onion: both(['onion', 'onions'], ['oignon', 'oignons']),
  yellow_onion: both(['onion', 'onions'], ['oignon', 'oignons']),
  scallion: both(['scallion', 'scallions'], ['oignon nouveau', 'oignons nouveaux']),
  shallot: both(['shallot', 'shallots'], ['échalote', 'échalotes']),
  bay_leaves: both(['leaf', 'leaves'], ['feuille', 'feuilles']),
};

export function piecesLabel(count: number, ingredientId: string, lang: Language, text = String(count)): string {
  const forms = PIECE_LABELS[ingredientId]?.[lang];
  if (!forms) return text;
  return `${text} ${forms[count > 1 ? 1 : 0]}`;
}
