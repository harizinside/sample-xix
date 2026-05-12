import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { createFileRoute } from "@tanstack/react-router";
import mime from "mime";

export const Route = createFileRoute("/api/assets/$")({
  server: {
    handlers: {
      GET: async params => {
        const filePath = join(
          process.cwd(),
          "storages/public",
          params.params._splat ?? "",
        );

        try {
          const file = await readFile(filePath);
          const contentType =
            mime.getType(filePath) ?? "application/octet-stream";

          return new Response(file, {
            headers: {
              "Content-Type": contentType,
            },
          });
        } catch {
          return new Response("Not Found", { status: 404 });
        }
      },
    },
  },
});
