import { loadConfig } from '../utils/config.js';
import { calculateTokens } from '../utils/calculations.js';
import { exportToCSS } from '../exporters/css.js';
import { exportToSCSS } from '../exporters/scss.js';
import { exportToUnoCSS } from '../exporters/unocss.js';
import { exportToJS } from '../exporters/js.js';
import { parseColorToken, configure as configureColorTokens } from 'saltcat-color-tokens';

/**
 * Main DesignSystem class for managing design tokens
 */
class DesignSystem {
  constructor(options = {}) {
    this.options = {
      configPath: 'saltcat.design.mjs',
      ...options
    };

    this.tokens = {};
    this.themes = {};
    this.components = {};
  }

  /**
   * Configure saltcat-color-tokens
   * @param {Object} config - Configuration for color tokens
   */
  configureColorTokens(config) {
    configureColorTokens(config);
  }

  /**
   * Parse a color token using saltcat-color-tokens
   * @param {string} token - Color token (e.g., 'red-500', 'blue-600')
   * @returns {string} Parsed color value
   */
  parseColorToken(token) {
    return parseColorToken(token);
  }

  /**
   * Resolve all color tokens in the tokens object
   * @param {Object} obj - Object to resolve tokens in
   * @returns {Object} Object with resolved tokens
   */
  resolveColorTokens(obj) {
    if (obj == null) {
      throw new Error('Input cannot be null or undefined');
    }

    if (typeof obj === 'string') {
      // Convert string to object with index keys
      const result = {};
      for (let i = 0; i < obj.length; i++) {
        result[i.toString()] = obj[i];
      }
      return result;
    } else if (Array.isArray(obj)) {
      // Convert array to object with index keys, don't parse color tokens
      const result = {};
      for (let i = 0; i < obj.length; i++) {
        result[i.toString()] = obj[i];
      }
      return result;
    } else if (typeof obj === 'object') {
      const result = {};

      for (const [key, value] of Object.entries(obj)) {
        if (typeof value === 'string' && this.isColorToken(value)) {
          try {
            result[key] = this.parseColorToken(value);
          } catch (error) {
            // If parsing fails, keep the original value
            result[key] = value;
          }
        } else if (value && typeof value === 'object' && !Array.isArray(value)) {
          result[key] = this.resolveColorTokens(value);
        } else {
          result[key] = value;
        }
      }

      return result;
    } else {
      // For numbers, booleans, null, undefined, return empty object
      return {};
    }
  }

  /**
   * Check if a string is a color token
   * @param {string} str - String to check
   * @returns {boolean} True if it's a color token
   */
  isColorToken(str) {
    // Basic check for token format (colorname-shade)
    return typeof str === 'string' && /^[a-zA-Z]+-\d+$/.test(str);
  }

  /**
   * Define design tokens
   * @param {Object} tokens - Token definitions
   */
  defineTokens(tokens) {
    if (!tokens || typeof tokens !== 'object' || Array.isArray(tokens)) {
      throw new Error('Tokens must be a non-null object');
    }

    // Resolve any color tokens in the input
    const resolvedTokens = this.resolveColorTokens(tokens);
    this.tokens = this.mergeTokens(this.tokens, resolvedTokens);
  }

  /**
   * Calculate and define tokens based on configuration
   * @param {Object} config - Calculation configuration
   */
  calculateTokens(config) {
    if (!config || typeof config !== 'object' || Array.isArray(config)) {
      throw new Error('Config must be a non-null object');
    }

    const calculatedTokens = calculateTokens(config);
    this.defineTokens(calculatedTokens);
  }

  /**
   * Define themes
   * @param {Object} themes - Theme definitions
   */
  defineThemes(themes) {
    this.themes = { ...this.themes, ...themes };
  }

  /**
   * Define component tokens
   * @param {Object} components - Component definitions
   */
  defineComponents(components) {
    this.components = { ...this.components, ...components };
  }

  /**
   * Load configuration from file
   * @param {string} path - Path to config file
   */
  async loadConfig(path = this.options.configPath) {
    try {
      const config = await loadConfig(path);
      if (config.calculations) {
        this.calculateTokens(config.calculations);
      }
      if (config.tokens) {
        this.defineTokens(config.tokens);
      }
      if (config.themes) {
        this.defineThemes(config.themes);
      }
      if (config.components) {
        this.defineComponents(config.components);
      }
    } catch (error) {
      // Config file doesn't exist or is invalid, continue with empty config
      console.warn(`Could not load config from ${path}:`, error.message);
    }
  }

  /**
   * Get a token value by path
   * @param {string} path - Dot-separated path to token
   * @param {Object} theme - Optional theme override
   * @returns {any} Token value
   */
  getToken(path, theme = null) {
    const keys = path.split('.');
    let value = theme || this.tokens;

    for (const key of keys) {
      if (value && typeof value === 'object') {
        value = value[key];
      } else {
        return undefined;
      }
    }

    return value;
  }

  /**
   * Export design system to CSS custom properties
   * @param {Object} options - Export options
   * @returns {string} CSS string
   */
  exportToCSS(options = {}) {
    return exportToCSS(this, options);
  }

  /**
   * Export design system to SCSS variables
   * @param {Object} options - Export options
   * @returns {string} SCSS string
   */
  exportToSCSS(options = {}) {
    return exportToSCSS(this, options);
  }

  /**
   * Export design system to UNOCss preset
   * @param {Object} options - Export options
   * @returns {Object} UNOCss preset object
   */
  exportToUnoCSS(options = {}) {
    return exportToUnoCSS(this, options);
  }

  /**
   * Export design system to JavaScript object
   * @param {Object} options - Export options
   * @returns {Object} JavaScript object
   */
  exportToJS(options = {}) {
    return exportToJS(this, options);
  }

  /**
   * Merge token objects deeply
   * @param {Object} target - Target object
   * @param {Object} source - Source object
   * @returns {Object} Merged object
   */
  mergeTokens(target, source) {
    if (!target || typeof target !== 'object' || Array.isArray(target)) {
      throw new Error('Target must be a non-null object');
    }
    if (!source || typeof source !== 'object' || Array.isArray(source)) {
      throw new Error('Source must be a non-null object');
    }

    const result = { ...target };

    for (const [key, value] of Object.entries(source)) {
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        result[key] = this.mergeTokens(result[key] || {}, value);
      } else {
        result[key] = value;
      }
    }

    return result;
  }

  /**
   * Flatten nested token object to dot notation
   * @param {Object} obj - Object to flatten
   * @param {string} prefix - Current prefix
   * @returns {Object} Flattened object
   */
  flattenTokens(obj, prefix = '') {
    if (!obj || typeof obj !== 'object' || Array.isArray(obj)) {
      throw new Error('Object to flatten must be a non-null object');
    }

    let flattened = {};

    for (const [key, value] of Object.entries(obj)) {
      const newKey = prefix ? `${prefix}.${key}` : key;

      if (value && typeof value === 'object' && !Array.isArray(value)) {
        Object.assign(flattened, this.flattenTokens(value, newKey));
      } else {
        flattened[newKey] = value;
      }
    }

    return flattened;
  }
}

export default DesignSystem;
