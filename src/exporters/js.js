/**
 * Export design system to JavaScript object
 * @param {DesignSystem} designSystem - Design system instance
 * @param {Object} options - Export options
 * @returns {Object} JavaScript object
 */
export function exportToJS(designSystem, options = {}) {
  const {
    includeThemes = true,
    includeComponents = true
  } = options;

  const result = {
    tokens: designSystem.tokens
  };

  if (includeThemes) {
    result.themes = designSystem.themes;
  }

  if (includeComponents) {
    result.components = designSystem.components;
  }

  return result;
}