import type { Allergen, Diet } from '../ingredients/schema';
import type { Equipment, RecipeSource } from './types';

type Labels = {
  allergens: Record<Allergen, string>;
  dietConflict: Record<Diet, string>;
  equipment: Record<Equipment, string>;
  source: Record<RecipeSource, string>;
  fromSource: Record<RecipeSource, string>;
};

const labelsEn: Labels = {
  allergens: {
    gluten: 'gluten', crustaceans: 'shellfish', eggs: 'eggs', fish: 'fish', peanuts: 'peanuts', soy: 'soy', milk: 'milk',
    nuts: 'tree nuts', celery: 'celery', mustard: 'mustard', sesame: 'sesame', sulphites: 'sulphites', lupin: 'lupin', molluscs: 'molluscs',
  },
  dietConflict: {
    vegetarian: 'not vegetarian', vegan: 'not vegan', pescatarian: 'not pescatarian', gluten_free: 'contains gluten',
    lactose_free: 'contains lactose', halal: 'not halal', no_pork: 'contains pork',
  },
  equipment: {
    oven: 'Oven', stovetop: 'Stovetop', microwave: 'Microwave', blender: 'Blender', food_processor: 'Food processor',
    air_fryer: 'Air fryer', slow_cooker: 'Slow cooker', grill: 'Grill',
  },
  source: { web: 'Web page', caption: 'Caption', screenshot: 'Screenshot' },
  fromSource: { web: 'from a web page', caption: 'from a caption', screenshot: 'from a screenshot' },
};

const labelsFr: Labels = {
  allergens: {
    gluten: 'gluten', crustaceans: 'crustacés', eggs: 'œufs', fish: 'poisson', peanuts: 'arachides', soy: 'soja', milk: 'lait',
    nuts: 'fruits à coque', celery: 'céleri', mustard: 'moutarde', sesame: 'sésame', sulphites: 'sulfites', lupin: 'lupin', molluscs: 'mollusques',
  },
  dietConflict: {
    vegetarian: 'non végétarienne', vegan: 'non végane', pescatarian: 'non pescetarienne', gluten_free: 'contient du gluten',
    lactose_free: 'contient du lactose', halal: 'non halal', no_pork: 'contient du porc',
  },
  equipment: {
    oven: 'Four', stovetop: 'Plaques de cuisson', microwave: 'Micro-ondes', blender: 'Mixeur', food_processor: 'Robot',
    air_fryer: 'Friteuse à air', slow_cooker: 'Mijoteuse', grill: 'Gril',
  },
  source: { web: 'Page web', caption: 'Légende', screenshot: 'Capture' },
  fromSource: { web: 'depuis une page web', caption: "depuis une légende", screenshot: 'depuis une capture' },
};

export const labels = { en: labelsEn, fr: labelsFr };

export const boxCopy = {
  en: {
    title: 'Recipes',
    freeCount: '{count} of {limit} free recipes',
    search: 'Search',
    settings: 'Settings',
    add: 'Import a recipe',
    thisWeek: 'This week, {day}',
    toCheck: '{count} to check',
    leftOut: 'Left out: {reason}',
    equipment: 'equipment ({name})',
    time: '{minutes} min',
    unverified: 'ingredients to check',
    emptyTitle: 'Your recipes, in one place',
    emptyBody: 'Paste a link, a caption or a screenshot. Demidemi keeps every word as written.',
    noMatch: 'No recipe matches “{query}”.',
  },
  fr: {
    title: 'Recettes',
    freeCount: '{count} recettes sur {limit} gratuites',
    search: 'Rechercher',
    settings: 'Réglages',
    add: 'Importer une recette',
    thisWeek: 'Cette semaine, {day}',
    toCheck: '{count} à vérifier',
    leftOut: 'Écartée : {reason}',
    equipment: 'équipement ({name})',
    time: '{minutes} min',
    unverified: 'ingrédients à vérifier',
    emptyTitle: 'Toutes vos recettes, au même endroit',
    emptyBody: 'Collez un lien, une légende ou une capture. Demidemi garde chaque mot tel quel.',
    noMatch: 'Aucune recette ne correspond à « {query} ».',
  },
};

export const detailCopy = {
  en: {
    back: 'Back',
    swap: 'Swap this meal',
    minutes: '{minutes} min',
    serves: 'Serves {people}',
    scaled: 'Serves {people} · scaled from {servings}',
    usesRest: "Uses the rest of {day}'s {name}",
    here: 'here',
    ingredients: 'Ingredients',
    steps: 'Steps',
    mayContain: 'may contain',
    disclaimer: 'Allergens are in bold, as on food labels. Filter based on the ingredients entered; not medical advice.',
    openOriginal: 'Open original recipe',
    missing: 'This recipe is no longer in your box.',
  },
  fr: {
    back: 'Retour',
    swap: 'Changer ce repas',
    minutes: '{minutes} min',
    serves: '{people} pers.',
    scaled: '{people} pers. · adapté de {servings}',
    usesRest: 'Utilise le reste : {name} de {day}',
    here: 'ici',
    ingredients: 'Ingrédients',
    steps: 'Étapes',
    mayContain: 'peut contenir',
    disclaimer: 'Les allergènes sont en gras, comme sur les emballages. Filtre basé sur les ingrédients saisis ; ne remplace pas un avis médical.',
    openOriginal: "Ouvrir la recette d'origine",
    missing: "Cette recette n'est plus dans votre boîte.",
  },
};
