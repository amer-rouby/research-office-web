# Changelog

All notable changes to this project are documented here.
The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project uses [Semantic Versioning](https://semver.org/).

## [0.8.0] - 2026-11-09

### Changed
- New visual identity: royal blue + warm amber on calm surfaces, soft shadows; light landing hero with a live preview of the client tracking card; gradient sign-in panel and call to action.
- Request page redesigned for speed and trust: 3 numbered steps, reassurance chips (no payment now, quote in 24h, confidential), optional fields folded away, "what happens next" panel, WhatsApp shortcut; success screen with next steps and "send the link to yourself on WhatsApp".
- Arabic date picker (Saturday-first, month navigation, today, clear) replaces the browser date input in the request form and payments.
- In-app confirmation/prompt dialogs replace the browser's confirm/prompt (cancel request, send file to client, delete payment, reset password).
- Every API error is shown in clear Arabic, mapped from the backend error code.
- Request detail: payments card in the main column with a collapsible "record payment" form; empty quote price by default.
- Dashboard tiles coloured by meaning; request numbers isolated so they read correctly inside Arabic text; closed requests show every step done.

### Added
- "دخول الفريق" link in the public header.
- Local dev proxy: `/api` → backend on port 8190 (`proxy.conf.json`), same origin as production.

### Fixed
- White text on brand panels (hero, sign-in) was unreadable because the white colour token was missing.

## [0.7.0] - 2026-11-09

### Added
- Public website shell (navigation, request button, floating WhatsApp from `/api/public/office`).
- Landing page (`/`): hero, promises, services by audience, how it works, free tools, track-your-request box, FAQ (states the no-ghostwriting policy), final call to action.
- Free tools (`/tools`): sample size (Cochran + finite population + response rate), statistical test picker, break-even and payback calculator; each result leads to a pre-filled request or WhatsApp.
- Request form pre-fill from `?service=CODE&details=...`.
- SEO: page titles with site name, meta description and Open Graph per route.

## [0.6.0] - 2026-11-09

### Added
- Request detail: "price and payments" card — quote, paid/remaining progress, received payments (method, date, note), record a payment, delete a mistaken one.
- Client tracking: paid/remaining progress under the quote once a payment is recorded.
- Shared `ro-balance` used by both pages.

## [0.5.0] - 2026-11-09

### Added
- Team page (`/admin/experts`): list admins and experts, add a member with a temporary password, activate/deactivate, reset password.
- Request detail: assign an active expert; send a reviewed internal file to the client in one click (with confirmation).
- Expert area (`/expert`): current and past tasks, task page with the brief and files (no client contact details), start/resume, upload work (hidden from the client until reviewed), notes, submit for review.
- `FileDownload` service shared by every authenticated download; role labels in one place.

### Removed
- Placeholder page (every area now has real screens).

## [0.4.0] - 2026-11-09

### Added
- Production image: Angular build served by Caddy with automatic HTTPS for `RO_DOMAIN`, `/api` proxied to the backend (same origin, no CORS), `/actuator` hidden, long-cache hashed assets, security headers, SPA fallback.

### Changed
- `environment.ts` is production (`/api`); local development uses `environment.development.ts`.
- Production build no longer inlines Google Fonts (builds work without internet access to Google); the font still loads at runtime.

## [0.3.0] - 2026-11-09

### Added
- Public request page (`/request`): services grouped by academic/business as selectable cards, client details, deadline, drag-and-drop files; success screen with the reference and a copyable private tracking link.
- Client tracking page (`/t/:token`): journey steps, status hint, quote with one-click acceptance, confirm delivery or request a revision, download delivered files, upload more files, request history.
- Admin dashboard: attention tiles per stage (new, awaiting client, in progress, revisions, review, delivered) linking to the filtered list, and latest requests.
- Admin requests list: status tabs with counts, debounced search, paging; filters kept in the URL.
- Admin request detail: details, quote form (QAR/SAR/AED/KWD/OMR/BHD/USD/EGP), next-step buttons driven by the backend lifecycle, notes visible or internal, deliverable/internal uploads, authenticated downloads, WhatsApp message with the tracking link, full history.
- Shared building blocks: `ro-data-table` (column config + custom cells), `ro-pager`, `ro-filter-tabs`, `ro-search-box`, `ro-card`, `ro-page-header`, `ro-status-badge`, `ro-timeline`, `ro-file-list`, `ro-file-drop`, `ro-progress-steps`, `ro-copy-button`, loading/error/empty states, `createLoader`, Arabic date/money/size pipes, and one status table (`core/orders/order-status.ts`).

## [0.2.0] - 2026-11-09

### Added
- Staff sign-in page (`/login`) with a split brand panel; signed-in users skip it.
- Auth session (access + refresh token + profile) with automatic refresh-and-retry on 401 and sign-out when the session can no longer be renewed.
- Role guards: `/admin` for ADMIN, `/expert` for EXPERT or ADMIN; guests are sent to sign in with a `returnUrl`.
- Shared UI kit: `roButton` (variants, sizes, loading), `ro-form-field` + `roInput` (accessible label/hint/error wiring, Arabic validation messages), `ro-alert`.
- User menu (initials, name, role, sign-out) in both shells; phone navigation tabs in the admin shell.
- API types generated from the backend OpenAPI (`core/api/schema.d.ts`) with friendly aliases in `api-types.ts`.

### Changed
- ProblemDetail now carries the backend `code` and `fields`.

## [0.1.0] - 2026-11-09

### Added
- Angular 22 workspace: standalone, zoneless, signals, strict TypeScript and strict templates.
- Path aliases `@core`, `@shared`, `@features`, `@layout`, `@env`.
- Tailwind 4 with design tokens (brand, accent, surface, ink, status colours) and dark mode via `data-theme`; the default Tailwind palette is disabled so screens can only use tokens.
- IBM Plex Sans Arabic font, RTL Arabic by default.
- `@angular/cdk` and `@lucide/angular`.
- Lazy areas, each with its own shell: `/admin` (sidebar), `/expert`, `/t/:token` (client tracking without login), `/request` (public intake).
- API layer: base URL token, bearer-token + ProblemDetail error interceptor, `gen:api` script for OpenAPI types.
- App version in the shell footer.
- GitHub Actions CI: install, build, test on Node 24.
