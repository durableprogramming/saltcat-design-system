import { describe, it, expect } from 'vitest';
import { exportToCSS, exportToSCSS, exportToUnoCSS, exportToJS } from '../src/exporters/index.js';

// Mock DesignSystem instance
const mockDesignSystem = {
  tokens: {
    colors: {
      primary: '#ffffff',
      secondary: {
        light: '#000000'
      }
    },
    spacing: {
      small: '8px',
      medium: '16px'
    },
    typography: {
      fontSize: '16px'
    }
  },
  themes: {
    dark: {
      colors: {
        primary: '#ffffff'
      }
    }
  },
  flattenTokens: function(obj) {
    const result = {};
    function flatten(o, prefix) {
      const p = prefix || '';
      const entries = Object.entries(o);
      for (let i = 0; i < entries.length; i++) {
        const key = entries[i][0];
        const value = entries[i][1];
        const newKey = p ? p + '.' + key : key;
        if (value && typeof value === 'object' && !Array.isArray(value)) {
          flatten(value, newKey);
        } else {
          result[newKey] = value;
        }
      }
    }
    flatten(obj);
    return result;
  }
};

describe('Exporters', () => {
  describe('exportToCSS', () => {
    it('should export tokens to CSS custom properties', () => {
      const css = exportToCSS(mockDesignSystem);
      expect(css).toContain(':root {');
      expect(css).toContain('--ds-colors-primary: #ffffff;');
      expect(css).toContain('--ds-colors-secondary-light: #000000;');
      expect(css).toContain('--ds-spacing-small: 8px;');
      expect(css).toContain('--ds-typography-fontSize: 16px;');
      expect(css).toContain('}');
    });

    it('should include theme variables', () => {
      const css = exportToCSS(mockDesignSystem);
      expect(css).toContain('/* dark theme */');
      expect(css).toContain('--ds-colors-primary: #ffffff;');
    });

    it('should use custom prefix and selector', () => {
      const css = exportToCSS(mockDesignSystem, { prefix: '--custom', selector: '.theme' });
      expect(css).toContain('.theme {');
      expect(css).toContain('--custom-colors-primary: #ffffff;');
    });

    it('should use custom postfix', () => {
      const css = exportToCSS(mockDesignSystem, { postfix: '-var' });
      expect(css).toContain('--ds-colors-primary-var: #ffffff;');
      expect(css).toContain('--ds-colors-secondary-light-var: #000000;');
    });

    it('should use custom prefix and postfix', () => {
      const css = exportToCSS(mockDesignSystem, { prefix: '--custom', postfix: '-val' });
      expect(css).toContain('--custom-colors-primary-val: #ffffff;');
    });
    it('should format different value types correctly', () => {
      const dsWithVariousValues = {
        ...mockDesignSystem,
        tokens: {
          string: 'value',
          number: 42,
          array: ['Arial', 'sans-serif'],
          object: { nested: 'value' }
        },
        flattenTokens: mockDesignSystem.flattenTokens
      };
      const css = exportToCSS(dsWithVariousValues);
      expect(css).toContain('--ds-string: "value";');
      expect(css).toContain('--ds-number: 42;');
      expect(css).toContain('--ds-array: "Arial", "sans-serif";');
      expect(css).toContain('--ds-object-nested: "value";');
    });

    it('should handle CSS values without quotes', () => {
      const dsWithCssValues = {
        ...mockDesignSystem,
        tokens: {
          color: '#ff0000',
          size: '16px',
          keyword: 'inherit'
        },
        flattenTokens: mockDesignSystem.flattenTokens
      };
      const css = exportToCSS(dsWithCssValues);
      expect(css).toContain('--ds-color: #ff0000;');
      expect(css).toContain('--ds-size: 16px;');
      expect(css).toContain('--ds-keyword: inherit;');
    });

    it('should handle empty tokens object', () => {
      const dsEmpty = {
        ...mockDesignSystem,
        tokens: {},
        themes: {},
        flattenTokens: mockDesignSystem.flattenTokens
      };
      const css = exportToCSS(dsEmpty);
      expect(css).toBe(':root {\n\n}');
    });

    it('should handle null and undefined values', () => {
      const dsWithNulls = {
        ...mockDesignSystem,
        tokens: {
          nullValue: null,
          undefinedValue: undefined,
          validValue: 'test'
        },
        themes: {},
        flattenTokens: mockDesignSystem.flattenTokens
      };
      const css = exportToCSS(dsWithNulls);
      expect(css).toContain('--ds-nullValue: null;');
      expect(css).toContain('--ds-undefinedValue: undefined;');
      expect(css).toContain('--ds-validValue: "test";');
    });

    it('should handle special characters in keys', () => {
      const dsWithSpecialKeys = {
        ...mockDesignSystem,
        tokens: {
          'key-with-dashes': 'value1',
          'key_with_underscores': 'value2',
          'key.with.dots': 'value3'
        },
        flattenTokens: mockDesignSystem.flattenTokens
      };
      const css = exportToCSS(dsWithSpecialKeys);
      expect(css).toContain('--ds-key-with-dashes: "value1";');
      expect(css).toContain('--ds-key_with_underscores: "value2";');
      expect(css).toContain('--ds-key-with-dots: "value3";');
    });

    it('should handle deeply nested objects', () => {
      const dsDeep = {
        ...mockDesignSystem,
        tokens: {
          level1: {
            level2: {
              level3: {
                value: 'deep'
              }
            }
          }
        },
        flattenTokens: mockDesignSystem.flattenTokens
      };
      const css = exportToCSS(dsDeep);
      expect(css).toContain('--ds-level1-level2-level3-value: "deep";');
    });

    it('should handle boolean values', () => {
      const dsWithBools = {
        ...mockDesignSystem,
        tokens: {
          trueValue: true,
          falseValue: false
        },
        themes: {},
        flattenTokens: mockDesignSystem.flattenTokens
      };
      const css = exportToCSS(dsWithBools);
      expect(css).toContain('--ds-trueValue: true;');
      expect(css).toContain('--ds-falseValue: false;');
    });

    it('should handle numeric values', () => {
      const dsWithNumbers = {
        ...mockDesignSystem,
        tokens: {
          integer: 42,
          float: 3.14,
          negative: -10,
          zero: 0
        },
        flattenTokens: mockDesignSystem.flattenTokens
      };
      const css = exportToCSS(dsWithNumbers);
      expect(css).toContain('--ds-integer: 42;');
      expect(css).toContain('--ds-float: 3.14;');
      expect(css).toContain('--ds-negative: -10;');
      expect(css).toContain('--ds-zero: 0;');
    });

    it('should handle complex objects and arrays', () => {
      const dsComplex = {
        ...mockDesignSystem,
        tokens: {
          complexObj: { a: 1, b: 2 },
          complexArray: [1, 2, 'three'],
          mixed: { array: [1, 2], obj: { nested: 'value' } }
        },
        themes: {},
        flattenTokens: mockDesignSystem.flattenTokens
      };
      const css = exportToCSS(dsComplex);
      expect(css).toContain('--ds-complexObj-a: 1;');
      expect(css).toContain('--ds-complexObj-b: 2;');
      expect(css).toContain('--ds-complexArray: "1", "2", "three";');
      expect(css).toContain('--ds-mixed-array: "1", "2";');
      expect(css).toContain('--ds-mixed-obj-nested: "value";');
    });

    it('should handle themes with empty objects', () => {
      const dsWithEmptyTheme = {
        ...mockDesignSystem,
        themes: {
          empty: {},
          normal: { colors: { primary: '#000' } }
        },
        flattenTokens: mockDesignSystem.flattenTokens
      };
      const css = exportToCSS(dsWithEmptyTheme);
      expect(css).toContain('/* empty theme */');
      expect(css).toContain('/* normal theme */');
      expect(css).toContain('--ds-colors-primary: #000;');
    });

    it('should handle custom prefix with special characters', () => {
      const css = exportToCSS(mockDesignSystem, { prefix: '--my-custom_' });
      expect(css).toContain('--my-custom_-colors-primary: #ffffff;');
    });

     it('should handle custom selector with complex CSS', () => {
       const css = exportToCSS(mockDesignSystem, { selector: '.my-theme[data-mode="dark"]' });
       expect(css).toContain('.my-theme[data-mode="dark"] {');
     });

     it('should handle tokens with very long keys', () => {
       const dsWithLongKeys = {
         ...mockDesignSystem,
         tokens: {
           'very-long-token-name-that-might-cause-issues-with-css-variable-naming-conventions': 'value'
         },
         flattenTokens: mockDesignSystem.flattenTokens
       };
       const css = exportToCSS(dsWithLongKeys);
       expect(css).toContain('--ds-very-long-token-name-that-might-cause-issues-with-css-variable-naming-conventions: "value";');
     });

     it('should handle tokens with special regex characters', () => {
       const dsWithSpecialChars = {
         ...mockDesignSystem,
         tokens: {
           'key.with.dots': 'value1',
           'key-with-dashes': 'value2',
           'key_with_underscores': 'value3',
           'key(with)parens': 'value4',
           'key[with]brackets': 'value5',
           'key+with+plus': 'value6',
           'key*with*asterisk': 'value7',
           'key?with?question': 'value8',
           'key^with^caret': 'value9',
           'key$with$dollar': 'value10'
         },
         flattenTokens: mockDesignSystem.flattenTokens
       };
       const css = exportToCSS(dsWithSpecialChars);
       expect(css).toContain('--ds-key-with-dots: "value1";');
       expect(css).toContain('--ds-key-with-dashes: "value2";');
       expect(css).toContain('--ds-key_with_underscores: "value3";');
       expect(css).toContain('--ds-key(with)parens: "value4";');
       expect(css).toContain('--ds-key[with]brackets: "value5";');
       expect(css).toContain('--ds-key+with+plus: "value6";');
       expect(css).toContain('--ds-key*with*asterisk: "value7";');
       expect(css).toContain('--ds-key?with?question: "value8";');
       expect(css).toContain('--ds-key^with^caret: "value9";');
       expect(css).toContain('--ds-key$with$dollar: "value10";');
     });

     it('should handle tokens with unicode characters', () => {
       const dsWithUnicode = {
         ...mockDesignSystem,
         tokens: {
           'café': 'coffee',
           'naïve': 'innocent',
           'Москва': 'moscow',
           '東京': 'tokyo',
           '🌟': 'star',
           'key_with_ñ': 'spanish'
         },
         flattenTokens: mockDesignSystem.flattenTokens
       };
       const css = exportToCSS(dsWithUnicode);
       expect(css).toContain('--ds-café: "coffee";');
       expect(css).toContain('--ds-naïve: "innocent";');
       expect(css).toContain('--ds-Москва: "moscow";');
       expect(css).toContain('--ds-東京: "tokyo";');
       expect(css).toContain('--ds-🌟: "star";');
       expect(css).toContain('--ds-key_with_ñ: "spanish";');
     });

     it('should handle extremely nested token structures', () => {
       const createDeepNested = (depth) => {
         let obj = 'deepest';
         for (let i = depth; i > 0; i--) {
           obj = { [`level${i}`]: obj };
         }
         return obj;
       };

       const dsDeep = {
         ...mockDesignSystem,
         tokens: createDeepNested(10),
         flattenTokens: mockDesignSystem.flattenTokens
       };
      const css = exportToCSS(dsDeep);
      expect(css).toContain('--ds-level1-level2-level3-level4-level5-level6-level7-level8-level9-level10: "deepest";');
     });
   });

  describe('exportToSCSS', () => {
    it('should export tokens to SCSS variables', () => {
      const scss = exportToSCSS(mockDesignSystem);
      expect(scss).toContain('$ds-colors-primary: #ffffff;');
      expect(scss).toContain('$ds-colors-secondary-light: #000000;');
      expect(scss).toContain('$ds-spacing-small: 8px;');
    });

    it('should use custom prefix', () => {
      const scss = exportToSCSS(mockDesignSystem, { prefix: '$custom' });
      expect(scss).toContain('$custom-colors-primary: #ffffff;');
    });

    it('should use custom postfix', () => {
      const scss = exportToSCSS(mockDesignSystem, { postfix: '_var' });
      expect(scss).toContain('$ds-colors-primary_var: #ffffff;');
    });

    it('should use custom prefix and postfix', () => {
      const scss = exportToSCSS(mockDesignSystem, { prefix: '$custom', postfix: '_val' });
      expect(scss).toContain('$custom-colors-primary_val: #ffffff;');
    });

    it('should format values correctly', () => {
      const dsWithVariousValues = {
        ...mockDesignSystem,
        tokens: {
          string: 'value',
          number: 42,
          array: ['Arial', 'sans-serif']
        },
        flattenTokens: mockDesignSystem.flattenTokens
      };
      const scss = exportToSCSS(dsWithVariousValues);
      expect(scss).toContain('$ds-string: "value";');
      expect(scss).toContain('$ds-number: 42;');
      expect(scss).toContain('$ds-array: ("Arial", "sans-serif");');
    });

    it('should handle empty tokens', () => {
      const dsEmpty = {
        ...mockDesignSystem,
        tokens: {},
        themes: {},
        flattenTokens: mockDesignSystem.flattenTokens
      };
      const scss = exportToSCSS(dsEmpty);
      expect(scss).toBe('');
    });



    it('should handle boolean values', () => {
      const dsWithBools = {
        ...mockDesignSystem,
        tokens: {
          trueValue: true,
          falseValue: false
        },
        themes: {},
        flattenTokens: mockDesignSystem.flattenTokens
      };
      const scss = exportToSCSS(dsWithBools);
      expect(scss).toContain('$ds-trueValue: true;');
      expect(scss).toContain('$ds-falseValue: false;');
    });

    it('should handle complex objects', () => {
      const dsComplex = {
        ...mockDesignSystem,
        tokens: {
          map: { key1: 'value1', key2: 'value2' },
          nested: { level1: { level2: 'deep' } }
        },
        themes: {},
        flattenTokens: mockDesignSystem.flattenTokens
      };
      const scss = exportToSCSS(dsComplex);
      expect(scss).toContain('$ds-map-key1: "value1";');
      expect(scss).toContain('$ds-map-key2: "value2";');
      expect(scss).toContain('$ds-nested-level1-level2: "deep";');
    });

    it('should handle themes with special characters', () => {
      const dsWithSpecialThemes = {
        ...mockDesignSystem,
        themes: {
          'dark-mode': { colors: { primary: '#000' } },
          'light_mode': { colors: { primary: '#fff' } }
        },
        flattenTokens: mockDesignSystem.flattenTokens
      };
      const scss = exportToSCSS(dsWithSpecialThemes);
      expect(scss).toContain('// dark-mode theme');
      expect(scss).toContain('// light_mode theme');
    });

    it('should handle custom prefix with underscores', () => {
      const scss = exportToSCSS(mockDesignSystem, { prefix: '$my_custom_' });
      expect(scss).toContain('$my_custom_-colors-primary: #ffffff;');
    });
  });

  describe('exportToUnoCSS', () => {
    it('should export tokens to UnoCSS preset', () => {
      const uno = exportToUnoCSS(mockDesignSystem);
      expect(uno).toHaveProperty('name', 'saltcat-design-system');
      expect(uno).toHaveProperty('theme');
      expect(uno.theme).toHaveProperty('colors');
      expect(uno.theme.colors).toHaveProperty('colors-primary', '#ffffff');
      expect(uno.theme.colors).toHaveProperty('colors-secondary-light', '#000000');
      expect(uno.theme).toHaveProperty('spacing');
      expect(uno.theme.spacing).toHaveProperty('spacing-small', '8px');
      expect(uno.theme).toHaveProperty('fontSize');
      expect(uno.theme.fontSize).toHaveProperty('typography-fontSize', '16px');
    });

    it('should include flattened tokens in theme', () => {
      const uno = exportToUnoCSS(mockDesignSystem);
      expect(uno.theme).toHaveProperty('ds-colors-primary', '#ffffff');
      expect(uno.theme).toHaveProperty('ds-spacing-small', '8px');
    });

    it('should handle empty design system', () => {
      const dsEmpty = {
        tokens: {},
        themes: {},
        flattenTokens: () => ({})
      };
      const uno = exportToUnoCSS(dsEmpty);
      expect(uno.name).toBe('saltcat-design-system');
      expect(uno.theme).toHaveProperty('colors');
      expect(uno.theme).toHaveProperty('fontFamily');
      expect(uno.theme).toHaveProperty('fontSize');
      expect(uno.theme).toHaveProperty('spacing');
    });

    it('should extract colors correctly', () => {
      const dsColors = {
        tokens: {
          colors: { primary: '#ff0000', secondary: 'blue-500' },
          bg: { main: '#ffffff' },
          text: { color: '#000000' }
        },
        themes: {},
        flattenTokens: function(obj) {
          const result = {};
          function flatten(o, prefix) {
            const p = prefix || '';
            const entries = Object.entries(o);
            for (let i = 0; i < entries.length; i++) {
              const key = entries[i][0];
              const value = entries[i][1];
              const newKey = p ? p + '.' + key : key;
              if (value && typeof value === 'object' && !Array.isArray(value)) {
                flatten(value, newKey);
              } else {
                result[newKey] = value;
              }
            }
          }
          flatten(obj);
          return result;
        }
      };
      const uno = exportToUnoCSS(dsColors);
      expect(uno.theme.colors).toHaveProperty('colors-primary', '#ff0000');
      expect(uno.theme.colors).toHaveProperty('bg-main', '#ffffff');
      expect(uno.theme.colors).toHaveProperty('text-color', '#000000');
    });

    it('should extract font families', () => {
      const dsFonts = {
        tokens: {
          typography: {
            fontFamily: { sans: ['Arial', 'sans-serif'], mono: 'Monaco' },
            'font-family': { serif: ['Times', 'serif'] }
          }
        },
        themes: {},
        flattenTokens: function(obj) {
          return {
            'typography.fontFamily.sans': ['Arial', 'sans-serif'],
            'typography.fontFamily.mono': 'Monaco',
            'typography.font-family.serif': ['Times', 'serif']
          };
        }
      };
      const uno = exportToUnoCSS(dsFonts);
      expect(uno.theme.fontFamily).toHaveProperty('typography-fontFamily-sans', ['Arial', 'sans-serif']);
      expect(uno.theme.fontFamily).toHaveProperty('typography-fontFamily-mono', ['Monaco']);
      expect(uno.theme.fontFamily).toHaveProperty('typography-font-family-serif', ['Times', 'serif']);
    });

    it('should extract font sizes', () => {
      const dsFontSizes = {
        tokens: {
          typography: {
            fontSize: { small: '12px', large: '24px' },
            'font-size': { medium: '16px' }
          }
        },
        themes: {},
        flattenTokens: function(obj) {
          return {
            'typography.fontSize.small': '12px',
            'typography.fontSize.large': '24px',
            'typography.font-size.medium': '16px'
          };
        }
      };
      const uno = exportToUnoCSS(dsFontSizes);
      expect(uno.theme.fontSize).toHaveProperty('typography-fontSize-small', '12px');
      expect(uno.theme.fontSize).toHaveProperty('typography-fontSize-large', '24px');
      expect(uno.theme.fontSize).toHaveProperty('typography-font-size-medium', '16px');
    });

    it('should extract spacing', () => {
      const dsSpacing = {
        tokens: {
          spacing: { small: '8px', large: '32px' },
          space: { tiny: '4px' },
          margin: { top: '16px' },
          padding: { bottom: '8px' }
        },
        themes: {},
        flattenTokens: function(obj) {
          return {
            'spacing.small': '8px',
            'spacing.large': '32px',
            'space.tiny': '4px',
            'margin.top': '16px',
            'padding.bottom': '8px'
          };
        }
      };
      const uno = exportToUnoCSS(dsSpacing);
      expect(uno.theme.spacing).toHaveProperty('spacing-small', '8px');
      expect(uno.theme.spacing).toHaveProperty('spacing-large', '32px');
      expect(uno.theme.spacing).toHaveProperty('space-tiny', '4px');
      expect(uno.theme.spacing).toHaveProperty('margin-top', '16px');
      expect(uno.theme.spacing).toHaveProperty('padding-bottom', '8px');
    });

    it('should handle custom prefix', () => {
      const uno = exportToUnoCSS(mockDesignSystem, { prefix: 'custom' });
      expect(uno.theme).toHaveProperty('custom-colors-primary', '#ffffff');
    });

    it('should handle custom postfix', () => {
      const uno = exportToUnoCSS(mockDesignSystem, { postfix: '_var' });
      expect(uno.theme).toHaveProperty('ds-colors-primary_var', '#ffffff');
    });

    it('should handle custom prefix and postfix', () => {
      const uno = exportToUnoCSS(mockDesignSystem, { prefix: 'custom', postfix: '_val' });
      expect(uno.theme).toHaveProperty('custom-colors-primary_val', '#ffffff');
    });

    it('should merge themes into main theme', () => {
      const dsWithThemes = {
        ...mockDesignSystem,
        themes: {
          dark: { colors: { primary: '#000000' } }
        },
        flattenTokens: mockDesignSystem.flattenTokens
      };
      const uno = exportToUnoCSS(dsWithThemes);
      expect(uno.theme).toHaveProperty('ds-colors-primary', '#000000'); // theme overrides token
    });
  });

  describe('exportToJS', () => {
    it('should export tokens to JavaScript object', () => {
      const js = exportToJS(mockDesignSystem);
      expect(js.tokens).toHaveProperty('colors');
      expect(js.tokens.colors).toHaveProperty('primary', '#ffffff');
      expect(js.tokens.colors.secondary).toHaveProperty('light', '#000000');
      expect(js.tokens).toHaveProperty('spacing');
      expect(js.tokens.spacing).toHaveProperty('small', '8px');
    });

    it('should include themes', () => {
      const js = exportToJS(mockDesignSystem);
      expect(js).toHaveProperty('themes');
      expect(js.themes).toHaveProperty('dark');
      expect(js.themes.dark.colors).toHaveProperty('primary', '#ffffff');
    });
  });

    it('should include components', () => {
      const dsWithComponents = {
        ...mockDesignSystem,
        components: {
          button: { base: { padding: '8px' } }
        }
      };
      const js = exportToJS(dsWithComponents);
      expect(js).toHaveProperty('components');
      expect(js.components).toHaveProperty('button');
    });

    it('should exclude themes when includeThemes is false', () => {
      const js = exportToJS(mockDesignSystem, { includeThemes: false });
      expect(js).not.toHaveProperty('themes');
      expect(js).toHaveProperty('tokens');
    });

    it('should exclude components when includeComponents is false', () => {
      const dsWithComponents = {
        ...mockDesignSystem,
        components: { button: {} }
      };
      const js = exportToJS(dsWithComponents, { includeComponents: false });
      expect(js).not.toHaveProperty('components');
      expect(js).toHaveProperty('tokens');
    });

    it('should handle empty design system', () => {
      const dsEmpty = {
        tokens: {},
        themes: {},
        components: {}
      };
      const js = exportToJS(dsEmpty);
      expect(js).toEqual({
        tokens: {},
        themes: {},
        components: {}
      });
    });

    it('should handle design system with only tokens', () => {
      const dsTokensOnly = {
        tokens: { colors: { primary: '#000' } },
        themes: {},
        components: {}
      };
      const js = exportToJS(dsTokensOnly);
      expect(js.tokens).toEqual({ colors: { primary: '#000' } });
      expect(js.themes).toEqual({});
      expect(js.components).toEqual({});
    });

    it('should handle complex nested structures', () => {
      const dsComplex = {
        tokens: {
          colors: {
            primary: { base: '#000', hover: '#111' },
            secondary: ['#fff', '#eee']
          }
        },
        themes: {
          dark: {
            colors: { primary: { base: '#fff' } }
          }
        },
        components: {
          button: {
            variants: {
              primary: { bg: 'colors.primary.base' },
              secondary: { bg: 'colors.secondary.0' }
            }
          }
        }
      };
      const js = exportToJS(dsComplex);
      expect(js.tokens.colors.primary.base).toBe('#000');
      expect(js.tokens.colors.secondary).toEqual(['#fff', '#eee']);
      expect(js.themes.dark.colors.primary.base).toBe('#fff');
      expect(js.components.button.variants.primary.bg).toBe('colors.primary.base');
    });

    it('should handle null and undefined values', () => {
      const dsWithNulls = {
        tokens: { nullVal: null, undefVal: undefined },
        themes: { theme: { nullTheme: null } },
        components: { comp: { undefComp: undefined } }
      };
      const js = exportToJS(dsWithNulls);
      expect(js.tokens.nullVal).toBeNull();
      expect(js.tokens.undefVal).toBeUndefined();
      expect(js.themes.theme.nullTheme).toBeNull();
      expect(js.components.comp.undefComp).toBeUndefined();
    });

    it('should handle boolean and numeric values', () => {
      const dsWithPrimitives = {
        tokens: {
          boolTrue: true,
          boolFalse: false,
          number: 42,
          float: 3.14,
          zero: 0
        }
      };
      const js = exportToJS(dsWithPrimitives);
      expect(js.tokens.boolTrue).toBe(true);
      expect(js.tokens.boolFalse).toBe(false);
      expect(js.tokens.number).toBe(42);
      expect(js.tokens.float).toBe(3.14);
      expect(js.tokens.zero).toBe(0);
    });
  });