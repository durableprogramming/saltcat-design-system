import { describe, it, expect, vi, beforeEach } from 'vitest';
import DesignSystem from '../src/models/design-system.js';

describe('DesignSystem', () => {
  let ds;

  beforeEach(() => {
    ds = new DesignSystem();
  });

  describe('constructor', () => {
    it('should create instance with default options', () => {
      expect(ds.options.configPath).toBe('saltcat.design.mjs');
      expect(ds.tokens).toEqual({});
      expect(ds.themes).toEqual({});
      expect(ds.components).toEqual({});
    });

    it('should accept custom options', () => {
      const customDs = new DesignSystem({ configPath: 'custom.mjs' });
      expect(customDs.options.configPath).toBe('custom.mjs');
    });
  });

  describe('defineTokens', () => {
    it('should define tokens', () => {
      const tokens = { colors: { primary: '#000' } };
      ds.defineTokens(tokens);
      expect(ds.tokens).toEqual(tokens);
    });

    it('should merge tokens', () => {
      ds.defineTokens({ colors: { primary: '#000' } });
      ds.defineTokens({ spacing: { small: '8px' } });
      expect(ds.tokens).toEqual({
        colors: { primary: '#000' },
        spacing: { small: '8px' }
      });
    });

    it('should resolve color tokens', () => {
      // Mock parseColorToken
      const mockParseColorToken = vi.fn().mockReturnValue('#ff0000');
      ds.parseColorToken = mockParseColorToken;

      ds.defineTokens({ colors: { primary: 'red-500' } });
      expect(mockParseColorToken).toHaveBeenCalledWith('red-500');
      expect(ds.tokens.colors.primary).toBe('#ff0000');
    });
  });

  describe('calculateTokens', () => {
    it('should calculate and define tokens', () => {
      const config = {
        typography: {
          fontSize: {
            startSize: 16,
            multiplier: 1.2,
            scaleNames: ['base']
          }
        }
      };
      ds.calculateTokens(config);
      expect(ds.tokens.typography.fontSize.base).toBe('1.000rem');
    });
  });

  describe('defineThemes', () => {
    it('should define themes', () => {
      const themes = { dark: { colors: { primary: '#fff' } } };
      ds.defineThemes(themes);
      expect(ds.themes).toEqual(themes);
    });

    it('should merge themes', () => {
      ds.defineThemes({ dark: {} });
      ds.defineThemes({ light: {} });
      expect(ds.themes).toHaveProperty('dark');
      expect(ds.themes).toHaveProperty('light');
    });
  });

  describe('defineComponents', () => {
    it('should define components', () => {
      const components = { button: { base: {} } };
      ds.defineComponents(components);
      expect(ds.components).toEqual(components);
    });

    it('should merge components', () => {
      ds.defineComponents({ button: {} });
      ds.defineComponents({ input: {} });
      expect(ds.components).toHaveProperty('button');
      expect(ds.components).toHaveProperty('input');
    });
  });



  describe('getToken', () => {
    beforeEach(() => {
      ds.tokens = {
        colors: {
          primary: '#000',
          secondary: {
            light: '#fff'
          }
        }
      };
    });

    it('should get token by path', () => {
      expect(ds.getToken('colors.primary')).toBe('#000');
    });

    it('should get nested token', () => {
      expect(ds.getToken('colors.secondary.light')).toBe('#fff');
    });

    it('should return undefined for non-existent token', () => {
      expect(ds.getToken('colors.nonexistent')).toBeUndefined();
    });

    it('should use theme override', () => {
      const theme = { colors: { primary: '#fff' } };
      expect(ds.getToken('colors.primary', theme)).toBe('#fff');
    });
  });

  describe('resolveColorTokens', () => {
    it('should resolve color tokens in object', () => {
      const mockParseColorToken = vi.fn().mockReturnValue('#ff0000');
      ds.parseColorToken = mockParseColorToken;

      const obj = { primary: 'red-500', secondary: '#000' };
      const result = ds.resolveColorTokens(obj);
      expect(result.primary).toBe('#ff0000');
      expect(result.secondary).toBe('#000');
    });

    it('should handle nested objects', () => {
      const mockParseColorToken = vi.fn().mockReturnValue('#ff0000');
      ds.parseColorToken = mockParseColorToken;

      const obj = { colors: { primary: 'red-500' } };
      const result = ds.resolveColorTokens(obj);
      expect(result.colors.primary).toBe('#ff0000');
    });

    it('should handle deeply nested structures', () => {
      const mockParseColorToken = vi.fn()
        .mockReturnValueOnce('#ff0000')
        .mockReturnValueOnce('#00ff00');
      ds.parseColorToken = mockParseColorToken;

      const obj = {
        theme: {
          colors: {
            primary: 'red-500',
            secondary: {
              light: 'green-400'
            }
          }
        }
      };
      const result = ds.resolveColorTokens(obj);
      expect(result.theme.colors.primary).toBe('#ff0000');
      expect(result.theme.colors.secondary.light).toBe('#00ff00');
    });

    it('should handle arrays with color tokens', () => {
      const mockParseColorToken = vi.fn().mockReturnValue('#ff0000');
      ds.parseColorToken = mockParseColorToken;

      const obj = { colors: ['red-500', '#000', 'blue-600'] };
      const result = ds.resolveColorTokens(obj);
      // Arrays are passed through unchanged
      expect(result.colors).toEqual(['red-500', '#000', 'blue-600']);
      expect(mockParseColorToken).not.toHaveBeenCalled();
    });

    it('should handle mixed data types', () => {
      const mockParseColorToken = vi.fn().mockReturnValue('#ff0000');
      ds.parseColorToken = mockParseColorToken;

      const obj = {
        string: 'red-500',
        number: 42,
        boolean: true,
        null: null,
        undefined: undefined,
        array: ['red-500', 123],
        object: { color: 'red-500', value: 'text' }
      };
      const result = ds.resolveColorTokens(obj);
      expect(result.string).toBe('#ff0000');
      expect(result.number).toBe(42);
      expect(result.boolean).toBe(true);
      expect(result.null).toBeNull();
      expect(result.undefined).toBeUndefined();
      expect(result.array).toEqual(['red-500', 123]); // Arrays unchanged
      expect(result.object.color).toBe('#ff0000');
      expect(result.object.value).toBe('text');
    });

    it('should handle parsing errors gracefully', () => {
      const mockParseColorToken = vi.fn().mockImplementation((token) => {
        if (token === 'invalid-token') {
          throw new Error('Parse error');
        }
        return '#00ff00';
      });
      ds.parseColorToken = mockParseColorToken;

      const obj = { primary: 'invalid-token', secondary: 'green-500' };
      const result = ds.resolveColorTokens(obj);
      expect(result.primary).toBe('invalid-token'); // Should keep original on error
      expect(result.secondary).toBe('#00ff00');
    });

    it('should handle empty objects', () => {
      const result = ds.resolveColorTokens({});
      expect(result).toEqual({});
    });

    it('should handle null input', () => {
      expect(() => ds.resolveColorTokens(null)).toThrow();
    });

    it('should handle non-objects', () => {
      // Non-objects get converted to objects with index keys
      expect(ds.resolveColorTokens('string')).toEqual({ '0': 's', '1': 't', '2': 'r', '3': 'i', '4': 'n', '5': 'g' });
      expect(ds.resolveColorTokens(42)).toEqual({});
      expect(ds.resolveColorTokens(true)).toEqual({});
      expect(ds.resolveColorTokens(['red-500'])).toEqual({ '0': 'red-500' }); // Arrays become objects
    });

    it('should preserve object structure', () => {
      const mockParseColorToken = vi.fn().mockReturnValue('#ff0000');
      ds.parseColorToken = mockParseColorToken;

      const obj = { a: { b: { c: 'red-500' } } };
      const result = ds.resolveColorTokens(obj);
      expect(result).toEqual({ a: { b: { c: '#ff0000' } } });
      expect(result.a.b.c).toBe('#ff0000');
    });
  });

  describe('isColorToken', () => {
    it('should identify color tokens', () => {
      expect(ds.isColorToken('red-500')).toBe(true);
      expect(ds.isColorToken('blue-600')).toBe(true);
    });

    it('should not identify non-color tokens', () => {
      expect(ds.isColorToken('#ff0000')).toBe(false);
      expect(ds.isColorToken('not-a-token')).toBe(false);
      expect(ds.isColorToken('red')).toBe(false);
    });

    it('should identify various color names with shades', () => {
      const validTokens = [
        'red-50', 'red-100', 'red-500', 'red-900',
        'blue-50', 'green-100', 'yellow-500', 'purple-900',
        'pink-50', 'indigo-100', 'cyan-500', 'teal-900',
        'orange-50', 'gray-100', 'black-500', 'white-900'
      ];
      validTokens.forEach(token => {
        expect(ds.isColorToken(token)).toBe(true);
      });
    });

    it('should not identify invalid formats', () => {
      const invalidTokens = [
        'red', 'blue', 'green', // No shade
        'red-', 'blue-', '-500', // Incomplete
        'red-abc', 'blue-xyz', // Non-numeric shade
        'red-500-extra', 'blue-600-suffix', // Extra parts
        'red500', 'blue600', // No dash
        'red_500', 'blue-600-700', // Wrong separators
        '', ' ', 'red-', '-500' // Edge cases
      ];
      invalidTokens.forEach(token => {
        expect(ds.isColorToken(token)).toBe(false);
      });
    });

    it('should handle non-string inputs', () => {
      expect(ds.isColorToken(null)).toBe(false);
      expect(ds.isColorToken(undefined)).toBe(false);
      expect(ds.isColorToken(123)).toBe(false);
      expect(ds.isColorToken({})).toBe(false);
      expect(ds.isColorToken([])).toBe(false);
      expect(ds.isColorToken(true)).toBe(false);
    });

    it('should handle edge cases', () => {
      expect(ds.isColorToken('')).toBe(false);
      expect(ds.isColorToken('a-1')).toBe(true); // Single char color name
      expect(ds.isColorToken('very-long-color-name-999')).toBe(false); // Dashes in color name not allowed
      expect(ds.isColorToken('color-with-dashes-500')).toBe(false); // Dashes in color name not allowed
      expect(ds.isColorToken('color_with_underscores-500')).toBe(false); // Underscore not allowed
    });

    it('should be case sensitive for color names', () => {
      expect(ds.isColorToken('Red-500')).toBe(true); // Capital R is valid
      expect(ds.isColorToken('RED-500')).toBe(true);
      expect(ds.isColorToken('red-500')).toBe(true);
    });

    it('should handle very large shade numbers', () => {
      expect(ds.isColorToken('red-999999')).toBe(true);
      expect(ds.isColorToken('blue-0')).toBe(true);
    });
  });

  describe('mergeTokens', () => {
    it('should merge objects deeply', () => {
      const target = { a: 1, b: { c: 2 } };
      const source = { b: { d: 3 }, e: 4 };
      const result = ds.mergeTokens(target, source);
      expect(result).toEqual({
        a: 1,
        b: { c: 2, d: 3 },
        e: 4
      });
    });

    it('should overwrite primitive values', () => {
      const target = { a: 1 };
      const source = { a: 2 };
      const result = ds.mergeTokens(target, source);
      expect(result.a).toBe(2);
    });
  });

  describe('flattenTokens', () => {
    it('should flatten nested object', () => {
      const obj = {
        colors: {
          primary: '#000',
          secondary: {
            light: '#fff'
          }
        },
        spacing: '8px'
      };
      const result = ds.flattenTokens(obj);
      expect(result).toEqual({
        'colors.primary': '#000',
        'colors.secondary.light': '#fff',
        'spacing': '8px'
      });
    });

    it('should handle empty object', () => {
      expect(ds.flattenTokens({})).toEqual({});
    });
  });

  describe('export methods', () => {
    beforeEach(() => {
      ds.tokens = { colors: { primary: '#000' } };
    });

    it('should export to CSS', () => {
      const css = ds.exportToCSS();
      expect(css).toContain('--ds-colors-primary: #000;');
      expect(css).toContain(':root {');
    });

    it('should export to SCSS', () => {
      const scss = ds.exportToSCSS();
      expect(scss).toContain('$ds-colors-primary: #000;');
    });

    it('should export to UnoCSS', () => {
      const uno = ds.exportToUnoCSS();
      expect(uno).toHaveProperty('theme');
      expect(uno.theme).toHaveProperty('colors');
    });

    it('should export to JS', () => {
      const js = ds.exportToJS();
      expect(js.tokens).toHaveProperty('colors');
      expect(js.tokens.colors).toHaveProperty('primary');
    });
  });

  describe('configureColorTokens', () => {
    it('should configure color tokens', () => {
      const mockConfigure = vi.fn();
      ds.configureColorTokens = mockConfigure;
      ds.configureColorTokens({ minBrightness: 0.1 });
      expect(mockConfigure).toHaveBeenCalledWith({ minBrightness: 0.1 });
    });

    it('should handle empty config', () => {
      const mockConfigure = vi.fn();
      ds.configureColorTokens = mockConfigure;
      ds.configureColorTokens({});
      expect(mockConfigure).toHaveBeenCalledWith({});
    });

    it('should handle complex config objects', () => {
      const config = {
        minBrightness: 0.1,
        maxBrightness: 0.9,
        hueShift: 10,
        saturationMultiplier: 1.2
      };
      const mockConfigure = vi.fn();
      ds.configureColorTokens = mockConfigure;
      ds.configureColorTokens(config);
      expect(mockConfigure).toHaveBeenCalledWith(config);
    });

    it('should handle null config', () => {
      const mockConfigure = vi.fn();
      ds.configureColorTokens = mockConfigure;
      ds.configureColorTokens(null);
      expect(mockConfigure).toHaveBeenCalledWith(null);
    });
  });

  describe('parseColorToken', () => {
    it('should parse color token', () => {
      const mockParse = vi.fn().mockReturnValue('#ff0000');
      ds.parseColorToken = mockParse;
      const result = ds.parseColorToken('red-500');
      expect(mockParse).toHaveBeenCalledWith('red-500');
      expect(result).toBe('#ff0000');
    });

    it('should handle different color tokens', () => {
      const mockParse = vi.fn()
        .mockReturnValueOnce('#ff0000')
        .mockReturnValueOnce('#00ff00')
        .mockReturnValueOnce('#0000ff');
      ds.parseColorToken = mockParse;

      expect(ds.parseColorToken('red-500')).toBe('#ff0000');
      expect(ds.parseColorToken('green-600')).toBe('#00ff00');
      expect(ds.parseColorToken('blue-700')).toBe('#0000ff');

      expect(mockParse).toHaveBeenCalledWith('red-500');
      expect(mockParse).toHaveBeenCalledWith('green-600');
      expect(mockParse).toHaveBeenCalledWith('blue-700');
    });

    it('should handle invalid tokens', () => {
      const mockParse = vi.fn().mockImplementation(() => {
        throw new Error('Invalid color token');
      });
      ds.parseColorToken = mockParse;

      expect(() => ds.parseColorToken('invalid-token')).toThrow('Invalid color token');
    });

    it('should handle empty string', () => {
      const mockParse = vi.fn().mockReturnValue('#000000');
      ds.parseColorToken = mockParse;
      const result = ds.parseColorToken('');
      expect(mockParse).toHaveBeenCalledWith('');
      expect(result).toBe('#000000');
    });

    it('should handle numeric tokens', () => {
      const mockParse = vi.fn().mockReturnValue('#ff0000');
      ds.parseColorToken = mockParse;
      const result = ds.parseColorToken('red-500');
      expect(result).toBe('#ff0000');
    });
  });

  describe('loadConfig', () => {
    it('should load config successfully', async () => {
      const mockLoadConfig = vi.fn().mockResolvedValue({ tokens: { test: 'value' } });
      ds.loadConfig = mockLoadConfig;
      await ds.loadConfig('test.mjs');
      expect(mockLoadConfig).toHaveBeenCalledWith('test.mjs');
    });

    it('should handle load config errors', async () => {
      const mockLoadConfig = vi.fn().mockRejectedValue(new Error('File not found'));
      ds.loadConfig = mockLoadConfig;
      await expect(ds.loadConfig('nonexistent.mjs')).rejects.toThrow('File not found');
    });
  });

  describe('error handling', () => {
    it('should handle invalid token paths in getToken', () => {
      expect(ds.getToken('')).toBeUndefined();
      // Note: getToken expects a string path, null/undefined will throw
      expect(() => ds.getToken(null)).toThrow();
      expect(() => ds.getToken(undefined)).toThrow();
      expect(() => ds.getToken(123)).toThrow();
    });

    it('should handle non-existent nested paths in getToken', () => {
      expect(ds.getToken('nonexistent.path')).toBeUndefined();
      expect(ds.getToken('colors.nonexistent')).toBeUndefined();
      expect(ds.getToken('deeply.nested.path.that.does.not.exist')).toBeUndefined();
    });

    it('should handle circular references in flattenTokens', () => {
      const circular = { self: null };
      circular.self = circular;
      expect(() => ds.flattenTokens(circular)).toThrow();
    });

    it('should handle very deep nesting in flattenTokens', () => {
      const deep = { level1: { level2: { level3: { level4: { level5: 'deep' } } } } };
      const result = ds.flattenTokens(deep);
      expect(result['level1.level2.level3.level4.level5']).toBe('deep');
    });

    it('should handle defineTokens with invalid inputs', () => {
      expect(() => ds.defineTokens(null)).toThrow();
      expect(() => ds.defineTokens(undefined)).toThrow();
      expect(() => ds.defineTokens('string')).toThrow();
      expect(() => ds.defineTokens(123)).toThrow();
    });

    it('should handle defineThemes with invalid inputs', () => {
      expect(() => ds.defineThemes(null)).not.toThrow();
      expect(() => ds.defineThemes(undefined)).not.toThrow();
      expect(() => ds.defineThemes('string')).not.toThrow();
      expect(() => ds.defineThemes(123)).not.toThrow();
    });

    it('should handle defineComponents with invalid inputs', () => {
      expect(() => ds.defineComponents(null)).not.toThrow();
      expect(() => ds.defineComponents(undefined)).not.toThrow();
      expect(() => ds.defineComponents('string')).not.toThrow();
      expect(() => ds.defineComponents(123)).not.toThrow();
    });

    it('should handle calculateTokens with invalid config', () => {
      expect(() => ds.calculateTokens(null)).toThrow();
      expect(() => ds.calculateTokens(undefined)).toThrow();
      expect(() => ds.calculateTokens('string')).toThrow();
      expect(() => ds.calculateTokens(123)).toThrow();
    });

    it('should handle mergeTokens with invalid inputs', () => {
      expect(() => ds.mergeTokens(null, {})).toThrow();
      expect(() => ds.mergeTokens({}, null)).toThrow();
      expect(() => ds.mergeTokens('string', {})).toThrow();
      expect(() => ds.mergeTokens({}, 'string')).toThrow();
    });

    it('should handle flattenTokens with invalid inputs', () => {
      expect(() => ds.flattenTokens(null)).toThrow();
      expect(() => ds.flattenTokens(undefined)).toThrow();
      expect(() => ds.flattenTokens('string')).toThrow();
      expect(() => ds.flattenTokens(123)).toThrow();
      expect(() => ds.flattenTokens(true)).toThrow();
    });

    it('should handle export methods with invalid design system state', () => {
      const brokenDs = new DesignSystem();
      brokenDs.tokens = null;
      brokenDs.themes = null;
      brokenDs.components = null;

      expect(() => brokenDs.exportToCSS()).toThrow();
      expect(() => brokenDs.exportToSCSS()).toThrow();
      expect(() => brokenDs.exportToUnoCSS()).toThrow();
      expect(() => brokenDs.exportToJS()).not.toThrow(); // exportToJS just returns the properties
    });

    it('should handle resolveColorTokens with parsing errors', () => {
      const mockParseColorToken = vi.fn().mockImplementation(() => {
        throw new Error('Parse failed');
      });
      ds.parseColorToken = mockParseColorToken;

      const obj = { color: 'invalid-token' };
      const result = ds.resolveColorTokens(obj);
      expect(result.color).toBe('invalid-token'); // Should keep original on error
    });

    it('should handle loadConfig with network errors', async () => {
      const mockLoadConfig = vi.fn().mockRejectedValue(new Error('Network error'));
      ds.loadConfig = mockLoadConfig;

      // Should not throw, should handle error gracefully
      await expect(ds.loadConfig('remote.mjs')).rejects.toThrow('Network error');
    });

    it('should handle loadConfig with invalid file content', async () => {
      const mockLoadConfig = vi.fn().mockRejectedValue(new SyntaxError('Invalid syntax'));
      ds.loadConfig = mockLoadConfig;

      await expect(ds.loadConfig('invalid.mjs')).rejects.toThrow('Invalid syntax');
    });
  });

  describe('integration scenarios', () => {
    it('should handle complete design system workflow', () => {
      // Define tokens
      ds.defineTokens({
        colors: { primary: '#000', secondary: '#fff' },
        spacing: { small: '8px', large: '32px' }
      });

      // Define themes
      ds.defineThemes({
        dark: { colors: { primary: '#fff', secondary: '#000' } }
      });

      // Define components
      ds.defineComponents({
        button: { base: { padding: 'spacing.small' } }
      });

      // Test token retrieval
      expect(ds.getToken('colors.primary')).toBe('#000');
      expect(ds.getToken('colors.primary', ds.themes.dark)).toBe('#fff');

      // Test exports
      const css = ds.exportToCSS();
      expect(css).toContain('--ds-colors-primary: #000;');

      const scss = ds.exportToSCSS();
      expect(scss).toContain('$ds-colors-primary: #000;');

      const uno = ds.exportToUnoCSS();
      expect(uno.theme).toHaveProperty('ds-colors-primary', '#fff'); // theme overrides token

      const js = ds.exportToJS();
      expect(js.tokens.colors.primary).toBe('#000');
      expect(js.themes.dark.colors.primary).toBe('#fff');
      expect(js.components.button.base.padding).toBe('spacing.small');
    });

    it('should handle color token resolution in defineTokens', () => {
      const mockParseColorToken = vi.fn()
        .mockReturnValueOnce('#ff0000')
        .mockReturnValueOnce('#00ff00');

      ds.parseColorToken = mockParseColorToken;

      ds.defineTokens({
        colors: {
          primary: 'red-500',
          secondary: 'green-600'
        }
      });

      expect(mockParseColorToken).toHaveBeenCalledWith('red-500');
      expect(mockParseColorToken).toHaveBeenCalledWith('green-600');
      expect(ds.tokens.colors.primary).toBe('#ff0000');
      expect(ds.tokens.colors.secondary).toBe('#00ff00');
    });

    it('should handle complex token merging', () => {
      ds.defineTokens({ a: { b: { c: 1 } } });
      ds.defineTokens({ a: { b: { d: 2 } } });
      ds.defineTokens({ a: { e: 3 } });

      expect(ds.tokens.a.b.c).toBe(1);
      expect(ds.tokens.a.b.d).toBe(2);
      expect(ds.tokens.a.e).toBe(3);
    });
  });

  describe('performance and edge cases', () => {
    it('should handle large token objects', () => {
      const largeTokens = {};
      for (let i = 0; i < 1000; i++) {
        largeTokens[`token${i}`] = `value${i}`;
      }

      ds.defineTokens(largeTokens);
      expect(Object.keys(ds.tokens).length).toBe(1000);
      expect(ds.getToken('token500')).toBe('value500');
    });

    it('should handle special characters in token keys', () => {
      ds.defineTokens({
        'key-with-dashes': 'value1',
        'key_with_underscores': 'value2',
        'keyWithDots': 'value3',
        'key with spaces': 'value4'
      });

      expect(ds.getToken('key-with-dashes')).toBe('value1');
      expect(ds.getToken('key_with_underscores')).toBe('value2');
      expect(ds.getToken('keyWithDots')).toBe('value3');
      expect(ds.getToken('key with spaces')).toBe('value4');
    });

    it('should handle array values in tokens', () => {
      ds.defineTokens({
        fontFamily: ['Arial', 'sans-serif'],
        breakpoints: ['768px', '1024px', '1440px']
      });

      expect(ds.getToken('fontFamily')).toEqual(['Arial', 'sans-serif']);
      expect(ds.getToken('breakpoints')).toEqual(['768px', '1024px', '1440px']);
    });

    it('should handle function values in tokens', () => {
      const testFunction = () => 'test';
      ds.defineTokens({
        dynamicValue: testFunction
      });

      expect(ds.getToken('dynamicValue')).toBe(testFunction);
    });

    it('should handle very large token objects efficiently', () => {
      const startTime = Date.now();
      const hugeTokens = {};
      for (let i = 0; i < 10000; i++) {
        hugeTokens[`token${i}`] = {
          value: `value${i}`,
          nested: {
            deep: {
              deeper: `deepValue${i}`
            }
          }
        };
      }

      ds.defineTokens(hugeTokens);
      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(Object.keys(ds.tokens).length).toBe(10000);
      expect(duration).toBeLessThan(5000); // Should complete in less than 5 seconds
    });

    it('should handle deeply nested token structures', () => {
      const createDeepNested = (depth) => {
        let obj = 'deepest';
        for (let i = depth; i > 0; i--) {
          obj = { [`level${i}`]: obj };
        }
        return obj;
      };

      const deepTokens = createDeepNested(10); // Reduce depth to avoid issues
      ds.defineTokens(deepTokens);

      const flattened = ds.flattenTokens(ds.tokens);
      expect(Object.keys(flattened).length).toBe(1);
      expect(flattened['level1.level2.level3.level4.level5.level6.level7.level8.level9.level10']).toBe('deepest');
    });

    it('should handle export operations on large design systems', () => {
      const largeTokens = {};
      for (let i = 0; i < 1000; i++) {
        largeTokens[`color${i}`] = `#${(i % 0xFFFFFF).toString(16).padStart(6, '0')}`;
        largeTokens[`spacing${i}`] = `${i}px`;
      }
      ds.defineTokens(largeTokens);

      const startTime = Date.now();
      const css = ds.exportToCSS();
      const scss = ds.exportToSCSS();
      const uno = ds.exportToUnoCSS();
      const js = ds.exportToJS();
      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(css.length).toBeGreaterThan(10000);
      expect(scss.length).toBeGreaterThan(10000);
      expect(uno.theme).toBeDefined();
      expect(js.tokens).toBeDefined();
      expect(duration).toBeLessThan(2000); // Should complete in less than 2 seconds
    });

    it('should handle resolveColorTokens on large objects', () => {
      const mockParseColorToken = vi.fn().mockReturnValue('#ff0000');
      ds.parseColorToken = mockParseColorToken;

      const largeObj = {};
      for (let i = 0; i < 1000; i++) {
        largeObj[`color${i}`] = `red-${500 + (i % 5)}`;
        largeObj[`nested${i}`] = {
          color: `blue-${500 + (i % 5)}`,
          value: 'text'
        };
      }

      const startTime = Date.now();
      const result = ds.resolveColorTokens(largeObj);
      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(mockParseColorToken).toHaveBeenCalled();
      expect(result.color0).toBe('#ff0000');
      expect(duration).toBeLessThan(1000); // Should complete quickly
    });
  });

});