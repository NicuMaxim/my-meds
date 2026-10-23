declare namespace Cloudflare {
  interface Env {
    DB: D1Database;
    DIARY_LOGIN: string;
    DIARY_PASSWORD: string;
    DIARY_ACTION_SECRET: string;
  }
}
