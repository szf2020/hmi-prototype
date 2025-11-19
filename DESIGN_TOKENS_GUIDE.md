# Design Tokens Guide

## 📋 Overview

This HMI prototype uses a comprehensive **Design Token System** to ensure consistency across all UI components, displays, and themes. Design tokens are the visual design atoms of the design system — specifically, they are named entities that store visual design attributes.

## 🗂️ Token Structure

The design tokens are organized in a hierarchical structure:

```
Design Tokens/
├── _Base/
│   └── Value.json          # Primitive values (colors, spacing, etc.)
├── 01_Brand/
│   ├── Default.json        # Default brand tokens
│   ├── HighContrast.json   # High contrast variant
│   └── Minimal.json        # Minimal variant
├── 02_Global.json          # Typography and spacing
├── 03_Semantics/
│   ├── Dark.json           # Dark theme semantic tokens
│   └── Light.json          # Light theme semantic tokens
├── 04_Responsive/          # Responsive breakpoints
├── 05_Motion/              # Animation tokens
├── 06_Interactions/        # Interaction states
└── 07_Components/          # Component-specific tokens
```

## 🎨 Token Categories

### 1. Color Tokens
- **Primitives**: Base color palette (`color-primitives-White-White`, `color-primitives-Black-Black`)
- **Brand**: Brand-specific colors (`color-functional-warning`, `color-active-dark-primary`)
- **Semantic**: Context-based colors (`onSurface-onSurface-enabled`, `surface-primary-enabled`)

### 2. Typography Tokens
- **Display**: Large display text (`typography-display-xxlarge`, `typography-display-xlarge`)
- **Headline**: Section headers (`typography-headline-large`, `typography-headline-medium`)
- **Body**: Body text (`typography-body-large`, `typography-body-medium`, `typography-body-small`)
- **Label**: UI labels (`typography-label-large`, `typography-label-medium`)

### 3. Spacing Tokens
- Consistent spacing scale: `spacing-2`, `spacing-4`, `spacing-8`, `spacing-16`, `spacing-24`, etc.

### 4. Effects
- **Opacity**: `opacity-full`, `opacity-active`, `opacity-disabled`
- **Blur**: `blur-blur-light`, `blur-blur-medium`, `blur-blur-heavy`
- **Gradients**: `gradient-primary-linear`, `gradient-primary-diagonal`

---

## 🔧 Usage

### Method 1: CSS Variables (Recommended)

Design tokens are automatically converted to CSS variables and available throughout your application:

```css
.my-component {
  /* Colors */
  color: var(--color-white-90-default);
  background: var(--surface-primary-enabled);
  
  /* Spacing */
  padding: var(--spacing-16);
  margin: var(--spacing-24);
  
  /* Typography */
  font-family: var(--fontFamily-hmi);
  font-size: var(--fontSize-24);
  font-weight: var(--fontWeight-semibold);
  
  /* Effects */
  opacity: var(--opacity-default);
  border-radius: var(--borderRadius-8);
}
```

### Method 2: Typography Classes

Pre-built typography classes are available:

```jsx
<h1 className="typography-display-large">Large Display Text</h1>
<h2 className="typography-headline-medium">Medium Headline</h2>
<p className="typography-body-medium">Body text content</p>
<span className="typography-label-small">Small label</span>
```

### Method 3: React Hook (Programmatic Access)

Use the `useDesignTokens` hook for dynamic access:

```jsx
import { useDesignTokens } from './hooks/useDesignTokens';

function MyComponent() {
  const tokens = useDesignTokens();
  
  // Get token value
  const warningColor = tokens.get('color-functional-warning');
  
  // Get CSS variable reference
  const primaryColor = tokens.getCSSVar('surface-primary-enabled');
  
  // Get all colors
  const colors = tokens.getColors();
  
  // Get all spacing values
  const spacing = tokens.getSpacing();
  
  return (
    <div style={{ color: primaryColor }}>
      {/* Your content */}
    </div>
  );
}
```

### Method 4: Token Styles Helper

Use the `useTokenStyles` helper for cleaner code:

```jsx
import { useTokenStyles } from './hooks/useDesignTokens';

function MyComponent() {
  const styles = useTokenStyles({
    color: '$color-white-90-default',
    background: '$surface-primary-enabled',
    padding: '$spacing-16'
  });
  
  return <div style={styles}>Content</div>;
}
```

---

## 🌓 Theming

### Dark Theme (Default)

The application uses the dark theme by default. All semantic tokens are optimized for dark backgrounds.

```jsx
// Dark theme is applied by default
<div className="theme-dark">
  {/* Your content uses dark theme tokens */}
</div>
```

### Light Theme

To use the light theme, add the `theme-light` class:

```jsx
<div className="theme-light">
  {/* Your content uses light theme tokens */}
</div>
```

### Dynamic Theme Switching

```jsx
function App() {
  const [isDark, setIsDark] = useState(true);
  
  return (
    <div className={isDark ? 'theme-dark' : 'theme-light'}>
      <button onClick={() => setIsDark(!isDark)}>
        Toggle Theme
      </button>
      {/* Your app content */}
    </div>
  );
}
```

---

## 🔄 Regenerating Tokens

When you modify the design tokens in the `Design Tokens/` directory, regenerate the CSS and JS files:

### One-time Generation
```bash
cd frontend
npm run tokens:generate
```

### Watch Mode (Auto-regenerate on changes)
```bash
cd frontend
npm run tokens:watch
```

The script will:
1. ✅ Parse all JSON token files
2. ✅ Resolve token references
3. ✅ Generate CSS variables (`src/styles/tokens/tokens.css`)
4. ✅ Generate typography classes (`src/styles/tokens/typography.css`)
5. ✅ Generate theme-specific CSS (`theme-dark.css`, `theme-light.css`)
6. ✅ Generate JavaScript token object (`src/tokens/designTokens.js`)

---

## 🎯 Common Tokens Reference

### Colors

#### Functional Colors
- `color-functional-warning` - Warning/alert red
- `color-functional-caution` - Caution/warning amber
- `color-functional-positive` - Success/positive green
- `color-functional-informative` - Information blue

#### Surface Colors
- `surface-primary-enabled` - Primary interactive surface
- `surface-secondary-enabled` - Secondary surface
- `surface-tertiary-enabled` - Tertiary surface
- `surface-destructive-enabled` - Destructive action surface

#### Text Colors
- `onSurface-onSurface-enabled` - Primary text on surfaces
- `onSurface-onSurface-disabled` - Disabled text
- `onSurface-onSurface-inactive` - Inactive text

#### Background Colors
- `background-background-ui-primary` - Primary UI background
- `background-background-page` - Page background

### Typography Scale

| Token | Font Size | Line Height | Use Case |
|-------|-----------|-------------|----------|
| `typography-display-xxlarge` | 180px | 116% | Cluster speed display |
| `typography-display-xlarge` | 140px | 116% | Large metrics |
| `typography-display-large` | 48px | 106% | Hero text |
| `typography-headline-large` | 40px | 48px | Major sections |
| `typography-headline-medium` | 32px | 36px | Subsections |
| `typography-body-large` | 36px | 44px | Primary body |
| `typography-body-medium` | 24px | 32px | Standard text |
| `typography-body-small` | 20px | 28px | Secondary text |
| `typography-label-medium` | 24px | 32px | UI labels |

### Spacing Scale

```
spacing-2   → 2px   (Tight)
spacing-4   → 4px   
spacing-8   → 8px   (Small)
spacing-12  → 12px  
spacing-16  → 16px  (Medium)
spacing-24  → 24px  (Large)
spacing-32  → 32px  
spacing-40  → 40px  (XLarge)
spacing-48  → 48px  
spacing-64  → 64px  (XXLarge)
```

---

## 📝 Best Practices

### 🚨 **GOLDEN RULE: ALWAYS USE DESIGN TOKENS**

**Never hardcode visual values in your code.** Always use design tokens for colors, spacing, typography, and other design attributes. This ensures:
- ✅ Consistent design across the application
- ✅ Easy theme switching (dark/light modes)
- ✅ Centralized design updates
- ✅ Better maintainability
- ✅ Design-developer workflow alignment

### ✅ DO

1. **Always use design tokens with fallback values:**
   ```css
   /* ✅ CORRECT - Use design token with fallback */
   gap: var(--spacing-56, 56px);
   color: var(--color-white-90-default, #ffffffe6);
   font-size: var(--fontSize-24, 24px);
   ```

2. **Use semantic tokens** instead of primitive colors:
   ```css
   /* ✅ Good */
   color: var(--onSurface-onSurface-enabled);
   
   /* ⚠️ Avoid */
   color: var(--color-primitives-White-opacity-90);
   ```

3. **Use typography classes** for consistent text styling:
   ```jsx
   /* ✅ Good */
   <h1 className="typography-headline-large">Title</h1>
   ```

4. **Use spacing tokens** for ALL layout values:
   ```css
   /* ✅ Good */
   padding: var(--spacing-16, 16px);
   gap: var(--spacing-12, 12px);
   margin: var(--spacing-24, 24px);
   ```

5. **Check available tokens before creating values:**
   - Available spacing: 0, 1, 2, 3, 4, 5, 6, 7, 8, 10, 12, 14, 16, 18, 20, 22, 24, 28, 32, 36, 40, 44, 48, 56, 64
   - If you need a value not in the scale, discuss with design team first

6. **Regenerate tokens** after modifications:
   ```bash
   npm run tokens:generate
   ```

### ❌ DON'T

1. **❌ NEVER hardcode colors, sizes, or spacing:**
   ```css
   /* ❌ BAD - Hardcoded values */
   color: #ffffff;
   font-size: 24px;
   padding: 16px;
   gap: 56px;
   
   /* ✅ GOOD - Design tokens */
   color: var(--color-white-100-primary, #ffffff);
   font-size: var(--fontSize-24, 24px);
   padding: var(--spacing-16, 16px);
   gap: var(--spacing-56, 56px);
   ```

2. **❌ Don't use arbitrary values not in the design system:**
   ```css
   /* ❌ Bad */
   padding: 17px;  /* Not in spacing scale */
   font-size: 23px; /* Not in typography scale */
   color: #abc123; /* Not in color palette */
   ```

3. **❌ Don't create inline styles without tokens:**
   ```jsx
   /* ❌ Bad */
   <div style={{ color: '#fff', padding: '16px' }} />
   
   /* ✅ Good */
   <div style={{ 
     color: 'var(--onSurface-onSurface-enabled)', 
     padding: 'var(--spacing-16)' 
   }} />
   ```

4. **❌ Don't skip the fallback value:**
   ```css
   /* ⚠️ Risky - No fallback */
   gap: var(--spacing-56);
   
   /* ✅ Safe - With fallback */
   gap: var(--spacing-56, 56px);
   ```

### 📋 Pre-Commit Checklist

Before committing CSS/JSX changes, verify:
- [ ] No hardcoded colors (search for `#` in CSS)
- [ ] No hardcoded pixel values (should use `var(--spacing-*)` or `var(--fontSize-*)`)
- [ ] All design token variables have fallback values
- [ ] Values align with the design system scale

---

## 🔍 Token Discovery

### View All Available Tokens

```jsx
import { useDesignTokens } from './hooks/useDesignTokens';

function TokenExplorer() {
  const tokens = useDesignTokens();
  const allTokenNames = tokens.getAllNames();
  
  return (
    <div>
      {allTokenNames.map(name => (
        <div key={name}>
          {name}: {tokens.get(name)}
        </div>
      ))}
    </div>
  );
}
```

### Check Token Availability

```jsx
const tokens = useDesignTokens();

if (tokens.has('color-functional-warning')) {
  console.log('Warning color is available');
}
```

---

## 🚀 Advanced Usage

### Custom Token Layers

You can create custom token layers for specific features:

```css
/* In your component CSS */
.my-feature {
  --feature-primary: var(--surface-primary-enabled);
  --feature-spacing: var(--spacing-24);
  
  background: var(--feature-primary);
  padding: var(--feature-spacing);
}
```

### Responsive Tokens

```css
.responsive-component {
  padding: var(--spacing-16);
}

@media (min-width: 768px) {
  .responsive-component {
    padding: var(--spacing-24);
  }
}

@media (min-width: 1024px) {
  .responsive-component {
    padding: var(--spacing-32);
  }
}
```

---

## 🎨 Design System Alignment

This token system is designed to work seamlessly with:
- **Figma Variables**: Tokens sync with Figma design files
- **Multiple Displays**: Consistent styling across Cluster, Central, and Passenger displays
- **Dark/Light Themes**: Automatic theme switching support
- **Brand Variants**: Support for different brand expressions (Default, HighContrast, Minimal)

---

## 📚 Additional Resources

- **Token Files**: `/Design Tokens/` directory
- **Generated CSS**: `/frontend/src/styles/tokens/`
- **Generated JS**: `/frontend/src/tokens/designTokens.js`
- **React Hook**: `/frontend/src/hooks/useDesignTokens.js`
- **Transform Script**: `/frontend/scripts/transformTokens.js`

---

## 🐛 Troubleshooting

### Tokens Not Updating

```bash
# Clear build cache and regenerate
rm -rf frontend/src/styles/tokens/*
rm -rf frontend/src/tokens/*
cd frontend && npm run tokens:generate
```

### CSS Variables Not Working

Make sure token CSS is imported before your component styles:

```jsx
// In main.jsx
import './styles/tokens/tokens.css';        // ← Must come first
import './styles/tokens/typography.css';
import './styles/tokens/theme-dark.css';
import './styles/global.css';               // ← Your styles after
```

### Token Reference Not Resolving

Check that the reference path is correct in the JSON:
```json
{
  "myToken": {
    "value": "{color-primitives.White.White}",  // ← Correct path
    "type": "color"
  }
}
```

---

**Happy theming! 🎨✨**

