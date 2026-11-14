export const MAX_LINE = 2000;
export const MAX_LINES = 200;
export const MAX_SERVINGS = 100;
export const MAX_PAGE_BYTES = 3_000_000;

type Lines = { title?: string; servings?: number; ingredients: string[]; steps: string[] };

const linesFit = (lines: string[]) => lines.length <= MAX_LINES && lines.every((line) => line.length <= MAX_LINE);

export function fitsLimits({ title, servings, ingredients, steps }: Lines): boolean {
  const servingsFit = servings === undefined || (Number.isInteger(servings) && servings >= 1 && servings <= MAX_SERVINGS);
  return servingsFit && (title ?? '').length <= MAX_LINE && linesFit(ingredients) && linesFit(steps);
}

export async function readCapped(body: ReadableStream<Uint8Array> | null, maxBytes = MAX_PAGE_BYTES): Promise<string | null> {
  const reader = body?.getReader();
  if (!reader) return null;
  const decoder = new TextDecoder();
  let text = '';
  let size = 0;
  for (let chunk = await reader.read(); !chunk.done; chunk = await reader.read()) {
    size += chunk.value.byteLength;
    if (size > maxBytes) {
      await reader.cancel();
      return null;
    }
    text += decoder.decode(chunk.value, { stream: true });
  }
  return text + decoder.decode();
}
