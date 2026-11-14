export type Attribution = { site: string; author: string; license: 'CC BY-SA 4.0'; licenseUrl: string };

const LICENSE_URL = 'https://creativecommons.org/licenses/by-sa/4.0/';
const WIKIS: Record<string, Attribution> = {
  'en.wikibooks.org': { site: 'Wikibooks', author: 'Wikibooks contributors', license: 'CC BY-SA 4.0', licenseUrl: LICENSE_URL },
  'fr.wikibooks.org': { site: 'Wikilivres', author: 'Contributeurs de Wikilivres', license: 'CC BY-SA 4.0', licenseUrl: `${LICENSE_URL}deed.fr` },
};

export function attributionFor(sourceUrl: string | null): Attribution | null {
  if (!sourceUrl || !URL.canParse(sourceUrl)) return null;
  return WIKIS[new URL(sourceUrl).hostname] ?? null;
}
