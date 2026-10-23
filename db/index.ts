import { env } from "cloudflare:workers";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";

export function getDb() {
  if (!env.DB) throw new Error("Configure the Cloudflare D1 database binding named DB.");
  return drizzle(env.DB, { schema });
}
