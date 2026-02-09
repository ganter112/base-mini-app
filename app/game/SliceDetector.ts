import { Fruit, SwipePoint } from './types';
import { SLICE_RADIUS_BONUS } from './constants';

function lineCircleIntersects(
  p1: SwipePoint,
  p2: SwipePoint,
  cx: number,
  cy: number,
  r: number
): boolean {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const fx = p1.x - cx;
  const fy = p1.y - cy;

  const a = dx * dx + dy * dy;
  if (a === 0) {
    // Single point — check distance
    return fx * fx + fy * fy <= r * r;
  }

  const b = 2 * (fx * dx + fy * dy);
  const c = fx * fx + fy * fy - r * r;

  let discriminant = b * b - 4 * a * c;
  if (discriminant < 0) return false;

  discriminant = Math.sqrt(discriminant);
  const t1 = (-b - discriminant) / (2 * a);
  const t2 = (-b + discriminant) / (2 * a);

  return (t1 >= 0 && t1 <= 1) || (t2 >= 0 && t2 <= 1);
}

export class SliceDetector {
  checkSlices(
    segments: [SwipePoint, SwipePoint][],
    fruits: Fruit[]
  ): Fruit[] {
    const sliced: Fruit[] = [];

    for (const fruit of fruits) {
      if (fruit.sliced || fruit.missed) continue;

      // Enlarged hit area: fruit radius + knife bonus
      const hitRadius = fruit.config.radius + SLICE_RADIUS_BONUS;

      for (const [p1, p2] of segments) {
        if (lineCircleIntersects(p1, p2, fruit.x, fruit.y, hitRadius)) {
          fruit.sliced = true;
          sliced.push(fruit);
          break;
        }
      }
    }

    return sliced;
  }
}
