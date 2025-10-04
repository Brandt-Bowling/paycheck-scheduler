# AI Agent Instructions for Paycheck Scheduler

This document provides essential context for AI agents working in this codebase.

## Project Overview

A React + TypeScript application for scheduling work events and calculating paycheck estimates. Built with Vite and styled with Tailwind CSS.

### Core Components

- `App.tsx` - Main application container handling state and navigation
- `Calendar.tsx` - Interactive calendar for date selection
- `PaycheckModal.tsx` - Paycheck estimation based on selected dates
- `EventSummaryModal.tsx` - Event template selection and management
- `FloatingToolbar.tsx` - Contextual action menu

### Key Data Flows

1. Date Selection Flow:

   - User selects dates in `Calendar` component
   - Selected dates stored in `App`'s state (`selectedDates: Set<string>`)
   - Dates formatted using `formatDateToYYYYMMDD` from `dateHelpers.ts`

2. Paycheck Calculation Flow:

   - PaycheckModal receives selected dates
   - Calculates earnings based on:
     - Pay rate
     - Hours per event
     - Take-home percentage
     - Pay period length (weekly/bi-weekly)

3. Event Creation Flow:
   - Event templates defined in `EVENT_TEMPLATES` array in `EventSummaryModal`
   - Templates can include optional person assignments
   - Generates JSON output for selected dates

## Development Workflow

### Setup and Running

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Project Structure

```
src/
  components/    # React components
    icons/       # SVG icons as React components
  utils/         # Shared utilities
    dateHelpers.ts  # Date formatting/parsing
```

### Conventions

1. **Date Handling:**

   - Always use `formatDateToYYYYMMDD` and `parseLocalDate` from `dateHelpers.ts`
   - Dates stored as YYYY-MM-DD strings in `selectedDates` Set

2. **Styling:**

   - Uses Tailwind CSS with custom theme in `index.css`
   - Dark mode design with slate color palette
   - Consistent spacing/padding classes (p-5 sm:p-8)

3. **Component Props:**

   - Modal components use `isOpen` and `onClose` pattern
   - Date-aware components receive `selectedDates` Set

4. **Icons:**
   - SVG icons implemented as React components
   - Use consistent sizing (width/height="24")
   - Maintain current color with `stroke="currentColor"`

## Common Tasks

### Adding a New Event Template

1. Add template to `EVENT_TEMPLATES` array in `EventSummaryModal.tsx`:

```typescript
{
  id: "template-id",
  name: "Template Name",
  description: "Template description",
  personOptions?: string[] // Optional assignees
}
```

### Modifying Date Calculations

1. Update relevant functions in `dateHelpers.ts`
2. Ensure changes are reflected in both Calendar and PaycheckModal

### Adding New UI Elements

1. Follow existing modal/component patterns
2. Use consistent Tailwind classes for dark theme
3. Maintain responsive design with `sm:` breakpoint classes
