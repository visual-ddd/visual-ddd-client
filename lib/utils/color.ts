export function getMappedColor(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }

  let color = '#';
  for (let j = 0; j < 3; j++) {
    const value = Math.floor(Math.abs(Math.sin(hash + j)) * 180);
    color += ('0' + value.toString(16)).slice(-2);
  }
  return color;
}

const LIGHTER_COLOR = [
  '#7FFFD4',
  '#FFA07A',
  '#FA8072',
  '#FFEBCD',
  '#ADD8E6',
  '#00BFFF',
  '#7CFC00',
  '#F0E68C',
  '#FAFAD2',
  '#F5DEB3',
  '#FFC0CB',
  '#DDA0DD',
  '#B0E0E6',
  '#98FB98',
];

export function getMappedLighterColor(str: string) {
  let sum = 0;
  for (let i = 0; i < str.length; i++) {
    sum += str.charCodeAt(i);
  }
  return LIGHTER_COLOR[sum % LIGHTER_COLOR.length];
}
