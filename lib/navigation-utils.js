/**
 * Resolve navigation destinations consistently from every page.
 * @param {string} href
 * @returns {string}
 */
export function resolveNavigationHref(href) {
  if (href.startsWith("#")) return `/${href}`;
  return href;
}
