import { hexToRgbChannels } from "./color-utils.js";

export const brandTheme = {
  background: "#f8fbfd",
  accent: "#bfd730",
  accentStrong: "#9db514",
  accentIcon: "#8fa30f",
  accentText: "#738600",
  ink: "#171717",
  muted: "#5f666d",
} as const;

export const brandThemeRgb = {
  background: hexToRgbChannels(brandTheme.background),
  accent: hexToRgbChannels(brandTheme.accent),
  ink: hexToRgbChannels(brandTheme.ink),
  muted: hexToRgbChannels(brandTheme.muted),
} as const;
