import { randomBytes, createHash } from "crypto";
import { cookies } from "next/headers";
import { eq, and, lt } from "drizzle-orm";
import { db } from "@/db";
import { sessions, users } from "@/db/schema";
import { SESSION_COOKIE_NAME, SESSION_DURATION_SECONDS } from "./config";
import { redirect } from "next/navigation";
import { cache } from "react";

export function generateSessionToken() {
  return randomBytes(32).toString("hex");
}

export function hashSessionToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function createSession(userId: string) {
  const token = generateSessionToken();
  const tokenHash = hashSessionToken(token);
  const expiresAt = new Date(Date.now() + SESSION_DURATION_SECONDS * 1000);

  // Invalidate any expired sessions for the user to keep the DB clean
  await db.delete(sessions).where(
    and(
      eq(sessions.user_id, userId),
      lt(sessions.expires_at, new Date())
    )
  );
  await db.insert(sessions).values({
    user_id: userId,
    token_hash: tokenHash,
    expires_at: expiresAt,
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export const validateSession = cache(async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  const tokenHash = hashSessionToken(token);

  const result = await db
    .select({
      session: sessions,
      user: {
        id: users.id,
        name: users.name,
        username: users.username,
        isActive: users.isActive,
      },
    })
    .from(sessions)
    .innerJoin(users, eq(sessions.user_id, users.id))
    .where(eq(sessions.token_hash, tokenHash))
    .limit(1);

  if (result.length === 0) {
    return null;
  }

  const { session, user } = result[0];

  if (session.expires_at < new Date() || !user.isActive) {
    // Session expired or user inactive
    await destroySession();
    return null;
  }

  return { session, user };
});

export async function destroySession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (token) {
    const tokenHash = hashSessionToken(token);
    await db.delete(sessions).where(eq(sessions.token_hash, tokenHash));
    cookieStore.delete(SESSION_COOKIE_NAME);
  }
}

export async function requireAdmin() {
  const session = await validateSession();

  if (!session) {
    redirect("/login");
  }

  return session.user;
}
