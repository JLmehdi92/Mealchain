import type { Allergen, Diet } from '../ingredients/schema';
import type { Equipment } from '../recipes/types';

export const ALLERGEN_ORDER: Allergen[] = ['peanuts', 'nuts', 'milk', 'eggs', 'gluten', 'fish', 'crustaceans', 'molluscs', 'soy', 'sesame', 'mustard', 'celery', 'sulphites', 'lupin'];

export const ALLERGEN_LABELS: { en: Record<Allergen, string>; fr: Record<Allergen, string> } = {
  en: {
    peanuts: 'Peanuts', nuts: 'Tree nuts', milk: 'Milk', eggs: 'Eggs', gluten: 'Gluten', fish: 'Fish', crustaceans: 'Shellfish',
    molluscs: 'Molluscs', soy: 'Soy', sesame: 'Sesame', mustard: 'Mustard', celery: 'Celery', sulphites: 'Sulphites', lupin: 'Lupin',
  },
  fr: {
    peanuts: 'Arachides', nuts: 'Fruits à coque', milk: 'Lait', eggs: 'Œufs', gluten: 'Gluten', fish: 'Poisson', crustaceans: 'Crustacés',
    molluscs: 'Mollusques', soy: 'Soja', sesame: 'Sésame', mustard: 'Moutarde', celery: 'Céleri', sulphites: 'Sulfites', lupin: 'Lupin',
  },
};

export const DIET_LABELS: { en: Record<Diet, string>; fr: Record<Diet, string> } = {
  en: { vegetarian: 'Vegetarian', vegan: 'Vegan', pescatarian: 'Pescatarian', gluten_free: 'Gluten-free', lactose_free: 'Lactose-free', halal: 'Halal', no_pork: 'No pork' },
  fr: { vegetarian: 'Végétarien', vegan: 'Végan', pescatarian: 'Pescetarien', gluten_free: 'Sans gluten', lactose_free: 'Sans lactose', halal: 'Halal', no_pork: 'Sans porc' },
};

export const EQUIPMENT_LABELS: { en: Record<Equipment, string>; fr: Record<Equipment, string> } = {
  en: { oven: 'Oven', stovetop: 'Stovetop', microwave: 'Microwave', blender: 'Blender', food_processor: 'Food processor', air_fryer: 'Air fryer', slow_cooker: 'Slow cooker', grill: 'Grill' },
  fr: { oven: 'Four', stovetop: 'Plaques de cuisson', microwave: 'Micro-ondes', blender: 'Mixeur', food_processor: 'Robot culinaire', air_fryer: 'Friteuse à air', slow_cooker: 'Mijoteuse', grill: 'Gril' },
};

export const COPY = {
  en: {
    nuts: 'Peanuts and tree nuts',
    nutsBody: 'include cashews, almonds, hazelnuts, walnuts, pecans, pistachios and their oils and butters.',
    save: 'Save household',
    decrease: 'Fewer {label}',
    increase: 'More {label}',
  },
  fr: {
    nuts: 'Arachides et fruits à coque',
    nutsBody: 'incluent noix de cajou, amandes, noisettes, noix, noix de pécan, pistaches, ainsi que leurs huiles et purées.',
    save: 'Enregistrer le foyer',
    decrease: 'Moins de {label}',
    increase: 'Plus de {label}',
  },
};
