import { Redis } from "ioredis";

import { env } from "@/env";

// Redis client connection for session storage
export const redis = new Redis(env.REDIS_URL);
