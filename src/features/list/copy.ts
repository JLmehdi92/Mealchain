import type { AISLES } from '../ingredients/schema';

type Aisle = (typeof AISLES)[number];

const AISLE_EN: Record<Aisle, string> = {
  produce: 'Produce', dairy: 'Dairy and eggs', meat: 'Meat', fish: 'Fish and seafood', bakery: 'Bakery',
  pantry: 'Pantry', spices: 'Spices', condiments: 'Condiments', frozen: 'Frozen', drinks: 'Drinks',
};
const AISLE_FR: Record<Aisle, string> = {
  produce: 'Fruits et légumes', dairy: 'Crèmerie et œufs', meat: 'Boucherie', fish: 'Poissonnerie', bakery: 'Boulangerie',
  pantry: 'Épicerie', spices: 'Épices', condiments: 'Condiments', frozen: 'Surgelés', drinks: 'Boissons',
};

export const LIST_COPY = {
  en: {
    aisles: AISLE_EN,
    packs: '{n} packs',
    packsOne: '1 pack',
    shared: 'Shared with your household · {n} packs',
    sharedOne: 'Shared with your household · 1 pack',
    cart: 'In the cart',
    toCheck: 'To check',
    toCheckHint: "We couldn't size these lines. They stay as written in the recipe.",
    emptyTitle: 'Nothing to buy yet',
    emptyBody: 'Your list fills itself once the week is planned, in packs you can find on the shelf.',
    planWeek: 'Plan my week',
    share: 'Share the list',
    needAccount: 'Sharing needs an account',
    needAccountBody: 'This version of Demidemi works on this iPhone only. Your list stays here.',
    signInBody: 'Sign in with Apple to share one list with your household. Everything else keeps working without an account.',
    signIn: 'Sign in with Apple',
    cancel: 'Cancel',
    invite: 'Join my Demidemi shopping list. In Settings › Shared with, enter this code: {code}',
    shareError: "Couldn't create an invite. Try again in a moment.",
  },
  fr: {
    aisles: AISLE_FR,
    packs: '{n} paquets',
    packsOne: '1 paquet',
    shared: 'Partagée avec votre foyer · {n} paquets',
    sharedOne: 'Partagée avec votre foyer · 1 paquet',
    cart: 'Dans le panier',
    toCheck: 'À vérifier',
    toCheckHint: "Ces lignes n'ont pas pu être chiffrées. Elles restent telles qu'écrites dans la recette.",
    emptyTitle: 'Rien à acheter pour le moment',
    emptyBody: 'La liste se remplit dès que la semaine est composée, en paquets que vous trouverez en rayon.',
    planWeek: 'Composer ma semaine',
    share: 'Partager la liste',
    needAccount: 'Le partage demande un compte',
    needAccountBody: 'Cette version de Demidemi fonctionne sur cet iPhone uniquement. Votre liste reste ici.',
    signInBody: 'Connectez-vous avec Apple pour partager une liste avec votre foyer. Tout le reste fonctionne sans compte.',
    signIn: 'Se connecter avec Apple',
    cancel: 'Annuler',
    invite: 'Rejoignez ma liste de courses Demidemi. Dans Réglages › Partagé avec, saisissez ce code : {code}',
    shareError: "Impossible de créer l'invitation. Réessayez dans un instant.",
  },
};
