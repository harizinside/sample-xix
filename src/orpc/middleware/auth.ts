import { ORPCError, os as base } from "@orpc/server";
import type { RequestHeadersPluginContext } from "@orpc/server/plugins";

import { auth } from "@/lib/auth";

interface ORPCContext extends RequestHeadersPluginContext {}

export const authMiddleware = base
  .$context<ORPCContext>()
  .middleware(async ({ context, next }) => {
    const sessionData = await auth.api.getSession({
      headers: context.reqHeaders!,
    });

    if (!sessionData?.session || !sessionData?.user) {
      throw new ORPCError("UNAUTHORIZED");
    }

    return next({
      context: {
        session: sessionData.session,
        user: sessionData.user,
      },
    });
  });
