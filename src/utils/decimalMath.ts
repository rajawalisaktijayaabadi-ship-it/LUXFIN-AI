/**
 * Precise decimal math utilities to prevent floating point inaccuracies in financial calculations.
 */

export function roundRp(value: number): number {
  if (isNaN(value) || !isFinite(value)) return 0;
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function addRp(...numbers: number[]): number {
  const result = numbers.reduce((sum, num) => sum + (num || 0), 0);
  return roundRp(result);
}

export function subRp(a: number, b: number): number {
  return roundRp((a || 0) - (b || 0));
}

export function mulRp(a: number, b: number): number {
  return roundRp((a || 0) * (b || 0));
}

export function divRp(a: number, b: number): number {
  if (!b) return 0;
  return roundRp((a || 0) / b);
}

export function percentOf(part: number, total: number): number {
  if (!total || total === 0) return 0;
  return roundRp((part / total) * 100);
}
