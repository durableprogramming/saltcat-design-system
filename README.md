# saltcat-design-system

A comprehensive design system library for defining, managing, and exporting design tokens. Supports export to CSS classes, SCSS variables, UNOCss presets, and JavaScript objects.

## Features

- Define design tokens for colors, typography, spacing, and more
- **Calculate design tokens** using mathematical scales and multipliers
- Load configuration from `saltcat.design.mjs` file
- Export to multiple formats:
  - CSS custom properties
  - SCSS variables
  - UNOCss presets
  - JavaScript/TypeScript objects
- Type-safe token management
- Extensible architecture

## Installation

```bash
npm install saltcat-design-system
```

## Usage

### Basic Usage

```javascript
import { DesignSystem } from 'saltcat-design-system';

// Create a new design system
const ds = new DesignSystem();

// Define tokens
ds.defineTokens({
  colors: {
    primary: '#3b82f6',
    secondary: '#10b981'
  },
  spacing: {
    small: '8px',
    medium: '16px',
    large: '24px'
  }
});

// Export to CSS
const css = ds.exportToCSS();
console.log(css);
```

### Calculating Design Tokens

The library can automatically calculate design tokens using mathematical scales:

```javascript
import { DesignSystem } from 'saltcat-design-system';

// Calculate tokens programmatically
const ds = new DesignSystem();

ds.calculateTokens({
  typography: {
    fontSize: {
      startSize: 14,        // Starting font size in pixels
      multiplier: 1.2,      // Scale multiplier (major third)
      scaleNames: ['xs', 'sm', 'base', 'lg', 'xl', '2xl']
    }
  },
  spacing: {
    baseUnit: 4,           // Base spacing unit
    multiplier: 2,         // Geometric progression
    steps: 8               // Number of steps
  },
  colors: {
    primary: 'blue'        // Use color palette from saltcat-color-tokens
  }
});
```

### Color Token Support

The design system integrates with `saltcat-color-tokens` for advanced color management:

```javascript
// Define colors using token strings
ds.defineTokens({
  colors: {
    primary: 'blue-500',     // Direct token parsing
    secondary: 'red-600',
    accent: '#ff6b6b'        // Regular hex colors still work
  }
});

// Or calculate full color palettes
ds.calculateTokens({
  colors: {
    brand: 'indigo',         // Full palette generation
    neutral: 'gray'
  }
});

// Configure color grading and LUT
ds.configureColorTokens({
  grading: {
    red: { lift: 0.1, gamma: 1.1 }
  },
  lut: lutData  // For advanced color grading
});
```

### Loading from Configuration File

By default, the library looks for a `saltcat.design.mjs` file in the project root:

```javascript
// saltcat.design.mjs
export default {
  calculations: {
    typography: {
      fontSize: {
        startSize: 14,
        multiplier: 1.2,
        scaleNames: ['xs', 'sm', 'base', 'lg', 'xl', '2xl']
      }
    },
    spacing: {
      baseUnit: 4,
      multiplier: 2,
      steps: 8
    },
    colors: {
      primary: 'blue'        // Use color palette from saltcat-color-tokens
    }
  },
  tokens: {
    colors: {
      neutral: {
        50: '#f9fafb',
        900: '#111827'
      }
    },
    typography: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['Fira Code', 'monospace']
      }
    }
  },
  themes: {
    light: {
      colors: {
        background: '#ffffff',
        text: '#000000'
      }
    },
    dark: {
      colors: {
        background: '#000000',
        text: '#ffffff'
      }
    }
  }
};
```

```javascript
import { DesignSystem } from 'saltcat-design-system';

// Automatically loads from saltcat.design.mjs
const ds = new DesignSystem();
```

### Export Formats

#### CSS Custom Properties

```javascript
const css = ds.exportToCSS();
// Outputs CSS custom properties
```

#### SCSS Variables

```javascript
const scss = ds.exportToSCSS();
// Outputs SCSS variables
```

#### UNOCss Preset

```javascript
const unoPreset = ds.exportToUnoCSS();
// Returns a UNOCss preset object
```

#### JavaScript Object

```javascript
const tokens = ds.exportToJS();
// Returns plain JavaScript object
```

## API

### DesignSystem

#### Constructor

```javascript
new DesignSystem(options?: DesignSystemOptions)
```

Options:
- `configPath`: Path to configuration file (default: 'saltcat.design.mjs')

#### Methods

- `defineTokens(tokens: TokenDefinition)`: Define design tokens (supports color token strings)
- `calculateTokens(config: CalculationConfig)`: Calculate and define tokens using scales
- `loadConfig(path?: string)`: Load configuration from file
- `configureColorTokens(config)`: Configure saltcat-color-tokens grading and LUT
- `parseColorToken(token: string)`: Parse individual color tokens
- `exportToCSS(): string`: Export as CSS custom properties
- `exportToSCSS(): string`: Export as SCSS variables
- `exportToUnoCSS(): object`: Export as UNOCss preset
- `exportToJS(): object`: Export as JavaScript object

## Token Structure

```typescript
interface TokenDefinition {
  colors?: Record<string, string | TokenDefinition>;
  typography?: {
    fontFamily?: Record<string, string[]>;
    fontSize?: Record<string, string>;
    fontWeight?: Record<string, string | number>;
    lineHeight?: Record<string, string | number>;
  };
  spacing?: Record<string, string>;
  [key: string]: any;
}

interface CalculationConfig {
  typography?: {
    fontSize?: {
      startSize: number;
      endSize?: number;
      multiplier?: number;
      scaleNames?: string[];
      unit?: string;
      baseSize?: number;
    };
    lineHeight?: {
      base: number;
      ratio?: number;
      steps?: number;
    };
  };
  spacing?: {
    baseUnit?: number;
    multiplier?: number;
    steps?: number;
    unit?: string;
    baseSize?: number;
    includeZero?: boolean;
  };
  colors?: Record<string, string | {
    palette: string;
    config?: any;
  }>;
}
```

## License

MIT
