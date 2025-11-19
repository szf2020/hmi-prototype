# Coding Standards & Best Practices

## 📋 Overview

This document establishes the coding standards and best practices for the HMI Prototype project. Following these guidelines ensures consistency, maintainability, and quality across the codebase.

---

## 🎨 Design Tokens - **MANDATORY**

### 🚨 Golden Rule #1: Always Use Design Tokens

**NEVER hardcode visual values.** Always use design tokens from the design system.

#### ✅ CORRECT Examples

```css
/* ✅ Spacing */
gap: var(--spacing-56, 56px);
padding: var(--spacing-16, 16px);
margin: var(--spacing-24, 24px);

/* ✅ Colors */
color: var(--color-white-90-default, #ffffffe6);
background: var(--surface-primary-enabled);

/* ✅ Typography */
font-size: var(--fontSize-24, 24px);
font-weight: var(--fontWeight-semibold, 600);
line-height: var(--lineHeight-32, 32px);

/* ✅ Border Radius */
border-radius: var(--borderRadius-8, 8px);

/* ✅ Opacity */
opacity: var(--opacity-hover, 0.88);
```

#### ❌ INCORRECT Examples

```css
/* ❌ Hardcoded values - DO NOT DO THIS */
gap: 56px;
padding: 16px;
color: #ffffff;
font-size: 24px;
border-radius: 8px;
```

### Why This Matters

- ✅ **Consistency**: Ensures visual harmony across all components
- ✅ **Theming**: Enables easy dark/light mode switching
- ✅ **Maintainability**: Update once, apply everywhere
- ✅ **Design Alignment**: Keeps code in sync with design files
- ✅ **Scalability**: Makes global design changes trivial

### Available Token Categories

| Category | Tokens | Example |
|----------|--------|---------|
| **Spacing** | 0, 1, 2, 3, 4, 5, 6, 7, 8, 10, 12, 14, 16, 18, 20, 22, 24, 28, 32, 36, 40, 44, 48, 56, 64 | `var(--spacing-24, 24px)` |
| **Font Size** | 12, 14, 16, 20, 24, 28, 32, 36, 40, 48, 140, 180 | `var(--fontSize-20, 20px)` |
| **Font Weight** | light, regular, medium, semibold, bold | `var(--fontWeight-semibold, 600)` |
| **Colors** | Primitives, Semantic, Functional | `var(--color-white-90-default)` |
| **Border Radius** | 0, 4, 8, 16, 24 | `var(--borderRadius-8, 8px)` |
| **Opacity** | full, active, hover, disabled, readonly | `var(--opacity-hover, 0.88)` |

### Token Format

Always use this format:

```css
property: var(--token-name, fallback-value);
```

- `--token-name`: The design token CSS variable
- `fallback-value`: The literal value as a safety fallback

### Quick Reference

See [DESIGN_TOKENS_GUIDE.md](./DESIGN_TOKENS_GUIDE.md) for:
- Complete token listing
- Usage examples
- Token regeneration instructions
- React hooks for programmatic access

---

## 📁 File Organization

### Component Structure

```
components/
├── ComponentName/
│   ├── ComponentName.jsx       # Component logic
│   ├── ComponentName.css       # Component styles (with tokens!)
│   └── ComponentName.test.jsx  # Component tests (if applicable)
```

### CSS File Structure

```css
/* 1. Component root */
.component-name {
  /* Use design tokens */
}

/* 2. Sub-elements */
.component-name__element {
  /* Use design tokens */
}

/* 3. Modifiers */
.component-name--modifier {
  /* Use design tokens */
}

/* 4. State classes */
.component-name.is-active {
  /* Use design tokens */
}
```

---

## 💅 CSS Best Practices

### 1. Always Use Design Tokens

See section above. This cannot be emphasized enough.

### 2. Use BEM-like Naming Convention

```css
/* Block */
.bottom-nav { }

/* Element */
.bottom-nav__button { }
.nav-buttons-group { }

/* Modifier */
.nav-button--active { }
.nav-button--disabled { }
```

### 3. Logical Property Order

```css
.component {
  /* 1. Positioning */
  position: absolute;
  top: 0;
  left: 0;
  z-index: 100;
  
  /* 2. Box Model */
  display: flex;
  width: var(--spacing-64, 64px);
  height: var(--spacing-64, 64px);
  padding: var(--spacing-16, 16px);
  margin: var(--spacing-24, 24px);
  
  /* 3. Typography */
  font-family: var(--fontFamily-hmi);
  font-size: var(--fontSize-20, 20px);
  font-weight: var(--fontWeight-semibold, 600);
  line-height: var(--lineHeight-28, 28px);
  
  /* 4. Visual */
  color: var(--color-white-90-default);
  background: var(--surface-primary-enabled);
  border-radius: var(--borderRadius-8, 8px);
  opacity: var(--opacity-active, 1);
  
  /* 5. Animation */
  transition: all 0.3s ease;
}
```

### 4. Avoid Inline Styles

```jsx
/* ❌ Bad */
<div style={{ padding: '16px', color: '#ffffff' }}>

/* ✅ Good - Use CSS class with tokens */
<div className="component-name">

/* ⚠️ Acceptable only if dynamic with tokens */
<div style={{ 
  padding: 'var(--spacing-16, 16px)',
  color: 'var(--color-white-90-default)' 
}}>
```

---

## ⚛️ React/JSX Best Practices

### 1. Component Structure

```jsx
import { useState, useEffect } from 'react';
import './ComponentName.css';

function ComponentName({ prop1, prop2 }) {
  // 1. State declarations
  const [state, setState] = useState(initialValue);
  
  // 2. Effects
  useEffect(() => {
    // Effect logic
  }, [dependencies]);
  
  // 3. Event handlers
  const handleClick = () => {
    // Handler logic
  };
  
  // 4. Render helpers
  const renderHelper = () => {
    return <div>Helper content</div>;
  };
  
  // 5. Main render
  return (
    <div className="component-name">
      {/* Component content */}
    </div>
  );
}

export default ComponentName;
```

### 2. Props Destructuring

```jsx
/* ✅ Good - Destructure in parameters */
function Component({ title, isActive, onClick }) {
  return <div>{title}</div>;
}

/* ❌ Avoid */
function Component(props) {
  return <div>{props.title}</div>;
}
```

### 3. Conditional Rendering

```jsx
/* ✅ Good - Ternary for two states */
{isActive ? <ActiveIcon /> : <InactiveIcon />}

/* ✅ Good - && for conditional display */
{showNotification && <Notification />}

/* ✅ Good - Early return for complex conditions */
if (!data) return <Loading />;
return <Content data={data} />;
```

### 4. Event Handlers

```jsx
/* ✅ Good - Named handler functions */
const handleSubmit = (event) => {
  event.preventDefault();
  // Handle submission
};

return <form onSubmit={handleSubmit}>

/* ❌ Avoid - Inline anonymous functions (creates new function on every render) */
return <form onSubmit={(e) => { e.preventDefault(); /* ... */ }}>
```

---

## 🎯 JavaScript Best Practices

### 1. Use Modern JavaScript

```javascript
/* ✅ Use const/let, not var */
const apiUrl = '/api/data';
let counter = 0;

/* ✅ Use arrow functions */
const formatTime = (date) => {
  return date.toLocaleDateString();
};

/* ✅ Use template literals */
const message = `Hello ${userName}, welcome back!`;

/* ✅ Use destructuring */
const { firstName, lastName } = user;
const [first, second, ...rest] = array;

/* ✅ Use optional chaining */
const street = user?.address?.street;

/* ✅ Use nullish coalescing */
const displayName = userName ?? 'Guest';
```

### 2. Naming Conventions

```javascript
/* Variables & Functions: camelCase */
const userName = 'John';
const getUserData = () => {};

/* Components: PascalCase */
function StatusBar() {}
function ClimateApp() {}

/* Constants: UPPER_SNAKE_CASE */
const MAX_RETRY_COUNT = 3;
const API_BASE_URL = 'https://api.example.com';

/* CSS Classes: kebab-case */
className="bottom-nav"
className="nav-button-group"

/* Files: Match content */
StatusBar.jsx
StatusBar.css
useDesignTokens.js
```

---

## 🧪 Testing Considerations

### When to Write Tests

- Critical user flows
- Complex logic/calculations
- Reusable utility functions
- Edge cases and error handling

### Example Test Structure

```javascript
describe('ComponentName', () => {
  it('should render with correct design tokens', () => {
    // Test that component uses tokens correctly
  });
  
  it('should handle user interaction', () => {
    // Test event handlers
  });
});
```

---

## 📋 Pre-Commit Checklist

Before committing your code, verify:

### Design Tokens
- [ ] No hardcoded colors (`#ffffff`, `rgb()`, etc.)
- [ ] No hardcoded sizes (`16px`, `24px` without token)
- [ ] All CSS variables have fallback values
- [ ] Values align with design system scale

### Code Quality
- [ ] No console.log statements (unless intentional)
- [ ] No commented-out code blocks
- [ ] Proper indentation (2 spaces)
- [ ] Meaningful variable/function names
- [ ] Components are reasonably sized (<300 lines)

### Functionality
- [ ] Code works as expected
- [ ] No linter errors
- [ ] No browser console errors
- [ ] Tested in both light and dark themes (if applicable)

---

## 🔍 Code Review Guidelines

### For Authors

- Keep changes focused and atomic
- Write clear commit messages
- Update documentation if needed
- Test thoroughly before requesting review

### For Reviewers

Check for:
- [ ] Design tokens used correctly
- [ ] Code follows established patterns
- [ ] No performance concerns
- [ ] Proper error handling
- [ ] Accessibility considerations

---

## 🚀 Performance Best Practices

### 1. Avoid Unnecessary Re-renders

```jsx
/* ✅ Good - Memoize expensive calculations */
const expensiveValue = useMemo(() => {
  return computeExpensiveValue(data);
}, [data]);

/* ✅ Good - Memoize components */
const MemoizedComponent = memo(Component);
```

### 2. Optimize Event Handlers

```jsx
/* ✅ Good - Debounce frequent updates */
const debouncedSearch = useCallback(
  debounce((query) => performSearch(query), 300),
  []
);
```

### 3. Lazy Load When Appropriate

```jsx
/* ✅ Good - Code splitting for large components */
const HeavyComponent = lazy(() => import('./HeavyComponent'));
```

---

## ♿ Accessibility

### Basic Requirements

- Use semantic HTML elements
- Provide alt text for images
- Ensure keyboard navigation works
- Maintain sufficient color contrast
- Use ARIA labels when needed

```jsx
/* ✅ Good - Semantic and accessible */
<button 
  className="nav-button"
  aria-label="Open climate controls"
  onClick={handleClick}
>
  <ClimateIcon />
</button>

/* ❌ Bad - Non-semantic */
<div onClick={handleClick}>
  <ClimateIcon />
</div>
```

---

## 📚 Additional Resources

- [DESIGN_TOKENS_GUIDE.md](./DESIGN_TOKENS_GUIDE.md) - Complete design token documentation
- [ARCHITECTURE.md](./ARCHITECTURE.md) - System architecture overview
- [COMPONENT_UPDATE_EXAMPLE.md](./COMPONENT_UPDATE_EXAMPLE.md) - Component update examples
- [QUICK_START.md](./QUICK_START.md) - Getting started guide

---

## 🤝 Contributing

When contributing to this project:

1. **Read this document** thoroughly
2. **Use design tokens** for all visual properties
3. **Follow existing patterns** in the codebase
4. **Write clean, readable code**
5. **Test your changes**
6. **Update documentation** if needed

---

## 📝 Questions or Suggestions?

If you have questions about these standards or suggestions for improvements, please discuss with the team.

---

**Remember: Consistency is key to a maintainable codebase. When in doubt, check existing code and follow the established patterns! 🎯**

