import { fill } from '@/lib/i18n';

type Copy = { asWritten: string; forYou: string };

export function ingredientLabel(raw: string, scaled: string | null, copy: Copy, servings: number, people: number) {
  if (scaled === null) return raw;
  return `${fill(copy.asWritten, { servings })}: ${raw}. ${fill(copy.forYou, { people })}: ${scaled}`;
}
