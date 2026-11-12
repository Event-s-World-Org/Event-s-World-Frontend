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

## Runtime Configuration

`public/config.json` is loaded at startup, so changing it does not need a rebuild:

| Key | Use |
|---|---|
| `apiUrl` | Backend base URL (`http://localhost:5037` locally). Every `/api/...` request is sent there |
| `supabaseUrl`, `supabasePublishableKey` | Supabase Auth project. The publishable key is public by design (ADR-0002) |
| `features` | Feature flags: `coAdmin`, `teamSplitter`, `checkIn`, `refunds` (`[Next]`), `paymentReview`, `eventSettings` |

Read flags with `FeatureFlagService.isEnabled('teamSplitter')`; flag names are typed.

## API Client

The client in `src/app/core/api/generated/` is generated by [orval](https://orval.dev) from `src/app/core/api/openapi.json`. Never edit it by hand.

```bash
# Regenerate after changing the OpenAPI document
npm run api:generate

# Fail if the committed client does not match the OpenAPI document (runs in CI)
npm run api:check
```

The OpenAPI document is provisional and follows `architecture/backend.md` §4 until the backend publishes its own (TS-004); then the orval `input` will point to it.

HTTP interceptors, in order:

1. `apiBaseUrlInterceptor`: prefixes `apiUrl` to `/api/...` URLs.
2. `idempotencyInterceptor`: sends the form's `Idempotency-Key` (`withIdempotencyKey(createIdempotencyKey())`), so a retry reuses the same key.
3. `authInterceptor`: adds the token only to requests to our API. Participant routes use the participant token (memory only), public routes send none.
4. `errorInterceptor`: turns errors into `ApiError` with a Spanish message from the error catalog (never the backend `detail`). A 401 goes to `/login` (or to the personal-link recovery page for participants); a 403 goes to `/403`.

Supabase Auth (`@supabase/auth-js`) is loaded on demand, only when a session is stored or a login flow needs it, so it stays out of the initial bundle. The global role comes from `GET /api/v1/me` (ADR-0004).

## Linting & Testing

```bash
# Static analysis and feature boundary checks
npm run lint

# Unit tests (Vitest)
npm test
```

### End-to-end tests (Playwright)

Every test in `e2e/` runs on two projects: `mobile` (Pixel 7) and `desktop` (Desktop Chrome).

```bash
# Once: download Chromium for Playwright
npx playwright install chromium

# Run the tests (reuses `npm start` on port 4200 if it is running, or starts it)
npm run e2e

# Only one viewport, or with the Playwright UI
npm run e2e -- --project=mobile
npm run e2e -- --ui
```

When a test fails, open the report with `npx playwright show-report` (traces and screenshots included).

## Continuous Integration

`.github/workflows/ci.yml` runs on every pull request to `main`, on every push to `main`, and on demand. It has two jobs, in parallel:

| Job | Steps |
|---|---|
| Lint, test and build | `npm ci`, `npm run lint`, `npm run api:check`, `npm test -- --watch=false`, `npm run build` (the SSR build fails if a bundle exceeds its `maximumError` budget in `angular.json`) |
| End-to-end | `npm ci`, Chromium (cached), `npm run build`, `npm run e2e` against the production SSR server. On failure the Playwright report, traces and screenshots are uploaded as the `playwright-report` artifact (7 days) |

Each job has a 10-minute limit. A lint error, a failing test, a stale API client or an exceeded budget fails the check.

> **Required checks:** a repository admin must mark both jobs ("Lint, test and build" and "End-to-end (Pixel 7 and Desktop Chrome)") as required status checks in the branch protection rule for `main` (Settings → Branches), so a PR cannot be merged until they pass (conventions.md).
