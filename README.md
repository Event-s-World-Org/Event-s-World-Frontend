# Event's World · Frontend

Angular 21 application configured with zoneless change detection, hybrid rendering (`@angular/ssr`), Tailwind CSS v4, Angular CDK, and Lucide icons.

## Prerequisites

- **Node.js:** v22+
- **npm:** v10+

Install dependencies:

```bash
npm install
```

## Running the Application

### 1. Development Server (Hybrid SSR enabled by default)

Starts the Angular development server with SSR on routes configured with `RenderMode.Server` (`/` and `/e/:slug`), prerendering on `/legal/*`, and CSR on all other routes:

```bash
npm start
```

Open `http://localhost:4200/` in your browser.

### 2. Production Build & SSR Node Server (With SSR)

Build the browser, server, and prerendered bundles, then start the Express SSR server:

```bash
npm run build
npm run serve:ssr:EventsWorld
```

The SSR server listens on `http://localhost:4000/` (or the `PORT` environment variable).

### 3. Running Without SSR (Client-Side Only)

To run the development server without SSR/prerendering:

```bash
npx ng serve --no-ssr --no-prerender
```

## Project Structure

```text
src/app/
├─ core/          Singletons: api, auth, config, errors, theme, seo
├─ shared/        Reusable building blocks: ui, forms, pipes
├─ layouts/       Application layout shells (public, participant, auth, organizer, admin)
└─ features/      Lazy-loaded feature areas (public, participant, auth, organizer, admin)
```

> **Architecture boundary rule:** Features under `src/app/features/*` cannot import from one another. Shared code must live in `src/app/shared/` or `src/app/core/`.

## Design System (Salar Cristal)

The visual system is specified in `Docs/design/design-system.md` (ADR-0008) and implemented in `src/styles.css`:

- **Tokens:** CSS variables `--ew-*` for light mode (`:root`) and dark mode (`.dark`), mapped to Tailwind with `@theme inline`. Use `bg-surface`, `text-muted`, `border-control`, `bg-pending-bg text-pending`, etc. Tailwind's default palette is disabled, so only Salar Cristal colours exist.
- **Type scale:** `text-meta`, `text-secondary`, `text-body`, `text-subtitle`, `text-title`, `text-event-title`, `text-display` (Outfit 400 / 600 / 700).
- **Corners:** `rounded-sm` (6 px), `rounded-md` (12 px), `rounded-lg` (18 px), `rounded-pill`.
- **Glass:** `glass` (panels, bars, controls) and `glass-overlay` (modals, drawers). They become solid with "reduce transparency" or without `backdrop-filter` support.
- **Theme:** `ThemeService` (`core/theme`) handles light / dark / system and stores the choice in `localStorage` (`ew-theme`). An inline script in `index.html` applies it before first paint.

In development, open `http://localhost:4200/dev/tokens` to check every token, glass level and the worst-case contrast in both themes. The page does not exist in production builds.

### Shared UI components (`shared/ui`)

Standalone, accessible components built on the tokens and the Angular CDK. Open `http://localhost:4200/dev/ui` (development only) to see all of them in both themes.

| Group | Components |
|---|---|
| Actions | `button[app-button]` / `a[app-button]` (`primary`, `secondary`, `ghost`, `approve`, `observe`, `reject`; `size`, `square`, `loading`) |
| Display | `app-card`, `app-status-badge`, `app-filter-chips`, `app-avatar`, `app-progress-bar`, `app-kpi-card`, `app-empty-state`, `app-skeleton`, `app-stepper` |
| Forms (Reactive Forms) | `app-text-field` (text, email, tel, password, number, date, datetime-local, textarea), `app-select-field`, `app-checkbox`, `app-toggle`, `app-file-dropzone` (type and size check, drag and drop, upload progress). Errors show after blur and clear as soon as the value is valid |
| Overlays | `DialogService.confirm()` (named confirmation, Cancel focused), `DialogService.open()` + `app-dialog-layout`, `DialogService.openDrawer()` + `app-drawer-layout`, `appMenuTrigger` / `appMenu` / `appMenuItem` (CDK menu), `appTooltip` (with optional `appTooltipShortcut`), `ToastService` + `app-toast-outlet` (already in the root component) |
| Data | `app-data-table` (CDK table; cards on mobile; sorting emitted for the server; row selection with `selectable` and `[(selection)]`; `appCell` templates) and `app-paginator` |

Every component keeps its class, template and styles in separate files (`name.ts`, `name.html`, `name.css`).

Icons come from `@lucide/angular`. Add `provideIcons()` (from `shared/ui`) to the root route of each lazy feature; do not import Lucide in the root component or `app.config.ts`, or the whole icon chunk enters the initial bundle.

## Linting & Testing

```bash
# Static analysis and feature boundary checks
npm run lint

# Unit tests (Vitest)
npm test
```
