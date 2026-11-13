type Input = { pillRight: number; pillY: number; cardRight: number; targetTop: number; index: number };

export function strandPath({ pillRight, pillY, cardRight, targetTop, index }: Input) {
  const gutter = cardRight + 7 + (index % 2) * 6;
  const start = { x: pillRight + 6, y: pillY };
  const end = { x: cardRight - 10, y: targetTop + 26 };
  const d =
    `M${start.x} ${start.y} H${end.x} C ${gutter} ${pillY} ${gutter} ${pillY + 12} ${gutter} ${pillY + 24} ` +
    `V${end.y - 24} C ${gutter} ${end.y - 12} ${gutter} ${end.y} ${end.x} ${end.y}`;
  return { d, start, end };
}
