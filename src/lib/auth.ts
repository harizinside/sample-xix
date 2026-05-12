import { redisStorage } from "@better-auth/redis-storage";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin, phoneNumber } from "better-auth/plugins";
import { tanstackStartCookies } from "better-auth/tanstack-start";

import * as schema from "@/db/schema";
import { db } from "@/lib/db";
import { redis } from "@/lib/redis";

export const auth = betterAuth({
  appName: "Electronic Medical Record System",
  database: drizzleAdapter(db, { provider: "pg", schema }),
  plugins: [tanstackStartCookies(), phoneNumber(), admin()],
  advanced: {
    database: {
      generateId: false, // "serial" for auto-incrementing numeric IDs
    },
  },
  secondaryStorage: redisStorage({
    client: redis,
    keyPrefix: "better-auth:", // optional, defaults to "better-auth:"
  }),
  baseURL: "http://localhost:3000/",
  emailAndPassword: {
    enabled: true,
    disableSignUp: false,
    requireEmailVerification: false,
    autoSignIn: true,
    sendResetPassword: async ({ user, url, token }) => {
      console.log("[reset-password]", { email: user.email, url, token });
    },
  },
  logger: {
    disabled: false,
    disableColors: false,
    level: "debug",
    log: (level, message, ...args) => {
      // Custom logging implementation
      console.log(`[${level}] ${message}`, ...args);
    },
  },
});
