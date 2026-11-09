# Changelog

All notable changes to this project are documented here.
The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project uses [Semantic Versioning](https://semver.org/).

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
