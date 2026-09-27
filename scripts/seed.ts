import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { appSettings, rotationState, users } from "@/db/schema";
import * as bcrypt from "bcryptjs";
import { config } from "dotenv";
config({ path: ".env.local" });
import { eq } from "drizzle-orm";

const runSeed = async () => {
  const databaseUrl = process.env.DATABASE_MIGRATION_URL ?? process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_MIGRATION_URL or DATABASE_URL is missing");
  }

  const client = postgres(databaseUrl, { prepare: false });
  const db = drizzle(client);

  console.log("🌱 Starting initial seed...");

  // Seed rotation_state
  await db
    .insert(rotationState)
    .values({
      id: 1,
      nextGroupId: null,
      isPaused: false,
    })
    .onConflictDoNothing();
  console.log("✅ rotation_state seeded");

  // Seed app_settings
  await db
    .insert(appSettings)
    .values({
      id: 1,
      defaultReplacementAmount: "100000",
    })
    .onConflictDoNothing();
  console.log("✅ app_settings seeded");

  // Seed admin user
  const username = process.env.SEED_ADMIN_USERNAME;
  const password = process.env.SEED_ADMIN_PASSWORD;
  const name = process.env.SEED_ADMIN_NAME;

  if (username && password && name) {
    const existingAdmin = await db.select().from(users).where(eq(users.username, username));

    if (existingAdmin.length === 0) {
      const passwordHash = await bcrypt.hash(password, 10);
      await db.insert(users).values({
        name,
        username,
        passwordHash,
        isActive: true,
      });
      console.log(`✅ Admin user '${username}' seeded`);
    } else {
      console.log(`✅ Admin user '${username}' already exists`);
    }
  } else {
    console.warn("⚠️ Missing SEED_ADMIN_* environment variables, skipping admin seed");
  }

  console.log("🌱 Seeding completed.");
  process.exit(0);
};

runSeed().catch((err) => {
  console.error("❌ Seeding failed:");
  console.error(err);
  process.exit(1);
});
