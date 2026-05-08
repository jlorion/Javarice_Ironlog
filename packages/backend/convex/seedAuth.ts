import { internalMutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Seed test users for internal company use.
 *
 * These tables (user, account) are part of the better-auth COMPONENT schema,
 * not the app schema. We use `internalMutation` and cast `db` to access them.
 *
 * Run:
 *   npx convex run seedAuth:createTestUser --no-push -- '{"email":"admin@company.com","name":"Admin User","role":"Admin"}'
 */

// bcrypt hash of "password123"
const PASSWORD_HASH =
  "$2a$10$0MxqF8mL.yQ3PZYZQxF.Bu2qZqMFtMP7FWYYrOqPqXQmGJg.6GJxu";

export const createTestUser = internalMutation({
  args: {
    email: v.string(),
    name: v.string(),
    role: v.optional(
      v.union(
        v.literal("Admin"),
        v.literal("Fleet Manager"),
        v.literal("Site Supervisor"),
        v.literal("Operations Manager"),
        v.literal("Viewer"),
      ),
    ),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // Cast to any so we can insert into component tables not in app schema
    const db = ctx.db as any;

    // ── 1. Insert into component `user` table ──
    const userId = await db.insert("user", {
      email: args.email,
      emailVerified: true,
      name: args.name,
      createdAt: now,
      updatedAt: now,
      image: null,
      userId: null,
      twoFactorEnabled: null,
      isAnonymous: null,
      username: null,
      displayUsername: null,
      phoneNumber: null,
      phoneNumberVerified: null,
    });

    // ── 2. Insert into component `account` table ──
    await db.insert("account", {
      userId,
      accountId: args.email,
      providerId: "credential",
      password: PASSWORD_HASH,
      createdAt: now,
      updatedAt: now,
      accessToken: null,
      refreshToken: null,
      idToken: null,
      accessTokenExpiresAt: null,
      refreshTokenExpiresAt: null,
      scope: null,
    });

    // ── 3. Assign role in app `userRoles` table ──
    if (args.role) {
      await ctx.db.insert("userRoles", {
        userId,
        role: args.role,
      });
    }

    return {
      userId,
      email: args.email,
      password: "password123",
      role: args.role ?? null,
    };
  },
});
