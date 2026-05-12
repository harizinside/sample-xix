import { createEnv } from "@t3-oss/env-core";
import * as z from "zod";

export const env = createEnv({
  server: {
    DATABASE_URL: z.string(),
    REDIS_URL: z.string(),
    BETTER_AUTH_SECRET: z.string(),
    BETTER_AUTH_URL: z.string(),
  },

  clientPrefix: "VITE_",

  client: {},

  runtimeEnvStrict: {
    ...process.env,
    ...import.meta.env,
  } as Record<string, string | undefined>,

  emptyStringAsUndefined: true,
}) as unknown as {
  DATABASE_URL: string;
  REDIS_URL: string;
  BETTER_AUTH_SECRET: string;
  BETTER_AUTH_URL: string;
};
