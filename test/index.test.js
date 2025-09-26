import { describe, it, expect } from 'vitest';
import defaultExport, { DesignSystem, loadConfig, calculations, exporters } from '../src/index.js';

describe('Main exports', () => {
  it('should export DesignSystem as default', () => {
    expect(defaultExport).toBe(DesignSystem);
  });

  it('should export DesignSystem class', () => {
    expect(typeof DesignSystem).toBe('function');
    expect(DesignSystem.name).toBe('DesignSystem');
  });

  it('should export loadConfig function', () => {
    expect(typeof loadConfig).toBe('function');
  });

  it('should export calculations module', () => {
    expect(typeof calculations).toBe('object');
    expect(calculations).toHaveProperty('calculateTokens');
    expect(calculations).toHaveProperty('generateTypographyScale');
    expect(calculations).toHaveProperty('generateSpacingScale');
    expect(calculations).toHaveProperty('generateColorScale');
    expect(calculations).toHaveProperty('generateModularScale');
  });

  it('should export exporters module', () => {
    expect(typeof exporters).toBe('object');
    expect(exporters).toHaveProperty('exportToCSS');
    expect(exporters).toHaveProperty('exportToSCSS');
    expect(exporters).toHaveProperty('exportToUnoCSS');
    expect(exporters).toHaveProperty('exportToJS');
  });

  it('should create DesignSystem instance from default export', () => {
    const ds = new defaultExport();
    expect(ds).toBeInstanceOf(DesignSystem);
  });

  it('should have all expected properties on DesignSystem instance', () => {
    const ds = new DesignSystem();
    expect(ds).toHaveProperty('tokens');
    expect(ds).toHaveProperty('themes');
    expect(ds).toHaveProperty('components');
    expect(ds).toHaveProperty('options');
    expect(ds).toHaveProperty('defineTokens');
    expect(ds).toHaveProperty('defineThemes');
    expect(ds).toHaveProperty('defineComponents');
    expect(ds).toHaveProperty('calculateTokens');
    expect(ds).toHaveProperty('getToken');
    expect(ds).toHaveProperty('flattenTokens');
    expect(ds).toHaveProperty('exportToCSS');
    expect(ds).toHaveProperty('exportToSCSS');
    expect(ds).toHaveProperty('exportToUnoCSS');
    expect(ds).toHaveProperty('exportToJS');
    expect(ds).toHaveProperty('configureColorTokens');
    expect(ds).toHaveProperty('parseColorToken');
    expect(ds).toHaveProperty('resolveColorTokens');
    expect(ds).toHaveProperty('isColorToken');
    expect(ds).toHaveProperty('mergeTokens');
    expect(ds).toHaveProperty('loadConfig');
  });

  it('should export all expected functions', () => {
    expect(typeof loadConfig).toBe('function');
    expect(typeof calculations.calculateTokens).toBe('function');
    expect(typeof calculations.generateTypographyScale).toBe('function');
    expect(typeof calculations.generateSpacingScale).toBe('function');
    expect(typeof calculations.generateColorScale).toBe('function');
    expect(typeof calculations.generateModularScale).toBe('function');
    expect(typeof exporters.exportToCSS).toBe('function');
    expect(typeof exporters.exportToSCSS).toBe('function');
    expect(typeof exporters.exportToUnoCSS).toBe('function');
    expect(typeof exporters.exportToJS).toBe('function');
  });

  it('should create multiple DesignSystem instances independently', () => {
    const ds1 = new DesignSystem();
    const ds2 = new DesignSystem();

    ds1.defineTokens({ test: 'value1' });
    ds2.defineTokens({ test: 'value2' });

    expect(ds1.tokens.test).toBe('value1');
    expect(ds2.tokens.test).toBe('value2');
  });

  it('should export all calculation functions', () => {
    expect(typeof calculations.generateTypographyScale).toBe('function');
    expect(typeof calculations.generateSpacingScale).toBe('function');
    expect(typeof calculations.generateColorScale).toBe('function');
    expect(typeof calculations.generateModularScale).toBe('function');
    expect(typeof calculations.calculateTokens).toBe('function');
  });

  it('should export all exporter functions', () => {
    expect(typeof exporters.exportToCSS).toBe('function');
    expect(typeof exporters.exportToSCSS).toBe('function');
    expect(typeof exporters.exportToUnoCSS).toBe('function');
    expect(typeof exporters.exportToJS).toBe('function');
  });

  it('should have working DesignSystem methods', () => {
    const ds = new DesignSystem();
    ds.defineTokens({ colors: { primary: '#000' } });
    expect(ds.getToken('colors.primary')).toBe('#000');
    expect(ds.exportToJS().tokens.colors.primary).toBe('#000');
  });

  it('should export all calculation functions correctly', () => {
    expect(typeof calculations.generateTypographyScale).toBe('function');
    expect(typeof calculations.generateSpacingScale).toBe('function');
    expect(typeof calculations.generateColorScale).toBe('function');
    expect(typeof calculations.generateModularScale).toBe('function');
    expect(typeof calculations.calculateTokens).toBe('function');

    // Test that they can be called
    const typographyScale = calculations.generateTypographyScale({
      startSize: 16,
      multiplier: 1.2,
      scaleNames: ['base']
    });
    expect(typographyScale.base).toBe('1.000rem');

    const spacingScale = calculations.generateSpacingScale({
      baseUnit: 8,
      multiplier: 2,
      steps: 1
    });
    expect(spacingScale['1']).toBe('0.500rem');
  });

  it('should export all exporter functions correctly', () => {
    expect(typeof exporters.exportToCSS).toBe('function');
    expect(typeof exporters.exportToSCSS).toBe('function');
    expect(typeof exporters.exportToUnoCSS).toBe('function');
    expect(typeof exporters.exportToJS).toBe('function');

    // Test that they can be called with mock data
    const mockDS = {
      tokens: { colors: { primary: '#000' } },
      themes: {},
      flattenTokens: (obj) => ({ 'colors.primary': '#000' })
    };

    const css = exporters.exportToCSS(mockDS);
    expect(css).toContain('--ds-colors-primary: #000;');

    const scss = exporters.exportToSCSS(mockDS);
    expect(scss).toContain('$ds-colors-primary: #000;');

    const uno = exporters.exportToUnoCSS(mockDS);
    expect(uno.theme).toHaveProperty('ds-colors-primary', '#000');

    const js = exporters.exportToJS(mockDS);
    expect(js.tokens.colors.primary).toBe('#000');
  });

  it('should support full design system workflow through exports', () => {
    const ds = new DesignSystem();

    // Use calculations to generate tokens
    const config = {
      typography: {
        fontSize: {
          startSize: 16,
          multiplier: 1.2,
          scaleNames: ['base']
        }
      },
      colors: {
        primary: 'blue'
      }
    };
    const calculatedTokens = calculations.calculateTokens(config);
    ds.defineTokens(calculatedTokens);

    // Export using different exporters
    const css = ds.exportToCSS();
    expect(css).toContain('--ds-typography-fontSize-base: 1.000rem;');

    const scss = ds.exportToSCSS();
    expect(scss).toContain('$ds-typography-fontSize-base: 1.000rem;');

    const uno = ds.exportToUnoCSS();
    expect(uno.theme).toHaveProperty('ds-typography-fontSize-base', '1.000rem');

    const js = ds.exportToJS();
    expect(js.tokens.typography.fontSize.base).toBe('1.000rem');
  });

  it('should handle loadConfig function', () => {
    expect(typeof loadConfig).toBe('function');
    // Note: loadConfig is async and requires file system access
    // Integration test would require actual files
  });

  it('should create independent DesignSystem instances', () => {
    const ds1 = new DesignSystem({ configPath: 'path1.mjs' });
    const ds2 = new DesignSystem({ configPath: 'path2.mjs' });

    ds1.defineTokens({ unique1: 'value1' });
    ds2.defineTokens({ unique2: 'value2' });

    expect(ds1.tokens.unique1).toBe('value1');
    expect(ds1.tokens.unique2).toBeUndefined();
    expect(ds2.tokens.unique2).toBe('value2');
    expect(ds2.tokens.unique1).toBeUndefined();
  });



  it('should export consistent API across all modules', () => {
    // Check that all expected exports are present and functional
    expect(DesignSystem).toBeDefined();
    expect(loadConfig).toBeDefined();
    expect(calculations).toBeDefined();
    expect(exporters).toBeDefined();

    // Check that DesignSystem has all expected methods
    const ds = new DesignSystem();
    const expectedMethods = [
      'defineTokens', 'defineThemes', 'defineComponents',
      'calculateTokens', 'getToken', 'flattenTokens',
      'exportToCSS', 'exportToSCSS', 'exportToUnoCSS', 'exportToJS',
      'configureColorTokens', 'parseColorToken', 'resolveColorTokens',
      'isColorToken', 'mergeTokens', 'loadConfig'
    ];

    expectedMethods.forEach(method => {
      expect(typeof ds[method]).toBe('function');
    });
  });
});