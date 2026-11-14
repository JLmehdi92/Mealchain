import type { Diet } from '../ingredients/schema';
import type { RecipeSource } from './types';

type Labels = {
  dietConflict: Record<Diet, string>;
  source: Record<RecipeSource, string>;
  fromSource: Record<RecipeSource, string>;
};

const labelsEn: Labels = {
  dietConflict: {
    vegetarian: 'not vegetarian', vegan: 'not vegan', pescatarian: 'not pescatarian', gluten_free: 'contains gluten',
    lactose_free: 'contains lactose', halal: 'not halal', no_pork: 'contains pork',
  },
  source: { web: 'Web page', caption: 'Caption', screenshot: 'Screenshot' },
  fromSource: { web: 'from a web page', caption: 'from a caption', screenshot: 'from a screenshot' },
};

const labelsFr: Labels = {
  dietConflict: {
    vegetarian: 'non végétarienne', vegan: 'non végane', pescatarian: 'non pescetarienne', gluten_free: 'contient du gluten',
    lactose_free: 'contient du lactose', halal: 'non halal', no_pork: 'contient du porc',
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
    allergy: '{name}, household allergy',
    equipment: 'equipment ({name})',
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
    allergy: '{name}, allergie du foyer',
    equipment: 'équipement ({name})',
    unverified: 'ingrédients à vérifier',
    emptyTitle: 'Toutes vos recettes, au même endroit',
    emptyBody: 'Collez un lien, une légende ou une capture. Demidemi garde chaque mot tel quel.',
    noMatch: 'Aucune recette ne correspond à « {query} ».',
  },
};

export const detailCopy = {
  en: {
    swap: 'Swap this meal',
    serves: 'Serves {people}',
    scaled: 'Serves {people} · scaled from {servings}',
    usesRest: "Uses the rest of {day}'s {name}",
    here: 'here',
    ingredients: 'Ingredients',
    asWritten: 'As written (serves {servings})',
    forYou: 'For your {people}',
    steps: 'Steps',
    mayContain: 'may contain',
    disclaimer: 'Allergens are in bold, as on food labels. Filter based on the ingredients entered; not medical advice.',
    openOriginal: 'Open original recipe',
    credit: 'From {site} ({author}), under {license}. Tap to read the license.',
    missing: 'This recipe is no longer in your box.',
    delete: 'Delete recipe',
    deleteTitle: 'Delete this recipe?',
    deleteBody: 'It will be removed from your box. A planned meal using it can be swapped.',
    cancel: 'Cancel',
  },
  fr: {
    swap: 'Changer ce repas',
    serves: '{people} pers.',
    scaled: '{people} pers. · adapté de {servings}',
    usesRest: 'Utilise le reste : {name} de {day}',
    here: 'ici',
    ingredients: 'Ingrédients',
    asWritten: "Recette d'origine ({servings} pers.)",
    forYou: 'Pour vos {people}',
    steps: 'Étapes',
    mayContain: 'peut contenir',
    disclaimer: 'Les allergènes sont en gras, comme sur les emballages. Filtre basé sur les ingrédients saisis ; ne remplace pas un avis médical.',
    openOriginal: "Ouvrir la recette d'origine",
    credit: 'Source : {site} ({author}), sous licence {license}. Touchez pour lire la licence.',
    missing: "Cette recette n'est plus dans votre boîte.",
    delete: 'Supprimer la recette',
    deleteTitle: 'Supprimer cette recette ?',
    deleteBody: 'Elle sera retirée de votre boîte. Un repas prévu qui l’utilise pourra être changé.',
    cancel: 'Annuler',
  },
};
