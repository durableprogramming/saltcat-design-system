/**
 * Export design system to UNOCss preset
 * @param {DesignSystem} designSystem - Design system instance
 * @param {Object} options - Export options
 * @returns {Object} UNOCss preset object
 */
export function exportToUnoCSS(designSystem, options = {}) {
  const {
    prefix = 'ds',
    postfix = ''
  } = options;

  const flattenedTokens = designSystem.flattenTokens(designSystem.tokens);
  const theme = {};

  // Convert flattened tokens to UNOCss theme structure
  for (const [key, value] of Object.entries(flattenedTokens)) {
    const unoKey = `${prefix}-${key.replace(/\./g, '-')}${postfix}`;
    theme[unoKey] = value;
  }

  // Add theme-specific variables
  for (const [themeName, themeTokens] of Object.entries(designSystem.themes)) {
    const flattenedTheme = designSystem.flattenTokens(themeTokens);
    for (const [key, value] of Object.entries(flattenedTheme)) {
      const unoKey = `${prefix}-${key.replace(/\./g, '-')}${postfix}`;
      theme[unoKey] = value;
    }
  }

  return {
    name: 'saltcat-design-system',
    theme: {
      colors: extractColors(theme, prefix, postfix),
      fontFamily: extractFontFamilies(theme, prefix, postfix),
      fontSize: extractFontSizes(theme, prefix, postfix),
      spacing: extractSpacing(theme, prefix, postfix),
      ...theme
    }
  };
}

/**
 * Extract color tokens from theme
 * @param {Object} theme - Flattened theme object
 * @param {string} prefix - Prefix used for keys
 * @param {string} postfix - Postfix used for keys
 * @returns {Object} Color mapping
 */
function extractColors(theme, prefix, postfix) {
  const colors = {};
  const prefixRegex = new RegExp(`^${prefix}-`);
  const postfixRegex = new RegExp(`${postfix}$`);

  for (const [key, value] of Object.entries(theme)) {
    if (key.includes('color') || key.includes('bg') || key.includes('text')) {
      const colorKey = key.replace(prefixRegex, '').replace(postfixRegex, '');
      colors[colorKey] = value;
    }
  }

  return colors;
}

/**
 * Extract font family tokens from theme
 * @param {Object} theme - Flattened theme object
 * @param {string} prefix - Prefix used for keys
 * @param {string} postfix - Postfix used for keys
 * @returns {Object} Font family mapping
 */
function extractFontFamilies(theme, prefix, postfix) {
  const fontFamilies = {};
  const prefixRegex = new RegExp(`^${prefix}-`);
  const postfixRegex = new RegExp(`${postfix}$`);

  for (const [key, value] of Object.entries(theme)) {
    if (key.includes('font-family') || key.includes('fontFamily')) {
      const fontKey = key.replace(prefixRegex, '').replace(postfixRegex, '').replace(/-family$/, '');
      fontFamilies[fontKey] = Array.isArray(value) ? value : [value];
    }
  }

  return fontFamilies;
}

/**
 * Extract font size tokens from theme
 * @param {Object} theme - Flattened theme object
 * @param {string} prefix - Prefix used for keys
 * @param {string} postfix - Postfix used for keys
 * @returns {Object} Font size mapping
 */
function extractFontSizes(theme, prefix, postfix) {
  const fontSizes = {};
  const prefixRegex = new RegExp(`^${prefix}-`);
  const postfixRegex = new RegExp(`${postfix}$`);

  for (const [key, value] of Object.entries(theme)) {
    if (key.includes('font-size') || key.includes('fontSize')) {
      const sizeKey = key.replace(prefixRegex, '').replace(postfixRegex, '').replace(/-size$/, '');
      fontSizes[sizeKey] = value;
    }
  }

  return fontSizes;
}

/**
 * Extract spacing tokens from theme
 * @param {Object} theme - Flattened theme object
 * @param {string} prefix - Prefix used for keys
 * @param {string} postfix - Postfix used for keys
 * @returns {Object} Spacing mapping
 */
function extractSpacing(theme, prefix, postfix) {
  const spacing = {};
  const prefixRegex = new RegExp(`^${prefix}-`);
  const postfixRegex = new RegExp(`${postfix}$`);

  for (const [key, value] of Object.entries(theme)) {
    if (key.includes('spacing') || key.includes('space') || key.includes('margin') || key.includes('padding')) {
      const spaceKey = key.replace(prefixRegex, '').replace(postfixRegex, '');
      spacing[spaceKey] = value;
    }
  }

  return spacing;
}