<p align="center"><img src="public/icons/icon-192.png" width="96" height="96" alt="My Meds icon"></p>

# My Meds

A personal medication tracker with daily schedules, dose checklists, and English/Russian language support.

My Meds keeps one private diary behind a username and password. Check off doses by date, review each medicine's history, adjust course dates and durations, and synchronize changes across devices. The responsive interface groups doses into morning, evening, and bedtime and offers a previous-day prompt before 04:00 in the Europe/Chisinau timezone.

The current preset contains Pramistar, Magnilon Forte, Mydocalm, Sedoxil, and Nervocalmin Somn Ușor. Bedtime options and Sedoxil dose selection are supported. Package photographs in the Medicines view can be disabled in settings. These presets describe the existing personal workflow; they are not medication recommendations.

## Hosting options

One codebase supports two independent deployment targets:

| Target | Runtime | Storage | Instructions |
| --- | --- | --- | --- |
| Self-hosted server or local computer | Node.js | SQLite file on your disk | [Self-hosting guide](docs/self-hosting.md) |
| Cloudflare | Workers | D1 | [Cloudflare deployment](#deploy-to-cloudflare) |

Both targets share the same interface, login, medicine presets, translations, history and database schema.
Cloudflare is not required for the self-hosted target. Each installation keeps its own diary database.

For local use, follow [Run locally without Cloudflare](#run-locally-without-cloudflare) below.
For a VPS, domain, HTTPS, Docker or systemd, see the [self-hosting guide](docs/self-hosting.md).

## Stack

TypeScript, React 19, Next.js-compatible App Router APIs through Vinext/Vite, and Drizzle ORM. Platform adapters provide Node.js with native SQLite or Cloudflare Workers with D1. The application uses its own username/password login and does not require an external identity provider.

This is a server application. GitHub stores its source; GitHub Pages cannot run its API or database. A VPS, local computer or container host can run the Node.js target without Cloudflare. A static-only hosting service cannot run either target.

## Run locally without Cloudflare

This is the recommended local setup: a Node.js server and a SQLite file on your computer.
No Cloudflare account, login, Worker or D1 database is needed.

### 1. Install prerequisites and get the project

Install Node.js 24 LTS (minimum 22.18), then enable pnpm 11.25.0:

```sh
corepack enable
corepack prepare pnpm@11.25.0 --activate
git clone https://github.com/NicuMaxim/my-meds.git
cd my-meds
pnpm install --frozen-lockfile
```

If you already cloned the current repository, open its directory and skip the clone command.
After the earlier history squash, a fresh clone is the simplest option for an old checkout.

### 2. Configure your local login

Copy the example settings file. On Windows (Command Prompt or PowerShell):

```powershell
copy .env.example .env
```

On macOS/Linux:

```sh
cp .env.example .env
```

Open `.env` in your editor. Choose your own `DIARY_LOGIN` and `DIARY_PASSWORD`.
Generate a random signing key:

```sh
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

Paste the generated value into `DIARY_ACTION_SECRET`. Keep the default database path and port
unless you need to change them:

```dotenv
DATABASE_PATH=./data/my-meds.sqlite
PORT=3000
APP_HOST=127.0.0.1
```

Keep `.env` private; it is ignored by Git. This setup reads `.env`, not Cloudflare's `.dev.vars`.

### 3. Build and start

```sh
pnpm build:selfhost
pnpm start:selfhost
```

Open **http://127.0.0.1:3000** and sign in with the credentials from `.env`.
The server automatically creates the SQLite file and applies pending SQL migrations at startup.
You do not need to create tables manually or run any Wrangler commands.

Your settings and dose history are stored in `data/my-meds.sqlite`. They survive browser closure
and server restarts. A fresh database starts with no dose history; set your course dates in the Course tab.
Existing diary records from another installation are not included in this repository.

### Stop, restart and edit

Press **Ctrl+C** in the terminal to stop the server. To start it again, open the same project directory
and run:

```sh
pnpm start:selfhost
```

You only need to rebuild after changing application code or updating the project.
For development with automatic reload instead of a production build:

```sh
pnpm db:migrate:selfhost
pnpm dev:selfhost
```

Open the localhost URL printed by Vite for development. Use the `:selfhost` commands in this section;
the plain `pnpm dev`, `pnpm build` and `pnpm db:migrate` commands select the separate Cloudflare target.

All dates and the late-night cutoff use Europe/Chisinau; change `today()` and `hour()` in
`app/model.ts` to use another timezone. For access through a public domain, follow the
[self-hosting guide](docs/self-hosting.md) to configure HTTPS.

## Deploy to Cloudflare

Authenticate and create a new D1 database:

```sh
pnpm exec wrangler login
pnpm exec wrangler d1 create my-meds
```

Replace the placeholder `database_id` in `wrangler.cloudflare.jsonc` with the returned ID. Keep the binding name `DB` and database name `my-meds`. Add your account ID if Wrangler asks you to choose between accounts.

Set the three production secrets. Each command prompts for its value; local `.dev.vars` values are not uploaded automatically:

```sh
pnpm exec wrangler secret put DIARY_LOGIN --config wrangler.cloudflare.jsonc
pnpm exec wrangler secret put DIARY_PASSWORD --config wrangler.cloudflare.jsonc
pnpm exec wrangler secret put DIARY_ACTION_SECRET --config wrangler.cloudflare.jsonc
pnpm db:migrate:remote
pnpm deploy
```

Wrangler prints the deployed URL. Use HTTPS in production. The app uses an HttpOnly, SameSite=Strict, Secure session cookie on public hosts. A separate local cookie permits HTTP on loopback hosts only. Sessions last 30 days; rotating `DIARY_ACTION_SECRET` invalidates existing sessions and write tickets. Changing only the password does not revoke existing sessions, so rotate the signing secret as well when access must be revoked.

Deployment creates a separate app and database. It does not transfer data from an existing installation. To move an existing diary, export it from its current database and import it into the new D1 database separately, keeping SQL exports outside Git.

### Optional: Cloudflare local emulation

Use this only to develop or test the Cloudflare deployment target. For ordinary local use,
follow [Run locally without Cloudflare](#run-locally-without-cloudflare).

After installing dependencies, copy `.dev.vars.example` to `.dev.vars` and set the three
`DIARY_*` values there. Then:

```sh
pnpm db:migrate
pnpm dev
```

Open the localhost URL printed by Vite. This mode uses Wrangler's local Worker/D1 emulator and
stores its data under `.wrangler/`. The placeholder ID in `wrangler.cloudflare.jsonc` is sufficient
for emulation; a Cloudflare login is not required. This database is separate from the self-hosted
SQLite file.

## Development commands

| Command | Purpose |
| --- | --- |
| `pnpm build:selfhost` | Build the Node.js app for local use or your own server |
| `pnpm start:selfhost` | Apply SQLite migrations and start at `http://127.0.0.1:3000` by default |
| `pnpm dev:selfhost` | Start Node.js development with automatic reload |
| `pnpm db:migrate:selfhost` | Apply SQLite migrations before starting development |
| `pnpm typecheck` | Check TypeScript for the shared application |
| `pnpm test` | Run core behavior and SQLite persistence tests |
| `pnpm test:selfhost` | Test the built Node.js server, including restart persistence |
| `pnpm db:generate` | Generate a shared SQL migration after schema changes |
| `pnpm dev` | Cloudflare only: start the local Worker/D1 emulator |
| `pnpm build` | Cloudflare only: build the client and Worker into `dist/` |
| `pnpm preview` | Cloudflare only: run the built Worker locally |
| `pnpm db:migrate` | Cloudflare only: apply migrations to the emulated D1 database |
| `pnpm db:migrate:remote` | Cloudflare only: apply migrations to the remote D1 database |
| `pnpm deploy` | Cloudflare only: build and deploy the Worker |

GitHub Actions runs type checks, tests, and both production builds on pushes and pull requests. It does not deploy the app. Both builds use `dist/`; run the build for the intended target before starting or deploying it.

## Project layout

```text
app/                    Pages, bilingual UI, authentication, and tracker API
  api/                  Login, logout, and diary endpoints
  model.ts              Medicine presets, dose times, and date helpers
  i18n.tsx              Russian and English strings
db/                     Shared Drizzle schema and selected database adapter
platform/               Cloudflare and Node.js database/secret adapters
scripts/                Self-hosted startup and SQLite migrations
deploy/                 Caddy and systemd examples
docs/                   Self-hosting instructions
drizzle/                SQL migrations and schema metadata
public/
  icon.png              Original green capsule artwork
  apple-touch-icon.png  iPhone home-screen icon
  icons/                App manifest icons
  medicines/            Package photographs and their source references
tests/                  Core behavior checks
worker.ts               Worker entry point
vite.config.ts          Cloudflare build configuration
vite.selfhost.config.ts Node.js build configuration
wrangler.cloudflare.jsonc Worker and D1 configuration
.env.example            Self-hosted runtime settings, with no real secrets
.dev.vars.example       Credential examples, with no real secrets
```

## App icon and assets

The original green capsule image is saved in `public/icon.png`. The favicon, Apple touch icon, and web app manifest use sizes derived from that same artwork. On iPhone, save the app to the home screen from the browser to use its touch icon.

Medicine package images come from the product pages recorded in [`public/medicines/sources.json`](public/medicines/sources.json). Product names, packaging, and photographs belong to their respective owners. The app falls back to a generic pill symbol if an image is unavailable.

## Data and access

The database has a `preferences` table for course settings and a `doses` table for daily checkmarks and optional dose amounts. One deployment is intended for one diary. This is not a multi-user service: everyone using the configured credentials shares the same diary.

Credentials stay on the server. All tracker reads and writes require a valid signed session; writes also require a short-lived signed ticket and enforce origin checks. Keep `.dev.vars`, environment files, SQL exports, database files, and build output out of version control. Protect any public deployment against login abuse using rate limiting at the hosting layer; the app does not implement account lockout or multi-factor authentication.

By Maxim Nicu.

## History and maintenance

The first commit, `Initial My Meds application for Cloudflare Workers and D1`, preserves the complete original Cloudflare-only application. The next commit adds self-hosted Node.js/SQLite support. New features belong in shared application code and must remain available in both runtimes; see [AGENTS.md](AGENTS.md).
