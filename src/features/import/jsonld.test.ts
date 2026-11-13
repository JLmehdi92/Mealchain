import { extractRecipe } from './jsonld';

const url = 'https://example.com/r';
const page = (...blocks: string[]) => `<html><head>${blocks.join('\n')}</head><body>x</body></html>`;
const ld = (data: unknown) => `<script type="application/ld+json">${JSON.stringify(data)}</script>`;

describe('extractRecipe', () => {
  it('reads a full recipe node', () => {
    const html = page(
      ld({
        '@type': 'Recipe',
        name: 'Mac &amp; Cheese',
        recipeYield: '4 servings',
        totalTime: 'PT1H30M',
        recipeIngredient: ['  1 cup milk ', 'Grandma&#39;s cheese', '&frac12; tsp salt'],
        recipeInstructions: 'Boil pasta.\n\nDrain.',
        image: 'https://example.com/a.jpg',
      }),
    );
    expect(extractRecipe(html, url)).toEqual({
      title: 'Mac & Cheese',
      servings: 4,
      totalMinutes: 90,
      ingredients: ['1 cup milk', "Grandma's cheese", '½ tsp salt'],
      steps: ['Boil pasta.', 'Drain.'],
      imageUrl: 'https://example.com/a.jpg',
      sourceUrl: url,
    });
  });

  it('finds the recipe inside @graph with varied script attributes', () => {
    const graph = { '@context': 'https://schema.org', '@graph': [{ '@type': 'WebPage' }, { '@type': ['Recipe', 'NewsArticle'], name: 'Soup' }] };
    const html = `<SCRIPT data-x='1' TYPE='application/ld+json'>${JSON.stringify(graph)}</SCRIPT>`;
    expect(extractRecipe(html, url)).toEqual({ title: 'Soup', ingredients: [], steps: [], sourceUrl: url });
  });

  it('finds the recipe in a top-level array', () => {
    expect(extractRecipe(page(ld([{ '@type': 'Person' }, { '@type': 'Recipe', name: 'Tart' }])), url)?.title).toBe('Tart');
  });

  it('skips an invalid JSON block and uses the next valid one', () => {
    const html = page('<script type="application/ld+json">{ not json</script>', ld({ '@type': 'Recipe', name: 'Stew' }));
    expect(extractRecipe(html, url)?.title).toBe('Stew');
  });

  it('returns null when no recipe is present', () => {
    expect(extractRecipe(page(ld({ '@type': 'Organization' }), '<script>var a = 1;</script>'), url)).toBeNull();
    expect(extractRecipe(page(ld([{ '@type': 'Person' }, 7])), url)).toBeNull();
    expect(extractRecipe('<p>nothing</p>', url)).toBeNull();
  });

  it.each([
    [6, 6],
    ['4', 4],
    [['4', '4 servings'], 4],
    ['Serves 2-3', 2],
    ['a few', undefined],
  ])('maps recipeYield %p to servings %p', (recipeYield, servings) => {
    expect(extractRecipe(page(ld({ '@type': 'Recipe', recipeYield })), url)?.servings).toBe(servings);
  });

  it.each([
    [{ totalTime: 'PT45M' }, 45],
    [{ totalTime: 'P0DT2H' }, 120],
    [{ prepTime: 'PT15M', cookTime: 'PT1H' }, 75],
    [{ cookTime: 'PT20M' }, 20],
    [{ totalTime: 'soon' }, undefined],
    [{}, undefined],
  ])('maps durations %p to %p minutes', (times, minutes) => {
    expect(extractRecipe(page(ld({ '@type': 'Recipe', ...times })), url)?.totalMinutes).toBe(minutes);
  });

  it('flattens HowToStep and HowToSection instructions', () => {
    const recipeInstructions = [
      { '@type': 'HowToSection', name: 'Dough', itemListElement: [{ '@type': 'HowToStep', text: 'Mix flour.' }, 'Knead.'] },
      { '@type': 'HowToStep', text: 'Bake &amp; serve.' },
      { '@type': 'HowToStep', name: 'Rest' },
      '  ',
      42,
    ];
    expect(extractRecipe(page(ld({ '@type': 'Recipe', recipeInstructions })), url)?.steps).toEqual(['Mix flour.', 'Knead.', 'Bake & serve.', 'Rest']);
  });

  it.each([
    [{ url: 'https://example.com/b.jpg' }, 'https://example.com/b.jpg'],
    [['https://example.com/c.jpg', 'https://example.com/d.jpg'], 'https://example.com/c.jpg'],
    [[{ '@type': 'ImageObject', url: 'https://example.com/e.jpg' }], 'https://example.com/e.jpg'],
    [{ width: 4 }, undefined],
    ['javascript:alert(1)', undefined],
  ])('maps image %p', (image, imageUrl) => {
    expect(extractRecipe(page(ld({ '@type': 'Recipe', image })), url)?.imageUrl).toBe(imageUrl);
  });

  it('ignores non-string ingredients and a blank name', () => {
    const raw = extractRecipe(page(ld({ '@type': 'Recipe', name: '  ', recipeIngredient: ['2 eggs', 3, null, ''] })), url);
    expect(raw).toEqual({ ingredients: ['2 eggs'], steps: [], sourceUrl: url });
  });

  it('decodes numeric hex entities and leaves unknown ones', () => {
    const raw = extractRecipe(page(ld({ '@type': 'Recipe', recipeIngredient: ['&#x2F;&#0;&quot;&lt;&gt;&nbsp;x &bogus;'] })), url);
    expect(raw?.ingredients).toEqual(['/&#0;"<>\u00a0x &bogus;']);
  });
});
