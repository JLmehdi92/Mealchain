import type { RecipeUnit } from '../ingredients/units';
import type { Equipment, Recipe } from './types';

type Language = 'en' | 'fr';
type Written = [qty: number, unit: RecipeUnit, raw: string];
type Line = { id: string; en: Written; fr: Written };
type Text = { title: string; steps: string[] };
type Sample = { id: string; minutes: number; equipment: Equipment[]; lines: Line[]; en: Text; fr: Text };

const line = (id: string, en: Written, fr: Written): Line => ({ id, en, fr });

const SAMPLES: Sample[] = [
  {
    id: 'sample-leek-spinach-orzo',
    minutes: 30,
    equipment: ['stovetop'],
    lines: [
      line('leek', [2, 'piece', '2 leeks'], [2, 'piece', '2 poireaux']),
      line('garlic', [2, 'piece', '2 garlic cloves'], [2, 'piece', "2 gousses d'ail"]),
      line('olive_oil', [1, 'tbsp', '1 tbsp olive oil'], [1, 'tbsp', "1 c. à soupe d'huile d'olive"]),
      line('orzo', [10, 'oz', '10 oz orzo'], [300, 'g', "300 g d'orzo"]),
      line('vegetable_stock', [3, 'cup', '3 cups vegetable stock'], [75, 'cl', '75 cl de bouillon de légumes']),
      line('heavy_cream', [0.5, 'cup', '½ cup heavy cream'], [10, 'cl', '10 cl de crème liquide entière']),
      line('baby_spinach', [2, 'oz', '2 oz baby spinach'], [60, 'g', "60 g de pousses d'épinards"]),
      line('parmesan', [1.5, 'oz', '1½ oz parmesan, grated'], [40, 'g', '40 g de parmesan râpé']),
    ],
    en: {
      title: 'Creamy leek and spinach orzo',
      steps: [
        'Slice the leeks into thin rounds and rinse. Cook them in the olive oil over medium heat for 6 minutes with the sliced garlic.',
        'Add the orzo, stir for 1 minute, then pour in the stock. Simmer for 10 minutes, stirring often.',
        'Stir in the cream and the spinach until the spinach wilts. Finish with the parmesan.',
      ],
    },
    fr: {
      title: "Orzo crémeux aux poireaux et pousses d'épinards",
      steps: [
        "Émincez les poireaux en fines rondelles et rincez-les. Faites-les revenir 6 minutes à feu moyen dans l'huile d'olive avec l'ail émincé.",
        "Ajoutez l'orzo, remuez 1 minute, puis versez le bouillon. Laissez mijoter 10 minutes en remuant souvent.",
        "Incorporez la crème et les épinards jusqu'à ce qu'ils tombent. Terminez avec le parmesan.",
      ],
    },
  },
  {
    id: 'sample-potato-leek-gratin',
    minutes: 70,
    equipment: ['oven', 'stovetop'],
    lines: [
      line('potato', [2, 'lb', '2 lb potatoes'], [1, 'kg', '1 kg de pommes de terre']),
      line('leek', [1, 'piece', '1 leek'], [1, 'piece', '1 poireau']),
      line('garlic', [1, 'piece', '1 garlic clove'], [1, 'piece', "1 gousse d'ail"]),
      line('heavy_cream', [0.5, 'cup', '½ cup heavy cream'], [10, 'cl', '10 cl de crème liquide entière']),
      line('whole_milk', [1, 'cup', '1 cup whole milk'], [25, 'cl', '25 cl de lait entier']),
      line('shredded_cheese', [3, 'oz', '3 oz shredded cheese'], [80, 'g', '80 g de fromage râpé']),
      line('butter', [1, 'tbsp', '1 tbsp butter'], [15, 'g', '15 g de beurre']),
    ],
    en: {
      title: 'Potato and leek gratin',
      steps: [
        'Heat the oven to 375°F. Rub a baking dish with the halved garlic clove, then with the butter.',
        'Slice the potatoes thinly and the leek into rounds. Layer them in the dish.',
        'Warm the milk and cream, pour over the potatoes and scatter the cheese on top.',
        'Bake for 50 minutes, until a knife slides through the potatoes.',
      ],
    },
    fr: {
      title: 'Gratin de pommes de terre aux poireaux',
      steps: [
        "Préchauffez le four à 190 °C. Frottez un plat avec la gousse d'ail coupée en deux, puis beurrez-le.",
        'Coupez les pommes de terre en fines lamelles et le poireau en rondelles. Disposez-les en couches dans le plat.',
        'Faites tiédir le lait et la crème, versez sur les pommes de terre et parsemez de fromage.',
        "Enfournez 50 minutes, jusqu'à ce qu'un couteau traverse les pommes de terre.",
      ],
    },
  },
  {
    id: 'sample-spinach-feta-frittata',
    minutes: 25,
    equipment: ['oven', 'stovetop'],
    lines: [
      line('egg', [8, 'piece', '8 eggs'], [8, 'piece', '8 œufs']),
      line('baby_spinach', [3, 'oz', '3 oz baby spinach'], [65, 'g', "65 g de pousses d'épinards"]),
      line('feta', [4, 'oz', '4 oz feta'], [100, 'g', '100 g de feta']),
      line('red_onion', [1, 'piece', '1 red onion'], [1, 'piece', '1 oignon rouge']),
      line('olive_oil', [1, 'tbsp', '1 tbsp olive oil'], [1, 'tbsp', "1 c. à soupe d'huile d'olive"]),
      line('black_pepper', [0.25, 'tsp', '¼ tsp black pepper'], [0.25, 'tsp', '¼ c. à café de poivre noir']),
    ],
    en: {
      title: 'Spinach and feta frittata',
      steps: [
        'Heat the oven to 400°F. Soften the sliced onion in the olive oil in an ovenproof skillet for 5 minutes.',
        'Add the spinach and stir until it wilts.',
        'Beat the eggs with the pepper, pour into the skillet and crumble the feta over the top.',
        'Cook for 3 minutes on the stove, then bake for 10 minutes, until set in the middle.',
      ],
    },
    fr: {
      title: 'Frittata aux épinards et à la feta',
      steps: [
        "Préchauffez le four à 200 °C. Faites fondre l'oignon émincé 5 minutes dans l'huile d'olive, dans une poêle qui va au four.",
        "Ajoutez les épinards et remuez jusqu'à ce qu'ils tombent.",
        'Battez les œufs avec le poivre, versez-les dans la poêle et émiettez la feta par-dessus.',
        "Laissez cuire 3 minutes sur le feu, puis 10 minutes au four, jusqu'à ce que le centre soit pris.",
      ],
    },
  },
  {
    id: 'sample-red-lentil-coconut-dal',
    minutes: 35,
    equipment: ['stovetop'],
    lines: [
      line('red_lentils', [10, 'oz', '10 oz red lentils'], [300, 'g', '300 g de lentilles corail']),
      line('coconut_milk', [0.75, 'cup', '¾ cup coconut milk'], [20, 'cl', '20 cl de lait de coco']),
      line('diced_tomatoes', [14.5, 'oz', '1 can (14.5 oz) diced tomatoes'], [400, 'g', '1 boîte (400 g) de tomates en dés']),
      line('vegetable_stock', [2, 'cup', '2 cups vegetable stock'], [50, 'cl', '50 cl de bouillon de légumes']),
      line('yellow_onion', [1, 'piece', '1 yellow onion'], [1, 'piece', '1 oignon jaune']),
      line('garlic', [3, 'piece', '3 garlic cloves'], [3, 'piece', "3 gousses d'ail"]),
      line('ginger', [0.75, 'oz', '¾ oz fresh ginger'], [20, 'g', '20 g de gingembre frais']),
      line('curry_powder', [2, 'tsp', '2 tsp curry powder'], [2, 'tsp', '2 c. à café de curry en poudre']),
      line('baby_spinach', [2, 'oz', '2 oz baby spinach'], [60, 'g', "60 g de pousses d'épinards"]),
      line('basmati_rice', [10, 'oz', '10 oz basmati rice'], [300, 'g', '300 g de riz basmati']),
    ],
    en: {
      title: 'Red lentil and coconut dal',
      steps: [
        'Cook the chopped onion, grated ginger and garlic in a splash of oil for 5 minutes. Add the curry powder for 30 seconds.',
        'Add the rinsed lentils, tomatoes and stock. Simmer for 20 minutes, until the lentils fall apart.',
        'Cook the rice meanwhile. Stir the coconut milk and spinach into the dal and serve over the rice.',
      ],
    },
    fr: {
      title: 'Dal de lentilles corail au lait de coco',
      steps: [
        "Faites revenir l'oignon haché, le gingembre râpé et l'ail 5 minutes dans un filet d'huile. Ajoutez le curry 30 secondes.",
        "Ajoutez les lentilles rincées, les tomates et le bouillon. Laissez mijoter 20 minutes, jusqu'à ce que les lentilles se défassent.",
        'Pendant ce temps, faites cuire le riz. Incorporez le lait de coco et les épinards au dal et servez sur le riz.',
      ],
    },
  },
  {
    id: 'sample-coconut-chicken-curry',
    minutes: 40,
    equipment: ['stovetop'],
    lines: [
      line('chicken_thigh', [1.5, 'lb', '1½ lb boneless chicken thighs'], [600, 'g', '600 g de hauts de cuisse de poulet désossés']),
      line('coconut_milk', [0.75, 'cup', '¾ cup coconut milk'], [20, 'cl', '20 cl de lait de coco']),
      line('red_bell_pepper', [2, 'piece', '2 red bell peppers'], [2, 'piece', '2 poivrons rouges']),
      line('yellow_onion', [1, 'piece', '1 yellow onion'], [1, 'piece', '1 oignon jaune']),
      line('garlic', [2, 'piece', '2 garlic cloves'], [2, 'piece', "2 gousses d'ail"]),
      line('ginger', [0.75, 'oz', '¾ oz fresh ginger'], [20, 'g', '20 g de gingembre frais']),
      line('curry_powder', [1, 'tbsp', '1 tbsp curry powder'], [1, 'tbsp', '1 c. à soupe de curry en poudre']),
      line('jasmine_rice', [10, 'oz', '10 oz jasmine rice'], [300, 'g', '300 g de riz jasmin']),
      line('cilantro', [0.5, 'oz', '½ oz cilantro'], [15, 'g', '15 g de coriandre fraîche']),
    ],
    en: {
      title: 'Coconut chicken curry with peppers',
      steps: [
        'Cut the chicken into bite-size pieces and brown them in a little oil for 6 minutes. Set aside.',
        'In the same pan, cook the sliced onion, peppers, garlic and grated ginger for 5 minutes. Add the curry powder.',
        'Return the chicken, pour in the coconut milk and simmer for 15 minutes. Cook the rice meanwhile.',
        'Serve over the rice with the chopped cilantro.',
      ],
    },
    fr: {
      title: 'Curry de poulet au lait de coco et aux poivrons',
      steps: [
        "Coupez le poulet en morceaux et faites-les dorer 6 minutes dans un peu d'huile. Réservez.",
        "Dans la même poêle, faites revenir l'oignon, les poivrons émincés, l'ail et le gingembre râpé 5 minutes. Ajoutez le curry.",
        'Remettez le poulet, versez le lait de coco et laissez mijoter 15 minutes. Pendant ce temps, faites cuire le riz.',
        'Servez sur le riz avec la coriandre ciselée.',
      ],
    },
  },
  {
    id: 'sample-salmon-lemon-cream',
    minutes: 25,
    equipment: ['oven', 'stovetop'],
    lines: [
      line('salmon_fillet', [4, 'piece', '4 salmon fillets'], [4, 'piece', '4 pavés de saumon']),
      line('heavy_cream', [0.5, 'cup', '½ cup heavy cream'], [10, 'cl', '10 cl de crème liquide entière']),
      line('lemon', [1, 'piece', '1 lemon'], [1, 'piece', '1 citron']),
      line('green_beans', [1, 'lb', '1 lb green beans'], [400, 'g', '400 g de haricots verts']),
      line('garlic', [1, 'piece', '1 garlic clove'], [1, 'piece', "1 gousse d'ail"]),
      line('butter', [1, 'tbsp', '1 tbsp butter'], [15, 'g', '15 g de beurre']),
      line('parsley', [0.25, 'oz', '¼ oz parsley'], [10, 'g', '10 g de persil']),
    ],
    en: {
      title: 'Salmon with lemon cream and green beans',
      steps: [
        'Heat the oven to 400°F. Bake the salmon for 12 minutes.',
        'Boil the green beans for 6 minutes, drain and toss with the butter.',
        'Warm the cream with the grated garlic, the lemon zest and the juice of half the lemon for 3 minutes.',
        'Spoon the sauce over the salmon and finish with the chopped parsley.',
      ],
    },
    fr: {
      title: 'Saumon à la crème citronnée et haricots verts',
      steps: [
        'Préchauffez le four à 200 °C. Enfournez le saumon 12 minutes.',
        "Faites cuire les haricots verts 6 minutes à l'eau bouillante, égouttez-les et enrobez-les de beurre.",
        "Faites chauffer 3 minutes la crème avec l'ail râpé, le zeste du citron et le jus d'une moitié.",
        'Nappez le saumon de sauce et terminez avec le persil ciselé.',
      ],
    },
  },
  {
    id: 'sample-shakshuka-feta',
    minutes: 35,
    equipment: ['stovetop'],
    lines: [
      line('crushed_tomatoes', [28, 'oz', '1 can (28 oz) crushed tomatoes'], [800, 'g', '2 boîtes (800 g) de tomates concassées']),
      line('red_bell_pepper', [1, 'piece', '1 red bell pepper'], [1, 'piece', '1 poivron rouge']),
      line('yellow_onion', [1, 'piece', '1 yellow onion'], [1, 'piece', '1 oignon jaune']),
      line('garlic', [2, 'piece', '2 garlic cloves'], [2, 'piece', "2 gousses d'ail"]),
      line('olive_oil', [2, 'tbsp', '2 tbsp olive oil'], [2, 'tbsp', "2 c. à soupe d'huile d'olive"]),
      line('cayenne_pepper', [0.25, 'tsp', '¼ tsp cayenne pepper'], [0.25, 'tsp', '¼ c. à café de piment de Cayenne']),
      line('egg', [4, 'piece', '4 eggs'], [4, 'piece', '4 œufs']),
      line('feta', [4, 'oz', '4 oz feta'], [100, 'g', '100 g de feta']),
      line('parsley', [0.25, 'oz', '¼ oz parsley'], [10, 'g', '10 g de persil']),
    ],
    en: {
      title: 'Shakshuka with feta',
      steps: [
        'Soften the sliced onion and pepper in the olive oil for 8 minutes. Add the garlic and cayenne.',
        'Pour in the tomatoes and simmer for 10 minutes, until thick.',
        'Make 4 hollows, crack an egg into each, cover and cook for 6 minutes.',
        'Crumble the feta over the top and add the chopped parsley.',
      ],
    },
    fr: {
      title: 'Chakchouka à la feta',
      steps: [
        "Faites fondre l'oignon et le poivron émincés 8 minutes dans l'huile d'olive. Ajoutez l'ail et le piment.",
        "Versez les tomates et laissez mijoter 10 minutes, jusqu'à ce que la sauce épaississe.",
        'Creusez 4 puits, cassez un œuf dans chacun, couvrez et laissez cuire 6 minutes.',
        'Émiettez la feta par-dessus et ajoutez le persil ciselé.',
      ],
    },
  },
  {
    id: 'sample-chicken-leek-pie',
    minutes: 55,
    equipment: ['oven', 'stovetop'],
    lines: [
      line('puff_pastry', [1, 'piece', '1 sheet puff pastry'], [1, 'piece', '1 pâte feuilletée']),
      line('chicken_breast', [1, 'lb', '1 lb chicken breast'], [400, 'g', '400 g de blanc de poulet']),
      line('leek', [1, 'piece', '1 leek'], [1, 'piece', '1 poireau']),
      line('button_mushroom', [8, 'oz', '8 oz button mushrooms'], [250, 'g', '250 g de champignons de Paris']),
      line('heavy_cream', [0.5, 'cup', '½ cup heavy cream'], [10, 'cl', '10 cl de crème liquide entière']),
      line('butter', [1, 'tbsp', '1 tbsp butter'], [15, 'g', '15 g de beurre']),
      line('herbes_de_provence', [1, 'tsp', '1 tsp herbes de Provence'], [1, 'tsp', "1 c. à café d'herbes de Provence"]),
      line('egg', [1, 'piece', '1 egg'], [1, 'piece', '1 œuf']),
    ],
    en: {
      title: 'Chicken, leek and mushroom pie',
      steps: [
        'Heat the oven to 400°F. Cook the sliced leek and mushrooms in the butter for 8 minutes.',
        'Add the diced chicken and herbs and cook for 5 minutes. Stir in the cream and spoon into a pie dish.',
        'Cover with the pastry, press the edges and brush with the beaten egg.',
        'Bake for 25 minutes, until the pastry is deep golden.',
      ],
    },
    fr: {
      title: 'Tourte au poulet, poireau et champignons',
      steps: [
        'Préchauffez le four à 200 °C. Faites revenir le poireau émincé et les champignons 8 minutes dans le beurre.',
        'Ajoutez le poulet en dés et les herbes, laissez cuire 5 minutes. Incorporez la crème et versez dans un moule.',
        "Couvrez de pâte, soudez les bords et badigeonnez d'œuf battu.",
        "Enfournez 25 minutes, jusqu'à ce que la pâte soit bien dorée.",
      ],
    },
  },
];

export function sampleRecipes(language: Language): Recipe[] {
  return SAMPLES.map((sample) => ({
    id: sample.id,
    title: sample[language].title,
    servings: 4,
    totalMinutes: sample.minutes,
    equipment: sample.equipment,
    ingredients: sample.lines.map(({ id, [language]: [qty, unit, raw] }) => ({ raw, qty, unit, ingredientId: id, status: 'matched' })),
    steps: sample[language].steps,
    source: 'web',
    sourceUrl: null,
    imageUrl: null,
    needsReview: [],
    createdAt: 0,
  }));
}
