export function toYuan(num: number, precision: number = 2): string {
  return (num / 100).toFixed(precision);
}
