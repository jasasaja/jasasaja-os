import type { FastifyServerOptions } from "fastify";

const REDACT_PATHS = [
  "req.headers.authorization",
  "req.headers.cookie",
  "req.headers.x-csrf-token",
  "req.body.password",
  "req.body.token",
  "req.body.accessToken",
  "req.body.refreshToken",
  "req.body.idToken",
  "req.body.secret",
  "req.body.clientSecret",
  "res.headers.set-cookie",
];

export const loggerOptions: FastifyServerOptions["logger"] = {
  level: process.env.LOG_LEVEL ?? "info",
  redact: {
    paths: REDACT_PATHS,
    censor: "[REDACTED]",
  },
};
