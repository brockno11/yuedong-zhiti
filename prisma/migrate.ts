import Database from "better-sqlite3";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

const databaseUrl = process.env.DATABASE_URL ?? "file:./dev.db";
const dbPath = resolveDatabasePath(databaseUrl);
const migrationsDir = join(process.cwd(), "prisma", "migrations");

mkdirSync(dirname(dbPath), { recursive: true });

const db = new Database(dbPath);
db.pragma("foreign_keys = ON");

db.exec(`
  CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "checksum" TEXT NOT NULL,
    "finished_at" DATETIME,
    "migration_name" TEXT NOT NULL,
    "logs" TEXT,
    "rolled_back_at" DATETIME,
    "started_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "applied_steps_count" INTEGER NOT NULL DEFAULT 0
  );
`);

const applied = new Set(
  db
    .prepare('SELECT "migration_name" FROM "_prisma_migrations" WHERE "rolled_back_at" IS NULL')
    .all()
    .map((row) => (row as { migration_name: string }).migration_name)
);

const migrationNames = existsSync(migrationsDir)
  ? readdirSync(migrationsDir, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .sort()
  : [];

for (const migrationName of migrationNames) {
  if (applied.has(migrationName)) continue;

  const migrationPath = join(migrationsDir, migrationName, "migration.sql");
  const sql = readFileSync(migrationPath, "utf8");
  const checksum = createHash("sha256").update(sql).digest("hex");

  const id = `${Date.now()}-${migrationName}`;
  const insertStarted = db.prepare(`
    INSERT INTO "_prisma_migrations"
      ("id", "checksum", "migration_name", "started_at", "applied_steps_count")
    VALUES
      (@id, @checksum, @migrationName, CURRENT_TIMESTAMP, 0)
  `);
  const markFinished = db.prepare(`
    UPDATE "_prisma_migrations"
    SET "finished_at" = CURRENT_TIMESTAMP, "applied_steps_count" = 1
    WHERE "id" = @id
  `);
  const markFailed = db.prepare(`
    UPDATE "_prisma_migrations"
    SET "logs" = @logs
    WHERE "id" = @id
  `);

  insertStarted.run({ id, checksum, migrationName });

  try {
    db.exec(sql);
    markFinished.run({ id });
    console.log(`Applied migration ${migrationName}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    markFailed.run({ id, logs: message });
    throw error;
  }
}

db.close();

function resolveDatabasePath(url: string): string {
  if (!url.startsWith("file:")) {
    throw new Error("Only SQLite file: DATABASE_URL values are supported by this local migrator.");
  }

  const rawPath = url.replace(/^file:/, "").replace(/^"|"$/g, "");
  const normalizedPath = rawPath.startsWith("./")
    ? join(process.cwd(), "prisma", rawPath.slice(2))
    : rawPath;

  return resolve(normalizedPath);
}
