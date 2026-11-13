import type { WeekPlan } from '../planner/plan';
import { chainsOf } from './chains';

type Input = { pillRight: number; pillY: number; cardRight: number; targetTop: number; index: number };
type Point = { x: number; y: number };
export type Frame = { top: number; right: number; pillRight?: number; pillY?: number };
export type Strand = { key: string; chain: number; toSlot: number; d: string; start: Point; end: Point };

export function strandPath({ pillRight, pillY, cardRight, targetTop, index }: Input) {
  const gutter = cardRight + 7 + (index % 2) * 6;
  const start = { x: pillRight + 6, y: pillY };
  const end = { x: cardRight - 10, y: targetTop + 26 };
  const d =
    `M${start.x} ${start.y} H${end.x} C ${gutter} ${pillY} ${gutter} ${pillY + 12} ${gutter} ${pillY + 24} ` +
    `V${end.y - 24} C ${gutter} ${end.y - 12} ${gutter} ${end.y} ${end.x} ${end.y}`;
  return { d, start, end };
}

export function strandsOf(plan: WeekPlan, frames: Record<number, Frame>): Strand[] {
  return chainsOf(plan).flatMap((chain, index) => {
    const from = frames[chain.fromSlot];
    const pillRight = from?.pillRight;
    const pillY = from?.pillY;
    if (!from || pillRight === undefined || pillY === undefined) return [];
    return chain.toSlots.flatMap((to) => {
      const target = frames[to];
      if (!target) return [];
      const path = strandPath({ pillRight, pillY, cardRight: from.right, targetTop: target.top, index });
      return [{ key: `${chain.ingredientId}-${chain.fromSlot}-${to}`, chain: index, toSlot: to, ...path }];
    });
  });
}
