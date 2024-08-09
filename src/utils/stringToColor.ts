export function extensionToColor(ext: string, saturation = 100, lightness = 75) {
  const mod = 150;
  const scale = 360 / 250;
  const totalValue = ext.split('').map(char => char.charCodeAt(0)).reduce((sum, v) => sum + v, 0)
  const hue = ((totalValue % mod) * scale)
  return `hsl(${hue.toFixed(2)} ${saturation}% ${lightness}%)`;
}