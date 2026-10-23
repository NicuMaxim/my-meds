<p align="center"><img src="public/icons/icon-192.png" width="96" height="96" alt="My Meds icon"></p>

# My Meds

A personal medication tracker with daily schedules, dose checklists, and English/Russian language support.

My Meds keeps one private diary behind a username and password. Check off doses by date, review each medicine's history, adjust course dates and durations, and synchronize changes across devices. The responsive interface groups doses into morning, evening, and bedtime and offers a previous-day prompt before 04:00 in the Europe/Chisinau timezone.

The current preset contains Pramistar, Magnilon Forte, Mydocalm, Sedoxil, and Nervocalmin Somn Ușor. Bedtime options and Sedoxil dose selection are supported. Package photographs in the Medicines view can be disabled in settings. These presets describe the existing personal workflow; they are not medication recommendations.

## Stack

TypeScript, React 19, Next.js-compatible App Router APIs through Vinext/Vite, Drizzle ORM, Cloudflare Workers, and Cloudflare D1 (SQLite). The application uses its own username/password login and does not require an external identity provider.

This is a server application. GitHub stores its source; GitHub Pages cannot run its API or database. The included deployment configuration targets Cloudflare Workers with D1. Another host would require replacing the Worker bindings and database adapter.

## Run locally

Use Node.js 22.13 or newer (Node 22 LTS is recommended) and pnpm 11.25.0. Enable pnpm with Corepack if needed:

```sh
corepack enable
corepack prepare pnpm@11.25.0 --activate
git clone https://github.com/NicuMaxim/my-meds.git
cd my-meds
pnpm install --frozen-lockfile
cp .dev.vars.example .dev.vars
```

Edit `.dev.vars`: choose `DIARY_LOGIN`, a unique `DIARY_PASSWORD`, and a random `DIARY_ACTION_SECRET`. Generate a signing secret with:

```sh
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

Create the local database tables, then start the app:

```sh
pnpm db:migrate
pnpm dev
```

Open the localhost URL printed by Vite and sign in using your chosen credentials. The placeholder database ID in `wrangler.jsonc` works for local emulation; no Cloudflare login is needed for local development. Local database files live under `.wrangler/` and are ignored by Git.

A new database starts with no dose history and course start dates set to the current day. Adjust the dates in the Course tab. Existing diary records are not included in the repository. All dates and the late-night cutoff use Europe/Chisinau; change `today()` and `hour()` in `app/model.ts` to use another timezone.

## Deploy to Cloudflare

Authenticate and create a new D1 database:

```sh
pnpm exec wrangler login
pnpm exec wrangler d1 create my-meds
```

Replace the placeholder `database_id` in `wrangler.jsonc` with the returned ID. Keep the binding name `DB` and database name `my-meds`. Add your account ID if Wrangler asks you to choose between accounts.

Set the three production secrets. Each command prompts for its value; local `.dev.vars` values are not uploaded automatically:

```sh
pnpm exec wrangler secret put DIARY_LOGIN
pnpm exec wrangler secret put DIARY_PASSWORD
pnpm exec wrangler secret put DIARY_ACTION_SECRET
pnpm db:migrate:remote
pnpm deploy
```

Wrangler prints the deployed URL. Use HTTPS in production. The app uses an HttpOnly, SameSite=Strict, Secure session cookie on public hosts. A separate local cookie permits HTTP on loopback hosts only. Sessions last 30 days; rotating `DIARY_ACTION_SECRET` invalidates existing sessions and write tickets. Changing only the password does not revoke existing sessions, so rotate the signing secret as well when access must be revoked.

Deployment creates a separate app and database. It does not transfer data from an existing installation. To move an existing diary, export it from its current database and import it into the new D1 database separately, keeping SQL exports outside Git.

## Development commands

| Command | Purpose |
| --- | --- |
| `pnpm dev` | Start the local Vite/Worker development server |
| `pnpm typecheck` | Check TypeScript |
| `pnpm test` | Test write-ticket verification, dates, and session cookie policy |
| `pnpm build` | Build the client and Worker into `dist/` |
| `pnpm preview` | Run the built Worker locally (after migrating the local database) |
| `pnpm db:generate` | Generate a SQL migration after schema changes |
| `pnpm db:migrate` | Apply pending migrations locally |
| `pnpm db:migrate:remote` | Apply pending migrations to the remote D1 database |
| `pnpm deploy` | Build and deploy the Worker |

GitHub Actions runs type checks, tests, and the production build on pushes and pull requests. It does not deploy the app.

## Project layout

```text
app/                    Pages, bilingual UI, authentication, and tracker API
  api/                  Login, logout, and diary endpoints
  model.ts              Medicine presets, dose times, and date helpers
  i18n.tsx              Russian and English strings
db/                     Drizzle schema and D1 adapter
drizzle/                SQL migrations and schema metadata
public/
  icon.png              Original green capsule artwork
  apple-touch-icon.png  iPhone home-screen icon
  icons/                App manifest icons
  medicines/            Package photographs and their source references
tests/                  Core behavior checks
worker.ts               Worker entry point
vite.config.ts          Application build configuration
wrangler.jsonc          Worker and D1 configuration
.dev.vars.example       Credential examples, with no real secrets
```

## App icon and assets

The original green capsule image is saved in `public/icon.png`. The favicon, Apple touch icon, and web app manifest use sizes derived from that same artwork. On iPhone, save the app to the home screen from the browser to use its touch icon.

Medicine package images come from the product pages recorded in [`public/medicines/sources.json`](public/medicines/sources.json). Product names, packaging, and photographs belong to their respective owners. The app falls back to a generic pill symbol if an image is unavailable.

## Data and access

The database has a `preferences` table for course settings and a `doses` table for daily checkmarks and optional dose amounts. One deployment is intended for one diary. This is not a multi-user service: everyone using the configured credentials shares the same diary.

Credentials stay on the server. All tracker reads and writes require a valid signed session; writes also require a short-lived signed ticket and enforce origin checks. Keep `.dev.vars`, environment files, SQL exports, database files, and build output out of version control. Protect any public deployment against login abuse using rate limiting at the hosting layer; the app does not implement account lockout or multi-factor authentication.

By Maxim Nicu.
