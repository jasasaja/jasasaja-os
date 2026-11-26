import Fastify, { type FastifyInstance } from "fastify";
import { ZodError } from "zod";
import { isAppError, loggerOptions } from "./modules/shared/core/index.ts";
import { authGuard } from "./modules/shared/core/auth/guard.ts";
import { registerAuthRoutes } from "./modules/shared/core/auth/routes.ts";
import { registerLearningRoutes } from "./modules/learning/routes.ts";

function formatZodDetails(error: ZodError) {
  return error.issues.map((issue) => ({
    field: issue.path.length > 0 ? issue.path.join(".") : "body",
    rule: issue.code.toLowerCase(),
    message: issue.message,
  }));
}

export function buildApp(): FastifyInstance {
  const app = Fastify({
    logger: loggerOptions,
  });

  app.addHook("preHandler", authGuard);
  registerAuthRoutes(app);
  registerLearningRoutes(app);

  app.get("/api/health", async () => ({
    data: {
      status: "ok" as const,
    },
  }));

  app.setNotFoundHandler((_request, reply) => {
    reply.status(404).send({
      error: {
        code: "NOT_FOUND",
        message: "Data tidak ditemukan.",
      },
    });
  });

  app.setErrorHandler((error, request, reply) => {
    if (isAppError(error)) {
      reply.status(error.statusCode).send({
        error: {
          code: error.code,
          message: error.message,
          ...(error.details ? { details: error.details } : {}),
        },
      });
      return;
    }

    if (error instanceof ZodError) {
      reply.status(400).send({
        error: {
          code: "VALIDATION_ERROR",
          message: "Periksa kembali data yang Anda kirim.",
          details: formatZodDetails(error),
        },
      });
      return;
    }

    const isValidationError =
      typeof error === "object" &&
      error !== null &&
      "validation" in error &&
      Array.isArray((error as { validation?: unknown }).validation);

    if (isValidationError) {
      reply.status(400).send({
        error: {
          code: "VALIDATION_ERROR",
          message: "Periksa kembali data yang Anda kirim.",
        },
      });
      return;
    }

    request.log.error({ err: error }, "Unhandled server error");
    reply.status(500).send({
      error: {
        code: "INTERNAL_ERROR",
        message: "Terjadi kesalahan. Silakan coba lagi.",
      },
    });
  });

  return app;
}
