# Maintaining My Meds

The repository supports Cloudflare Workers + D1 and a self-hosted Node.js + SQLite runtime.

Keep features in the shared `app/` code and the shared Drizzle schema. Limit hosting-specific
code to `platform/`, the Vite configurations and deployment scripts. Every future feature
added to the hosted Sites version must also be reflected here for both runtimes; do not
publish diary records, credentials, environment files or database exports to GitHub.

When changing behavior, verify type checks, tests and both production builds. Update both
deployment instructions when configuration or storage changes. Keep the existing app icon,
RU/EN translations, cross-device persistence and bedtime date handling in sync.

The first commit is the complete original Cloudflare-only baseline. The following commit
adds self-hosting. Do not rewrite this history again unless explicitly requested.
