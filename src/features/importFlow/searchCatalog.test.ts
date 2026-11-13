import { searchCatalog } from './searchCatalog';

describe('searchCatalog', () => {
  it('finds an ingredient by its name, ignoring case and accents', () => {
    expect(searchCatalog('CREME FRAICHE', 'fr').map((i) => i.id)).toContain('creme_fraiche');
  });

  it('finds an ingredient by a synonym', () => {
    expect(searchCatalog('French bread', 'en').map((i) => i.id)).toContain('baguette');
  });

  it('lists the whole catalog by name when the query is empty', () => {
    const all = searchCatalog('  ', 'en');
    expect(all.length).toBeGreaterThan(300);
    expect(all.map((i) => i.name.en)).toEqual([...all.map((i) => i.name.en)].sort((a, b) => a.localeCompare(b, 'en')));
  });

  it('finds nothing for an unknown word', () => {
    expect(searchCatalog('zzqx', 'en')).toEqual([]);
  });
});
