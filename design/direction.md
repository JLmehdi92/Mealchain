# Demidemi — direction artistique

## Nom

**Demidemi**, écrit en un mot, majuscule initiale seulement. La moitié de la brique de crème lundi, l'autre
moitié mercredi : le nom dit le mécanisme du produit. « Demi » se dit pareil en anglais (demi-glace,
demitasse) et en français, et le redoublement le rend facile à retenir.

| | Nom affiché App Store (30 caractères max) |
|---|---|
| US | `Demidemi: Meal Plan, No Waste` (29) |
| FR | `Demidemi : repas sans gaspi` (27) |

Méthode et preuves : `naming/brief.md` (cadre Diamond de Lexicon), `naming/generate.mjs` (matrice de
1 505 candidats), `naming/screen.md` (tri linguistique), `naming/research.md` (test de crédibilité par les
4 personas : Demidemi 54/80, devant Finou 45 et Zerest 44), `names.json` (vérifications).
App Store US et FR : aucune app de ce nom. `demidemi.app` libre, `demidemi.com` déjà enregistré.
Reste à faire avant le dépôt : recherche de marque USPTO et INPI.

Règle de ton qui découle du nom : « demi » ne s'emploie que pour les paquets. Les allergies ne sont jamais
« à moitié » : elles sont présentées comme des règles absolues.

## Positionnement

EN : Demidemi plans your week from your own recipes, so every pack you open gets finished.
FR : Demidemi compose votre semaine à partir de vos recettes, pour que chaque paquet ouvert soit fini.

## Direction (Taste Skill)

Distribuée par `start.mjs deal` (type `software`, application grand public, rayons `round`), première
proposition retenue comme le veut la skill :
- palette **rose-grey-green** : fond pierre rosée, encre chaude, accent vert basilic ;
- typographies **Urbanist + DM Mono** (« apps et logiciels grand public : formes géométriques douces ») ;
- marque tirée au sort dans la liste de la skill : **dots**.

Pourquoi elle tient pour une cuisine de semaine : le fond rappelle un plan de travail en pierre et le
papier kraft, le vert est celui des herbes fraîches qu'on finit enfin, et il laisse le rouge libre pour les
allergènes.

## Palette

| Rôle | Clair | Sombre | Usage |
|---|---|---|---|
| `paper` fond | `#EBE5E3` | `#1D1A17` | Fond des écrans |
| `surface` | `#E1DAD7` | `#2B2622` | Groupes, champs |
| `sheet` | `#FAF7F6` | `#36312D` | Cartes, feuilles |
| `ink` | `#2B2622` | `#EBE5E3` | Texte principal |
| `ink-2` | `#655C58` | `#A29C99` | Texte secondaire |
| `action` | `#0F7D45` (texte blanc) | `#EBE5E3` (texte encre) | Bouton principal |
| `strand` | `#0F7D45` | `#3DBB7A` | Le fil qui relie les repas, la jauge, la sélection |
| `strand-ink` | `#0B6B3A` | `#3DBB7A` | Vert en texte |
| `chili` | `#B3261E` | `#FF6B5E` | **Uniquement** allergène, exclusion, suppression |

Contrastes mesurés : `ink`/fond 12,0:1 ; `ink-2`/fond 5,2:1 ; texte blanc sur `action` 5,2:1 ;
`strand-ink`/fond 5,3:1 ; `strand` en graphisme 4,2:1 ; `chili`/fond 5,2:1 ; sombre au-dessus de 6,2:1.
Aucune information ne repose sur la couleur seule : une exclusion porte toujours un mot et une icône.

## Typographies

- **Urbanist** 500 pour les titres, 600 pour le mot-logo (OFL, `brand/fonts/`).
- **SF Pro** pour le texte courant : Dynamic Type et lisibilité, choix d'accessibilité assumé face à la
  paire distribuée.
- **DM Mono** pour les quantités de la liste de courses et des jauges (« 1 pot 20 cl »), alignées.
- Casse phrase partout, poids 400 à 600, aucune capitale espacée.

## Logo et icône

- **Marque** (`brand/mark.svg`) : un rond coupé en deux. La première moitié reste en place, la seconde,
  verte, passe au-dessus et vers la droite : le reste du paquet qui part vers le repas suivant. Deux
  moitiés, « demi + demi ».
- **Mot-logo** (`brand/logo-light.svg`, `brand/logo-dark.svg`) : « demidemi » en Urbanist 600,
  vectorisé, en minuscules.
- **Icône** (`brand/icon.svg`, `brand/icon-1024.png`) : la marque sur fond encre. Lisible à 40 pt.

## Signature dans l'interface

- **Le fil** : un trait vert de 2 pt qui relie le paquet entamé au repas qui le finit, dans le plan de la
  semaine.
- **La jauge de paquet** : une barre en deux segments ou plus (« lun. 10 cl · mer. 10 cl »). Un reste non
  utilisé est hachuré et chiffré, jamais caché.
- **L'étiquette d'allergène** : allergène en gras dans les ingrédients, comme sur un emballage européen.

## Iconographie

SF Symbols pour l'interface. Pictogrammes d'emballage dessinés au trait (brique, boîte, pot, botte, sachet,
barquette, boîte d'œufs) sur la grille de SF Symbols. Aucun émoji, aucune feuille « éco ».

## Ton

Exact, direct, chaleureux. Vouvoiement en français. Boutons : un verbe et un objet. On dit ce qu'on ne sait
pas (« 2 ingrédients à vérifier »). Jamais « garanti sans allergène » : « Filtre basé sur les ingrédients
saisis. Ne remplace pas un avis médical. »

| Moment | EN | FR |
|---|---|---|
| Plan prêt | 5 dinners. 3 packs finished, nothing left over. | 5 dîners. 3 paquets finis, aucun reste. |
| Reste réutilisé | The other 4 fl oz of cream goes into Wednesday's gratin. | Les 10 cl de crème restants vont dans le gratin de mercredi. |
| Import à vérifier | 2 ingredients need a look. We left them as written. | 2 ingrédients à vérifier. Nous les avons laissés tels quels. |
| Exclusion | Left out: contains cashews (tree nuts). | Écartée : contient des noix de cajou (fruits à coque). |

## Mouvement

Ressorts sans rebond partout ; un seul léger dépassement : la moitié verte qui se pose sur le repas qui la
finit. Haptique : `selection`, `light` au cochage, `success` au plan prêt et à l'abonnement. « Réduire les
animations » : fondus de 150 ms.

## Ce que la DA s'interdit

Dégradés de teinte, lueurs, verre décoratif ; violet ; émojis et badges ; images générées par IA ; cartes
identiques en grille ; capitales espacées ; rouge `chili` pour autre chose qu'une allergie, une exclusion ou
une suppression ; « demi » appliqué à une allergie.
