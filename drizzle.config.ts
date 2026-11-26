import { defineConfig } from "drizzle-kit";

const databaseUrl = process.env.DATABASE_URL?.trim();

export default defineConfig({
  dialect: "postgresql",
  schema: "./server/src/db/schema/index.ts",
  out: "./server/src/db/migrations",
  dbCredentials: {
    url: databaseUrl ?? "postgresql://jasasaja:jasasaja_dev_local@localhost:5433/jasasaja_os_dev",
  },
  strict: true,
  verbose: true,
});
