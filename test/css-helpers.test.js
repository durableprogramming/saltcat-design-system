import { describe, it, expect } from 'vitest';
import { exportToCSS } from '../src/exporters/css.js';

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

describe('CSS Exporter Helper Functions', () => {
  describe('formatCSSValue', () => {
    it('should format string values that are CSS values without quotes', () => {
      const ds = createMockDesignSystem({
        color: '#ff0000',
        size: '16px',
        keyword: 'inherit'
      });
      const css = exportToCSS(ds);
      expect(css).toContain('--ds-color: #ff0000;');
      expect(css).toContain('--ds-size: 16px;');
      expect(css).toContain('--ds-keyword: inherit;');
    });

    it('should quote string values that are not CSS values', () => {
      const ds = createMockDesignSystem({
        text: 'Hello World',
        name: 'Arial'
      });
      const css = exportToCSS(ds);
      expect(css).toContain('--ds-text: "Hello World";');
      expect(css).toContain('--ds-name: "Arial";');
    });

    it('should format number values as strings', () => {
      const ds = createMockDesignSystem({
        integer: 42,
        float: 3.14,
        zero: 0,
        negative: -10
      });
      const css = exportToCSS(ds);
      expect(css).toContain('--ds-integer: 42;');
      expect(css).toContain('--ds-float: 3.14;');
      expect(css).toContain('--ds-zero: 0;');
      expect(css).toContain('--ds-negative: -10;');
    });

    it('should format array values as comma-separated quoted strings', () => {
      const ds = createMockDesignSystem({
        fonts: ['Arial', 'sans-serif'],
        values: [1, 2, 'three']
      });
      const css = exportToCSS(ds);
      expect(css).toContain('--ds-fonts: "Arial", "sans-serif";');
      expect(css).toContain('--ds-values: "1", "2", "three";');
    });

    it('should flatten object values into separate variables', () => {
      const ds = createMockDesignSystem({
        obj: { key: 'value', num: 42 },
        nested: { a: { b: 'c' } }
      });
      const css = exportToCSS(ds);
      expect(css).toContain('--ds-obj-key: "value";');
      expect(css).toContain('--ds-obj-num: 42;');
      expect(css).toContain('--ds-nested-a-b: "c";');
    });

    it('should format boolean values as strings', () => {
      const ds = createMockDesignSystem({
        boolTrue: true,
        boolFalse: false
      });
      const css = exportToCSS(ds);
      expect(css).toContain('--ds-boolTrue: true;');
      expect(css).toContain('--ds-boolFalse: false;');
    });

    it('should format null and undefined values as strings', () => {
      const ds = createMockDesignSystem({
        nullVal: null,
        undefVal: undefined
      });
      const css = exportToCSS(ds);
      expect(css).toContain('--ds-nullVal: null;');
      expect(css).toContain('--ds-undefVal: undefined;');
    });

    it('should handle empty arrays', () => {
      const ds = createMockDesignSystem({
        emptyArray: []
      });
      const css = exportToCSS(ds);
      expect(css).toContain('--ds-emptyArray: ;');
    });

    it('should handle empty objects', () => {
      const ds = createMockDesignSystem({
        emptyObj: {}
      });
      const css = exportToCSS(ds);
      // Empty objects result in no variables
      expect(css).toBe(':root {\n\n}');
    });
  });

  describe('isCSSValue', () => {
    it('should identify hex color values', () => {
      const ds = createMockDesignSystem({
        color3: '#f00',
        color6: '#ff0000',
        color8: '#ff0000ff',
        uppercase: '#ABCDEF',
        lowercase: '#abcdef'
      });
      const css = exportToCSS(ds);
      expect(css).toContain('--ds-color3: #f00;');
      expect(css).toContain('--ds-color6: #ff0000;');
      expect(css).toContain('--ds-color8: #ff0000ff;');
      expect(css).toContain('--ds-uppercase: #ABCDEF;');
      expect(css).toContain('--ds-lowercase: #abcdef;');
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
      const css = exportToCSS(ds);
      expect(css).toContain('--ds-rgb: rgb(255, 0, 0);');
      expect(css).toContain('--ds-rgba: rgba(255, 0, 0, 0.5);');
      expect(css).toContain('--ds-hsl: hsl(0, 100%, 50%);');
      expect(css).toContain('--ds-hsla: hsla(0, 100%, 50%, 0.5);');
      expect(css).toContain('--ds-RGB: RGB(255, 0, 0);');
      expect(css).toContain('--ds-HSL: HSL(0, 100%, 50%);');
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
      const css = exportToCSS(ds);
      expect(css).toContain('--ds-px: 16px;');
      expect(css).toContain('--ds-em: 1.5em;');
      expect(css).toContain('--ds-rem: 1rem;');
      expect(css).toContain('--ds-vh: 100vh;');
      expect(css).toContain('--ds-vw: 50vw;');
      expect(css).toContain('--ds-vmin: 10vmin;');
      expect(css).toContain('--ds-vmax: 90vmax;');
      expect(css).toContain('--ds-percent: 50%;');
      expect(css).toContain('--ds-pt: 12pt;');
      expect(css).toContain('--ds-pc: 1pc;');
      expect(css).toContain('--ds-in: 1in;');
      expect(css).toContain('--ds-cm: 2.54cm;');
      expect(css).toContain('--ds-mm: 25.4mm;');
      expect(css).toContain('--ds-ex: 1ex;');
      expect(css).toContain('--ds-ch: 1ch;');
    });

    it('should identify CSS keywords', () => {
      const ds = createMockDesignSystem({
        inherit: 'inherit',
        initial: 'initial',
        unset: 'unset',
        none: 'none',
        auto: 'auto',
        normal: 'normal',
        INHERIT: 'INHERIT',
        Initial: 'Initial'
      });
      const css = exportToCSS(ds);
      expect(css).toContain('--ds-inherit: inherit;');
      expect(css).toContain('--ds-initial: initial;');
      expect(css).toContain('--ds-unset: unset;');
      expect(css).toContain('--ds-none: none;');
      expect(css).toContain('--ds-auto: auto;');
      expect(css).toContain('--ds-normal: normal;');
      expect(css).toContain('--ds-INHERIT: INHERIT;');
      expect(css).toContain('--ds-Initial: Initial;');
    });

    it('should quote non-CSS values', () => {
      const ds = createMockDesignSystem({
        string: 'not a css value',
        numberString: '123',
        mixed: '16px-extra',
        invalidColor: '#gggggg',
        invalidUnit: '16unknown'
      });
      const css = exportToCSS(ds);
      expect(css).toContain('--ds-string: "not a css value";');
      expect(css).toContain('--ds-numberString: "123";');
      expect(css).toContain('--ds-mixed: "16px-extra";');
      expect(css).toContain('--ds-invalidColor: "#gggggg";');
      expect(css).toContain('--ds-invalidUnit: "16unknown";');
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
      const css = exportToCSS(ds);
      expect(css).toContain('--ds-shortHex: #fff;');
      expect(css).toContain('--ds-longHex: #ffffff;');
      expect(css).toContain('--ds-alphaHex: #ffffff80;');
      expect(css).toContain('--ds-invalidShort: "#ff";');
      expect(css).toContain('--ds-invalidLong: "#fffff";');
      expect(css).toContain('--ds-invalidChars: "#gggggg";');
    });

    it('should handle complex CSS function calls', () => {
      const ds = createMockDesignSystem({
        calc: 'calc(100% - 20px)',
        var: 'var(--some-var)',
        clamp: 'clamp(1rem, 2vw, 3rem)',
        min: 'min(10px, 5%)',
        max: 'max(100px, 10%)'
      });
      const css = exportToCSS(ds);
      expect(css).toContain('--ds-calc: "calc(100% - 20px)";');
      expect(css).toContain('--ds-var: "var(--some-var)";');
      expect(css).toContain('--ds-clamp: "clamp(1rem, 2vw, 3rem)";');
      expect(css).toContain('--ds-min: "min(10px, 5%)";');
      expect(css).toContain('--ds-max: "max(100px, 10%)";');
    });
  });

  describe('integration with themes', () => {
    it('should apply formatCSSValue to theme values', () => {
      const ds = createMockDesignSystem(
        { color: 'red' },
        { dark: { color: '#000000', size: '24px' } }
      );
      const css = exportToCSS(ds);
      expect(css).toContain('--ds-color: "red";');
      expect(css).toContain('--ds-color: #000000;');
      expect(css).toContain('--ds-size: 24px;');
    });
  });
});