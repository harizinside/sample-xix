import { SmartCoercionPlugin } from "@orpc/json-schema";
import { OpenAPIReferencePlugin } from "@orpc/openapi/plugins";
import { onError } from "@orpc/server";
import { CompressionPlugin, RPCHandler } from "@orpc/server/fetch";
import { CORSPlugin, RequestHeadersPlugin } from "@orpc/server/plugins";
import { getFilenameFromContentDisposition } from "@orpc/standard-server";
import { ZodToJsonSchemaConverter } from "@orpc/zod/zod4";
import { createFileRoute } from "@tanstack/react-router";

import router from "@/orpc/router";

const OVERRIDE_BODY_CONTEXT = Symbol("OVERRIDE_BODY_CONTEXT");

interface OverrideBodyContext {
  fetchRequest: Request;
}

const handler = new RPCHandler(router, {
  plugins: [
    new CompressionPlugin(),
    new CORSPlugin({
      origin: origin => origin,
      allowMethods: [
        "GET",
        "HEAD",
        "PUT",
        "POST",
        "DELETE",
        "PATCH",
        "OPTIONS",
      ],
    }),
    new RequestHeadersPlugin(),
    new SmartCoercionPlugin({
      schemaConverters: [new ZodToJsonSchemaConverter()],
    }),
    new OpenAPIReferencePlugin({
      schemaConverters: [new ZodToJsonSchemaConverter()],
      specGenerateOptions: {
        info: {
          title: "TanStack ORPC Playground",
          version: "1.0.0",
        },
        // security: [{ bearerAuth: [] }],
        // components: {
        //   securitySchemes: {
        //     bearerAuth: {
        //       type: 'http',
        //       scheme: 'bearer',
        //     },
        //   },
        // },
      },
      docsConfig: {
        authentication: {
          securitySchemes: {
            bearerAuth: {
              token: "default-token",
            },
          },
        },
      },
    }),
  ],
  interceptors: [
    onError(error => {
      console.error(error);
    }),
  ],
  adapterInterceptors: [
    options => {
      return options.next({
        ...options,
        context: {
          ...options.context,
          // biome-ignore lint/suspicious/noExplicitAny: This is a legacy function
          [OVERRIDE_BODY_CONTEXT as any]: {
            fetchRequest: options.request,
          },
        },
      });
    },
  ],
  rootInterceptors: [
    options => {
      // biome-ignore lint/suspicious/noExplicitAny: This is a legacy function
      const { fetchRequest } = (options.context as any)[
        OVERRIDE_BODY_CONTEXT
      ] as OverrideBodyContext;

      return options.next({
        ...options,
        request: {
          ...options.request,
          async body() {
            const contentDisposition = fetchRequest.headers.get(
              "content-disposition",
            );
            const contentType = fetchRequest.headers.get("content-type");

            if (
              contentDisposition === null &&
              contentType?.startsWith("multipart/form-data")
            ) {
              // Custom handling for multipart/form-data
              // Example: use @mjackson/form-data-parser for streaming parsing
              return fetchRequest.formData();
            }

            // if has content-disposition always treat as file upload
            if (
              contentDisposition !== null ||
              (!contentType?.startsWith("application/json") &&
                !contentType?.startsWith("application/x-www-form-urlencoded"))
            ) {
              // Custom handling for file uploads
              // Example: streaming file into disk to reduce memory usage
              const fileName =
                getFilenameFromContentDisposition(contentDisposition ?? "") ??
                "blob";
              const blob = await fetchRequest.blob();
              return new File([blob], fileName, {
                type: blob.type,
              });
            }

            // fallback to default body parser
            return options.request.body();
          },
        },
      });
    },
  ],
});

export const Route = createFileRoute("/api/rpc/$")({
  server: {
    handlers: {
      ANY: async ({ request }: { request: Request }) => {
        const { matched, response } = await handler.handle(request, {
          prefix: "/api/rpc",
          context: request.headers, // Provide initial context if needed
        });

        if (matched) {
          return response;
        }

        return new Response("Not Found", { status: 404 });
      },
    },
  },
});
