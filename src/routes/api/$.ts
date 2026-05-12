import { SmartCoercionPlugin } from "@orpc/json-schema";
import { OpenAPIHandler } from "@orpc/openapi/fetch";
import { OpenAPIReferencePlugin } from "@orpc/openapi/plugins";
import { onError } from "@orpc/server";
import { CompressionPlugin } from "@orpc/server/fetch";
import { CORSPlugin, RequestHeadersPlugin } from "@orpc/server/plugins";
import { getFilenameFromContentDisposition } from "@orpc/standard-server";
import { ZodToJsonSchemaConverter } from "@orpc/zod/zod4";
import { createFileRoute } from "@tanstack/react-router";

import router from "@/orpc/router";

const OVERRIDE_BODY_CONTEXT = Symbol("OVERRIDE_BODY_CONTEXT");

interface OverrideBodyContext {
  fetchRequest: Request;
}

const handler = new OpenAPIHandler(router, {
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
          title: "SIMRS API",
          version: "1.0.0",
        },
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
              return fetchRequest.formData();
            }

            if (
              contentDisposition !== null ||
              (!contentType?.startsWith("application/json") &&
                !contentType?.startsWith("application/x-www-form-urlencoded"))
            ) {
              const fileName =
                getFilenameFromContentDisposition(contentDisposition ?? "") ??
                "blob";
              const blob = await fetchRequest.blob();
              return new File([blob], fileName, {
                type: blob.type,
              });
            }

            return options.request.body();
          },
        },
      });
    },
  ],
});

export const Route = createFileRoute("/api/$")({
  server: {
    handlers: {
      ANY: async ({ request }: { request: Request }) => {
        const { matched, response } = await handler.handle(request, {
          prefix: "/api",
          context: {},
        });

        if (matched) {
          return response;
        }

        return new Response("Not Found", { status: 404 });
      },
    },
  },
});
