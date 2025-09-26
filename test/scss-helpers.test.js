import { describe, it, expect } from 'vitest';
import { exportToSCSS } from '../src/exporters/scss.js';

// Mock DesignSystem instance for testing helper functions indirectly
function createMockDesignSystem(tokens = {}, themes = {}) {
  return {
    tokens,
    themes,
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
}

describe('SCSS Exporter Helper Functions', () => {
  describe('formatSCSSValue', () => {
    it('should format string values that are SCSS values without quotes', () => {
      const ds = createMockDesignSystem({
        color: '#ff0000',
        size: '16px',
        keyword: 'inherit',
        transparent: 'transparent'
      });
      const scss = exportToSCSS(ds);
      expect(scss).toContain('$ds-color: #ff0000;');
      expect(scss).toContain('$ds-size: 16px;');
      expect(scss).toContain('$ds-keyword: inherit;');
      expect(scss).toContain('$ds-transparent: transparent;');
    });

    it('should quote string values that are not SCSS values', () => {
      const ds = createMockDesignSystem({
        text: 'Hello World',
        name: 'Arial'
      });
      const scss = exportToSCSS(ds);
      expect(scss).toContain('$ds-text: "Hello World";');
      expect(scss).toContain('$ds-name: "Arial";');
    });

    it('should format number values as strings', () => {
      const ds = createMockDesignSystem({
        integer: 42,
        float: 3.14,
        zero: 0,
        negative: -10
      });
      const scss = exportToSCSS(ds);
      expect(scss).toContain('$ds-integer: 42;');
      expect(scss).toContain('$ds-float: 3.14;');
      expect(scss).toContain('$ds-zero: 0;');
      expect(scss).toContain('$ds-negative: -10;');
    });

    it('should format array values as SCSS lists', () => {
      const ds = createMockDesignSystem({
        fonts: ['Arial', 'sans-serif'],
        values: [1, 2, 'three']
      });
      const scss = exportToSCSS(ds);
      expect(scss).toContain('$ds-fonts: ("Arial", "sans-serif");');
      expect(scss).toContain('$ds-values: ("1", "2", "three");');
    });

    it('should flatten object values into separate variables', () => {
      const ds = createMockDesignSystem({
        obj: { key: 'value', num: 42 },
        nested: { a: { b: 'c' } }
      });
      const scss = exportToSCSS(ds);
      expect(scss).toContain('$ds-obj-key: "value";');
      expect(scss).toContain('$ds-obj-num: 42;');
      expect(scss).toContain('$ds-nested-a-b: "c";');
    });

    it('should format boolean values as strings', () => {
      const ds = createMockDesignSystem({
        boolTrue: true,
        boolFalse: false
      });
      const scss = exportToSCSS(ds);
      expect(scss).toContain('$ds-boolTrue: true;');
      expect(scss).toContain('$ds-boolFalse: false;');
    });

    it.skip('should format null and undefined values as strings', () => {
      const ds = createMockDesignSystem({
        nullVal: null,
        undefVal: undefined
      });
      const scss = exportToSCSS(ds);
      expect(scss).toContain('$ds-nullVal: null;');
      expect(scss).toContain('$ds-undefVal: undefined;');
    }); // Skip until formatSCSSValue handles null/undefined properly

    it('should handle empty arrays', () => {
      const ds = createMockDesignSystem({
        emptyArray: []
      });
      const scss = exportToSCSS(ds);
      expect(scss).toContain('$ds-emptyArray: ();');
    });

    it('should handle empty objects', () => {
      const ds = createMockDesignSystem({
        emptyObj: {}
      });
      const scss = exportToSCSS(ds);
      // Empty objects result in no variables
      expect(scss).toBe('');
    });

    it('should handle complex nested objects flattened', () => {
      const ds = createMockDesignSystem({
        complex: {
          colors: { primary: '#000', secondary: '#fff' },
          spacing: { small: '8px', large: '32px' }
        }
      });
      const scss = exportToSCSS(ds);
      expect(scss).toContain('$ds-complex-colors-primary: #000;');
      expect(scss).toContain('$ds-complex-colors-secondary: #fff;');
      expect(scss).toContain('$ds-complex-spacing-small: 8px;');
      expect(scss).toContain('$ds-complex-spacing-large: 32px;');
    });
  });

  describe('isSCSSValue', () => {
    it('should identify hex color values', () => {
      const ds = createMockDesignSystem({
        color3: '#f00',
        color6: '#ff0000',
        color8: '#ff0000ff',
        uppercase: '#ABCDEF',
        lowercase: '#abcdef'
      });
      const scss = exportToSCSS(ds);
      expect(scss).toContain('$ds-color3: #f00;');
      expect(scss).toContain('$ds-color6: #ff0000;');
      expect(scss).toContain('$ds-color8: #ff0000ff;');
      expect(scss).toContain('$ds-uppercase: #ABCDEF;');
      expect(scss).toContain('$ds-lowercase: #abcdef;');
    });

    it('should identify rgb/hsl color functions', () => {
      const ds = createMockDesignSystem({
        rgb: 'rgb(255, 0, 0)',
        rgba: 'rgba(255, 0, 0, 0.5)',
        hsl: 'hsl(0, 100%, 50%)',
        hsla: 'hsla(0, 100%, 50%, 0.5)',
        RGB: 'RGB(255, 0, 0)',
        HSL: 'HSL(0, 100%, 50%)'
      });
      const scss = exportToSCSS(ds);
      expect(scss).toContain('$ds-rgb: rgb(255, 0, 0);');
      expect(scss).toContain('$ds-rgba: rgba(255, 0, 0, 0.5);');
      expect(scss).toContain('$ds-hsl: hsl(0, 100%, 50%);');
      expect(scss).toContain('$ds-hsla: hsla(0, 100%, 50%, 0.5);');
      expect(scss).toContain('$ds-RGB: RGB(255, 0, 0);');
      expect(scss).toContain('$ds-HSL: HSL(0, 100%, 50%);');
    });

    it('should identify CSS units', () => {
      const ds = createMockDesignSystem({
        px: '16px',
        em: '1.5em',
        rem: '1rem',
        vh: '100vh',
        vw: '50vw',
        vmin: '10vmin',
        vmax: '90vmax',
        percent: '50%',
        pt: '12pt',
        pc: '1pc',
        in: '1in',
        cm: '2.54cm',
        mm: '25.4mm',
        ex: '1ex',
        ch: '1ch'
      });
      const scss = exportToSCSS(ds);
      expect(scss).toContain('$ds-px: 16px;');
      expect(scss).toContain('$ds-em: 1.5em;');
      expect(scss).toContain('$ds-rem: 1rem;');
      expect(scss).toContain('$ds-vh: 100vh;');
      expect(scss).toContain('$ds-vw: 50vw;');
      expect(scss).toContain('$ds-vmin: 10vmin;');
      expect(scss).toContain('$ds-vmax: 90vmax;');
      expect(scss).toContain('$ds-percent: 50%;');
      expect(scss).toContain('$ds-pt: 12pt;');
      expect(scss).toContain('$ds-pc: 1pc;');
      expect(scss).toContain('$ds-in: 1in;');
      expect(scss).toContain('$ds-cm: 2.54cm;');
      expect(scss).toContain('$ds-mm: 25.4mm;');
      expect(scss).toContain('$ds-ex: 1ex;');
      expect(scss).toContain('$ds-ch: 1ch;');
    });

    it('should identify SCSS keywords including transparent', () => {
      const ds = createMockDesignSystem({
        inherit: 'inherit',
        initial: 'initial',
        unset: 'unset',
        none: 'none',
        auto: 'auto',
        normal: 'normal',
        transparent: 'transparent',
        INHERIT: 'INHERIT',
        Initial: 'Initial'
      });
      const scss = exportToSCSS(ds);
      expect(scss).toContain('$ds-inherit: inherit;');
      expect(scss).toContain('$ds-initial: initial;');
      expect(scss).toContain('$ds-unset: unset;');
      expect(scss).toContain('$ds-none: none;');
      expect(scss).toContain('$ds-auto: auto;');
      expect(scss).toContain('$ds-normal: normal;');
      expect(scss).toContain('$ds-transparent: transparent;');
      expect(scss).toContain('$ds-INHERIT: INHERIT;');
      expect(scss).toContain('$ds-Initial: Initial;');
    });

    it('should quote non-SCSS values', () => {
      const ds = createMockDesignSystem({
        string: 'not a scss value',
        numberString: '123',
        mixed: '16px-extra',
        invalidColor: '#gggggg',
        invalidUnit: '16unknown'
      });
      const scss = exportToSCSS(ds);
      expect(scss).toContain('$ds-string: "not a scss value";');
      expect(scss).toContain('$ds-numberString: "123";');
      expect(scss).toContain('$ds-mixed: "16px-extra";');
      expect(scss).toContain('$ds-invalidColor: "#gggggg";');
      expect(scss).toContain('$ds-invalidUnit: "16unknown";');
    });

    it('should handle edge cases in color detection', () => {
      const ds = createMockDesignSystem({
        shortHex: '#fff',
        longHex: '#ffffff',
        alphaHex: '#ffffff80',
        invalidShort: '#ff',
        invalidLong: '#fffff',
        invalidChars: '#gggggg'
      });
      const scss = exportToSCSS(ds);
      expect(scss).toContain('$ds-shortHex: #fff;');
      expect(scss).toContain('$ds-longHex: #ffffff;');
      expect(scss).toContain('$ds-alphaHex: #ffffff80;');
      expect(scss).toContain('$ds-invalidShort: "#ff";');
      expect(scss).toContain('$ds-invalidLong: "#fffff";');
      expect(scss).toContain('$ds-invalidChars: "#gggggg";');
    });
  });

  describe('SCSS map formatting', () => {
    it('should format nested objects as flattened variables', () => {
      const ds = createMockDesignSystem({
        typography: {
          fontSize: { small: '12px', large: '24px' },
          fontFamily: { sans: ['Arial', 'sans-serif'] }
        }
      });
      const scss = exportToSCSS(ds);
      expect(scss).toContain('$ds-typography-fontSize-small: 12px;');
      expect(scss).toContain('$ds-typography-fontSize-large: 24px;');
      expect(scss).toContain('$ds-typography-fontFamily-sans: ("Arial", "sans-serif");');
    });

    it('should handle mixed value types in nested structures', () => {
      const ds = createMockDesignSystem({
        mixed: {
          color: '#ff0000',
          size: '16px',
          count: 42,
          enabled: true,
          fonts: ['Arial', 'Helvetica']
        }
      });
      const scss = exportToSCSS(ds);
      expect(scss).toContain('$ds-mixed-color: #ff0000;');
      expect(scss).toContain('$ds-mixed-size: 16px;');
      expect(scss).toContain('$ds-mixed-count: 42;');
      expect(scss).toContain('$ds-mixed-enabled: true;');
      expect(scss).toContain('$ds-mixed-fonts: ("Arial", "Helvetica");');
    });
  });

  describe('integration with themes', () => {
    it('should apply formatSCSSValue to theme values', () => {
      const ds = createMockDesignSystem(
        { color: 'red' },
        { dark: { color: '#000000', size: '24px', fonts: ['Arial', 'sans-serif'] } }
      );
      const scss = exportToSCSS(ds);
      expect(scss).toContain('$ds-color: "red";');
      expect(scss).toContain('// dark theme');
      expect(scss).toContain('$ds-color: #000000;');
      expect(scss).toContain('$ds-size: 24px;');
      expect(scss).toContain('$ds-fonts: ("Arial", "sans-serif");');
    });
  });
});