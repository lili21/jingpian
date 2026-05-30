import { mkdirSync } from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import { betterAuth } from "better-auth";

const sqliteFilePath = process.env.BETTER_AUTH_DB_PATH ?? path.join(process.cwd(), "data", "auth.db");
const betterAuthBaseUrl = process.env.BETTER_AUTH_URL ?? "http://127.0.0.1:3000";
const betterAuthSecret = process.env.BETTER_AUTH_SECRET ?? "jingpian-local-auth-secret-change-me";
const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

mkdirSync(path.dirname(sqliteFilePath), { recursive: true });

let db: Database.Database | null = null;

function getDb() {
  if (db) {
    return db;
  }

  db = new Database(sqliteFilePath, { timeout: 5000 });
  db.pragma("journal_mode = WAL");
  db.pragma("busy_timeout = 5000");

  db.exec(`
CREATE TABLE IF NOT EXISTS "user" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL UNIQUE,
  "emailVerified" INTEGER NOT NULL DEFAULT 0,
  "image" TEXT,
  "createdAt" INTEGER NOT NULL,
  "updatedAt" INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS "session" (
  "id" TEXT PRIMARY KEY,
  "expiresAt" INTEGER NOT NULL,
  "token" TEXT NOT NULL UNIQUE,
  "createdAt" INTEGER NOT NULL,
  "updatedAt" INTEGER NOT NULL,
  "ipAddress" TEXT,
  "userAgent" TEXT,
  "userId" TEXT NOT NULL,
  FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "account" (
  "id" TEXT PRIMARY KEY,
  "accountId" TEXT NOT NULL,
  "providerId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "accessToken" TEXT,
  "refreshToken" TEXT,
  "idToken" TEXT,
  "accessTokenExpiresAt" INTEGER,
  "refreshTokenExpiresAt" INTEGER,
  "scope" TEXT,
  "password" TEXT,
  "createdAt" INTEGER NOT NULL,
  "updatedAt" INTEGER NOT NULL,
  FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE,
  UNIQUE ("providerId", "accountId")
);

CREATE TABLE IF NOT EXISTS "verification" (
  "id" TEXT PRIMARY KEY,
  "identifier" TEXT NOT NULL,
  "value" TEXT NOT NULL,
  "expiresAt" INTEGER NOT NULL,
  "createdAt" INTEGER NOT NULL,
  "updatedAt" INTEGER NOT NULL,
  UNIQUE ("identifier", "value")
);

CREATE TABLE IF NOT EXISTS "user_subscription" (
  "userId" TEXT PRIMARY KEY,
  "stripeCustomerId" TEXT,
  "stripeSubscriptionId" TEXT,
  "status" TEXT NOT NULL DEFAULT 'inactive',
  "plan" TEXT NOT NULL DEFAULT 'free',
  "currentPeriodEnd" INTEGER,
  "updatedAt" INTEGER NOT NULL,
  FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "session_userId_idx" ON "session" ("userId");
CREATE INDEX IF NOT EXISTS "account_userId_idx" ON "account" ("userId");
CREATE INDEX IF NOT EXISTS "verification_identifier_idx" ON "verification" ("identifier");
CREATE INDEX IF NOT EXISTS "user_subscription_plan_idx" ON "user_subscription" ("plan");
`);

  return db;
}

const socialProviders =
  googleClientId && googleClientSecret
    ? {
        google: {
          clientId: googleClientId,
          clientSecret: googleClientSecret,
        },
      }
    : undefined;

export function getAuthDb() {
  return getDb();
}

export const auth = betterAuth({
  appName: "Jingpian",
  baseURL: betterAuthBaseUrl,
  secret: betterAuthSecret,
  database: getDb(),
  emailAndPassword: {
    enabled: true,
  },
  ...(socialProviders ? { socialProviders } : {}),
});
