FROM node:24-bookworm-slim
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@11.25.0 --activate
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm build:selfhost && mkdir -p /app/data && chown node:node /app/data
ENV NODE_ENV=production APP_HOST=0.0.0.0 PORT=3000 DATABASE_PATH=/app/data/my-meds.sqlite
USER node
EXPOSE 3000
CMD ["node", "scripts/start-selfhost.mjs"]
