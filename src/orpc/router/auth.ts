import { ORPCError } from "@orpc/server";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { os } from "@/orpc";
import { authMiddleware } from "@/orpc/middleware/auth";

function handleAuthError(error: unknown): never {
  if (
    error instanceof Error &&
    "statusCode" in error &&
    "body" in error
  ) {
    const apiError = error as {
      statusCode: number;
      body: { message?: string; code?: string };
    };
    throw new ORPCError(apiError.body.code ?? "BAD_REQUEST", {
      status: apiError.statusCode,
      message: apiError.body.message,
    });
  }
  throw error;
}

// Schemas
export const SignUpSchema = z.object({
  name: z.string(),
  email: z.email(),
  phoneNumber: z.string(),
  password: z.string(),
  confirmPassword: z.string(),
});

export const SignInSchema = z.object({
  email: z.email(),
  password: z.string().min(6).max(100),
  remember: z.boolean().optional(),
});

// Public procedures (no auth required)
export const signUp = os
  .input(SignUpSchema)
  .handler(async ({ input, context }) => {
    try {
      const data = await auth.api.signUpEmail({
        body: {
          name: input.name,
          email: input.email,
          password: input.password,
          phoneNumber: input.phoneNumber,
        },
        headers: context.reqHeaders!,
      });
      return data;
    } catch (error) {
      handleAuthError(error);
    }
  });

export const signIn = os
  .input(SignInSchema)
  .handler(async ({ input, context }) => {
    try {
      const data = await auth.api.signInEmail({
        body: {
          email: input.email,
          password: input.password,
        },
        headers: context.reqHeaders!,
      });
      return data;
    } catch (error) {
      handleAuthError(error);
    }
  });

export const requestPasswordReset = os
  .input(
    z.object({
      email: z.email(),
      redirectTo: z.string().optional(),
    }),
  )
  .handler(async ({ input, context }) => {
    try {
      const data = await auth.api.requestPasswordReset({
        body: {
          email: input.email,
          redirectTo: input.redirectTo,
        },
        headers: context.reqHeaders!,
      });
      return data;
    } catch (error) {
      handleAuthError(error);
    }
  });

export const resetPassword = os
  .input(
    z.object({
      newPassword: z.string().min(6),
      token: z.string(),
    }),
  )
  .handler(async ({ input, context }) => {
    try {
      const data = await auth.api.resetPassword({
        body: {
          newPassword: input.newPassword,
          token: input.token,
        },
        headers: context.reqHeaders!,
      });
      return data;
    } catch (error) {
      handleAuthError(error);
    }
  });

// Protected procedures (auth required)
export const signOut = os.use(authMiddleware).handler(async ({ context }) => {
  const data = await auth.api.signOut({
    headers: context.reqHeaders!,
  });
  return data;
});

export const getSession = os
  .use(authMiddleware)
  .handler(async ({ context }) => {
    return {
      session: context.session,
      user: context.user,
    };
  });

export const changePassword = os
  .use(authMiddleware)
  .input(
    z.object({
      currentPassword: z.string(),
      newPassword: z.string().min(6),
    }),
  )
  .handler(async ({ input, context }) => {
    try {
      const data = await auth.api.changePassword({
        body: {
          currentPassword: input.currentPassword,
          newPassword: input.newPassword,
        },
        headers: context.reqHeaders!,
      });
      return data;
    } catch (error) {
      handleAuthError(error);
    }
  });

export const updateUser = os
  .use(authMiddleware)
  .input(
    z.object({
      name: z.string().optional(),
      image: z.string().optional(),
    }),
  )
  .handler(async ({ input, context }) => {
    try {
      const data = await auth.api.updateUser({
        body: input,
        headers: context.reqHeaders!,
      });
      return data;
    } catch (error) {
      handleAuthError(error);
    }
  });
