/**
 * Utility functions for calculating and generating design token scales
 */

import { exportPalette, parseColorToken, configure as configureColorTokens } from 'saltcat-color-tokens';

/**
 * Generate a typography scale using a multiplier
 * @param {Object} options - Configuration options
 * @param {number} options.startSize - Starting font size in pixels
 * @param {number} options.endSize - Ending font size in pixels (optional)
 * @param {number} options.multiplier - Scale multiplier (e.g., 1.2 for major third)
 * @param {Array<string>} options.scaleNames - Array of scale names (e.g., ['xs', 'sm', 'base', 'lg', 'xl'])
 * @param {string} options.unit - Unit for sizes (default: 'rem')
 * @param {number} options.baseSize - Base font size for rem calculations (default: 16)
 * @returns {Object} Generated typography scale
 */
export function generateTypographyScale(config) {
  if (!config || typeof config !== 'object') {
    return {};
  }

  const {
    startSize,
    endSize,
    multiplier = 1.2,
    scaleNames = ['xs', 'sm', 'base', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl'],
    unit = 'rem',
    baseSize = 16
  } = config;

  if (typeof startSize !== 'number' || startSize <= 0) {
    return {};
  }

  const scale = {};
  let currentSize = startSize;

  for (let i = 0; i < scaleNames.length; i++) {
    const name = scaleNames[i];

    if (endSize && currentSize > endSize) {
      break;
    }

    if (unit === 'rem') {
      scale[name] = `${(currentSize / baseSize).toFixed(3)}rem`;
    } else if (unit === 'px') {
      scale[name] = `${Math.round(currentSize)}px`;
    } else {
      scale[name] = `${currentSize}${unit}`;
    }

    currentSize *= multiplier;
  }

  return scale;
}

/**
 * Generate a spacing scale using a base unit and multiplier
 * @param {Object} options - Configuration options
 * @param {number} options.baseUnit - Base spacing unit in pixels
 * @param {number} options.multiplier - Scale multiplier
 * @param {number} options.steps - Number of steps to generate
 * @param {string} options.unit - Unit for spacing (default: 'rem')
 * @param {number} options.baseSize - Base font size for rem calculations (default: 16)
 * @param {boolean} options.includeZero - Whether to include 0 as the first step
 * @returns {Object} Generated spacing scale
 */
export function generateSpacingScale(config) {
  if (!config || typeof config !== 'object') {
    return {};
  }

  const {
    baseUnit = 4,
    multiplier = 2,
    steps = 10,
    unit = 'rem',
    baseSize = 16,
    includeZero = true
  } = config;

  if (typeof baseUnit !== 'number' || baseUnit <= 0) {
    return {};
  }

  const scale = {};

  for (let i = includeZero ? 0 : 1; i <= steps; i++) {
    const exponent = i - 1;
    const value = (includeZero && i === 0) ? 0 : baseUnit * Math.pow(multiplier, exponent);

    if (unit === 'rem') {
      scale[i.toString()] = `${(value / baseSize).toFixed(3)}rem`;
    } else if (unit === 'px') {
      scale[i.toString()] = `${value}px`;
    } else {
      scale[i.toString()] = `${value}${unit}`;
    }
  }

  return scale;
}

/**
 * Generate a color scale using saltcat-color-tokens
 * @param {Object} options - Configuration options
 * @param {string} options.colorName - Color name (e.g., 'red', 'blue', 'primary')
 * @param {Object} options.config - Configuration for saltcat-color-tokens
 * @returns {Object} Generated color scale
 */
export function generateColorScale(config) {
  if (!config || typeof config !== 'object') {
    return {};
  }

  const {
    colorName,
    config: tokenConfig = {}
  } = config;

  if (typeof colorName !== 'string' || !colorName) {
    return {};
  }

  // Configure color tokens if config provided
  if (Object.keys(tokenConfig).length > 0) {
    configureColorTokens(tokenConfig);
  }

  // Use exportPalette to generate the color scale
  const palette = exportPalette({
    colors: colorName,
    format: 'json',
    flattenShades: false
  });

  return palette[colorName] || {};
}

/**
 * Generate a modular scale for various design tokens
 * @param {Object} options - Configuration options
 * @param {number} options.base - Base value
 * @param {number} options.ratio - Scale ratio
 * @param {number} options.steps - Number of steps above and below base
 * @param {Function} options.formatter - Function to format the output values
 * @returns {Object} Generated modular scale
 */
export function generateModularScale(config) {
  if (!config || typeof config !== 'object') {
    return {};
  }

  const {
    base,
    ratio = 1.2,
    steps = 5,
    formatter = (value) => value
  } = config;

  if (typeof base !== 'number' || isNaN(base)) {
    return {};
  }

  const scale = {};

  for (let i = -steps; i <= steps; i++) {
    const value = base * Math.pow(ratio, i);
    const key = i === 0 ? 'base' : (i < 0 ? `n${Math.abs(i)}` : `p${i}`);
    scale[key] = formatter(value);
  }

  return scale;
}

/**
 * Calculate tokens based on a configuration object
 * @param {Object} config - Calculation configuration
 * @returns {Object} Calculated tokens
 */
export function calculateTokens(config) {
  const tokens = {};

  if (config.typography) {
    tokens.typography = tokens.typography || {};

    if (config.typography.fontSize) {
      tokens.typography.fontSize = generateTypographyScale(config.typography.fontSize);
    }

    if (config.typography.lineHeight) {
      tokens.typography.lineHeight = generateModularScale({
        ...config.typography.lineHeight,
        formatter: (value) => value.toFixed(2)
      });
    }
  }

  if (config.spacing) {
    tokens.spacing = generateSpacingScale(config.spacing);
  }

  if (config.colors) {
    tokens.colors = tokens.colors || {};

    for (const [colorName, colorConfig] of Object.entries(config.colors)) {
      if (typeof colorConfig === 'string') {
        // Simple color name from saltcat-color-tokens
        tokens.colors[colorName] = generateColorScale({
          colorName: colorConfig
        });
      } else if (colorConfig.palette) {
        // Use a predefined palette
        tokens.colors[colorName] = generateColorScale({
          colorName: colorConfig.palette,
          config: colorConfig.config || {}
        });
      } else if (colorConfig.scale) {
        // Legacy support for custom scale generation
        // This would need to be adapted or removed since we changed generateColorScale
        console.warn('Custom color scale generation is deprecated. Use palette names from saltcat-color-tokens instead.');
      }
    }
  }

  return tokens;
}