# Changelog

All notable changes to this project are documented here.
The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project uses [Semantic Versioning](https://semver.org/).

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
