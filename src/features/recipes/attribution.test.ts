import { attributionFor } from './attribution';

describe('attributionFor', () => {
  it('credits Wikibooks contributors under CC BY-SA 4.0', () => {
    expect(attributionFor('https://en.wikibooks.org/wiki/Cookbook:Coddle')).toEqual({
      site: 'Wikibooks',
      author: 'Wikibooks contributors',
      license: 'CC BY-SA 4.0',
      licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
    });
  });

  it('credits Wikilivres contributors with the French licence deed', () => {
    expect(attributionFor('https://fr.wikibooks.org/wiki/Livre_de_cuisine/Axoa')).toEqual({
      site: 'Wikilivres',
      author: 'Contributeurs de Wikilivres',
      license: 'CC BY-SA 4.0',
      licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/deed.fr',
    });
  });

  it.each([null, 'https://example.com/wikibooks.org/x', 'https://en.wikibooks.org.evil.com/x', 'not a url'])('credits nothing for %s', (url) => {
    expect(attributionFor(url)).toBeNull();
  });
});
