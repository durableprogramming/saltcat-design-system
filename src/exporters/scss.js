/**
 * Export design system to SCSS variables
 * @param {DesignSystem} designSystem - Design system instance
 * @param {Object} options - Export options
 * @returns {string} SCSS string
 */
export function exportToSCSS(designSystem, options = {}) {
  const {
    prefix = '$ds',
    postfix = ''
  } = options;

  const flattenedTokens = designSystem.flattenTokens(designSystem.tokens);
  const scssVars = [];

  for (const [key, value] of Object.entries(flattenedTokens)) {
    const scssKey = `${prefix}-${key.replace(/\./g, '-')}${postfix}`;
    const scssValue = formatSCSSValue(value);
    scssVars.push(`${scssKey}: ${scssValue};`);
  }

  // Add theme-specific variables
  for (const [themeName, themeTokens] of Object.entries(designSystem.themes)) {
    scssVars.push(`\n// ${themeName} theme`);

    const flattenedTheme = designSystem.flattenTokens(themeTokens);
    for (const [key, value] of Object.entries(flattenedTheme)) {
      const scssKey = `${prefix}-${key.replace(/\./g, '-')}${postfix}`;
      const scssValue = formatSCSSValue(value);
      scssVars.push(`${scssKey}: ${scssValue};`);
    }
  }

  return scssVars.join('\n');
}

/**
 * Format a value for SCSS
 * @param {any} value - Value to format
 * @returns {string} SCSS-formatted value
 */
function formatSCSSValue(value) {
  if (typeof value === 'string') {
    // If it's already a SCSS value, return as-is
    if (isSCSSValue(value)) {
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
    return `(${value.map(item => `"${item}"`).join(', ')})`;
  }

  // For objects, convert to SCSS map if possible
  if (typeof value === 'object') {
    const entries = Object.entries(value).map(([k, v]) => `"${k}": ${formatSCSSValue(v)}`);
    return `(${entries.join(', ')})`;
  }

  return String(value);
}

/**
 * Check if a string is already a SCSS value
 * @param {string} str - String to check
 * @returns {boolean} True if it's a SCSS value
 */
function isSCSSValue(str) {
  // Check for colors
  if (/^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(str)) return true;
  if (/^(rgb|hsl)a?\(.+\)$/i.test(str)) return true;

  // Check for units
  if (/\d+(px|em|rem|vh|vw|vmin|vmax|%|pt|pc|in|cm|mm|ex|ch)$/i.test(str)) return true;

  // Check for SCSS keywords
  const scssKeywords = ['inherit', 'initial', 'unset', 'none', 'auto', 'normal', 'transparent'];
  if (scssKeywords.includes(str.toLowerCase())) return true;

  return false;
}