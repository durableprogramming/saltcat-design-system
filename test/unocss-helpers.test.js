import { describe, it, expect } from 'vitest';
import { exportToUnoCSS } from '../src/exporters/unocss.js';

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

describe('UnoCSS Exporter Helper Functions', () => {
  describe('extractColors', () => {
    it('should extract color tokens containing "color"', () => {
      const ds = createMockDesignSystem({
        colors: { primary: '#ff0000', secondary: '#00ff00' },
        color: { accent: '#0000ff' },
        'some-color': '#ffff00'
      });
      const uno = exportToUnoCSS(ds);
      expect(uno.theme.colors).toHaveProperty('colors-primary', '#ff0000');
      expect(uno.theme.colors).toHaveProperty('colors-secondary', '#00ff00');
      expect(uno.theme.colors).toHaveProperty('color-accent', '#0000ff');
      expect(uno.theme.colors).toHaveProperty('some-color', '#ffff00');
    });

    it('should extract color tokens containing "bg"', () => {
      const ds = createMockDesignSystem({
        bg: { primary: '#ff0000', secondary: '#00ff00' },
        background: { main: '#0000ff' },
        'bg-color': '#ffff00'
      });
      const uno = exportToUnoCSS(ds);
      expect(uno.theme.colors).toHaveProperty('bg-primary', '#ff0000');
      expect(uno.theme.colors).toHaveProperty('bg-secondary', '#00ff00');
      expect(uno.theme.colors).toHaveProperty('bg-color', '#ffff00');
      // 'background-main' doesn't contain 'bg', 'color', or 'text' so it's not extracted
    });

    it('should extract color tokens containing "text"', () => {
      const ds = createMockDesignSystem({
        text: { primary: '#ff0000', secondary: '#00ff00' },
        'text-color': '#0000ff',
        colorText: '#ffff00'
      });
      const uno = exportToUnoCSS(ds);
      expect(uno.theme.colors).toHaveProperty('text-primary', '#ff0000');
      expect(uno.theme.colors).toHaveProperty('text-secondary', '#00ff00');
      expect(uno.theme.colors).toHaveProperty('text-color', '#0000ff');
      expect(uno.theme.colors).toHaveProperty('colorText', '#ffff00');
    });

    it('should not extract non-color tokens', () => {
      const ds = createMockDesignSystem({
        spacing: { small: '8px', large: '16px' },
        typography: { fontSize: '14px' },
        border: { width: '1px' },
        shadow: '0 2px 4px rgba(0,0,0,0.1)'
      });
      const uno = exportToUnoCSS(ds);
      expect(uno.theme.colors).not.toHaveProperty('spacing-small');
      expect(uno.theme.colors).not.toHaveProperty('typography-fontSize');
      expect(uno.theme.colors).not.toHaveProperty('border-width');
      expect(uno.theme.colors).not.toHaveProperty('shadow');
    });

    it('should handle empty color objects', () => {
      const ds = createMockDesignSystem({
        colors: {},
        bg: {},
        text: {}
      });
      const uno = exportToUnoCSS(ds);
      expect(uno.theme.colors).toEqual({});
    });

    it('should handle color values that are not strings', () => {
      const ds = createMockDesignSystem({
        colors: { primary: 42, secondary: true, tertiary: null }
      });
      const uno = exportToUnoCSS(ds);
      expect(uno.theme.colors).toHaveProperty('colors-primary', 42);
      expect(uno.theme.colors).toHaveProperty('colors-secondary', true);
      expect(uno.theme.colors).toHaveProperty('colors-tertiary', null);
    });

    it('should handle deeply nested color structures', () => {
      const ds = createMockDesignSystem({
        theme: {
          colors: {
            primary: { base: '#ff0000', hover: '#cc0000' },
            secondary: { light: '#00ff00', dark: '#009900' }
          }
        }
      });
      const uno = exportToUnoCSS(ds);
      expect(uno.theme.colors).toHaveProperty('theme-colors-primary-base', '#ff0000');
      expect(uno.theme.colors).toHaveProperty('theme-colors-primary-hover', '#cc0000');
      expect(uno.theme.colors).toHaveProperty('theme-colors-secondary-light', '#00ff00');
      expect(uno.theme.colors).toHaveProperty('theme-colors-secondary-dark', '#009900');
    });
  });

  describe('extractFontFamilies', () => {
    it('should extract font-family tokens', () => {
      const ds = createMockDesignSystem({
        typography: { 'font-family': { sans: ['Arial', 'sans-serif'], mono: 'Monaco' } },
        fontFamily: { serif: ['Times', 'serif'] },
        'font-family': { custom: 'CustomFont' }
      });
      const uno = exportToUnoCSS(ds);
      expect(uno.theme.fontFamily).toHaveProperty('typography-font-family-sans', ['Arial', 'sans-serif']);
      expect(uno.theme.fontFamily).toHaveProperty('typography-font-family-mono', ['Monaco']);
      expect(uno.theme.fontFamily).toHaveProperty('fontFamily-serif', ['Times', 'serif']);
      expect(uno.theme.fontFamily).toHaveProperty('font-family-custom', ['CustomFont']);
    });

    it('should extract fontFamily tokens', () => {
      const ds = createMockDesignSystem({
        typography: { fontFamily: { sans: ['Arial', 'sans-serif'], mono: 'Monaco' } },
        fontFamily: { serif: ['Times', 'serif'] }
      });
      const uno = exportToUnoCSS(ds);
      expect(uno.theme.fontFamily).toHaveProperty('typography-fontFamily-sans', ['Arial', 'sans-serif']);
      expect(uno.theme.fontFamily).toHaveProperty('typography-fontFamily-mono', ['Monaco']);
      expect(uno.theme.fontFamily).toHaveProperty('fontFamily-serif', ['Times', 'serif']);
    });

    it('should convert single font strings to arrays', () => {
      const ds = createMockDesignSystem({
        typography: { fontFamily: { mono: 'Monaco', sans: 'Arial' } }
      });
      const uno = exportToUnoCSS(ds);
      expect(uno.theme.fontFamily).toHaveProperty('typography-fontFamily-mono', ['Monaco']);
      expect(uno.theme.fontFamily).toHaveProperty('typography-fontFamily-sans', ['Arial']);
    });

    it('should keep arrays as arrays', () => {
      const ds = createMockDesignSystem({
        typography: { fontFamily: { sans: ['Arial', 'sans-serif'] } }
      });
      const uno = exportToUnoCSS(ds);
      expect(uno.theme.fontFamily).toHaveProperty('typography-fontFamily-sans', ['Arial', 'sans-serif']);
    });

    it('should not extract non-font-family tokens', () => {
      const ds = createMockDesignSystem({
        colors: { primary: '#ff0000' },
        spacing: { small: '8px' },
        fontSize: { small: '12px' }
      });
      const uno = exportToUnoCSS(ds);
      expect(uno.theme.fontFamily).toEqual({});
    });

    it('should handle empty font family objects', () => {
      const ds = createMockDesignSystem({
        typography: { fontFamily: {} },
        fontFamily: {}
      });
      const uno = exportToUnoCSS(ds);
      expect(uno.theme.fontFamily).toEqual({});
    });
  });

  describe('extractFontSizes', () => {
    it('should extract font-size tokens', () => {
      const ds = createMockDesignSystem({
        typography: { 'font-size': { small: '12px', large: '24px' } },
        fontSize: { medium: '16px' },
        'font-size': { tiny: '10px' }
      });
      const uno = exportToUnoCSS(ds);
      expect(uno.theme.fontSize).toHaveProperty('typography-font-size-small', '12px');
      expect(uno.theme.fontSize).toHaveProperty('typography-font-size-large', '24px');
      expect(uno.theme.fontSize).toHaveProperty('fontSize-medium', '16px');
      expect(uno.theme.fontSize).toHaveProperty('font-size-tiny', '10px');
    });

    it('should extract fontSize tokens', () => {
      const ds = createMockDesignSystem({
        typography: { fontSize: { small: '12px', large: '24px' } },
        fontSize: { medium: '16px' }
      });
      const uno = exportToUnoCSS(ds);
      expect(uno.theme.fontSize).toHaveProperty('typography-fontSize-small', '12px');
      expect(uno.theme.fontSize).toHaveProperty('typography-fontSize-large', '24px');
      expect(uno.theme.fontSize).toHaveProperty('fontSize-medium', '16px');
    });

    it('should not extract non-font-size tokens', () => {
      const ds = createMockDesignSystem({
        colors: { primary: '#ff0000' },
        spacing: { small: '8px' },
        fontFamily: { sans: ['Arial'] }
      });
      const uno = exportToUnoCSS(ds);
      expect(uno.theme.fontSize).toEqual({});
    });

    it('should handle empty font size objects', () => {
      const ds = createMockDesignSystem({
        typography: { fontSize: {} },
        fontSize: {}
      });
      const uno = exportToUnoCSS(ds);
      expect(uno.theme.fontSize).toEqual({});
    });

    it('should handle numeric font size values', () => {
      const ds = createMockDesignSystem({
        typography: { fontSize: { small: 12, large: 24 } }
      });
      const uno = exportToUnoCSS(ds);
      expect(uno.theme.fontSize).toHaveProperty('typography-fontSize-small', 12);
      expect(uno.theme.fontSize).toHaveProperty('typography-fontSize-large', 24);
    });
  });

  describe('extractSpacing', () => {
    it('should extract spacing tokens', () => {
      const ds = createMockDesignSystem({
        spacing: { small: '8px', large: '32px' },
        space: { tiny: '4px' },
        margin: { top: '16px' },
        padding: { bottom: '8px' }
      });
      const uno = exportToUnoCSS(ds);
      expect(uno.theme.spacing).toHaveProperty('spacing-small', '8px');
      expect(uno.theme.spacing).toHaveProperty('spacing-large', '32px');
      expect(uno.theme.spacing).toHaveProperty('space-tiny', '4px');
      expect(uno.theme.spacing).toHaveProperty('margin-top', '16px');
      expect(uno.theme.spacing).toHaveProperty('padding-bottom', '8px');
    });

    it('should not extract non-spacing tokens', () => {
      const ds = createMockDesignSystem({
        colors: { primary: '#ff0000' },
        typography: { fontSize: '14px' },
        border: { width: '1px' }
      });
      const uno = exportToUnoCSS(ds);
      expect(uno.theme.spacing).toEqual({});
    });

    it('should handle empty spacing objects', () => {
      const ds = createMockDesignSystem({
        spacing: {},
        margin: {},
        padding: {}
      });
      const uno = exportToUnoCSS(ds);
      expect(uno.theme.spacing).toEqual({});
    });

    it('should handle numeric spacing values', () => {
      const ds = createMockDesignSystem({
        spacing: { small: 8, large: 32 }
      });
      const uno = exportToUnoCSS(ds);
      expect(uno.theme.spacing).toHaveProperty('spacing-small', 8);
      expect(uno.theme.spacing).toHaveProperty('spacing-large', 32);
    });

    it('should handle deeply nested spacing structures', () => {
      const ds = createMockDesignSystem({
        layout: {
          spacing: {
            component: { small: '8px', large: '16px' },
            page: { margin: '24px' }
          }
        }
      });
      const uno = exportToUnoCSS(ds);
      expect(uno.theme.spacing).toHaveProperty('layout-spacing-component-small', '8px');
      expect(uno.theme.spacing).toHaveProperty('layout-spacing-component-large', '16px');
      expect(uno.theme.spacing).toHaveProperty('layout-spacing-page-margin', '24px');
    });
  });

  describe('integration with main export', () => {
    it('should include all extracted categories in theme', () => {
      const ds = createMockDesignSystem({
        colors: { primary: '#ff0000' },
        typography: {
          fontFamily: { sans: ['Arial', 'sans-serif'] },
          fontSize: { base: '16px' }
        },
        spacing: { small: '8px' },
        other: { value: 'not extracted' }
      });
      const uno = exportToUnoCSS(ds);
      expect(uno.theme).toHaveProperty('colors');
      expect(uno.theme).toHaveProperty('fontFamily');
      expect(uno.theme).toHaveProperty('fontSize');
      expect(uno.theme).toHaveProperty('spacing');
      expect(uno.theme).toHaveProperty('ds-other-value', 'not extracted'); // flattened with prefix
    });

    it('should handle themes with different prefixes', () => {
      const ds = createMockDesignSystem(
        {
          colors: { primary: '#ff0000' },
          typography: { fontSize: { base: '16px' } }
        },
        {
          dark: {
            colors: { primary: '#000000' },
            typography: { fontSize: { base: '18px' } }
          }
        }
      );
      const uno = exportToUnoCSS(ds);
      // Theme overrides should be included
      expect(uno.theme).toHaveProperty('ds-colors-primary', '#000000'); // from dark theme
      expect(uno.theme).toHaveProperty('ds-typography-fontSize-base', '18px'); // from dark theme
    });

    it('should use custom prefix', () => {
      const ds = createMockDesignSystem({
        colors: { primary: '#ff0000' },
        typography: { fontSize: { base: '16px' } }
      });
      const uno = exportToUnoCSS(ds, { prefix: 'custom' });
      expect(uno.theme).toHaveProperty('custom-colors-primary', '#ff0000');
      expect(uno.theme).toHaveProperty('custom-typography-fontSize-base', '16px');
    });
  });

  describe('edge cases', () => {
    it('should handle empty design system', () => {
      const ds = createMockDesignSystem({}, {});
      const uno = exportToUnoCSS(ds);
      expect(uno.name).toBe('saltcat-design-system');
      expect(uno.theme.colors).toEqual({});
      expect(uno.theme.fontFamily).toEqual({});
      expect(uno.theme.fontSize).toEqual({});
      expect(uno.theme.spacing).toEqual({});
    });

    it('should handle null and undefined values', () => {
      const ds = createMockDesignSystem({
        colors: { primary: null, secondary: undefined },
        typography: { fontSize: { base: null } }
      });
      const uno = exportToUnoCSS(ds);
      expect(uno.theme.colors).toHaveProperty('colors-primary', null);
      expect(uno.theme.colors).toHaveProperty('colors-secondary', undefined);
      expect(uno.theme.fontSize).toHaveProperty('typography-fontSize-base', null);
    });

    it('should handle special characters in keys', () => {
      const ds = createMockDesignSystem({
        'color-primary': '#ff0000',
        'font-size-base': '16px',
        'spacing-small': '8px'
      });
      const uno = exportToUnoCSS(ds);
      expect(uno.theme.colors).toHaveProperty('color-primary', '#ff0000');
      expect(uno.theme.fontSize).toHaveProperty('font-size-base', '16px');
      expect(uno.theme.spacing).toHaveProperty('spacing-small', '8px');
    });
  });
});