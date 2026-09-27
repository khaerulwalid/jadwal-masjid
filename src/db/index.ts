import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env } from "@/lib/env";
import * as schema from "./schema";

if (!env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not defined");
}

const client = postgres(env.DATABASE_URL, {
  max: 1,
  prepare: false,
  ssl: "require",
});

export const db = drizzle(client, { schema });
