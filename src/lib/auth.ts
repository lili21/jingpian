import { betterAuth } from "better-auth";
import { Pool } from "pg";

const databaseUrl = process.env.DATABASE_URL ?? process.env.POSTGRES_URL;
const poolConnectionString =
  databaseUrl ?? "postgres://postgres:postgres@127.0.0.1:5432/jingpian";
const betterAuthBaseUrl = process.env.BETTER_AUTH_URL ?? "http://127.0.0.1:3000";
const betterAuthSecret = process.env.BETTER_AUTH_SECRET ?? "jingpian-local-auth-secret-change-me";
const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

const globalForAuth = globalThis as typeof globalThis & {
  __jingpianAuthPool?: Pool;
};

const pool =
  globalForAuth.__jingpianAuthPool ??
  new Pool({
    connectionString: poolConnectionString,
    max: 10,
    idleTimeoutMillis: 30_000,
  });

if (!globalForAuth.__jingpianAuthPool) {
  globalForAuth.__jingpianAuthPool = pool;
}

let initPromise: Promise<void> | null = null;

const socialProviders =
  googleClientId && googleClientSecret
    ? {
        google: {
          clientId: googleClientId,
          clientSecret: googleClientSecret,
        },
      }
    : undefined;

export const auth = betterAuth({
  appName: "Jingpian",
  baseURL: betterAuthBaseUrl,
  secret: betterAuthSecret,
  database: pool,
  emailAndPassword: {
    enabled: true,
  },
  ...(socialProviders ? { socialProviders } : {}),
});

async function ensureSubscriptionSchema() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS user_subscription (
      user_id TEXT PRIMARY KEY,
      stripe_customer_id TEXT,
      stripe_subscription_id TEXT,
      status TEXT NOT NULL DEFAULT 'inactive',
      plan TEXT NOT NULL DEFAULT 'free',
      current_period_end BIGINT,
      updated_at BIGINT NOT NULL,
      CONSTRAINT user_subscription_user_id_fk
        FOREIGN KEY (user_id) REFERENCES "user"(id) ON DELETE CASCADE
    )
  `);

  await pool.query(
    "CREATE INDEX IF NOT EXISTS user_subscription_plan_idx ON user_subscription (plan)",
  );
}

export async function ensureAuthDatabase() {
  if (!databaseUrl) {
    throw new Error("DATABASE_URL (or POSTGRES_URL) is required for auth storage.");
  }

  if (initPromise) {
    return initPromise;
  }

  initPromise = (async () => {
    const ctx = await auth.$context;
    await ctx.runMigrations();
    await ensureSubscriptionSchema();
  })().catch((error) => {
    initPromise = null;
    throw error;
  });

  return initPromise;
}

export function getAuthPool() {
  return pool;
}
