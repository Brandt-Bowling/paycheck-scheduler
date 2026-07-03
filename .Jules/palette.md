## 2024-05-24 - Interactive Element Accessibility
**Learning:** Icon-only buttons (like calendar settings and navigation) lacked sufficient ARIA labels, title attributes, and visible focus states for keyboard users. Changing custom `div` elements acting as buttons to semantic `<button>` elements significantly improves a11y out of the box (like in the calendar grid).
**Action:** When working on interactive elements, always verify that keyboard accessibility (focus rings, tab order) and screen-reader accessibility (aria-labels, role="button") are present. Using native HTML `<button>` elements instead of `<div>` with `onClick` is preferred.

## 2026-05-26 - Focus visibility and Disabled State Clarity
**Learning:** Interactive elements in complex modals (like EventSummaryModal) often lose custom focus rings if not explicitly styled with `focus-visible:ring-sky-500`. Furthermore, disabled submit buttons can cause confusion if they lack context; adding a `title` attribute to explain *why* it's disabled (e.g., 'Please add at least one event') provides an immediate UX win without structural changes.
**Action:** Standardize adding `focus-visible:ring-2 focus-visible:ring-sky-500` to all clickable elements, and always provide a `title` tooltip for disabled action buttons.

## 2024-06-01 - Accessible Toast Notifications & Non-blocking Alerts
**Learning:** Native `window.alert()` halts execution and creates a jarring UX, while custom toast notifications often lack screen reader support without explicit ARIA roles.
**Action:** Replace blocking native alerts with custom toast components, and ensure toast containers use `role="alert"` and `aria-live="assertive"` to reliably announce dynamic updates to screen reader users.
## 2024-05-24 - Focus States on Top-Level Navigation
**Learning:** Found that custom top-level navigation buttons in views (like back/close buttons) lacked keyboard focus states, breaking the accessibility pattern used in component-level elements.
**Action:** Always ensure that structural or custom navigational buttons receive the design system's default focus ring (`focus-visible:ring-sky-500`) just like standard UI components.
