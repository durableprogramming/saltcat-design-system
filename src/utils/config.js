/**
 * Load configuration from a file
 * @param {string} path - Path to config file
 * @returns {Promise<Object>} Configuration object
 */
export async function loadConfig(path) {
  try {
    // In Node.js environment
    if (typeof process !== 'undefined' && process.versions?.node) {
      const fs = await import('fs');
      const pathModule = await import('path');
      const { pathToFileURL } = await import('url');

      const fullPath = pathModule.resolve(path);

      if (!fs.existsSync(fullPath)) {
        throw new Error(`Config file not found: ${fullPath}`);
      }

      const fileUrl = pathToFileURL(fullPath);
      const config = await import(fileUrl.href);

      return config.default || config;
    }

    // In browser environment (limited support)
    throw new Error('Config loading from file is only supported in Node.js environment');

  } catch (error) {
    throw new Error(`Failed to load config: ${error.message}`);
  }
}

/**
 * Validate configuration object
 * @param {Object} config - Configuration to validate
 * @returns {boolean} True if valid
 */
export function validateConfig(config) {
  if (!config || typeof config !== 'object' || config.constructor !== Object) {
    throw new Error('Config must be an object');
  }

  // Basic validation - can be extended
  const allowedKeys = ['calculations', 'tokens', 'themes', 'components'];
  const configKeys = Object.keys(config);

  for (const key of configKeys) {
    if (!allowedKeys.includes(key)) {
      console.warn(`Unknown config key: ${key}`);
    }
  }

  return true;
}