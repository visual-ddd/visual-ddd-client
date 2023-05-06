export function toYuan(num: number, precision: number = 2): string {
  return (num / 100).toFixed(precision);
}

export function YuanToFen(num: number): number {
  return (num * 100) | 0;
}
