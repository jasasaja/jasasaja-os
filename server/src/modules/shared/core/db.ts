import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";

const { Pool } = pg;

type DatabaseConnection = {
  pool: pg.Pool;
  db: ReturnType<typeof drizzle>;
};

let connection: DatabaseConnection | undefined;

export function getDatabaseUrl(): string | undefined {
  const value = process.env.DATABASE_URL?.trim();
  return value ? value : undefined;
}

export function getDb(): DatabaseConnection {
  const databaseUrl = getDatabaseUrl();
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not configured");
  }

  if (!connection) {
    const pool = new Pool({
      connectionString: databaseUrl,
      max: 5,
    });

    pool.on("error", (error) => {
      console.error("Unexpected PostgreSQL pool error", {
        message: error.message,
      });
    });

    connection = {
      pool,
      db: drizzle(pool),
    };
  }

  return connection;
}

export async function checkDatabaseConnection(): Promise<void> {
  const { pool } = getDb();
  await pool.query("SELECT 1");
}

export async function closeDb(): Promise<void> {
  if (connection) {
    await connection.pool.end();
    connection = undefined;
  }
}
