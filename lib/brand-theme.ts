import { hexToRgbChannels } from "./color-utils.js";
import { editableSite } from "./EDIT-SITE-HERE";

const colors = editableSite.branding.colors;

export const brandTheme = {
  background: colors.background,
  accent: colors.accent,
  accentStrong: colors.accentStrong,
  accentIcon: colors.accentIcon,
  accentText: colors.accentText,
  ink: colors.text,
  muted: colors.mutedText,
  primary: colors.primary,
  surface: colors.surface,
  border: colors.border,
  darkSection: colors.darkSection,
  onDark: colors.onDark,
  buttonPrimaryBackground: colors.buttonPrimaryBackground,
  buttonPrimaryHoverBackground: colors.buttonPrimaryHoverBackground,
  buttonPrimaryText: colors.buttonPrimaryText,
  buttonSecondaryBackground: colors.buttonSecondaryBackground,
  buttonSecondaryText: colors.buttonSecondaryText,
  checkerboard: colors.checkerboard,
} as const;

export const brandThemeRgb = {
  background: hexToRgbChannels(brandTheme.background),
  accent: hexToRgbChannels(brandTheme.accent),
  ink: hexToRgbChannels(brandTheme.ink),
  muted: hexToRgbChannels(brandTheme.muted),
  surface: hexToRgbChannels(brandTheme.surface),
  border: hexToRgbChannels(brandTheme.border),
} as const;
