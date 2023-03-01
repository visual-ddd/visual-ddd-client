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
