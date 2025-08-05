# Brand Theming System Guide

This guide explains how to use the enhanced brand theming system that allows dynamic theme application across your application.

## Overview

The theming system consists of:
- **BrandHubPage**: Where users configure their brand colors and fonts
- **useTheme Hook**: A React hook for managing and applying themes
- **CSS Custom Properties**: Dynamic CSS variables that update automatically
- **Theme CSS Classes**: Pre-built classes for consistent styling

## Quick Start

### 1. Import the Theme CSS

Add this import to your main App component or Layout:

```tsx
import './styles/theme.css';
```

### 2. Use the useTheme Hook

```tsx
import { useTheme } from '../hooks/useTheme';

function MyComponent() {
  const { theme, updateTheme, resetTheme } = useTheme();
  
  // theme contains the current brand colors and fonts
  // updateTheme() allows you to change the theme
  // resetTheme() resets to default values
}
```

### 3. Apply Brand Styling

Use the pre-built CSS classes or CSS custom properties:

```tsx
// Using CSS classes
<Button className="btn-brand-primary">Primary Button</Button>
<Card className="card-brand">Brand Card</Card>
<span className="badge-brand-accent">Accent Badge</span>

// Using CSS custom properties
<Box style={{ backgroundColor: 'var(--color-primary)' }}>
  Dynamic Background
</Box>
```

## Features

### ✅ **Automatic Theme Loading**
- Themes are automatically loaded from localStorage on app startup
- Fallback to default values if no theme is configured
- Backward compatibility with existing localStorage items

### ✅ **Real-time Theme Updates**
- Theme changes are applied immediately across all components
- Custom events notify all components when theme changes
- No page refresh required

### ✅ **CSS Custom Properties**
- Dynamic CSS variables that update automatically
- Consistent color palette with light/dark variants
- Typography and spacing variables

### ✅ **Pre-built Components**
- Brand-themed buttons, cards, badges, and alerts
- Consistent styling across the application
- Hover effects and transitions

## API Reference

### useTheme Hook

```tsx
const { theme, updateTheme, resetTheme, applyThemeToPage } = useTheme();
```

#### theme (BrandTheme | null)
Current theme object containing:
- `primary_color`: Main brand color
- `accent_color`: Secondary brand color
- `header_font`: Font for headings
- `body_font`: Font for body text
- `brand_name`: Company name
- `logo_url`: Brand logo URL
- `updated_at`: Last update timestamp

#### updateTheme(newTheme: Partial<BrandTheme>)
Updates the theme with new values:

```tsx
updateTheme({
  primary_color: '#FF6B6B',
  accent_color: '#4ECDC4',
  brand_name: 'New Brand Name'
});
```

#### resetTheme()
Resets theme to default values.

#### applyThemeToPage(themeData: BrandTheme)
Manually applies theme to the current page.

### CSS Custom Properties

#### Colors
```css
--brand-primary-color: #1F4287;
--brand-accent-color: #FFC300;
--color-primary: var(--brand-primary-color);
--color-primary-light: color-mix(in srgb, var(--brand-primary-color) 80%, white);
--color-primary-dark: color-mix(in srgb, var(--brand-primary-color) 80%, black);
```

#### Typography
```css
--brand-header-font: 'Lato', sans-serif;
--brand-body-font: 'Open Sans', sans-serif;
--font-family-heading: var(--brand-header-font);
--font-family-body: var(--brand-body-font);
```

#### Spacing & Effects
```css
--border-radius: 8px;
--border-radius-sm: 4px;
--border-radius-lg: 12px;
--box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
--box-shadow-lg: 0 4px 8px rgba(0, 0, 0, 0.15);
```

### CSS Classes

#### Buttons
```css
.btn-brand-primary    /* Primary brand button */
.btn-brand-accent     /* Accent brand button */
```

#### Cards
```css
.card-brand           /* Brand-themed card with hover effects */
```

#### Badges
```css
.badge-brand-primary  /* Primary color badge */
.badge-brand-accent   /* Accent color badge */
```

#### Alerts
```css
.alert-brand-info     /* Info alert with brand colors */
.alert-brand-success  /* Success alert */
.alert-brand-warning  /* Warning alert with accent color */
.alert-brand-error    /* Error alert */
```

#### Utility Classes
```css
.text-brand-primary   /* Primary color text */
.text-brand-accent    /* Accent color text */
.bg-brand-primary     /* Primary color background */
.bg-brand-accent      /* Accent color background */
.border-brand-primary /* Primary color border */
.border-brand-accent  /* Accent color border */
```

## Usage Examples

### 1. Brand-Themed Button

```tsx
<Button className="btn-brand-primary" onClick={handleClick}>
  Save Changes
</Button>
```

### 2. Dynamic Background

```tsx
<Box 
  p={4} 
  borderRadius="md"
  style={{ backgroundColor: 'var(--color-primary)' }}
>
  <Text color="white">Content with brand background</Text>
</Box>
```

### 3. Brand Card with Hover Effects

```tsx
<Card className="card-brand">
  <CardBody>
    <Text className="text-brand-primary">Brand-themed content</Text>
  </CardBody>
</Card>
```

### 4. Custom Theme Update

```tsx
const { updateTheme } = useTheme();

const handleColorChange = (newColor: string) => {
  updateTheme({ primary_color: newColor });
};
```

### 5. Theme-Aware Component

```tsx
function ThemeAwareComponent() {
  const { theme } = useTheme();
  
  return (
    <Box>
      <Text style={{ color: theme?.primary_color }}>
        This text uses the current brand color
      </Text>
      <Text style={{ fontFamily: theme?.header_font }}>
        This text uses the brand header font
      </Text>
    </Box>
  );
}
```

## Integration with BrandHubPage

The BrandHubPage automatically saves theme data when users update their brand profile:

1. User updates brand colors/fonts in BrandHubPage
2. `handleSave()` function stores theme in localStorage
3. `applyThemeToPage()` applies theme immediately
4. Custom event `themeUpdated` notifies all components
5. All components using `useTheme()` automatically update

## Best Practices

### ✅ **Do's**
- Use CSS classes for common components (buttons, cards, badges)
- Use CSS custom properties for custom styling
- Always provide fallback values for theme properties
- Test theme changes across different components

### ❌ **Don'ts**
- Don't hardcode brand colors in components
- Don't forget to handle the case when theme is null
- Don't override theme colors without user consent
- Don't use theme colors for critical UI elements (errors, warnings)

## Troubleshooting

### Theme Not Loading
- Check if `theme.css` is imported
- Verify localStorage has theme data
- Check browser console for errors

### Colors Not Updating
- Ensure components use CSS custom properties or classes
- Check if `useTheme()` hook is being used
- Verify theme update events are firing

### Performance Issues
- Theme updates are optimized with `useCallback`
- CSS custom properties are more performant than inline styles
- Consider debouncing rapid theme changes

## Browser Support

- CSS Custom Properties: Modern browsers (IE11+ with polyfill)
- color-mix(): Modern browsers (Chrome 111+, Firefox 113+)
- localStorage: All modern browsers

For older browser support, consider using a CSS-in-JS solution or CSS custom properties polyfill. 