/**
 * Convert a six-digit hexadecimal color to space-separated RGB channels.
 * @param {string} hex
 * @returns {string}
 */
export function hexToRgbChannels(hex) {
  if (!/^#[0-9a-f]{6}$/i.test(hex)) {
    throw new Error(`Unsupported hexadecimal color "${hex}". Use exactly six digits, for example #bfd730.`);
  }

  const channels = [hex.slice(1, 3), hex.slice(3, 5), hex.slice(5, 7)];
  return channels.map((channel) => Number.parseInt(channel, 16)).join(" ");
}
