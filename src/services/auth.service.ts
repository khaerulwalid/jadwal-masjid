import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import * as bcrypt from "bcryptjs";
import { createSession } from "@/lib/auth/session";
import { LoginInput } from "@/lib/validation/auth";

export class AuthService {
  static async login(input: LoginInput) {
    const { username, password } = input;

    // Normalize username (trim happens in Zod, but just to be sure)
    // We will just use what Zod gave us.

    // Find user
    const result = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1);

    if (result.length === 0) {
      throw new Error("Username atau password salah.");
    }

    const user = result[0];

    // Verify active
    if (!user.isActive) {
      throw new Error("Username atau password salah."); // Generic message for inactive
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      throw new Error("Username atau password salah.");
    }

    // Create session
    await createSession(user.id);
  }
}
