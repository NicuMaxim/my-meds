# Self-hosting My Meds

Run this target on a local computer, a VPS or a Docker-capable server. It uses Node.js and a
normal SQLite file; no Cloudflare account, Worker, D1 service or external identity provider is needed.

## Direct Node.js installation

Install Node.js 24 LTS (minimum 22.18) and pnpm 11.25.0. Then:

```sh
git clone https://github.com/NicuMaxim/my-meds.git
cd my-meds
corepack enable
corepack prepare pnpm@11.25.0 --activate
pnpm install --frozen-lockfile
cp .env.example .env
```

On Windows, use `copy .env.example .env` instead of `cp`. Edit `.env` to set your own
`DIARY_LOGIN` and `DIARY_PASSWORD`. Generate `DIARY_ACTION_SECRET` with:

```sh
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

Paste that value into `.env`, then:

```sh
pnpm build:selfhost
pnpm start:selfhost
```

Open `http://127.0.0.1:3000`. Startup validates the required settings and applies pending SQL
migrations automatically. Stop the server with Ctrl+C. Restart it from the same project directory
to use the same database. No migration or startup step deletes existing diary records.

For development, apply migrations once with `pnpm db:migrate:selfhost`, then use
`pnpm dev:selfhost`. `.env` is loaded by these scripts. Cloudflare's `.dev.vars` is independent.

| Setting | Meaning |
| --- | --- |
| `DIARY_LOGIN` | Your configured username |
| `DIARY_PASSWORD` | Your configured password |
| `DIARY_ACTION_SECRET` | Random signing key; keep stable across restarts |
| `DATABASE_PATH` | SQLite file, default `./data/my-meds.sqlite`; use an absolute path in production |
| `PORT` | HTTP port, default `3000` |
| `APP_HOST` | Bind address, default `127.0.0.1` |
| `VINEXT_TRUSTED_HOSTS` | Your real domain when using a trusted reverse proxy, e.g. `meds.example.com` |

Sessions last 30 days. Rotating the signing key logs out existing sessions. The SQLite file,
including course settings and dose history, persists independently of the application process.
The Node SQLite API may print an experimental-feature warning on supported Node releases.

## Domain and HTTPS

Point your domain's DNS A record at the VPS IPv4 address (and AAAA only if IPv6 is configured).
Install Caddy on that VPS, open TCP ports 80/443, and use the example in `deploy/Caddyfile.example`:

```caddyfile
meds.example.com {
  reverse_proxy 127.0.0.1:3000
}
```

Replace `meds.example.com` with your domain. Set `VINEXT_TRUSTED_HOSTS=meds.example.com` in
`.env`, then restart My Meds. Caddy handles TLS certificates and forwards the original domain
and HTTPS scheme. This is needed for same-origin checks and secure session cookies to work.
Keep the application bound to loopback; expose the reverse proxy to the internet.

Production domains require HTTPS. HTTP is allowed only for local loopback development.
An ordinary PHP/static-only hosting plan is insufficient; the host must run a persistent Node.js
process or containers. Configure login rate limiting at the reverse proxy if needed.

## Keeping the process running

On a Linux VPS, `deploy/my-meds.service` is a systemd example. It assumes the application is
installed at `/opt/my-meds`, Node is `/usr/bin/node`, and a dedicated `my-meds` user/group exists.
Adjust those paths for your installation, build the application, and ensure that this user can
read the project and `.env` and write to the configured database directory. Install the service:

```sh
sudo cp deploy/my-meds.service /etc/systemd/system/my-meds.service
sudo systemctl daemon-reload
sudo systemctl enable --now my-meds
sudo journalctl -u my-meds -f
```

The service restarts after failures and boots. Restrict `.env` to the service account.

## Docker alternative

Install Docker with Compose. Create and edit `.env` as above, including your domain under
`VINEXT_TRUSTED_HOSTS`, then:

```sh
docker compose up -d --build
docker compose logs -f app
```

The container uses Node.js 24, runs as an unprivileged user and applies migrations at startup.
Port 3000 is published only on the VPS loopback interface, ready for the host's Caddy proxy.
The named `diary-data` volume stores `/app/data/my-meds.sqlite` across rebuilds and restarts.
Compose overrides `APP_HOST`, `PORT` and `DATABASE_PATH` for this container layout.

`docker compose down` retains the volume; `docker compose down -v` deletes it and all diary data.
Environment files, local databases and backups are excluded from the build context and Git.

## Updating and backups

Before upgrading, back up the database. For a direct installation, stop the server and copy the
SQLite file **and any accompanying `-wal`/`-shm` files**, or use SQLite's online `.backup` command.
For Docker, stop the app and back up the entire `diary-data` volume, then restart it. Keep backups
outside the repository and server image. Never copy only the main file while WAL writes are active.

For direct installation:

```sh
git pull --ff-only
pnpm install --frozen-lockfile
pnpm build:selfhost
sudo systemctl restart my-meds
```

For Docker, use `git pull --ff-only` and `docker compose up -d --build`. Pending migrations run
automatically. Keep applied SQL migrations immutable and add a new migration for schema changes.
Test new migrations against a backup before a production upgrade.

An existing Cloudflare diary is not automatically copied to SQLite. A fresh installation starts
empty; importing old records is a separate operation. Both runtimes use the same tables and
column names, but their migration bookkeeping is separate. Do not import D1's internal tables.
