---
description: UI/UX quality guidelines for Nebula Core
---

# UI/UX Quality Guidelines

## Design Principles

### 1. Premium Feel
- Use glassmorphism (blur + transparency)
- Gradient accents (purple→blue spectrum)
- Subtle animations and hover effects
- Dark mode as default

### 2. Consistency
- Same border-radius across components: 12-24px
- Consistent spacing: 0.5rem, 1rem, 1.5rem, 2rem
- Typography hierarchy: Inter font family
- Color palette from CSS custom properties

### 3. Responsiveness
- Mobile-first approach
- Breakpoints: 480px, 768px, 1024px, 1280px
- Touch-friendly targets (min 44px)
- Flexible grids and containers

## Component Checklist

### Buttons
// turbo
- [ ] Clear hover/active states
- [ ] Loading states for async actions
- [ ] Disabled state styling
- [ ] Icon + text alignment

### Forms
// turbo
- [ ] Input focus glow effect
- [ ] Error states clearly visible
- [ ] Success feedback
- [ ] Password toggle visibility
- [ ] Auto-complete attributes

### Cards
// turbo
- [ ] Hover lift effect
- [ ] Border glow on interaction
- [ ] Consistent padding
- [ ] Shadow depth in dark mode

### Modals
// turbo
- [ ] Backdrop blur
- [ ] Smooth open/close animation
- [ ] Close on backdrop click
- [ ] Focus trap for accessibility

## Animation Guidelines

```css
/* Standard transitions */
transition: all 0.2s ease;       /* Quick interactions */
transition: all 0.3s ease;       /* Modal/page transitions */
transition: transform 0.3s ease; /* Transform only */

/* Hover lift effect */
.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}
```

## Accessibility

- Minimum color contrast ratio: 4.5:1
- Focus indicators on all interactive elements
- Screen reader labels for icon-only buttons
- Keyboard navigation support
