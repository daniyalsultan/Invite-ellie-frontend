# Invite Ellie — Landing Page (React + Vite + TypeScript)

A single-page, responsive, pixel-accurate implementation of the Invite Ellie landing page based on the provided Figma frames (desktop and mobile).

- Desktop frame: [`Invite Ellie – 1 - Landing Page`](https://www.figma.com/design/pflejRyGUKnFHsWlyCYzws/Invite-Ellie?node-id=2-136)
- Mobile frame: [`Invite Ellie – 1 - Landing Page-Mobile`](https://www.figma.com/design/pflejRyGUKnFHsWlyCYzws/Invite-Ellie?node-id=354-23423)

## Tech Stack
- Vite (React) + TypeScript
- Tailwind CSS for layout and utilities
- Functional components + hooks
- ESLint + Prettier

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build
npm run build

# Preview production build
npm run preview
```

## Project Structure
```
src/
  components/     # Header, Hero, Integrations, Features, CTA, Footer
  styles/         # Tailwind entry + global styles
  assets/         # Exported images/icons (placeholders present)
  App.tsx         # Full page composition
  main.tsx        # App bootstrap
```

## Figma Mapping & Breakpoints
- Fonts: Nunito (weights 400/500/700/800) via Google Fonts import in `index.html`.
- Colors: ellieBlue `#327AAD`, ellieBlack `#000000`, ellieGray `#545454`.
- Desktop frame size: 1920×5301 → configured as Tailwind `xl: '1920px'`.
- Mobile frame size: 440×5889 → configured as Tailwind `md: '440px'`.

Tailwind config: `tailwind.config.cjs` extends fonts/colors and defines screens:
```js
screens: { md: '440px', xl: '1920px' }
```

## Accessibility
- Semantic regions: `header`, `main`, `section`, `footer`.
- `aria-label` and `alt` text added where appropriate.
- Keyboard-focus styles on interactive elements.

## Interactions
- Hover/focus transitions on navigation and primary CTA buttons.

## Assets
Exported assets should be placed under `src/assets` and imported by components. Some complex vectors/images may require manual export from Figma.

Currently included placeholders:
- `src/assets/logo-placeholder.svg`
- `src/assets/hero-illustration-placeholder.png`
- `src/assets/integration-*.svg`

If any image fonts or masked vectors cannot be exported directly, please export from the Figma frames referenced above and replace the placeholders with final assets. Typical locations in Figma:
- Desktop: `1 - Landing Page` → Hero illustration, Integrations logos, Feature icons
- Mobile: `1 - Landing Page-Mobile` → mirrored assets for small screens

## Notes on Pixel Fidelity
- Typography: desktop hero title 55px/extra-bold; body 22px; colors per Figma.
- Spacing and max widths align to the Figma inner content width (~1494px inside the 1920px frame) using the utility class `container-ellie`.

## License
Internal project for implementation testing.

