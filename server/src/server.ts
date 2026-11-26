import { buildApp } from "./app.ts";
import { closeDb } from "./modules/shared/core/db.ts";

const port = Number(process.env.API_PORT ?? 3001);
const host = process.env.API_HOST ?? "0.0.0.0";

async function start() {
  const app = buildApp();

  const close = async (signal: string) => {
    app.log.info({ signal }, "Shutting down API server");
    await closeDb();
    await app.close();
    process.exit(0);
  };

  process.on("SIGINT", () => {
    void close("SIGINT");
  });
  process.on("SIGTERM", () => {
    void close("SIGTERM");
  });

  try {
    await app.listen({ port, host });
  } catch (error) {
    app.log.error({ err: error }, "Failed to start API server");
    process.exit(1);
  }
}

void start();
