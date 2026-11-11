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

## Linting & Testing

```bash
# Static analysis and feature boundary checks
npm run lint

# Unit tests (Vitest)
npm test
```
