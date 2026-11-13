import type { LegalText } from './LegalPage';

type Bilingual = { en: LegalText; fr: LegalText };

export const TERMS: Bilingual = {
  en: {
    title: 'Terms of use',
    updated: 'Last updated November 13, 2026',
    sections: [
      ['The service', 'Demidemi plans meals from the recipes you add and builds a shopping list in real pack sizes. Plans are worked out on your iPhone.'],
      ['Your recipes', 'You keep the rights to what you import. Import only recipes you are allowed to use for your own cooking. Demidemi never rewrites a recipe; fields it cannot read are marked for you to check.'],
      ['Free and Pro', 'The free version covers 15 recipes and your first full week with its shopping list. Demidemi Pro is an auto-renewing subscription, yearly with a 7-day free trial or monthly without a trial. Payment is charged to your Apple Account. It renews automatically unless cancelled at least 24 hours before the end of the period. Manage or cancel in Settings › Apple Account. Family Sharing is available.'],
      ['Allergies and diets', 'Filters are based on the ingredients you enter and on our ingredient list. They do not replace medical advice. Always check labels and the recipe before cooking for someone with an allergy.'],
      ['Liability', 'Demidemi is provided as is. Quantities and pack sizes are estimates and may differ in your shop.'],
      ['Contact', 'hello@demidemi.app'],
    ],
  },
  fr: {
    title: "Conditions d'utilisation",
    updated: 'Mise à jour le 13 novembre 2026',
    sections: [
      ['Le service', 'Demidemi compose vos repas à partir des recettes que vous ajoutez et prépare une liste de courses en vrais paquets. Les plans sont calculés sur votre iPhone.'],
      ['Vos recettes', "Vous gardez vos droits sur ce que vous importez. N'importez que des recettes que vous pouvez utiliser pour votre propre cuisine. Demidemi ne réécrit jamais une recette ; ce qu'il ne sait pas lire vous est signalé."],
      ['Gratuit et Pro', "La version gratuite couvre 15 recettes et votre première semaine complète avec sa liste. Demidemi Pro est un abonnement à renouvellement automatique, annuel avec 7 jours d'essai gratuit ou mensuel sans essai. Le paiement est débité sur votre compte Apple. Il se renouvelle automatiquement sauf résiliation au moins 24 h avant la fin de la période. Gérez ou résiliez dans Réglages › Compte Apple. Le partage familial est disponible."],
      ['Allergies et régimes', 'Les filtres reposent sur les ingrédients saisis et sur notre liste d’ingrédients. Ils ne remplacent pas un avis médical. Vérifiez toujours les étiquettes et la recette avant de cuisiner pour une personne allergique.'],
      ['Responsabilité', 'Demidemi est fourni en l’état. Les quantités et les tailles de paquets sont des estimations et peuvent différer dans votre magasin.'],
      ['Contact', 'hello@demidemi.app'],
    ],
  },
};

export const PRIVACY: Bilingual = {
  en: {
    title: 'Privacy policy',
    updated: 'Last updated November 13, 2026',
    sections: [
      ['What stays on your iPhone', 'Your recipes, household settings (people, meals, allergies, diets, equipment), weekly plans and shopping list are stored in a database on your device. Demidemi works fully without an account.'],
      ['If you create an account', 'Signing in with Apple is optional and only used to share one shopping list with your household. We then store your household settings, recipes and list ticks on our servers (hosted by Supabase), protected so that only members of your household can read them. We do not ask Apple for your name or email address.'],
      ['The AI reader', 'Links are read on our server without AI. For captions and screenshots, the text you choose is sent to a language model on our server, only after you agree, to find the ingredients and steps. Our provider, Anthropic, does not use it to train models, and nothing is invented: anything unclear is marked for you to check. You can turn the question back on in Settings › Privacy.'],
      ['Purchases', 'Subscriptions are handled by Apple through RevenueCat. We see whether your subscription is active, never your payment details.'],
      ['Measurement', 'If enabled in this build, we count a few anonymous steps (first launch, first import, first plan, paywall seen, trial started) and crash reports, without your recipes, names or any personal data. Data is never sold or used for advertising.'],
      ['Deleting your data', 'Settings › Delete account removes your account and household data from our servers and erases everything stored on this iPhone. Your subscription is managed in Settings › Apple Account.'],
      ['Contact', 'Questions or requests about your data: hello@demidemi.app.'],
    ],
  },
  fr: {
    title: 'Politique de confidentialité',
    updated: 'Mise à jour le 13 novembre 2026',
    sections: [
      ['Ce qui reste sur votre iPhone', 'Vos recettes, les réglages du foyer (personnes, repas, allergies, régimes, équipement), vos plans de la semaine et votre liste de courses sont enregistrés dans une base de données sur votre appareil. Demidemi fonctionne entièrement sans compte.'],
      ['Si vous créez un compte', "La connexion avec Apple est facultative et ne sert qu'à partager une liste de courses avec votre foyer. Nous enregistrons alors les réglages du foyer, les recettes et les coches de la liste sur nos serveurs (hébergés par Supabase), protégés pour que seuls les membres de votre foyer puissent les lire. Nous ne demandons à Apple ni votre nom ni votre adresse e-mail."],
      ['Le lecteur IA', "Les liens sont lus sur notre serveur, sans IA. Pour les légendes et les captures, le texte que vous choisissez est envoyé à un modèle de langage sur notre serveur, seulement après votre accord, pour repérer les ingrédients et les étapes. Notre fournisseur, Anthropic, ne s'en sert pas pour entraîner ses modèles, et rien n'est inventé : ce qui n'est pas clair vous est signalé. Vous pouvez réactiver la question dans Réglages › Confidentialité."],
      ['Achats', "Les abonnements sont gérés par Apple via RevenueCat. Nous savons si votre abonnement est actif, jamais vos moyens de paiement."],
      ['Mesure', "Si c'est activé dans cette version, nous comptons quelques étapes anonymes (premier lancement, premier import, premier plan, paywall affiché, essai démarré) et les rapports de plantage, sans vos recettes, vos noms ni aucune donnée personnelle. Les données ne sont jamais vendues ni utilisées pour de la publicité."],
      ['Supprimer vos données', "Réglages › Supprimer le compte efface votre compte et les données du foyer de nos serveurs, ainsi que tout ce qui est enregistré sur cet iPhone. L'abonnement se gère dans Réglages › Compte Apple."],
      ['Contact', 'Questions ou demandes sur vos données : hello@demidemi.app.'],
    ],
  },
};

export const ALLERGY_NOTICE: Bilingual = {
  en: {
    title: 'Allergy notice',
    updated: 'Please read before relying on the filters',
    sections: [
      ['How the filter works', 'Each ingredient you enter is matched to our ingredient list, which records the 14 major allergens. A recipe containing an allergen you selected never appears in your plan. A line we cannot match is shown for you to check; it is not assumed safe.'],
      ['What it cannot know', 'Brands differ. An ingredient can contain traces or be made in a factory that handles allergens. The filter only knows the words in your recipe.'],
      ['Tree nuts', 'Peanuts and tree nuts include cashews, almonds, hazelnuts, walnuts, pecans, pistachios and their oils and butters.'],
      ['Not medical advice', 'Filter based on the ingredients you enter. It does not replace medical advice. Always read the labels of what you buy.'],
    ],
  },
  fr: {
    title: 'Avis sur les allergies',
    updated: 'À lire avant de vous fier aux filtres',
    sections: [
      ['Comment fonctionne le filtre', "Chaque ingrédient saisi est rapproché de notre liste d'ingrédients, qui recense les 14 allergènes majeurs. Une recette contenant un allergène choisi n'apparaît jamais dans votre plan. Une ligne non reconnue vous est montrée pour vérification ; elle n'est pas supposée sans risque."],
      ['Ce qu’il ne peut pas savoir', "Les marques diffèrent. Un ingrédient peut contenir des traces ou être fabriqué dans un atelier qui manipule des allergènes. Le filtre ne connaît que les mots de votre recette."],
      ['Fruits à coque', 'Les arachides et fruits à coque incluent noix de cajou, amandes, noisettes, noix, noix de pécan, pistaches, ainsi que leurs huiles et purées.'],
      ['Pas un avis médical', 'Filtre basé sur les ingrédients saisis. Il ne remplace pas un avis médical. Lisez toujours les étiquettes de ce que vous achetez.'],
    ],
  },
};
