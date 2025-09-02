# Responsive Design System

This project includes a comprehensive responsive design system that automatically detects device types and provides adaptive layouts for desktop, tablet, and mobile devices.

## Features

### 🎯 Automatic Device Detection
- **Mobile**: < 768px width
- **Tablet**: 768px - 1023px width
- **Desktop**: ≥ 1024px width
- Real-time detection with resize/orientation change listeners

### 📱 Responsive Components

#### `useDevice()` Hook
```tsx
import { useDevice } from '../lib/device';

function MyComponent() {
  const { type, isMobile, isTablet, isDesktop, width, height, orientation } = useDevice();

  return (
    <div>
      <p>Current device: {type}</p>
      <p>Screen size: {width} × {height}</p>
      <p>Orientation: {orientation}</p>
    </div>
  );
}
```

#### `useDeviceConditional()` Hook
```tsx
import { useDeviceConditional } from '../lib/device';

function MyComponent() {
  const { showOnMobile, showOnDesktop, hideOnMobile } = useDeviceConditional();

  return (
    <div>
      {showOnMobile(<MobileOnlyContent />)}
      {showOnDesktop(<DesktopOnlyContent />)}
      {hideOnMobile(<NotOnMobileContent />)}
    </div>
  );
}
```

#### `ResponsiveLayout` Component
```tsx
import { ResponsiveLayout } from '../components/Responsive';

function MyPage() {
  return (
    <ResponsiveLayout>
      <YourContent />
    </ResponsiveLayout>
  );
}
```

#### `ResponsiveGrid` Component
```tsx
import { ResponsiveGrid } from '../components/Responsive';

function MyGrid() {
  return (
    <ResponsiveGrid minColumnWidth={300}>
      <div>Item 1</div>
      <div>Item 2</div>
      <div>Item 3</div>
    </ResponsiveGrid>
  );
}
```

#### `ResponsiveText` Component
```tsx
import { ResponsiveText } from '../components/Responsive';

function MyText() {
  return (
    <ResponsiveText size="large">
      This text automatically adjusts size based on device
    </ResponsiveText>
  );
}
```

### 🎨 CSS Media Queries

The system includes comprehensive CSS media queries:

```css
/* Mobile */
@media (max-width: 767px) {
  .your-element {
    /* Mobile styles */
  }
}

/* Tablet */
@media (min-width: 768px) and (max-width: 1023px) {
  .your-element {
    /* Tablet styles */
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .your-element {
    /* Desktop styles */
  }
}
```

### 🔧 Additional Hooks

#### Touch Device Detection
```tsx
import { useTouchDevice } from '../lib/device';

function MyComponent() {
  const isTouch = useTouchDevice();

  return (
    <button className={isTouch ? 'touch-button' : 'mouse-button'}>
      Click me
    </button>
  );
}
```

#### Reduced Motion Detection
```tsx
import { useReducedMotion } from '../lib/device';

function MyComponent() {
  const reducedMotion = useReducedMotion();

  return (
    <div className={reducedMotion ? 'no-animation' : 'with-animation'}>
      Content
    </div>
  );
}
```

## Usage Examples

### Basic Responsive Layout
```tsx
import { useDevice, ResponsiveLayout } from '../lib/device';
import { ResponsiveGrid } from '../components/Responsive';

function Dashboard() {
  const { type } = useDevice();

  return (
    <ResponsiveLayout>
      <h1>Dashboard ({type})</h1>
      <ResponsiveGrid minColumnWidth={280}>
        <StatsCard />
        <ChartCard />
        <TableCard />
      </ResponsiveGrid>
    </ResponsiveLayout>
  );
}
```

### Conditional Rendering
```tsx
import { useDeviceConditional } from '../lib/device';

function Navigation() {
  const { showOnMobile, showOnDesktop } = useDeviceConditional();

  return (
    <nav>
      {showOnMobile(<MobileMenu />)}
      {showOnDesktop(<DesktopMenu />)}
    </nav>
  );
}
```

### Touch-Optimized Interactions
```tsx
import { useTouchDevice } from '../lib/device';

function InteractiveButton() {
  const isTouch = useTouchDevice();

  return (
    <button
      className={isTouch ? 'touch-optimized' : 'mouse-optimized'}
      onClick={handleClick}
    >
      {isTouch ? 'Tap' : 'Click'} me
    </button>
  );
}
```

## Testing

Visit `/responsive` to see a live demo of the responsive design system in action. The demo shows:

- Current device detection
- Responsive grid layouts
- Adaptive text sizing
- Real-time updates on resize

## Breakpoints

| Device | Width | Grid Columns | Font Scale |
|--------|-------|--------------|------------|
| Mobile | < 768px | 1 | 0.9x |
| Tablet | 768px - 1023px | 2 | 1x |
| Desktop | ≥ 1024px | 3+ | 1.1x |

## Best Practices

1. **Mobile-First**: Design for mobile first, then enhance for larger screens
2. **Touch Targets**: Ensure buttons are at least 44px for touch devices
3. **Performance**: Use the hooks sparingly to avoid unnecessary re-renders
4. **Accessibility**: Respect user's reduced motion preferences
5. **Testing**: Test on actual devices, not just browser dev tools

## Browser Support

- Modern browsers with CSS Grid support
- React 18+
- TypeScript (optional but recommended)
