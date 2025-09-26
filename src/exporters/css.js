/**
 * Export design system to CSS custom properties
 * @param {DesignSystem} designSystem - Design system instance
 * @param {Object} options - Export options
 * @returns {string} CSS string
 */
export function exportToCSS(designSystem, options = {}) {
  const {
    prefix = '--ds',
    postfix = '',
    selector = ':root'
  } = options;

  const flattenedTokens = designSystem.flattenTokens(designSystem.tokens);
  const cssVars = [];

  for (const [key, value] of Object.entries(flattenedTokens)) {
    const cssKey = `${prefix}-${key.replace(/\./g, '-')}${postfix}`;
    const cssValue = formatCSSValue(value);
    cssVars.push(`  ${cssKey}: ${cssValue};`);
  }

  // Add theme-specific variables
  for (const [themeName, themeTokens] of Object.entries(designSystem.themes)) {
    const flattenedTheme = designSystem.flattenTokens(themeTokens);
    cssVars.push(`\n  /* ${themeName} theme */`);

    for (const [key, value] of Object.entries(flattenedTheme)) {
      const cssKey = `${prefix}-${key.replace(/\./g, '-')}${postfix}`;
      const cssValue = formatCSSValue(value);
      cssVars.push(`  ${cssKey}: ${cssValue};`);
    }
  }

  return `${selector} {\n${cssVars.join('\n')}\n}`;
}

/**
 * Format a value for CSS
 * @param {any} value - Value to format
 * @returns {string} CSS-formatted value
 */
function formatCSSValue(value) {
  if (typeof value === 'string') {
    // If it's already a CSS value (contains units or is a color), return as-is
    if (isCSSValue(value)) {
      return value;
    }
    // Otherwise, quote it
    return `"${value}"`;
  }

  if (typeof value === 'number') {
    return value.toString();
  }

  if (Array.isArray(value)) {
    // Handle font-family arrays
    return value.map(item => `"${item}"`).join(', ');
  }

  // For objects, convert to CSS string if possible
  if (typeof value === 'object') {
    return JSON.stringify(value);
  }

  return String(value);
}

/**
 * Check if a string is already a CSS value
 * @param {string} str - String to check
 * @returns {boolean} True if it's a CSS value
 */
function isCSSValue(str) {
  // Check for colors
  if (/^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(str)) return true;
  if (/^(rgb|hsl)a?\(.+\)$/i.test(str)) return true;

  // Check for units
  if (/\d+(px|em|rem|vh|vw|vmin|vmax|%|pt|pc|in|cm|mm|ex|ch)$/i.test(str)) return true;

  // Check for CSS keywords
  const cssKeywords = ['inherit', 'initial', 'unset', 'none', 'auto', 'normal'];
  if (cssKeywords.includes(str.toLowerCase())) return true;

  return false;
}