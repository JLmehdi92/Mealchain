# Ingrédients à relire par un humain

Généré depuis le champ `review` de `data/ingredients.json` (123 entrées sur 324). Priorité : les notes qui touchent un allergène ou un régime.

## Décisions à trancher

- **Vinaigres de vin** : exclus du halal par prudence ; ils sont généralement considérés comme halal.
- **Pâte brisée** (US) : certaines marques contiennent du saindoux ; non exclue du végétarien ni du halal pour l’instant.
- **Fromages à présure animale** : les AOP (parmesan, comté, gruyère…) sont exclus du végétarien ; brie, feta, chèvre dépendent de la marque.
- **Viandes et halal** : seules les viandes de porc sont exclues ; le halal réel dépend d’une viande certifiée.
- **Lait sans lactose** : absent du référentiel (contient l’allergène lait mais convient au régime sans lactose).
- **Levure chimique** : marquée gluten (amidon de blé fréquent en France).

## bakery

| id | nom | allergènes | note |
|---|---|---|---|
| burger_bun | Pains à burger | gluten | Often topped with sesame; brioche buns contain eggs and milk. |
| corn_tortilla | Tortillas de maïs | — | Some brands blend corn with wheat flour. |
| naan | Naan | gluten, milk | Usually made with yogurt; some recipes add eggs. |
| pie_crust | Pâte brisée | gluten, milk | Some US refrigerated crusts contain lard (not halal, not vegetarian); some use no butter. |
| puff_pastry | Pâte feuilletée | gluten, milk | All-butter in FR; many US brands use vegetable shortening (no milk). |
| sandwich_bread | Pain de mie | gluten | Many US loaves also contain milk or soy; check label. |

## condiments

| id | nom | allergènes | note |
|---|---|---|---|
| balsamic_vinegar | Vinaigre balsamique | sulphites | Sulphites usually present but not in every brand. |
| capers | Câpres | — | Pack sizes are net weight with brine; drained weight is about half. |
| dijon_mustard | Moutarde de Dijon | mustard, sulphites | Sulphites present in most French Dijon, not all. |
| gochujang | Gochujang | soy, gluten | Most brands use wheat or barley; a few are gluten-free. |
| green_curry_paste | Pâte de curry vert | crustaceans, fish | Traditional recipes contain shrimp paste and fish sauce; some brands are vegan. |
| hoisin_sauce | Sauce hoisin | soy, gluten | Wheat and sesame vary by brand. |
| mayonnaise | Mayonnaise | eggs, mustard | US mayo often has no mustard; FR mayo usually does. |
| miso | Pâte miso | soy | Barley (mugi) miso contains gluten. |
| oyster_sauce | Sauce d'huître | molluscs, soy, gluten | Soy and wheat vary by brand; some are gluten-free. |
| pesto | Pesto au basilic (bocal) | milk, nuts | Many jars use cashews instead of pine nuts; Parmigiano uses animal rennet (vegetarian). |
| red_curry_paste | Pâte de curry rouge | crustaceans, fish | Traditional recipes contain shrimp paste and fish sauce; some brands are vegan. |
| red_wine_vinegar | Vinaigre de vin rouge | sulphites | Wine vinegar is generally considered halal; excluded only because catalog rules exclude anything named wine. |
| white_wine_vinegar | Vinaigre de vin blanc | sulphites | Wine vinegar is generally considered halal; excluded only because catalog rules exclude anything named wine. |
| whole_grain_mustard | Moutarde à l'ancienne | mustard, sulphites | Sulphites present in most French brands, not all. |
| worcestershire_sauce | Sauce Worcestershire | fish, gluten | Contains anchovies; US recipes often gluten-free, UK/FR use malt vinegar. |

## dairy

| id | nom | allergènes | note |
|---|---|---|---|
| blue_cheese | fromage bleu | milk | Roquefort/gorgonzola PDO use animal rennet. |
| brie | brie | milk | Brie de Meaux AOP uses animal rennet; supermarket brie varies. |
| camembert | camembert | milk | Camembert de Normandie AOP uses animal rennet. |
| comte | comté | milk | Comté AOP requires animal rennet. |
| egg | œuf | eggs | FR medium egg ~55 g; US large ~50 g without shell. |
| emmental | emmental | milk | Traditionally made with animal rennet; vegetarian versions exist. |
| evaporated_milk | lait concentré non sucré | milk | Shelf-stable; may belong to pantry aisle. |
| feta | feta | milk | Traditional feta may use animal rennet; many brands vegetarian. |
| fresh_cheese_ravioli | Ravioli frais au fromage | gluten, eggs, milk | Fillings vary (meat, mushroom); check label. |
| fromage_blanc | fromage blanc | milk | Hard to find in US; quark tub assumed. |
| ghee | ghee | milk | Near lactose-free but kept as milk. |
| gnocchi | Gnocchis | gluten | Some brands contain eggs. |
| goat_cheese | fromage de chèvre | milk | Aged goat cheeses may use animal rennet. |
| grana_padano | grana padano | milk | Grana Padano PDO requires animal rennet. |
| gruyere | gruyère | milk | Gruyère AOP made with animal rennet. In FR, 'gruyère râpé' often means emmental. |
| half_and_half | mélange lait et crème | milk | No direct FR equivalent; light cream carton used as FR pack. |
| halloumi | halloumi | milk | Traditional halloumi may use animal rennet. |
| monterey_jack | Monterey Jack | milk | Rare in FR stores. |
| oat_drink | boisson à l'avoine | — | Oats may contain gluten traces; not marked gluten. |
| parmesan | parmesan | milk | Parmigiano-Reggiano PDO requires animal rennet; generic 'parmesan' may be vegetarian. |
| pecorino | pecorino | milk | Traditionally made with animal rennet; vegetarian versions exist. |
| plain_yogurt | yaourt nature | milk | FR 4x125 g yaourt pack modeled as 500 g pack. |
| raclette_cheese | fromage à raclette | milk | Rennet varies by brand. |
| reblochon | reblochon | milk | AOP uses animal rennet; rarely sold in US (raw-milk rules). |
| sour_cream | crème aigre | milk | Rare in FR stores; crème fraîche pot used as FR pack. |
| sweetened_condensed_milk | lait concentré sucré | milk | Shelf-stable; may belong to pantry aisle. FR tube packed as 'pack'. |

## drinks

| id | nom | allergènes | note |
|---|---|---|---|
| hard_cider | Cidre | sulphites | In the US 'apple cider' often means non-alcoholic juice. |
| lemon_juice | Jus de citron | sulphites | Bottled brands often contain sulphites; fresh-squeezed does not. |

## fish

| id | nom | allergènes | note |
|---|---|---|---|
| canned_tuna | thon en boîte | fish | weights are drained-weight approximations; FR 3-can pack assumes 112 g drained each |

## meat

| id | nom | allergènes | note |
|---|---|---|---|
| chicken_breast | blanc de poulet | — | halal depends on certified meat |
| chorizo | chorizo | sulphites | sulphites common but not universal; Mexican fresh chorizo differs; check label for gluten or milk |
| duck_breast | magret de canard | — | duck filed under the chicken protein category |
| duck_leg | cuisse de canard | — | duck filed under the chicken protein category |
| ground_pork | porc haché | — | chair à saucisse is seasoned sausage meat, close but not identical |
| ground_turkey | dinde hachée | — | turkey filed under the chicken protein category |
| lardons | lardons | — | US rarely sells lardons; packs modelled on diced pancetta |
| pork_sausage | saucisse de porc | gluten, sulphites | gluten and sulphites depend on brand (rusk, preservatives); verify label |
| smoked_sausage | saucisse fumée | sulphites | sulphites and gluten depend on brand; some contain beef or turkey |
| turkey_breast | escalope de dinde | — | turkey filed under the chicken protein category |

## pantry

| id | nom | allergènes | note |
|---|---|---|---|
| baking_powder | Levure chimique | gluten | Many FR brands use wheat starch (gluten); US baking powder is usually cornstarch-based and gluten-free. |
| beef_stock | Bouillon de bœuf | celery | Celery varies by brand; halal-certified stock exists. |
| beef_stock_cube | Bouillon cube de bœuf | celery, gluten | Cube ~10 g; often contains celery and wheat, sometimes milk; varies by brand. |
| breadcrumbs | Chapelure | gluten | Some brands add milk or egg; check the label. |
| brown_sugar | Sucre roux | — | Some US cane sugar is refined with bone char; not excluded from vegan here. |
| canned_black_beans | Haricots noirs en conserve | — | Pack sizes are net weight; drained weight is roughly 60% of net. |
| canned_chickpeas | Pois chiches en conserve | — | Pack sizes are net weight; drained weight is roughly 60% of net. |
| canned_kidney_beans | Haricots rouges en conserve | — | Pack sizes are net weight; drained weight is roughly 60% of net. |
| canned_white_beans | Haricots blancs en conserve | — | Pack sizes are net weight; drained weight is roughly 60% of net. |
| chicken_stock | Bouillon de volaille | celery | Celery varies by brand; halal-certified stock exists. |
| chicken_stock_cube | Bouillon cube de volaille | celery, gluten | Cube ~10 g; often contains celery and wheat, sometimes milk; varies by brand. |
| chocolate_chips | Pépites de chocolat | milk, soy | Often contains milk solids and soy lecithin; some brands are dairy- and soy-free. |
| dark_chocolate | Chocolat noir | milk, soy | Often contains milk solids and soy lecithin; some brands are dairy- and soy-free. |
| dates | Dattes | — | Piece weight assumes pitted deglet nour (about 8 g); medjool dates are about 24 g. |
| dried_apricots | Abricots secs | sulphites | Bright orange apricots are sulphured; unsulphured (brown) ones exist. |
| lasagna_sheets | Feuilles de lasagne | gluten | Piece weight varies by brand (about 17-22 g per dry sheet). |
| pine_nuts | Pignons de pin | nuts | Pine nuts are not on the EU tree-nut list; flagged as nuts conservatively. |
| raisins | Raisins secs | — | Golden raisins and sultanas are usually treated with sulphites; dark raisins usually are not. |
| ramen_noodles | Nouilles ramen | gluten | Instant ramen seasoning often contains soy and sometimes egg; check the label. |
| rolled_oats | Flocons d'avoine | gluten | Oats are often cross-contaminated with wheat; certified gluten-free oats exist but are not distinguished here. |
| vanilla_extract | Extrait de vanille | — | Pure vanilla extract is at least 35% alcohol; alcohol-free vanilla flavoring exists. |
| vegetable_stock | Bouillon de légumes | celery | Celery varies by brand. |
| vegetable_stock_cube | Bouillon cube de légumes | celery, gluten | Cube ~10 g; often contains celery and wheat, sometimes milk; varies by brand. |
| white_sugar | Sucre en poudre | — | Some US cane sugar is refined with bone char; not excluded from vegan here. |

## produce

| id | nom | allergènes | note |
|---|---|---|---|
| avocado | Avocat | — | Weight varies 140-300 g |
| baby_spinach | Pousses d'épinard | — | Density is for loosely packed raw leaves |
| banana | Banane | — | Weight without peel |
| beet | Betterave crue | — | US bunch usually 3-4 beets with greens |
| broccoli | Brocoli | — | Density is for florets |
| butternut_squash | Courge butternut | — | Piece weight varies 800-2000 g |
| button_mushroom | Champignons de Paris | — | Density is for sliced mushrooms |
| carrot | Carotte | — | Density is for chopped carrot |
| cauliflower | Chou-fleur | — | Head weight varies 600-1200 g; density for florets |
| celeriac | Céleri-rave | celery | Piece weight varies 500-1000 g |
| celery | Céleri branche | celery | gramsPerPiece is one stalk; head weight varies 400-900 g |
| cilantro | Coriandre fraîche | — | Bunch weight varies 30-80 g |
| corn_on_the_cob | Épi de maïs | — | One ear yields about 150 g of kernels |
| cremini_mushroom | Champignons bruns | — | Density is for sliced mushrooms |
| cucumber | Concombre | — | US slicing cucumbers ~250 g, English and French ~400 g |
| eggplant | Aubergine | — | Piece weight varies 200-450 g |
| garlic | Ail | — | Base unit is one clove; packs assume ~10 cloves per head |
| green_cabbage | Chou blanc | — | Head weight varies 700-1500 g; density for shredded |
| jalapeno | Piment jalapeño | — | Less common fresh in France |
| kale | Chou kale | — | US bunch weighs ~250-350 g; density is for chopped raw leaves |
| leek | Poireau | — | Piece weight varies 150-400 g |
| lemon | Citron | — | Yields about 45 ml juice |
| lime | Citron vert | — | Yields about 30 ml juice |
| mango | Mangue | — | Weight varies 250-600 g |
| parsley | Persil plat | — | Bunch weight varies 30-80 g |
| potato | Pomme de terre | — | Piece weight varies 120-300 g |
| pumpkin | Potiron | — | Sold whole in US, often in pieces in France; weight varies a lot |
| red_cabbage | Chou rouge | — | Head weight varies 700-1500 g; density for shredded |
| red_chili | Piment rouge frais | — | Size varies a lot by variety |
| romaine | Laitue romaine | — | Piece is one head; hearts weigh ~200 g |
| savoy_cabbage | Chou vert frisé | — | Head weight varies a lot |
| scallion | Oignon nouveau | — | Bunch size varies 6-10 stems |
| sweet_onion | Oignon doux | — | Mostly a US product; French equivalent is oignon doux des Cévennes, smaller |
| sweet_potato | Patate douce | — | Piece weight varies 150-450 g |
| swiss_chard | Blettes | — | Bunch weight varies 300-1000 g |
| tomato | Tomate | — | Piece weight varies 80-250 g |
| zucchini | Courgette | — | Piece weight varies 150-300 g |

## spices

| id | nom | allergènes | note |
|---|---|---|---|
| curry_powder | Curry en poudre | — | Some blends contain mustard or celery. |
| salt | Sel | — | Kosher salt is about half as dense as table salt by volume. |

