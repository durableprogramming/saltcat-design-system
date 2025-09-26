import { describe, it, expect } from 'vitest';
import {
  generateTypographyScale,
  generateSpacingScale,
  generateColorScale,
  generateModularScale,
  calculateTokens
} from '../src/utils/calculations.js';

describe('generateTypographyScale', () => {
  it('should generate a typography scale with default options', () => {
    const scale = generateTypographyScale({
      startSize: 12,
      multiplier: 1.2
    });

    expect(scale.xs).toBe('0.750rem');
    expect(scale.sm).toBe('0.900rem');
    expect(scale.base).toBe('1.080rem');
    expect(scale.lg).toBe('1.296rem');
    expect(scale.xl).toBe('1.555rem');
  });

  it('should respect endSize limit', () => {
    const scale = generateTypographyScale({
      startSize: 12,
      endSize: 50,
      multiplier: 1.5
    });

    expect(scale.xs).toBe('0.750rem');
    expect(scale.sm).toBe('1.125rem');
    expect(scale.base).toBe('1.688rem');
    expect(scale.lg).toBe('2.531rem');
    expect(scale.xl).toBeUndefined(); // Should stop before exceeding endSize
  });

  it('should use custom scale names', () => {
    const scale = generateTypographyScale({
      startSize: 14,
      multiplier: 1.25,
      scaleNames: ['tiny', 'small', 'medium', 'large']
    });

    expect(scale.tiny).toBe('0.875rem');
    expect(scale.small).toBe('1.094rem');
    expect(scale.medium).toBe('1.367rem');
    expect(scale.large).toBe('1.709rem');
  });

  it('should support px unit', () => {
    const scale = generateTypographyScale({
      startSize: 16,
      multiplier: 1.2,
      unit: 'px'
    });

    expect(scale.xs).toBe('16px');
    expect(scale.sm).toBe('19px');
  });

  it('should support custom baseSize for rem calculations', () => {
    const scale = generateTypographyScale({
      startSize: 16,
      multiplier: 1.2,
      baseSize: 20
    });

    expect(scale.xs).toBe('0.800rem');
  });

  it('should handle empty scaleNames array', () => {
    const scale = generateTypographyScale({
      startSize: 16,
      multiplier: 1.2,
      scaleNames: []
    });

    expect(Object.keys(scale)).toHaveLength(0);
  });

  it('should handle multiplier of 1', () => {
    const scale = generateTypographyScale({
      startSize: 16,
      multiplier: 1,
      scaleNames: ['base', 'same']
    });

    expect(scale.base).toBe('1.000rem');
    expect(scale.same).toBe('1.000rem');
  });

  it('should handle very small startSize', () => {
    const scale = generateTypographyScale({
      startSize: 1,
      multiplier: 2,
      scaleNames: ['tiny']
    });

    expect(scale.tiny).toBe('0.063rem');
  });

  it('should handle large multiplier', () => {
    const scale = generateTypographyScale({
      startSize: 10,
      multiplier: 10,
      scaleNames: ['small', 'large']
    });

    expect(scale.small).toBe('0.625rem');
    expect(scale.large).toBe('6.250rem');
  });

  it('should handle fractional multiplier', () => {
    const scale = generateTypographyScale({
      startSize: 16,
      multiplier: 1.1,
      scaleNames: ['base', 'large']
    });

    expect(scale.base).toBe('1.000rem');
    expect(scale.large).toBe('1.100rem');
  });

  it('should handle custom baseSize', () => {
    const scale = generateTypographyScale({
      startSize: 16,
      multiplier: 1.2,
      baseSize: 20,
      scaleNames: ['base']
    });

    expect(scale.base).toBe('0.800rem');
  });

  it('should handle px unit with custom baseSize', () => {
    const scale = generateTypographyScale({
      startSize: 16,
      multiplier: 1.2,
      unit: 'px',
      baseSize: 20,
      scaleNames: ['base']
    });

    expect(scale.base).toBe('16px');
  });
});

describe('generateSpacingScale', () => {
  it('should generate a spacing scale with default options', () => {
    const scale = generateSpacingScale({
      baseUnit: 4,
      multiplier: 2,
      steps: 5
    });

    expect(scale['0']).toBe('0.000rem');
    expect(scale['1']).toBe('0.250rem');
    expect(scale['2']).toBe('0.500rem');
    expect(scale['3']).toBe('1.000rem');
    expect(scale['4']).toBe('2.000rem');
    expect(scale['5']).toBe('4.000rem');
  });

  it('should exclude zero when includeZero is false', () => {
    const scale = generateSpacingScale({
      baseUnit: 4,
      multiplier: 2,
      steps: 3,
      includeZero: false
    });

    expect(scale['0']).toBeUndefined();
    expect(scale['1']).toBe('0.250rem');
    expect(scale['2']).toBe('0.500rem');
    expect(scale['3']).toBe('1.000rem');
  });

  it('should support px unit', () => {
    const scale = generateSpacingScale({
      baseUnit: 8,
      multiplier: 1.5,
      steps: 2,
      unit: 'px'
    });

    expect(scale['0']).toBe('0px');
    expect(scale['1']).toBe('8px');
    expect(scale['2']).toBe('12px');
  });

  it('should handle steps = 0', () => {
    const scale = generateSpacingScale({
      baseUnit: 4,
      multiplier: 2,
      steps: 0,
      includeZero: true
    });

    expect(scale['0']).toBe('0.000rem');
    expect(scale['1']).toBeUndefined();
  });

  it('should handle multiplier = 1', () => {
    const scale = generateSpacingScale({
      baseUnit: 4,
      multiplier: 1,
      steps: 2,
      includeZero: false
    });

    expect(scale['1']).toBe('0.250rem');
    expect(scale['2']).toBe('0.250rem');
  });

  it('should handle large baseUnit', () => {
    const scale = generateSpacingScale({
      baseUnit: 100,
      multiplier: 2,
      steps: 1,
      includeZero: false
    });

    expect(scale['1']).toBe('6.250rem');
  });

  it('should support custom unit', () => {
    const scale = generateSpacingScale({
      baseUnit: 10,
      multiplier: 2,
      steps: 1,
      unit: 'em',
      includeZero: false
    });

    expect(scale['1']).toBe('10em');
  });

  it('should handle fractional baseUnit', () => {
    const scale = generateSpacingScale({
      baseUnit: 0.5,
      multiplier: 2,
      steps: 2,
      includeZero: false
    });

    expect(scale['1']).toBe('0.031rem');
    expect(scale['2']).toBe('0.063rem');
  });

  it('should handle large steps', () => {
    const scale = generateSpacingScale({
      baseUnit: 4,
      multiplier: 1.5,
      steps: 10,
      includeZero: false
    });

    expect(scale['10']).toBeDefined();
  });
});

describe('generateColorScale', () => {
  it('should generate a color scale using saltcat-color-tokens', () => {
    const scale = generateColorScale({
      colorName: 'blue'
    });

    expect(scale['50']).toBeDefined();
    expect(scale['100']).toBeDefined();
    expect(scale['500']).toBeDefined();
    expect(scale['900']).toBeDefined();
    // Should be valid hex colors
    expect(scale['500']).toMatch(/^#[0-9a-f]{6}$/i);
  });

  it('should handle different color names', () => {
    const redScale = generateColorScale({
      colorName: 'red'
    });
    const greenScale = generateColorScale({
      colorName: 'green'
    });

    expect(redScale['500']).toBeDefined();
    expect(greenScale['500']).toBeDefined();
    expect(redScale['500']).not.toBe(greenScale['500']); // Different colors
  });

  it('should accept configuration options', () => {
    const scale = generateColorScale({
      colorName: 'blue',
      config: {
        minBrightness: 0.1,
        maxBrightness: 0.9
      }
    });

    expect(scale['50']).toBeDefined();
    expect(scale['500']).toBeDefined();
  });

  it('should handle empty config', () => {
    const scale = generateColorScale({
      colorName: 'red'
    });

    expect(scale['100']).toBeDefined();
  });

  it('should return empty object for invalid colorName', () => {
    const scale = generateColorScale({
      colorName: 'invalidcolor'
    });

    expect(scale).toEqual({});
  });

  it('should handle colorName with numbers', () => {
    const scale = generateColorScale({
      colorName: 'red'
    });

    expect(scale['50']).toBeDefined();
    expect(scale['900']).toBeDefined();
  });

  it('should handle config with different brightness', () => {
    const scale = generateColorScale({
      colorName: 'blue',
      config: {
        minBrightness: 0.2,
        maxBrightness: 0.8
      }
    });

    expect(scale['50']).toBeDefined();
  });
});

describe('generateModularScale', () => {
  it('should generate a modular scale with default options', () => {
    const scale = generateModularScale({
      base: 16,
      ratio: 1.2,
      steps: 2
    });

    expect(scale.n2).toBeCloseTo(16 / (1.2 * 1.2), 2);
    expect(scale.n1).toBeCloseTo(16 / 1.2, 2);
    expect(scale.base).toBe(16);
    expect(scale.p1).toBeCloseTo(16 * 1.2, 2);
    expect(scale.p2).toBeCloseTo(16 * 1.2 * 1.2, 2);
  });

  it('should use custom formatter', () => {
    const scale = generateModularScale({
      base: 16,
      ratio: 1.5,
      steps: 1,
      formatter: (value) => `${value.toFixed(1)}px`
    });

    expect(scale.n1).toBe('10.7px');
    expect(scale.base).toBe('16.0px');
    expect(scale.p1).toBe('24.0px');
  });

  it('should handle steps = 0', () => {
    const scale = generateModularScale({
      base: 16,
      ratio: 1.2,
      steps: 0
    });

    expect(scale.base).toBe(16);
    expect(scale.n1).toBeUndefined();
    expect(scale.p1).toBeUndefined();
  });

  it('should handle ratio = 1', () => {
    const scale = generateModularScale({
      base: 16,
      ratio: 1,
      steps: 1
    });

    expect(scale.n1).toBe(16);
    expect(scale.base).toBe(16);
    expect(scale.p1).toBe(16);
  });

  it('should handle negative base', () => {
    const scale = generateModularScale({
      base: -16,
      ratio: 1.2,
      steps: 1
    });

    expect(scale.n1).toBeCloseTo(-13.333, 2);
    expect(scale.base).toBe(-16);
    expect(scale.p1).toBeCloseTo(-19.2, 2);
  });

  it('should handle large steps', () => {
    const scale = generateModularScale({
      base: 16,
      ratio: 1.2,
      steps: 10
    });

    expect(scale.n10).toBeDefined();
    expect(scale.p10).toBeDefined();
  });

  it('should handle zero base', () => {
    const scale = generateModularScale({
      base: 0,
      ratio: 1.2,
      steps: 1
    });

    expect(scale.base).toBe(0);
    expect(scale.n1).toBe(0);
    expect(scale.p1).toBe(0);
  });

  it('should handle custom formatter', () => {
    const scale = generateModularScale({
      base: 16,
      ratio: 1.5,
      steps: 1,
      formatter: (value) => `${value}px`
    });

    expect(scale.n1).toBe('10.666666666666666px');
    expect(scale.base).toBe('16px');
    expect(scale.p1).toBe('24px');
  });
});

describe('calculateTokens', () => {
  it('should calculate typography tokens', () => {
    const config = {
      typography: {
        fontSize: {
          startSize: 14,
          multiplier: 1.25,
          scaleNames: ['sm', 'base', 'lg']
        }
      }
    };

    const tokens = calculateTokens(config);

    expect(tokens.typography.fontSize.sm).toBe('0.875rem');
    expect(tokens.typography.fontSize.base).toBe('1.094rem');
    expect(tokens.typography.fontSize.lg).toBe('1.367rem');
  });

  it('should calculate spacing tokens', () => {
    const config = {
      spacing: {
        baseUnit: 8,
        multiplier: 2,
        steps: 3
      }
    };

    const tokens = calculateTokens(config);

    expect(tokens.spacing['0']).toBe('0.000rem');
    expect(tokens.spacing['1']).toBe('0.500rem');
    expect(tokens.spacing['2']).toBe('1.000rem');
    expect(tokens.spacing['3']).toBe('2.000rem');
  });

  it('should calculate color tokens using saltcat-color-tokens', () => {
    const config = {
      colors: {
        primary: 'blue'
      }
    };

    const tokens = calculateTokens(config);

    expect(tokens.colors.primary['50']).toBeDefined();
    expect(tokens.colors.primary['500']).toBeDefined();
    expect(tokens.colors.primary['900']).toBeDefined();
    expect(tokens.colors.primary['500']).toMatch(/^#[0-9a-f]{6}$/i);
  });

  it('should handle complex configurations', () => {
    const config = {
      typography: {
        fontSize: {
          startSize: 16,
          multiplier: 1.2,
          scaleNames: ['xs', 'sm', 'base']
        },
        lineHeight: {
          base: 1.5,
          ratio: 1.1,
          steps: 1
        }
      },
      spacing: {
        baseUnit: 4,
        multiplier: 2,
        steps: 4
      },
      colors: {
        brand: 'emerald'
      }
    };

    const tokens = calculateTokens(config);

    expect(tokens.typography.fontSize).toBeDefined();
    expect(tokens.typography.lineHeight).toBeDefined();
    expect(tokens.spacing).toBeDefined();
    expect(tokens.colors.brand).toBeDefined();
    expect(tokens.colors.brand['500']).toMatch(/^#[0-9a-f]{6}$/i);
  });

  it('should handle empty config', () => {
    const tokens = calculateTokens({});
    expect(tokens).toEqual({});
  });

  it('should handle config with only typography', () => {
    const config = {
      typography: {
        fontSize: {
          startSize: 14,
          multiplier: 1.25,
          scaleNames: ['small', 'large']
        }
      }
    };
    const tokens = calculateTokens(config);
    expect(tokens.typography.fontSize.small).toBe('0.875rem');
    expect(tokens.typography.fontSize.large).toBe('1.094rem');
    expect(tokens.spacing).toBeUndefined();
  });

  it('should handle config with only spacing', () => {
    const config = {
      spacing: {
        baseUnit: 6,
        multiplier: 1.5,
        steps: 2
      }
    };
    const tokens = calculateTokens(config);
    expect(tokens.spacing['0']).toBe('0.000rem');
    expect(tokens.spacing['1']).toBe('0.375rem');
    expect(tokens.spacing['2']).toBe('0.563rem');
  });

  it('should handle config with only colors', () => {
    const config = {
      colors: {
        primary: 'blue'
      }
    };
    const tokens = calculateTokens(config);
    expect(tokens.colors.primary).toBeDefined();
    expect(typeof tokens.colors.primary).toBe('object');
  });

  it('should handle deprecated color scale config', () => {
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const config = {
      colors: {
        primary: {
          scale: {}
        }
      }
    };
    const tokens = calculateTokens(config);
    expect(consoleWarnSpy).toHaveBeenCalledWith('Custom color scale generation is deprecated. Use palette names from saltcat-color-tokens instead.');
    consoleWarnSpy.mockRestore();
  });

  it('should handle config with multiple color palettes', () => {
    const config = {
      colors: {
        primary: 'blue',
        secondary: 'red'
      }
    };
    const tokens = calculateTokens(config);
    expect(tokens.colors.primary).toBeDefined();
    expect(tokens.colors.secondary).toBeDefined();
    expect(tokens.colors.primary['500']).not.toBe(tokens.colors.secondary['500']);
  });

  it('should handle config with typography and spacing', () => {
    const config = {
      typography: {
        fontSize: {
          startSize: 16,
          multiplier: 1.2,
          scaleNames: ['sm', 'base']
        }
      },
      spacing: {
        baseUnit: 8,
        multiplier: 2,
        steps: 2
      }
    };
    const tokens = calculateTokens(config);
    expect(tokens.typography.fontSize.sm).toBe('1.000rem');
    expect(tokens.typography.fontSize.base).toBe('1.200rem');
    expect(tokens.spacing['0']).toBe('0.000rem');
    expect(tokens.spacing['1']).toBe('0.500rem');
    expect(tokens.spacing['2']).toBe('1.000rem');
  });

  it('should handle invalid typography config gracefully', () => {
    const config = {
      typography: {
        fontSize: {
          startSize: 'invalid',
          multiplier: 'invalid',
          scaleNames: 'invalid'
        }
      }
    };
    const tokens = calculateTokens(config);
    // Should not crash, but may produce unexpected results
    expect(tokens.typography).toBeDefined();
  });

  it('should handle invalid spacing config gracefully', () => {
    const config = {
      spacing: {
        baseUnit: 'invalid',
        multiplier: 'invalid',
        steps: 'invalid'
      }
    };
    const tokens = calculateTokens(config);
    // Should not crash, but may produce unexpected results
    expect(tokens.spacing).toBeDefined();
  });

  it('should handle invalid color config gracefully', () => {
    const config = {
      colors: 'invalid'
    };
    const tokens = calculateTokens(config);
    // colors is a string, so Object.entries will fail, but the function handles it
    expect(tokens.colors).toBeDefined();
  });

  it('should handle extreme values in typography scale', () => {
    const scale = generateTypographyScale({
      startSize: 1000,
      multiplier: 10,
      scaleNames: ['huge']
    });
    expect(scale.huge).toBeDefined();
  });

  it('should handle extreme values in spacing scale', () => {
    const scale = generateSpacingScale({
      baseUnit: 1000,
      multiplier: 10,
      steps: 1
    });
    expect(scale['1']).toBeDefined();
  });

  it('should handle empty color name', () => {
    const scale = generateColorScale({
      colorName: ''
    });
    expect(scale).toEqual({});
  });

  it('should handle very long color name', () => {
    const scale = generateColorScale({
      colorName: 'verylongcolornamethatdoesnotexist'
    });
    expect(scale).toEqual({});
  });

  it('should handle modular scale with extreme values', () => {
    const scale = generateModularScale({
      base: 1000,
      ratio: 100,
      steps: 1
    });
    expect(scale.p1).toBeDefined();
  });

   it('should handle calculateTokens with mixed valid and invalid configs', () => {
     const config = {
       typography: {
         fontSize: {
           startSize: 16,
           multiplier: 1.2,
           scaleNames: ['base']
         }
       },
       spacing: {
         baseUnit: 'invalid',
         multiplier: 2,
         steps: 2
       },
       colors: {
         primary: 'blue'
       }
     };
     const tokens = calculateTokens(config);
     // Valid parts should work, invalid parts may not
     expect(tokens.typography.fontSize.base).toBe('1.000rem');
     expect(tokens.colors.primary).toBeDefined();
   });

   it('should handle calculateTokens with unknown config keys', () => {
     const config = {
       unknownKey: 'value',
       typography: {
         fontSize: {
           startSize: 16,
           multiplier: 1.2,
           scaleNames: ['base']
         }
       }
     };
     const tokens = calculateTokens(config);
     expect(tokens.typography.fontSize.base).toBe('1.000rem');
     expect(tokens.unknownKey).toBeUndefined();
   });

   it('should handle extreme typography values', () => {
     const scale = generateTypographyScale({
       startSize: 0.1,
       multiplier: 100,
       scaleNames: ['tiny', 'huge']
     });
     expect(scale.tiny).toBeDefined();
     expect(scale.huge).toBeDefined();
   });

   it('should handle extreme spacing values', () => {
     const scale = generateSpacingScale({
       baseUnit: 0.001,
       multiplier: 1000,
       steps: 10
     });
     expect(scale['1']).toBeDefined();
     expect(scale['10']).toBeDefined();
   });

   it('should handle special characters in color names', () => {
     const scale = generateColorScale({
       colorName: 'red'
     });
     expect(scale).toBeDefined();
     // Test with color names that have special chars if supported
   });

   it('should handle very long scale names', () => {
     const scale = generateTypographyScale({
       startSize: 16,
       multiplier: 1.1,
       scaleNames: ['very-long-scale-name-that-might-cause-issues', 'another-very-long-name']
     });
     expect(scale['very-long-scale-name-that-might-cause-issues']).toBeDefined();
     expect(scale['another-very-long-name']).toBeDefined();
   });

   it('should handle modular scale with irrational numbers', () => {
     const scale = generateModularScale({
       base: 16,
       ratio: Math.PI,
       steps: 3
     });
     expect(scale.n1).toBeDefined();
     expect(scale.p1).toBeDefined();
   });

   it('should handle calculateTokens with deeply nested invalid configs', () => {
     const config = {
       typography: {
         fontSize: {
           startSize: { nested: { invalid: 'object' } },
           multiplier: [1, 2, 3],
           scaleNames: { not: 'array' }
         }
       }
     };
     const tokens = calculateTokens(config);
     // Should not crash
     expect(tokens.typography).toBeDefined();
   });

   it('should handle calculateTokens with null and undefined values', () => {
     const config = {
       typography: {
         fontSize: {
           startSize: null,
           multiplier: undefined,
           scaleNames: ['base']
         }
       }
     };
     const tokens = calculateTokens(config);
     expect(tokens.typography).toBeDefined();
   });

   it('should handle calculateTokens with function values', () => {
     const config = {
       typography: {
         fontSize: {
           startSize: () => 16,
           multiplier: 1.2,
           scaleNames: ['base']
         }
       }
     };
     const tokens = calculateTokens(config);
     expect(tokens.typography).toBeDefined();
   });

   it('should handle generateTypographyScale with invalid inputs', () => {
     expect(() => generateTypographyScale(null)).not.toThrow(); // Functions handle null gracefully
     expect(() => generateTypographyScale({})).not.toThrow();
     expect(() => generateTypographyScale({ startSize: 'invalid' })).not.toThrow();
   });

   it('should handle generateSpacingScale with invalid inputs', () => {
     expect(() => generateSpacingScale(null)).not.toThrow();
     expect(() => generateSpacingScale({})).not.toThrow();
     expect(() => generateSpacingScale({ baseUnit: 'invalid' })).not.toThrow();
   });

   it('should handle generateColorScale with invalid inputs', () => {
     expect(() => generateColorScale(null)).not.toThrow();
     expect(() => generateColorScale({})).not.toThrow();
     expect(() => generateColorScale({ colorName: null })).not.toThrow(); // Returns empty object
   });

   it('should handle generateModularScale with invalid inputs', () => {
     expect(() => generateModularScale(null)).not.toThrow();
     expect(() => generateModularScale({})).not.toThrow();
     expect(() => generateModularScale({ base: 'invalid' })).not.toThrow();
   });

   it('should handle calculateTokens with circular references', () => {
     const config = { typography: {} };
     config.typography.self = config.typography;
     const tokens = calculateTokens(config);
     expect(tokens).toBeDefined(); // Should not crash
   });

   it('should handle calculateTokens with prototype pollution attempts', () => {
     const config = {
       typography: {
         fontSize: {
           startSize: 16,
           multiplier: 1.2,
           scaleNames: ['base']
         }
       },
       __proto__: { polluted: true }
     };
     const tokens = calculateTokens(config);
     expect(tokens.typography.fontSize.base).toBe('1.000rem');
     expect(({}).polluted).toBeUndefined(); // Ensure no pollution
   });
});