# Brin — direction artistique

## Nom

**Brin**. En français, un brin, c'est un fil de ficelle de cuisine et un brin de thym. En anglais, le mot ne
veut rien dire : il se prononce comme il s'écrit (/brɪn/), tient en une syllabe et se retient.
Les deux sens décrivent le produit : un fil relie les repas de la semaine, et le dernier brin d'un
paquet ne finit pas à la poubelle.

| | Nom affiché App Store (30 caractères max) |
|---|---|
| US | `Brin: Meal Plan, No Waste` (25) |
| FR | `Brin : repas sans gaspi` (23) |

Recherche iTunes (13/11/2026), `entity=software`, US et FR : **0 app** dont le titre contient le mot « Brin ».

Noms de secours, recherche identique :
1. **Ficelle** : 0 résultat aux US. En France, une seule app de sport dont le titre contient le mot
   (« Ficelle pendant 30 jours »). Même idée de fil, mais moins facile à prononcer en anglais.
2. **Mealchain** : 0 résultat aux US et en France. Clair, mais descriptif et sans caractère.

Écartés parce que déjà pris : Ricochet, Encore, Twine, Reprise, Sequel, Pakt, Mijote, Coda, Maillon.
La vérification des marques déposées (USPTO, INPI) reste à faire avant le dépôt : elle n'est pas couverte
par l'API iTunes.

## Positionnement

EN : Brin plans your week from your own recipes, so every pack you open gets finished.
FR : Brin compose votre semaine à partir de vos recettes, pour que chaque paquet ouvert soit fini.

## Pistes explorées

| Piste | Idée | Verdict |
|---|---|---|
| L'étiquette de frigo | Ruban de masquage, marqueur, dates sur les boîtes | Écartée : mignonne, glisse vers le décor « fait main » et ne dit rien des allergies |
| Le ticket de caisse | Papier thermique, mono, quantités au gramme | Gardée en partie : sa précision sert la liste de courses, mais seule elle est froide |
| **Le brin** | Un fil continu relie un paquet entamé aux repas qui le finissent | **Retenue** : c'est le mécanisme du produit rendu visible, personne d'autre ne peut l'avoir |

La piste retenue prend la rigueur du ticket pour les quantités et la chaleur d'une cuisine pour le reste.

## Le monde

Une cuisine de semaine, pas une cuisine de chef : plan de travail en bois clair, fonte, farine, safran,
ficelle de boucher. Les emballages réels (brique de 20 cl, pot de 500 g, botte, boîte de 400 g) sont les
objets du produit. Les étiquettes alimentaires européennes donnent une règle de confiance : **l'allergène
s'écrit en gras dans la liste d'ingrédients**. Brin reprend cette convention que chacun connaît déjà.

## Caractère

Exact, chaleureux, direct. Brin parle comme une amie qui cuisine tous les soirs et compte ses paquets,
pas comme un chef ni comme un coach.

## Palette

Les fonds restent neutres et chauds. La couleur vit dans le brin et dans les emballages.

| Rôle | Clair | Sombre | Usage |
|---|---|---|---|
| `paper` fond | `#F6F2EA` | `#16130F` | Fond des écrans |
| `surface` | `#ECE6DB` | `#211D18` | Groupes, champs, rangées secondaires |
| `sheet` | `#FFFDF9` | `#2A251F` | Cartes, feuilles posées |
| `ink` texte | `#1E1A16` | `#F4EEE2` | Texte principal, bouton principal (fond) |
| `ink-2` | `#5E564B` | `#B5AB9B` | Texte secondaire |
| `rule` | `ink` à 10 % | `ink` à 12 % | Filets 0,5 pt |
| `strand` brin | `#B5730C` | `#E5A23A` | Le brin, la jauge de paquet, la sélection |
| `strand-ink` | `#8A5A0B` | `#E5A23A` | Lien ou chiffre clé en texte |
| `chili` | `#B3261E` | `#FF6B5E` | **Uniquement** : allergène, exclusion par régime, suppression |

Contrastes mesurés (WCAG) : `ink` sur `paper` 15,4:1 ; `ink-2` sur `paper` 6,4:1 ; `strand-ink` 5,3:1 ;
`chili` 5,8:1 ; `strand` en graphisme 3,4:1 en clair, 8,4:1 en sombre. Le sombre passe partout au-dessus de 6,6:1.

Le bouton principal est **encre sur papier** (et papier sur encre en mode sombre), jamais un aplat de couleur.
Aucune information ne repose sur la couleur seule : une exclusion porte toujours un mot et une icône.

## Typographies

- **Interface : SF Pro** (police système). Elle gère Dynamic Type, les chiffres tabulaires et les accents
  sans effort, et elle est lisible pour une lectrice comme Nadia, qui lit tout.
- **Titres et chiffres forts : Bricolage Grotesque** 500 (OFL, fichiers dans `brand/fonts/`). Ses
  terminaisons légèrement creusées donnent une voix d'étiquette imprimée. Réservée aux titres d'écran,
  au nom des recettes et aux grands chiffres (« 3 paquets finis »). Approche -2 % en grande taille, 0 en
  dessous de 20 pt.
- **Quantités : SF Pro en chiffres tabulaires** (`font-variant-numeric: tabular-nums`), alignées à droite
  sur la liste de courses. Jamais de fraction décimale absurde : « 1 brique 20 cl », pas « 0,64 œuf ».

Échelle (pt) : 34 titre d'écran · 22 titre de section · 17 corps · 15 secondaire · 13 légende.
Poids : 400 et 500, 600 pour le mot-logo seulement. Casse phrase partout, aucune capitale espacée.

## Espacement et formes

- Grille de 4 pt. Marges d'écran 20 pt, padding de carte 16 à 20 pt, rangées de liste 52 pt (44 pt de
  zone tactile minimum partout).
- Un groupe est plus serré à l'intérieur qu'avec ses voisins : 8 pt entre rangées d'un groupe, 28 pt
  entre groupes.
- Rayons : contrôles 10 pt, cartes 16 pt, feuilles 24 pt. Un rayon intérieur vaut le rayon extérieur
  moins le padding, jamais moins de 4 pt. Seuls les boutons de la taille d'une pastille sont en pilule.
- Profondeur par marches de surface et filets ; en clair, une seule ombre neutre et courte pour les
  feuilles posées (0 1 2 ink à 6 %, 0 8 24 ink à 8 %).

## Signature : le brin

Un seul détail, utilisé partout où il a du sens et nulle part ailleurs.

- **Le brin** : un trait de 2 pt couleur `strand` qui relie un paquet entamé au repas qui le termine.
  Dans le plan de la semaine, il part du lundi et rejoint le mercredi. Dans la liste de courses, il
  souligne les articles « tout utilisé ».
- **La jauge de paquet** : une barre segmentée par repas (« Crème 20 cl : lun. 10 cl · mer. 10 cl »).
  Pleine, elle dit « fini ». Un reste non utilisé apparaît hachuré, avec sa quantité : on ne le cache pas.
- **L'étiquette d'allergène** : nom de l'allergène en gras dans les ingrédients, comme sur un emballage.
  Une recette exclue porte un cartouche `chili` avec le motif (« Exclue : arachide »).

## Iconographie

- **SF Symbols** pour l'interface, graisse alignée sur le texte voisin, couleur du rôle de texte.
- **Pictogrammes d'emballage dessinés pour Brin** (brique, pot, boîte, botte, sachet, barquette, œufs) :
  trait 1,5 pt, angles arrondis, même grille de 24 pt que SF Symbols. Ce sont les seuls dessins propres
  au produit.
- Aucun émoji, aucune icône colorée, aucune feuille verte « éco ».

## Images

Aucune photo générée. La boîte à recettes montre la photo de la source si la page en fournit une (avec le
lien), sinon un cartouche typographique : le nom de la recette en Bricolage sur `surface`, avec le
pictogramme de son ingrédient principal. Les états vides sont dessinés au trait, dans la même famille que
les pictogrammes d'emballage.

## Ton des textes

- Phrases courtes, verbe d'action, chiffres réels avec leur unité.
- EN : « you ». FR : **vouvoiement**. Nadia confie à l'app l'allergie de son fils : le tutoiement
  ferait léger.
- Les boutons commencent par un verbe et nomment l'objet : « Plan my week » / « Composer ma semaine »,
  « Import a recipe » / « Importer une recette ».
- On dit ce qu'on ne sait pas : « 2 ingrédients à vérifier » plutôt qu'un champ deviné.
- Pas de point d'exclamation, pas de « magique », pas de « IA » mis en avant, pas de salutation en titre.
- Allergies : « Filtre basé sur les ingrédients saisis. Ne remplace pas un avis médical. » Jamais
  « garanti sans ».

Exemples :

| Moment | EN | FR |
|---|---|---|
| Plan prêt | 5 dinners. 3 packs finished, nothing left over. | 5 dîners. 3 paquets finis, aucun reste. |
| Reste réutilisé | The other 10 cl of cream goes into Wednesday's gratin. | Les 10 cl de crème restants vont dans le gratin de mercredi. |
| Import à vérifier | 2 ingredients need a look. We left them as written. | 2 ingrédients à vérifier. Nous les avons laissés tels quels. |
| Exclusion | Left out: contains cashews (tree nuts). | Écartée : contient des noix de cajou (fruits à coque). |
| Liste vide | Your list fills itself once the week is planned. | La liste se remplit dès que la semaine est composée. |

## Mouvement

- **Ressorts sans rebond** pour toute l'interface (amortissement critique, `damping` élevé), réponse en
  moins de 100 ms au toucher. Le geste garde la vitesse du doigt et reste interruptible.
- **Un seul moment avec un léger dépassement** : le brin qui se pose sur le repas qui utilise le reste.
  C'est le geste du produit, il mérite d'être vu.
- Le brin se dessine en 450 ms, du paquet vers le repas. Le plan se compose jour par jour, 40 ms d'écart.
- Appui sur un bouton : échelle 0,97, retour en ressort. Cochage : trait qui barre l'article, puis la
  ligne descend dans la section « Dans le panier ».
- Haptique : `selection` sur les bascules, `light` au cochage, `success` quand le plan est prêt et quand
  l'abonnement est activé. Rien d'autre.
- « Réduire les animations » : fondus de 150 ms, le brin apparaît sans se dessiner, aucun déplacement.

## Logo et icône

- `brand/icon.svg`, `brand/icon-1024.png` : un « b » couleur farine sur fond fonte. Sa panse se prolonge
  en un brin safran qui sort du cadre, vers le repas suivant. Une forme, deux couleurs, lisible à 40 pt.
- `brand/wordmark-light.svg`, `brand/wordmark-dark.svg` : « brin » en Bricolage Grotesque 600, vectorisé.
  Le brin safran prolonge la jambe du « n ».
- Zone de protection : la hauteur d'x du mot-logo, de chaque côté.

## Ce que la DA s'interdit

- Dégradés de teinte, texte en dégradé, lueurs, ombres colorées, flou de verre décoratif.
- Violet, lavande, vert « éco », feuilles, planètes, cœurs.
- Émojis, étincelles ✨, badges « New » ou « AI ».
- Photos ou illustrations générées par IA, photos d'ambiance de stock.
- Cartes toutes identiques en grille ; chaque écran a un seul élément riche (le brin, la jauge, une photo
  de recette).
- Capitales espacées, titres en 700 à 900, italique d'insistance.
- Rouge `chili` pour autre chose qu'un allergène, une exclusion ou une suppression.
- Rebonds sur les éléments simples, animations en boucle, chiffres inventés (« 10 000 familles »).

## Revue Unslop (13/11/2026)

Audit de la DA avec `unslop/references/signs.md`, puis corrections :

| Signe relevé | Correction |
|---|---|
| Premier fond `#F6F1E7` trop teinté : l'écran « lit brun » | Neutralisé en `#F6F2EA`, la chaleur passe dans le brin |
| Brin safran à 1,95:1 sur fond clair, alors qu'il porte une information | `strand` clair `#B5730C` (3,4:1) |
| Accent prévu sur le bouton principal : tout serait safran | Bouton encre sur papier ; safran réservé au brin et à la sélection |
| Rouge d'accent envisagé (piste « tomate ») en conflit avec l'alerte allergène | Rouge `chili` réservé aux allergènes, aux exclusions et à la suppression |
| Brin du mot-logo collé au milieu du « n », comme un élément rapporté | Part de la ligne de base, avec une coupe nette, comme sur l'icône |
| Piste d'icône « trois points reliés » : un graphe de réseau générique | Écartée au profit du « b » prolongé |
| Aucune grille d'espacement ni règle de rayons | Section « Espacement et formes » ajoutée |
| Conflit entre les ressorts Apple et la règle Unslop « pas de rebond » | Ressorts sans rebond partout, un seul dépassement : la pose du brin |

Pas de dégradé, de lueur, d'émoji, de capitale espacée ni de badge dans la DA.

## Revue Unslop du canvas (13/11/2026)

Revue de designer sur les 46 écrans rendus dans Chromium (`design/shots.mjs`) et sur les 6 prototypes
(`design/proto-shots.mjs`, captures à intervalles réguliers), avec `unslop/references/signs.md` :

| Signe relevé | Écran | Correction |
|---|---|---|
| Accent partout : 5 lignes sur 7 en safran dans la liste | Courses | « Tout utilisé » en texte secondaire, seul le glyphe du brin reste safran |
| Départ et arrivée des brins tous deux en safran | Semaine | Safran sur le paquet qui part ; l'arrivée en texte secondaire |
| Coches safran sur le paywall | Paywall | Coches encre |
| Étiquette « Cette semaine » répétée sur 5 lignes | Recettes | Métadonnée discrète, sans pastille |
| Recette exclue cachée sous la barre d'onglets | Recettes | Remontée en tête, avec la recette à vérifier |
| Icône de réglages qui ressemble à un soleil | Partout | Vrai engrenage |
| Nom d'un blog réel cité comme source | Lecture en cours | « Lien d'un blog de cuisine » |
| Légendes qui élargissent les cadres | Canvas | Cadres à la largeur de l'iPhone |
| Prototype « le plan se compose » vide au 2e lancement | Prototypes | Valeurs d'arrivée explicites (`fromTo`) |

Restent volontairement : les vignettes pictogrammes de la boîte à recettes (aucune image générée ni
photo de stock ; la photo de la page source les remplacera quand elle existe).
