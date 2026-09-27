import { defineConfig } from "drizzle-kit";
import { config } from "dotenv";

config({ path: ".env.local" });

// Use process.env directly here because drizzle.config.ts is often run outside 
// the main Next.js context where our env.ts might not be loaded properly yet,
// or we can use dotenv to load it. For simplicity, we just check it directly.
if (!process.env.DATABASE_MIGRATION_URL) {
  throw new Error("DATABASE_MIGRATION_URL is not defined");
}

export default defineConfig({
  schema: "./src/db/schema/index.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_MIGRATION_URL,
  },
});
