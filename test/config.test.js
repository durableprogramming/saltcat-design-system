import { describe, it, expect } from 'vitest';
import { loadConfig, validateConfig } from '../src/utils/config.js';

describe('Config utilities', () => {
  describe('validateConfig', () => {
    it('should validate a correct config', () => {
      const config = {
        tokens: { colors: { primary: '#3b82f6' } },
        themes: { light: {} },
        components: { button: {} }
      };

      expect(() => validateConfig(config)).not.toThrow();
    });

    it('should validate config with calculations', () => {
      const config = {
        calculations: {
          typography: { fontSize: { startSize: 16 } }
        }
      };

      expect(() => validateConfig(config)).not.toThrow();
    });

    it('should validate empty config', () => {
      expect(() => validateConfig({})).not.toThrow();
    });

    it('should throw for invalid config type', () => {
      expect(() => validateConfig(null)).toThrow('Config must be an object');
      expect(() => validateConfig('string')).toThrow('Config must be an object');
      expect(() => validateConfig(123)).toThrow('Config must be an object');
      expect(() => validateConfig([])).toThrow('Config must be an object');
      expect(() => validateConfig(true)).toThrow('Config must be an object');
    });

    it('should warn for unknown keys', () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const config = {
        tokens: {},
        unknownKey: 'value',
        anotherUnknown: 123
      };

      validateConfig(config);
      expect(consoleWarnSpy).toHaveBeenCalledWith('Unknown config key: unknownKey');
      expect(consoleWarnSpy).toHaveBeenCalledWith('Unknown config key: anotherUnknown');

      consoleWarnSpy.mockRestore();
    });

    it('should not warn for valid keys', () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const config = {
        calculations: {},
        tokens: {},
        themes: {},
        components: {}
      };

      validateConfig(config);
      expect(consoleWarnSpy).not.toHaveBeenCalled();

      consoleWarnSpy.mockRestore();
    });

    it('should handle config with nested objects', () => {
      const config = {
        tokens: {
          colors: {
            primary: '#000'
          }
        }
      };
      expect(() => validateConfig(config)).not.toThrow();
    });

    it('should throw for function', () => {
      expect(() => validateConfig(() => {})).toThrow('Config must be an object');
    });

    it('should throw for date', () => {
      expect(() => validateConfig(new Date())).toThrow('Config must be an object');
    });
  });

  describe('loadConfig', () => {
    it('should throw error for non-existent file in Node environment', async () => {
      // This test will only run in Node.js environment
      if (typeof process !== 'undefined' && process.versions?.node) {
        await expect(loadConfig('nonexistent.mjs')).rejects.toThrow('Config file not found');
      }
    });

    it('should throw error in browser environment', async () => {
      // Mock browser environment
      const originalProcess = global.process;
      delete global.process;

      await expect(loadConfig('test.mjs')).rejects.toThrow('Config loading from file is only supported in Node.js environment');

      global.process = originalProcess;
    });

    it('should handle invalid file extension', async () => {
      if (typeof process !== 'undefined' && process.versions?.node) {
        await expect(loadConfig('invalid.txt')).rejects.toThrow();
      }
    });

    it('should handle file with invalid syntax', async () => {
      if (typeof process !== 'undefined' && process.versions?.node) {
        await expect(loadConfig('invalid.mjs')).rejects.toThrow();
      }
    });

    it('should handle config with deeply nested objects', () => {
      const config = {
        tokens: {
          level1: {
            level2: {
              level3: {
                value: 'deep'
              }
            }
          }
        }
      };
      expect(() => validateConfig(config)).not.toThrow();
    });

    it('should handle config with arrays', () => {
      const config = {
        tokens: {
          arrayValue: [1, 2, 3],
          objectWithArray: { arr: ['a', 'b'] }
        }
      };
      expect(() => validateConfig(config)).not.toThrow();
    });

    it('should handle config with primitive values', () => {
      const config = {
        tokens: {
          string: 'value',
          number: 42,
          boolean: true,
          null: null,
          undefined: undefined
        }
      };
      expect(() => validateConfig(config)).not.toThrow();
    });

    it('should warn for deeply nested unknown keys', () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const config = {
        tokens: {},
        nested: {
          unknown: {
            deep: 'value'
          }
        }
      };

      validateConfig(config);
      expect(consoleWarnSpy).toHaveBeenCalledWith('Unknown config key: nested');

      consoleWarnSpy.mockRestore();
    });

    it('should handle empty nested objects', () => {
      const config = {
        tokens: {},
        themes: {},
        components: {}
      };
      expect(() => validateConfig(config)).not.toThrow();
    });

   it('should handle config with functions', () => {
     const config = {
       tokens: {
         func: () => 'test'
       }
     };
     expect(() => validateConfig(config)).not.toThrow();
   });

   it('should handle very large config objects', () => {
     const config = { tokens: {} };
     for (let i = 0; i < 1000; i++) {
       config.tokens[`key${i}`] = `value${i}`;
     }
     expect(() => validateConfig(config)).not.toThrow();
   });

   it('should handle config with circular references', () => {
     const config = { tokens: {} };
     config.tokens.self = config.tokens;
     expect(() => validateConfig(config)).not.toThrow();
   });

   it('should handle config with regex values', () => {
     const config = {
       tokens: {
         pattern: /test/i
       }
     };
     expect(() => validateConfig(config)).not.toThrow();
   });

   it('should handle config with date values', () => {
     const config = {
       tokens: {
         date: new Date()
       }
     };
     expect(() => validateConfig(config)).not.toThrow();
   });

   it('should handle config with symbol values', () => {
     const config = {
       tokens: {
         symbol: Symbol('test')
       }
     };
     expect(() => validateConfig(config)).not.toThrow();
   });

   it('should handle deeply nested unknown keys with warnings', () => {
     const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
     const config = {
       tokens: {},
       level1: {
         level2: {
           level3: {
             unknown: 'deep'
           }
         }
       }
     };
     validateConfig(config);
     expect(consoleWarnSpy).toHaveBeenCalledWith('Unknown config key: level1');
     consoleWarnSpy.mockRestore();
   });

    it('should handle config with prototype pollution attempts', () => {
      const config = {
        tokens: {},
        __proto__: { polluted: true },
        constructor: { polluted: true }
      };
      expect(() => validateConfig(config)).toThrow('Config must be an object');
    });

    it('should handle config with special characters in keys', () => {
      const config = {
        tokens: {
          'key-with-dashes': 'value1',
          'key_with_underscores': 'value2',
          'key.with.dots': 'value3'
        }
      };
      expect(() => validateConfig(config)).not.toThrow();
    });

    it('should handle loadConfig with absolute paths', async () => {
      if (typeof process !== 'undefined' && process.versions?.node) {
        await expect(loadConfig('/nonexistent/path.mjs')).rejects.toThrow('Config file not found');
      }
    });

    it('should handle loadConfig with relative paths', async () => {
      if (typeof process !== 'undefined' && process.versions?.node) {
        await expect(loadConfig('../nonexistent.mjs')).rejects.toThrow('Config file not found');
      }
    });

    it('should handle loadConfig with current directory', async () => {
      if (typeof process !== 'undefined' && process.versions?.node) {
        await expect(loadConfig('./nonexistent.mjs')).rejects.toThrow('Config file not found');
      }
    });
  });
});